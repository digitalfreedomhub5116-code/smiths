const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-38';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_38');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const rawImages = [
    { file: 'media_1790005490490.jpg', name: 'hero-satin-pair.jpg' },
    { file: 'media_1790005438921.jpg', name: 'model-worn.jpg' },
    { file: 'media_1790005421533.jpg', name: 'detail-held.jpg' }
  ];

  const healedBuffers = {};

  for (const item of rawImages) {
    const filePath = path.join(uploadsDir, item.file);
    console.log(`Inpainting watermark on ${item.file} -> ${item.name}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);
    const starX = 939, starY = 679, R = 24;

    const buf = new Float32Array(data);
    for (let iter = 0; iter < 250; iter++) {
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          if (Math.hypot(dx, dy) <= R) {
            const px = starX + dx, py = starY + dy;
            const pIdx = py * w + px;
            for (let c = 0; c < ch; c++) {
              const up = ((py - 1) * w + px) * ch + c;
              const down = ((py + 1) * w + px) * ch + c;
              const left = (py * w + (px - 1)) * ch + c;
              const right = (py * w + (px + 1)) * ch + c;
              buf[pIdx * ch + c] = 0.25 * (buf[up] + buf[down] + buf[left] + buf[right]);
            }
          }
        }
      }
    }

    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (Math.hypot(dx, dy) <= R) {
          const px = starX + dx, py = starY + dy;
          const pIdx = py * w + px;
          for (let c = 0; c < ch; c++) {
            data[pIdx * ch + c] = Math.round(buf[pIdx * ch + c]);
          }
        }
      }
    }

    const finalBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, item.name), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, item.name), finalBuf);
    healedBuffers[item.name] = finalBuf;
    console.log(`Saved ${item.name} (${finalBuf.length} bytes)`);
  }

  // Generate Crops for gallery
  console.log('Generating high-resolution crops for macro-detail and ear-profile...');
  const macroBuf = await sharp(healedBuffers['hero-satin-pair.jpg'])
    .extract({ left: 350, top: 320, width: 400, height: 400 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(destDir, 'macro-detail.jpg'), macroBuf);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-detail.jpg'), macroBuf);
  console.log(`Saved macro-detail.jpg (${macroBuf.length} bytes)`);

  const earProfileBuf = await sharp(healedBuffers['detail-held.jpg'])
    .extract({ left: 420, top: 40, width: 400, height: 400 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(destDir, 'ear-profile.jpg'), earProfileBuf);
  fs.writeFileSync(path.join(brainArtifactDir, 'ear-profile.jpg'), earProfileBuf);
  console.log(`Saved ear-profile.jpg (${earProfileBuf.length} bytes)`);

  console.log('Syncing product JC-KE-38 with Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 21,
    name: 'JC-KE-38',
    full_name: 'JC-KE-38 - Smiths Jewellery',
    slug: 'jc-ke-38',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 32,
    bad_count: 1,
    description: 'Exude refined Korean luxury with the JC-KE-38 Pearl Arc Ear Jacket Earrings. Featuring a luminous round freshwater pearl stud worn on the lobe, paired with an interchangeable curved crescent arc of five graduated luster pearls fanning gracefully beneath the ear. Sculpted in warm 18K gold over certified 925 sterling silver, this convertible 2-in-1 design transitions effortlessly from minimalist pearl studs to statement red-carpet ear jacket radiance.',
    material: '18K Gold Plated 925 Sterling Silver & Luster Pearls',
    dimensions: '21mm x 18mm / Ultra-Lightweight (3.2g per pair)',
    finish: 'High-Polish Warm Gold with Gloss Pearl Sheen',
    image: '/images/products/jc-ke-38/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-38/hero-satin-pair.jpg',
      '/images/products/jc-ke-38/model-worn.jpg',
      '/images/products/jc-ke-38/detail-held.jpg',
      '/images/products/jc-ke-38/macro-detail.jpg',
      '/images/products/jc-ke-38/ear-profile.jpg'
    ],
    key_features: [
      'SKU: JC-KE-38 — Korean designer modular pearl stud & 5-pearl crescent arc ear jacket',
      '2-in-1 Convertible Design: wear solo as classic pearl studs or paired with the crescent fan drop',
      'Warm 18K Gold plating over certified 925 Sterling Silver core',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Multi-hole adjustable jacket post for customized earlobe height fitting',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 21);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 21).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 21 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 21 inserted:', data);
  }

  console.log('ALL JC-KE-38 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
