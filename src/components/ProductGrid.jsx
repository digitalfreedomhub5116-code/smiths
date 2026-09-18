import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, MOCK_PRODUCTS } from '../store/cartStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import OptimizedImage from './OptimizedImage'

const PRODUCTS_PER_BATCH = 8

function ProductCard({ product, priority = false }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const openReviews = useCartStore((s) => s.openReviews)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const isWishlisted = useCartStore((s) => s.isWishlisted(product.id))
  const [ref, isVisible] = useScrollReveal(0.05)
  const isOutOfStock = product.inStock === false

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product)
    openCart()
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <div
      ref={ref}
      onClick={handleCardClick}
      className={`product-card group relative cursor-pointer overflow-hidden rounded-xl border border-charcoal-light/70 bg-charcoal transition-all duration-500 hover:border-gold/50 hover:shadow-xl hover:shadow-black/70 flex flex-col ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Product Background Image & Wishlist Button */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-obsidian">
        <OptimizedImage
          src={(Array.isArray(product.gallery) && product.gallery[0]) || product.image}
          alt={product.name}
          width={450}
          quality={80}
          priority={priority}
          className={`h-full w-full object-cover object-center transition-transform duration-500 ease-out sm:group-hover:scale-105 ${
            isOutOfStock ? 'opacity-70 grayscale-[25%]' : ''
          }`}
          containerClassName="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />

        {/* Out of Stock badge on image */}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-black/85 backdrop-blur-md text-rose-400 border border-rose-500/50 shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top-Right Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 shadow-md shadow-rose-500/20'
              : 'bg-obsidian/65 text-cream-muted/70 hover:text-rose-400 hover:bg-obsidian/90 border border-white/10'
          }`}
          aria-label={`Wishlist ${product.name}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110 animate-heart-burst' : 'hover:scale-110'
            }`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Compact Product Details: Name, Star Rating, Price & Sleek Add to Cart Button */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between bg-charcoal">
        <div>
          {/* 1. Product Name Title */}
          <h3 className="font-heading text-sm sm:text-base font-bold text-cream transition-colors group-hover:text-gold line-clamp-1">
            {product.name}
          </h3>

          {/* 2. Star Rating (Odd review count between 7-15) */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              openReviews(product)
            }}
            className="mt-0.5 flex items-center gap-1 cursor-pointer group/rating hover:opacity-90 transition-opacity"
            title="Click to view verified customer reviews"
          >
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-gold text-gold'
                      : i < product.rating
                      ? 'fill-gold/50 text-gold'
                      : 'text-charcoal-light fill-charcoal-light'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-gold">
              {product.rating}
            </span>
            <span className="text-[10px] sm:text-[11px] text-cream-muted/70 group-hover/rating:text-gold transition-colors">
              ({product.reviewCount})
            </span>
          </div>

          {/* 3. Offer Price & Original Cut MRP Side by Side */}
          <div className="mt-1.5 flex items-baseline gap-1.5 flex-nowrap overflow-hidden">
            <span className="font-heading text-sm sm:text-base font-bold text-gold shrink-0">
              ₹{product.price}
            </span>
            <span className="text-[10px] sm:text-[11px] text-cream-muted/50 line-through shrink-0">
              ₹{product.originalPrice || 459}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0">
              {product.discountBadge || `-${product.discountPercent}%`}
            </span>
          </div>
        </div>

        {/* 4. Compact Add to Cart / Out of Stock Button */}
        <div className="mt-2 pt-2 border-t border-charcoal-light/60">
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
              isOutOfStock
                ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                : 'btn-gold shadow-sm shadow-gold/15 hover:shadow-gold/30 hover:scale-[1.01] active:scale-95'
            }`}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductGrid() {
  const allProducts = useCartStore((s) => s.products)
  const catalog = useMemo(() => allProducts.filter((p) => !p.isHidden), [allProducts])
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_BATCH)
  const loadMoreRef = useRef(null)

  const visibleProducts = catalog.slice(0, visibleCount)
  const hasMore = visibleCount < catalog.length

  // Infinite scroll trigger
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_BATCH, catalog.length))
  }, [catalog.length])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return (
    <section id="products" className="relative pb-16 sm:pb-24 pt-4 sm:pt-8">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-14 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse [animation-delay:200ms]" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse [animation-delay:400ms]" />
            </div>
            <p className="text-xs text-cream-muted/50 tracking-wider uppercase">Loading more...</p>
          </div>
        )}

        {/* End of Catalog message */}
        {!hasMore && (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <p className="mt-2 text-xs text-cream-muted/50 tracking-wider uppercase">
              All {catalog.length} creations revealed
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
