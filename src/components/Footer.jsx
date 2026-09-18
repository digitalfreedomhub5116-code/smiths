import { useScrollReveal } from '../hooks/useScrollReveal'
import { GENRES } from '../store/cartStore'
import { useNavigate, Link } from 'react-router-dom'
import { Phone } from 'lucide-react'

export default function Footer() {
  const [ref, isVisible] = useScrollReveal(0.1)
  const navigate = useNavigate()

  const handleGenreClick = (slug) => {
    navigate(`/${slug}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer ref={ref} className="relative border-t border-silver/15 bg-obsidian">
      <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-silver/50 to-transparent" />

      <div
        className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="font-heading text-xl font-bold tracking-[0.2em] text-cream">
              SMITHS <span className="font-serif italic font-normal text-silver">Jewellery</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-muted/70">
              Fine 925 sterling silver jewellery, luxury silk scarfs, and curated gift combos. Handcrafted with liquid rhodium polish for timeless radiance.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-silver uppercase">
              Collections
            </h4>
            <ul className="mt-4 space-y-2.5">
              {GENRES.map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => handleGenreClick(g.slug)}
                    className="text-sm text-cream-muted/70 transition-colors hover:text-silver text-left cursor-pointer"
                  >
                    {g.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Helpline Support */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-silver uppercase">
              Customer Concierge
            </h4>
            <p className="mt-4 text-xs text-cream-muted/70 leading-relaxed">
              For order status, custom sizing & bespoke jewellery requests:
            </p>
            <div className="mt-3.5">
              <a
                href="tel:7470012222"
                className="inline-flex items-center gap-2.5 rounded-xl border border-silver/30 bg-charcoal px-4 py-2.5 text-sm font-bold text-silver hover:border-silver hover:bg-silver hover:text-obsidian transition-all group shadow-md shadow-black/30"
              >
                <Phone className="h-4 w-4 text-silver group-hover:text-obsidian transition-colors shrink-0" />
                <span className="font-mono tracking-wider">7470012222</span>
              </a>
              <span className="block mt-2 text-[11px] text-cream-muted/50">
                Mon – Sat · 10:00 AM – 7:00 PM IST
              </span>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-silver uppercase">
              Exclusive Inquiries
            </h4>
            <p className="mt-4 text-sm text-cream-muted/70">
              Receive private access to new silver drops and seasonal releases.
            </p>
            <div className="mt-3 flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-l-full border border-charcoal-light bg-charcoal px-4 py-2.5 text-sm text-cream placeholder-cream-muted/40 outline-none transition-colors focus:border-silver/50"
              />
              <button className="rounded-r-full bg-silver px-5 py-2.5 text-sm font-bold text-obsidian transition-all hover:bg-silver-light cursor-pointer">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-charcoal-light pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-cream-muted/40">
            © 2026 Smiths Jewellery. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/privacy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="text-xs text-cream-muted/50 transition-colors hover:text-silver"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="text-xs text-cream-muted/50 transition-colors hover:text-silver"
            >
              Terms of Service
            </Link>
            <Link
              to="/shipping-policy"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="text-xs text-cream-muted/50 transition-colors hover:text-silver"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
