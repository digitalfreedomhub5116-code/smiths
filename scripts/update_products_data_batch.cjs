const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Descriptions
const descInsert = `  'JC-KE-43':
    'Embody architectural modernism and perennial botanical grace with the JC-KE-43 Art Deco White Camellia Blossom Stud Earrings. Masterfully crafted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents a tiered, double-layer stylized camellia blossom finished in pristine ivory-white gloss enamel. The sculpted petals feature contoured high-polish gold piping that defines each gentle curve, culminating in a granulated caviar-bead golden floral stamen center. Ergonomically contoured to curve gracefully up the earlobe like an ear climber, these statement floral studs marry vintage Parisian charm with clean Scandinavian aesthetics. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for effortless day-to-evening luxury.',
  'JC-KE-2':
    'Grace your collection with the everlasting harmony of the JC-KE-2 Pearl Garland Wreath & Pavé Leaf Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver layered in warm 18K gold vermeil, each earring forms an intricate circular open garland wreath. Sculpted golden laurel branches and handset micro-pavé AAA cubic zirconia crystal leaves intertwine with ten graduated, high-luster round freshwater pearls that encircle the open-center silhouette. Balanced, organic, and radiating timeless royal refinement, this signature piece captures the romantic beauty of an enchanted garden. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for effortless day-to-evening sophistication.',
  'JC-KE-34':
    'Embody runway couture glamour with the JC-KE-34 Pleated Ribbon Bow Sculptural Drop Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents an oversized dimensional ribbon bow stud with fluted, accordion-pleated ribbons that catch light with high-mirror drama. Cascading beneath are dual spiraling liquid-gold ribbons sculpted with fluid, kinetic movement that elongate the neck and sway gracefully with every turn. Designed to deliver bold red-carpet presence while remaining remarkably featherlight and comfortable for all-night wear. 100% hypoallergenic with secure comfort-fit stud posts.',
  'JC-KE-33':
    'Celebrate modern romanticism with the JC-KE-33 Molten Gold Marbleized Pearl Heart Stud Earrings. Sculpted in certified 925 hallmarked sterling silver with a rich 18K gold vermeil frame, each earring showcases a fluid, organic freeform heart silhouette with an artisanal molten gold perimeter. The heart basin is filled with luminous, hand-poured iridescent marbleized ivory shell enamel that swirls with golden and pearlescent veining, catching light with a soft candlelit glow. The bold yet lightweight silhouette makes an effortless statement, elevating casual tailoring and cocktail dresses alike. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts.',
  'JC-KE-32':
    'Awaken whimsical elegance with the JC-KE-32 Pavé Butterfly Wing Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver with a rich 18K gold vermeil finish, each earring portrays a sculptural open-wing butterfly in flight. The sweeping wings are encrusted with glittering micro-pavé AAA cubic zirconia stones, accented with radiating delicate antennae tipped with miniature round pearls. At the butterfly thorax rests a luminous, hand-selected round freshwater pearl that radiates rich iridescent orient. Designed with an ergonomic ear-contouring curve, these statement studs sit gracefully along the lobe. 100% hypoallergenic, featherlight, and equipped with comfort-fit stud backings for magical day-to-evening allure.',
  'JC-KE-30':
    'Embrace modern minimalism and Scandinavian elegance with the JC-KE-30 Floating Teardrop Contour Pearl Stud Earrings. Masterfully forged in certified 925 hallmarked sterling silver layered in radiant 18K gold vermeil, each earring presents an open, fluid teardrop silhouette sculpted with mirror-polished beveled edges. Suspended gracefully in the lower contoured cradle is a hand-selected, high-luster round white freshwater pearl that appears to float effortlessly within the golden negative space. Featherlight, 100% hypoallergenic, and fitted with ergonomic comfort-fit stud backings, this minimalist design is the epitome of modern quiet luxury.',
  'JC-KE-29':
    'Make an unforgettable high-fashion statement with the JC-KE-29 Midnight Camellia Pearl Cluster Stud Earrings. Inspired by timeless Parisian couture, each earring showcases a layered, dimensional blooming camellia blossom enameled in deep, glossy midnight black. The outer and inner petals are sculpted with contoured 18K gold vermeil borders, and at the floral center crowns an opulent cluster of eleven graduated, high-luster freshwater seed pearls. The dramatic monochromatic contrast of glossy noir enamel, warm radiant gold, and shimmering white pearls makes this signature piece the ultimate luxury accent for both sleek daywear and evening black-tie attire. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts.',
  'JC-KE-28':
    'Elevate your ear stack effortlessly with the JC-KE-28 Multi-Tier Pavé Stacked Ear Cuff Climber. Sculpted in certified 925 hallmarked sterling silver plated in rich 18K gold vermeil, this architectural statement piece creates the dramatic visual illusion of a four-tier stacked cartilage cuff with a single pierced post. Featuring alternating rows of sleek high-polish gold bars and micro-pavé hand-set AAA cubic zirconia crystal bands that catch light dynamically from every angle. Designed with an ergonomic contoured arch that hugs the ear curvature securely and comfortably without pinching. 100% hypoallergenic, featherlight, and engineered for modern high-fashion edge.',
  'JC-KE-26':
    'Command modern architectural symmetry and timeless poise with the JC-KE-26 Crossover Wishbone Pearl Drop Earrings. Precision-cast in certified 925 hallmarked sterling silver finished with mirror-polished triple rhodium plating for enduring tarnish resistance. The sleek geometric silhouette features an interlocking crossover wishbone arch densely hand-encrusted with sparkling micro-pavé AAA cubic zirconia crystals. Suspended gracefully in the lower open cradle is a high-luster round white freshwater pearl that floats weightlessly with every step. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening glamour.',
  'JC-KE-4':
    'Embody pure bridal romance and haute-couture botanical art with the JC-KE-4 Carved White Rose Blossom Stud Earrings. Sculpted from certified 925 hallmarked sterling silver and crowned with three-dimensional multi-tier clustered blooming roses meticulously carved from luminous pearlescent white resin with an authentic mother-of-pearl sheen. Each petal unfurls with lifelike texture and soft translucent luster, finished with delicate accent foliage at the base. Inspired by royal gardens in full bloom, these exquisite floral studs add graceful serenity and understated elegance to bridal wear, day celebrations, and evening soirées. 100% hypoallergenic, featherlight, and fitted with ergonomic comfort-fit stud posts.',
  'JC-KE-23':
    'Channel cosmic grandeur and timeless sophistication with the JC-KE-23 Celestial Swirl Galaxy Pearl Stud Earrings. Masterfully crafted in certified 925 hallmarked sterling silver layered in warm 18K gold vermeil, each earring features a majestic 12mm high-luster South Sea button pearl centerpiece with deep orient and mirror-like iridescence. Enveloping the pearl is a dynamic, multi-tier architectural spiral galaxy vortex handset with two curving ribbons of shimmering micro-pavé AAA cubic zirconia crystals. Designed to sit flush and centered on the earlobe, these dramatic statement studs capture light kinetically from every perspective. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud backings for red-carpet luxury and black-tie opulence.',
  'JC-KE-9':
    'Exude festive romance and whimsical elegance with the JC-KE-9 Ribbon Bow Pearl & Diamond Wreath Stud Earrings. Sculpted in certified 925 hallmarked sterling silver plated in radiant 18K gold vermeil, each earring presents an open circular garland wreath crowned by an exquisite high-polish golden ribbon bow. Alternating along the wreath circumference are lustrous hand-selected round freshwater pearls and brilliant round-cut AAA cubic zirconia crystals nestled in scalloped claw settings. The delicate open-circle architecture creates a radiant halo of light on the lobe, perfectly balancing romantic femininity with refined craftsmanship. 100% hypoallergenic, featherlight, and equipped with comfort-fit stud posts for timeless day-to-evening glamour.',\n`;

content = content.replace("  'JC-KE-7':", descInsert + "  'JC-KE-7':");

// 2. RAW_PRODUCTS insertion before id: 48
const rawProductsInsert = `  {
    id: 60,
    name: 'JC-KE-43',
    sku: 'JC-KE-43',
    slug: 'jc-ke-43',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 45,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-43/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-43/hero-satin-pair.jpg',
      '/images/products/jc-ke-43/detail-hands-held.jpg',
      '/images/products/jc-ke-43/detail-satin-zoom.jpg',
      '/images/products/jc-ke-43/macro-camellia-detail.jpg',
    ],
  },
  {
    id: 59,
    name: 'JC-KE-2',
    sku: 'JC-KE-2',
    slug: 'jc-ke-2',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 53,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-2/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-2/hero-studio-pair.jpg',
      '/images/products/jc-ke-2/detail-satin-pair.jpg',
      '/images/products/jc-ke-2/model-worn-profile.jpg',
      '/images/products/jc-ke-2/detail-hands-held.jpg',
      '/images/products/jc-ke-2/macro-wreath-detail.jpg',
    ],
  },
  {
    id: 58,
    name: 'JC-KE-34',
    sku: 'JC-KE-34',
    slug: 'jc-ke-34',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 47,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-34/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-34/hero-satin-pair.jpg',
      '/images/products/jc-ke-34/model-worn-profile.jpg',
      '/images/products/jc-ke-34/model-studio-portrait.jpg',
      '/images/products/jc-ke-34/detail-card-held.jpg',
      '/images/products/jc-ke-34/macro-bow-detail.jpg',
    ],
  },
  {
    id: 57,
    name: 'JC-KE-33',
    sku: 'JC-KE-33',
    slug: 'jc-ke-33',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 51,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-33/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-33/hero-studio-pair.jpg',
      '/images/products/jc-ke-33/model-worn-front.jpg',
      '/images/products/jc-ke-33/model-worn-side.jpg',
      '/images/products/jc-ke-33/detail-hands-held.jpg',
      '/images/products/jc-ke-33/macro-heart-detail.jpg',
    ],
  },
  {
    id: 56,
    name: 'JC-KE-32',
    sku: 'JC-KE-32',
    slug: 'jc-ke-32',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 48,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-32/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-32/hero-satin-pair.jpg',
      '/images/products/jc-ke-32/model-worn-profile.jpg',
      '/images/products/jc-ke-32/detail-velvet-box.jpg',
      '/images/products/jc-ke-32/macro-butterfly-detail.jpg',
    ],
  },
  {
    id: 55,
    name: 'JC-KE-30',
    sku: 'JC-KE-30',
    slug: 'jc-ke-30',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 41,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-30/hero-linen-pair.jpg',
    gallery: [
      '/images/products/jc-ke-30/hero-linen-pair.jpg',
      '/images/products/jc-ke-30/model-worn-profile.jpg',
      '/images/products/jc-ke-30/detail-satin-pair.jpg',
      '/images/products/jc-ke-30/detail-hands-held.jpg',
      '/images/products/jc-ke-30/macro-teardrop-detail.jpg',
    ],
  },
  {
    id: 54,
    name: 'JC-KE-29',
    sku: 'JC-KE-29',
    slug: 'jc-ke-29',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 56,
    rating: 4.95,
    badCount: 1,
    image: '/images/products/jc-ke-29/hero-plinth-pair.jpg',
    gallery: [
      '/images/products/jc-ke-29/hero-plinth-pair.jpg',
      '/images/products/jc-ke-29/model-worn-profile.jpg',
      '/images/products/jc-ke-29/detail-satin-pair.jpg',
      '/images/products/jc-ke-29/macro-camellia-detail.jpg',
    ],
  },
  {
    id: 53,
    name: 'JC-KE-28',
    sku: 'JC-KE-28',
    slug: 'jc-ke-28',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 43,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-28/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-28/hero-satin-pair.jpg',
      '/images/products/jc-ke-28/detail-hand-worn.jpg',
      '/images/products/jc-ke-28/macro-cuff-detail.jpg',
    ],
  },
  {
    id: 52,
    name: 'JC-KE-26',
    sku: 'JC-KE-26',
    slug: 'jc-ke-26',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 50,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-26/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-26/hero-studio-pair.jpg',
      '/images/products/jc-ke-26/detail-satin-pair.jpg',
      '/images/products/jc-ke-26/model-worn-profile.jpg',
      '/images/products/jc-ke-26/detail-hands-held.jpg',
      '/images/products/jc-ke-26/macro-wishbone-detail.jpg',
    ],
  },
  {
    id: 51,
    name: 'JC-KE-4',
    sku: 'JC-KE-4',
    slug: 'jc-ke-4',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 39,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-4/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-4/hero-studio-pair.jpg',
      '/images/products/jc-ke-4/model-worn-portrait.jpg',
      '/images/products/jc-ke-4/macro-rose-detail.jpg',
    ],
  },
  {
    id: 50,
    name: 'JC-KE-23',
    sku: 'JC-KE-23',
    slug: 'jc-ke-23',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 44,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-23/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-23/hero-satin-pair.jpg',
      '/images/products/jc-ke-23/model-worn-profile.jpg',
      '/images/products/jc-ke-23/detail-hands-held.jpg',
      '/images/products/jc-ke-23/macro-galaxy-detail.jpg',
    ],
  },
  {
    id: 49,
    name: 'JC-KE-9',
    sku: 'JC-KE-9',
    slug: 'jc-ke-9',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 46,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-9/hero-beige-pair.jpg',
    gallery: [
      '/images/products/jc-ke-9/hero-beige-pair.jpg',
      '/images/products/jc-ke-9/detail-satin-pair.jpg',
      '/images/products/jc-ke-9/model-worn-profile.jpg',
      '/images/products/jc-ke-9/detail-hands-cupped.jpg',
      '/images/products/jc-ke-9/macro-wreath-detail.jpg',
    ],
  },
`;

content = content.replace("  // ── EARRINGS ──\n  {\n    id: 48,", "  // ── EARRINGS ──\n" + rawProductsInsert + "  {\n    id: 48,");

// 3. isBestseller extension
const oldBestseller = "const isBestseller = p.id === 1 || p.id === 5 || p.id === 8 || p.id === 15 || p.id === 17 || p.id === 18 || p.id === 19 || p.id === 20 || p.id === 21 || p.id === 22 || p.id === 23 || p.id === 24 || p.id === 25 || p.id === 26 || p.id === 27 || p.id === 28 || p.id === 29 || p.id === 30 || p.id === 31 || p.id === 32 || p.id === 33 || p.id === 34 || p.id === 35 || p.id === 36 || p.id === 37 || p.id === 38 || p.id === 39 || p.id === 40 || p.id === 41 || p.id === 42 || p.id === 43 || p.id === 44 || p.id === 45 || p.id === 46 || p.id === 47 || p.id === 48";
const newBestseller = oldBestseller + " || p.id === 49 || p.id === 50 || p.id === 51 || p.id === 52 || p.id === 53 || p.id === 54 || p.id === 55 || p.id === 56 || p.id === 57 || p.id === 58 || p.id === 59 || p.id === 60";
content = content.replace(oldBestseller, newBestseller);

// 4. Variables declaration
const oldVars = "  const isJcKe7 = p.name === 'JC-KE-7' || p.id === 48";
const newVars = `  const isJcKe7 = p.name === 'JC-KE-7' || p.id === 48
  const isJcKe9 = p.name === 'JC-KE-9' || p.id === 49
  const isJcKe23 = p.name === 'JC-KE-23' || p.id === 50
  const isJcKe4 = p.name === 'JC-KE-4' || p.id === 51
  const isJcKe26 = p.name === 'JC-KE-26' || p.id === 52
  const isJcKe28 = p.name === 'JC-KE-28' || p.id === 53
  const isJcKe29 = p.name === 'JC-KE-29' || p.id === 54
  const isJcKe30 = p.name === 'JC-KE-30' || p.id === 55
  const isJcKe32 = p.name === 'JC-KE-32' || p.id === 56
  const isJcKe33 = p.name === 'JC-KE-33' || p.id === 57
  const isJcKe34 = p.name === 'JC-KE-34' || p.id === 58
  const isJcKe2 = p.name === 'JC-KE-2' || p.id === 59
  const isJcKe43 = p.name === 'JC-KE-43' || p.id === 60`;
content = content.replace(oldVars, newVars);

// 5. features
const featuresInsert = `    features: isJcKe43
      ? [
          'SKU: JC-KE-43 — Tiered double-layer architectural camellia flower with pristine white gloss enamel',
          'High-polish 18K gold vermeil perimeter piping defining every sculpted petal contour',
          'Granulated caviar-beading floral center stamen catching soft radiant light',
          'Cast in certified 925 hallmarked Sterling Silver with rich 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe2
      ? [
          'SKU: JC-KE-2 — Intricate circular open garland wreath with ten graduated freshwater pearls',
          'Intertwined golden laurel branches handset with shimmering micro-pavé AAA cubic zirconia leaves',
          'Harmonious open-center architecture radiates light around the earlobe with regal symmetry',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe34
      ? [
          'SKU: JC-KE-34 — Fluted accordion-pleated ribbon bow stud with cascading twisted ribbon tails',
          'Dynamic dimensional architecture catches mirror reflections across fluid sculpted folds',
          'Dramatic 48mm drop length designed to elongate the jawline and neck with effortless motion',
          'Cast in certified 925 hallmarked Sterling Silver with rich 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe33
      ? [
          'SKU: JC-KE-33 — Artisanal molten fluid freeform heart silhouette with organic bezel framing',
          'Hand-poured marbleized ivory shell enamel with luminous pearlescent and golden veining',
          'Organic textured rim cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Bold contemporary sculptural presence with remarkable featherlight comfort for all-day wear',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe32
      ? [
          'SKU: JC-KE-32 — Sculptural open butterfly wings encrusted with micro-pavé AAA cubic zirconia',
          'Radiating delicate interior wing veins tipped with lustrous miniature round pearls',
          'High-luster round freshwater pearl center body with iridescent overtone',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe30
      ? [
          'SKU: JC-KE-30 — Fluid open teardrop silhouette with floating round freshwater pearl cradle',
          'Hand-selected round white freshwater pearl with rich iridescent orient',
          'Mirror-polished bevel-edged teardrop loop in certified 925 Sterling Silver layered in 18K Gold Vermeil',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Minimalist architectural symmetry creates a lightweight, floating visual effect on the lobe',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe29
      ? [
          'SKU: JC-KE-29 — Layered dimensional camellia blossom with deep gloss black enamel petals',
          'Lustrous cluster of eleven graduated round freshwater seed pearls centered in floral stamen',
          'Scalloped golden borders sculpted in certified 925 Sterling Silver layered in 18K Gold Vermeil',
          'Dramatic monochromatic haute-couture contrast of midnight black, warm gold, and pearl white',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe28
      ? [
          'SKU: JC-KE-28 — Multi-tier layered ear cuff silhouette delivering four-tier stack effect with one piercing',
          'Alternating bands of polished 18K gold vermeil and micro-pavé AAA cubic zirconia crystals',
          'Contoured ergonomic cuff curvature designed to hug the earlobe seamlessly without pinching',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe26
      ? [
          'SKU: JC-KE-26 — Sleek geometric crossover wishbone arch handset with micro-pavé AAA cubic zirconia',
          'Suspended round white freshwater pearl with high iridescent orient floating in open cradle',
          'Precision cast in certified 925 hallmarked Sterling Silver with triple rhodium mirror plating',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Fluid negative-space architecture delivers captivating kinetic brilliance with every movement',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe4
      ? [
          'SKU: JC-KE-4 — Three-dimensional sculpted bouquet of multi-tier blooming camellia roses',
          'Intricately carved pearlescent shell petals with lifelike dimensional unfurling texture',
          'Ethereal translucent ivory mother-of-pearl luster that catches soft radiant light',
          'Solid certified 925 hallmarked Sterling Silver post mounts',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe23
      ? [
          'SKU: JC-KE-23 — 12mm South Sea pearl button center enveloped in swirling spiral galaxy pavé halo',
          'Dual multi-tier spiral ribbons handset with brilliant micro-pavé AAA cubic zirconia stones',
          'Magnificent oversized center pearl with deep orient and high mirror luster',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe9
      ? [
          'SKU: JC-KE-9 — Sculptural open wreath crowned with 18K gold vermeil ribbon bow motif',
          'Alternating round freshwater pearls and hand-set round-cut AAA cubic zirconia gemstones',
          'Delicate open-circle architecture creates an ethereal negative-space halo on the lobe',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]\n      : isJcKe7`;
content = content.replace("    features: isJcKe7", featuresInsert);

// 6. dimensions
const dimensionsInsert = `    dimensions: isJcKe43
      ? '26mm x 20mm / Ultra-Lightweight (3.4g per pair)'
      : isJcKe2
      ? '24mm x 24mm / Ultra-Lightweight (3.6g per pair)'
      : isJcKe34
      ? '48mm Drop x 20mm Bow Width / Ultra-Lightweight (4.0g per pair)'
      : isJcKe33
      ? '25mm x 22mm / Ultra-Lightweight (3.8g per pair)'
      : isJcKe32
      ? '24mm x 18mm / Ultra-Lightweight (3.5g per pair)'
      : isJcKe30
      ? '22mm Drop x 14mm Width / Ultra-Lightweight (3.0g per pair)'
      : isJcKe29
      ? '24mm x 24mm / Ultra-Lightweight (3.8g per pair)'
      : isJcKe28
      ? '32mm Height x 14mm Width / Ultra-Lightweight (3.6g per pair)'
      : isJcKe26
      ? '26mm Drop x 15mm Width / Ultra-Lightweight (3.4g per pair)'
      : isJcKe4
      ? '22mm x 22mm / Ultra-Lightweight (3.2g per pair)'
      : isJcKe23
      ? '24mm x 24mm / Ultra-Lightweight (4.2g per pair)'
      : isJcKe9
      ? '22mm x 18mm / Ultra-Lightweight (3.4g per pair)'
      : isJcKe7
      ? '24mm Drop x 20mm Width / Ultra-Lightweight (3.6g per pair)'
      : isJcKe22`;
content = content.replace("    dimensions: isJcKe22", dimensionsInsert);

// 7. material
const materialInsert = `    material: isJcKe43
      ? '18K Gold Vermeil 925 Sterling Silver & Glossy White Enamel'
      : isJcKe2
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & AAA Cubic Zirconia'
      : isJcKe34
      ? '18K Gold Vermeil Certified 925 Sterling Silver'
      : isJcKe33
      ? '18K Gold Vermeil 925 Sterling Silver & Marbleized Iridescent Shell Enamel'
      : isJcKe32
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ'
      : isJcKe30
      ? '18K Gold Vermeil 925 Sterling Silver & High-Luster Freshwater Pearl'
      : isJcKe29
      ? '18K Gold Vermeil 925 Sterling Silver, Glossy Black Enamel & Seed Pearls'
      : isJcKe28
      ? '18K Gold Vermeil 925 Sterling Silver & Micro-Pavé AAA Cubic Zirconia'
      : isJcKe26
      ? '925 Sterling Silver, Triple Rhodium Plating, Freshwater Pearl & AAA CZ'
      : isJcKe4
      ? 'Certified 925 Sterling Silver & Carved Pearlescent Shell Blossom Cluster'
      : isJcKe23
      ? '18K Gold Vermeil 925 Sterling Silver, 12mm Luster Pearl & Micro-Pavé AAA CZ'
      : isJcKe9
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & AAA Cubic Zirconia'
      : isJcKe7
      ? '18K Gold Vermeil 925 Sterling Silver, Mother-of-Pearl Shell & Freshwater Pearls'
      : isJcKe22`;
content = content.replace("    material: isJcKe22", materialInsert);

// 8. finish
const finishInsert = `    finish: isJcKe43
      ? 'Warm 18K Gold Vermeil, Pristine White Gloss Enamel & Granulated Gold Stamen'
      : isJcKe2
      ? 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Leaf Sparkle'
      : isJcKe34
      ? 'Mirror-Polished 18K Gold Vermeil & Fluted Pleated Ribbon Texture'
      : isJcKe33
      ? 'Artisanal Molten 18K Gold Vermeil & Iridescent Marbleized Pearl Enamel'
      : isJcKe32
      ? 'Warm 18K Gold Vermeil, Diamond Pavé Sparkle & Pearlescent Luster'
      : isJcKe30
      ? 'Mirror-Polish 18K Gold Vermeil & Iridescent Freshwater Pearl Luster'
      : isJcKe29
      ? 'Warm 18K Gold Vermeil, Glossy Noir Enamel & Pearlescent Seed Pearl Luster'
      : isJcKe28
      ? 'Warm 18K Gold Vermeil & Brilliant Diamond Pavé Sparkle'
      : isJcKe26
      ? 'Mirror-Luster Rhodium Silver, Brilliant Diamond Pavé & Iridescent White Pearl'
      : isJcKe4
      ? 'Luminous Ivory Mother-of-Pearl Sheen & Polished Sterling Silver'
      : isJcKe23
      ? 'Warm 18K Gold Vermeil, Deep Pearl Orient & Celestial Diamond Pavé'
      : isJcKe9
      ? 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Sparkle'
      : isJcKe7
      ? 'Warm 18K Gold Vermeil Open Arch Frame, Iridescent Ivory Mother-of-Pearl & High-Luster Pearl'
      : isJcKe22`;
content = content.replace("    finish: isJcKe22", finishInsert);

// 9. keyring
const oldKeyring = ": (isJcKe22 || isJcKe72 || isJcKe40 || isJcKe19 || isJcKe50 || isJcKe57 || isJcKe56 || isJcKe37 || isJcKe16 || isJcKe67 || isJcKe53 || isJcKe80 || isJcKe63 || isJcKe76 || isJcKe89 || isJcKe87 || isJcKe1 || isJcKe77 || isJcKe82 || isJcKe83 || isJcKe84 || isJcKe91 || isJcKe85 || isJcKe36 || isJcKe86 || isJcKe38 || isJcKe55 || isJcKe88 || isInfinityPearl || isAuraEarrings)";
const newKeyring = ": (isJcKe43 || isJcKe2 || isJcKe34 || isJcKe33 || isJcKe32 || isJcKe30 || isJcKe29 || isJcKe28 || isJcKe26 || isJcKe4 || isJcKe23 || isJcKe9 || isJcKe7 || isJcKe22 || isJcKe72 || isJcKe40 || isJcKe19 || isJcKe50 || isJcKe57 || isJcKe56 || isJcKe37 || isJcKe16 || isJcKe67 || isJcKe53 || isJcKe80 || isJcKe63 || isJcKe76 || isJcKe89 || isJcKe87 || isJcKe1 || isJcKe77 || isJcKe82 || isJcKe83 || isJcKe84 || isJcKe91 || isJcKe85 || isJcKe36 || isJcKe86 || isJcKe38 || isJcKe55 || isJcKe88 || isInfinityPearl || isAuraEarrings)";
content = content.replace(oldKeyring, newKeyring);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for all products!');
