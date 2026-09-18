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
 * Shiprocket Webhook Handler
 * Listens for order status updates, tracking changes, and cancellations from Shiprocket
 * and synchronizes them directly into Supabase database.
 */
export default async function handler(req, res) {
  res.setHeader?.('Access-Control-Allow-Origin', '*')
  res.setHeader?.('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, x-api-key')

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end()
    res.statusCode = 200
    return res.end()
  }

  // Shiprocket webhook verification endpoint
  if (req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'active',
      service: 'Smiths Jewellery Shiprocket Webhook Listener',
      timestamp: new Date().toISOString(),
    })
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Expected POST.' })
  }

  try {
    const payload = await parseRequestBody(req)
    console.log('Shiprocket Webhook received payload:', JSON.stringify(payload))

    // Initialize Supabase Client
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      'https://sooedjbqgrdjtwiobjpr.supabase.co'
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb2VkamJxZ3JkanR3aW9ianByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDU1NzksImV4cCI6MjEwNDMyMTU3OX0.dgKiyPzjtiTTFFVH8QhpWHI3QTXAOelwiBBBngboGiI'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract Order Identifiers & Status from Shiprocket payload
    const orderNumber =
      payload.channel_order_id ||
      payload.order_id ||
      payload.order_number ||
      payload.order_info?.channel_order_id ||
      payload.order_info?.order_id
    const awbCode = payload.awb || payload.awb_code || payload.tracking_data?.awb
    const shipmentId = payload.shipment_id || payload.order_info?.shipment_id

    const rawStatus = (
      payload.current_status ||
      payload.status ||
      payload.order_status ||
      payload.event ||
      ''
    ).toUpperCase()

    const isCancelled =
      rawStatus.includes('CANCEL') ||
      rawStatus === 'CANCELED' ||
      rawStatus === 'CANCELLED' ||
      rawStatus === 'CANCELED_BY_SELLER' ||
      payload.status_code === 5 ||
      payload.status_code === '5'

    const nowIso = new Date().toISOString()

    if (isCancelled) {
      console.log(`Shiprocket Webhook: Order ${orderNumber} (AWB: ${awbCode}) is CANCELLED. Updating database...`)

      // 1. Locate Order in Supabase
      let targetOrder = null
      if (orderNumber) {
        const { data: ord } = await supabase
          .from('orders')
          .select('id, order_number, notes')
          .eq('order_number', String(orderNumber).trim())
          .maybeSingle()
        targetOrder = ord
      }

      if (!targetOrder && awbCode) {
        const { data: ship } = await supabase
          .from('shipments')
          .select('order_id')
          .eq('awb_code', String(awbCode).trim())
          .maybeSingle()
        if (ship?.order_id) {
          const { data: ord } = await supabase
            .from('orders')
            .select('id, order_number, notes')
            .eq('id', ship.order_id)
            .maybeSingle()
          targetOrder = ord
        }
      }

      if (targetOrder) {
        // Parse existing notes and append cancellation info
        let notesObj = {}
        try {
          if (targetOrder.notes) {
            notesObj = typeof targetOrder.notes === 'string' ? JSON.parse(targetOrder.notes) : targetOrder.notes
          }
        } catch (e) {}

        notesObj.cancelled_at = nowIso
        notesObj.cancellation_source = 'Shiprocket Merchant Portal'
        notesObj.cancellation_reason = payload.cancel_reason || payload.reason || 'Cancelled by seller on Shiprocket'

        // Update orders table
        await supabase
          .from('orders')
          .update({
            status: 'CANCELLED',
            notes: JSON.stringify(notesObj),
            updated_at: nowIso,
          })
          .eq('id', targetOrder.id)

        // Update shipments table
        await supabase
          .from('shipments')
          .update({
            status: 'CANCELLED',
            updated_at: nowIso,
          })
          .eq('order_id', targetOrder.id)

        // Insert cancellation tracking event for live user tracking visibility
        await supabase.from('tracking_events').insert({
          order_id: targetOrder.id,
          status: 'CANCELLED',
          activity: 'Order cancelled on Shiprocket by seller. Shipment has been stopped and refunded if prepaid.',
          location: 'Merchant Fulfillment Center (Satara Hub)',
          event_time: nowIso,
        })

        return sendJson(res, 200, {
          success: true,
          message: `Order #${targetOrder.order_number} successfully marked as CANCELLED. Customer live tracking updated.`,
          order_id: targetOrder.id,
          order_number: targetOrder.order_number,
        })
      }
    }

    // Acknowledge receipt of other webhook events
    return sendJson(res, 200, {
      success: true,
      received: true,
      status: rawStatus,
    })
  } catch (err) {
    console.error('Error handling Shiprocket webhook:', err)
    return sendJson(res, 500, {
      success: false,
      error: err.message || 'Internal error processing webhook.',
    })
  }
}
