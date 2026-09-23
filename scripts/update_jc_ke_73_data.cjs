const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-73':
    'Channel high-couture whimsy and timeless red-carpet elegance with the JC-KE-73 Pavé Ribbon Floating Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver enveloped in radiant 18K gold vermeil, each earring presents an architectural looping ribbon motif hand-encrusted with brilliant micro-pavé AAA cubic zirconia crystals. Nestled gracefully across the fluid ribbon curves are three graduated, hand-matched round freshwater pearls that seem to float in mid-air. Designed with asymmetrical left and right mirror-image orientation, these sculptural statement earrings sweep gracefully along the earlobe for a dimensional, light-catching silhouette. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening allure.',\n`;

content = content.replace("  'JC-KE-27':", descInsert + "  'JC-KE-27':");

// 2. RAW_PRODUCTS entry before id: 65
const rawProduct = `  {
    id: 66,
    name: 'JC-KE-73',
    sku: 'JC-KE-73',
    slug: 'jc-ke-73',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 55,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-73/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-73/hero-satin-pair.jpg',
      '/images/products/jc-ke-73/detail-hands-held.jpg',
      '/images/products/jc-ke-73/model-worn-profile.jpg',
      '/images/products/jc-ke-73/macro-pearl-ribbon.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 65,\r?\n\s+name: 'JC-KE-27',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 65", "|| p.id === 65 || p.id === 66");

// 4. Variable declaration
content = content.replace(
  "const isJcKe27 = p.name === 'JC-KE-27' || p.id === 65",
  "const isJcKe27 = p.name === 'JC-KE-27' || p.id === 65\r\n  const isJcKe73 = p.name === 'JC-KE-73' || p.id === 66"
);

// 5. features
const featuresInsert = `    features: isJcKe73
      ? [
          'SKU: JC-KE-73 — Architectural looping ribbon motif encrusted with micro-pavé AAA cubic zirconia',
          'Three graduated hand-selected freshwater pearls with high-luster iridescent orient',
          'Mirror-image left and right ear design ergonomically contoured to hug the earlobe',
          'Handcrafted in certified 925 hallmarked Sterling Silver with 18K gold vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe27`;
content = content.replace("    features: isJcKe27", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe73
      ? '22mm Height x 14mm Width / Ultra-Lightweight (2.8g per pair)'
      : isJcKe27`;
content = content.replace("    dimensions: isJcKe27", dimInsert);

// 7. material
const matInsert = `    material: isJcKe73
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ'
      : isJcKe27`;
content = content.replace("    material: isJcKe27", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe73
      ? 'Warm 18K Gold Vermeil, Diamond Pavé Ribbon Sparkle & Iridescent Pearl Luster'
      : isJcKe27`;
content = content.replace("    finish: isJcKe27", finInsert);

// 9. keyring
content = content.replace(": (isJcKe27 ||", ": (isJcKe73 || isJcKe27 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-73!');
