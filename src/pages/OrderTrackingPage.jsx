import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Check,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  User,
  Sparkles,
  Truck,
  MapPin,
  AlertCircle,
  XCircle,
  Headphones,
  RotateCcw
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import AuthModal from '../components/AuthModal'
import {
  getOrder,
  getOrdersByPhone,
  getUserOrders,
  getCurrentCustomer,
  initAuthListener
} from '../lib/db'

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOrderId = searchParams.get('orderId') || ''

  // Auth & User State
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer())
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Orders List State
  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Search State
  const [query, setQuery] = useState(initialOrderId)
  const [searchedOrder, setSearchedOrder] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // 6 Checkpoints matching Smiths Jewellery fulfillment pipeline
  const STAGES = [
    {
      key: 'PLACED',
      step: '01',
      label: 'Order Placed',
      desc: 'Order verified and securely registered in system',
      icon: CheckCircle2,
    },
    {
      key: 'CONFIRMED',
      step: '02',
      label: 'Confirmed & Crafted',
      desc: 'Jewellery piece handcrafted and polished with radiant rhodium luster',
      icon: Sparkles,
    },
    {
      key: 'PACKED',
      step: '03',
      label: 'Packed in Velvet Box',
      desc: 'Carefully inspected, sealed with authenticity certificate in signature midnight velvet box',
      icon: Package,
    },
    {
      key: 'SHIPPED',
      step: '04',
      label: 'Shipped & In Transit',
      desc: 'Handed over to courier partner',
      icon: Truck,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      step: '05',
      label: 'Out for Delivery',
      desc: 'Package is out with courier delivery executive for doorstep handover',
      icon: MapPin,
    },
    {
      key: 'DELIVERED',
      step: '06',
      label: 'Delivered',
      desc: 'Safely delivered to customer address',
      icon: Check,
    },
  ]

  const getStageIndex = (status) => {
    if (status === 'IN_TRANSIT') return 3
    const idx = STAGES.findIndex((s) => s.key === status)
    return idx >= 0 ? idx : 0
  }

  // Auth Listener
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setCurrentUser(user)
    })
    return () => unsub && unsub()
  }, [])

  // Load User Orders on Mount and when User changes
  const loadOrders = async (user = currentUser) => {
    setOrdersLoading(true)
    try {
      const orders = await getUserOrders(user)
      setUserOrders(orders || [])

      // Auto-sync cancellations from Shiprocket in background
      const openOrders = (orders || []).filter(
        (o) => o.status !== 'CANCELLED' && o.status !== 'CANCELED' && o.status !== 'DELIVERED'
      )
      if (openOrders.length > 0) {
        fetch('/api/generate-awb?action=sync')
          .then((r) => r.json())
          .then((syncData) => {
            if (syncData?.updated_cancellations?.length > 0) {
              getUserOrders(user).then((fresh) => {
                if (fresh) setUserOrders(fresh)
              })
            }
          })
          .catch(() => {})
      }
    } catch (e) {
      console.warn('Failed to load user orders:', e)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(currentUser)
  }, [currentUser])

  // Search Single Order (for guest or specific ID lookup)
  const fetchSingleOrder = async (idToSearch) => {
    if (!idToSearch) return
    setSearchLoading(true)
    setNotFound(false)

    try {
      let res = await getOrder(idToSearch)
      if (!res) {
        const byPhone = await getOrdersByPhone(idToSearch)
        if (byPhone.length > 0) res = byPhone[0]
      }

      if (res) {
        setSearchedOrder(res)

        // If order is active, trigger live status sync check with Shiprocket
        if (res.status !== 'CANCELLED' && res.status !== 'CANCELED' && res.status !== 'DELIVERED') {
          fetch(`/api/generate-awb?action=sync&orderId=${encodeURIComponent(res.order_number || res.id)}`)
            .then((r) => r.json())
            .then((syncData) => {
              if (syncData?.updated_cancellations?.length > 0) {
                getOrder(idToSearch).then((fresh) => {
                  if (fresh) setSearchedOrder(fresh)
                })
              }
            })
            .catch(() => {})
        }
      } else {
        setSearchedOrder(null)
        setNotFound(true)
      }
    } catch (e) {
      setNotFound(true)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderId) {
      setQuery(initialOrderId)
      fetchSingleOrder(initialOrderId)
    }
  }, [initialOrderId])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) {
      setSearchedOrder(null)
      setNotFound(false)
      setSearchParams({})
      return
    }
    setSearchParams({ orderId: query.trim() })
    fetchSingleOrder(query.trim())
  }

  // Unified list of orders to display (NEVER duplicate sections)
  const displayedOrders = (() => {
    const cleanQ = query.trim().toUpperCase()
    if (cleanQ) {
      const matched = userOrders.filter(
        (o) =>
          o.order_number?.toUpperCase().includes(cleanQ) ||
          (o.customer_phone && o.customer_phone.replace(/[^0-9]/g, '').includes(cleanQ))
      )
      if (matched.length > 0) return matched
      if (searchedOrder) return [searchedOrder]
      return []
    }
    // If no active search query, return all user orders
    return userOrders
  })()

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-cream-muted/60 mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-cream">Orders & Live Tracking</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold mb-3">
            <Truck className="h-3.5 w-3.5" /> Pan-India Live Logistics
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream tracking-tight">
            Orders & Live Tracking
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cream-muted/80">
            Track your handcrafted 925 sterling silver jewellery step-by-step from studio crafting to doorstep delivery.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cream-muted/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Order ID or Mobile No."
                className="w-full rounded-full border border-gold/30 bg-charcoal/80 pl-10 pr-4 py-3 text-xs sm:text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 shadow-lg shadow-black/50"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="btn-gold rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-50"
            >
              {searchLoading ? <RefreshCw className="h-4 w-4 animate-spin text-obsidian" /> : 'Track'}
            </button>
          </form>
        </div>

        {/* User Account Status Banner */}
        <div className="mb-8 rounded-2xl border border-gold/20 bg-charcoal/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              {currentUser ? (
                <>
                  <p className="text-sm font-bold text-cream truncate">
                    Orders for <span className="text-gold">{currentUser.name || currentUser.email}</span>
                  </p>
                  <p className="text-xs text-cream-muted/70 truncate">{currentUser.email}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-cream">Guest Collector</p>
                  <p className="text-xs text-cream-muted/70">
                    Sign in to automatically access and track all your past and active orders forever.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <span className="text-xs font-bold text-gold px-3 py-1 rounded-full bg-gold/15 border border-gold/30">
                {displayedOrders.length} {displayedOrders.length === 1 ? 'Order' : 'Orders'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-gold rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Sign In to View Orders
              </button>
            )}
          </div>
        </div>

        {/* Search Not Found State */}
        {notFound && !searchLoading && (
          <div className="mb-8 rounded-2xl border border-charcoal-light bg-charcoal/60 p-8 text-center max-w-md mx-auto">
            <Package className="h-12 w-12 text-cream-muted/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-cream">Order Not Found</h3>
            <p className="mt-1 text-xs text-cream-muted/70">
              We couldn't find an order matching "{query}". Please check your Order ID or phone number.
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            ALL YOUR ORDERS (SINGLE UNIFIED SECTION — ONE BELOW THE OTHER)
        ═════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-light/70">
            <h2 className="font-heading text-xl font-bold text-cream flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              <span>All Your Orders</span>
            </h2>
            {query.trim() && (
              <button
                onClick={() => {
                  setQuery('')
                  setSearchedOrder(null)
                  setNotFound(false)
                  setSearchParams({})
                }}
                className="text-xs text-gold hover:underline cursor-pointer"
              >
                Clear Search & Show All
              </button>
            )}
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="h-8 w-8 text-gold animate-spin mx-auto mb-3" />
              <p className="text-sm text-cream-muted">Loading your orders & live statuses...</p>
            </div>
          ) : displayedOrders.length === 0 && !notFound ? (
            /* Empty State */
            <div className="rounded-2xl border border-gold/20 bg-charcoal/60 p-10 text-center space-y-3">
              <ShoppingBag className="h-12 w-12 text-gold/60 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-cream">No orders placed yet</h3>
              <p className="text-xs text-cream-muted/70 max-w-sm mx-auto">
                Once you place an order for our 925 sterling silver jewellery, you can track every step of crafting, packing, and courier delivery here.
              </p>
              <Link
                to="/"
                className="btn-gold inline-flex items-center gap-2 mt-3 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                <span>Explore Collections</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* List of Orders One Below the Other */
            <div className="space-y-8">
              {displayedOrders.map((ord) => (
                <OrderCard
                  key={ord.order_number || ord.id}
                  order={ord}
                  STAGES={STAGES}
                  getStageIndex={getStageIndex}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

// ── COMPONENT: SINGLE ORDER CARD (One Below Other with Vertical Checkpoints) ──
function OrderCard({
  order,
  STAGES,
  getStageIndex
}) {
  const currentStageIndex = getStageIndex(order.status)
  const items = order.items || order.order_items || []
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Order'

  // Map status to badge color & label
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CANCELLED':
      case 'CANCELED':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-400',
          label: 'Cancelled by Seller',
        }
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          label: 'Delivered',
        }
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
          label: 'Out for Delivery',
        }
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300',
          label: 'Shipped & In Transit',
        }
      case 'PACKED':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          label: 'Packed in Tin Box',
        }
      case 'CONFIRMED':
        return {
          bg: 'bg-gold/20 border-gold/50 text-gold',
          label: 'Confirmed & Handcrafting',
        }
      case 'PLACED':
      default:
        return {
          bg: 'bg-gold/15 border-gold/30 text-gold',
          label: 'Order Placed',
        }
    }
  }

  const isCancelled =
    order.status === 'CANCELLED' ||
    order.status === 'CANCELED' ||
    String(order.status || '').toUpperCase().includes('CANCEL')

  let cancelDetails = null
  try {
    if (order.notes) {
      const parsed = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes
      if (parsed && (parsed.cancelled_at || parsed.cancellation_reason || parsed.cancellation_source)) {
        cancelDetails = parsed
      }
    }
  } catch (e) {}

  const badge = getStatusBadge(order.status)

  return (
    <div className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 ${
      isCancelled
        ? 'border-red-500/30 bg-charcoal/90 hover:border-red-500/50'
        : 'border-gold/25 bg-charcoal/80 hover:border-gold/45'
    }`}>
      {/* ── 1. Top Order Summary Header ── */}
      <div className="border-b border-charcoal-light/70 bg-obsidian/85 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-heading text-base font-extrabold text-cream tracking-wide">
            {order.order_number}
          </span>
          <span className="text-cream-muted/50">·</span>
          <span className="text-cream-muted/70">Placed {formattedDate}</span>
          <span className="text-cream-muted/50">·</span>
          <span className="text-cream-muted/80">Recipient: <strong className="text-cream">{order.customer_name}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-heading text-base font-bold text-gold">
            ₹{order.total_amount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-charcoal-light border border-charcoal-light text-cream-muted">
            {order.payment_method === 'PREPAID' ? 'Prepaid UPI' : 'COD'}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* ── 2. Product Items (Main Image, Full Name on Side, Status Below) ── */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-charcoal-light border border-gold/20 flex items-center justify-center text-gold">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-cream">Silver Jewellery Piece</h3>
                <p className="text-xs text-cream-muted">925 Sterling Silver</p>
              </div>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.product_id || item.id || idx}
                className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-charcoal-light/50"
              >
                {/* Main Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gold/30 bg-obsidian shrink-0 shadow-md">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || item.product_name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold bg-charcoal">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Side: Full Name of Product & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-cream tracking-tight truncate">
                      {item.name || item.product_name || 'Silver Jewellery Piece'}
                    </h3>
                    <span className="font-heading text-sm font-bold text-gold shrink-0">
                      ₹{item.price * (item.quantity || 1)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-cream-muted/70">
                    <span>Qty: <strong className="text-cream">{item.quantity || 1}</strong></span>
                    <span>·</span>
                    <span>₹{item.price} each</span>
                    <span>·</span>
                    <span className="text-gold font-medium">925 Sterling Silver</span>
                  </div>

                  {/* Below that: Status of the product */}
                  <div className="mt-3 pt-3 border-t border-charcoal-light/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {badge.label}
                      </span>
                      {isCancelled ? (
                        <span className="text-xs font-semibold text-red-400/90">
                          Cancelled on Shiprocket by Seller
                        </span>
                      ) : (
                        <span className="text-xs text-cream-muted/70">
                          {order.shipment?.estimated_delivery
                            ? `Est. Delivery: ${new Date(order.shipment.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
                            : 'Estimated Delivery: 3-4 Days'}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-cream-muted/50 font-mono">
                      Carrier: {order.shipment?.courier_partner || 'Shiprocket Express'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── 3. Checkpoints or Dedicated Cancellation Notice ── */}
        {isCancelled ? (
          <div className="pt-4 border-t border-red-500/20 space-y-6">
            {/* Prominent Red Cancellation & Refund Alert Card */}
            <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-charcoal/90 to-obsidian p-5 sm:p-6 shadow-xl shadow-red-950/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-base sm:text-lg font-bold text-red-300">
                      Order Cancelled by Seller
                    </h4>
                    <p className="text-xs text-cream-muted/70">
                      Merchant cancelled package dispatch on Shiprocket logistics hub
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Shipment Voided
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-cream-muted/50 uppercase tracking-wider text-[10px] font-semibold">
                    Cancellation Reason
                  </span>
                  <p className="text-cream font-medium">
                    {cancelDetails?.cancellation_reason || 'Seller cancelled shipment on Shiprocket courier portal'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-cream-muted/50 uppercase tracking-wider text-[10px] font-semibold">
                    Cancellation Time
                  </span>
                  <p className="text-cream font-medium">
                    {cancelDetails?.cancelled_at
                      ? new Date(cancelDetails.cancelled_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : formattedDate}
                  </p>
                </div>
              </div>

              {/* Refund Notice */}
              <div className="mt-4 p-3.5 rounded-xl bg-obsidian/80 border border-charcoal-light flex items-start gap-3">
                <RotateCcw className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  {order.payment_method === 'PREPAID' ? (
                    <p className="text-cream">
                      <strong className="text-gold">100% Refund Initiated:</strong> Your prepaid payment of <strong className="text-cream">₹{order.total_amount}</strong> has been refunded to your original payment method and will reflect in 3–5 business days.
                    </p>
                  ) : (
                    <p className="text-cream">
                      <strong className="text-cream">Cash on Delivery:</strong> No payment was collected. The order was cancelled before courier delivery.
                    </p>
                  )}
                </div>
              </div>

              {/* Help and Support */}
              <div className="mt-4 pt-3 border-t border-charcoal-light/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-cream-muted/60">
                  Questions regarding this cancellation?
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:support@smithsjewellery.com?subject=Help with Cancelled Order ${order.order_number}`}
                    className="inline-flex items-center gap-1.5 text-gold hover:underline font-semibold cursor-pointer"
                  >
                    <Headphones className="h-3.5 w-3.5" />
                    <span>Contact Studio Support</span>
                  </a>
                  <span className="text-cream-muted/30">·</span>
                  <Link
                    to="/"
                    className="text-cream hover:text-gold transition-colors font-semibold"
                  >
                    Explore Other Collections →
                  </Link>
                </div>
              </div>
            </div>

            {/* Cancelled Timeline State */}
            <div className="relative pl-3 sm:pl-4 space-y-6 pt-2">
              <div className="relative flex items-start gap-4 sm:gap-5">
                <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-gold text-obsidian font-bold flex items-center justify-center shrink-0 shadow-md shadow-gold/25">
                  <Check className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="pt-1">
                  <span className="font-mono text-xs text-gold font-bold italic">01</span>
                  <h5 className="font-heading text-sm font-bold text-cream">Order Placed</h5>
                  <p className="text-xs text-cream-muted/70">Order confirmed on Smiths Jewellery</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4 sm:gap-5">
                <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                  <XCircle className="h-5 w-5 animate-pulse" />
                </div>
                <div className="pt-1">
                  <span className="font-mono text-xs text-red-400 font-bold italic">02</span>
                  <h5 className="font-heading text-sm font-bold text-red-400">Cancelled by Seller on Shiprocket</h5>
                  <p className="text-xs text-cream-muted/70">
                    Dispatch stopped at fulfillment center. Live tracking halted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard 6-checkpoint pipeline */
          <div className="pt-4 border-t border-charcoal-light/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cream-muted/70 mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              <span>Fulfillment Pipeline</span>
            </h4>

            <div className="relative pl-3 sm:pl-4 space-y-6 sm:space-y-7">
              {/* Connected Vertical Progress Line */}
              <div className="absolute left-[23px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-charcoal-light">
                <div
                  className="w-full bg-gradient-to-b from-gold via-yellow-300 to-gold transition-all duration-700"
                  style={{
                    height: `${Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {STAGES.map((stage, idx) => {
                const isDone = idx <= currentStageIndex
                const isCurrent = idx === currentStageIndex
                const StageIcon = stage.icon || Check

                return (
                  <div key={stage.key} className="relative flex items-start gap-4 sm:gap-5 group">
                    {/* Glowing Node on Vertical Line */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCurrent
                            ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/35 shadow-xl shadow-gold/50 scale-105'
                            : isDone
                            ? 'bg-gold text-obsidian font-bold shadow-md shadow-gold/25'
                            : 'bg-charcoal border border-charcoal-light text-cream-muted/30'
                        }`}
                      >
                        {isDone && !isCurrent ? (
                          <Check className="h-5 w-5 stroke-[2.5]" />
                        ) : (
                          <StageIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                        )}
                      </div>
                    </div>

                    {/* Side Checkpoint Details: Step Number, Title, and Description */}
                    <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono text-xs sm:text-sm font-extrabold italic tracking-wider ${
                            isCurrent ? 'text-gold' : isDone ? 'text-gold/80' : 'text-cream-muted/30'
                          }`}
                        >
                          {stage.step}
                        </span>
                        <h5
                          className={`font-heading text-sm sm:text-base font-bold tracking-tight ${
                            isCurrent ? 'text-gold' : isDone ? 'text-cream' : 'text-cream-muted/50'
                          }`}
                        >
                          {stage.label}
                        </h5>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 shrink-0">
                            Active Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cream-muted/70 mt-1 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
