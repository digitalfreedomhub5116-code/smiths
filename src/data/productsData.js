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
  'JC-KE-83':
    'Evoke celestial wonder with the JC-KE-83 Enchanted Dancing Fairy Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver with a radiant 18K gold vermeil finish, each earring depicts an ethereal dancing fairy ballerina poised in graceful flight. Her luminous translucent wings are shaped from opalescent cat\'s eye moonstone cabochons that shimmer with pearlescent brilliance, accented by a shimmering micro-pavé cubic zirconia crystal ballerina skirt. Featherlight, hypoallergenic, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening magic.',
  'JC-KE-84':
    'Channel opulent regal sophistication with the JC-KE-84 Lavender Cushion Drop Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver with a rich 18K gold vermeil finish, each earring showcases an ethereal translucent lavender chalcedony cushion cabochon stud resting atop a mesmerizing pavé amethyst and purple sapphire crystal drop. Hypoallergenic, featherlight, and finished with secure comfort-fit stud posts for timeless evening luxury.',
  'JC-KE-91':
    'Channel royal refinement with the JC-KE-91 Pavé Bow Teardrop Pearl Earrings. Sculpted in radiant 18K gold vermeil over certified 925 hallmarked sterling silver, each earring showcases a delicate bow motif that flows into an open teardrop halo encrusted with shimmering pavé-set cubic zirconia crystals. Nestled within the teardrop cradle is a floating, high-luster round white freshwater pearl that radiates iridescent brilliance. Complete with hypoallergenic stud backings for seamless, lightweight day-to-evening elegance.',
  'JC-KE-85':
    'Captivate every gaze with the JC-KE-85 Pavé Crystal Ribbon Bow Drop Earrings. Masterfully sculpted in warm 18K gold over certified 925 hallmarked sterling silver, each earring features a dimensional ribbon bow motif densely handset with brilliant diamond-cut cubic zirconia crystals. Suspended beneath are dual articulated pavé tennis ribbons that cascade with fluid kinetic sparkle at every turn. Hypoallergenic, featherlight, and engineered for unforgettable day-to-night glamour.',
  'JC-KE-36':
    'Radiate celestial glamour with the JC-KE-36 Sunburst Pearl Fan Ear Jacket Earrings. Featuring a luminous freshwater pearl stud resting on the earlobe, anchored by an exquisite five-spoke gold sunburst fan set with graduated round pearls curving gracefully beneath. Sculpted in warm 18K gold vermeil over certified 925 hallmarked sterling silver, this convertible statement pair captures light with every turn, adding modern sculptural sophistication to any evening or everyday look.',
  'JC-KE-86':
    'Make a bold sculptural statement with the JC-KE-86 Croissant Ribbed Silver C-Hoop Earrings. Precision cast from certified 925 hallmarked sterling silver and finished with mirror-polished triple rhodium plating for enduring tarnish resistance. Featuring a three-tier fluted dome silhouette that catches light dynamically from every angle, these chunky lightweight hoops offer secure comfort-fit stud post closures for effortless day-to-night luxury.',
  'JC-KE-38':
    'Exude refined Korean luxury with the JC-KE-38 Pearl Arc Ear Jacket Earrings. Featuring a luminous round freshwater pearl stud worn on the lobe, paired with an interchangeable curved crescent arc of five graduated luster pearls fanning gracefully beneath the ear. Sculpted in warm 18K gold over certified 925 sterling silver, this convertible 2-in-1 design transitions effortlessly from minimalist pearl studs to statement red-carpet ear jacket radiance.',
  'JC-KE-55':
    'Embrace botanical radiance with the JC-KE-55 Laurel Leaf Pearl Ear Climbers. Sculpted in warm 18K gold plating over certified 925 sterling silver, each earring features an arching laurel branch encrusted with shimmering pavé cubic zirconia crystals, cradling a lustrous round pearl and finished with a sparkling solitaire accent stone. Hypoallergenic, featherlight, and ergonomically contoured for comfortable all-day wear.',
  'JC-KE-87':
    'Evoke vintage Parisian romance with the JC-KE-87 Mother of Pearl Flower Fan Drop Earrings. Sculpted in certified 925 hallmarked sterling silver with a luminous 18K gold vermeil finish, each earring highlights a high-polish teardrop stud cascading down to an architectural five-petal fan flower drop. Inset with iridescent ivory mother-of-pearl enamel bordered by fine golden beading, each petal captures the light with shimmering pearlescent grace. Hypoallergenic, featherlight, and articulated for graceful motion.',
  'JC-KE-89':
    'Capture celestial brilliance with the JC-KE-89 Infinity Ribbon Solitaire CZ Stud Earrings. Sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring forms an exquisite interlocking crossover ribbon silhouette — one gleaming high-polish gold arm intersecting with a dazzling strand handset with micro-pavé AAA cubic zirconia crystals. Suspended at the center is a brilliant round diamond-cut solitaire crystal that floats with mesmerizing fire. Hypoallergenic, lightweight, and modern.',
  'JC-KE-76':
    'Channel winter wonderland splendor with the JC-KE-76 Starlight Snowflake Fringe Dangle Earrings. Mastercrafted in certified 925 hallmarked sterling silver with a triple rhodium plating for lasting mirror shine, each earring presents an intricately sculpted snowflake cluster hand-encrusted with brilliant round-cut AAA cubic zirconia stones. Flowing beneath are dual flexible liquid-silver snake chain fringe ribbons that shimmer with every movement. Hypoallergenic, featherlight, and unforgettable.',
  'JC-KE-63':
    'Adorn your ears with everlasting harmony wearing the JC-KE-63 Pearl & Diamond Wreath Halo Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver layered in luxurious 18K gold vermeil, each earring forms an open circular garland wreath featuring six hand-selected round freshwater pearls alternating with sparkling round-cut AAA cubic zirconia gemstones. The balanced open-circle architecture creates a radiant crown on the lobe. Hypoallergenic, featherlight, and timeless.',
  'JC-KE-80':
    'Celebrate perennial spring elegance with the JC-KE-80 Sakura Blossom Halo Wreath Earrings. Sculpted in certified 925 hallmarked sterling silver plated in rich 18K gold vermeil, each earring features a charming five-petal cherry blossom flower enameled in shimmering blush-pink with a delicate sparkling crystal pistil center. The bloom crowns a full halo circular ring hand-set with glittering round-cut AAA cubic zirconia stones. Hypoallergenic, featherlight, and infused with romantic charm.',
  'JC-KE-53':
    'Embrace vintage Parisian romance and royal grace with the JC-KE-53 Golden Camellia Rose Pearl Wreath Stud Earrings. Sculpted in certified 925 hallmarked sterling silver layered in luminous 18K gold vermeil, each earring highlights an intricate openwork filigree camellia rose stud that crowns a circular garland of seven hand-matched, high-luster freshwater pearls. The delicate scalloped gold prongs cradle each iridescent pearl with timeless symmetry, creating a radiant halo of light on the lobe. Hypoallergenic, featherlight, and equipped with ergonomic comfort-fit stud posts for effortless day-to-evening sophistication.',
  'JC-KE-67':
    'Capture cosmic wonder with the JC-KE-67 Celestial Starburst Spiral Pearl Drop Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents an eight-point starlight starburst stud hand-encrusted with sparkling micro-pavé AAA cubic zirconia crystals. Articulated beneath is an architectural twisting ribbon spiral cage cradling a luminous iridescent freshwater pearl that floats weightlessly within. Balanced, articulated for fluid motion, and fitted with ergonomic comfort-fit stud posts for unforgettable day-to-evening allure.',
  'JC-KE-16':
    'Channel regal majesty and grace with the JC-KE-16 Royal Pavé Swan Opalescent Moonstone Drop Earrings. Sculpted in certified 925 hallmarked sterling silver plated in rich 18K gold vermeil, each earring presents an intricately sculpted royal swan stud with graceful arched neck and swept wings handset with brilliant micro-pavé AAA cubic zirconia stones. Suspended beneath is an articulated gold ribbon cage cradling a luminous opalescent cat’s eye moonstone cabochon that gleams with an ethereal milky light. Hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for unforgettable elegance.',
  'JC-KE-56':
    'Blossom with botanical refinement wearing the JC-KE-56 Pavé Tulip Bud Pearl Ear Climber Jacket Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, this versatile 2-in-1 design features a luminous freshwater pearl stud resting gracefully on the ear lobe, paired with an interchangeable curving ear jacket stem that sweeps underneath. The contoured golden stem showcases a blossoming tulip bud hand-encrusted with brilliant micro-pavé AAA cubic zirconia stones, balanced by a miniature accent pearl bud. Hypoallergenic, featherlight, and ergonomically designed for all-day comfort and modern day-to-evening allure.',
  'JC-KE-37':
    'Evoke high-fashion Parisian allure with the JC-KE-37 Pavé Ribbon Bow South Sea Pearl Drop Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver plated in rich 18K gold vermeil, each earring highlights an oversized, three-dimensional couture ribbon bow handset with brilliant micro-pavé AAA cubic zirconia crystals. Articulated beneath is a magnificent 10mm high-luster pearlescent drop that sways with fluid grace. Hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening glamour.',
  'JC-KE-82':
    'Command bold two-tone sophistication with the JC-KE-82 Gold Dome & Textured Silver Fan Drop Earrings. Sculpted in certified 925 hallmarked sterling silver, each earring pairs a luminous high-polish 18K gold vermeil dome stud with a striking hand-etched radiating silver fan drop reminiscent of a cascading seashell. The mesmerizing contrasting metals create a modern architectural statement that transitions effortlessly from daywear to black-tie elegance. Hypoallergenic and featherlight with secure comfort-fit stud posts.',
  'JC-KE-77':
    'Elevate your signature look with the JC-KE-77 Black Enamel & Pavé Crystal Bow Stud Earrings. Sculpted in certified 925 hallmarked sterling silver with a luminous 18K gold vermeil finish, each earring showcases an oversized dimensional ribbon bow motif hand-set with brilliant round-cut cubic zirconia crystals along every edge. Deep black glossy enamel fills each petal panel for dramatic contrast and a couture finish. A solitaire round CZ gleams at the bow center knot. Hypoallergenic, featherlight, and perfect for bold day-to-evening glamour.',
  'JC-KE-1':
    'Bloom with botanical romance wearing the JC-KE-1 Pink Tulip Pearl & Pavé Earrings. Sculpted in certified 925 hallmarked sterling silver with a warm 18K gold vermeil finish, each earring showcases a delicate blush-pink baroque pearl tulip bud — its petals gently furled — resting above a lustrous round freshwater pearl drop. Two lush green enamel marquise leaves cascade from the golden stem, while a pavé-encrusted horseshoe loop glitters with hand-set AAA cubic zirconia crystals below. An enchanting garden-in-bloom masterpiece, hypoallergenic and featherlight for effortless all-day elegance.',
  'JC-KE-88':
    'Command timeless charm with the JC-KE-88 Pearl Heart Bow Drop Earrings. Handcrafted with an open-heart motif encrusted in delicate micro-pearls suspended from polished 18K gold prongs, leading down into a lustrous white enamel ribbon bow drop with sleek gold perimeter detailing. Hypoallergenic, featherlight, and engineered for modern Korean elegance.',
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
    id: 40,
    name: 'JC-KE-56',
    sku: 'JC-KE-56',
    slug: 'jc-ke-56',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 47,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-56/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-56/hero-satin-pair.jpg',
      '/images/products/jc-ke-56/detail-studio-pair.jpg',
      '/images/products/jc-ke-56/macro-satin-detail.jpg',
      '/images/products/jc-ke-56/macro-studio-detail.jpg',
      '/images/products/jc-ke-56/detail-tulip-focus.jpg',
    ],
  },
  {
    id: 39,
    name: 'JC-KE-37',
    sku: 'JC-KE-37',
    slug: 'jc-ke-37',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 49,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-37/hero-plinth-pair.jpg',
    gallery: [
      '/images/products/jc-ke-37/hero-plinth-pair.jpg',
      '/images/products/jc-ke-37/detail-fingers.jpg',
      '/images/products/jc-ke-37/macro-bow-detail.jpg',
      '/images/products/jc-ke-37/detail-held.jpg',
      '/images/products/jc-ke-37/model-portrait.jpg',
    ],
  },
  {
    id: 38,
    name: 'JC-KE-16',
    sku: 'JC-KE-16',
    slug: 'jc-ke-16',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 48,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-16/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-16/hero-satin-pair.jpg',
      '/images/products/jc-ke-16/detail-studio-pair.jpg',
      '/images/products/jc-ke-16/macro-satin-detail.jpg',
      '/images/products/jc-ke-16/detail-held.jpg',
      '/images/products/jc-ke-16/model-portrait.jpg',
    ],
  },
  {
    id: 37,
    name: 'JC-KE-67',
    sku: 'JC-KE-67',
    slug: 'jc-ke-67',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 46,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-67/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-67/hero-satin-pair.jpg',
      '/images/products/jc-ke-67/detail-satin-edge.jpg',
      '/images/products/jc-ke-67/macro-satin-detail.jpg',
      '/images/products/jc-ke-67/detail-held.jpg',
      '/images/products/jc-ke-67/model-portrait.jpg',
    ],
  },
  {
    id: 36,
    name: 'JC-KE-53',
    sku: 'JC-KE-53',
    slug: 'jc-ke-53',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 44,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-53/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-53/hero-satin-pair.jpg',
      '/images/products/jc-ke-53/macro-satin-detail.jpg',
      '/images/products/jc-ke-53/detail-held.jpg',
      '/images/products/jc-ke-53/model-worn.jpg',
      '/images/products/jc-ke-53/model-portrait.jpg',
    ],
  },
  {
    id: 35,
    name: 'JC-KE-80',
    sku: 'JC-KE-80',
    slug: 'jc-ke-80',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 48,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-80/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-80/hero-satin-pair.jpg',
      '/images/products/jc-ke-80/macro-satin-detail.jpg',
      '/images/products/jc-ke-80/detail-held.jpg',
      '/images/products/jc-ke-80/model-worn.jpg',
      '/images/products/jc-ke-80/model-portrait.jpg',
    ],
  },
  {
    id: 34,
    name: 'JC-KE-63',
    sku: 'JC-KE-63',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 39,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-63/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-63/hero-satin-pair.jpg',
      '/images/products/jc-ke-63/macro-detail.jpg',
      '/images/products/jc-ke-63/detail-held.jpg',
      '/images/products/jc-ke-63/model-worn.jpg',
      '/images/products/jc-ke-63/model-portrait.jpg',
    ],
  },
  {
    id: 33,
    name: 'JC-KE-76',
    sku: 'JC-KE-76',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 52,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-76/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-76/hero-satin-pair.jpg',
      '/images/products/jc-ke-76/detail-held.jpg',
      '/images/products/jc-ke-76/macro-satin-detail.jpg',
      '/images/products/jc-ke-76/model-worn.jpg',
    ],
  },
  {
    id: 32,
    name: 'JC-KE-89',
    sku: 'JC-KE-89',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 46,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-89/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-89/hero-satin-pair.jpg',
      '/images/products/jc-ke-89/macro-satin-detail.jpg',
      '/images/products/jc-ke-89/model-worn.jpg',
      '/images/products/jc-ke-89/model-portrait.jpg',
    ],
  },
  {
    id: 31,
    name: 'JC-KE-87',
    sku: 'JC-KE-87',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 43,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-87/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-87/hero-satin-pair.jpg',
      '/images/products/jc-ke-87/detail-held.jpg',
      '/images/products/jc-ke-87/model-worn.jpg',
      '/images/products/jc-ke-87/model-portrait.jpg',
    ],
  },
  {
    id: 30,
    name: 'JC-KE-1',
    sku: 'JC-KE-1',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 47,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-1/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-1/hero-satin-pair.jpg',
      '/images/products/jc-ke-1/detail-held.jpg',
      '/images/products/jc-ke-1/model-worn.jpg',
      '/images/products/jc-ke-1/model-portrait.jpg',
    ],
  },
  {
    id: 29,
    name: 'JC-KE-77',
    sku: 'JC-KE-77',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 44,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-77/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-77/hero-satin-pair.jpg',
      '/images/products/jc-ke-77/model-worn.jpg',
      '/images/products/jc-ke-77/detail-held.jpg',
      '/images/products/jc-ke-77/packaging-display.jpg',
    ],
  },
  {
    id: 28,
    name: 'JC-KE-82',
    sku: 'JC-KE-82',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 41,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-82/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-82/hero-satin-pair.jpg',
      '/images/products/jc-ke-82/model-worn-1.jpg',
      '/images/products/jc-ke-82/detail-held.jpg',
      '/images/products/jc-ke-82/macro-satin-detail.jpg',
      '/images/products/jc-ke-82/model-worn-2.jpg',
    ],
  },
  {
    id: 27,
    name: 'JC-KE-83',
    sku: 'JC-KE-83',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 39,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-83/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-83/hero-satin-pair.jpg',
      '/images/products/jc-ke-83/macro-satin-detail.jpg',
      '/images/products/jc-ke-83/model-worn.jpg',
      '/images/products/jc-ke-83/detail-held.jpg',
      '/images/products/jc-ke-83/packaging-display.jpg',
    ],
  },
  {
    id: 26,
    name: 'JC-KE-84',
    sku: 'JC-KE-84',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 38,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-84/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-84/hero-satin-pair.jpg',
      '/images/products/jc-ke-84/macro-satin-detail.jpg',
      '/images/products/jc-ke-84/model-worn.jpg',
      '/images/products/jc-ke-84/detail-held.jpg',
      '/images/products/jc-ke-84/packaging-display.jpg',
    ],
  },
  {
    id: 25,
    name: 'JC-KE-91',
    sku: 'JC-KE-91',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 36,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-91/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-91/hero-satin-pair.jpg',
      '/images/products/jc-ke-91/macro-satin-detail.jpg',
      '/images/products/jc-ke-91/model-worn.jpg',
      '/images/products/jc-ke-91/detail-held.jpg',
      '/images/products/jc-ke-91/packaging-display.jpg',
    ],
  },
  {
    id: 24,
    name: 'JC-KE-85',
    sku: 'JC-KE-85',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 33,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-85/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-85/hero-satin-pair.jpg',
      '/images/products/jc-ke-85/macro-satin-detail.jpg',
      '/images/products/jc-ke-85/model-worn.jpg',
      '/images/products/jc-ke-85/detail-held.jpg',
      '/images/products/jc-ke-85/packaging-display.jpg',
    ],
  },
  {
    id: 23,
    name: 'JC-KE-36',
    sku: 'JC-KE-36',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 34,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-36/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-36/hero-satin-pair.jpg',
      '/images/products/jc-ke-36/model-worn.jpg',
      '/images/products/jc-ke-36/detail-held.jpg',
      '/images/products/jc-ke-36/ear-profile.jpg',
      '/images/products/jc-ke-36/packaging-display.jpg',
    ],
  },
  {
    id: 22,
    name: 'JC-KE-86',
    sku: 'JC-KE-86',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 35,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-86/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-86/hero-satin-pair.jpg',
      '/images/products/jc-ke-86/model-worn.jpg',
      '/images/products/jc-ke-86/detail-held.jpg',
      '/images/products/jc-ke-86/macro-detail.jpg',
      '/images/products/jc-ke-86/ear-profile.jpg',
    ],
  },
  {
    id: 21,
    name: 'JC-KE-38',
    sku: 'JC-KE-38',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 32,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-38/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-38/hero-satin-pair.jpg',
      '/images/products/jc-ke-38/model-worn.jpg',
      '/images/products/jc-ke-38/detail-held.jpg',
      '/images/products/jc-ke-38/macro-detail.jpg',
      '/images/products/jc-ke-38/ear-profile.jpg',
    ],
  },
  {
    id: 20,
    name: 'JC-KE-55',
    sku: 'JC-KE-55',
    genre: 'EARRINGS',
    price: 799,
    originalPrice: 1699,
    reviewCount: 31,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-55/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-55/hero-satin-pair.jpg',
      '/images/products/jc-ke-55/model-worn.jpg',
      '/images/products/jc-ke-55/detail-held.jpg',
      '/images/products/jc-ke-55/macro-satin-detail.jpg',
      '/images/products/jc-ke-55/packaging-display.jpg',
    ],
  },
  {
    id: 19,
    name: 'JC-KE-88',
    sku: 'JC-KE-88',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 28,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-88/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-88/hero-satin-pair.jpg',
      '/images/products/jc-ke-88/model-worn.jpg',
      '/images/products/jc-ke-88/detail-held.jpg',
      '/images/products/jc-ke-88/macro-satin-detail.jpg',
      '/images/products/jc-ke-88/packaging-display.jpg',
    ],
  },
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
  const slug = p.slug || `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-silver`
  const fullName = `${p.name} - Smiths Jewellery`
  const description =
    JEWELLERY_DESCRIPTIONS[p.name] ||
    `Handcrafted 925 sterling silver ${p.name} from Smiths Jewellery.`

  const originalPrice = p.originalPrice || 2599
  const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100)
  const discountBadge = `-${discountPercent}%`
  const isBestseller = p.id === 1 || p.id === 5 || p.id === 8 || p.id === 15 || p.id === 17 || p.id === 18 || p.id === 19 || p.id === 20 || p.id === 21 || p.id === 22 || p.id === 23 || p.id === 24 || p.id === 25 || p.id === 26 || p.id === 27 || p.id === 28 || p.id === 29 || p.id === 30 || p.id === 31 || p.id === 32 || p.id === 33 || p.id === 34 || p.id === 35 || p.id === 36 || p.id === 37 || p.id === 38 || p.id === 39 || p.id === 40

  const isScarf = p.genre === 'SCARFS'
  const isAuraEarrings = p.name === 'Aura Criss-Cross Pearl Stud Earrings' || p.id === 17
  const isInfinityPearl = p.name === 'Infinity Double Pearl Drop Earrings' || p.id === 18
  const isJcKe88 = p.name === 'JC-KE-88' || p.id === 19
  const isJcKe55 = p.name === 'JC-KE-55' || p.id === 20
  const isJcKe38 = p.name === 'JC-KE-38' || p.id === 21
  const isJcKe86 = p.name === 'JC-KE-86' || p.id === 22
  const isJcKe36 = p.name === 'JC-KE-36' || p.id === 23
  const isJcKe85 = p.name === 'JC-KE-85' || p.id === 24
  const isJcKe91 = p.name === 'JC-KE-91' || p.id === 25
  const isJcKe84 = p.name === 'JC-KE-84' || p.id === 26
  const isJcKe83 = p.name === 'JC-KE-83' || p.id === 27
  const isJcKe82 = p.name === 'JC-KE-82' || p.id === 28
  const isJcKe77 = p.name === 'JC-KE-77' || p.id === 29
  const isJcKe1 = p.name === 'JC-KE-1' || p.id === 30
  const isJcKe87 = p.name === 'JC-KE-87' || p.id === 31
  const isJcKe89 = p.name === 'JC-KE-89' || p.id === 32
  const isJcKe76 = p.name === 'JC-KE-76' || p.id === 33
  const isJcKe63 = p.name === 'JC-KE-63' || p.id === 34
  const isJcKe80 = p.name === 'JC-KE-80' || p.id === 35
  const isJcKe53 = p.name === 'JC-KE-53' || p.id === 36
  const isJcKe67 = p.name === 'JC-KE-67' || p.id === 37
  const isJcKe16 = p.name === 'JC-KE-16' || p.id === 38
  const isJcKe37 = p.name === 'JC-KE-37' || p.id === 39
  const isJcKe56 = p.name === 'JC-KE-56' || p.id === 40

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
    features: isJcKe56
      ? [
          'SKU: JC-KE-56 — Convertible 2-in-1 freshwater pearl stud and contoured ear climber jacket branch',
          'Sculpted blooming tulip flower motif handset with brilliant micro-pavé AAA cubic zirconia stones',
          'Dual high-luster freshwater pearls (primary lobe stud and accent bud)',
          'Cast in certified 925 hallmarked Sterling Silver with a warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe37
      ? [
          'SKU: JC-KE-37 — Dimensional couture ribbon bow handset with brilliant micro-pavé AAA cubic zirconia crystals',
          'Articulated 10mm high-luster pearl drop designed to sway with fluid graceful motion',
          'Cast in certified 925 hallmarked Sterling Silver with a warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Ergonomic comfort-fit post backings for secure, all-day featherlight wear',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe16
      ? [
          'SKU: JC-KE-16 — Majestic royal swan stud handset with brilliant micro-pavé AAA cubic zirconia crystals',
          'Articulated gold ribbon spiral cage cradling a luminous opalescent cat’s eye moonstone cabochon',
          'Cast in certified 925 hallmarked Sterling Silver with a warm, lasting 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Ergonomic comfort-fit post backings for secure, all-day featherlight wear',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe67
      ? [
          'SKU: JC-KE-67 — Celestial 8-point starburst stud with handset micro-pavé AAA cubic zirconia crystals',
          'Articulated gold spiral ribbon cage cradling a luminous high-luster freshwater pearl drop',
          'Cast in certified 925 hallmarked Sterling Silver with a warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Ergonomic comfort-fit post backings for secure, all-day featherlight wear',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe53
      ? [
          'SKU: JC-KE-53 — Dimensional openwork filigree camellia rose stud with full circular pearl wreath halo',
          'Seven hand-selected round freshwater pearls featuring deep orient and shimmering iridescent luster',
          'Cast in certified 925 hallmarked Sterling Silver with a warm, lasting 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Ergonomic comfort-fit post backings for secure, all-day featherlight wear',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe80
      ? [
          'SKU: JC-KE-80 — Sakura cherry blossom floral stud with full crystal pavé wreath halo ring',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Shimmering blush-pink enamel flower petals with bezel crystal pistil center',
          'Full circular garland halo set with brilliant AAA cubic zirconia crystals',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe63
      ? [
          'SKU: JC-KE-63 — Open circular wreath halo with alternating freshwater pearls and sparkling CZs',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Six hand-matched round freshwater pearls with high-luster iridescent sheen',
          'Handset AAA round brilliant cubic zirconia stones in secure prong settings',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe76
      ? [
          'SKU: JC-KE-76 — Sculptural 6-point snowflake stud with liquid-silver fringe streamer dangles',
          'Cast in certified 925 hallmarked Sterling Silver with enduring Triple Rhodium plating',
          'Handset multi-facet AAA cubic zirconia cluster with brilliant crystal fire',
          'Dual articulated flexible snake chain drops for fluid cascading motion',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe89
      ? [
          'SKU: JC-KE-89 — Modern crossover loop silhouette with floating round-cut diamond solitaire CZ',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Micro-pavé AAA cubic zirconia crystal ribbon strand paired with polished gold loop',
          'Secure 4-prong floating solitaire center stone for maximum light reflection',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe87
      ? [
          'SKU: JC-KE-87 — Art deco 5-petal fan flower drop with iridescent ivory mother-of-pearl enamel',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'High-polish teardrop stud post with articulated pendant jump ring connection',
          'Intricate golden beaded center florets and scalloped petal borders',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe1
      ? [
          'SKU: JC-KE-1 — Botanical tulip bud motif with blush baroque pearl & green enamel leaves',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold vermeil',
          'Hand-selected blush-pink baroque pearl tulip bud & lustrous round freshwater pearl drop',
          'Glossy vivid green enamel marquise leaf pair on golden stem',
          'Pavé horseshoe loop set with hand-placed AAA cubic zirconia crystals',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe77
      ? [
          'SKU: JC-KE-77 — Oversized dimensional ribbon bow with black enamel & pavé CZ',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Hand-set brilliant round-cut AAA cubic zirconia crystals along all bow edges',
          'Glossy black enamel petal fill for couture contrast',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe82
      ? [
          'SKU: JC-KE-82 — Architectural two-tone gold dome stud & etched silver fan drop',
          'Cast in certified 925 hallmarked Sterling Silver',
          'Radiant high-polish 18K gold vermeil dome contrasted with brushed rhodium fan',
          'Precision hand-etched radiating fan drop with seashell texture',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe83
      ? [
          'SKU: JC-KE-83 — Sculptural dancing fairy ballerina silhouette with iridescent wings',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          "Luminous opalescent cat's eye moonstone cabochon wings with pearlescent glow",
          'Handset micro-pavé AAA cubic zirconia crystal ballerina skirt',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe84
      ? [
          'SKU: JC-KE-84 — Translucent lavender cushion cabochon stud & pavé amethyst mosaic cushion drop',
          'Cast in certified 925 hallmarked Sterling Silver with rich 18K Gold finish',
          'Multi-tone pavé amethyst and purple sapphire cubic zirconia crystal setting',
          'Luminous lavender chalcedony / quartz translucent cushion cabochon',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe91
      ? [
          'SKU: JC-KE-91 — Pavé crystal bow stud & open teardrop loop with suspended floating pearl',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Hand-selected luminous round freshwater pearl focal drop',
          'Micro-pavé AAA cubic zirconia stones along the bow and teardrop halo',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe85
      ? [
          'SKU: JC-KE-85 — Micro-pavé crystal ribbon bow stud & dual cascading tennis streamer drop',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
          'Hand-set AAA brilliant diamond-cut cubic zirconia crystals with diamond sparkle',
          'Articulated dual-strand drop ribbons for fluid light-catching motion',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe36
      ? [
          'SKU: JC-KE-36 — 5-pearl radiating sunburst fan ear jacket silhouette',
          'Warm 18K Gold finish over certified 925 hallmarked Sterling Silver core',
          'Hand-selected luminous freshwater pearl studs & matching arc pearls',
          'Convertible 2-in-1 Design: wear solo as classic pearl studs or paired with the sunburst fan drop',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe86
      ? [
          'SKU: JC-KE-86 — Chunky three-tier fluted croissant sculpted C-hoop silhouette',
          'Cast in authentic hallmarked 925 Sterling Silver',
          'Triple Rhodium Plated for enduring tarnish resistance and high-mirror shine',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Secure stud post backings with snug friction clutch',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe38
      ? [
          'SKU: JC-KE-38 — Korean designer modular pearl stud & 5-pearl crescent arc ear jacket',
          '2-in-1 Convertible Design: wear solo as classic pearl studs or paired with the crescent fan drop',
          'Warm 18K Gold finish over certified 925 Sterling Silver core',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Multi-hole adjustable jacket post for customized earlobe height fitting',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe55
      ? [
          'SKU: JC-KE-55 — Signature botanical laurel leaf climber silhouette',
          'Lustrous round focal pearl with sparkling round-cut CZ accent',
          'Micro-pavé crystal leaves along contoured ear climber branch',
          'Warm 18K Gold finish over certified 925 Sterling Silver core',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe88
      ? [
          'SKU: JC-KE-88 — Korean designer open-heart & ribbon bow drop silhouette',
          'Hand-set micro pearl heart stud with lustrous white enamel bow',
          'Warm 18K Gold finish over certified 925 Sterling Silver core',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
          'Comfort-fit stud post backings with secure friction clutch',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isInfinityPearl
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
    dimensions: isJcKe56
      ? '22mm Curvature x 15mm Width / Ultra-Lightweight (3.2g per pair)'
      : isJcKe37
      ? '24mm Drop x 18mm Bow Width | 10mm Pearl Drop / Ultra-Lightweight (3.8g per pair)'
      : isJcKe16
      ? '30mm Drop x 14mm Width / Ultra-Lightweight (3.8g per pair)'
      : isJcKe67
      ? '32mm Drop x 12mm Width / Ultra-Lightweight (3.6g per pair)'
      : isJcKe53
      ? '20mm x 20mm Halo / Ultra-Lightweight (3.4g per pair)'
      : isJcKe80
      ? '20mm x 16mm / Ultra-Lightweight (3.4g per pair)'
      : isJcKe63
      ? '18mm x 18mm / Ultra-Lightweight (3.2g per pair)'
      : isJcKe76
      ? '58mm x 14mm / Ultra-Lightweight (3.6g per pair)'
      : isJcKe89
      ? '22mm x 12mm / Ultra-Lightweight (3.2g per pair)'
      : isJcKe87
      ? '27mm x 18mm / Ultra-Lightweight (3.8g per pair)'
      : isJcKe1
      ? '28mm x 14mm / Ultra-Lightweight (4.0g per pair)'
      : isJcKe77
      ? '22mm x 20mm / Ultra-Lightweight (3.8g per pair)'
      : isJcKe82
      ? '32mm x 18mm / Ultra-Lightweight (4.2g per pair)'
      : isJcKe83
      ? '27mm x 16mm / Ultra-Lightweight (3.4g per pair)'
      : isJcKe84
      ? '26mm x 15mm / Ultra-Lightweight (3.6g per pair)'
      : isJcKe91
      ? '24mm x 13mm / Ultra-Lightweight (3.4g per pair)'
      : isJcKe85
      ? '28mm x 14mm / Ultra-Lightweight (3.5g per pair)'
      : isJcKe36
      ? '23mm x 19mm / Ultra-Lightweight (3.3g per pair)'
      : isJcKe86
      ? '24mm x 15mm / Ultra-Lightweight (3.8g per pair)'
      : isJcKe38
      ? '21mm x 18mm / Ultra-Lightweight (3.2g per pair)'
      : isJcKe55
      ? '20mm x 15mm / Ultra-Lightweight (3.0g per pair)'
      : isJcKe88
      ? '22mm x 16mm / Ultra-Lightweight (3.1g per pair)'
      : isInfinityPearl
      ? '24mm x 12mm / Ultra-Lightweight (3.4g per pair)'
      : isAuraEarrings
      ? '18mm x 14mm / Ultra-Lightweight (3.2g per pair)'
      : isScarf
      ? '90cm x 90cm'
      : 'Adjustable Length / Standard Comfort Fit',
    material: isJcKe56
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ'
      : isJcKe37
      ? '18K Gold Vermeil 925 Sterling Silver, 10mm Luster Pearl & Micro-Pavé AAA CZ'
      : isJcKe16
      ? '18K Gold Vermeil 925 Sterling Silver, Opalescent Moonstone & Micro-Pavé AAA CZ'
      : isJcKe67
      ? '18K Gold Vermeil 925 Sterling Silver, High-Luster Pearls & Micro-Pavé AAA CZ'
      : isJcKe53
      ? '18K Gold Vermeil 925 Sterling Silver & Seven Freshwater Pearls'
      : isJcKe80
      ? '18K Gold Plated 925 Sterling Silver, Pink Shimmer Enamel & AAA CZ'
      : isJcKe63
      ? '18K Gold Plated 925 Sterling Silver, Freshwater Pearls & AAA CZ'
      : isJcKe76
      ? '925 Sterling Silver, Triple Rhodium Plated & AAA Cubic Zirconia'
      : isJcKe89
      ? '18K Gold Plated 925 Sterling Silver & AAA Cubic Zirconia'
      : isJcKe87
      ? '18K Gold Plated 925 Sterling Silver & Mother of Pearl Enamel'
      : isJcKe1
      ? '18K Gold Plated 925 Sterling Silver, Pink Baroque Pearl & Green Enamel'
      : isJcKe77
      ? '18K Gold Plated 925 Sterling Silver, Black Enamel & CZ'
      : isJcKe82
      ? '18K Gold Plated 925 Sterling Silver & Rhodium Silver'
      : isJcKe83
      ? '18K Gold Plated 925 Sterling Silver, Opalescent Moonstone & CZ'
      : isJcKe84
      ? '18K Gold Plated 925 Sterling Silver, Lavender Quartz & Amethyst CZ'
      : isJcKe85
      ? '18K Gold Plated 925 Sterling Silver & AAA Cubic Zirconia'
      : isJcKe86
      ? '925 Sterling Silver, Triple Rhodium Plating'
      : (isJcKe91 || isJcKe36 || isJcKe38 || isJcKe55 || isJcKe88 || isInfinityPearl || isAuraEarrings)
      ? '18K Gold Plated 925 Sterling Silver, Pearls & CZ'
      : isScarf
      ? 'Pure Silk / Cashmere Blend'
      : '925 Sterling Silver',
    finish: isJcKe56
      ? 'Warm 18K Gold Vermeil, Lustrous Pearl White & Diamond Pavé'
      : isJcKe37
      ? 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé'
      : isJcKe16
      ? 'Warm 18K Gold Vermeil, Opalescent Moonstone Glow & Diamond Pavé'
      : isJcKe67
      ? 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé'
      : isJcKe53
      ? 'Warm 18K Gold Vermeil & High-Luster Freshwater Pearl White'
      : isJcKe80
      ? 'Warm 18K Gold, Shimmering Blush Pink Enamel & Diamond Pavé'
      : isJcKe63
      ? 'High-Polish Warm Gold, Pearlescent Luster & Diamond Sparkle'
      : isJcKe76
      ? 'High-Luster Rhodium & Brilliant Diamond Snowflake Sparkle'
      : isJcKe89
      ? 'High-Polish Warm Gold Vermeil & Diamond Pavé Luster'
      : isJcKe87
      ? 'High-Polish Warm Gold & Iridescent Ivory Mother of Pearl Enamel'
      : isJcKe1
      ? 'Warm 18K Gold Vermeil, Blush Baroque Pearl & Glossy Green Enamel'
      : isJcKe77
      ? 'High-Polish Warm Gold, Glossy Black Enamel & Diamond Pavé'
      : isJcKe82
      ? 'High-Mirror Warm Gold Dome & Brushed Rhodium Fan'
      : isJcKe83
      ? 'High-Polish Warm Gold & Iridescent Fairy Luster'
      : isJcKe84
      ? 'High-Polish Warm Gold & Royal Amethyst Luster'
      : isJcKe85
      ? 'High-Polish Warm Gold & Diamond Pavé Luster'
      : isJcKe86
      ? 'High-Luster Mirror Rhodium & Polished Silver'
      : (isJcKe91 || isJcKe36 || isJcKe38 || isJcKe55 || isJcKe88 || isInfinityPearl || isAuraEarrings)
      ? 'High-Polish Warm Gold with Gloss Pearl Sheen'
      : isScarf
      ? 'Lustrous Silk Satin'
      : 'High-Luster Rhodium & Polished Silver',
    keyring: (isJcKe56 || isJcKe37 || isJcKe16 || isJcKe67 || isJcKe53 || isJcKe80 || isJcKe63 || isJcKe76 || isJcKe89 || isJcKe87 || isJcKe1 || isJcKe77 || isJcKe82 || isJcKe83 || isJcKe84 || isJcKe91 || isJcKe85 || isJcKe36 || isJcKe86 || isJcKe38 || isJcKe55 || isJcKe88 || isInfinityPearl || isAuraEarrings)
      ? 'Hypoallergenic Security Stud Post'
      : 'Hypoallergenic Security Clasp',
    durability: 'Tarnish-Resistant Daily Wear',
    reviews,
  }
})
