/**
 * Smiths Jewellery Analytics & Event Tracking Engine
 * Integrates with:
 * 1. Supabase Database (Real-time live visitor and funnel data for Smiths Jewellery Admin Panel)
 * 2. Microsoft Clarity (Session recordings, heatmaps, AI summaries)
 */
import { supabase } from './supabase'

// Safely execute Clarity commands
export function clarityEvent(eventName) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('event', eventName)
    }
  } catch (e) {
    // Fail silently so tracking never disrupts user experience
  }
}

export function clarityTag(key, value) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function' && key && value !== undefined) {
      window.clarity('set', String(key), String(value))
    }
  } catch (e) {}
}

export function clarityIdentify(userId, sessionId, pageName) {
  try {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('identify', String(userId || 'anonymous'), String(sessionId || ''), String(pageName || ''))
    }
  } catch (e) {}
}

// ── SESSION & DEVICE UTILITIES ──

export function getSessionId() {
  if (typeof window === 'undefined') return 'server_session'
  try {
    let sid = sessionStorage.getItem('of_session_id')
    if (!sid) {
      sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8)
      sessionStorage.setItem('of_session_id', sid)
    }
    return sid
  } catch (e) {
    return 'fallback_sess'
  }
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') return { isMobile: false, device: 'Desktop' }
  const ua = navigator.userAgent || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  return {
    isMobile,
    device: isMobile ? 'Mobile' : 'Desktop',
    screenWidth: window.innerWidth,
    language: navigator.language || 'en',
  }
}

/**
 * Log event asynchronously into Supabase analytics_events table
 */
async function logDatabaseEvent(eventName, data = {}) {
  try {
    if (!supabase) return
    const sessionId = getSessionId()
    const deviceInfo = getDeviceInfo()
    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '/'

    await supabase.from('analytics_events').insert([
      {
        session_id: sessionId,
        event_name: eventName,
        page_path: pagePath,
        product_id: data.productId ? String(data.productId) : null,
        product_name: data.productName || null,
        metadata: {
          ...deviceInfo,
          ...data.metadata,
        },
      },
    ])
  } catch (err) {
    // Fail silently so customer browsing is never blocked
  }
}

// ── E-COMMERCE EVENT TRACKING FUNCTIONS ──

/**
 * Track page view across the store
 */
export function trackPageView(pagePath) {
  clarityTag('page_path', pagePath)
  clarityEvent('page_view')
  logDatabaseEvent('page_view', {
    metadata: { path: pagePath },
  })
}

/**
 * Track when a user views a specific product
 */
export function trackProductView(product) {
  if (!product) return
  const productName = product.fullName || product.name || 'Silver Jewellery Piece'
  clarityTag('product_viewed', productName)
  clarityTag('product_id', String(product.id || ''))
  clarityTag('product_price', String(product.price || 1299))
  if (product.genre) {
    clarityTag('product_genre', product.genre)
  }
  clarityEvent('view_product')

  logDatabaseEvent('product_view', {
    productId: product.id,
    productName: productName,
    metadata: {
      price: product.price || 1299,
      genre: product.genre || 'OTHER',
    },
  })
}

/**
 * Track when a user clicks "Add to Cart"
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return
  const productName = product.fullName || product.name || 'Silver Jewellery Piece'
  clarityTag('last_cart_item', productName)
  clarityTag('cart_qty', String(quantity))
  clarityEvent('add_to_cart')

  logDatabaseEvent('add_to_cart', {
    productId: product.id,
    productName: productName,
    metadata: {
      quantity,
      price: product.price || 1299,
      total: (Number(product.price || 1299)) * quantity,
    },
  })
}

/**
 * Track when a user clicks "BUY IT NOW"
 */
export function trackBuyNow(product, quantity = 1) {
  if (!product) return
  const productName = product.fullName || product.name || 'Silver Jewellery Piece'
  clarityTag('buy_now_product', productName)
  clarityTag('buy_now_qty', String(quantity))
  clarityTag('buy_now_price', String(Number(product.price || 1299) * quantity))
  clarityEvent('click_buy_now')

  logDatabaseEvent('buy_now', {
    productId: product.id,
    productName: productName,
    metadata: {
      quantity,
      price: product.price || 299,
      total: (Number(product.price || 299)) * quantity,
    },
  })
}

/**
 * Track checkout funnel progression
 * step: 1 = Address, 2 = Payment Selection, 3 = Confirmation
 */
export function trackCheckoutStep(stepNumber, stepName, extraData = {}) {
  const stepLabel = `step_${stepNumber}_${stepName}`
  clarityTag('checkout_current_step', stepLabel)
  if (extraData.itemCount) {
    clarityTag('checkout_item_count', String(extraData.itemCount))
  }
  if (extraData.totalAmount) {
    clarityTag('checkout_total_amount', String(extraData.totalAmount))
  }
  if (extraData.paymentMethod) {
    clarityTag('checkout_payment_method', extraData.paymentMethod)
  }
  clarityEvent(`checkout_${stepLabel}`)

  logDatabaseEvent(`checkout_step_${stepNumber}`, {
    metadata: {
      stepNumber,
      stepName,
      ...extraData,
    },
  })
}

/**
 * Track successful order completion
 */
export function trackOrderCompleted(order) {
  if (!order) return
  const orderNumber = order.order_number || order.id || 'UNKNOWN'
  const total = order.total_amount || order.totalAmount || 0
  const method = order.payment_method || order.paymentMethod || 'COD'

  clarityTag('completed_order_number', String(orderNumber))
  clarityTag('completed_order_total', String(total))
  clarityTag('completed_order_method', String(method))
  clarityEvent('order_completed')

  logDatabaseEvent('order_completed', {
    metadata: {
      orderNumber,
      total,
      method,
    },
  })
}

// ── AGGREGATION QUERY HELPER FOR ADMIN PANEL ──

/**
 * Fetches and computes real-time analytics for the Admin Panel
 * timeRange: 'today' | '7d' | '30d' | 'all'
 */
export async function fetchAnalyticsSummary(timeRange = 'today') {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not initialized',
    }
  }

  try {
    let query = supabase.from('analytics_events').select('*').order('created_at', { ascending: false })

    const now = new Date()
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      query = query.gte('created_at', startOfDay)
    } else if (timeRange === '7d') {
      const past7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', past7d)
    } else if (timeRange === '30d') {
      const past30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', past30d)
    }
    // 'all' doesn't add date filter, caps at 2000 events
    query = query.limit(2000)

    const { data: events, error } = await query

    if (error) throw error

    const list = events || []

    // 1. Distinct Sessions (Visitors)
    const uniqueSessions = new Set(list.map((e) => e.session_id))
    const totalVisitors = uniqueSessions.size

    // 2. Metrics count
    let pageViewsCount = 0
    let productViewsCount = 0
    let buyNowCount = 0
    let addToCartCount = 0
    const checkoutStep1Sessions = new Set()
    const checkoutStep2Sessions = new Set()
    const orderSessions = new Set()
    let ordersCount = 0

    // 3. Product stats
    const productStats = {}

    // 4. Device breakdown
    let mobileCount = 0
    let desktopCount = 0

    list.forEach((event) => {
      const evName = event.event_name
      const sess = event.session_id

      // Device
      if (event.metadata?.isMobile) {
        mobileCount++
      } else {
        desktopCount++
      }

      if (evName === 'page_view') {
        pageViewsCount++
      } else if (evName === 'product_view') {
        productViewsCount++
        const pName = event.product_name || 'Silver Jewellery Piece'
        if (!productStats[pName]) {
          productStats[pName] = { name: pName, productId: event.product_id, views: 0, buyNow: 0, addToCart: 0 }
        }
        productStats[pName].views++
      } else if (evName === 'buy_now') {
        buyNowCount++
        const pName = event.product_name || 'Silver Jewellery Piece'
        if (!productStats[pName]) {
          productStats[pName] = { name: pName, productId: event.product_id, views: 0, buyNow: 0, addToCart: 0 }
        }
        productStats[pName].buyNow++
      } else if (evName === 'add_to_cart') {
        addToCartCount++
        const pName = event.product_name || 'Silver Jewellery Piece'
        if (!productStats[pName]) {
          productStats[pName] = { name: pName, productId: event.product_id, views: 0, buyNow: 0, addToCart: 0 }
        }
        productStats[pName].addToCart++
      } else if (evName === 'checkout_step_1') {
        checkoutStep1Sessions.add(sess)
      } else if (evName === 'checkout_step_2') {
        checkoutStep2Sessions.add(sess)
      } else if (evName === 'order_completed') {
        ordersCount++
        orderSessions.add(sess)
      }
    })

    // Ranked products by view count
    const topProducts = Object.values(productStats).sort((a, b) => b.views - a.views)

    // Funnel Steps
    const checkoutIntentCount = buyNowCount + addToCartCount
    const step1Count = checkoutStep1Sessions.size
    const step2Count = checkoutStep2Sessions.size
    const completedOrdersCount = ordersCount

    const baseFunnel = Math.max(1, totalVisitors)
    const funnel = [
      {
        id: 'visitors',
        name: '1. Store Visitors',
        count: totalVisitors,
        pctOfTotal: 100,
        subtext: 'Unique visiting browser sessions',
      },
      {
        id: 'product_views',
        name: '2. Viewed Jewellery',
        count: productViewsCount,
        pctOfTotal: totalVisitors > 0 ? Math.min(100, Math.round((productViewsCount / baseFunnel) * 100)) : 0,
        subtext: 'Opened jewellery product pages',
      },
      {
        id: 'intent',
        name: '3. Clicked Buy Now / Cart',
        count: checkoutIntentCount,
        pctOfTotal: totalVisitors > 0 ? Math.min(100, Math.round((checkoutIntentCount / baseFunnel) * 100)) : 0,
        subtext: 'High purchase intent actions',
      },
      {
        id: 'address',
        name: '4. Reached Address (Step 1)',
        count: step1Count,
        pctOfTotal: totalVisitors > 0 ? Math.min(100, Math.round((step1Count / baseFunnel) * 100)) : 0,
        subtext: 'Started shipping address details',
      },
      {
        id: 'payment',
        name: '5. Reached Payment (Step 2)',
        count: step2Count,
        pctOfTotal: totalVisitors > 0 ? Math.min(100, Math.round((step2Count / baseFunnel) * 100)) : 0,
        subtext: 'Viewed COD vs Online discounts',
      },
      {
        id: 'purchased',
        name: '6. Orders Completed',
        count: completedOrdersCount,
        pctOfTotal: totalVisitors > 0 ? Math.min(100, Math.round((completedOrdersCount / baseFunnel) * 100)) : 0,
        subtext: 'Successfully placed orders',
      },
    ]

    // Conversion rate
    const conversionRate = totalVisitors > 0
      ? ((completedOrdersCount / totalVisitors) * 100).toFixed(1)
      : '0.0'

    // Device percentages
    const totalDevicePings = Math.max(1, mobileCount + desktopCount)
    const mobilePct = Math.round((mobileCount / totalDevicePings) * 100)
    const desktopPct = 100 - mobilePct

    return {
      success: true,
      data: {
        totalVisitors,
        pageViewsCount,
        productViewsCount,
        checkoutIntentCount,
        buyNowCount,
        addToCartCount,
        step1Count,
        step2Count,
        completedOrdersCount,
        conversionRate,
        funnel,
        topProducts,
        mobilePct,
        desktopPct,
        recentEvents: list.slice(0, 25),
        totalEventsRecorded: list.length,
      },
    }
  } catch (err) {
    console.error('Error in fetchAnalyticsSummary:', err)
    return {
      success: false,
      error: err.message || 'Failed to aggregate analytics',
    }
  }
}

export const getAnalyticsSummary = fetchAnalyticsSummary
