import { useScrollReveal } from '../hooks/useScrollReveal'

export default function FeatureBanner() {
  const [ref, isVisible] = useScrollReveal(0.15)

  return (
    <section ref={ref} className="relative overflow-hidden py-16 sm:py-24 border-t border-silver/15 bg-obsidian">
      {/* Subtle atmospheric silver ambient lighting */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-silver/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-silver/5 blur-[120px]" />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Artisan Craftsmanship Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Soft silver glow accent */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-silver/25 via-silver/10 to-silver/25 opacity-60 blur-md transition duration-500 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-2xl border border-silver/30 bg-charcoal shadow-2xl shadow-black">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80"
                  alt="Smiths Jewellery Fine Silver Craftsmanship"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-102"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right: Brand Story */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Eyebrow */}
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-silver-dark uppercase mb-3 sm:mb-4">
              The Standard of Purity
            </span>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-cream tracking-tight leading-tight">
              Crafted in Pure Radiance
            </h2>

            {/* Paragraph Body */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-cream-muted/90 max-w-2xl font-sans">
              At Smiths Jewellery, every creation is sculpted from certified 925 sterling silver, fortified with protective rhodium for everlasting mirror luster, and set with precision-cut stones. We honor silversmithing traditions while celebrating modern, sophisticated silhouettes.
            </p>

            {/* Subtle Brand Accent Line */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-0.5 w-12 bg-silver/50" />
              <span className="text-xs font-semibold uppercase tracking-widest text-silver/80">
                100% Hallmarked 925 Silver · Anti-Tarnish Finish
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
