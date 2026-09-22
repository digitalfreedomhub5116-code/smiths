const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-20':
    'Channel Parisian chic and modern romantic minimalism with the JC-KE-20 Modernist Noir Enamel Heart Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver layered in radiant 18K gold vermeil, each earring presents a sculptural, slightly asymmetrical modern folded heart silhouette. The heart basin is hand-filled with deep, mirror-gloss noir black enamel that provides a striking, high-contrast backdrop to the warm, high-polish gold bezel border. Ergonomically contoured to sit flat and flush against the earlobe, these versatile statement studs effortlessly balance playful sweetness with sophisticated edge. 100% hypoallergenic, featherlight, and equipped with comfort-fit security stud posts for day-to-night versatility.',\n`;

content = content.replace("  'JC-KE-3':", descInsert + "  'JC-KE-3':");

// 2. RAW_PRODUCTS entry before id: 63
const rawProduct = `  {
    id: 64,
    name: 'JC-KE-20',
    sku: 'JC-KE-20',
    slug: 'jc-ke-20',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 54,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-20/hero-hands-held.jpg',
    gallery: [
      '/images/products/jc-ke-20/hero-hands-held.jpg',
      '/images/products/jc-ke-20/model-worn-ear.jpg',
      '/images/products/jc-ke-20/model-studio-portrait.jpg',
      '/images/products/jc-ke-20/macro-heart-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 63,\r?\n\s+name: 'JC-KE-3',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 63", "|| p.id === 63 || p.id === 64");

// 4. Variable declaration
content = content.replace(
  "const isJcKe3 = p.name === 'JC-KE-3' || p.id === 63",
  "const isJcKe3 = p.name === 'JC-KE-3' || p.id === 63\r\n  const isJcKe20 = p.name === 'JC-KE-20' || p.id === 64"
);

// 5. features
const featuresInsert = `    features: isJcKe20
      ? [
          'SKU: JC-KE-20 — Sculptural slightly asymmetrical modern folded heart silhouette',
          'Deep mirror-gloss midnight noir black enamel hand-filled basin',
          'Warm 18K gold vermeil perimeter bezel framing every elegant contour',
          'Cast in certified 925 hallmarked Sterling Silver with tarnish-resistant finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe3`;
content = content.replace("    features: isJcKe3", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe20
      ? '14mm Width x 15mm Height / Ultra-Lightweight (2.4g per pair)'
      : isJcKe3`;
content = content.replace("    dimensions: isJcKe3", dimInsert);

// 7. material
const matInsert = `    material: isJcKe20
      ? '18K Gold Vermeil 925 Sterling Silver & Glossy Noir Enamel'
      : isJcKe3`;
content = content.replace("    material: isJcKe3", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe20
      ? 'Warm 18K Gold Vermeil Bezel & High-Gloss Midnight Noir Enamel'
      : isJcKe3`;
content = content.replace("    finish: isJcKe3", finInsert);

// 9. keyring
content = content.replace(": (isJcKe3 ||", ": (isJcKe20 || isJcKe3 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-20!');
