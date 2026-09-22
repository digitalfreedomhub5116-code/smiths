import { supabase, isSupabaseConfigured } from './supabase'
import { MOCK_PRODUCTS, GENRES, buildProductReviews, DEFAULT_JEWELLERY_IMAGE } from '../data/productsData'

const LOCAL_STORAGE_ORDERS_KEY = 'smiths_jewellery_orders'
const LOCAL_STORAGE_USER_KEY = 'smiths_jewellery_user'
const LOCAL_STORAGE_ADDRESSES_KEY = 'smiths_jewellery_addresses'

// Helper for local storage
const getLocalData = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch (e) {
    return fallback
  }
}

const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error', e)
  }
}

const LOCAL_STORAGE_PRODUCTS_KEY = 'smiths_jewellery_products_v2'
const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smiths_deleted_product_ids'

export const getLocalDeletedProductIds = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_DELETED_PRODUCTS_KEY)
    return data ? JSON.parse(data).map(Number) : []
  } catch (e) {
    return []
  }
}

export const setLocalDeletedProductIds = (ids) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(ids.map(Number)))
  } catch (e) {}
}

// ── 0. CLOUD STORAGE (SUPABASE BUCKET: product-images) ──
export async function uploadProductImage(fileOrBlobOrDataUrl, prefix = 'jewellery') {
  if (!fileOrBlobOrDataUrl) throw new Error('No image provided')

  // If already a remote web URL, return it directly
  if (
    typeof fileOrBlobOrDataUrl === 'string' &&
    (fileOrBlobOrDataUrl.startsWith('http://') || fileOrBlobOrDataUrl.startsWith('https://'))
  ) {
    return fileOrBlobOrDataUrl
  }

  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, returning raw image data')
    return fileOrBlobOrDataUrl
  }

  try {
    let blob
    let extension = 'jpg'
    let mimeType = 'image/jpeg'

    if (typeof fileOrBlobOrDataUrl === 'string' && fileOrBlobOrDataUrl.startsWith('data:')) {
      const parts = fileOrBlobOrDataUrl.split(';base64,')
      mimeType = parts[0].split(':')[1] || 'image/jpeg'
      const byteCharacters = atob(parts[1])
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      blob = new Blob([byteArray], { type: mimeType })
      const rawExt = mimeType.split('/')[1] || 'jpg'
      extension = rawExt === 'jpeg' ? 'jpg' : rawExt
    } else if (fileOrBlobOrDataUrl instanceof Blob || fileOrBlobOrDataUrl instanceof File) {
      blob = fileOrBlobOrDataUrl
      mimeType = fileOrBlobOrDataUrl.type || 'image/jpeg'
      if (fileOrBlobOrDataUrl.name) {
        const ext = fileOrBlobOrDataUrl.name.split('.').pop()
        if (ext) extension = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      }
    } else {
      return fileOrBlobOrDataUrl
    }

    const cleanPrefix = (prefix || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileName = `${cleanPrefix}-${Date.now()}-${randomSuffix}.${extension}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        cacheControl: '31536000',
        upsert: true,
        contentType: mimeType,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (err) {
    console.error('Failed to upload image to Supabase Storage:', err)
    throw err
  }
}

// ── 1. PRODUCTS & CATEGORIES ──
export async function getProducts(options = {}) {
  const { genre, includeHidden = false } = options

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Concurrently fetch products, visibility, availability, and deleted_product_ids
      const [prodRes, visRes, availRes, settingsRes] = await Promise.allSettled([
        supabase.from('products').select('*').order('id', { ascending: true }),
        supabase.from('product_visibility').select('*'),
        supabase.from('product_availability').select('*'),
        supabase.from('admin_settings').select('value').eq('key', 'deleted_product_ids').maybeSingle()
      ])

      const prodData = prodRes.status === 'fulfilled' && !prodRes.value.error ? prodRes.value.data : null
      const visData = visRes.status === 'fulfilled' && !visRes.value.error ? visRes.value.data : []
      const availData = availRes.status === 'fulfilled' && !availRes.value.error ? availRes.value.data : []
      
      const remoteDeleted = (settingsRes.status === 'fulfilled' && Array.isArray(settingsRes.value.data?.value))
        ? settingsRes.value.data.value
        : []
      
      const localDeleted = getLocalDeletedProductIds()
      const allDeletedIds = Array.from(new Set([...remoteDeleted.map(Number), ...localDeleted.map(Number)]))
      setLocalDeletedProductIds(allDeletedIds)

      if (prodData && Array.isArray(prodData) && prodData.length > 0) {
        const visMap = new Map((visData || []).map((v) => [Number(v.product_id), v]))
        const availMap = new Map((availData || []).map((a) => [Number(a.product_id), a]))

        const mapped = prodData
          .filter((row) => !allDeletedIds.includes(Number(row.id)))
          .map((row) => {
            const pId = Number(row.id) || row.id
            const mock = MOCK_PRODUCTS.find((m) => Number(m.id) === pId || m.slug === row.slug)
            const fallbackReviews = mock?.reviews || buildProductReviews(row)
            const rawRowGallery = Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : []
            const cleanRowGallery = rawRowGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))

            const fallbackGallery = cleanRowGallery.length > 0
              ? cleanRowGallery
              : (mock?.gallery || (mock?.image ? [mock.image] : [DEFAULT_JEWELLERY_IMAGE]))

            const coverImage = (row.image && !row.image.includes('photo-1618354691373-d851c5c3a990'))
              ? row.image
              : fallbackGallery[0] || mock?.image || DEFAULT_JEWELLERY_IMAGE

            const vis = visMap.get(pId)
            const isHidden = vis ? Boolean(vis.is_hidden) : (row.is_active === false)

            const avail = availMap.get(pId)
            const inStock = avail ? Boolean(avail.in_stock) : (row.is_active !== false)
            const stockQty = avail?.stock_quantity ?? (Number(row.stock) || 50)

            return {
              ...mock,
              ...row,
              id: pId,
              name: row.name,
              fullName: row.full_name || `${row.name} - Smiths Jewellery`,
              slug: row.slug || mock?.slug,
              genre: row.genre || mock?.genre || 'EARRINGS',
              price: Number(row.price),
              originalPrice: Number(row.original_price || mock?.originalPrice || Math.round(Number(row.price) * 1.8)),
              stock: stockQty,
              image: coverImage,
              gallery: fallbackGallery,
              inStock: inStock,
              isHidden: isHidden,
              rating: Number(row.rating) || mock?.rating || 4.8,
              reviewCount: Number(row.review_count) || mock?.reviewCount || fallbackReviews.length || 12,
              reviews: Array.isArray(row.reviews) && row.reviews.length > 0 ? row.reviews : fallbackReviews,
              description: row.description || mock?.description || `Handcrafted 925 sterling silver ${row.name} from Smiths Jewellery.`,
              features: Array.isArray(row.features) && row.features.length > 0
                ? row.features
                : (Array.isArray(row.key_features) && row.key_features.length > 0 ? row.key_features : (mock?.features || [
                  'Crafted from certified 925 Sterling Silver',
                  'Triple Rhodium Plated for enduring tarnish resistance',
                  'AAA Grade brilliant cubic zirconia stones',
                  '100% Hypoallergenic — Nickel-Free and Lead-Free',
                  'Includes Velvet Presentation Box & Authenticity Certificate',
                ])),
              dimensions: row.dimensions || mock?.dimensions || 'Standard Comfort Fit',
              material: row.material || mock?.material || '925 Sterling Silver',
              finish: row.finish || mock?.finish || 'High-Luster Rhodium & Polished Silver',
              keyring: 'Hypoallergenic Security Clasp',
              durability: 'Tarnish-Resistant Daily Wear',
              discountBadge: mock?.discountBadge || '-50%',
              discountPercent: mock?.discountPercent || 50,
              isBestseller: mock?.isBestseller ?? (pId === 5 || pId === 17 || pId === 31),
            }
          })

        // Filter out any mock products that were explicitly deleted
        const missingFromDb = MOCK_PRODUCTS.filter(
          (m) =>
            !allDeletedIds.includes(Number(m.id)) &&
            !mapped.some((item) => Number(item.id) === Number(m.id) || item.slug === m.slug)
        )
        if (missingFromDb.length > 0) {
          mapped.push(...missingFromDb)
        }

        mapped.sort((a, b) => Number(a.id) - Number(b.id))
        // Update persistent local cache
        setLocalData(LOCAL_STORAGE_PRODUCTS_KEY, mapped)

        let filtered = mapped
        if (!includeHidden) {
          filtered = filtered.filter((p) => !p.isHidden)
        }
        if (genre) {
          filtered = filtered.filter((p) => p.genre === genre)
        }
        return filtered
      }
    } catch (err) {
      console.warn('Supabase products fetch failed, using cached catalog', err)
    }
  }

  // Fallback to active catalog
  const stored = getLocalData(LOCAL_STORAGE_PRODUCTS_KEY, null)
  const localDeleted = getLocalDeletedProductIds()
  let catalog = stored && Array.isArray(stored) && stored.length > 0 ? stored : MOCK_PRODUCTS
  let result = catalog.filter((p) => !localDeleted.includes(Number(p.id)))
  if (!includeHidden) {
    result = result.filter((p) => !p.isHidden)
  }
  if (genre) {
    result = result.filter((p) => p.genre === genre)
  }
  return result
}

export function initProductSync(onProductsUpdated) {
  // Initial fetch from Supabase
  getProducts({ includeHidden: true })
    .then((prods) => {
      if (prods && prods.length > 0 && onProductsUpdated) {
        onProductsUpdated(prods)
      }
    })
    .catch((e) => console.warn('Failed initial products fetch:', e))

  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase
        .channel('realtime:store_products_global')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async () => {
            const latest = await getProducts({ includeHidden: true })
            if (latest && latest.length > 0 && onProductsUpdated) {
              onProductsUpdated(latest)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_visibility' },
          async () => {
            const latest = await getProducts({ includeHidden: true })
            if (latest && latest.length > 0 && onProductsUpdated) {
              onProductsUpdated(latest)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_availability' },
          async () => {
            const latest = await getProducts({ includeHidden: true })
            if (latest && latest.length > 0 && onProductsUpdated) {
              onProductsUpdated(latest)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admin_settings' },
          async () => {
            const latest = await getProducts({ includeHidden: true })
            if (latest && latest.length > 0 && onProductsUpdated) {
              onProductsUpdated(latest)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (e) {
      console.warn('Product realtime listener failed:', e)
    }
  }

  return () => {}
}

export async function getProductBySlugOrId(identifier) {
  const localDeleted = getLocalDeletedProductIds()
  const isNum = !isNaN(Number(identifier))
  if (isNum && localDeleted.includes(Number(identifier))) {
    return null
  }

  const stored = getLocalData(LOCAL_STORAGE_PRODUCTS_KEY, null)
  const catalog = stored && Array.isArray(stored) && stored.length > 0 ? stored : MOCK_PRODUCTS

  if (isSupabaseConfigured && supabase) {
    try {
      // Check admin_settings deleted_product_ids
      const { data: settingsRow } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'deleted_product_ids')
        .maybeSingle()
      const deletedIds = Array.isArray(settingsRow?.value) ? settingsRow.value.map(Number) : []
      if (isNum && deletedIds.includes(Number(identifier))) {
        return null
      }

      const query = isNum
        ? supabase.from('products').select('*, product_reviews(*)').eq('id', Number(identifier)).single()
        : supabase.from('products').select('*, product_reviews(*)').eq('slug', identifier).single()
      const { data, error } = await query
      if (!error && data) {
        const pId = Number(data.id)
        if (deletedIds.includes(pId) || localDeleted.includes(pId)) {
          return null
        }

        // Fetch visibility and availability
        const [visRes, availRes] = await Promise.allSettled([
          supabase.from('product_visibility').select('*').eq('product_id', pId).maybeSingle(),
          supabase.from('product_availability').select('*').eq('product_id', pId).maybeSingle(),
        ])

        const vis = visRes.status === 'fulfilled' ? visRes.value.data : null
        const avail = availRes.status === 'fulfilled' ? availRes.value.data : null

        const isHidden = vis ? Boolean(vis.is_hidden) : (data.is_active === false)
        const inStock = avail ? Boolean(avail.in_stock) : (data.is_active !== false)
        const stockQty = avail?.stock_quantity ?? (Number(data.stock) || 50)

        const mock = MOCK_PRODUCTS.find((m) => Number(m.id) === pId || m.slug === data.slug)
        const fallbackReviews = mock?.reviews || buildProductReviews(data)
        const rawGallery = Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : []
        const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))

        const fallbackGallery = cleanGallery.length > 0
          ? cleanGallery
          : (mock?.gallery || (mock?.image ? [mock.image] : [DEFAULT_JEWELLERY_IMAGE]))

        const coverImage = (data.image && !data.image.includes('photo-1618354691373-d851c5c3a990'))
          ? data.image
          : fallbackGallery[0] || mock?.image || DEFAULT_JEWELLERY_IMAGE

        return {
          ...mock,
          ...data,
          id: pId,
          name: data.name,
          fullName: data.full_name || `${data.name} - Smiths Jewellery`,
          image: coverImage,
          gallery: fallbackGallery,
          reviews: Array.isArray(data.reviews) && data.reviews.length > 0 ? data.reviews : fallbackReviews,
          description: data.description || mock?.description || `Handcrafted 925 sterling silver ${data.name} from Smiths Jewellery.`,
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : (mock?.features || []),
          rating: Number(data.rating) || mock?.rating || 4.8,
          reviewCount: Number(data.review_count) || mock?.reviewCount || fallbackReviews.length || 12,
          inStock: inStock,
          stock: stockQty,
          isHidden: isHidden,
        }
      }
    } catch (err) {
      console.warn('Supabase product query error', err)
    }
  }

  const found = catalog.find(
    (p) => !localDeleted.includes(Number(p.id)) && (String(p.id) === String(identifier) || p.slug === identifier)
  )
  return found || null
}

export async function saveProduct(product) {
  const pId = Number(product.id)
  const mock = MOCK_PRODUCTS.find((m) => Number(m.id) === pId || m.slug === product.slug)
  const defaultFallback = mock?.image || DEFAULT_JEWELLERY_IMAGE
  const rawGallery = Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : []
  const cleanGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
  const finalGallery = cleanGallery.length > 0 ? cleanGallery : [product.image || defaultFallback]
  const primaryImage = (product.image && !product.image.includes('photo-1618354691373-d851c5c3a990'))
    ? product.image
    : finalGallery[0] || defaultFallback

  const isHidden = product.isHidden === true
  const inStock = product.inStock !== false
  const stockQty = inStock ? (Number(product.stock) || 50) : 0

  const stored = getLocalData(LOCAL_STORAGE_PRODUCTS_KEY, MOCK_PRODUCTS)
  const idx = stored.findIndex((p) => Number(p.id) === pId)
  let updated
  const updatedProductObj = {
    ...product,
    id: pId,
    image: primaryImage,
    gallery: finalGallery,
    inStock,
    isHidden,
    stock: stockQty,
  }

  if (idx >= 0) {
    updated = [...stored]
    updated[idx] = { ...updated[idx], ...updatedProductObj }
  } else {
    updated = [updatedProductObj, ...stored]
  }
  setLocalData(LOCAL_STORAGE_PRODUCTS_KEY, updated)

  // Also remove from deleted IDs if it was previously marked deleted
  const currentDeleted = getLocalDeletedProductIds().map(Number)
  const numPId = Number(pId)
  if (currentDeleted.includes(numPId)) {
    const updatedDeleted = currentDeleted.filter((id) => Number(id) !== numPId)
    setLocalDeletedProductIds(updatedDeleted)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: currentSettings } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'deleted_product_ids')
          .maybeSingle()
        const remoteDeleted = Array.isArray(currentSettings?.value) ? currentSettings.value.map(Number) : []
        const mergedDeleted = remoteDeleted.filter((id) => id !== numPId)
        await supabase.from('admin_settings').upsert({
          key: 'deleted_product_ids',
          value: mergedDeleted,
          updated_at: new Date().toISOString(),
        })
      } catch (e) {}
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const cleanName = product.name || 'Silver Jewellery Piece'
      const slug = product.slug || `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-silver`
      const fullName = product.fullName || `${cleanName} - Smiths Jewellery`

      // 1. Clean payload matching EXACT schema of public.products table
      const payload = {
        id: pId,
        name: cleanName,
        full_name: fullName,
        slug: slug,
        genre: product.genre || 'EARRINGS',
        price: Number(product.price) || 1299,
        original_price: Number(product.originalPrice || product.original_price || Math.round(Number(product.price) * 1.8)),
        stock: stockQty,
        description: product.description || `Handcrafted 925 sterling silver ${cleanName} from Smiths Jewellery.`,
        material: product.material || '925 Sterling Silver',
        dimensions: product.dimensions || 'Standard Comfort Fit',
        finish: product.finish || 'High-Luster Rhodium & Polished Silver',
        image: primaryImage,
        gallery: finalGallery,
        key_features: product.features || product.key_features || [
          'Crafted from certified 925 Sterling Silver',
          'Triple Rhodium Plated for enduring tarnish resistance',
          'AAA Grade brilliant cubic zirconia stones',
          '100% Hypoallergenic — Nickel-Free and Lead-Free',
          'Includes Velvet Presentation Box & Authenticity Certificate',
        ],
        is_active: inStock && !isHidden,
        updated_at: new Date().toISOString(),
      }

      const { error: prodErr } = await supabase.from('products').upsert(payload)
      if (prodErr) {
        console.error('Supabase product upsert error:', prodErr.message)
      }

      // 2. product_visibility table
      const { error: visErr } = await supabase.from('product_visibility').upsert({
        product_id: pId,
        is_hidden: isHidden,
        is_featured: Boolean(product.isFeatured || product.isBestseller),
        is_trending: Boolean(product.isTrending),
        updated_at: new Date().toISOString(),
      })
      if (visErr) {
        console.error('Supabase visibility upsert error:', visErr.message)
      }

      // 3. product_availability table
      const { error: availErr } = await supabase.from('product_availability').upsert({
        product_id: pId,
        in_stock: inStock,
        stock_quantity: stockQty,
        allow_backorder: false,
        updated_at: new Date().toISOString(),
      })
      if (availErr) {
        console.error('Supabase availability upsert error:', availErr.message)
      }
    } catch (e) {
      console.error('Supabase product save failed:', e)
    }
  }

  return updatedProductObj
}

export async function deleteProductFromDb(productId) {
  const pId = Number(productId) || productId
  
  // 1. Update local storage
  const currentDeleted = getLocalDeletedProductIds()
  const updatedDeleted = Array.from(new Set([...currentDeleted.map(Number), Number(pId)]))
  setLocalDeletedProductIds(updatedDeleted)

  const stored = getLocalData(LOCAL_STORAGE_PRODUCTS_KEY, MOCK_PRODUCTS)
  const updated = stored.filter((p) => Number(p.id) !== Number(pId))
  setLocalData(LOCAL_STORAGE_PRODUCTS_KEY, updated)

  // 2. Delete from Supabase & record in admin_settings
  if (isSupabaseConfigured && supabase) {
    try {
      await Promise.allSettled([
        supabase.from('products').delete().eq('id', pId),
        supabase.from('product_visibility').delete().eq('product_id', pId),
        supabase.from('product_availability').delete().eq('product_id', pId),
      ])

      // Fetch latest admin_settings deleted_product_ids
      const { data: currentSettings } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'deleted_product_ids')
        .maybeSingle()

      const remoteDeleted = Array.isArray(currentSettings?.value) ? currentSettings.value : []
      const mergedDeleted = Array.from(new Set([...remoteDeleted.map(Number), Number(pId)]))

      await supabase.from('admin_settings').upsert({
        key: 'deleted_product_ids',
        value: mergedDeleted,
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Supabase delete product error:', e)
    }
  }
}

// ── 2. ORDERS & SHIPROCKET LIVE TRACKING ──
export async function createOrder(orderPayload) {
  const orderNumber = 'SMT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

  const initialTrackingEvents = [
    {
      id: 'evt-1',
      status: 'PLACED',
      activity: 'Order placed & payment verified',
      location: 'Smiths Online Store',
      event_time: new Date().toISOString(),
    },
    {
      id: 'evt-2',
      status: 'CONFIRMED',
      activity: 'Order confirmed: Jewellery queued for velvet gift box packaging & authenticity certification',
      location: 'Smiths Studio, Bengaluru',
      event_time: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    },
  ]

  const shipmentData = {
    courier_partner: null,
    awb_code: null,
    tracking_url: null,
    status: 'CONFIRMED',
    estimated_delivery: estimatedDelivery,
  }

  const newOrder = {
    id: 'ord-' + Math.random().toString(36).substring(2, 9),
    order_number: orderNumber,
    customer_name: orderPayload.customer_name,
    customer_phone: orderPayload.customer_phone,
    customer_email: orderPayload.customer_email || '',
    shipping_address: orderPayload.shipping_address,
    items: orderPayload.items || [],
    subtotal: orderPayload.subtotal,
    shipping_fee: orderPayload.shipping_fee || 60,
    total_amount: orderPayload.total_amount,
    payment_method: orderPayload.payment_method || 'COD',
    payment_status: orderPayload.payment_status || (orderPayload.payment_method === 'COD' ? 'PENDING' : 'PAID'),
    razorpay_payment_id: orderPayload.razorpay_payment_id || null,
    razorpay_order_id: orderPayload.razorpay_order_id || null,
    status: 'CONFIRMED',
    shipment: shipmentData,
    tracking_events: initialTrackingEvents,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // 1. Persist directly to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Validate user_id: Must be a valid UUID and present in public.profiles table
      let validUserId = null
      if (
        orderPayload.user_id &&
        typeof orderPayload.user_id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderPayload.user_id)
      ) {
        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', orderPayload.user_id)
            .maybeSingle()
          if (profileRow?.id) {
            validUserId = orderPayload.user_id
          }
        } catch (pe) {
          // If profile lookup fails, leave as null to avoid foreign key failure
        }
      }

      const orderInsertData = {
        order_number: orderNumber,
        user_id: validUserId,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        customer_email: newOrder.customer_email,
        shipping_address: newOrder.shipping_address,
        subtotal: newOrder.subtotal,
        shipping_fee: newOrder.shipping_fee,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        razorpay_payment_id: newOrder.razorpay_payment_id,
        razorpay_order_id: newOrder.razorpay_order_id,
        status: newOrder.status,
      }

      let { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsertData)
        .select()
        .single()

      // Resilient fallback: If user_id caused foreign key violation or syntax issue, retry with user_id: null
      if (orderError && validUserId) {
        console.warn('Order insertion with user_id failed, retrying with user_id = null:', orderError.message)
        const retry = await supabase
          .from('orders')
          .insert({ ...orderInsertData, user_id: null })
          .select()
          .single()
        orderRecord = retry.data
        orderError = retry.error
      }

      if (orderError) {
        console.error('Supabase order creation error:', orderError)
      } else if (orderRecord) {
        newOrder.id = orderRecord.id
        console.log('[Supabase] Order inserted successfully:', orderRecord.order_number)

        // 1. Insert order items
        if (newOrder.items && newOrder.items.length > 0) {
          const itemRows = newOrder.items.map((it) => {
            const pid = Number(it.product_id || it.id)
            return {
              order_id: orderRecord.id,
              product_id: !isNaN(pid) && pid >= 1 && pid <= 25 ? pid : null,
              product_name: it.name || 'Silver Jewellery',
              quantity: it.quantity || 1,
              price: it.price || 0,
              image: it.image || '',
            }
          })
          const { error: itemsErr } = await supabase.from('order_items').insert(itemRows)
          if (itemsErr) console.warn('Supabase order_items error:', itemsErr.message)
        }

        // 2. Insert shipment & live tracking events
        if (newOrder.shipment) {
          const { data: shipRecord, error: shipErr } = await supabase
            .from('shipments')
            .insert({
              order_id: orderRecord.id,
              courier_partner: newOrder.shipment.courier_partner,
              awb_code: newOrder.shipment.awb_code,
              tracking_url: newOrder.shipment.tracking_url,
              status: newOrder.shipment.status,
              estimated_delivery: newOrder.shipment.estimated_delivery,
            })
            .select()
            .single()

          if (shipErr) {
            console.warn('Supabase shipments error:', shipErr.message)
          } else if (shipRecord && newOrder.tracking_events && newOrder.tracking_events.length > 0) {
            // 3. Insert tracking events
            const trkRows = newOrder.tracking_events.map((evt) => ({
              shipment_id: shipRecord.id,
              order_id: orderRecord.id,
              status: evt.status || 'PLACED',
              activity: evt.activity || 'Order placed',
              location: evt.location || 'Smiths Online Store',
              event_time: evt.event_time || new Date().toISOString(),
            }))
            const { error: trkErr } = await supabase.from('tracking_events').insert(trkRows)
            if (trkErr) console.warn('Supabase tracking_events error:', trkErr.message)
          }
        }
      }
    } catch (e) {
      console.warn('Supabase order insert unexpected error, using local state', e)
    }
  }

  // 2. Persist in local storage for instantaneous live lookup
  const existingOrders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
  setLocalData(LOCAL_STORAGE_ORDERS_KEY, [newOrder, ...existingOrders])

  // 3. Automated Notifications to Admin (Instant Email to Gmail + WhatsApp)
  // 100% automated in the background — zero customer delay or friction
  sendAdminOrderEmail(newOrder).catch((err) => {
    console.warn('[Email Notification] Background dispatch error:', err)
  })
  sendAdminOrderNotification(newOrder).catch((err) => {
    console.warn('[WhatsApp Notification] Background dispatch error:', err)
  })

  return newOrder
}

export async function getOrder(orderNumberOrId) {
  if (!orderNumberOrId) return null
  const cleaned = orderNumberOrId.trim().toUpperCase()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumberOrId.trim())

  // Check Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), shipments(*, tracking_events(*))')

      if (isUUID) {
        query = query.or(`order_number.eq.${cleaned},id.eq.${orderNumberOrId.trim()}`)
      } else {
        query = query.eq('order_number', cleaned)
      }

      const { data, error } = await query.single()
      if (!error && data) return data
    } catch (e) {
      console.warn('Supabase getOrder query error', e)
    }
  }

  // Check local storage
  const orders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
  return orders.find(
    (o) => o.order_number?.toUpperCase() === cleaned || o.id === orderNumberOrId
  ) || null
}

export async function getOrdersByPhone(phone) {
  if (!phone) return []
  const cleanedPhone = phone.replace(/[^0-9]/g, '')

  // 1. Check Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), shipments(*, tracking_events(*))')
        .ilike('customer_phone', `%${cleanedPhone.slice(-10)}%`)
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data
      }
    } catch (e) {
      console.warn('Supabase getOrdersByPhone error', e)
    }
  }

  // 2. Check local storage
  const orders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
  return orders.filter((o) => {
    const p = (o.customer_phone || '').replace(/[^0-9]/g, '')
    return p.includes(cleanedPhone) || cleanedPhone.includes(p)
  })
}

export async function getAllOrders() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), shipments(*, tracking_events(*))')
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data
      }
    } catch (e) {
      console.warn('Supabase getAllOrders error', e)
    }
  }

  return getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
}

export async function updateOrderStatus(orderId, orderNumber, newStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      const nowIso = new Date().toISOString()
      const isUUID = orderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(orderId).trim())
      const cleanNum = String(orderNumber || orderId || '').replace(/^#\s*/, '').trim()

      let q = supabase.from('orders').update({
        status: newStatus,
        updated_at: nowIso,
      })

      if (isUUID) {
        await q.eq('id', orderId)
      } else if (cleanNum) {
        await q.or(`order_number.eq.${cleanNum},order_number.eq.#${cleanNum}`)
      }
    } catch (e) {
      console.warn('Supabase updateOrderStatus error', e)
    }
  }
}

export async function deleteOrder(orderId, orderNumber) {
  const isUUID = orderId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(orderId).trim())
  const cleanNum = String(orderNumber || orderId || '').replace(/^#\s*/, '').trim()

  if (isSupabaseConfigured && supabase) {
    try {
      if (isUUID) {
        await supabase.from('orders').delete().eq('id', orderId)
      }
      if (cleanNum) {
        await supabase.from('orders').delete().or(`order_number.eq.${cleanNum},order_number.eq.#${cleanNum}`)
      }
    } catch (e) {
      console.warn('Supabase deleteOrder error', e)
    }
  }

  // Also remove from local storage cache
  try {
    const orders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
    const updated = orders.filter((o) => {
      const matchNum = o.order_number?.toUpperCase() === cleanNum.toUpperCase() || o.id === orderId
      return !matchNum
    })
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, updated)
  } catch (e) {}

  return true
}

// ── 3. SIMULATE / ADVANCE ORDER STATUS (For Live Testing & Demos) ──
export function advanceOrderStatus(orderNumber) {
  const orders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
  const index = orders.findIndex((o) => o.order_number === orderNumber)
  if (index === -1) return null

  const order = orders[index]
  const stages = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']
  const currentIndex = stages.indexOf(order.status)
  
  if (currentIndex < stages.length - 1) {
    const nextStatus = stages[currentIndex + 1]
    order.status = nextStatus
    if (order.shipment) {
      order.shipment.status = nextStatus
    }

    const activityMap = {
      PACKED: { activity: 'Jewellery piece carefully inspected, certified, and sealed in signature velvet gift box', location: 'Smiths Fulfillment Hub, Bengaluru' },
      SHIPPED: { activity: 'Handed over to courier partner (Delhivery Air)', location: 'Bengaluru Sort Facility' },
      IN_TRANSIT: { activity: 'Package in transit between distribution hubs', location: 'National Sorting Center' },
      OUT_FOR_DELIVERY: { activity: 'Out for delivery with courier delivery executive', location: order.shipping_address?.city || 'Local Delivery Hub' },
      DELIVERED: { activity: 'Delivered to customer. Signature verified', location: order.shipping_address?.city || 'Destination Address' },
    }

    const newEvt = {
      id: 'evt-' + Date.now(),
      status: nextStatus,
      activity: activityMap[nextStatus]?.activity || 'Package status updated',
      location: activityMap[nextStatus]?.location || 'Courier Network',
      event_time: new Date().toISOString(),
    }

    order.tracking_events = [...(order.tracking_events || []), newEvt]
    order.updated_at = new Date().toISOString()
    orders[index] = order
    setLocalData(LOCAL_STORAGE_ORDERS_KEY, orders)
    return order
  }

  return order
}

// ── 4. CUSTOMER PROFILE & AUTH STATE ──
const authListeners = new Set()

export function getCurrentCustomer() {
  return getLocalData(LOCAL_STORAGE_USER_KEY, null)
}

export function saveCustomerProfile(user) {
  const prev = getLocalData(LOCAL_STORAGE_USER_KEY, null)
  setLocalData(LOCAL_STORAGE_USER_KEY, user)
  const hasChanged =
    !prev ||
    !user ||
    prev.id !== user.id ||
    prev.email !== user.email ||
    prev.name !== user.name ||
    prev.phone !== user.phone ||
    prev.avatar_url !== user.avatar_url
  if (hasChanged) {
    authListeners.forEach((fn) => {
      try { fn(user) } catch (e) {}
    })
  }
  return user
}

export async function logoutCustomer() {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
  authListeners.forEach((fn) => {
    try { fn(null) } catch (e) {}
  })
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signout error', e)
    }
  }
}

// Helper to guarantee a valid RFC4122 v4 UUID
function getValidUUID(id) {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── 5. CUSTOMER SAVED ADDRESSES ──
export async function getUserAddresses(userId = null) {
  let effectiveUserId = userId
  if (!effectiveUserId) {
    const cust = getCurrentCustomer()
    effectiveUserId = cust?.id
  }
  if (!effectiveUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      effectiveUserId = session?.user?.id
    } catch (e) {}
  }
  if (!effectiveUserId) {
    effectiveUserId = 'guest'
  }

  const storageKey = `${LOCAL_STORAGE_ADDRESSES_KEY}_${effectiveUserId}`
  const localAddrs = getLocalData(storageKey, [])

  // If Supabase is configured and we have a valid UUID user_id
  if (
    isSupabaseConfigured &&
    supabase &&
    effectiveUserId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
  ) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        if (data.length > 0) {
          setLocalData(storageKey, data)
          return data
        } else if (localAddrs.length > 0) {
          // Sync any unsynced local addresses up to Supabase
          for (const addr of localAddrs) {
            try {
              await supabase.from('addresses').upsert({
                ...addr,
                id: getValidUUID(addr.id),
                user_id: effectiveUserId,
              })
            } catch (syncErr) {}
          }
          return localAddrs
        }
        return []
      }
      if (error) {
        console.warn('Supabase addresses query error:', error.message)
      }
    } catch (e) {
      console.warn('Failed to fetch addresses from Supabase, fallback to local', e)
    }
  }

  return localAddrs
}

export async function saveUserAddress(addressData, userId = null) {
  const currentUser = getCurrentCustomer()
  let effectiveUserId = userId
  if (!effectiveUserId) {
    effectiveUserId = currentUser?.id
  }
  if (!effectiveUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      effectiveUserId = session?.user?.id
    } catch (e) {}
  }
  if (!effectiveUserId) {
    effectiveUserId = 'guest'
  }

  const storageKey = `${LOCAL_STORAGE_ADDRESSES_KEY}_${effectiveUserId}`
  const localAddrs = getLocalData(storageKey, [])

  const addressId = getValidUUID(addressData.id)

  const newAddress = {
    id: addressId,
    user_id:
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
        ? effectiveUserId
        : null,
    full_name: addressData.full_name || addressData.fullName || '',
    phone: addressData.phone || '',
    street_address:
      addressData.street_address || addressData.streetAddress || addressData.street || '',
    landmark: addressData.landmark || '',
    city: addressData.city || '',
    state: addressData.state || 'Maharashtra',
    pincode: addressData.pincode || '',
    is_default: addressData.is_default ?? localAddrs.length === 0,
    delivery_instructions:
      addressData.delivery_instructions || addressData.deliveryInstructions || '',
    created_at: addressData.created_at || new Date().toISOString(),
  }

  // If this address is set to default, set others to false
  let updatedList = localAddrs
  if (newAddress.is_default) {
    updatedList = updatedList.map((a) => ({ ...a, is_default: false }))
  }

  const existingIndex = updatedList.findIndex((a) => a.id === addressId)
  if (existingIndex >= 0) {
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...newAddress }
  } else {
    updatedList = [newAddress, ...updatedList]
  }

  setLocalData(storageKey, updatedList)

  // Sync to Supabase if configured and valid UUID user
  if (
    isSupabaseConfigured &&
    supabase &&
    newAddress.user_id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newAddress.user_id)
  ) {
    try {
      // Ensure user profile exists in public.profiles table to prevent foreign key issues
      await supabase.from('profiles').upsert(
        {
          id: newAddress.user_id,
          full_name: currentUser?.name || newAddress.full_name || undefined,
          email: currentUser?.email || undefined,
          phone: currentUser?.phone || newAddress.phone || undefined,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      if (newAddress.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', newAddress.user_id)
      }

      const { data, error } = await supabase
        .from('addresses')
        .upsert(newAddress)
        .select()
        .single()

      if (!error && data) {
        const serverIdx = updatedList.findIndex((a) => a.id === data.id || a.id === addressId)
        if (serverIdx >= 0) updatedList[serverIdx] = data
        else updatedList = [data, ...updatedList]
        setLocalData(storageKey, updatedList)
        return data
      }
      if (error) {
        console.warn('Supabase address upsert warning:', error.message)
      }
    } catch (e) {
      console.warn('Supabase address upsert exception:', e)
    }
  }

  return newAddress
}

export async function deleteUserAddress(addressId, userId = null) {
  const effectiveUserId = userId || getCurrentCustomer()?.id || 'guest'
  const storageKey = `${LOCAL_STORAGE_ADDRESSES_KEY}_${effectiveUserId}`
  const localAddrs = getLocalData(storageKey, [])

  const nextList = localAddrs.filter((a) => a.id !== addressId)
  if (nextList.length > 0 && !nextList.some((a) => a.is_default)) {
    nextList[0].is_default = true
  }
  setLocalData(storageKey, nextList)

  if (
    isSupabaseConfigured &&
    supabase &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(addressId)
  ) {
    try {
      await supabase.from('addresses').delete().eq('id', addressId)
    } catch (e) {
      console.warn('Supabase delete address error:', e)
    }
  }

  return nextList
}

export async function setDefaultUserAddress(addressId, userId = null) {
  const effectiveUserId = userId || getCurrentCustomer()?.id || 'guest'
  const storageKey = `${LOCAL_STORAGE_ADDRESSES_KEY}_${effectiveUserId}`
  const localAddrs = getLocalData(storageKey, [])

  const nextList = localAddrs.map((a) => ({
    ...a,
    is_default: a.id === addressId,
  }))
  setLocalData(storageKey, nextList)

  if (
    isSupabaseConfigured &&
    supabase &&
    effectiveUserId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
  ) {
    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', effectiveUserId)

      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
    } catch (e) {
      console.warn('Supabase setDefaultUserAddress error:', e)
    }
  }

  return nextList
}

// ── Google OAuth Sign-in (Native Centered Popup Flow) ──
export async function signInWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    const redirectUrl = `${window.location.origin}/auth/callback`

    // Pre-calculate centered popup coordinates
    const width = 500
    const height = 650
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // 1. Open native browser popup window immediately on user click
    const popup = window.open(
      'about:blank',
      'GoogleSignInPopup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,toolbar=no,menubar=no`
    )

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        if (popup && !popup.closed) popup.close()
        throw error
      }

      if (data?.url) {
        if (popup && !popup.closed) {
          popup.location.href = data.url
          popup.focus()
        } else {
          // Fallback if popup was blocked
          window.location.href = data.url
        }
      }

      // Wait for auth completion via postMessage or popup closing
      return new Promise((resolve) => {
        let resolved = false

        const handleMessage = (event) => {
          if (event.origin !== window.location.origin) return
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            resolved = true
            window.removeEventListener('message', handleMessage)
            clearInterval(pollTimer)
            resolve(event.data.profile)
          }
        }
        window.addEventListener('message', handleMessage)

        const pollTimer = setInterval(async () => {
          if (!popup || popup.closed) {
            clearInterval(pollTimer)
            window.removeEventListener('message', handleMessage)
            if (!resolved) {
              // Check session in case popup closed right after redirect
              try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                  const u = session.user
                  const profile = {
                    id: u.id,
                    name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Google User',
                    email: u.email,
                    avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                    provider: 'google',
                    created_at: new Date().toISOString(),
                  }
                  saveCustomerProfile(profile)
                  resolve(profile)
                  return
                }
              } catch (e) {}
              resolve(null)
            }
          }
        }, 500)
      })
    } catch (err) {
      if (popup && !popup.closed) popup.close()
      throw err
    }
  }

  // Fallback demo simulation if Supabase is offline
  const mockGoogleUser = {
    id: 'google-cust-' + Date.now(),
    name: 'Google Collector',
    email: 'collector@gmail.com',
    phone: '',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    provider: 'google',
    created_at: new Date().toISOString(),
  }
  saveCustomerProfile(mockGoogleUser)
  return mockGoogleUser
}

// ── Email & Password Sign-in (With Seamless Auto-Signup for New Users) ──
export async function signInWithEmail(email, password) {
  const cleanEmail = email.trim().toLowerCase()

  if (isSupabaseConfigured && supabase) {
    // 1. Try regular password sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    })

    if (!signInError && signInData?.user) {
      const u = signInData.user
      const profile = {
        id: u.id,
        name: u.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: u.email,
        phone: u.user_metadata?.phone || '',
        provider: 'email',
        created_at: u.created_at || new Date().toISOString(),
      }
      saveCustomerProfile(profile)

      // Ensure record exists in public.profiles table
      try {
        await supabase.from('profiles').upsert({
          id: u.id,
          full_name: profile.name,
          email: profile.email,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.warn('Profiles table sync warning:', err)
      }

      return profile
    }

    // 2. If sign-in failed: user might not be registered yet -> auto sign-up
    if (signInError) {
      console.log('Sign in attempt failed, checking if user is new for auto sign-up:', signInError.message)
      const defaultName = cleanEmail.split('@')[0]

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: defaultName,
            phone: '',
          },
        },
      })

      // Check if user was ALREADY registered (meaning password was incorrect)
      const isAlreadyRegistered =
        signUpError?.message?.toLowerCase().includes('already registered') ||
        signUpError?.message?.toLowerCase().includes('already exists') ||
        signUpError?.status === 422 ||
        (signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0)

      if (isAlreadyRegistered) {
        // User exists, so the original invalid credentials error is appropriate
        throw new Error(signInError.message || 'Invalid login credentials. Please check your password.')
      }

      // If sign-up returned another error (e.g. password too short)
      if (signUpError) {
        throw signUpError
      }

      // Auto sign-up succeeded! New user registered and added to database
      if (signUpData?.user) {
        const newUser = signUpData.user
        const newProfile = {
          id: newUser.id,
          name: defaultName,
          email: newUser.email,
          phone: '',
          provider: 'email',
          created_at: new Date().toISOString(),
        }
        saveCustomerProfile(newProfile)

        // Add user record into Supabase public.profiles table
        try {
          await supabase.from('profiles').upsert({
            id: newUser.id,
            full_name: newProfile.name,
            email: newProfile.email,
            phone: newProfile.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } catch (err) {
          console.warn('Profiles table auto sign-up upsert warning:', err)
        }

        return newProfile
      }
    }
  }

  // Fallback local signin
  const fallback = {
    id: 'cust-' + Math.random().toString(36).substring(2, 9),
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: '',
    provider: 'email',
    created_at: new Date().toISOString(),
  }
  saveCustomerProfile(fallback)
  return fallback
}

// ── Email & Password Sign-up ──
export async function signUpWithEmail(email, password, fullName, phone) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = fullName?.trim() || cleanEmail.split('@')[0]
  const cleanPhone = phone?.trim() || ''

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
        },
      },
    })
    if (error) throw error
    if (data?.user) {
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }

      const profile = {
        id: data.user.id,
        name: cleanName,
        email: data.user.email,
        phone: cleanPhone || data.user.user_metadata?.phone || '',
        provider: 'email',
        created_at: new Date().toISOString(),
      }
      saveCustomerProfile(profile)

      // Sync into public.profiles table
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: profile.name,
          email: profile.email,
          phone: profile.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.warn('Profiles table upsert error', err)
      }

      return profile
    }
  }

  // Fallback local registration
  const fallback = {
    id: 'cust-' + Math.random().toString(36).substring(2, 9),
    name: cleanName || 'Collector',
    email: cleanEmail,
    phone: cleanPhone,
    provider: 'email',
    created_at: new Date().toISOString(),
  }
  saveCustomerProfile(fallback)
  return fallback
}

// ── Realtime Auth Listener ──
export function initAuthListener(onUserChange) {
  if (!onUserChange) return () => {}
  authListeners.add(onUserChange)

  // 1. Immediately provide cached customer profile asynchronously to avoid re-render loops
  const current = getCurrentCustomer()
  if (current) {
    setTimeout(() => {
      if (authListeners.has(onUserChange)) {
        try {
          onUserChange(current)
        } catch (e) {}
      }
    }, 0)
  }

  if (isSupabaseConfigured && supabase) {
    // 2. Validate/refresh Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user
        const profile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Collector',
          email: u.email,
          phone: u.user_metadata?.phone || '',
          avatar_url: u.user_metadata?.avatar_url || '',
          provider: u.app_metadata?.provider || 'email',
        }
        saveCustomerProfile(profile)
      }
    }).catch(() => {})

    // 3. Subscription for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user
        const profile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Collector',
          email: u.email,
          phone: u.user_metadata?.phone || '',
          avatar_url: u.user_metadata?.avatar_url || '',
          provider: u.app_metadata?.provider || 'email',
        }
        saveCustomerProfile(profile)
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
        authListeners.forEach((fn) => {
          try { fn(null) } catch (e) {}
        })
      }
    })

    return () => {
      authListeners.delete(onUserChange)
      subscription?.unsubscribe?.()
    }
  }

  return () => {
    authListeners.delete(onUserChange)
  }
}

// ── 6. PERSISTENT ACCOUNT CART ──
const LOCAL_STORAGE_CART_KEY = 'smiths_jewellery_cart'

export function getLocalCart() {
  const current = getCurrentCustomer()
  let cart = []
  if (current?.id) {
    const userCart = getLocalData(`${LOCAL_STORAGE_CART_KEY}_${current.id}`, null)
    if (userCart && Array.isArray(userCart) && userCart.length > 0) {
      cart = userCart
    }
  }
  if (cart.length === 0) {
    cart = getLocalData(LOCAL_STORAGE_CART_KEY, [])
  }
  return cart.map((item) => {
    const isShirt = typeof item.image === 'string' && item.image.includes('photo-1618354691373-d851c5c3a990')
    if (isShirt || !item.image) {
      const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(item.id) || m.slug === item.slug || (item.name && m.name && m.name.toLowerCase() === item.name.toLowerCase()))
      const authenticCover = mock?.image || DEFAULT_JEWELLERY_IMAGE
      const authenticGallery = mock?.gallery || [authenticCover]
      return {
        ...item,
        image: authenticCover,
        gallery: authenticGallery,
      }
    }
    return item
  })
}

export function saveLocalCart(items) {
  setLocalData(LOCAL_STORAGE_CART_KEY, items)
  const current = getCurrentCustomer()
  if (current?.id) {
    setLocalData(`${LOCAL_STORAGE_CART_KEY}_${current.id}`, items)
  }
}

export async function saveCartToAccount(items, userId = null) {
  saveLocalCart(items)

  let effectiveUserId = userId
  if (!effectiveUserId) {
    effectiveUserId = getCurrentCustomer()?.id
  }
  if (!effectiveUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      effectiveUserId = session?.user?.id
    } catch (e) {}
  }

  if (effectiveUserId) {
    setLocalData(`${LOCAL_STORAGE_CART_KEY}_${effectiveUserId}`, items)

    if (
      isSupabaseConfigured &&
      supabase &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
    ) {
      try {
        await supabase
          .from('profiles')
          .update({
            cart_data: items,
            updated_at: new Date().toISOString(),
          })
          .eq('id', effectiveUserId)
      } catch (err) {
        console.warn('Supabase cart_data update error:', err)
      }
    }
  }
}

export async function loadAccountCart(userId = null) {
  let effectiveUserId = userId
  if (!effectiveUserId) {
    effectiveUserId = getCurrentCustomer()?.id
  }
  if (!effectiveUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      effectiveUserId = session?.user?.id
    } catch (e) {}
  }

  let cached = []
  if (effectiveUserId) {
    cached = getLocalData(`${LOCAL_STORAGE_CART_KEY}_${effectiveUserId}`, [])
  }
  if (cached.length === 0) {
    cached = getLocalData(LOCAL_STORAGE_CART_KEY, [])
  }

  const sanitizeItems = (items) => {
    if (!Array.isArray(items)) return []
    return items.map((item) => {
      const isShirt = typeof item.image === 'string' && item.image.includes('photo-1618354691373-d851c5c3a990')
      if (isShirt || !item.image) {
        const mock = MOCK_PRODUCTS.find((m) => String(m.id) === String(item.id) || m.slug === item.slug || (item.name && m.name && m.name.toLowerCase() === item.name.toLowerCase()))
        const authenticCover = mock?.image || DEFAULT_JEWELLERY_IMAGE
        const authenticGallery = mock?.gallery || [authenticCover]
        return {
          ...item,
          image: authenticCover,
          gallery: authenticGallery,
        }
      }
      return item
    })
  }

  if (
    isSupabaseConfigured &&
    supabase &&
    effectiveUserId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId)
  ) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('cart_data')
        .eq('id', effectiveUserId)
        .maybeSingle()

      if (!error && data?.cart_data && Array.isArray(data.cart_data)) {
        const sanitized = sanitizeItems(data.cart_data)
        if (sanitized.length > 0) {
          saveLocalCart(sanitized)
          setLocalData(`${LOCAL_STORAGE_CART_KEY}_${effectiveUserId}`, sanitized)
          return sanitized
        } else if (cached.length > 0) {
          const sanitizedCached = sanitizeItems(cached)
          await saveCartToAccount(sanitizedCached, effectiveUserId)
          return sanitizedCached
        }
      }
    } catch (err) {
      console.warn('Supabase loadAccountCart error:', err)
    }
  }

  return sanitizeItems(cached)
}

// ── 7. USER ORDERS QUERY (List all orders for logged-in user) ──
export async function getUserOrders(user = null) {
  let current = user
  if (!current) {
    current = getCurrentCustomer()
  }

  const userId = current?.id
  const email = current?.email?.trim().toLowerCase()
  const phone = current?.phone?.replace(/[^0-9]/g, '')

  let supabaseOrders = []
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), shipments(*, tracking_events(*))')
        .order('created_at', { ascending: false })

      const orFilters = []
      if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        orFilters.push(`user_id.eq.${userId}`)
      }
      if (email) {
        orFilters.push(`customer_email.ilike.${email}`)
      }
      if (phone && phone.length >= 10) {
        orFilters.push(`customer_phone.ilike.%${phone.slice(-10)}%`)
      }

      if (orFilters.length > 0) {
        const { data, error } = await query.or(orFilters.join(','))
        if (!error && data && Array.isArray(data)) {
          supabaseOrders = data
        }
      }
    } catch (e) {
      console.warn('Supabase getUserOrders error', e)
    }
  }

  // Also combine with localStorage orders
  const localOrders = getLocalData(LOCAL_STORAGE_ORDERS_KEY, [])
  const matchedLocal = localOrders.filter((o) => {
    if (!current) return true
    if (userId && o.user_id === userId) return true
    if (email && o.customer_email?.toLowerCase() === email) return true
    if (phone && o.customer_phone?.replace(/[^0-9]/g, '').includes(phone.slice(-10))) return true
    return false
  })

  // Deduplicate by order_number
  const orderMap = new Map()
  for (const o of supabaseOrders) {
    if (o.order_number) orderMap.set(o.order_number, o)
  }
  for (const o of matchedLocal) {
    if (o.order_number && !orderMap.has(o.order_number)) {
      orderMap.set(o.order_number, o)
    }
  }

  return Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
}

// ── 8. AUTOMATED ADMIN NOTIFICATIONS (INSTANT GMAIL & WHATSAPP) ──
const LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY = 'smiths_admin_notification_settings'
export const DEFAULT_ADMIN_WHATSAPP = '918530085116'
export const DEFAULT_ADMIN_EMAIL = 'digitalfreedomhub5116@gmail.com'

/**
 * Fetch Admin Notification Settings from Supabase admin_settings table or localStorage
 */
export async function getAdminNotificationSettings() {
  const fallback = {
    email_enabled: true,
    admin_email: DEFAULT_ADMIN_EMAIL,
    whatsapp_enabled: true,
    whatsapp_phone: DEFAULT_ADMIN_WHATSAPP,
    callmebot_api_key: '',
  }

  const local = getLocalData(LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY, null)
  let current = local ? { ...fallback, ...local } : fallback

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle()

      if (!error && data) {
        current = {
          email_enabled: data.email_enabled ?? true,
          admin_email: data.admin_email || DEFAULT_ADMIN_EMAIL,
          whatsapp_enabled: data.whatsapp_enabled ?? true,
          whatsapp_phone: data.whatsapp_phone || DEFAULT_ADMIN_WHATSAPP,
          callmebot_api_key: data.callmebot_api_key || '',
        }
        setLocalData(LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY, current)
      }
    } catch (e) {
      console.warn('Error reading admin notification settings from Supabase:', e)
    }
  }

  return current
}

/**
 * Save Admin Notification Settings to Supabase and localStorage
 */
export async function saveAdminNotificationSettings(newSettings) {
  const rawPhone = String(newSettings.whatsapp_phone || DEFAULT_ADMIN_WHATSAPP).replace(/[^0-9]/g, '')
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone.startsWith('0') && rawPhone.length === 11 ? `91${rawPhone.slice(1)}` : rawPhone
  const cleanEmail = String(newSettings.admin_email || DEFAULT_ADMIN_EMAIL).trim()

  const payload = {
    email_enabled: newSettings.email_enabled ?? true,
    admin_email: cleanEmail || DEFAULT_ADMIN_EMAIL,
    whatsapp_enabled: newSettings.whatsapp_enabled ?? true,
    whatsapp_phone: cleanPhone || DEFAULT_ADMIN_WHATSAPP,
    callmebot_api_key: String(newSettings.callmebot_api_key || '').trim(),
  }

  // 1. Save locally for instant reactivity
  setLocalData(LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY, payload)

  // 2. Persist globally to Supabase admin_settings
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('admin_settings')
        .upsert({
          id: 'default',
          email_enabled: payload.email_enabled,
          admin_email: payload.admin_email,
          whatsapp_enabled: payload.whatsapp_enabled,
          whatsapp_phone: payload.whatsapp_phone,
          callmebot_api_key: payload.callmebot_api_key,
          updated_at: new Date().toISOString(),
        })
    } catch (e) {
      console.warn('Error saving admin notification settings to Supabase:', e)
    }
  }

  return payload
}

/**
 * Formats a clean, professional WhatsApp alert for new orders
 */
export function formatOrderWhatsAppMessage(order) {
  const orderNum = order.order_number || 'N/A'
  const custName = order.customer_name || 'Valued Customer'
  const custPhone = order.customer_phone || 'N/A'
  const addr = order.shipping_address || {}
  const cityState = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
  const streetAddr = [addr.address_line, addr.landmark].filter(Boolean).join(', ')

  // Format line items
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : []
  const itemsText = items.length > 0
    ? items.map((it) => `• ${it.quantity || 1}x ${it.name || it.product_name || 'Silver Jewellery Piece'} (₹${it.price || 0})`).join('\n')
    : '• 1x Silver Piece'

  const total = order.total_amount || order.subtotal || 0
  const isPrepaid = order.payment_method === 'PREPAID' || !!order.razorpay_payment_id
  const paymentMode = order.payment_method === 'COD'
    ? '💵 Cash on Delivery (COD)'
    : `💳 Prepaid - Razorpay Verified${order.razorpay_payment_id ? ` (Ref: ${order.razorpay_payment_id})` : ''}`
  const timeStr = new Date(order.created_at || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  // Deep-link to admin panel orders tab filtered to this order
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://smithsjewellery.com'
  const adminUrl = `${origin}/admin-panel-access?tab=orders&search=${encodeURIComponent(orderNum)}`

  return (
    `🚨 *NEW ORDER RECEIVED - Smiths Jewellery* 🚨\n\n` +
    `📦 *Order:* ${orderNum}\n` +
    `👤 *Customer:* ${custName}\n` +
    `📞 *Phone:* ${custPhone}\n` +
    `📍 *Location:* ${cityState || 'India'}\n` +
    `🏠 *Address:* ${streetAddr || 'See Admin Panel'}\n\n` +
    `🛍️ *Items Ordered:*\n${itemsText}\n\n` +
    `💰 *Total Amount:* ₹${total}\n` +
    `💳 *Payment:* ${paymentMode}\n` +
    `⏰ *Time:* ${timeStr}\n\n` +
    `⚡ *Action: Generate AWB & Ship:*\n${adminUrl}`
  )
}

/**
 * 100% Automated WhatsApp notification to admin on order placement.
 * Runs in the background without any customer delay or friction.
 */
export async function sendAdminOrderNotification(order) {
  try {
    const settings = await getAdminNotificationSettings()
    if (!settings.whatsapp_enabled) {
      console.log('[WhatsApp Alert] WhatsApp notifications disabled in settings.')
      return { success: false, reason: 'disabled' }
    }

    const raw = String(settings.whatsapp_phone || DEFAULT_ADMIN_WHATSAPP).replace(/[^0-9]/g, '')
    const cleanPhone = raw.length === 10 ? `91${raw}` : raw.startsWith('0') && raw.length === 11 ? `91${raw.slice(1)}` : raw
    const apiKey = settings.callmebot_api_key

    if (!apiKey) {
      console.warn('[WhatsApp Alert] CallMeBot API key is not configured yet in Admin Settings.')
      return { success: false, reason: 'missing_api_key' }
    }

    const message = formatOrderWhatsAppMessage(order)

    // 1. Try Supabase Edge Function first (server-side, no CORS limitations)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            phone: cleanPhone,
            apiKey: apiKey,
            message: message,
          },
        })

        if (!error && data?.success) {
          console.log(`[WhatsApp Alert] Sent to admin (+${cleanPhone}) via Supabase Edge Function!`)
          return { success: true, via: 'edge_function', data }
        } else if (error) {
          console.warn('[WhatsApp Alert] Edge Function returned error, trying direct gateway:', error)
        }
      } catch (fe) {
        console.warn('[WhatsApp Alert] Edge Function invocation failed, trying direct gateway:', fe)
      }
    }

    // 2. Direct browser fetch fallback (mode: 'no-cors' allows opaque background trigger)
    const directUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`
    await fetch(directUrl, { mode: 'no-cors' })
    console.log(`[WhatsApp Alert] Sent to admin (+${cleanPhone}) via direct gateway`)
    return { success: true, via: 'direct_gateway' }
  } catch (err) {
    console.error('[WhatsApp Alert] Unexpected notification error:', err)
    return { success: false, error: err }
  }
}

/**
 * Send a live test notification to verify CallMeBot credentials
 */
export async function sendTestWhatsAppNotification(phone, apiKey) {
  const raw = String(phone || DEFAULT_ADMIN_WHATSAPP).replace(/[^0-9]/g, '')
  const cleanPhone = raw.length === 10 ? `91${raw}` : raw.startsWith('0') && raw.length === 11 ? `91${raw.slice(1)}` : raw

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Please enter your CallMeBot API Key to test WhatsApp notifications.')
  }

  const testMessage =
    `✅ *Smiths Jewellery WhatsApp Notification Connected!*\n\n` +
    `🎉 Your automated order alert system is now active.\n` +
    `Whenever a customer places an order, you will receive full customer details, ordered products, and a direct link to generate the AWB.\n\n` +
    `📱 Admin Phone: +${cleanPhone}\n` +
    `⏰ Connected At: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`

  // Use Supabase Edge Function to read response and report back to UI
  const edgeUrl = 'https://znvqgluajmxgdvyfnkzu.supabase.co/functions/v1/send-whatsapp-notification'
  const res = await fetch(edgeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: cleanPhone,
      apiKey: apiKey.trim(),
      message: testMessage,
    }),
  })

  const json = await res.json()
  if (!res.ok || !json.success) {
    const errorDetail = json?.response?.replace(/<[^>]*>?/gm, '') || json?.error || 'Failed to send WhatsApp message.'
    throw new Error(errorDetail)
  }

  return json
}

/**
 * 100% Automated instant notification email to admin's Gmail on order placement.
 * Runs in the background without any customer delay or friction.
 */
export async function sendAdminOrderEmail(order) {
  try {
    const settings = await getAdminNotificationSettings()
    if (settings.email_enabled === false) {
      console.log('[Order Email] Email notifications are disabled in settings.')
      return { success: false, reason: 'disabled' }
    }

    const targetEmail = (settings.admin_email || DEFAULT_ADMIN_EMAIL).trim()
    if (!targetEmail) return { success: false, reason: 'no_email' }

    // 1. Try Supabase Edge Function first (server-side, avoids CORS, formats HTML)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('send-order-email', {
          body: {
            toEmail: targetEmail,
            order: order,
          },
        })

        if (!error && (data?.success || data?.result?.success)) {
          console.log(`[Order Email] Successfully sent alert to ${targetEmail} via Supabase Edge Function`)
          return { success: true, via: 'edge_function', data }
        }
      } catch (e) {
        console.warn('[Order Email] Edge function invocation error, falling back to direct:', e)
      }
    }

    // 2. Direct browser FormSubmit fallback
    const orderNum = order.order_number || 'SMT-' + Date.now().toString().slice(-4)
    const total = order.total_amount || order.subtotal || 0
    const razorpayId = order.razorpay_payment_id || order.razorpayPaymentId || ''
    const isPrepaid = order.payment_method === 'PREPAID' || !!razorpayId
    const paymentMode = order.payment_method === 'COD'
      ? 'Cash on Delivery (COD)'
      : `Prepaid (Razorpay Verified${razorpayId ? ` · Ref: ${razorpayId}` : ''})`
    const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : []
    const itemsText = items.length > 0
      ? items.map((i) => `• ${i.quantity || 1}x ${i.name || i.product_name || 'Silver Jewellery'} (₹${i.price || 0})`).join('\n')
      : '• 1x Silver Jewellery'
    const addr = order.shipping_address || {}
    const fullAddr = [addr.address_line, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://smithsjewellery.com'
    const adminLink = `${origin}/admin-panel-access?tab=orders&search=${encodeURIComponent(orderNum)}`

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `🚨 NEW ORDER #${orderNum} - ₹${total} (${isPrepaid ? 'PREPAID / PAID' : 'COD'}) - Smiths Jewellery`,
        _template: 'table',
        _captcha: 'false',
        'Order Number': orderNum,
        'Customer Name': order.customer_name || 'Valued Customer',
        'Customer Phone': order.customer_phone || 'N/A',
        'Delivery Address': fullAddr || 'See Admin Panel',
        'Items Ordered': itemsText,
        'Total Amount': `₹${total}`,
        'Payment Mode': paymentMode,
        ...(razorpayId ? { 'Razorpay Payment ID': razorpayId } : {}),
        'Payment Status': isPrepaid ? 'PAID (VERIFIED)' : 'PENDING (COD)',
        'Order Time': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        'Action - Generate AWB': adminLink,
      }),
    })

    const json = await res.json()
    console.log(`[Order Email] Dispatched to ${targetEmail} via FormSubmit`, json)
    return { success: json?.success === 'true' || json?.success === true, result: json }
  } catch (err) {
    console.error('[Order Email] Error dispatching email notification:', err)
    return { success: false, error: err }
  }
}

/**
 * Send a live test order alert email to verify the admin Gmail inbox
 */
export async function sendTestEmailNotification(email) {
  const targetEmail = (email || DEFAULT_ADMIN_EMAIL).trim()
  if (!targetEmail) {
    throw new Error('Please enter a valid recipient email address.')
  }

  const testOrder = {
    order_number: 'OFL-2026-TEST',
    customer_name: 'Aditya Roy (Test Customer)',
    customer_phone: '8530085116',
    shipping_address: {
      address_line: 'Flat 402, Royal Palms, Palm Beach Road',
      landmark: 'Near Oberoi Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400063',
    },
    items: [
      { name: 'Aura Silver Choker Necklace', quantity: 1, price: 1299 },
      { name: 'Celeste Silver Tennis Bracelet', quantity: 1, price: 1499 },
    ],
    subtotal: 2798,
    shipping_fee: 0,
    total_amount: 2798,
    payment_method: 'COD',
    created_at: new Date().toISOString(),
  }

  const edgeUrl = 'https://znvqgluajmxgdvyfnkzu.supabase.co/functions/v1/send-order-email'
  const res = await fetch(edgeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toEmail: targetEmail,
      order: testOrder,
    }),
  })

  const json = await res.json()
  return json
}

/**
 * Razorpay Public Live Key ID helper
 */
export function getRazorpayKeyId() {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TaCHL9GVg0Zcnb'
}



