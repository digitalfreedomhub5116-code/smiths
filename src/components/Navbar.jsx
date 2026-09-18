import { ShoppingBag, User, X, Menu, Heart, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useScrolled } from '../hooks/useScrollReveal'
import AuthModal from './AuthModal'

export default function Navbar({ visible = true }) {
  const scrolled = useScrolled(20)
  const toggleCart = useCartStore((s) => s.toggleCart)
  const itemCount = useCartStore((s) => s.getItemCount())
  const wishlistCount = useCartStore((s) => s.getWishlistCount())
  const wishlistPing = useCartStore((s) => s.wishlistPing)
  const toggleWishlistDrawer = useCartStore((s) => s.toggleWishlistDrawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavClick = (hash) => {
    setMobileMenuOpen(false)
    navigate('/')
    setTimeout(() => {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          visible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        } ${
          scrolled
            ? 'navbar-glass shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-heading text-lg sm:text-xl font-bold tracking-[0.22em] text-cream transition-colors group-hover:text-silver">
              SMITHS <span className="font-serif italic text-silver font-normal text-sm sm:text-base tracking-widest text-silver-light">Jewellery</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => handleNavClick('#genres')}
              className="text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide"
            >
              COLLECTIONS
            </button>
            <button
              onClick={() => handleNavClick('#products')}
              className="text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide"
            >
              ALL JEWELLERY
            </button>
            <Link
              to="/track-order"
              className="text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide flex items-center gap-1.5"
            >
              <Truck className="h-4 w-4 text-gold/80" />
              <span>ORDERS & TRACK</span>
            </Link>
          </div>

          {/* Right Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Auth Account Button */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="group rounded-full p-2 text-cream-muted transition-all hover:bg-charcoal-light hover:text-gold cursor-pointer"
              aria-label="Account"
              title="Customer Account"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Wishlist Heart with Animation Ping */}
            <button
              onClick={toggleWishlistDrawer}
              className={`group relative rounded-full p-2 transition-all duration-300 hover:bg-charcoal-light ${
                wishlistPing
                  ? 'animate-wishlist-ping text-rose-500 bg-rose-500/20 ring-2 ring-gold shadow-lg shadow-gold/30'
                  : 'text-cream-muted hover:text-rose-400'
              }`}
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  wishlistCount > 0 || wishlistPing
                    ? 'fill-rose-500 text-rose-500 scale-110'
                    : 'group-hover:scale-110'
                }`}
                strokeWidth={1.75}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/50">
                  {wishlistCount}
                </span>
              )}

              {/* Ping Ring Effect when item is wishlisted */}
              {wishlistPing && (
                <span className="absolute inset-0 rounded-full animate-ping bg-gold/50 pointer-events-none" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="group relative rounded-full p-2 text-cream-muted transition-all hover:bg-charcoal-light hover:text-gold"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian shadow-md shadow-gold/30">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-cream-muted transition-all hover:bg-charcoal-light hover:text-gold md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="navbar-glass border-t border-gold/10 px-4 pb-5 pt-3">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleNavClick('#genres')}
              className="text-left text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide py-1"
            >
              COLLECTIONS
            </button>
            <button
              onClick={() => handleNavClick('#products')}
              className="text-left text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide py-1"
            >
              ALL JEWELLERY
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                toggleWishlistDrawer()
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-cream-muted transition-colors hover:text-rose-400 tracking-wide py-1"
            >
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              <span>WISHLIST ({wishlistCount})</span>
            </button>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide py-1"
            >
              <Truck className="h-4 w-4 text-gold/80" />
              <span>TRACK ORDER</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setIsAuthOpen(true)
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-cream-muted transition-colors hover:text-gold tracking-wide py-1"
            >
              <User className="h-4 w-4 text-gold/80" />
              <span>ACCOUNT & ORDERS</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Customer Auth & Orders Modal - Rendered outside of nav to avoid CSS transform stacking context */}
    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
