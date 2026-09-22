const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-3':
    'Radiate sweet romantic charm and architectural elegance with the JC-KE-3 Molten Gold Heart Pearl Fan Ear Jacket. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, this playful and sophisticated 2-in-1 convertible design pairs a puffed, high-mirror molten gold heart stud worn on the lobe with an arched five-pearl ear jacket that sweeps gracefully beneath. Five hand-selected, high-luster round white freshwater pearls are aligned along a curved golden wire that peeks beneath the earlobe like a luminous pearl smile. Wear the golden heart stud alone for understated everyday minimalism, or attach the pearl fan jacket behind the lobe for an elevated, red-carpet statement. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts.',\n`;

content = content.replace("  'JC-KE-62':", descInsert + "  'JC-KE-62':");

// 2. RAW_PRODUCTS entry before id: 62
const rawProduct = `  {
    id: 63,
    name: 'JC-KE-3',
    sku: 'JC-KE-3',
    slug: 'jc-ke-3',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 49,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-3/hero-model-ear.jpg',
    gallery: [
      '/images/products/jc-ke-3/hero-model-ear.jpg',
      '/images/products/jc-ke-3/detail-hands-held.jpg',
      '/images/products/jc-ke-3/detail-model-display.jpg',
      '/images/products/jc-ke-3/macro-heart-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 62,\r?\n\s+name: 'JC-KE-62',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 62", "|| p.id === 62 || p.id === 63");

// 4. Variable declaration
content = content.replace(
  "const isJcKe62 = p.name === 'JC-KE-62' || p.id === 62",
  "const isJcKe62 = p.name === 'JC-KE-62' || p.id === 62\r\n  const isJcKe3 = p.name === 'JC-KE-3' || p.id === 63"
);

// 5. features
const featuresInsert = `    features: isJcKe3
      ? [
          'SKU: JC-KE-3 — Convertible 2-in-1 design: puffed molten gold heart stud & curved pearl fan ear jacket',
          'Curved five-pearl jacket arm that hugs the lower curve of the earlobe like a luminous halo',
          'High-mirror polished 3D puffed heart silhouette cast in certified 925 Sterling Silver',
          'Layered in rich, tarnish-resistant 18K Gold Vermeil for an everlasting warm luster',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe62`;
content = content.replace("    features: isJcKe62", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe3
      ? '24mm Width x 16mm Drop / Ultra-Lightweight (3.2g per pair)'
      : isJcKe62`;
content = content.replace("    dimensions: isJcKe62", dimInsert);

// 7. material
const matInsert = `    material: isJcKe3
      ? '18K Gold Vermeil 925 Sterling Silver & Graduated Freshwater Pearls'
      : isJcKe62`;
content = content.replace("    material: isJcKe62", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe3
      ? 'Mirror-Polish 18K Gold Vermeil & High-Luster Freshwater Pearl Glow'
      : isJcKe62`;
content = content.replace("    finish: isJcKe62", finInsert);

// 9. keyring
content = content.replace(": (isJcKe62 ||", ": (isJcKe3 || isJcKe62 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-3!');
