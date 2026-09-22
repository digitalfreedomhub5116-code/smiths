const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-62':
    'Capture ethereal movement and botanical romance with the JC-KE-62 Pavé Butterfly Pearl Ear Climber Jacket. Masterfully sculpted in certified 925 hallmarked sterling silver plated in radiant 18K gold vermeil, this innovative two-in-one ear jacket silhouette pairs a luminous 8mm freshwater pearl stud on the lobe with an architectural bifurcated golden wire that wraps gracefully beneath. One branch blossoms into an exquisite butterfly motif encrusted with sparkling micro-pavé AAA cubic zirconia crystals, while the lower branch culminates in a delicate accent pearl. The swept open-frame architecture creates a floating negative-space illusion, bringing kinetic whimsy and haute-couture sophistication to every angle. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts for effortless day-to-evening allure.',\n`;

content = content.replace("  'JC-KE-61':", descInsert + "  'JC-KE-61':");

// 2. RAW_PRODUCTS entry before id: 61
const rawProduct = `  {
    id: 62,
    name: 'JC-KE-62',
    sku: 'JC-KE-62',
    slug: 'jc-ke-62',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 47,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-62/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-62/hero-studio-pair.jpg',
      '/images/products/jc-ke-62/model-worn-profile.jpg',
      '/images/products/jc-ke-62/detail-hands-held.jpg',
      '/images/products/jc-ke-62/macro-butterfly-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 61,\r?\n\s+name: 'JC-KE-61',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 61", "|| p.id === 61 || p.id === 62");

// 4. Variable declaration
content = content.replace(
  "const isJcKe61 = p.name === 'JC-KE-61' || p.id === 61",
  "const isJcKe61 = p.name === 'JC-KE-61' || p.id === 61\r\n  const isJcKe62 = p.name === 'JC-KE-62' || p.id === 62"
);

// 5. features
const featuresInsert = `    features: isJcKe62
      ? [
          'SKU: JC-KE-62 — Innovative 2-in-1 ear jacket with top freshwater pearl stud & swept ear climber branch',
          'Bifurcated 18K gold vermeil arm featuring micro-pavé AAA cubic zirconia butterfly motif',
          'Dual freshwater pearls: 8mm high-luster lobe pearl and miniature floating accent pearl',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe61`;
content = content.replace("    features: isJcKe61", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe62
      ? '26mm Height x 22mm Width / Ultra-Lightweight (3.4g per pair)'
      : isJcKe61`;
content = content.replace("    dimensions: isJcKe61", dimInsert);

// 7. material
const matInsert = `    material: isJcKe62
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ'
      : isJcKe61`;
content = content.replace("    material: isJcKe61", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe62
      ? 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé Sparkle'
      : isJcKe61`;
content = content.replace("    finish: isJcKe61", finInsert);

// 9. keyring
content = content.replace(": (isJcKe61 ||", ": (isJcKe62 || isJcKe61 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-62!');
