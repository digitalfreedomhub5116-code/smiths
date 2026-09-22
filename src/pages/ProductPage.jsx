import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Minus,
  Zap,
  Flame,
} from 'lucide-react'
import { MOCK_PRODUCTS, useCartStore, GENRES, resolveProductImage, DEFAULT_FALLBACK_IMAGE } from '../store/cartStore'
import { buildProductReviews } from '../data/productsData'
import { trackProductView, trackAddToCart, trackBuyNow } from '../lib/analytics'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import OptimizedImage from '../components/OptimizedImage'
import { getOptimizedImageUrl } from '../lib/imageOptimizer'

export default function ProductPage() {
  const { productIdOrSlug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)

  const allProducts = useCartStore((s) => s.products)

  // Find product by id or slug from store
  const storeProduct = (allProducts || []).find(
    (p) => String(p.id) === String(productIdOrSlug) || p.slug === productIdOrSlug
  )

  // Check if product was explicitly deleted
  const localDeleted = (() => {
    try {
      const raw = localStorage.getItem('smiths_deleted_product_ids')
      return raw ? JSON.parse(raw).map(Number) : []
    } catch (e) {
      return []
    }
  })()

  const isDeleted =
    (!isNaN(Number(productIdOrSlug)) && localDeleted.includes(Number(productIdOrSlug))) ||
    (storeProduct && localDeleted.includes(Number(storeProduct.id)))

  // Find fallback from default MOCK_PRODUCTS only to enrich an existing product
  const mockFallback = !isDeleted
    ? (storeProduct
        ? MOCK_PRODUCTS.find((m) => Number(m.id) === Number(storeProduct.id) || m.slug === storeProduct.slug)
        : (allProducts && allProducts.length === 0
            ? MOCK_PRODUCTS.find((m) => (String(m.id) === String(productIdOrSlug) || m.slug === productIdOrSlug) && !localDeleted.includes(Number(m.id)))
            : null))
    : null

  const raw = isDeleted ? null : (storeProduct || mockFallback)

  const product = raw
    ? {
        ...mockFallback,
        ...raw,
        name: raw.name || mockFallback?.name || 'Silver Jewellery Piece',
        fullName: raw.fullName || mockFallback?.fullName || `${raw.name || 'Silver'} Jewellery`,
        genre: raw.genre || mockFallback?.genre || 'NECKLACES',
        price: Number(raw.price) || mockFallback?.price || 1299,
        originalPrice: Number(raw.originalPrice) || mockFallback?.originalPrice || 2499,
        discountBadge: raw.discountBadge || mockFallback?.discountBadge || '-48%',
        discountPercent: raw.discountPercent || mockFallback?.discountPercent || 48,
        description: raw.description || mockFallback?.description || `Handcrafted 925 sterling silver ${raw.name || 'jewellery'} finished with radiant rhodium luster.`,
        features: Array.isArray(raw.features) && raw.features.length > 0 ? raw.features : (mockFallback?.features || []),
        rating: Number(raw.rating) || mockFallback?.rating || 4.9,
        reviewCount: Number(raw.reviewCount) || mockFallback?.reviewCount || 24,
        reviews: Array.isArray(raw.reviews) && raw.reviews.length > 0
          ? raw.reviews
          : (mockFallback?.reviews || buildProductReviews(raw)),
        gallery: Array.isArray(raw.gallery) && raw.gallery.length > 0
          ? raw.gallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
          : (mockFallback?.gallery || (raw.image && !raw.image.includes('photo-1618354691373-d851c5c3a990') ? [raw.image] : [mockFallback?.image || DEFAULT_FALLBACK_IMAGE])),
        inStock: raw.inStock !== false,
        isHidden: raw.isHidden === true,
      }
    : null

  const reviews = Array.isArray(product?.reviews) ? product.reviews : []
  const rawGallery = Array.isArray(product?.gallery) && product.gallery.length > 0 ? product.gallery : []
  const cleanProductGallery = rawGallery.filter((g) => g && !g.includes('photo-1618354691373-d851c5c3a990'))
  const gallery = cleanProductGallery.length > 0
    ? cleanProductGallery
    : (product?.image && !product.image.includes('photo-1618354691373-d851c5c3a990') ? [product.image] : [mockFallback?.image || DEFAULT_FALLBACK_IMAGE])

  const isWishlisted = useCartStore((s) => (product ? s.isWishlisted(product.id) : false))

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('image')
  const [isCopied, setIsCopied] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)

  const imageSectionRef = useRef(null)
  const descSectionRef = useRef(null)
  const reviewsSectionRef = useRef(null)
  const lastScrollY = useRef(0)

  // Slider Ref & Interaction State
  const sliderRef = useRef(null)
  const isMouseDown = useRef(false)
  const mouseStartX = useRef(0)
  const scrollLeftStart = useRef(0)
  const hasMovedMouse = useRef(false)
  const isProgrammaticScroll = useRef(false)
  const programmaticScrollTimer = useRef(null)

  // Smoothly scroll to a specific image index
  const scrollToIndex = (index) => {
    const el = sliderRef.current
    if (!el) return
    const bounded = Math.max(0, Math.min(gallery.length - 1, index))
    setActiveImageIndex(bounded)
    isProgrammaticScroll.current = true
    if (programmaticScrollTimer.current) {
      clearTimeout(programmaticScrollTimer.current)
    }
    el.scrollTo({
      left: bounded * el.clientWidth,
      behavior: 'smooth',
    })
    programmaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 450)
  }

  const handleNextImage = () => {
    if (!gallery.length) return
    const nextIndex = (activeImageIndex + 1) % gallery.length
    scrollToIndex(nextIndex)
  }

  const handlePrevImage = () => {
    if (!gallery.length) return
    const prevIndex = (activeImageIndex - 1 + gallery.length) % gallery.length
    scrollToIndex(prevIndex)
  }

  // Native scroll listener: updates active indicator and thumbnails as user swipes
  const handleSliderScroll = () => {
    if (isProgrammaticScroll.current) return
    const el = sliderRef.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    if (index !== activeImageIndex && index >= 0 && index < gallery.length) {
      setActiveImageIndex(index)
    }
  }

  // Desktop mouse dragging support
  const handleMouseDown = (e) => {
    const el = sliderRef.current
    if (!el) return
    isMouseDown.current = true
    hasMovedMouse.current = false
    mouseStartX.current = e.pageX - el.offsetLeft
    scrollLeftStart.current = el.scrollLeft
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return
    const el = sliderRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = x - mouseStartX.current
    if (Math.abs(walk) > 4) {
      hasMovedMouse.current = true
    }
    el.scrollLeft = scrollLeftStart.current - walk
  }

  const handleMouseUpOrLeave = () => {
    if (!isMouseDown.current) return
    isMouseDown.current = false
    const el = sliderRef.current
    if (!el) return
    el.style.scrollSnapType = 'x mandatory'
    el.style.scrollBehavior = 'smooth'
    if (hasMovedMouse.current) {
      const index = Math.round(el.scrollLeft / el.clientWidth)
      const bounded = Math.max(0, Math.min(gallery.length - 1, index))
      scrollToIndex(bounded)
    }
  }

  // Keep carousel aligned on screen resize
  useEffect(() => {
    const handleResize = () => {
      const el = sliderRef.current
      if (!el || el.clientWidth === 0) return
      el.scrollTo({
        left: activeImageIndex * el.clientWidth,
        behavior: 'instant',
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeImageIndex])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setActiveImageIndex(0)
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' })
    }
    setShowAllReviews(false)
    setShowNavbar(true)
    lastScrollY.current = 0
  }, [productIdOrSlug])

  // Combined scroll handler: Scroll-spy + Smart auto-hide top Navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY)

      // 1. Auto-hide Navbar on scroll down, reappear on scroll up
      if (currentScrollY <= 30) {
        setShowNavbar(true)
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling DOWN -> hide top bar
        setShowNavbar(false)
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling UP -> reveal top bar
        setShowNavbar(true)
      }
      lastScrollY.current = currentScrollY

      // 2. Active sticky tab Scroll-Spy
      const scrollPos = currentScrollY + 140
      const revTop = reviewsSectionRef.current?.offsetTop || Infinity
      const descTop = descSectionRef.current?.offsetTop || Infinity

      if (scrollPos >= revTop) {
        setActiveTab('reviews')
      } else if (scrollPos >= descTop) {
        setActiveTab('description')
      } else {
        setActiveTab('image')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Background preloading of subsequent gallery slides for instantaneous swiping
  useEffect(() => {
    if (!Array.isArray(gallery) || gallery.length <= 1) return
    gallery.slice(1).forEach((imgUrl) => {
      const optimized = getOptimizedImageUrl(imgUrl, { width: 800, quality: 85 })
      const img = new Image()
      img.src = optimized
    })
  }, [gallery])

  // Track Product View in Analytics & Clarity
  useEffect(() => {
    if (product && !product.isHidden) {
      trackProductView(product)
    }
  }, [product?.id])

  if (!product || product.isHidden) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-xl text-center px-4 py-36">
          <h1 className="font-heading text-4xl font-bold text-cream">Product Unavailable</h1>
          <p className="mt-3 text-cream-muted">
            {product?.isHidden
              ? 'This piece is currently hidden from the public catalog.'
              : 'This jewellery piece could not be located.'}
          </p>
          <Link
            to="/"
            className="btn-silver inline-flex items-center gap-2 mt-6 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
      </div>
    )
  }

  const isOutOfStock = product.inStock === false

  const isBestseller = Boolean(
    product && (
      product.isBestseller === true ||
      product.name?.toLowerCase().includes('solitaire') ||
      product.name?.toLowerCase().includes('tennis') ||
      product.name?.toLowerCase().includes('halo') ||
      String(product.id) === '1' ||
      String(product.id) === '5' ||
      String(product.id) === '8' ||
      String(product.id) === '15'
    )
  )


  const handleBuyNow = () => {
    if (isOutOfStock) return
    trackBuyNow(product, quantity)
    const cleanImg = resolveProductImage(product, allProducts)
    const buyNowPayload = {
      id: product.id,
      name: product.name,
      fullName: product.fullName,
      price: Number(product.price) || 1299,
      originalPrice: Number(product.originalPrice) || 2499,
      quantity: quantity,
      image: cleanImg,
      genre: product.genre,
      isBuyNow: true,
    }

    // Automatically add this product to the user's cart in the store
    useCartStore.getState().setItems([buyNowPayload])

    // Save in sessionStorage for single-product Direct Buy Now checkout session
    try {
      sessionStorage.setItem('smiths_buy_now_item', JSON.stringify(buyNowPayload))
      sessionStorage.setItem('smiths_checkout_step', '1')
    } catch (e) {}

    // Close any open side drawers
    useCartStore.getState().closeCart()

    // Redirect directly to the 1st step of checkout (address filling)
    navigate('/checkout')
  }

  const scrollToSection = (section) => {
    setActiveTab(section)
    if (section === 'image') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'description') {
      descSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (section === 'reviews') {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.fullName,
        text: `Check out the ${product.fullName} on Smiths Jewellery`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const relatedProducts = (allProducts || []).filter(
    (p) => p.genre && product?.genre && p.genre === product.genre && String(p.id) !== String(product.id) && !p.isHidden
  ).slice(0, 4)

  const genreData = GENRES.find((g) => g.id === product?.genre)

  return (
    <div className="min-h-screen bg-obsidian text-cream selection:bg-gold selection:text-obsidian pb-20 sm:pb-0">
      <Navbar visible={showNavbar} />

      {/* Amazon-style Sticky Sub-Header Tabs (Image, Description, Reviews) */}
      <div
        className={`sticky z-40 border-b border-gold/15 bg-obsidian/95 backdrop-blur-md transition-all duration-300 ease-out ${
          showNavbar ? 'top-16 sm:top-18' : 'top-0 shadow-lg shadow-black/40'
        }`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 sm:gap-4 py-2 flex-shrink-0">
              {[
                { id: 'image', label: 'Image' },
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${reviews.length || product.reviewCount || 12})` },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative px-2.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'text-gold'
                        : 'text-cream-muted/70 hover:text-cream'
                    }`}
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {isActive && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 bg-gold shadow-sm shadow-gold" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Back link */}
            <Link
              to={genreData ? `/${genreData.slug}` : '/'}
              className="text-xs text-cream-muted/60 hover:text-gold transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 pl-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> {genreData ? genreData.label : 'Store'}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-cream-muted/60 mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          {genreData && (
            <>
              <Link to={`/${genreData.slug}`} className="hover:text-gold transition-colors">
                {genreData.label}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="text-cream truncate max-w-[200px] sm:max-w-none">{product.fullName}</span>
        </div>

        {/* Top Product Section: Image Gallery (Left) + Purchase Details (Right) */}
        <div ref={imageSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Image Gallery (Amazon Display Style) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none">
              {gallery.map((imgUrl, index) => {
                const isSelected = activeImageIndex === index
                return (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-charcoal ${
                      isSelected
                        ? 'border-gold shadow-md shadow-gold/30 scale-105 ring-2 ring-gold/40'
                        : 'border-charcoal-light/70 hover:border-gold/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <OptimizedImage
                      src={imgUrl}
                      alt={`${product.name} view ${index + 1}`}
                      width={160}
                      quality={75}
                      priority={true}
                      className="h-full w-full object-cover"
                      containerClassName="h-full w-full"
                    />
                  </button>
                )
              })}
            </div>

            {/* Main Image Display Carousel */}
            <div
              className="relative flex-1 aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden border border-charcoal-light/80 bg-charcoal shadow-2xl shadow-black/80 group select-none"
            >
              {/* Native Snap Scrollable Track (Fluid swipe, 100% immune to getting stuck in between) */}
              <div
                ref={sliderRef}
                onScroll={handleSliderScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain cursor-grab active:cursor-grabbing"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="w-full min-w-full h-full flex-shrink-0 snap-start snap-always relative"
                  >
                    <OptimizedImage
                      src={imgUrl}
                      alt={`${product.fullName} view ${index + 1}`}
                      width={800}
                      quality={85}
                      priority={index === 0}
                      className="h-full w-full object-cover object-center select-none pointer-events-none"
                      containerClassName="h-full w-full"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevImage()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Floating Actions (Share & Wishlist) */}
              <div
                className="absolute top-4 right-4 flex flex-col gap-2 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                  className="p-2.5 rounded-full bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-gold hover:bg-obsidian backdrop-blur-md transition-all"
                  title="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWishlist(product)
                  }}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-lg shadow-rose-500/25'
                      : 'bg-obsidian/75 border border-gold/30 text-cream-muted hover:text-rose-400 hover:bg-obsidian'
                  }`}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isWishlisted ? 'fill-rose-500 text-rose-500 scale-115 animate-heart-burst' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Share confirmation toast */}
              {isCopied && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-obsidian shadow-lg z-20">
                  Link copied to clipboard!
                </div>
              )}

              {/* Gallery Image Indicator Dots */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-gold/20 z-10"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToIndex(i)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIndex === i ? 'w-5 bg-gold' : 'w-1.5 bg-cream-muted/40 hover:bg-cream'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Box */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Genre & Bestseller Badges - ONLY Hulk and Iron Man get the Bestseller badge */}
              {isBestseller && (
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-xs font-bold text-gold uppercase tracking-wider shadow-sm shadow-gold/10">
                    <Flame className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span>Bestseller</span>
                  </span>
                </div>
              )}

              {/* Product Full Name Title */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-cream leading-tight">
                {product.fullName}
              </h1>

              {/* Ratings and Reviews Bar */}
              <div
                onClick={() => scrollToSection('reviews')}
                className="mt-2.5 inline-flex items-center gap-2 cursor-pointer group/rate"
              >
                <div className="flex items-center text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(product.rating || 4.8)
                          ? 'fill-gold text-gold'
                          : i < (product.rating || 4.8)
                          ? 'fill-gold/50 text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gold">
                  {product.rating || 4.8}
                </span>
                <span className="text-xs text-cream-muted/70 group-hover/rate:text-gold transition-colors">
                  ({reviews.length || product.reviewCount || 12} reviews)
                </span>
              </div>

              {/* Pricing & Offer */}
              <div className="mt-4 p-4 rounded-2xl border border-charcoal-light/70 bg-charcoal/40 backdrop-blur-sm">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-heading text-3xl sm:text-4xl font-extrabold text-gold">
                    ₹{Number(product.price || 299) * quantity}
                  </span>
                  <span className="text-sm sm:text-base text-cream-muted/50 line-through">
                    M.R.P.: ₹{Number(product.originalPrice || 599) * quantity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                    {product.discountBadge || `-${product.discountPercent || 50}%`}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs text-cream-muted/60 font-medium">
                      (₹{product.price} each)
                    </span>
                  )}
                </div>

                {/* Instant Prepaid Discount Callout */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-cream-muted">
                  <Zap className="h-3.5 w-3.5 text-gold fill-gold shrink-0" />
                  <span>Pay online (UPI / Cards) for instant <strong className="text-gold font-bold">₹30 OFF</strong> at checkout</span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-charcoal-light/40 flex items-center justify-between text-xs text-cream-muted/60">
                  <span>Free Pan-India Delivery · Taxes Included</span>
                  {!isOutOfStock ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> In Stock · Ships in 24h
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Purchase Action: Quantity Stepper + Direct BUY NOW */}
              <div className="mt-5 flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center rounded-xl border border-charcoal-light bg-charcoal/90 p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="h-11 w-11 rounded-lg flex items-center justify-center text-cream hover:text-gold hover:bg-obsidian/80 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-heading font-extrabold text-cream text-base">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10 || isOutOfStock}
                    aria-label="Increase quantity"
                    className="h-11 w-11 rounded-lg flex items-center justify-center text-cream hover:text-gold hover:bg-obsidian/80 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Direct BUY NOW Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:brightness-105 active:scale-[0.99] cursor-pointer ${
                    isOutOfStock
                      ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gold via-amber-400 to-gold text-obsidian'
                  }`}
                >
                  <Zap className="h-5 w-5 fill-obsidian text-obsidian shrink-0" />
                  <span className="truncate">
                    {isOutOfStock ? 'Out of Stock' : `BUY NOW · ₹${Number(product.price || 299) * quantity}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dedicated Description Tab / Content */}
        <div ref={descSectionRef} className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-gold/15 scroll-mt-14 sm:scroll-mt-16">
          <div className="max-w-4xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
              Product Description
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream-muted/90">
              {product.description}
            </p>

            {/* Full Specifications Table */}
            <div className="mt-8 rounded-2xl border border-charcoal-light bg-charcoal/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-charcoal-light bg-obsidian/60">
                <h3 className="font-heading text-base font-bold text-cream">
                  Jewellery Specifications & Quality
                </h3>
              </div>
              <div className="divide-y divide-charcoal-light/70 text-sm">
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Metal Base</span>
                  <span className="col-span-2 font-semibold text-cream">Solid 925 Sterling Silver (Hallmarked)</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Plating & Luster</span>
                  <span className="col-span-2 font-semibold text-cream">Triple-Coated Liquid Rhodium Anti-Tarnish Finish</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Gemstones / Inlay</span>
                  <span className="col-span-2 font-semibold text-cream">Precision-Cut AAA+ Cubic Zirconia / Natural Freshwater Pearls</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Hypoallergenic</span>
                  <span className="col-span-2 font-semibold text-cream">100% Nickel-free, Lead-free, Cadmium-free (Sensitive Skin Safe)</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Packaging</span>
                  <span className="col-span-2 font-semibold text-cream">Signature Smiths Midnight Velvet Keepsake Box & Authenticity Certificate</span>
                </div>
                <div className="grid grid-cols-3 px-6 py-3.5">
                  <span className="text-cream-muted/60">Collection</span>
                  <span className="col-span-2 font-semibold text-cream">{genreData ? genreData.label : product.genre}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Customer Reviews (Amazon Style with Indian English Reviews) */}
        <div ref={reviewsSectionRef} className="mt-20 pt-10 border-t border-gold/15 scroll-mt-14 sm:scroll-mt-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-cream-muted/70">
                Verified buyer feedback on the {product.fullName}
              </p>
            </div>

            {/* Overall Rating Box */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-charcoal/80">
              <div className="text-center">
                <span className="font-heading text-4xl font-extrabold text-gold block">
                  {product.rating || 4.8}
                </span>
                <span className="text-[11px] text-cream-muted/60">out of 5</span>
              </div>
              <div className="border-l border-charcoal-light pl-4">
                <div className="flex items-center text-gold mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 4.8)
                          ? 'fill-gold text-gold'
                          : i < (product.rating || 4.8)
                          ? 'fill-gold/50 text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-cream">
                  {reviews.length || product.reviewCount || 12} customer ratings
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-charcoal-light/70 bg-charcoal/60 p-5 transition-all hover:border-gold/30 hover:bg-charcoal"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold text-xs">
                      {(rev.name || 'C').charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-cream block leading-snug">
                        {rev.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-cream-muted/40">
                    {rev.date}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-3 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < (rev.rating || 5)
                          ? 'fill-gold text-gold'
                          : 'text-charcoal-light fill-charcoal-light'
                      }`}
                    />
                  ))}
                </div>

                {/* Casual Indian English Review text (zero hyphens, commas, periods) */}
                <p className="mt-2.5 text-sm text-cream-muted/90 leading-relaxed font-sans">
                  {rev.text}
                </p>
              </div>
            ))}
          </div>

          {/* View More Button */}
          {reviews.length > 3 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-charcoal/80 px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold shadow-lg shadow-black/40 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-obsidian hover:shadow-xl hover:shadow-gold/25 active:scale-95"
              >
                <span>{showAllReviews ? 'Show Less' : 'View More'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showAllReviews ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Customers Also Bought / Related Jewellery */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-10 border-t border-gold/15">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-cream mb-6">
              More from {genreData ? genreData.label : 'Collection'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/product/${rel.slug}`)}
                  className="product-card group relative cursor-pointer overflow-hidden rounded-2xl border border-charcoal-light/70 bg-charcoal p-3 transition-all hover:border-gold/50"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-obsidian mb-3">
                    <OptimizedImage
                      src={rel.image}
                      alt={rel.name}
                      width={400}
                      quality={80}
                      className="h-full w-full object-cover object-center transition-transform duration-500 sm:group-hover:scale-105"
                      containerClassName="h-full w-full"
                    />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-cream group-hover:text-gold transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-nowrap">
                    <span className="font-heading text-sm font-bold text-gold shrink-0">
                      ₹{rel.price}
                    </span>
                    <span className="text-[11px] text-cream-muted/50 line-through shrink-0">
                      ₹{rel.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                      {rel.discountBadge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Direct Action Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-gold/25 bg-obsidian/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black">
        <div className="flex items-center justify-between gap-3">
          <div className="shrink-0">
            <div className="flex items-baseline gap-1.5 flex-nowrap">
              <span className="font-heading text-lg font-extrabold text-gold">
                ₹{Number(product.price || 299) * quantity}
              </span>
              <span className="text-[11px] text-cream-muted/50 line-through">
                ₹{Number(product.originalPrice || 599) * quantity}
              </span>
            </div>
            <span className="text-[9px] font-semibold text-emerald-400 block">
              Free Delivery · ₹30 OFF UPI
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            {/* Direct BUY NOW Button (Full Width Mobile Action) */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider transition-all truncate cursor-pointer ${
                isOutOfStock
                  ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold via-amber-400 to-gold text-obsidian shadow-lg shadow-gold/30 active:scale-95'
              }`}
            >
              <Zap className="h-4 w-4 fill-obsidian text-obsidian shrink-0" />
              <span className="truncate">{isOutOfStock ? 'Sold Out' : 'BUY NOW'}</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  )
}
