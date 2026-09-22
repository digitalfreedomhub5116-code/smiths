const fs = require('fs');

const filePath = 'c:/Users/pruth/Downloads/smiths/src/data/productsData.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Description
const descInsert = `  'JC-KE-61':
    'Infuse French-girl elegance and Parisian couture into your everyday styling with the JC-KE-61 Noir Velvet Bow Shimmer Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents a three-dimensional fluted ribbon bow finished in deep noir enamel with subtle micro-shimmer specks that catch the light like starlight on velvet. Contoured high-polish gold vermeil piping traces every graceful curve of the knotted loops and flowing ribbon tails, crowned by a sparkling round-cut AAA cubic zirconia stone nestled in the center knot. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts, this signature statement piece brings effortless vintage glamour to modern tailoring, evening gowns, and minimalist daywear alike.',\n`;

content = content.replace("  'JC-KE-43':", descInsert + "  'JC-KE-43':");

// 2. RAW_PRODUCTS entry before id: 60
const rawProduct = `  {
    id: 61,
    name: 'JC-KE-61',
    sku: 'JC-KE-61',
    slug: 'jc-ke-61',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    reviewCount: 48,
    rating: 4.9,
    badCount: 1,
    image: '/images/products/jc-ke-61/hero-card-satin.jpg',
    gallery: [
      '/images/products/jc-ke-61/hero-card-satin.jpg',
      '/images/products/jc-ke-61/model-worn-ear.jpg',
      '/images/products/jc-ke-61/detail-hands-held.jpg',
      '/images/products/jc-ke-61/macro-bow-detail.jpg',
    ],
  },\n`;

const targetRaw = /(\{\r?\n\s+id: 60,\r?\n\s+name: 'JC-KE-43',)/;
content = content.replace(targetRaw, rawProduct + '$1');

// 3. isBestseller
content = content.replace("|| p.id === 60", "|| p.id === 60 || p.id === 61");

// 4. Variable declaration
content = content.replace(
  "const isJcKe43 = p.name === 'JC-KE-43' || p.id === 60",
  "const isJcKe43 = p.name === 'JC-KE-43' || p.id === 60\r\n  const isJcKe61 = p.name === 'JC-KE-61' || p.id === 61"
);

// 5. features
const featuresInsert = `    features: isJcKe61
      ? [
          'SKU: JC-KE-61 — Three-dimensional sculpted ribbon bow silhouette in noir enamel with micro-shimmer',
          'Contoured 18K gold vermeil perimeter piping defining the knotted loops and flowing tails',
          'Round-cut brilliant AAA cubic zirconia crystal accent handset at the center bow knot',
          'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
          '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
          'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
        ]
      : isJcKe43`;
content = content.replace("    features: isJcKe43", featuresInsert);

// 6. dimensions
const dimInsert = `    dimensions: isJcKe61
      ? '20mm Width x 18mm Height / Ultra-Lightweight (3.2g per pair)'
      : isJcKe43`;
content = content.replace("    dimensions: isJcKe43", dimInsert);

// 7. material
const matInsert = `    material: isJcKe61
      ? '18K Gold Vermeil 925 Sterling Silver, Shimmer Noir Enamel & AAA CZ Crystal'
      : isJcKe43`;
content = content.replace("    material: isJcKe43", matInsert);

// 8. finish
const finInsert = `    finish: isJcKe61
      ? 'Warm 18K Gold Vermeil, Shimmering Noir Enamel & Diamond Accent Knot'
      : isJcKe43`;
content = content.replace("    finish: isJcKe43", finInsert);

// 9. keyring
content = content.replace(": (isJcKe43 ||", ": (isJcKe61 || isJcKe43 ||");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated productsData.js for JC-KE-61!');
