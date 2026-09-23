const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-70':
    'Exude Parisian romance and sculptural botanical artistry with the JC-KE-70 Asymmetrical Molten Petal Pavé Flower Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in radiant 18K gold vermeil, each earring presents a five-petal pinwheel floral silhouette. Four delicate petals are hand-encrusted with brilliant micro-pavé AAA cubic zirconia crystals, dramatically contrasted by a single fluid petal cast in high-mirror molten gold. Nestled at the heart of each blooming whorl is a hand-matched, high-luster round white freshwater pearl stamen. 100% hypoallergenic, nickel-free, and fitted with secure comfort-fit stud posts for effortless day-to-evening luxury.',\n`;

content = content.replace("  'JC-KE-73':", descInsert + "  'JC-KE-73':");

// 2. RAW_PRODUCTS entry before id: 66
const rawProduct = `  {
    id: 67,
    name: 'JC-KE-70',
    sku: 'JC-KE-70',
    slug: 'jc-ke-70',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 53,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-70/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-70/hero-satin-pair.jpg',
      '/images/products/jc-ke-70/detail-hands-held.jpg',
      '/images/products/jc-ke-70/model-worn-ear.jpg',
      '/images/products/jc-ke-70/model-studio-portrait.jpg',
      '/images/products/jc-ke-70/macro-flower-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 66,\r?\n\s+name: 'JC-KE-73',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 66", "|| p.id === 66 || p.id === 67");

// 4. Variable declaration
content = content.replace(
  "const isJcKe73 = p.name === 'JC-KE-73' || p.id === 66",
  "const isJcKe73 = p.name === 'JC-KE-73' || p.id === 66\r\n  const isJcKe70 = p.name === 'JC-KE-70' || p.id === 67"
);

// 5. features
const featuresInsert = `    features: isJcKe70
      ? [
          'SKU: JC-KE-70 — Sculptural 5-petal pinwheel blossom with asymmetrical molten gold accent',
          'Hand-set micro-pavé AAA cubic zirconia crystals across four articulated petals',
          'One fluid molten-gold petal creating dynamic texture and high-contrast light play',
          'Luminous round freshwater pearl centerpiece with deep iridescent luster',
          'Cast in certified 925 hallmarked Sterling Silver with 18K gold vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe73`;
content = content.replace("    features: isJcKe73", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe70
      ? '16mm Diameter / Ultra-Lightweight (2.6g per pair)'
      : isJcKe73`;
content = content.replace("    dimensions: isJcKe73", dimInsert);

// 7. material
const matInsert = `    material: isJcKe70
      ? '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearl & Micro-Pavé AAA CZ'
      : isJcKe73`;
content = content.replace("    material: isJcKe73", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe70
      ? 'Warm 18K Gold Vermeil, Molten Petal Accent, Diamond Pavé & Iridescent Pearl'
      : isJcKe73`;
content = content.replace("    finish: isJcKe73", finInsert);

// 9. keyring
content = content.replace(": (isJcKe73 ||", ": (isJcKe70 || isJcKe73 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-70!');
