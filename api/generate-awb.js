import { createClient } from '@supabase/supabase-js'

/**
 * Helper to parse request body in both Express and Serverless (Vercel/Next.js/Vite)
 */
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve({})
      }
    })
  })
}

/**
 * Helper to send JSON response in Express / Vercel / Vite environments
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    res.status(statusCode).json(data)
  } else {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
}

/**
 * Formats a Date object to YYYY-MM-DD HH:mm (required by Shiprocket)
 */
function formatShiprocketDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const YYYY = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const DD = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}`
}

/**
 * Authenticate with Shiprocket
 * Uses process.env.SHIPROCKET_TOKEN or auto-authenticates with SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD
 */
async function getShiprocketAuthToken() {
  const directToken = process.env.SHIPROCKET_TOKEN
  if (directToken && directToken.trim() && directToken !== 'your_shiprocket_bearer_token_here') {
    return directToken.trim()
  }

  const email = process.env.SHIPROCKET_EMAIL || 'watchestaofficial@gmail.com'
  const password = process.env.SHIPROCKET_PASSWORD || 'Jf%^QFACZ4AUG*@@0XpoHS*dEAiK9i9h'

  if (email && password) {
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const authData = await authRes.json()
    if (authRes.ok && authData?.token) {
      return authData.token
    }
    throw new Error(`Shiprocket auth login failed: ${authData?.message || JSON.stringify(authData)}`)
  }

  return null
}

/**
 * Shared Supabase Client Helper
 */
function getSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://znvqgluajmxgdvyfnkzu.supabase.co'
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'

  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey)
  }
  return null
}

/**
 * Universal Serverless API Route for Shiprocket AWB Generation
 * Compatible with Vercel Serverless Functions, Next.js API Routes, Express, and Vite dev middleware
 */
export default async function handler(req, res) {
  // Allow CORS for local dev / cross-origin admin panels
  res.setHeader?.('Access-Control-Allow-Origin', '*')
  res.setHeader?.('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end()
    }
    res.statusCode = 200
    return res.end()
  }

  // 1. Initialize Supabase Client early for label lookup & orders
  const supabase = getSupabaseClient()

  if (req.method === 'GET') {
    const query = req.query || {}
    let action = query.action
    let orderParam = query.orderId || query.order_id
    let shipmentParam = query.shipmentId || query.shipment_id

    if (!action && req.url && req.url.includes('?')) {
      try {
        const parsedUrl = new URL(req.url, 'https://smithsjewellery.in')
        action = action || parsedUrl.searchParams.get('action')
        orderParam = orderParam || parsedUrl.searchParams.get('orderId') || parsedUrl.searchParams.get('order_id')
        shipmentParam = shipmentParam || parsedUrl.searchParams.get('shipmentId') || parsedUrl.searchParams.get('shipment_id')
      } catch (e) {}
    }

    // Dynamic Live Shipping Label PDF generation & redirect
    if (action === 'label' && (orderParam || shipmentParam)) {
      try {
        const token = await getShiprocketAuthToken()
        let targetShipmentId = shipmentParam

        if (!targetShipmentId && orderParam && supabase) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderParam)
          let q = supabase.from('orders').select('id, order_number, shipments(*)')
          if (isUUID) {
            q = q.or(`id.eq.${orderParam},order_number.eq.${orderParam}`)
          } else {
            q = q.eq('order_number', orderParam)
          }
          const { data: ord } = await q.maybeSingle()
          targetShipmentId = ord?.shipments?.[0]?.shiprocket_shipment_id
        }

        if (targetShipmentId && token) {
          const labelRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ shipment_id: [Number(targetShipmentId)] }),
          })
          const labelData = await labelRes.json()
          if (labelData?.label_url) {
            if (typeof res.redirect === 'function') {
              return res.redirect(302, labelData.label_url)
            }
            res.statusCode = 302
            res.setHeader('Location', labelData.label_url)
            return res.end()
          }
        }
      } catch (err) {
        console.error('Label redirect error:', err)
      }
    }

    // Cancel on Shiprocket via GET
    if (action === 'cancel' && orderParam) {
      try {
        const result = await handleCancelOrder({
          supabase,
          orderId: orderParam,
          reason: query.reason || 'Cancelled by seller on Shiprocket',
        })
        return sendJson(res, result.success ? 200 : 400, result)
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message })
      }
    }

    // Delete order action via GET
    if (action === 'delete' && (orderParam || query.orderNumber)) {
      try {
        const result = await handleDeleteOrder({
          supabase,
          orderId: orderParam,
          orderNumber: query.orderNumber || orderParam,
        })
        return sendJson(res, result.success ? 200 : 400, result)
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message })
      }
    }

    // Sync status with Shiprocket via GET
    if (action === 'sync') {
      try {
        const result = await handleSyncOrders({
          supabase,
          orderId: orderParam,
        })
        return sendJson(res, 200, result)
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message })
      }
    }

    // Courier rates & serviceability check via GET
    if (action === 'couriers' || action === 'serviceability') {
      try {
        const result = await handleGetCourierRates({
          supabase,
          query,
          orderParam,
        })
        return sendJson(res, result.statusCode || (result.success ? 200 : 400), result)
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message })
      }
    }

    return sendJson(res, 200, {
      success: true,
      connected: true,
      pickup_location: process.env.PICKUP_LOCATION_ID || process.env.SHIPROCKET_PICKUP_LOCATION || 'Home',
    })
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      error: `Method ${req.method} Not Allowed. Expected POST or GET.`,
    })
  }

  try {
    const body = await parseRequestBody(req)
    const action = body.action
    const orderId = body.orderId || body.order_id
    const fallbackOrderData = body.orderData || null

    // Delete order action via POST
    if (action === 'delete') {
      const result = await handleDeleteOrder({
        supabase,
        orderId: orderId || fallbackOrderData?.id,
        orderNumber: body.orderNumber || fallbackOrderData?.order_number,
      })
      return sendJson(res, result.success ? 200 : 400, result)
    }

    // Cancel order action via POST
    if (action === 'cancel' && (orderId || fallbackOrderData?.id || fallbackOrderData?.order_number)) {
      const result = await handleCancelOrder({
        supabase,
        orderId: orderId || fallbackOrderData?.id,
        orderNumber: body.orderNumber || fallbackOrderData?.order_number,
        orderData: fallbackOrderData,
        reason: body.reason || 'Cancelled by seller on Shiprocket',
      })
      return sendJson(res, result.success ? 200 : 400, result)
    }

    // Sync order statuses action via POST
    if (action === 'sync') {
      const result = await handleSyncOrders({
        supabase,
        orderId: orderId || null,
      })
      return sendJson(res, 200, result)
    }

    // Courier rates & serviceability check via POST
    if (action === 'couriers' || action === 'serviceability') {
      try {
        const result = await handleGetCourierRates({
          supabase,
          body,
          orderId,
          fallbackOrderData,
        })
        return sendJson(res, result.statusCode || (result.success ? 200 : 400), result)
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message })
      }
    }

    if (!orderId && !fallbackOrderData?.id) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing required parameter: orderId is required to generate an AWB.',
      })
    }

    // 2. Fetch Order Details from Database
    let order = null
    const searchTarget = String(orderId || fallbackOrderData?.id).trim()

    if (supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTarget)
        let query = supabase
          .from('orders')
          .select('*, order_items(*), shipments(*)')

        if (isUUID) {
          query = query.or(`id.eq.${searchTarget},order_number.eq.${searchTarget}`)
        } else {
          query = query.eq('order_number', searchTarget)
        }

        const { data, error } = await query.maybeSingle()
        if (!error && data) {
          order = data
        }
      } catch (err) {
        console.warn('Database query error while fetching order:', err)
      }
    }

    // Fallback to client-provided order data if database lookup didn't return (e.g., in-memory mock order)
    if (!order && fallbackOrderData) {
      order = fallbackOrderData
    }

    if (!order) {
      return sendJson(res, 404, {
        success: false,
        error: `Order "${searchTarget}" not found in database.`,
      })
    }

    // 3. Extract & Validate Shipping Address and Details
    const rawAddress = order.shipping_address || {}
    const customerName = (order.customer_name || rawAddress.full_name || 'Valued Customer').trim()
    const nameParts = customerName.split(' ')
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.slice(1).join(' ') || '.'

    const rawPhone = String(order.customer_phone || rawAddress.phone || '').replace(/[^0-9]/g, '')
    const phone = rawPhone.slice(-10) // Clean 10-digit Indian mobile number
    const email = order.customer_email || rawAddress.email || 'orders@smithsjewellery.com'

    const streetAddress = (rawAddress.street_address || rawAddress.address || '').trim()
    const city = (rawAddress.city || '').trim()
    const state = (rawAddress.state || '').trim()
    const rawPincode = String(rawAddress.pincode || '').trim()

    // ─── DETAILED VALIDATION (Pincode & Required Fields) ───
    if (!rawPincode) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing Delivery PIN code. Please ensure the customer has provided a valid 6-digit postal code.',
      })
    }

    // Indian postal code format: 6 digits, cannot start with 0
    const indianPincodeRegex = /^[1-9][0-9]{5}$/
    if (!indianPincodeRegex.test(rawPincode)) {
      return sendJson(res, 400, {
        success: false,
        error: `Invalid PIN code "${rawPincode}". Indian postal codes must be exactly 6 digits without letters or spaces.`,
      })
    }

    if (!streetAddress || streetAddress.length < 5) {
      return sendJson(res, 400, {
        success: false,
        error: 'Delivery address is too short or incomplete. Please provide a valid street address.',
      })
    }

    if (!phone || phone.length !== 10) {
      return sendJson(res, 400, {
        success: false,
        error: `Invalid phone number "${rawPhone}". Please provide a valid 10-digit mobile number for courier SMS updates.`,
      })
    }

    // 4. Authenticate with Shiprocket API
    const shiprocketToken = await getShiprocketAuthToken()

    // 5. Build Items Array
    const orderItems = order.order_items || order.items || []
    const formattedItems = orderItems.length > 0
      ? orderItems.map((it, idx) => ({
          name: it.name || it.product_name || 'Smiths Silver Jewellery Piece',
          sku: it.sku || `SMT-JW-${it.product_id || it.id || idx + 1}`,
          units: Number(it.quantity || 1),
          selling_price: Number(it.price || 1299),
          discount: 0,
          tax: 0,
          hsn: 71131120, // Standard HSN code for Silver Jewellery
        }))
      : [
          {
            name: 'Smiths 925 Sterling Silver Jewellery Piece',
            sku: 'SMT-JW-01',
            units: 1,
            selling_price: Number(order.total_amount || 1299),
            discount: 0,
            tax: 0,
            hsn: 71131120,
          },
        ]

    // 6. Format Order Data into Shiprocket Custom Order Payload
    // Package dimensions: Length: 12cm, Width: 12cm, Height: 6cm, Weight: 0.15kg
    const pickupLocationId =
      process.env.PICKUP_LOCATION_ID ||
      process.env.SHIPROCKET_PICKUP_LOCATION ||
      'Home'

    const orderNumber = order.order_number || `SMT-${order.id}`
    const paymentMethod = (order.payment_method || '').toUpperCase() === 'COD' ? 'COD' : 'Prepaid'
    const totalAmount = Number(order.total_amount || order.subtotal || 1299)

    const shiprocketPayload = {
      order_id: orderNumber,
      order_date: formatShiprocketDate(order.created_at),
      pickup_location: pickupLocationId,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || '12100778',
      comment: 'Smiths Jewellery - Luxury Silver Jewellery, Handle with Care',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: streetAddress,
      billing_address_2: rawAddress.landmark || '',
      billing_city: city || 'Pune',
      billing_pincode: rawPincode,
      billing_state: state || 'Maharashtra',
      billing_country: 'India',
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: formattedItems,
      payment_method: paymentMethod,
      sub_total: totalAmount,
      length: 13,
      breadth: 13,
      height: 5,
      weight: 0.15,
    }

    // ── Require valid Shiprocket credentials ──
    if (!shiprocketToken) {
      return sendJson(res, 400, {
        success: false,
        error:
          'Shiprocket is not connected: Missing SHIPROCKET_TOKEN or SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD in Vercel. Please add your credentials in Vercel Settings -> Environment Variables so this order can be pushed to your Shiprocket account and generate a valid shipping label.',
      })
    }

    // 7. Make POST Request to Shiprocket: Create Custom Order (/v1/external/orders/create/adhoc)
    const createOrderResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${shiprocketToken}`,
        },
        body: JSON.stringify(shiprocketPayload),
      }
    )

    const createOrderResult = await createOrderResponse.json()

    if (!createOrderResponse.ok || !createOrderResult.shipment_id) {
      const errorMsg =
        createOrderResult.message ||
        createOrderResult.errors ||
        JSON.stringify(createOrderResult)

      console.error('Shiprocket order creation error:', errorMsg)

      // Friendly mapping for common logistics issues
      let friendlyError = `Shiprocket Error: ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}`
      if (String(errorMsg).toLowerCase().includes('pincode') || String(errorMsg).toLowerCase().includes('serviceable')) {
        friendlyError = `Delivery Pincode (${rawPincode}) is currently not serviceable by Shiprocket courier partners.`
      } else if (String(errorMsg).toLowerCase().includes('pickup')) {
        friendlyError = `Invalid pickup location "${pickupLocationId}". Please verify your PICKUP_LOCATION_ID in .env matches your Shiprocket dashboard.`
      }

      return sendJson(res, 422, {
        success: false,
        error: friendlyError,
        raw: createOrderResult,
      })
    }

    const shiprocketOrderId = createOrderResult.order_id
    const shipmentId = createOrderResult.shipment_id

    // 8. Find Chosen / Lowest-Cost Courier & Assign AWB (/v1/external/courier/assign/awb)
    let awbCode = createOrderResult.awb_code || null
    let courierName = body.courierName || body.courier_name || createOrderResult.courier_name || 'Delhivery Surface'
    let selectedCourierId = body.courierId || body.courier_id || null

    if (!awbCode) {
      // Automatically find the cheapest available courier if not explicitly chosen by admin
      if (!selectedCourierId) {
        try {
          const isCod = paymentMethod === 'COD' ? 1 : 0
          const serviceRes = await fetch(
            `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=415106&delivery_postcode=${rawPincode}&weight=0.15&cod=${isCod}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${shiprocketToken}`,
              },
            }
          )
          const serviceData = await serviceRes.json()
          const availableCouriers = serviceData?.data?.available_courier_companies || []
          if (availableCouriers.length > 0) {
            availableCouriers.sort((a, b) => Number(a.rate || 999) - Number(b.rate || 999))
            selectedCourierId = availableCouriers[0].courier_company_id
            courierName = availableCouriers[0].courier_name || courierName
          }
        } catch (err) {
          console.warn('Notice: Could not query lowest-cost courier serviceability:', err)
        }
      }

      const assignPayload = { shipment_id: shipmentId }
      if (selectedCourierId) {
        assignPayload.courier_id = Number(selectedCourierId)
      }

      const assignAwbResponse = await fetch(
        'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${shiprocketToken}`,
          },
          body: JSON.stringify(assignPayload),
        }
      )

      const assignAwbResult = await assignAwbResponse.json()

      if (assignAwbResponse.ok && assignAwbResult.response?.data?.awb_code) {
        awbCode = assignAwbResult.response.data.awb_code
        courierName = assignAwbResult.response.data.courier_name || courierName
      } else if (assignAwbResult.awb_code) {
        awbCode = assignAwbResult.awb_code
        courierName = assignAwbResult.courier_name || courierName
      } else {
        const awbError =
          assignAwbResult.response?.data?.awb_assign_error ||
          assignAwbResult.message ||
          assignAwbResult.response?.data?.error ||
          'Failed to assign courier partner'
        return sendJson(res, 422, {
          success: false,
          error: `Shiprocket: ${awbError}`,
          shipment_id: shipmentId,
        })
      }
    }

    // 9. Generate Printable Shipping Label URL (/v1/external/courier/generate/label)
    let labelUrl = null
    try {
      const labelRes = await fetch(
        'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${shiprocketToken}`,
          },
          body: JSON.stringify({ shipment_id: [shipmentId] }),
        }
      )
      const labelData = await labelRes.json()
      if (labelRes.ok && labelData?.label_url) {
        labelUrl = labelData.label_url
      }
    } catch (e) {
      console.warn('Label URL generation notice:', e)
    }

    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`

    // 10. Update Database: Mark Order as "Shipped" & Store Shipment Details
    await updateDatabaseWithAwb({
      supabase,
      order,
      shiprocketOrderId,
      shipmentId,
      courierPartner: courierName,
      awbCode,
      trackingUrl,
      labelUrl,
    })

    // 11. Return Success to Frontend
    return sendJson(res, 200, {
      success: true,
      order_id: orderNumber,
      shipment_id: shipmentId,
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: trackingUrl,
      label_url: labelUrl || `https://shiprocket.co/tracking/${awbCode}`,
      status: 'Shipped',
    })
  } catch (error) {
    console.error('Unhandled error in generate-awb serverless route:', error)
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error during AWB generation.',
    })
  }
}

/**
 * Database update helper to mark order as "Shipped" and insert/update shipment & tracking records
 */
async function updateDatabaseWithAwb({
  supabase,
  order,
  shiprocketOrderId,
  shipmentId,
  courierPartner,
  awbCode,
  trackingUrl,
  labelUrl,
}) {
  if (!supabase) {
    supabase = getSupabaseClient()
  }
  if (!supabase || !order?.id) return

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(order.id))
    const nowIso = new Date().toISOString()

    const orderUpdatePayload = {
      status: 'Shipped',
      updated_at: nowIso,
    }
    if (labelUrl) {
      orderUpdatePayload.notes = JSON.stringify({ label_url: labelUrl, awb: awbCode, courier: courierPartner })
    }

    // Update orders status
    if (isUUID) {
      await supabase
        .from('orders')
        .update(orderUpdatePayload)
        .eq('id', order.id)
    } else {
      await supabase
        .from('orders')
        .update(orderUpdatePayload)
        .eq('order_number', order.order_number || order.id)
    }

    // Insert or update shipments record
    if (isUUID) {
      const { data: existingShipments } = await supabase
        .from('shipments')
        .select('id')
        .eq('order_id', order.id)
        .limit(1)

      let targetShipmentId = existingShipments?.[0]?.id

      if (targetShipmentId) {
        await supabase
          .from('shipments')
          .update({
            shiprocket_order_id: String(shiprocketOrderId),
            shiprocket_shipment_id: String(shipmentId),
            courier_partner: courierPartner,
            awb_code: awbCode,
            tracking_url: trackingUrl,
            status: 'Shipped',
            updated_at: nowIso,
          })
          .eq('id', targetShipmentId)
      } else {
        const { data: insertedShipment } = await supabase
          .from('shipments')
          .insert({
            order_id: order.id,
            shiprocket_order_id: String(shiprocketOrderId),
            shiprocket_shipment_id: String(shipmentId),
            courier_partner: courierPartner,
            awb_code: awbCode,
            tracking_url: trackingUrl,
            status: 'Shipped',
          })
          .select('id')
          .single()

        targetShipmentId = insertedShipment?.id
      }

      // Add Tracking Milestone Event for real-time tracking visibility
      await supabase.from('tracking_events').insert({
        order_id: order.id,
        shipment_id: targetShipmentId,
        status: 'SHIPPED',
        activity: `AWB Generated (${awbCode}) via ${courierPartner}. Handed over to courier partner.`,
        location: 'Smiths Jewellery Fulfillment Hub, Mumbai',
        event_time: nowIso,
      })
    }
  } catch (err) {
    console.warn('Notice: Could not write to Supabase table (non-blocking):', err)
  }
}

/**
 * Handle cancelling an order on Shiprocket and updating Supabase database
 */
async function handleCancelOrder({
  supabase,
  orderId,
  orderNumber = null,
  orderData = null,
  reason = 'Cancelled by seller on Shiprocket',
}) {
  if (!supabase) {
    supabase = getSupabaseClient()
  }

  const rawId = String(orderId || orderNumber || orderData?.order_number || orderData?.id || '').trim()
  const cleanId = rawId.replace(/^#\s*/, '').trim()

  if (!cleanId && !orderData?.id && !orderData?.order_number) {
    return { success: false, error: 'Order ID is required to cancel order.' }
  }

  const nowIso = new Date().toISOString()
  let order = null
  let shipment = null

  if (supabase && cleanId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    let q = supabase.from('orders').select('*, shipments(*)')
    if (isUUID) {
      q = q.or(`id.eq.${cleanId},order_number.eq.${cleanId}`)
    } else {
      q = q.or(`order_number.eq.${cleanId},order_number.eq.#${cleanId},id.eq.${cleanId}`)
    }
    const { data } = await q.maybeSingle()
    order = data
  }

  if (!order && orderData) {
    order = orderData
  }

  shipment = Array.isArray(order?.shipments) ? order.shipments[0] : (order?.shipments || order?.shipment)

  // Attempt to cancel on Shiprocket API if credentials exist
  let shiprocketCancelled = false
  let shiprocketMsg = null

  try {
    const token = await getShiprocketAuthToken()
    if (token) {
      const shiprocketOrderId = shipment?.shiprocket_order_id
      const awbCode = shipment?.awb_code

      if (shiprocketOrderId) {
        const cancelRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
        })
        const cancelData = await cancelRes.json()
        shiprocketCancelled = cancelRes.ok
        shiprocketMsg = cancelData?.message || JSON.stringify(cancelData)
      } else if (awbCode) {
        const cancelRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ awbs: [String(awbCode)] }),
        })
        const cancelData = await cancelRes.json()
        shiprocketCancelled = cancelRes.ok
        shiprocketMsg = cancelData?.message || JSON.stringify(cancelData)
      }
    }
  } catch (err) {
    console.warn('Shiprocket API cancel request warning:', err.message)
  }

  // Update Supabase records
  if (supabase && (order?.id || cleanId)) {
    let parsedNotes = {}
    try {
      if (order?.notes) {
        parsedNotes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes
      }
    } catch (e) {}

    parsedNotes.cancelled_at = nowIso
    parsedNotes.cancellation_source = 'Shiprocket Merchant Cancellation'
    parsedNotes.cancellation_reason = reason
    if (shiprocketMsg) parsedNotes.shiprocket_cancel_response = shiprocketMsg

    const updatePayload = {
      status: 'CANCELLED',
      notes: JSON.stringify(parsedNotes),
      updated_at: nowIso,
    }

    // Update orders table
    if (order?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id)) {
      await supabase.from('orders').update(updatePayload).eq('id', order.id)
    } else {
      await supabase.from('orders').update(updatePayload).eq('order_number', order?.order_number || cleanId)
    }

    // Update shipments table
    if (order?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id)) {
      await supabase.from('shipments').update({ status: 'CANCELLED', updated_at: nowIso }).eq('order_id', order.id)
    } else if (shipment?.id) {
      await supabase.from('shipments').update({ status: 'CANCELLED', updated_at: nowIso }).eq('id', shipment.id)
    }

    // Insert tracking event
    if (order?.id) {
      await supabase.from('tracking_events').insert({
        order_id: order.id,
        shipment_id: shipment?.id || null,
        status: 'CANCELLED',
        activity: `Order cancelled by seller. Reason: ${reason}. Live tracking halted.`,
        location: 'Merchant Fulfillment Hub (Satara)',
        event_time: nowIso,
      })
    }

    return {
      success: true,
      message: `Order #${order?.order_number || cleanId} has been cancelled on Shiprocket. Live tracking updated.`,
      order_id: order?.id || cleanId,
      order_number: order?.order_number || cleanId,
      shiprocket_cancelled: shiprocketCancelled,
      shiprocket_response: shiprocketMsg,
    }
  }

  return {
    success: true,
    message: `Order cancellation processed.`,
    shiprocket_cancelled: shiprocketCancelled,
    shiprocket_response: shiprocketMsg,
  }
}

/**
 * Handle permanently deleting an order and associated records from database
 */
async function handleDeleteOrder({ supabase, orderId, orderNumber = null }) {
  if (!supabase) {
    supabase = getSupabaseClient()
  }

  const rawId = String(orderId || orderNumber || '').trim()
  const cleanId = rawId.replace(/^#\s*/, '').trim()

  if (!cleanId) {
    return { success: false, error: 'Order identifier is required for deletion.' }
  }

  if (supabase) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)

      // Locate the order UUID if passed as order_number
      let orderUuid = isUUID ? cleanId : null
      if (!orderUuid) {
        const { data: ord } = await supabase
          .from('orders')
          .select('id')
          .or(`order_number.eq.${cleanId},order_number.eq.#${cleanId}`)
          .maybeSingle()
        if (ord?.id) {
          orderUuid = ord.id
        }
      }

      // Delete dependent records first to ensure clean cascade
      if (orderUuid) {
        await supabase.from('tracking_events').delete().eq('order_id', orderUuid)
        await supabase.from('order_items').delete().eq('order_id', orderUuid)
        await supabase.from('shipments').delete().eq('order_id', orderUuid)
        await supabase.from('orders').delete().eq('id', orderUuid)
      } else {
        await supabase.from('orders').delete().or(`order_number.eq.${cleanId},order_number.eq.#${cleanId}`)
      }
    } catch (err) {
      console.warn('Supabase delete error:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    success: true,
    message: `Order #${cleanId} deleted from database.`,
    order_id: cleanId,
  }
}

/**
 * Handle syncing order status with Shiprocket (detects seller cancellations & tracking updates)
 */
async function handleSyncOrders({ supabase, orderId }) {
  if (!supabase) {
    supabase = getSupabaseClient()
  }
  if (!supabase) {
    return { success: false, error: 'Database not initialized.' }
  }

  const nowIso = new Date().toISOString()
  let ordersToCheck = []

  if (orderId) {
    const rawId = String(orderId).trim()
    const cleanId = rawId.replace(/^#\s*/, '').trim()
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    let q = supabase.from('orders').select('*, shipments(*)')
    if (isUUID) {
      q = q.or(`id.eq.${cleanId},order_number.eq.${cleanId}`)
    } else {
      q = q.or(`order_number.eq.${cleanId},order_number.eq.#${cleanId},id.eq.${cleanId}`)
    }
    const { data } = await q.maybeSingle()
    if (data) ordersToCheck = [data]
  } else {
    // Check all open orders that have shipments and are not already CANCELLED or DELIVERED
    const { data } = await supabase
      .from('orders')
      .select('*, shipments(*)')
      .neq('status', 'CANCELLED')
      .neq('status', 'CANCELED')
      .neq('status', 'DELIVERED')
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) ordersToCheck = data
  }

  let token = null
  try {
    token = await getShiprocketAuthToken()
  } catch (e) {
    console.warn('Could not get Shiprocket token for sync:', e.message)
  }

  const updatedCancellations = []

  for (const ord of ordersToCheck) {
    const shipment = Array.isArray(ord.shipments) ? ord.shipments[0] : ord.shipments
    const shiprocketOrderId = shipment?.shiprocket_order_id
    const awbCode = shipment?.awb_code

    if (!shiprocketOrderId && !awbCode) continue
    if (!token) continue

    try {
      let isCancelledOnShiprocket = false
      let cancelReason = 'Shiprocket Merchant Portal'

      // Check via Shiprocket order show endpoint
      if (shiprocketOrderId) {
        const checkRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${shiprocketOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (checkRes.ok) {
          const checkData = await checkRes.json()
          const orderData = checkData?.data || checkData
          const st = (orderData?.status || orderData?.order_status || '').toUpperCase()
          const statusCode = orderData?.status_code
          if (st.includes('CANCEL') || statusCode === 5 || statusCode === '5') {
            isCancelledOnShiprocket = true
            cancelReason = orderData?.cancel_reason || orderData?.reason || 'Cancelled by seller on Shiprocket'
          }
        }
      }

      // If not detected via show, check via courier track AWB
      if (!isCancelledOnShiprocket && awbCode) {
        const trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (trackRes.ok) {
          const trackData = await trackRes.json()
          const currentStatus = (trackData?.tracking_data?.shipment_track?.[0]?.current_status || '').toUpperCase()
          if (currentStatus.includes('CANCEL') || trackData?.tracking_data?.shipment_status === 5) {
            isCancelledOnShiprocket = true
            cancelReason = 'Cancelled on Shiprocket courier tracking'
          }
        }
      }

      if (isCancelledOnShiprocket) {
        let parsedNotes = {}
        try {
          if (ord.notes) {
            parsedNotes = typeof ord.notes === 'string' ? JSON.parse(ord.notes) : ord.notes
          }
        } catch (e) {}

        parsedNotes.cancelled_at = nowIso
        parsedNotes.cancellation_source = 'Shiprocket Sync Poll'
        parsedNotes.cancellation_reason = cancelReason

        await supabase
          .from('orders')
          .update({
            status: 'CANCELLED',
            notes: JSON.stringify(parsedNotes),
            updated_at: nowIso,
          })
          .eq('id', ord.id)

        await supabase
          .from('shipments')
          .update({
            status: 'CANCELLED',
            updated_at: nowIso,
          })
          .eq('order_id', ord.id)

        await supabase.from('tracking_events').insert({
          order_id: ord.id,
          shipment_id: shipment?.id || null,
          status: 'CANCELLED',
          activity: `Order cancelled on Shiprocket by seller. Live tracking updated.`,
          location: 'Merchant Fulfillment Hub (Satara)',
          event_time: nowIso,
        })

        updatedCancellations.push({
          order_id: ord.id,
          order_number: ord.order_number,
          reason: cancelReason,
        })
      }
    } catch (err) {
      console.warn(`Sync check error for order ${ord.order_number}:`, err.message)
    }
  }

  return {
    success: true,
    checked_count: ordersToCheck.length,
    updated_cancellations: updatedCancellations,
    timestamp: nowIso,
  }
}

/**
 * Query available Shiprocket courier partners, live freight rates, and ETDs for an order destination
 */
async function handleGetCourierRates({
  supabase,
  query = {},
  body = {},
  orderId = null,
  orderParam = null,
  fallbackOrderData = null,
}) {
  const token = await getShiprocketAuthToken()
  if (!token) {
    return {
      success: false,
      statusCode: 400,
      error: 'Shiprocket is not connected: Missing API credentials.',
    }
  }

  let rawPincode =
    query.pincode ||
    query.delivery_postcode ||
    body.pincode ||
    body.delivery_postcode ||
    ''
  let isCod =
    query.cod === '1' ||
    query.cod === 1 ||
    body.cod === 1 ||
    body.cod === '1' ||
    String(body.paymentMethod || query.paymentMethod || body.payment_method || '').toUpperCase() === 'COD'
      ? 1
      : 0

  let targetOrder = null
  const targetId = orderParam || orderId || body.orderId || body.order_id

  if ((!rawPincode || isCod === undefined) && (targetId || fallbackOrderData)) {
    if (supabase && targetId) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)
        let q = supabase.from('orders').select('*, shipments(*)')
        if (isUUID) {
          q = q.or(`id.eq.${targetId},order_number.eq.${targetId}`)
        } else {
          q = q.eq('order_number', targetId)
        }
        const { data: ord } = await q.maybeSingle()
        targetOrder = ord
      } catch (err) {
        console.warn('Could not query order for couriers:', err)
      }
    }
    if (!targetOrder && fallbackOrderData) {
      targetOrder = fallbackOrderData
    }

    if (targetOrder) {
      const rawAddress = targetOrder.shipping_address || {}
      rawPincode = rawPincode || rawAddress.pincode || targetOrder.pincode
      if (isCod === undefined || isCod === 0) {
        isCod = (targetOrder.payment_method || '').toUpperCase() === 'COD' ? 1 : 0
      }
    }
  }

  rawPincode = String(rawPincode || '').trim()
  if (!rawPincode || !/^[1-9][0-9]{5}$/.test(rawPincode)) {
    return {
      success: false,
      statusCode: 400,
      error: `Invalid or missing destination PIN code (${rawPincode || 'empty'}). Indian postal codes must be exactly 6 digits.`,
    }
  }

  const pickupPostcode = process.env.PICKUP_POSTCODE || '415106'
  const weight = query.weight || body.weight || 0.15

  const serviceUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${rawPincode}&weight=${weight}&cod=${isCod}`

  const serviceRes = await fetch(serviceUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const serviceData = await serviceRes.json()
  const rawCouriers = serviceData?.data?.available_courier_companies || []

  if (!serviceRes.ok || rawCouriers.length === 0) {
    return {
      success: false,
      statusCode: 422,
      error: `No courier partners service pincode ${rawPincode} from pickup hub (${pickupPostcode}).`,
      raw: serviceData,
    }
  }

  // Sort by freight charge / rate ascending (cheapest first)
  const couriers = rawCouriers
    .map((c) => ({
      courier_company_id: c.courier_company_id,
      courier_name: c.courier_name,
      rate: Number(c.rate || c.freight_charge || 0),
      freight_charge: Number(c.freight_charge || c.rate || 0),
      estimated_delivery_days: c.estimated_delivery_days || '3-5',
      etd: c.etd || '',
      rating: Number(c.rating || 4.0),
      is_surface: Boolean(c.is_surface || String(c.courier_name || '').toLowerCase().includes('surface')),
      call_before_delivery: c.call_before_delivery || 'Available',
      realtime_tracking: c.realtime_tracking || 'Real Time',
      city: c.city || targetOrder?.shipping_address?.city || '',
      state: c.state || targetOrder?.shipping_address?.state || '',
    }))
    .sort((a, b) => a.rate - b.rate)

  if (couriers.length > 0) {
    couriers[0].is_cheapest = true
  }

  return {
    success: true,
    statusCode: 200,
    pickup_postcode: pickupPostcode,
    delivery_postcode: rawPincode,
    city: targetOrder?.shipping_address?.city || rawCouriers[0]?.city || '',
    state: targetOrder?.shipping_address?.state || rawCouriers[0]?.state || '',
    payment_method: isCod ? 'COD' : 'Prepaid',
    couriers,
  }
}
