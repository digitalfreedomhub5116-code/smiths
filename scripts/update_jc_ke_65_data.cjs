const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-65':
    'Elevate your ear stack with celestial glamour and iconic Parisian elegance in the JC-KE-65 Onyx Clover & Pavé Star Curated Ear Wrap Huggie Set. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, this four-piece curated stack pairs two signature motifs: a talismanic four-leaf clover inlaid with high-gloss mirror-polished black onyx framed by a halo of micro-pavé AAA cubic zirconia crystals, and an openwork celestial five-point star densely encrusted in sparkling pavé diamonds. Designed with an ergonomic U-curve huggie ear wrap silhouette that hooks comfortably through lobe piercings and sweeps beneath the ear for a seamless, floating cuff illusion. Wear them as matching pairs or mix-and-match in an asymmetrical multi-piercing constellation for effortless day-to-evening luxury.',\n`;

content = content.replace("  'JC-KE-70':", descInsert + "  'JC-KE-70':");

// 2. RAW_PRODUCTS entry before id: 67
const rawProduct = `  {
    id: 68,
    name: 'JC-KE-65',
    sku: 'JC-KE-65',
    slug: 'jc-ke-65',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 48,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-65/hero-satin-stack.jpg',
    gallery: [
      '/images/products/jc-ke-65/hero-satin-stack.jpg',
      '/images/products/jc-ke-65/model-worn-profile.jpg',
      '/images/products/jc-ke-65/model-stack-detail.jpg',
      '/images/products/jc-ke-65/macro-stack-detail.jpg',
      '/images/products/jc-ke-65/macro-star-clover-pair.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 67,\r?\n\s+name: 'JC-KE-70',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 67", "|| p.id === 67 || p.id === 68");

// 4. Variable declaration
content = content.replace(
  "const isJcKe70 = p.name === 'JC-KE-70' || p.id === 67",
  "const isJcKe70 = p.name === 'JC-KE-70' || p.id === 67\r\n  const isJcKe65 = p.name === 'JC-KE-65' || p.id === 68"
);

// 5. features
const featuresInsert = `    features: isJcKe65
      ? [
          'SKU: JC-KE-65 — Complete 4-piece curated ear wrap set (2 Black Onyx Clovers & 2 Pavé Stars)',
          'Hand-cut genuine black onyx four-leaf clovers framed by a brilliant micro-pavé CZ crystal halo',
          'Openwork 5-point celestial stars encrusted with multi-facet AAA cubic zirconia pavé',
          'Ergonomic U-curve huggie wrap post that sweeps beneath the lobe for a floating illusion',
          'Cast in certified 925 hallmarked Sterling Silver with radiant 18K gold vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears and all-day comfort',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe70`;
content = content.replace("    features: isJcKe70", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe65
      ? 'Clover: 12mm x 12mm / Star: 11mm x 11mm / Wrap Depth: 14mm (Ultra-Lightweight 3.1g set)'
      : isJcKe70`;
content = content.replace("    dimensions: isJcKe70", dimInsert);

// 7. material
const matInsert = `    material: isJcKe65
      ? '18K Gold Vermeil 925 Sterling Silver, Natural Black Onyx & Micro-Pavé AAA CZ'
      : isJcKe70`;
content = content.replace("    material: isJcKe70", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe65
      ? 'Warm 18K Gold Vermeil, Mirror-Polished Noir Onyx & Brilliant Diamond Pavé'
      : isJcKe70`;
content = content.replace("    finish: isJcKe70", finInsert);

// 9. keyring
content = content.replace(": (isJcKe70 ||", ": (isJcKe65 || isJcKe70 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-65!');
