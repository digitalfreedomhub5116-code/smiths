const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-27':
    "Radiate celestial elegance and timeless vintage glamour with the JC-KE-27 Luminous Cat's Eye Bezel Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver enveloped in opulent 18K gold vermeil, each earring centers a genuine, high-domed chatoyant white cat's eye cabochon stone. As light shifts, an ethereal, luminous slit of light dances across the milky opalescent surface, framed within a substantial, mirror-polished gold bezel rim. Sized to make a refined statement whether paired with sharp tailoring or evening silk, these classic round button studs sit comfortably flush to the earlobe. 100% hypoallergenic, nickel-free, and secured with comfort-fit stud backs for effortless all-day wear.",\n`;

content = content.replace("  'JC-KE-20':", descInsert + "  'JC-KE-20':");

// 2. RAW_PRODUCTS entry before id: 64
const rawProduct = `  {
    id: 65,
    name: 'JC-KE-27',
    sku: 'JC-KE-27',
    slug: 'jc-ke-27',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 52,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-27/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-27/hero-satin-pair.jpg',
      '/images/products/jc-ke-27/detail-hands-held.jpg',
      '/images/products/jc-ke-27/model-worn-ear.jpg',
      '/images/products/jc-ke-27/model-studio-portrait.jpg',
      '/images/products/jc-ke-27/macro-cabochon-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 64,\r?\n\s+name: 'JC-KE-20',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 64", "|| p.id === 64 || p.id === 65");

// 4. Variable declaration
content = content.replace(
  "const isJcKe20 = p.name === 'JC-KE-20' || p.id === 64",
  "const isJcKe20 = p.name === 'JC-KE-20' || p.id === 64\r\n  const isJcKe27 = p.name === 'JC-KE-27' || p.id === 65"
);

// 5. features
const featuresInsert = `    features: isJcKe27
      ? [
          "SKU: JC-KE-27 — High-domed chatoyant white cat's eye cabochon centerpiece",
          'Radiant 18K yellow gold vermeil bezel frame with mirror-gloss finish',
          'Dynamic chatoyant optical effect shifting with ambient light and movement',
          'Crafted in certified 925 hallmarked Sterling Silver with anti-tarnish barrier',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe20`;
content = content.replace("    features: isJcKe20", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe27
      ? '13mm Diameter / Ultra-Lightweight (2.2g per pair)'
      : isJcKe20`;
content = content.replace("    dimensions: isJcKe20", dimInsert);

// 7. material
const matInsert = `    material: isJcKe27
      ? "18K Gold Vermeil 925 Sterling Silver & Luminous Chatoyant Cat's Eye Cabochon"
      : isJcKe20`;
content = content.replace("    material: isJcKe20", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe27
      ? 'High-Polish 18K Yellow Gold Vermeil & Silky Chatoyant Lustre'
      : isJcKe20`;
content = content.replace("    finish: isJcKe20", finInsert);

// 9. keyring
content = content.replace(": (isJcKe20 ||", ": (isJcKe27 || isJcKe20 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-27!');
