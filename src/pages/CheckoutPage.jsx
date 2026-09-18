import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Edit2,
  Trash2,
  MapPin,
  User,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  RefreshCw,
  ShoppingBag,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react'
import { useCartStore, resolveProductImage, DEFAULT_FALLBACK_IMAGE } from '../store/cartStore'
import OptimizedImage from '../components/OptimizedImage'
import {
  getCurrentCustomer,
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  createOrder,
  getRazorpayKeyId,
  initAuthListener,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logoutCustomer
} from '../lib/db'
import { trackCheckoutStep, trackOrderCompleted } from '../lib/analytics'

// Helper to load Razorpay checkout script on demand
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const cartItems = useCartStore((s) => s.items)
  const products = useCartStore((s) => s.products)
  const getTotal = useCartStore((s) => s.getTotal)
  const openCart = useCartStore((s) => s.openCart)
  const closeCart = useCartStore((s) => s.closeCart)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  // Single-product Buy Now session check
  const [buyNowItem, setBuyNowItem] = useState(() => {
    try {
      const raw = sessionStorage.getItem('smiths_buy_now_item')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  // Active items in checkout: if in Buy Now mode, strictly this single item; otherwise regular cart items
  const isBuyNowMode = Boolean(buyNowItem)
  const items = useMemo(() => {
    return buyNowItem ? [buyNowItem] : cartItems
  }, [buyNowItem, cartItems])

  // Quantity control helper for both Buy Now and regular cart
  const handleItemQuantityChange = (itemId, newQty) => {
    if (isBuyNowMode) {
      if (newQty <= 0) {
        try { sessionStorage.removeItem('smiths_buy_now_item') } catch (e) {}
        setBuyNowItem(null)
      } else {
        const updated = { ...buyNowItem, quantity: newQty }
        setBuyNowItem(updated)
        try { sessionStorage.setItem('smiths_buy_now_item', JSON.stringify(updated)) } catch (e) {}
      }
    } else {
      updateQuantity(itemId, newQty)
    }
  }

  // Remove item helper for both Buy Now and regular cart
  const handleItemRemove = (itemId) => {
    if (isBuyNowMode) {
      try { sessionStorage.removeItem('smiths_buy_now_item') } catch (e) {}
      setBuyNowItem(null)
    } else {
      removeItem(itemId)
    }
  }

  // Stepper: 1: 'address', 2: 'payment', 3: 'confirm'
  const [currentStep, setCurrentStepState] = useState(() => {
    try {
      const saved = Number(sessionStorage.getItem('smiths_checkout_step'))
      return saved >= 1 && saved <= 3 ? saved : 1
    } catch (e) {
      return 1
    }
  })

  const setCurrentStep = (step) => {
    setCurrentStepState(step)
    try {
      sessionStorage.setItem('smiths_checkout_step', String(step))
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Synchronize on mount to ensure Buy Now items and step 1 are guaranteed
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('smiths_buy_now_item')
      if (raw) {
        setBuyNowItem(JSON.parse(raw))
      }
      const savedStep = Number(sessionStorage.getItem('smiths_checkout_step'))
      if (savedStep >= 1 && savedStep <= 3) {
        setCurrentStepState(savedStep)
      } else {
        setCurrentStepState(1)
      }
    } catch (e) {}
  }, [])

  // Terminate checkout session completely and return to store
  const handleCancelCheckout = () => {
    try {
      sessionStorage.removeItem('smiths_checkout_step')
      sessionStorage.removeItem('smiths_buy_now_item')
    } catch (e) {}
    setBuyNowItem(null)
    setCurrentStepState(1)
    closeCart()
    navigate('/')
  }

  // Terminate checkout session and open normal side cart drawer on store
  const handleOpenCartFromCheckout = () => {
    try {
      sessionStorage.removeItem('smiths_checkout_step')
      sessionStorage.removeItem('smiths_buy_now_item')
    } catch (e) {}
    setBuyNowItem(null)
    setCurrentStepState(1)
    closeCart()
    navigate('/')
    setTimeout(() => {
      openCart()
    }, 60)
  }

  // Listen for restart checkout event (e.g. from CartDrawer Proceed to Checkout)
  useEffect(() => {
    const handleRestart = () => {
      setCurrentStepState(1)
      try {
        sessionStorage.setItem('smiths_checkout_step', '1')
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('smiths_restart_checkout', handleRestart)
    return () => window.removeEventListener('smiths_restart_checkout', handleRestart)
  }, [])

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => getCurrentCustomer())
  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Address state
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressIdState] = useState(() => {
    try {
      return sessionStorage.getItem('smiths_selected_address_id') || null
    } catch (e) {
      return null
    }
  })

  const setSelectedAddressId = (id) => {
    setSelectedAddressIdState(id)
    try {
      if (id) sessionStorage.setItem('smiths_selected_address_id', String(id))
      else sessionStorage.removeItem('smiths_selected_address_id')
    } catch (e) {}
  }

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressLoading, setAddressLoading] = useState(true)
  const [instructionsOpenId, setInstructionsOpenId] = useState(null)
  const [instructionText, setInstructionText] = useState('')

  // Address Form State
  const [formFullName, setFormFullName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [formLandmark, setFormLandmark] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formState, setFormState] = useState('Maharashtra')
  const [formPincode, setFormPincode] = useState('')
  const [formIsDefault, setFormIsDefault] = useState(false)
  const [formInstructions, setFormInstructions] = useState('')
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)

  // Step 2 & 3 state (Persistent payment method)
  const [paymentMethod, setPaymentMethodState] = useState(() => {
    try {
      return sessionStorage.getItem('smiths_payment_method') || 'COD'
    } catch (e) {
      return 'COD'
    }
  })

  const setPaymentMethod = (method) => {
    setPaymentMethodState(method)
    try {
      sessionStorage.setItem('smiths_payment_method', method)
    } catch (e) {}
  }

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')

  // Financial calculations
  const subtotal = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return (Number(buyNowItem.price) || 299) * (Number(buyNowItem.quantity) || 1)
    }
    return typeof getTotal === 'function' ? getTotal() : 0
  }, [isBuyNowMode, buyNowItem, getTotal, cartItems])
  const shippingFee = 0 // Free Shipping on all orders
  const convenienceFee = 14 // Small ₹14 convenience fee for order handling on all orders
  const onlineDiscount = paymentMethod === 'PREPAID' ? 30 : 0 // Save ₹30 by paying online
  const totalAmount = Math.max(0, subtotal + shippingFee + convenienceFee - onlineDiscount)
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || 599) * item.quantity,
    0
  )
  const totalSavings = Math.max(0, originalTotal - subtotal + onlineDiscount)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  // Track Checkout Funnel Step in Analytics & Clarity
  useEffect(() => {
    const stepNames = { 1: 'address', 2: 'payment', 3: 'review' }
    trackCheckoutStep(currentStep, stepNames[currentStep] || 'unknown', {
      itemCount: items.length,
      totalAmount,
      paymentMethod,
    })
  }, [currentStep, items.length, totalAmount, paymentMethod])

  // Auth listener
  useEffect(() => {
    const unsub = initAuthListener((user) => {
      setCurrentUser(user)
    })
    return () => unsub && unsub()
  }, [])

  // Load addresses when user changes
  const loadAddresses = async (user = currentUser) => {
    setAddressLoading(true)
    try {
      const addrs = await getUserAddresses(user?.id)
      setAddresses(addrs || [])

      if (addrs && addrs.length > 0) {
        // Prioritize previously selected address from session, or default, or first
        const savedId = sessionStorage.getItem('smiths_selected_address_id')
        const matched = savedId && addrs.find((a) => String(a.id) === String(savedId))
        if (matched) {
          setSelectedAddressIdState(matched.id)
        } else {
          const def = addrs.find((a) => a.is_default) || addrs[0]
          setSelectedAddressIdState((prev) => (prev && addrs.some((a) => String(a.id) === String(prev)) ? prev : def.id))
        }
      } else {
        setSelectedAddressIdState(null)
        setIsAddingNewAddress(true)
      }
    } catch (e) {
      console.warn('Failed to load user addresses:', e)
      setIsAddingNewAddress(true)
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses(currentUser)
  }, [currentUser])

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setAuthError('')
    try {
      const user = await signInWithGoogle()
      if (user) {
        setCurrentUser(user)
        setIsAuthFormOpen(false)
        await loadAddresses(user)
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Handle Email Auth
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!authEmail.trim()) {
      setAuthError('Please enter your email.')
      return
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    setAuthLoading(true)
    try {
      let user
      if (authMode === 'signup') {
        user = await signUpWithEmail(authEmail, authPassword, authName, authPhone)
      } else {
        user = await signInWithEmail(authEmail, authPassword)
      }

      if (user) {
        setCurrentUser(user)
        setIsAuthFormOpen(false)
        await loadAddresses(user)
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Switch User / Sign Out
  const handleLogout = async () => {
    await logoutCustomer()
    setCurrentUser(null)
    await loadAddresses(null)
  }

  // Open Edit Address Form
  const handleStartEdit = (addr) => {
    setEditingAddressId(addr.id)
    setIsAddingNewAddress(true)
    setFormFullName(addr.full_name || '')
    setFormPhone(addr.phone || '')
    setFormStreet(addr.street_address || '')
    setFormLandmark(addr.landmark || '')
    setFormCity(addr.city || '')
    setFormState(addr.state || 'Maharashtra')
    setFormPincode(addr.pincode || '')
    setFormIsDefault(Boolean(addr.is_default))
    setFormInstructions(addr.delivery_instructions || '')
    setFormError('')
  }

  // Reset Address Form
  const handleResetForm = () => {
    setIsAddingNewAddress(false)
    setEditingAddressId(null)
    setFormFullName('')
    setFormPhone('')
    setFormStreet('')
    setFormLandmark('')
    setFormCity('')
    setFormState('Maharashtra')
    setFormPincode('')
    setFormIsDefault(addresses.length === 0)
    setFormInstructions('')
    setFormError('')
  }

  // Save Address (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formFullName.trim()) {
      setFormError('Please enter the recipient full name.')
      return
    }
    const cleanPhone = formPhone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!formStreet.trim()) {
      setFormError('Please enter flat/house no. and street address.')
      return
    }
    if (!formCity.trim()) {
      setFormError('Please enter your city/town.')
      return
    }
    const cleanPincode = formPincode.replace(/[^0-9]/g, '')
    if (cleanPincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Indian PIN code.')
      return
    }

    setFormSaving(true)
    try {
      const payload = {
        id: editingAddressId || undefined,
        full_name: formFullName.trim(),
        phone: cleanPhone,
        street_address: formStreet.trim(),
        landmark: formLandmark.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        pincode: cleanPincode,
        is_default: formIsDefault || addresses.length === 0,
        delivery_instructions: formInstructions.trim(),
      }

      const saved = await saveUserAddress(payload, currentUser?.id)
      await loadAddresses(currentUser)
      if (saved?.id) {
        setSelectedAddressId(saved.id)
      }
      handleResetForm()
      // Advance to payment step immediately
      setCurrentStep(2)
    } catch (err) {
      console.error('Save address error:', err)
      setFormError('Could not save address. Please try again.')
    } finally {
      setFormSaving(false)
    }
  }

  // Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
      const updated = await deleteUserAddress(addressId, currentUser?.id)
      setAddresses(updated || [])
      if (selectedAddressId === addressId) {
        setSelectedAddressId(updated[0]?.id || null)
      }
    }
  }

  // Save Delivery Instructions inline
  const handleSaveInstruction = async (addressId) => {
    const target = addresses.find((a) => a.id === addressId)
    if (!target) return

    const updated = {
      ...target,
      delivery_instructions: instructionText.trim(),
    }
    await saveUserAddress(updated, currentUser?.id)
    await loadAddresses(currentUser)
    setInstructionsOpenId(null)
  }

  // Selected Address Object
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0]

  // Submit Final Order
  const handlePlaceOrder = async () => {
    setOrderError('')
    if (!selectedAddress) {
      setOrderError('Please select or add a delivery address first.')
      setCurrentStep(1)
      return
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty.')
      return
    }

    setIsSubmittingOrder(true)

    const basePayload = {
      user_id: currentUser?.id || null,
      customer_name: selectedAddress.full_name,
      customer_phone: selectedAddress.phone,
      customer_email: currentUser?.email || '',
      shipping_address: {
        full_name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        street_address: selectedAddress.street_address,
        landmark: selectedAddress.landmark || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: 'India',
        delivery_instructions: selectedAddress.delivery_instructions || '',
      },
      items: items.map((i) => ({
        product_id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: resolveProductImage(i, products),
      })),
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
    }

    // ── RAZORPAY PREPAID FLOW ──
    if (paymentMethod === 'PREPAID') {
      try {
        const loaded = await loadRazorpayScript()
        if (!loaded || !window.Razorpay) {
          throw new Error('Unable to load Razorpay payment gateway. Please check your network or select Cash on Delivery.')
        }

        const razorpayKey = getRazorpayKeyId()
        const amountPaise = Math.round(totalAmount * 100)

        const options = {
          key: razorpayKey,
          amount: amountPaise,
          currency: 'INR',
          name: 'SMITHS JEWELLERY',
          description: `Smiths Silver Jewellery (${items.reduce((s, it) => s + it.quantity, 0)} items)`,
          image: typeof window !== 'undefined' && window.location?.origin ? `${window.location.origin}/favicon.png` : '/favicon.png',
          prefill: {
            name: selectedAddress.full_name,
            email: currentUser?.email || '',
            contact: selectedAddress.phone,
          },
          notes: {
            shipping_city: selectedAddress.city,
            shipping_pincode: selectedAddress.pincode,
            order_source: 'smithsjewellery.in',
          },
          theme: {
            color: '#E2E8F0',
            backdrop_color: 'rgba(10, 10, 10, 0.94)',
          },
          modal: {
            ondismiss: () => {
              setIsSubmittingOrder(false)
            },
            escape: true,
            backdropclose: false,
          },
          handler: async function (response) {
            try {
              const paidPayload = {
                ...basePayload,
                payment_method: 'PREPAID',
                payment_status: 'PAID',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || null,
              }

              const order = await createOrder(paidPayload)
              trackOrderCompleted(order)
              if (isBuyNowMode) {
                try { sessionStorage.removeItem('smiths_buy_now_item') } catch (e) {}
                setBuyNowItem(null)
              } else {
                useCartStore.getState().clearCart()
              }
              try { sessionStorage.removeItem('smiths_checkout_step') } catch (e) {}
              closeCart()
              navigate(
                `/order-confirmed?orderId=${order.order_number}&total=${totalAmount}&method=PREPAID&paymentId=${encodeURIComponent(
                  response.razorpay_payment_id
                )}`
              )
            } catch (err) {
              console.error('Prepaid order completion error:', err)
              setOrderError(
                `Payment verified (#${response.razorpay_payment_id}), but order saving encountered an error. Our team has received the alert.`
              )
              setIsSubmittingOrder(false)
            }
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (resp) {
          console.error('Razorpay payment failed:', resp.error)
          setOrderError(
            resp.error?.description || 'Payment was declined by your bank or UPI app. Please retry or choose Cash on Delivery.'
          )
          setIsSubmittingOrder(false)
        })
        rzp.open()
        return
      } catch (err) {
        console.error('Razorpay initialization error:', err)
        setOrderError(err.message || 'Payment failed to initialize.')
        setIsSubmittingOrder(false)
        return
      }
    }

    // CASH ON DELIVERY (COD) FLOW
    try {
      const orderPayload = {
        ...basePayload,
        payment_method: 'COD',
        payment_status: 'PENDING',
      }

      const order = await createOrder(orderPayload)
      trackOrderCompleted(order)

      // Clear cart locally and from account (if regular cart checkout)
      if (isBuyNowMode) {
        try { sessionStorage.removeItem('smiths_buy_now_item') } catch (e) {}
        setBuyNowItem(null)
      } else {
        useCartStore.getState().clearCart()
      }
      try { sessionStorage.removeItem('smiths_checkout_step') } catch (e) {}
      closeCart()

      // Redirect to Order Confirmed
      navigate(`/order-confirmed?orderId=${order.order_number}&total=${totalAmount}&method=COD`)
    } catch (err) {
      console.error('Order placement failed:', err)
      setOrderError('Failed to place order. Please try again or choose another payment method.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // If cart is completely empty, prompt with back button
  if (items.length === 0 && !isSubmittingOrder) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        {/* Top Bar */}
        <div className="border-b border-gold/15 bg-charcoal/90 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelCheckout}
            className="flex items-center gap-2 text-gold hover:text-cream text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Store</span>
          </button>
          <span className="font-heading text-base font-bold tracking-widest text-cream">SMITHS</span>
          <button
            type="button"
            onClick={handleCancelCheckout}
            className="text-xs font-bold uppercase tracking-wider text-cream-muted hover:text-gold cursor-pointer"
          >
            CANCEL
          </button>
        </div>

        <div className="mx-auto max-w-md text-center px-4 py-24">
          <div className="h-16 w-16 mx-auto rounded-full bg-charcoal flex items-center justify-center border border-gold/20 mb-4">
            <ShoppingBag className="h-8 w-8 text-gold/60" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-cream">Your Bag is Empty</h2>
          <p className="mt-2 text-sm text-cream-muted/70">
            Please add a jewellery piece to proceed with checkout.
          </p>
          <button
            type="button"
            onClick={handleCancelCheckout}
            className="btn-silver inline-flex items-center gap-2 mt-6 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            Explore Jewellery
          </button>
        </div>

        <div className="border-t border-charcoal-light py-4 text-center text-xs text-cream-muted/40">
          © 2026 Smiths Jewellery. All rights reserved.
        </div>
      </div>
    )
  }

  // ── LOGIN REQUIRED GATE ──
  // If user is not signed in, block checkout and show a full-page sign-in prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        {/* Top Bar */}
        <div className="border-b border-gold/15 bg-charcoal/90 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelCheckout}
            className="flex items-center gap-2 text-gold hover:text-cream text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Store</span>
          </button>
          <span className="font-heading text-base font-bold tracking-widest text-cream">SMITHS</span>
          <button
            type="button"
            onClick={handleCancelCheckout}
            className="text-xs font-bold uppercase tracking-wider text-cream-muted hover:text-gold cursor-pointer"
          >
            CANCEL
          </button>
        </div>

        <div className="mx-auto max-w-md w-full text-center px-4 py-16 flex-1 flex flex-col items-center justify-center">
          {/* Icon */}
          <div className="h-16 w-16 mx-auto rounded-full bg-charcoal flex items-center justify-center border-2 border-gold/30 mb-5">
            <User className="h-8 w-8 text-gold" />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream">Sign in to Continue</h2>
          <p className="mt-2 text-sm text-cream-muted/70 max-w-xs mx-auto">
            Create an account or sign in to place your order, save addresses, and track your delivery in real-time.
          </p>

          {/* Auth Form Card */}
          <div className="mt-8 w-full rounded-2xl border border-gold/20 bg-charcoal/80 p-6 space-y-5 text-left">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gold/25 bg-obsidian/80 px-4 py-3.5 text-sm font-bold text-cream hover:border-gold/50 hover:bg-charcoal transition-all cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-gold" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-light" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-charcoal/80 px-3 text-xs text-cream-muted/50 uppercase tracking-wider">or</span>
              </div>
            </div>

            {/* Email Auth */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full rounded-xl border border-gold/20 bg-obsidian/70 px-4 py-3 text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-obsidian/70 px-4 py-3 text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full rounded-xl border border-gold/20 bg-obsidian/70 px-4 py-3 text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                required
              />
              {authMode === 'signup' && (
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full rounded-xl border border-gold/20 bg-obsidian/70 px-4 py-3 text-sm text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                />
              )}

              {authError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-gold w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                ) : authMode === 'signup' ? (
                  'Create Account & Continue'
                ) : (
                  'Sign In & Continue'
                )}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <p className="text-center text-xs text-cream-muted/60">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError('') }}
                    className="text-gold hover:underline font-semibold cursor-pointer"
                  >
                    Create One
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError('') }}
                    className="text-gold hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-cream-muted/50">
            <ShieldCheck className="h-3.5 w-3.5 text-gold/60" />
            <span>Your data is encrypted and never shared with third parties</span>
          </div>
        </div>

        <div className="border-t border-charcoal-light py-4 text-center text-xs text-cream-muted/40">
          © 2026 Smiths Jewellery. All rights reserved.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian pb-24">
      {/* ═════════════════════════════════════════════════════════════
          TOP BAR: BACK ARROW + BRAND + "CANCEL"
      ═════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1)
                } else {
                  handleCancelCheckout()
                }
              }}
              className="flex items-center gap-1.5 text-cream-muted hover:text-gold transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Brand Title */}
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-extrabold tracking-[0.2em] text-cream">
                SMITHS
              </span>
            </div>

            {/* Right Actions: Cart & Cancel */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleOpenCartFromCheckout}
                className="group relative rounded-full p-2 text-cream-muted transition-all hover:bg-charcoal hover:text-gold cursor-pointer"
                aria-label="View Cart"
                title="View Cart"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {items.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian shadow-md shadow-gold/30">
                    {items.reduce((sum, it) => sum + (it.quantity || 1), 0)}
                  </span>
                )}
              </button>

              {/* CANCEL Button */}
              <button
                type="button"
                onClick={handleCancelCheckout}
                className="text-xs sm:text-sm font-bold tracking-wider text-cream-muted hover:text-gold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-charcoal"
              >
                CANCEL
              </button>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              STEPPER: ADDRESS  ──  PAYMENT  ──  CONFIRM ORDER
              (Faithfully replicated from Image 2 with our gold theme)
          ═════════════════════════════════════════════════════════════ */}
          <div className="py-3.5 border-t border-gold/10">
            <div className="flex items-center justify-between relative px-6 sm:px-10">
              {/* Connecting progress bar line */}
              <div className="absolute left-10 right-10 top-3 h-[2px] bg-charcoal-light -z-0">
                <div
                  className="h-full bg-gold transition-all duration-500 ease-out"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                  }}
                />
              </div>

              {/* Step 1: Address */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="relative z-10 flex flex-col items-center group cursor-pointer px-3 py-1.5 -mx-3 rounded-xl hover:bg-gold/5 transition-all"
                title="Go to Step 1: Delivery Address"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : currentStep > 1
                      ? 'bg-gold text-obsidian border-2 border-gold shadow-sm group-hover:scale-110'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  {currentStep > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className="h-2 w-2 rounded-full bg-gold" />}
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 1 ? 'text-cream' : currentStep > 1 ? 'text-gold group-hover:text-yellow-300' : 'text-cream-muted/60'
                  }`}
                >
                  Address
                </span>
              </button>

              {/* Step 2: Payment */}
              <button
                type="button"
                onClick={() => {
                  if (currentStep >= 2 || selectedAddressId || addresses.length > 0) {
                    setCurrentStep(2)
                  }
                }}
                disabled={!(currentStep >= 2 || selectedAddressId || addresses.length > 0)}
                className={`relative z-10 flex flex-col items-center group px-3 py-1.5 -mx-3 rounded-xl transition-all ${
                  (currentStep >= 2 || selectedAddressId || addresses.length > 0)
                    ? 'cursor-pointer hover:bg-gold/5'
                    : 'cursor-not-allowed opacity-50'
                }`}
                title="Go to Step 2: Payment Method"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 2
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : currentStep > 2
                      ? 'bg-gold text-obsidian border-2 border-gold shadow-sm group-hover:scale-110'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  {currentStep > 2 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className={`h-2 w-2 rounded-full ${currentStep === 2 ? 'bg-gold' : 'bg-transparent'}`} />}
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 2 ? 'text-cream' : currentStep > 2 ? 'text-gold group-hover:text-yellow-300' : 'text-cream-muted/60'
                  }`}
                >
                  Payment
                </span>
              </button>

              {/* Step 3: Confirm order */}
              <button
                type="button"
                onClick={() => {
                  if (currentStep >= 3 || (selectedAddressId && paymentMethod)) {
                    setCurrentStep(3)
                  }
                }}
                disabled={!(currentStep >= 3 || (selectedAddressId && paymentMethod))}
                className={`relative z-10 flex flex-col items-center group px-3 py-1.5 -mx-3 rounded-xl transition-all ${
                  (currentStep >= 3 || (selectedAddressId && paymentMethod))
                    ? 'cursor-pointer hover:bg-gold/5'
                    : 'cursor-not-allowed opacity-50'
                }`}
                title="Go to Step 3: Confirm Order"
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep === 3
                      ? 'bg-obsidian border-2 border-gold text-gold ring-4 ring-gold/20 shadow-md shadow-gold/30'
                      : 'bg-charcoal border-2 border-charcoal-light text-cream-muted/50'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${currentStep === 3 ? 'bg-gold' : 'bg-transparent'}`} />
                </div>
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                    currentStep === 3 ? 'text-cream' : 'text-cream-muted/60'
                  }`}
                >
                  Confirm order
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Mobile Collapsible Order Summary Bar */}
        <div className="lg:hidden mb-6 rounded-2xl border border-gold/25 bg-charcoal/90 overflow-hidden shadow-lg shadow-black/40">
          <button
            type="button"
            onClick={() => setShowMobileSummary((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 bg-obsidian/70 cursor-pointer hover:bg-obsidian transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cream">
                  <span>{showMobileSummary ? 'Hide' : 'Show'} Order Summary</span>
                  <span className="text-gold font-normal">
                    ({items.reduce((sum, it) => sum + it.quantity, 0)} {items.length === 1 ? 'item' : 'items'})
                  </span>
                  {isBuyNowMode && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-gold/15 text-gold text-[9px] font-bold border border-gold/30 shrink-0">
                      Direct Buy Now
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gold transition-transform duration-200 ${
                      showMobileSummary ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] text-cream-muted/60">Pan-India express dispatch</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-heading text-base font-extrabold text-gold">
                ₹{totalAmount}
              </span>
            </div>
          </button>

          {showMobileSummary && (
            <div className="p-4 border-t border-charcoal-light/70 space-y-4 animate-fade-in">
              {/* Items List */}
              <div className="divide-y divide-charcoal-light/50 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <OptimizedImage
                      src={resolveProductImage(item, products)}
                      alt={item.name}
                      width={160}
                      quality={75}
                      className="h-full w-full object-cover"
                      containerClassName="h-14 w-14 rounded-xl border border-gold/15 bg-obsidian shrink-0 overflow-hidden"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-xs font-bold text-cream truncate">
                        {item.fullName || `${item.name} Fine Jewellery`}
                      </h4>
                      <p className="text-[11px] text-gold font-semibold">₹{item.price}</p>
                      {/* Quantity Controls */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-charcoal-light bg-obsidian px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.id, item.quantity - 1)}
                            className="text-cream-muted hover:text-gold"
                            title="Decrease"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-bold text-cream min-w-[1rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
                            className="text-cream-muted hover:text-gold"
                            title="Increase"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleItemRemove(item.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-xs font-bold text-gold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-charcoal-light/70 space-y-2 text-xs">
                <div className="flex justify-between text-cream-muted">
                  <span>Subtotal</span>
                  <span className="text-cream font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-cream-muted items-center">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-cream-muted items-center">
                  <span>Order Handling Fee</span>
                  <span className="text-cream font-semibold">₹{convenienceFee}</span>
                </div>
                {onlineDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                    <span>Online Payment Offer</span>
                    <span>-₹{onlineDiscount} (Saved!)</span>
                  </div>
                )}
                {totalSavings > 0 && onlineDiscount === 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                    <span>Total Discount Savings</span>
                    <span>Save ₹{totalSavings}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal-light/70 flex justify-between items-baseline">
                  <span className="font-bold text-cream">Total Amount</span>
                  <span className="font-heading text-lg font-bold text-gold">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stepper & Step Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* User Status Bar */}
        <div className="mb-6 rounded-xl border border-gold/15 bg-charcoal/70 p-3 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-cream truncate">
                Signed in as <span className="text-gold">{currentUser.name || currentUser.email}</span>
              </p>
              {currentUser?.email && (
                <p className="text-[10px] text-cream-muted/60 truncate">{currentUser.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="text-[11px] text-cream-muted hover:text-gold underline cursor-pointer"
            >
              Switch
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            STEP 1: SELECT A DELIVERY ADDRESS (Matched to Image 2)
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Inline Auth Form (shown when user clicks Sign In) */}
            {!currentUser && isAuthFormOpen && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/80 p-6 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                  <h3 className="font-heading text-lg font-bold text-cream">
                    {authMode === 'signup' ? 'Create Smiths Account' : 'Sign in to Smiths Jewellery'}
                  </h3>
                  <button
                    onClick={() => setIsAuthFormOpen(false)}
                    className="text-xs text-cream-muted hover:text-cream"
                  >
                    ✕
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {authError}
                  </div>
                )}

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-charcoal-light bg-obsidian hover:border-gold/40 text-cream text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {googleLoading ? (
                    <RefreshCw className="w-4 h-4 text-gold animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-charcoal-light" />
                  <span className="bg-charcoal px-3 text-[10px] uppercase font-bold tracking-widest text-cream-muted/50 absolute">
                    Or with email
                  </span>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Pruthvi Patil"
                          className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-gold w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? 'Signing in...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                      className="text-xs text-cream-muted/70 hover:text-gold"
                    >
                      {authMode === 'signup'
                        ? 'Already have an account? Sign In'
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Heading */}
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Select a delivery address
              </h1>
              {addresses.length > 0 && (
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gold">
                  All addresses ({addresses.length})
                </p>
              )}
            </div>

            {/* List of Saved Addresses */}
            {addressLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-cream-muted/60">
                <RefreshCw className="h-6 w-6 text-gold animate-spin" />
                <span className="text-xs tracking-wider uppercase">Loading saved addresses...</span>
              </div>
            ) : addresses.length === 0 && !isAddingNewAddress ? (
              /* No saved address: Direct prompt */
              <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-6 text-center space-y-3">
                <MapPin className="h-10 w-10 mx-auto text-gold/80" />
                <h3 className="font-heading text-lg font-bold text-cream">No saved addresses yet</h3>
                <p className="text-xs text-cream-muted/80 max-w-sm mx-auto">
                  Add your shipping address below. It will be saved permanently to your account for all future drops.
                </p>
                <button
                  onClick={() => {
                    handleResetForm()
                    setIsAddingNewAddress(true)
                  }}
                  className="btn-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id
                  const isInstructionsOpen = instructionsOpenId === addr.id

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative rounded-2xl border transition-all duration-300 p-4 sm:p-5 cursor-pointer ${
                        isSelected
                          ? 'border-gold/80 bg-charcoal shadow-xl shadow-gold/10'
                          : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30 hover:bg-charcoal/80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Custom Styled Radio Button (Faithfully matched to Image 2) */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                                : 'border-cream-muted/40 bg-transparent'
                            }`}
                          >
                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="flex-1 min-w-0 text-left">
                          {/* Name */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-heading text-base sm:text-lg font-extrabold text-cream">
                              {addr.full_name}
                            </h3>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                                Default
                              </span>
                            )}
                          </div>

                          {/* Address lines */}
                          <p className="mt-1.5 text-xs sm:text-sm text-cream-muted/90 leading-relaxed font-sans">
                            {addr.street_address}
                            {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city.toUpperCase()},{' '}
                            {addr.state.toUpperCase()}, {addr.pincode}, India
                          </p>

                          {/* Phone number */}
                          <p className="mt-1 text-xs sm:text-sm font-medium text-cream-muted/80">
                            Phone number:{' '}
                            <span className="font-mono text-cream font-semibold">{addr.phone}</span>
                          </p>

                          {/* Saved Delivery Instructions if present */}
                          {addr.delivery_instructions && (
                            <div className="mt-2 rounded-lg bg-obsidian/70 border border-charcoal-light px-3 py-1.5 text-[11px] text-cream-muted/80 flex items-start gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-gold/80 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-gold">Instructions:</strong> {addr.delivery_instructions}
                              </span>
                            </div>
                          )}

                          {/* ══════════════════════════════════════════════════
                              ACTIONS DISPLAYED WHEN THIS ADDRESS IS SELECTED
                              (Deliver to this address + Edit address + Instructions)
                          ══════════════════════════════════════════════════ */}
                          {isSelected && (
                            <div
                              className="mt-5 pt-4 border-t border-charcoal-light/70 space-y-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Primary: Deliver to this address (Yellow / Gold button like in Image 2) */}
                              <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-gold/25 active:scale-98 cursor-pointer"
                              >
                                <span>Deliver to this address</span>
                              </button>

                              {/* Secondary: Edit address (White / bordered button like in Image 2) */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(addr)}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-obsidian/60 hover:bg-charcoal-light hover:border-gold py-2.5 text-xs font-bold text-cream transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-gold" />
                                  <span>Edit address</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="rounded-xl border border-charcoal-light bg-obsidian/60 hover:bg-rose-500/20 hover:border-rose-500/40 p-2.5 text-cream-muted hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete address"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Auxiliary Link: Add delivery instructions */}
                              <div>
                                {!isInstructionsOpen ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInstructionsOpenId(addr.id)
                                      setInstructionText(addr.delivery_instructions || '')
                                    }}
                                    className="text-xs text-gold hover:text-yellow-200 underline tracking-wide font-medium cursor-pointer"
                                  >
                                    {addr.delivery_instructions
                                      ? 'Edit delivery instructions'
                                      : 'Add delivery instructions'}
                                  </button>
                                ) : (
                                  <div className="mt-2 p-3 rounded-xl bg-obsidian/90 border border-gold/20 space-y-2">
                                    <label className="block text-[11px] font-semibold text-cream-muted">
                                      Delivery Instructions (e.g. Leave with security / Call upon arrival)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={instructionText}
                                      onChange={(e) => setInstructionText(e.target.value)}
                                      placeholder="Provide courier delivery guidance..."
                                      className="w-full rounded-lg border border-charcoal-light bg-charcoal px-3 py-2 text-xs text-cream focus:border-gold focus:outline-none"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setInstructionsOpenId(null)}
                                        className="text-[11px] text-cream-muted hover:text-cream px-2 py-1"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveInstruction(addr.id)}
                                        className="rounded-lg bg-gold px-3 py-1 text-[11px] font-bold text-obsidian hover:bg-gold-dark"
                                      >
                                        Save Note
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION: "Add delivery address" (Matched to Image 2)
            ═════════════════════════════════════════════════════════════ */}
            <div className="pt-6 border-t border-gold/15">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-cream mb-3">
                Add delivery address
              </h2>

              {!isAddingNewAddress ? (
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm()
                    setIsAddingNewAddress(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/30 bg-charcoal/40 hover:bg-charcoal hover:border-gold py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold transition-all duration-300 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add a new delivery address</span>
                </button>
              ) : (
                /* Interactive Address Form */
                <form
                  onSubmit={handleSaveAddress}
                  className="rounded-2xl border border-gold/30 bg-charcoal p-5 sm:p-6 space-y-4 animate-fade-in-up"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-light">
                    <h3 className="font-heading text-base font-bold text-cream">
                      {editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs text-cream-muted hover:text-gold"
                    >
                      Cancel
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="e.g. 8530085116"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Flat, House no., Building, Company, Apartment *
                    </label>
                    <input
                      type="text"
                      required
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="e.g. Jivanjyot hospital karad, Bheda Chowk"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                      Area, Street, Sector, Village / Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={formLandmark}
                      onChange={(e) => setFormLandmark(e.target.value)}
                      placeholder="e.g. Opposite Shivaji High School, Kival Road"
                      className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        Town / City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Karad, Satara"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        State *
                      </label>
                      <select
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream focus:border-gold focus:outline-none cursor-pointer"
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Other">Other State</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-cream-muted mb-1">
                        6-Digit PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formPincode}
                        onChange={(e) => setFormPincode(e.target.value)}
                        placeholder="e.g. 415110"
                        className="w-full rounded-xl border border-charcoal-light bg-obsidian/80 px-3.5 py-2.5 text-xs text-cream placeholder-cream-muted/40 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="makeDefaultCheckbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="accent-gold h-4 w-4 rounded cursor-pointer"
                    />
                    <label htmlFor="makeDefaultCheckbox" className="text-xs text-cream-muted cursor-pointer">
                      Use as my default delivery address
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex gap-3">
                    <button
                      type="submit"
                      disabled={formSaving}
                      className="btn-gold flex-1 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/25 active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {formSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-obsidian" />
                          <span>Saving Address...</span>
                        </>
                      ) : editingAddressId ? (
                        <span>Update & Deliver to this address</span>
                      ) : (
                        <>
                          <span>Use this address & Proceed</span>
                          <ChevronRight className="h-4 w-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="rounded-xl border border-charcoal-light px-5 py-3 text-xs font-bold uppercase tracking-wider text-cream-muted hover:text-cream cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ═════════════════════════════════════════════════════════════
                BOTTOM PROCEED TO PAYMENT BUTTON (Step 1)
            ═════════════════════════════════════════════════════════════ */}
            {addresses.length > 0 && !isAddingNewAddress && (
              <div className="pt-6 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAddressId) {
                      setCurrentStep(2)
                    } else if (addresses.length > 0) {
                      setSelectedAddressId(addresses[0].id)
                      setCurrentStep(2)
                    }
                  }}
                  className="btn-gold w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest shadow-2xl shadow-gold/30 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>
                <p className="text-center text-[11px] text-cream-muted/60 mt-2">
                  Next: Choose COD or Prepaid UPI on the next screen
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 2: PAYMENT METHOD
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Selected Address Summary Banner */}
            {selectedAddress && (
              <div className="rounded-2xl border border-gold/20 bg-charcoal/70 p-4 flex items-center justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-xs min-w-0">
                    <p className="text-cream-muted/70 text-[10px] uppercase tracking-wider font-semibold">
                      Delivering to:
                    </p>
                    <p className="font-bold text-cream truncate">{selectedAddress.full_name}</p>
                    <p className="text-cream-muted truncate">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider shrink-0 ml-3 cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Select a payment method
              </h1>
              <p className="mt-1 text-xs text-cream-muted/70">
                Choose how you want to pay for your handcrafted silver jewellery.
              </p>
            </div>

            {/* Payment Options Grid */}
            <div className="space-y-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 select-none ${
                  paymentMethod === 'COD'
                    ? 'border-gold bg-charcoal shadow-lg shadow-gold/15 ring-1 ring-gold/30'
                    : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <input
                  type="radio"
                  name="checkout_payment_option"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <div className="shrink-0">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                        : 'border-cream-muted/40'
                    }`}
                  >
                    {paymentMethod === 'COD' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-4 w-4 text-gold shrink-0" />
                    <span className="font-heading text-sm sm:text-base font-bold text-cream">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-[11px] text-cream-muted/70 mt-0.5">
                    Pay securely in cash when your jewellery arrives at your door.
                  </p>
                </div>
              </label>

              {/* Option 2: UPI / QR / NetBanking */}
              <label
                className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 select-none ${
                  paymentMethod === 'PREPAID'
                    ? 'border-gold bg-charcoal shadow-lg shadow-gold/15 ring-1 ring-gold/30'
                    : 'border-charcoal-light/80 bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <input
                  type="radio"
                  name="checkout_payment_option"
                  value="PREPAID"
                  checked={paymentMethod === 'PREPAID'}
                  onChange={() => setPaymentMethod('PREPAID')}
                  className="sr-only"
                />
                <div className="shrink-0">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'PREPAID'
                        ? 'border-gold bg-obsidian ring-2 ring-gold/40'
                        : 'border-cream-muted/40'
                    }`}
                  >
                    {paymentMethod === 'PREPAID' && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-heading text-sm sm:text-base font-bold text-cream">
                      UPI / Instant QR / NetBanking / Cards
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      SAVE ₹30
                    </span>
                  </div>
                  <p className="text-[11px] text-cream-muted/70 mt-0.5">
                    Pay securely online and get flat ₹30 OFF instantly! (GPay, PhonePe, Paytm, Cards)
                  </p>
                </div>
              </label>
            </div>

            {/* Price Preview Box */}
            <div className="rounded-2xl border border-charcoal-light bg-charcoal/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-cream-muted">
                <span>Items Total ({items.length} {items.length === 1 ? 'piece' : 'pieces'}):</span>
                <span className="font-mono text-cream font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cream-muted items-center">
                <span>Standard Pan-India Shipping:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">FREE</span>
              </div>
              <div className="flex justify-between text-cream-muted items-center">
                <span>Order Handling Fee:</span>
                <span className="font-mono text-cream font-semibold">₹{convenienceFee}</span>
              </div>
              {onlineDiscount > 0 ? (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                  <span>Online Payment Discount:</span>
                  <span className="font-mono font-bold">-₹{onlineDiscount} (You Save ₹30!)</span>
                </div>
              ) : (
                <div className="flex justify-between text-gold/80 text-[11px] bg-gold/5 border border-gold/20 rounded-lg px-2.5 py-1">
                  <span>💡 Tip:</span>
                  <span>Select Online Payment above to save ₹30!</span>
                </div>
              )}
              <div className="border-t border-charcoal-light/70 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-cream">Total Payable Amount:</span>
                <span className="font-heading text-lg font-bold text-gold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-gold/25 cursor-pointer active:scale-98"
              >
                <span>Continue to Confirm Order</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 3: CONFIRM ORDER
        ═════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
                Review & Confirm your order
              </h1>
              <p className="mt-1 text-xs text-cream-muted/70">
                Please verify your delivery address, items, and payment method before placing order.
              </p>
            </div>

            {orderError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Shipping Address Review Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                <div className="flex items-center gap-2 text-gold">
                  <MapPin className="h-4 w-4" />
                  <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                    Shipping Address
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className="mt-3 text-xs sm:text-sm space-y-1 text-cream-muted/90">
                  <p className="font-bold text-cream">{selectedAddress.full_name}</p>
                  <p>{selectedAddress.street_address}</p>
                  {selectedAddress.landmark && <p>{selectedAddress.landmark}</p>}
                  <p>
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  <p className="text-xs text-cream-muted/70 pt-1">
                    Phone: <span className="font-mono text-cream">{selectedAddress.phone}</span>
                  </p>
                  {selectedAddress.delivery_instructions && (
                    <p className="text-[11px] text-gold pt-1">
                      Note: {selectedAddress.delivery_instructions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-rose-400">No address selected.</p>
              )}
            </div>

            {/* Payment Method Review Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal-light">
                <div className="flex items-center gap-2 text-gold">
                  <CreditCard className="h-4 w-4" />
                  <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                    Payment Method
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-gold hover:text-yellow-200 underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>
              <div className="mt-3 text-xs sm:text-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-cream">
                    {paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (UPI / NetBanking)'}
                  </p>
                  <p className="text-xs text-cream-muted/70">
                    {paymentMethod === 'COD'
                      ? 'Pay cash upon arrival'
                      : 'Priority dispatch from Maharashtra fulfillment hub'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-gold">₹{totalAmount}</span>
              </div>
            </div>

            {/* Items Summary Box */}
            <div className="rounded-2xl border border-charcoal-light/80 bg-charcoal p-4 sm:p-5">
              <div className="flex items-center gap-2 text-gold pb-3 border-b border-charcoal-light">
                <ShoppingBag className="h-4 w-4" />
                <h3 className="font-heading text-sm font-bold text-cream uppercase tracking-wide">
                  Items in Order ({items.length})
                </h3>
              </div>

              <div className="divide-y divide-charcoal-light/60 mt-3">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <OptimizedImage
                      src={resolveProductImage(item, products)}
                      alt={item.name}
                      width={160}
                      quality={75}
                      className="h-full w-full object-cover"
                      containerClassName="h-14 w-14 rounded-xl border border-gold/15 bg-obsidian shrink-0 overflow-hidden"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-heading text-xs sm:text-sm font-bold text-cream truncate">
                        {item.fullName || `${item.name} Fine Jewellery`}
                      </p>
                      <p className="text-[11px] text-cream-muted/60">
                        Qty: <strong className="text-cream">{item.quantity}</strong> × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-xs sm:text-sm font-bold text-gold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Order Price Breakdown */}
            <div className="rounded-2xl border border-gold/30 bg-charcoal/80 p-5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-cream-muted">
                <span>Items Subtotal:</span>
                <span className="font-mono text-cream font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-cream-muted items-center">
                <span>Standard Pan-India Shipping:</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">FREE</span>
              </div>
              <div className="flex justify-between text-cream-muted items-center">
                <span>Order Handling Fee:</span>
                <span className="font-mono text-cream font-semibold">₹{convenienceFee}</span>
              </div>
              {onlineDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                  <span>Online Payment Discount:</span>
                  <span className="font-mono font-bold">-₹{onlineDiscount} (Saved ₹30!)</span>
                </div>
              )}
              <div className="border-t border-charcoal-light/80 pt-3 flex justify-between items-baseline">
                <span className="font-heading text-sm sm:text-base font-extrabold text-cream">
                  Total Payable Amount:
                </span>
                <span className="font-heading text-xl sm:text-2xl font-extrabold text-gold">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
                className="btn-gold w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest shadow-2xl shadow-gold/30 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <>
                    <RefreshCw className="h-5 w-5 text-obsidian animate-spin" />
                    <span>{paymentMethod === 'PREPAID' ? 'Opening Razorpay Gateway...' : 'Processing Order...'}</span>
                  </>
                ) : paymentMethod === 'PREPAID' ? (
                  <>
                    <CreditCard className="h-5 w-5 text-obsidian" />
                    <span>Pay Online with Razorpay · ₹{totalAmount}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-obsidian" />
                    <span>Confirm COD Order · ₹{totalAmount}</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-cream-muted/50">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold/80" /> 100% Secure Checkout
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-gold/80" /> Dispatched in 24h
                </span>
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Right Column: Sticky Desktop Order Summary & Cart Review */}
          <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-gold/25 bg-charcoal/80 backdrop-blur-md p-5 shadow-2xl shadow-black/60">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gold/15">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-5 w-5 text-gold" />
                  <h3 className="font-heading text-base font-bold text-cream">
                    Order Summary
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isBuyNowMode && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold border border-gold/30 flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-gold text-gold" />
                      <span>Direct Buy Now</span>
                    </span>
                  )}
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold border border-gold/20">
                    {items.reduce((sum, it) => sum + it.quantity, 0)} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-charcoal-light/60 my-4 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start gap-3">
                    <OptimizedImage
                      src={resolveProductImage(item, products)}
                      alt={item.name}
                      width={160}
                      quality={75}
                      className="h-full w-full object-cover"
                      containerClassName="h-16 w-16 rounded-xl border border-gold/15 bg-obsidian shrink-0 overflow-hidden"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-xs font-bold text-cream leading-snug truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] uppercase font-bold text-gold tracking-wider mt-0.5">
                        Antique Gold 3D Printed
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 rounded-full border border-charcoal-light bg-obsidian px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.id, item.quantity - 1)}
                            className="text-cream-muted hover:text-gold transition-colors p-0.5"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-cream min-w-[1rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
                            className="text-cream-muted hover:text-gold transition-colors p-0.5"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleItemRemove(item.id)}
                          className="text-cream-muted/50 hover:text-rose-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-sm font-bold text-gold block">
                        ₹{item.price * item.quantity}
                      </span>
                      <span className="text-[10px] text-cream-muted/40 line-through">
                        ₹{(item.originalPrice || 459) * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-charcoal-light/80 pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-cream-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cream">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-cream-muted items-center">
                  <span>Standard Pan-India Shipping</span>
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-cream-muted items-center">
                  <span>Order Handling Fee</span>
                  <span className="font-semibold text-cream">₹{convenienceFee}</span>
                </div>
                {onlineDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                    <span>Online Payment Offer</span>
                    <span>-₹{onlineDiscount} (Saved ₹30!)</span>
                  </div>
                )}
                {totalSavings > 0 && onlineDiscount === 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                    <span>Total Discount Savings</span>
                    <span>Save ₹{totalSavings}</span>
                  </div>
                )}
                <div className="border-t border-charcoal-light/80 pt-2.5 flex justify-between items-baseline">
                  <span className="font-heading text-sm font-bold text-cream">Total Amount</span>
                  <span className="font-heading text-xl font-extrabold text-gold">₹{totalAmount}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-5 pt-4 border-t border-gold/10 grid grid-cols-2 gap-2 text-center text-[10px] text-cream-muted/70">
                <div className="p-2 rounded-xl bg-obsidian/50 border border-charcoal-light/60 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="p-2 rounded-xl bg-obsidian/50 border border-charcoal-light/60 flex items-center justify-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>Dispatched in 24h</span>
                </div>
              </div>

              {/* Back to store link */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleCancelCheckout}
                  className="text-[11px] font-semibold text-cream-muted/60 hover:text-gold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Continue Shopping / Add More</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  )
}
