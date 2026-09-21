const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-1';
const artifactDir = path.join(brainDir, 'jc_ke_1');
const testDir = path.join(brainDir, 'jc_ke_1_test');

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(testDir, { recursive: true });

// Image 1: detail-held (palms with earrings) — skin, light bg
// Image 2: hero-satin-pair (on cream/gold satin) — uniform satin, brightest bg
// Image 3: model-worn (profile, neck/face) — skin/bg boundary
// Image 4: model-portrait (profile, pink-ish bg, hand on neck) — light neutral bg
const IMAGES = [
  { file: 'media_1790006601118.jpg', name: 'detail-held.jpg' },
  { file: 'media_1790006613460.jpg', name: 'hero-satin-pair.jpg' },
  { file: 'media_1790006623263.jpg', name: 'model-worn.jpg' },
  { file: 'media_1790006641061.jpg', name: 'model-portrait.jpg' }
];

const starX = 939, starY = 679, R = 25;

async function healImage(srcFile, destName) {
  const img = await sharp(path.join(uploadsDir, srcFile)).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = img.info;
  const orig = img.data;
  const data = Buffer.from(orig);

  // Use patch-copy from 80px left (same background texture) + boundary blend
  const patchSrcX = starX - 80, patchSrcY = starY;
  const buf = new Float32Array(data);

  for (let dy = -R - 2; dy <= R + 2; dy++) {
    for (let dx = -R - 2; dx <= R + 2; dx++) {
      if (Math.hypot(dx, dy) > R) continue;
      const px = starX + dx, py = starY + dy;
      const pIdx = py * w + px;
      const srcPx = patchSrcX + dx, srcPy = patchSrcY + dy;
      const srcIdx = (srcPy * w + srcPx) * ch;
      buf[pIdx * ch] = orig[srcIdx];
      buf[pIdx * ch + 1] = orig[srcIdx + 1];
      buf[pIdx * ch + 2] = orig[srcIdx + 2];
    }
  }

  // Blend boundary ring (outer ~4px) with surroundings via Laplace
  for (let iter = 0; iter < 150; iter++) {
    for (let dy = -R - 2; dy <= R + 2; dy++) {
      for (let dx = -R - 2; dx <= R + 2; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist > R) continue;
        if (dist < R - 4) continue; // only boundary ring
        const px = starX + dx, py = starY + dy;
        const pIdx = py * w + px;
        for (let c = 0; c < ch; c++) {
          buf[pIdx * ch + c] = 0.25 * (
            buf[((py-1)*w+px)*ch+c] + buf[((py+1)*w+px)*ch+c] +
            buf[(py*w+(px-1))*ch+c] + buf[(py*w+(px+1))*ch+c]
          );
        }
      }
    }
  }

  for (let dy = -R - 2; dy <= R + 2; dy++) {
    for (let dx = -R - 2; dx <= R + 2; dx++) {
      if (Math.hypot(dx, dy) > R) continue;
      const px = starX + dx, py = starY + dy;
      const pIdx = py * w + px;
      for (let c = 0; c < ch; c++) {
        data[pIdx * ch + c] = Math.max(0, Math.min(255, Math.round(buf[pIdx * ch + c])));
      }
    }
  }

  const finalBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .jpeg({ quality: 95 }).toBuffer();

  fs.writeFileSync(path.join(destDir, destName), finalBuf);
  fs.writeFileSync(path.join(artifactDir, destName), finalBuf);

  const cropBuf = await sharp(finalBuf)
    .extract({ left: starX - 50, top: starY - 50, width: 100, height: 100 })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(testDir, 'crop_' + destName), cropBuf);

  console.log('Saved', destName, '(' + finalBuf.length + ' bytes)');
}

async function main() {
  for (const img of IMAGES) {
    console.log('Processing', img.file, '->', img.name, '...');
    await healImage(img.file, img.name);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 30,
    name: 'JC-KE-1',
    full_name: 'JC-KE-1 - Smiths Jewellery',
    slug: 'jc-ke-1',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 47,
    bad_count: 1,
    description: 'Bloom with botanical romance wearing the JC-KE-1 Pink Tulip Pearl & Pavé Earrings. Sculpted in certified 925 hallmarked sterling silver with a warm 18K gold vermeil finish, each earring showcases a delicate blush-pink baroque pearl tulip bud — its petals gently furled — resting above a lustrous round freshwater pearl drop. Two lush green enamel marquise leaves cascade from the golden stem, while a pavé-encrusted horseshoe loop glitters with hand-set AAA cubic zirconia crystals below. An enchanting garden-in-bloom masterpiece, hypoallergenic and featherlight for effortless all-day elegance.',
    material: '18K Gold Plated 925 Sterling Silver, Pink Baroque Pearl & Green Enamel',
    dimensions: '28mm x 14mm / Ultra-Lightweight (4.0g per pair)',
    finish: 'Warm 18K Gold Vermeil, Blush Baroque Pearl & Glossy Green Enamel',
    image: '/images/products/jc-ke-1/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-1/hero-satin-pair.jpg',
      '/images/products/jc-ke-1/detail-held.jpg',
      '/images/products/jc-ke-1/model-worn.jpg',
      '/images/products/jc-ke-1/model-portrait.jpg'
    ],
    key_features: [
      'SKU: JC-KE-1 — Botanical tulip bud motif with blush baroque pearl & green enamel leaves',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold vermeil',
      'Hand-selected blush-pink baroque pearl tulip bud & lustrous round freshwater pearl drop',
      'Glossy vivid green enamel marquise leaf pair on golden stem',
      'Pavé horseshoe loop set with hand-placed AAA cubic zirconia crystals',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 30);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 30).select();
    if (error) console.error('Update error:', error);
    else console.log('Updated product 30:', data[0].name);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('Inserted product 30:', data[0].name);
  }

  console.log('JC-KE-1 COMPLETE!');
}

main().catch(console.error);
