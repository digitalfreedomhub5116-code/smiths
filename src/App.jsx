import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useCartStore } from './store/cartStore'
import { trackPageView } from './lib/analytics'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import AdminPanelPage from './pages/AdminPanelPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmedPage from './pages/OrderConfirmedPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import ShippingPolicyPage from './pages/ShippingPolicyPage'

import { initAuthListener, loadAccountCart, initProductSync } from './lib/db'

function AnalyticsRouteTracker() {
  const location = useLocation()
  useEffect(() => {
    if (
      !location.pathname.startsWith('/admin') &&
      !location.pathname.startsWith('/auth') &&
      !location.pathname.startsWith('/smita')
    ) {
      trackPageView(location.pathname)
    }
  }, [location.pathname])
  return null
}

function CartRouteHandler() {
  const openCart = useCartStore((s) => s.openCart)
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/', { replace: true })
    const t = setTimeout(() => {
      openCart()
    }, 60)
    return () => clearTimeout(t)
  }, [openCart, navigate])
  return null
}

export default function App() {
  // Global products synchronization with Supabase & Realtime updates across devices
  useEffect(() => {
    const unsub = initProductSync((freshProducts) => {
      useCartStore.getState().setProducts(freshProducts)
    })
    return () => unsub && unsub()
  }, [])

  // Sync persistent account cart on auth change & listen to persistent user session
  useEffect(() => {
    const unsub = initAuthListener(async (user) => {
      if (user?.id) {
        try {
          const accountCart = await loadAccountCart(user.id)
          if (accountCart && accountCart.length > 0) {
            useCartStore.getState().setItems(accountCart)
          }
        } catch (e) {}
      }
    })
    return () => unsub && unsub()
  }, [])


  return (
    <BrowserRouter>
      <AnalyticsRouteTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/cart" element={<CartRouteHandler />} />
        <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
        <Route path="/track-order" element={<OrderTrackingPage />} />
        <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
        <Route path="/admin-panel-access" element={<AdminPanelPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/smita" element={<AdminPanelPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/product/:productIdOrSlug" element={<ProductPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/:genreSlug" element={<CategoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
