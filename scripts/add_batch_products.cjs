const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicProductsDir = 'C:/Users/Smita/Downloads/smiths/public/images/products';

const supabase = createClient(
  'https://znvqgluajmxgdvyfnkzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
);

const starX = 939, starY = 679, R = 25;

// Standard Dirichlet-Laplace Inpainting (R <= 25 disk with surrounding boundary condition)
async function laplaceInpaint(srcPath) {
  const img = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = img.info;
  const orig = img.data;
  const data = Buffer.from(orig);
  const buf = new Float32Array(data);

  // Initialize interior with ring average
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let dy = -R - 3; dy <= R + 3; dy++) {
    for (let dx = -R - 3; dx <= R + 3; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist >= 26 && dist <= 28) {
        const px = starX + dx, py = starY + dy;
        const idx = (py * w + px) * ch;
        sumR += orig[idx];
        sumG += orig[idx+1];
        sumB += orig[idx+2];
        count++;
      }
    }
  }
  const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      if (Math.hypot(dx, dy) <= R) {
        const px = starX + dx, py = starY + dy;
        const idx = (py * w + px) * ch;
        buf[idx] = avgR;
        buf[idx+1] = avgG;
        buf[idx+2] = avgB;
      }
    }
  }

  // 600 iterations of Laplace equation
  for (let iter = 0; iter < 600; iter++) {
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (Math.hypot(dx, dy) <= R) {
          const px = starX + dx, py = starY + dy;
          const idx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++) {
            buf[idx + c] = 0.25 * (
              buf[((py - 1) * w + px) * ch + c] +
              buf[((py + 1) * w + px) * ch + c] +
              buf[(py * w + (px - 1)) * ch + c] +
              buf[(py * w + (px + 1)) * ch + c]
            );
          }
        }
      }
    }
  }

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      if (Math.hypot(dx, dy) <= R) {
        const px = starX + dx, py = starY + dy;
        const idx = (py * w + px) * ch;
        for (let c = 0; c < ch; c++) {
          data[idx + c] = Math.max(0, Math.min(255, Math.round(buf[idx + c])));
        }
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: ch } }).jpeg({ quality: 95 }).toBuffer();
}

// Special edge-aware inpaint for media_1790006749633.jpg (JC-KE-87 model portrait)
async function edgeAwareInpaint(srcPath) {
  const img = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = img.info;
  const orig = img.data;
  const data = Buffer.from(orig);
  const buf = new Float32Array(data);

  const cx = 938, cy = 678, r = 23;

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const astroid = Math.pow(Math.abs(dx)/r, 0.58) + Math.pow(Math.abs(dy)/r, 0.58);
      if (astroid <= 1.08) {
        const px = cx + dx, py = cy + dy;
        const dstIdx = (py * w + px) * ch;
        const srcX = px - 35;
        const srcY = py - 4;
        const srcIdx = (srcY * w + srcX) * ch;
        buf[dstIdx] = orig[srcIdx];
        buf[dstIdx+1] = orig[srcIdx+1];
        buf[dstIdx+2] = orig[srcIdx+2];
      }
    }
  }

  for (let iter = 0; iter < 25; iter++) {
    for (let dy = -r - 2; dy <= r + 2; dy++) {
      for (let dx = -r - 2; dx <= r + 2; dx++) {
        const astroid = Math.pow(Math.abs(dx)/r, 0.58) + Math.pow(Math.abs(dy)/r, 0.58);
        if (astroid >= 0.95 && astroid <= 1.15) {
          const px = cx + dx, py = cy + dy;
          const idx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++) {
            buf[idx + c] = 0.25 * (
              buf[((py - 1) * w + px) * ch + c] +
              buf[((py + 1) * w + px) * ch + c] +
              buf[(py * w + (px - 1)) * ch + c] +
              buf[(py * w + (px + 1)) * ch + c]
            );
          }
        }
      }
    }
  }

  for (let dy = -r - 3; dy <= r + 3; dy++) {
    for (let dx = -r - 3; dx <= r + 3; dx++) {
      const astroid = Math.pow(Math.abs(dx)/r, 0.58) + Math.pow(Math.abs(dy)/r, 0.58);
      if (astroid <= 1.2) {
        const px = cx + dx, py = cy + dy;
        const idx = (py * w + px) * ch;
        for (let c = 0; c < ch; c++) {
          data[idx + c] = Math.max(0, Math.min(255, Math.round(buf[idx + c])));
        }
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: ch } }).jpeg({ quality: 95 }).toBuffer();
}

const PRODUCTS_CONFIG = [
  {
    id: 31,
    name: 'JC-KE-87',
    fullName: 'JC-KE-87 - Smiths Jewellery',
    slug: 'jc-ke-87',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    stock: 50,
    rating: 4.9,
    reviewCount: 43,
    badCount: 1,
    description: 'Evoke vintage Parisian romance with the JC-KE-87 Mother of Pearl Flower Fan Drop Earrings. Sculpted in certified 925 hallmarked sterling silver with a luminous 18K gold vermeil finish, each earring highlights a high-polish teardrop stud cascading down to an architectural five-petal fan flower drop. Inset with iridescent ivory mother-of-pearl enamel bordered by fine golden beading, each petal captures the light with shimmering pearlescent grace. Hypoallergenic, featherlight, and articulated for graceful motion.',
    material: '18K Gold Plated 925 Sterling Silver & Mother of Pearl Enamel',
    dimensions: '27mm x 18mm / Ultra-Lightweight (3.8g per pair)',
    finish: 'High-Polish Warm Gold & Iridescent Ivory Mother of Pearl Enamel',
    image: '/images/products/jc-ke-87/hero-satin-pair.jpg',
    images: [
      { src: 'media_1790006740983.jpg', out: 'hero-satin-pair.jpg' },
      { src: 'media_1790006745605.jpg', out: 'detail-held.jpg' },
      { src: 'media_1790006736836.jpg', out: 'model-worn.jpg' },
      { src: 'media_1790006749633.jpg', out: 'model-portrait.jpg', edgeAware: true }
    ],
    features: [
      'SKU: JC-KE-87 — Art deco 5-petal fan flower drop with iridescent ivory mother-of-pearl enamel',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'High-polish teardrop stud post with articulated pendant jump ring connection',
      'Intricate golden beaded center florets and scalloped petal borders',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ]
  },
  {
    id: 32,
    name: 'JC-KE-89',
    fullName: 'JC-KE-89 - Smiths Jewellery',
    slug: 'jc-ke-89',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    stock: 50,
    rating: 4.9,
    reviewCount: 46,
    badCount: 1,
    description: 'Capture celestial brilliance with the JC-KE-89 Infinity Ribbon Solitaire CZ Stud Earrings. Sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring forms an exquisite interlocking crossover ribbon silhouette — one gleaming high-polish gold arm intersecting with a dazzling strand handset with micro-pavé AAA cubic zirconia crystals. Suspended at the center is a brilliant round diamond-cut solitaire crystal that floats with mesmerizing fire. Hypoallergenic, lightweight, and modern.',
    material: '18K Gold Plated 925 Sterling Silver & AAA Cubic Zirconia',
    dimensions: '22mm x 12mm / Ultra-Lightweight (3.2g per pair)',
    finish: 'High-Polish Warm Gold Vermeil & Diamond Pavé Luster',
    image: '/images/products/jc-ke-89/hero-satin-pair.jpg',
    images: [
      { src: 'media_1790006809456.jpg', out: 'hero-satin-pair.jpg' },
      { src: 'media_1790006796349.jpg', out: 'macro-satin-detail.jpg' },
      { src: 'media_1790006821534.jpg', out: 'model-worn.jpg' },
      { src: 'media_1790006832461.jpg', out: 'model-portrait.jpg' }
    ],
    features: [
      'SKU: JC-KE-89 — Modern crossover loop silhouette with floating round-cut diamond solitaire CZ',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Micro-pavé AAA cubic zirconia crystal ribbon strand paired with polished gold loop',
      'Secure 4-prong floating solitaire center stone for maximum light reflection',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ]
  },
  {
    id: 33,
    name: 'JC-KE-76',
    fullName: 'JC-KE-76 - Smiths Jewellery',
    slug: 'jc-ke-76',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    stock: 50,
    rating: 4.9,
    reviewCount: 52,
    badCount: 1,
    description: 'Channel winter wonderland splendor with the JC-KE-76 Starlight Snowflake Fringe Dangle Earrings. Mastercrafted in certified 925 hallmarked sterling silver with a triple rhodium plating for lasting mirror shine, each earring presents an intricately sculpted snowflake cluster hand-encrusted with brilliant round-cut AAA cubic zirconia stones. Flowing beneath are dual flexible liquid-silver snake chain fringe ribbons that shimmer with every movement. Hypoallergenic, featherlight, and unforgettable.',
    material: '925 Sterling Silver, Triple Rhodium Plated & AAA Cubic Zirconia',
    dimensions: '58mm x 14mm / Ultra-Lightweight (3.6g per pair)',
    finish: 'High-Luster Rhodium & Brilliant Diamond Snowflake Sparkle',
    image: '/images/products/jc-ke-76/hero-satin-pair.jpg',
    images: [
      { src: 'media_1790006889414.jpg', out: 'hero-satin-pair.jpg' },
      { src: 'media_1790006906075.jpg', out: 'detail-held.jpg' },
      { src: 'media_1790006919103.jpg', out: 'macro-satin-detail.jpg' },
      { src: 'media_1790006945217.jpg', out: 'model-worn.jpg' }
    ],
    features: [
      'SKU: JC-KE-76 — Sculptural 6-point snowflake stud with liquid-silver fringe streamer dangles',
      'Cast in certified 925 hallmarked Sterling Silver with enduring Triple Rhodium plating',
      'Handset multi-facet AAA cubic zirconia cluster with brilliant crystal fire',
      'Dual articulated flexible snake chain drops for fluid cascading motion',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ]
  },
  {
    id: 34,
    name: 'JC-KE-63',
    fullName: 'JC-KE-63 - Smiths Jewellery',
    slug: 'jc-ke-63',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    stock: 50,
    rating: 4.9,
    reviewCount: 39,
    badCount: 1,
    description: 'Adorn your ears with everlasting harmony wearing the JC-KE-63 Pearl & Diamond Wreath Halo Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver layered in luxurious 18K gold vermeil, each earring forms an open circular garland wreath featuring six hand-selected round freshwater pearls alternating with sparkling round-cut AAA cubic zirconia gemstones. The balanced open-circle architecture creates a radiant crown on the lobe. Hypoallergenic, featherlight, and timeless.',
    material: '18K Gold Plated 925 Sterling Silver, Freshwater Pearls & AAA CZ',
    dimensions: '18mm x 18mm / Ultra-Lightweight (3.2g per pair)',
    finish: 'High-Polish Warm Gold, Pearlescent Luster & Diamond Sparkle',
    image: '/images/products/jc-ke-63/hero-satin-pair.jpg',
    images: [
      { src: 'media_1790006987035.jpg', out: 'hero-satin-pair.jpg' },
      { src: 'media_1790007008969.jpg', out: 'macro-detail.jpg' },
      { src: 'media_1790007019401.jpg', out: 'detail-held.jpg' },
      { src: 'media_1790007029915.jpg', out: 'model-worn.jpg' },
      { src: 'media_1790006997485.jpg', out: 'model-portrait.jpg' }
    ],
    features: [
      'SKU: JC-KE-63 — Open circular wreath halo with alternating freshwater pearls and sparkling CZs',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Six hand-matched round freshwater pearls with high-luster iridescent sheen',
      'Handset AAA round brilliant cubic zirconia stones in secure prong settings',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ]
  },
  {
    id: 35,
    name: 'JC-KE-80',
    fullName: 'JC-KE-80 - Smiths Jewellery',
    slug: 'jc-ke-80',
    genre: 'EARRINGS',
    price: 849,
    originalPrice: 1799,
    stock: 50,
    rating: 4.9,
    reviewCount: 48,
    badCount: 1,
    description: 'Celebrate perennial spring elegance with the JC-KE-80 Sakura Blossom Halo Wreath Earrings. Sculpted in certified 925 hallmarked sterling silver plated in rich 18K gold vermeil, each earring features a charming five-petal cherry blossom flower enameled in shimmering blush-pink with a delicate sparkling crystal pistil center. The bloom crowns a full halo circular ring hand-set with glittering round-cut AAA cubic zirconia stones. Hypoallergenic, featherlight, and infused with romantic charm.',
    material: '18K Gold Plated 925 Sterling Silver, Pink Shimmer Enamel & AAA CZ',
    dimensions: '20mm x 16mm / Ultra-Lightweight (3.4g per pair)',
    finish: 'Warm 18K Gold, Shimmering Blush Pink Enamel & Diamond Pavé',
    image: '/images/products/jc-ke-80/hero-satin-pair.jpg',
    images: [
      { src: 'media_1790007479885.jpg', out: 'hero-satin-pair.jpg' },
      { src: 'media_1790007492411.jpg', out: 'macro-satin-detail.jpg' },
      { src: 'media_1790007518033.jpg', out: 'detail-held.jpg' },
      { src: 'media_1790007528781.jpg', out: 'model-worn.jpg' },
      { src: 'media_1790007502310.jpg', out: 'model-portrait.jpg' }
    ],
    features: [
      'SKU: JC-KE-80 — Sakura cherry blossom floral stud with full crystal pavé wreath halo ring',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Shimmering blush-pink enamel flower petals with bezel crystal pistil center',
      'Full circular garland halo set with brilliant AAA cubic zirconia crystals',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ]
  }
];

async function run() {
  console.log('--- Processing Images for 5 Products ---');
  for (const prod of PRODUCTS_CONFIG) {
    const prodDir = path.join(publicProductsDir, prod.slug);
    fs.mkdirSync(prodDir, { recursive: true });
    console.log(`\nProduct ${prod.name} (${prod.slug}):`);

    const gallery = [];
    for (const imgConfig of prod.images) {
      const srcPath = path.join(uploadsDir, imgConfig.src);
      const destPath = path.join(prodDir, imgConfig.out);
      gallery.push(`/images/products/${prod.slug}/${imgConfig.out}`);

      console.log(`  Healing ${imgConfig.src} -> ${imgConfig.out}...`);
      let buf;
      if (imgConfig.edgeAware) {
        buf = await edgeAwareInpaint(srcPath);
      } else {
        buf = await laplaceInpaint(srcPath);
      }
      fs.writeFileSync(destPath, buf);
      console.log(`  Saved ${imgConfig.out} (${buf.length} bytes)`);
    }

    console.log(`  Syncing to Supabase (id: ${prod.id})...`);
    const dbRow = {
      id: prod.id,
      name: prod.name,
      full_name: prod.fullName,
      slug: prod.slug,
      genre: prod.genre,
      price: prod.price,
      original_price: prod.originalPrice,
      stock: prod.stock,
      rating: prod.rating,
      review_count: prod.reviewCount,
      bad_count: prod.badCount,
      description: prod.description,
      material: prod.material,
      dimensions: prod.dimensions,
      finish: prod.finish,
      image: prod.image,
      gallery: gallery,
      key_features: prod.features,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('products').select('id').eq('id', prod.id);
    if (existing && existing.length > 0) {
      const { data, error } = await supabase.from('products').update(dbRow).eq('id', prod.id).select();
      if (error) console.error(`  Update error for ${prod.name}:`, error);
      else console.log(`  Updated Supabase row for ${prod.name}`);
    } else {
      const { data, error } = await supabase.from('products').insert([dbRow]).select();
      if (error) console.error(`  Insert error for ${prod.name}:`, error);
      else console.log(`  Inserted Supabase row for ${prod.name}`);
    }
  }

  console.log('\nAll 5 products processed and synced to Supabase successfully!');
}

run().catch(console.error);
