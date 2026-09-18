export default function MarqueeBanner() {
  const items = [
    '925 STERLING SILVER',
    '✦',
    'FINE RHODIUM POLISH',
    '✦',
    'SOLITAIRE PENDANTS & CHOKERS',
    '✦',
    'TENNIS BRACELETS & CUFFS',
    '✦',
    'CRYSTAL TEARDROP EARRINGS',
    '✦',
    '100% PURE MULBERRY SILK SCARFS',
    '✦',
    'CURATED LUXURY GIFT COMBOS',
    '✦',
    'NICKEL-FREE & HYPOALLERGENIC',
    '✦',
    'PAN-INDIA EXPRESS SHIPPING',
    '✦',
  ]

  return (
    <div className="relative overflow-hidden border-y border-gold/10 bg-charcoal/60 py-3.5 backdrop-blur-sm">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`mx-4 sm:mx-6 text-[11px] sm:text-xs font-semibold tracking-[0.25em] ${
              item === '✦' ? 'text-gold' : 'text-cream-muted/80'
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-obsidian to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-obsidian to-transparent" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}
