import { useScrollReveal } from '../hooks/useScrollReveal'
import { GENRES, useCartStore } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

function GenreCard({ genre, index }) {
  const navigate = useNavigate()
  const [ref, isVisible] = useScrollReveal(0.1)
  const allProducts = useCartStore((s) => s.products)
  const visibleCount = allProducts.filter((p) => p.genre === genre.id && !p.isHidden).length
  const isComingSoon = visibleCount === 0

  const handleClick = () => {
    navigate(`/${genre.slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Asymmetric sizes for visual interest across 6 categories
  const sizeClasses =
    index === 0
      ? 'col-span-2 row-span-1 sm:col-span-2 sm:row-span-2'
      : index === 1
      ? 'col-span-1 row-span-1'
      : index === 2
      ? 'col-span-1 row-span-1'
      : index === 3
      ? 'col-span-1 row-span-1'
      : index === 4
      ? 'col-span-1 row-span-1'
      : 'col-span-2 row-span-1 sm:col-span-1 sm:row-span-1'

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-charcoal-light/70 bg-charcoal transition-all duration-500 hover:border-silver/60 hover:shadow-2xl hover:shadow-silver/10 ${sizeClasses} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Background Image */}
      <img
        src={genre.image}
        alt={genre.label}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        loading="lazy"
      />

      {/* Dark Mood Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent transition-opacity duration-300 group-hover:opacity-85" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

      {/* Coming Soon Top Badge */}
      {isComingSoon && (
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-obsidian/90 text-silver border border-silver/40 shadow-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-silver animate-ping" />
            Coming Soon
          </span>
        </div>
      )}

      {/* Content: Heading, Status & Arrow Indicator */}
      <div className="absolute inset-0 flex items-end justify-between p-5 sm:p-6 lg:p-7">
        <div>
          <h3 className="font-heading text-2xl font-bold tracking-tight text-cream transition-colors duration-300 group-hover:text-silver sm:text-3xl lg:text-4xl">
            {genre.label}
          </h3>
          {genre.tagline && (
            <p className="text-[11px] sm:text-xs text-cream-muted/70 font-light hidden sm:block mt-0.5 line-clamp-1">
              {genre.tagline}
            </p>
          )}
          {isComingSoon ? (
            <span className="text-xs text-silver/80 font-medium block mt-0.5">
              Crafting Soon
            </span>
          ) : (
            <span className="text-xs text-silver-dark/90 font-medium block mt-1">
              {visibleCount} Designs Available
            </span>
          )}
        </div>

        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-silver/30 bg-obsidian/70 text-silver backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-silver group-hover:text-obsidian group-hover:border-silver shrink-0">
          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  )
}

export default function GenreShowcase() {
  const [sectionRef, sectionVisible] = useScrollReveal(0.05)

  return (
    <section id="genres" className="relative py-16 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(226,232,240,0.05)_0%,_transparent_50%)]" />

      <div ref={sectionRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mb-10 sm:mb-14 transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-silver-dark uppercase mb-2 block">
            Crafted for Perfection
          </span>
          <h2 className="font-heading text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
            Curated Collections
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream-muted sm:text-base">
            Select a category to discover fine 925 sterling silver necklaces, bracelets, earrings, rings, pure silk scarfs, and bespoke gift combos.
          </p>
        </div>

        {/* Category Bento Grid */}
        <div className="grid auto-rows-[210px] grid-cols-2 gap-3 sm:auto-rows-[250px] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[270px] lg:gap-5">
          {GENRES.map((genre, index) => (
            <GenreCard key={genre.id} genre={genre} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
