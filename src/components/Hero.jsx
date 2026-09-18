import { ChevronDown } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Hero() {
  const [ref, isVisible] = useScrollReveal(0.1)

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-black pb-12 pt-20 sm:pb-16">
      {/* Background Graphic */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&q=85"
          alt="Smiths Jewellery — Fine 925 Sterling Silver & Luxury Accessories"
          className="h-full w-full object-cover object-center filter contrast-105 brightness-90"
          loading="eager"
        />
        {/* Soft Vignettes & Gradients for seamless obsidian black blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Decorative Silver Side Accents */}
      <div className="absolute left-4 top-1/3 hidden h-32 w-px bg-gradient-to-b from-transparent via-silver/50 to-transparent sm:block sm:left-8" />
      <div className="absolute right-4 top-1/3 hidden h-32 w-px bg-gradient-to-b from-transparent via-silver/50 to-transparent sm:block sm:right-8" />

      {/* Content Positioned Elegantly over Bottom */}
      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8"
      >
        <span
          className={`text-xs sm:text-sm font-semibold tracking-[0.3em] text-silver-dark uppercase mb-3 inline-block transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          ✦ 925 Sterling Silver & Fine Accessories ✦
        </span>

        {/* Headline */}
        <h1
          className={`font-heading text-4xl font-extrabold tracking-tight text-cream sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Timeless{' '}
          <span className="bg-gradient-to-r from-white via-silver-light to-silver-dark bg-clip-text text-transparent">
            Radiance.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={`mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream-muted sm:text-base transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Fine 925 sterling silver necklaces, bracelets, earrings, luxury silk scarfs, and curated gift combos.
          <br className="hidden sm:block" />
          Crafted with luminous rhodium finish for everlasting shine.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <a
            href="#genres"
            className="btn-silver inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl shadow-silver/15 hover:shadow-silver/30"
          >
            Explore Collections
          </a>
          <a
            href="#products"
            className="inline-flex items-center gap-2 rounded-full border border-silver/40 bg-obsidian/70 px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-cream backdrop-blur-md transition-all hover:border-silver hover:bg-silver/10 hover:text-white"
          >
            View All Jewellery
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="relative z-10 mt-6 flex justify-center animate-bounce text-cream-muted/50">
        <a href="#genres" aria-label="Scroll to collections">
          <ChevronDown className="h-5 w-5 hover:text-silver transition-colors" />
        </a>
      </div>
    </section>
  )
}
