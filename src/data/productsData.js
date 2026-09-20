import { REVIEWS_POOL } from './reviewsData.js'

export const DEFAULT_JEWELLERY_IMAGE =
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80'

const DUMMY_GALLERY = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80',
  'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
]

export const GENRES = [
  {
    id: 'NECKLACES',
    label: 'Necklaces',
    slug: 'necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    tagline: 'Handcrafted 925 Sterling Silver Pendants & Chokers',
  },
  {
    id: 'BRACELETS',
    label: 'Bracelets',
    slug: 'bracelets',
    image: 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
    tagline: 'Lustrous Tennis Chains, Bangles & Polished Cuffs',
  },
  {
    id: 'EARRINGS',
    label: 'Earrings',
    slug: 'earrings',
    image: '/images/products/jc-ke-92/model-worn.jpg',
    tagline: 'Criss-Cross Pearl Studs, Solitaires & Huggie Hoops',
  },
  {
    id: 'RINGS',
    label: 'Rings',
    slug: 'rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
    tagline: 'Sterling Silver Bands & Solitaire Statement Rings',
  },
  {
    id: 'SCARFS',
    label: 'Scarfs',
    slug: 'scarfs',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80',
    tagline: 'Pure Mulberry Silk & Cashmere-Touch Stoles',
  },
  {
    id: 'COMBOS',
    label: 'Combos',
    slug: 'combos',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
    tagline: 'Curated Gift Sets in Velvet Presentation Boxes',
  },
]

const JEWELLERY_DESCRIPTIONS = {
  'Infinity Double Pearl Drop Earrings':
    'Grace your collection with the Infinity Double Pearl Drop Earrings. Featuring an architectural gold-vermeil figure-8 infinity loop cradling two radiant white pearls — a delicate round stud pearl at the top transitioning into an exquisite lustrous pearl below. Hypoallergenic, feather-light, and sculpted for timeless day-to-night glamour.',
  'Aura Criss-Cross Pearl Stud Earrings':
    'Command timeless elegance with the Aura Criss-Cross Pearl Stud Earrings (SKU: JC-KE-92). Sculpted with modern architectural symmetry, these earrings pair warm 18K gold polished crossover bars with a luminous rounded trillion-cut iridescent pearl cabochon. Capturing light from every perspective with an opalescent rainbow glow, this signature piece is featherlight, hypoallergenic, and finished with high-luster rhodium and gold plating for lasting radiance.',
  'Luxe Solitaire Silver Pendant':
    'Command timeless attention with the Luxe Solitaire Silver Pendant. Sculpted in authentic 925 hallmarked sterling silver and crowned with a brilliant round-cut AAA cubic zirconia that dances under every ray of light. Finished in high-luster rhodium for lasting tarnish resistance.',
  'Celestial Crescent Moon Choker':
    'Embrace celestial poetry with the Crescent Moon Choker. Delicately curved polished silver rests gracefully along the collarbone, accented with micro-pave crystals that mimic starry constellations. A dreamlike centerpiece for both everyday charm and evening soirees.',
  'Sterling Silver Figaro Chain':
    'Rooted in classic Italian silversmith heritage, this solid sterling silver Figaro chain blends alternating oval and elongated links with precision beveled edges. Designed for enduring strength, effortless layering, and high-shine sophistication.',
  'Gothic Starlight Silver Locket':
    'Keep your dearest memories close with the Gothic Starlight Silver Locket. Hand-etched starburst engravings on an antique polished silver medallion frame open smoothly with a secure magnetic clasp. Built for heirloom longevity.',
  'Radiant Tennis Silver Bracelet':
    'The pinnacle of modern glamour. Featuring a seamless infinity line of hand-set AAA diamond-grade cubic zirconia stones set into solid 925 silver prongs with an ultra-secure double-latch safety clasp.',
  'Minimalist Polished Silver Cuff':
    'Pure architectural symmetry. Forged from cold-rolled solid silver, this open-ended cuff flexes gently to contour your wrist perfectly. High-mirror finish gives it an immaculate liquid chrome glow.',
  'Silver Cuban Link Chain Bracelet':
    'Bold, weighty, and unapologetically stylish. Interlocking flat-beveled silver links drape comfortably around the wrist, secured with a custom Smiths engraved box lock.',
  'Aurora Crystal Teardrop Earrings':
    'Catching every glance with graceful motion, the Aurora Teardrop Earrings showcase faceted crystal briolettes suspended from slender sterling silver hooks. Feather-light and hypoallergenic.',
  'Classic Princess-Cut Solitaire Studs':
    'The quintessential silver stud. Square princess-cut stones held securely in four-prong 925 silver basket mounts. Features comfortable friction backs that keep them centered all day.',
  'Midnight Silver Huggie Hoops':
    'Chic, snug-fitting hoops embedded with a row of shimmering pavé crystals. Engineered with a smooth snap-click closure that will never catch on clothes or hair.',
  'Eternal Wave Sterling Silver Band':
    'Inspired by the fluid rhythm of ocean waves, this contoured silver ring features alternating polished and brushed silver textures. Ergonomically shaped for seamless 24/7 comfort.',
  'Crown Solitaire CZ Silver Ring':
    'Regal and majestic. A six-prong elevated crown setting elevates a hand-faceted solitaire stone above a pavé encrusted 925 silver band.',
  'Monogram Silver Silk Satin Scarf':
    'Crafted from 100% pure Mulberry silk with hand-rolled hems, this lustrous scarf features an ethereal silver-toned geometric monogram. Drapes with fluid elegance across the shoulders or neck.',
  'Midnight Cashmere Touch Winter Scarf':
    'Ultra-soft brushed wool and cashmere blend with subtle silver metallic thread weaving throughout the fringe. Wraps you in warmth while delivering refined luxury aesthetics.',
  'The Royal Silver Ensemble':
    'The definitive luxury pairing. Combines our bestselling Luxe Solitaire Silver Pendant with matching Princess-Cut Solitaire Studs, nestled inside a signature Smiths velvet presentation box.',
  'Signature Luxe Gift Box':
    'The ultimate gesture of affection. Uniting the Minimalist Polished Silver Cuff and the Monogram Silver Silk Scarf inside a ribbon-tied velvet gift box complete with an authenticity certificate.',
}

const RAW_PRODUCTS = [
  // ── NECKLACES ──
  {
    id: 1,
    name: 'Luxe Solitaire Silver Pendant',
    genre: 'NECKLACES',
    price: 1299,
    originalPrice: 2599,
    reviewCount: 19,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80',
    ],
  },
  {
    id: 2,
    name: 'Celestial Crescent Moon Choker',
    genre: 'NECKLACES',
    price: 1499,
    originalPrice: 2999,
    reviewCount: 15,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    ],
  },
  {
    id: 3,
    name: 'Sterling Silver Figaro Chain',
    genre: 'NECKLACES',
    price: 1099,
    originalPrice: 2199,
    reviewCount: 11,
    rating: 4.7,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
    ],
  },
  {
    id: 4,
    name: 'Gothic Starlight Silver Locket',
    genre: 'NECKLACES',
    price: 1699,
    originalPrice: 3399,
    reviewCount: 23,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80',
    ],
  },

  // ── BRACELETS ──
  {
    id: 5,
    name: 'Radiant Tennis Silver Bracelet',
    genre: 'BRACELETS',
    price: 1399,
    originalPrice: 2799,
    reviewCount: 17,
    rating: 4.9,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    ],
  },
  {
    id: 6,
    name: 'Minimalist Polished Silver Cuff',
    genre: 'BRACELETS',
    price: 899,
    originalPrice: 1799,
    reviewCount: 13,
    rating: 4.7,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
      'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
    ],
  },
  {
    id: 7,
    name: 'Silver Cuban Link Chain Bracelet',
    genre: 'BRACELETS',
    price: 1199,
    originalPrice: 2399,
    reviewCount: 15,
    rating: 4.8,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80',
      'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
    ],
  },

  // ── EARRINGS ──
  {
    id: 18,
    name: 'Infinity Double Pearl Drop Earrings',
    sku: 'JC-KE-98',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 36,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/infinity-pearl-double/hero-satin-pair.jpg',
    gallery: [
      '/images/products/infinity-pearl-double/hero-satin-pair.jpg',
      '/images/products/infinity-pearl-double/model-worn.jpg',
      '/images/products/infinity-pearl-double/detail-held.jpg',
      '/images/products/infinity-pearl-double/macro-satin-detail.jpg',
      '/images/products/infinity-pearl-double/lifestyle-satin-glow.jpg',
    ],
  },
  {
    id: 17,
    name: 'Aura Criss-Cross Pearl Stud Earrings',
    sku: 'JC-KE-92',
    genre: 'EARRINGS',
    price: 799,
    originalPrice: 1699,
    reviewCount: 42,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-92/hero-studio.jpg',
    gallery: [
      '/images/products/jc-ke-92/hero-studio.jpg',
      '/images/products/jc-ke-92/model-worn.jpg',
      '/images/products/jc-ke-92/detail-held.jpg',
      '/images/products/jc-ke-92/macro-focus.jpg',
      '/images/products/jc-ke-92/lifestyle-reference.jpg',
    ],
  },
  {
    id: 8,
    name: 'Aurora Crystal Teardrop Earrings',
    genre: 'EARRINGS',
    price: 999,
    originalPrice: 1999,
    reviewCount: 21,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',
    ],
  },
  {
    id: 9,
    name: 'Classic Princess-Cut Solitaire Studs',
    genre: 'EARRINGS',
    price: 799,
    originalPrice: 1599,
    reviewCount: 25,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=900&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',
    ],
  },
  {
    id: 10,
    name: 'Midnight Silver Huggie Hoops',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1699,
    reviewCount: 14,
    rating: 4.7,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',
    ],
  },

  // ── RINGS ──
  {
    id: 11,
    name: 'Eternal Wave Sterling Silver Band',
    genre: 'RINGS',
    price: 749,
    originalPrice: 1499,
    reviewCount: 16,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80',
    ],
  },
  {
    id: 12,
    name: 'Crown Solitaire CZ Silver Ring',
    genre: 'RINGS',
    price: 999,
    originalPrice: 1999,
    reviewCount: 22,
    rating: 4.9,
    badCount: 2,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',
    ],
  },

  // ── SCARFS ──
  {
    id: 13,
    name: 'Monogram Silver Silk Satin Scarf',
    genre: 'SCARFS',
    price: 1199,
    originalPrice: 2399,
    reviewCount: 13,
    rating: 4.9,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80',
      'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=900&q=80',
    ],
  },
  {
    id: 14,
    name: 'Midnight Cashmere Touch Winter Scarf',
    genre: 'SCARFS',
    price: 1399,
    originalPrice: 2799,
    reviewCount: 11,
    rating: 4.8,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=900&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80',
    ],
  },

  // ── COMBOS ──
  {
    id: 15,
    name: 'The Royal Silver Ensemble',
    genre: 'COMBOS',
    price: 1999,
    originalPrice: 3999,
    reviewCount: 29,
    rating: 5.0,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',
    ],
  },
  {
    id: 16,
    name: 'Signature Luxe Gift Box',
    genre: 'COMBOS',
    price: 2399,
    originalPrice: 4799,
    reviewCount: 19,
    rating: 4.9,
    badCount: 1,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80',
      'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80',
    ],
  },
]

export function buildProductReviews(product = {}) {
  const reviews = []
  const count = Number(product.reviewCount) || 12
  const badTarget = Number(product.badCount) || 2
  const numId = Number(product.id) || 1

  // Add critical reviews first (1 to 2)
  for (let i = 0; i < badTarget && i < REVIEWS_POOL.critical.length; i++) {
    const pick = REVIEWS_POOL.critical[(numId + i) % REVIEWS_POOL.critical.length]
    reviews.push({
      id: `bad-${numId}-${i}`,
      name: pick.name,
      rating: pick.rating,
      date: `${i + 2} days ago`,
      text: pick.text,
      verified: true,
    })
  }

  // Category specific positive reviews
  const genre = product.genre || 'NECKLACES'
  const genreList = REVIEWS_POOL.genreSpecific[genre] || []
  if (genreList.length > 0 && reviews.length < count) {
    const genreReview = genreList[numId % genreList.length]
    reviews.push({
      id: `genre-${numId}`,
      name: genreReview.name,
      rating: 5,
      date: 'Just now',
      text: genreReview.text,
      verified: true,
    })
  }

  // Fill remaining with general reviews
  let posIndex = (numId * 3) % REVIEWS_POOL.positive.length
  while (reviews.length < count) {
    const item = REVIEWS_POOL.positive[posIndex % REVIEWS_POOL.positive.length]
    reviews.push({
      id: `pos-${numId}-${reviews.length}`,
      name: item.name,
      rating: reviews.length % 4 === 0 ? 4 : 5,
      date: `${(reviews.length + 1) * 2} days ago`,
      text: item.text,
      verified: true,
    })
    posIndex++
  }

  return reviews
}

export const MOCK_PRODUCTS = RAW_PRODUCTS.map((p) => {
  const reviews = buildProductReviews(p)
  const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-silver`
  const fullName = `${p.name} - Smiths Jewellery`
  const description =
    JEWELLERY_DESCRIPTIONS[p.name] ||
    `Handcrafted 925 sterling silver ${p.name} from Smiths Jewellery.`

  const originalPrice = p.originalPrice || 2599
  const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100)
  const discountBadge = `-${discountPercent}%`
  const isBestseller = p.id === 1 || p.id === 5 || p.id === 8 || p.id === 15 || p.id === 17 || p.id === 18

  const isScarf = p.genre === 'SCARFS'
  const isAuraEarrings = p.name === 'Aura Criss-Cross Pearl Stud Earrings' || p.id === 17
  const isInfinityPearl = p.name === 'Infinity Double Pearl Drop Earrings' || p.id === 18

  return {
    ...p,
    slug,
    fullName,
    originalPrice,
    discountPercent,
    isBestseller,
    image: p.image || DEFAULT_JEWELLERY_IMAGE,
    gallery:
      Array.isArray(p.gallery) && p.gallery.length > 0
        ? p.gallery
        : [p.image || DEFAULT_JEWELLERY_IMAGE],
    description,
    features: isInfinityPearl
      ? [
          'SKU: JC-KE-98 — Sculptural figure-8 infinity twist silhouette',
          'Dual luminous pearl composition (top stud & lower drop)',
          '18K Warm Gold finish over certified 925 Sterling Silver core',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Comfort-fit post backings with secure friction closure',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isAuraEarrings
      ? [
          'SKU: JC-KE-92 — Signature Korean crossover architectural silhouette',
          'Luminous rounded trillion-cut iridescent mother-of-pearl cabochon',
          'Warm 18K Gold finish over certified 925 Sterling Silver base',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Comfort-fit post backings with secure silicone friction clutch',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isScarf
      ? [
          '100% Pure Mulberry Silk / Cashmere blend texture',
          'Hand-rolled and stitched edges',
          'Breathable, lightweight and rich drape',
          'Arrives in Smiths Signature Gift Packaging',
        ]
      : [
          'Crafted from certified 925 Sterling Silver',
          'Triple Rhodium Plated for enduring tarnish resistance',
          'AAA Grade brilliant cubic zirconia stones',
          '100% Hypoallergenic — Nickel-Free and Lead-Free',
          'Includes Velvet Presentation Box & Authenticity Certificate',
        ],
    dimensions: isInfinityPearl
      ? '24mm x 12mm / Ultra-Lightweight (3.4g per pair)'
      : isAuraEarrings
      ? '18mm x 14mm / Ultra-Lightweight (3.2g per pair)'
      : isScarf
      ? '90cm x 90cm'
      : 'Adjustable Length / Standard Comfort Fit',
    material: (isInfinityPearl || isAuraEarrings) ? '18K Gold Plated 925 Sterling Silver & Luminous Pearls' : isScarf ? 'Pure Silk / Cashmere Blend' : '925 Sterling Silver',
    finish: (isInfinityPearl || isAuraEarrings) ? 'High-Polish Warm Gold with Gloss Pearl Sheen' : isScarf ? 'Lustrous Silk Satin' : 'High-Luster Rhodium & Polished Silver',
    keyring: (isInfinityPearl || isAuraEarrings) ? 'Hypoallergenic Security Stud Post' : 'Hypoallergenic Security Clasp',
    durability: 'Tarnish-Resistant Daily Wear',
    reviews,
  }
})
