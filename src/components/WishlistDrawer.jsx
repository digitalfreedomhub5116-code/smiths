import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore, resolveProductImage, DEFAULT_FALLBACK_IMAGE } from '../store/cartStore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'

export default function WishlistDrawer() {
  const isWishlistOpen = useCartStore((s) => s.isWishlistOpen)
  const closeWishlist = useCartStore((s) => s.closeWishlist)
  const wishlist = useCartStore((s) => s.wishlist)
  const products = useCartStore((s) => s.products)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const navigate = useNavigate()

  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isWishlistOpen) {
      setVisible(true)
      requestAnimationFrame(() => setAnimating(true))
      document.body.style.overflow = 'hidden'
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 350)
      document.body.style.overflow = ''
      return () => clearTimeout(timer)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isWishlistOpen])

  if (!visible) return null

  const handleMoveToCart = (product) => {
    if (product.inStock === false) return
    addItem(product)
    toggleWishlist(product)
    closeWishlist()
    openCart()
  }

  const handleProductClick = (slug) => {
    closeWishlist()
    navigate(`/product/${slug}`)
  }

  return (
    <div className="fixed inset-0 z-[110]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeWishlist}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-charcoal shadow-2xl shadow-black/90 border-l border-gold/20 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <h2 className="font-heading text-lg font-semibold text-cream">Your Wishlist</h2>
            {wishlist.length > 0 && (
              <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-400">
                {wishlist.length}
              </span>
            )}
          </div>
          <button
            onClick={closeWishlist}
            className="rounded-full p-2 text-cream-muted transition-colors hover:bg-charcoal-light hover:text-cream"
            aria-label="Close wishlist"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {wishlist.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal-light/60 border border-gold/20 mb-4">
                <Heart className="h-8 w-8 text-cream-muted/40" />
              </div>
              <p className="font-heading text-lg font-semibold text-cream">
                Your wishlist is empty
              </p>
              <p className="mt-1 max-w-xs text-xs sm:text-sm text-cream-muted/50 leading-relaxed">
                Tap the heart on any item card to save your favourite jewellery designs.
              </p>
              <button
                onClick={closeWishlist}
                className="mt-6 rounded-full border border-gold/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold hover:text-obsidian"
              >
                Explore Jewellery
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 rounded-2xl border border-charcoal-light/80 bg-obsidian/60 p-3 transition-all hover:border-gold/30"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => handleProductClick(item.slug)}
                    className="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gold/15 bg-charcoal"
                  >
                    <OptimizedImage
                      src={resolveProductImage(item, products)}
                      alt={item.name}
                      width={160}
                      quality={75}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      containerClassName="h-full w-full"
                    />
                  </div>

                  {/* Info & Actions */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4
                          onClick={() => handleProductClick(item.slug)}
                          className="font-heading text-sm font-bold text-cream hover:text-gold cursor-pointer transition-colors line-clamp-1"
                        >
                          {item.fullName || `${item.name} Fine Jewellery`}
                        </h4>
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="ml-2 rounded-full p-1 text-cream-muted/40 transition-colors hover:text-rose-400"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mt-1 flex items-baseline gap-1.5 flex-nowrap">
                        <span className="font-heading text-sm font-bold text-gold">
                          ₹{item.price}
                        </span>
                        <span className="text-[11px] text-cream-muted/40 line-through">
                          ₹{item.originalPrice || 459}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {item.discountBadge}
                        </span>
                      </div>
                    </div>

                    {/* Move to Cart CTA */}
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={item.inStock === false}
                      className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold uppercase tracking-wider ${
                        item.inStock === false
                          ? 'bg-charcoal-light/60 text-cream-muted/50 border border-charcoal-light/80 cursor-not-allowed'
                          : 'btn-gold'
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{item.inStock === false ? 'Out of Stock' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-gold/10 px-5 py-4 bg-obsidian/40">
            <button
              onClick={() => {
                const inStockItems = wishlist.filter((p) => p.inStock !== false)
                inStockItems.forEach((p) => addItem(p))
                inStockItems.forEach((p) => toggleWishlist(p))
                closeWishlist()
                openCart()
              }}
              className="btn-gold w-full rounded-full py-3 text-xs font-bold uppercase tracking-widest"
            >
              Move All to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
