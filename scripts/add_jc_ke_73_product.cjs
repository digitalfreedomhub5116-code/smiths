const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-73';
const brainArtifactDir = path.join(brainDir, 'jc_ke_73');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function cleanSparkle(data, w, h, ch, cx, cy, R = 32) {
  const buf = new Float32Array(data);

  let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
  for (let dy = -R - 4; dy <= R + 4; dy++) {
    for (let dx = -R - 4; dx <= R + 4; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist >= R + 1 && dist <= R + 4) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const pIdx = (py * w + px) * ch;
          sumR += data[pIdx]; sumG += data[pIdx + 1]; sumB += data[pIdx + 2]; cnt++;
        }
      }
    }
  }
  const avgR = sumR / cnt, avgG = sumG / cnt, avgB = sumB / cnt;

  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++)
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const pIdx = (py * w + px) * ch;
          buf[pIdx] = avgR; buf[pIdx + 1] = avgG; buf[pIdx + 2] = avgB;
        }
      }

  for (let iter = 0; iter < 800; iter++)
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++)
        if (Math.hypot(dx, dy) <= R) {
          const px = cx + dx, py = cy + dy;
          if (px > 0 && px < w - 1 && py > 0 && py < h - 1) {
            const pIdx = (py * w + px) * ch;
            for (let c = 0; c < ch; c++)
              buf[pIdx + c] = 0.25 * (
                buf[((py - 1) * w + px) * ch + c] + buf[((py + 1) * w + px) * ch + c] +
                buf[(py * w + (px - 1)) * ch + c] + buf[(py * w + (px + 1)) * ch + c]
              );
          }
        }

  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++)
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const pIdx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++)
            data[pIdx + c] = Math.max(0, Math.min(255, Math.round(buf[pIdx + c])));
        }
      }
}

async function saveImg(rawBuf, w, h, ch, destPath, brainPath) {
  const buf = await sharp(rawBuf, { raw: { width: w, height: h, channels: ch } })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  if (brainPath) fs.writeFileSync(brainPath, buf);
  return buf;
}

async function cropAndSave(rawBuf, w, h, ch, crop, destPath, brainPath) {
  const buf = await sharp(rawBuf, { raw: { width: w, height: h, channels: ch } })
    .extract(crop)
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  if (brainPath) fs.writeFileSync(brainPath, buf);
  return buf;
}

async function main() {
  console.log('--- Processing JC-KE-73 Images ---');

  // 1. Hero: Pair resting on white satin silk (already clean of watermarks)
  console.log('Processing hero-satin-pair.jpg (media_1790070783905.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070783905.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    await saveImg(raw, info.width, info.height, info.channels,
      path.join(publicDestDir, 'hero-satin-pair.jpg'),
      path.join(brainArtifactDir, 'hero-satin-pair.jpg')
    );

    // 4. Macro ribbon pearl detail
    console.log('Generating macro-pearl-ribbon.jpg...');
    await cropAndSave(raw, info.width, info.height, info.channels,
      { left: 280, top: 260, width: 450, height: 430 },
      path.join(publicDestDir, 'macro-pearl-ribbon.jpg'),
      path.join(brainArtifactDir, 'macro-pearl-ribbon.jpg')
    );
  }

  // 2. Detail: Hands held cupped over emerald backdrop
  console.log('Processing detail-hands-held.jpg (media_1790070792145.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070792145.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkle(data, info.width, info.height, info.channels, 939, 688, 32);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'detail-hands-held.jpg'),
      path.join(brainArtifactDir, 'detail-hands-held.jpg')
    );
  }

  // 3. Model worn profile with golden bokeh
  console.log('Processing model-worn-profile.jpg (media_1790070766347.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070766347.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkle(data, info.width, info.height, info.channels, 940, 686, 32);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-worn-profile.jpg'),
      path.join(brainArtifactDir, 'model-worn-profile.jpg')
    );
  }

  console.log('✓ All 4 JC-KE-73 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-73 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 66,
    name: 'JC-KE-73',
    full_name: 'JC-KE-73 Pavé Ribbon Floating Pearl Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-73',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 55,
    bad_count: 1,
    description: "Channel high-couture whimsy and timeless red-carpet elegance with the JC-KE-73 Pavé Ribbon Floating Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver enveloped in radiant 18K gold vermeil, each earring presents an architectural looping ribbon motif hand-encrusted with brilliant micro-pavé AAA cubic zirconia crystals. Nestled gracefully across the fluid ribbon curves are three graduated, hand-matched round freshwater pearls that seem to float in mid-air. Designed with asymmetrical left and right mirror-image orientation, these sculptural statement earrings sweep gracefully along the earlobe for a dimensional, light-catching silhouette. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening allure.",
    material: '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ',
    dimensions: '22mm Height x 14mm Width / Ultra-Lightweight (2.8g per pair)',
    finish: 'Warm 18K Gold Vermeil, Diamond Pavé Ribbon Sparkle & Iridescent Pearl Luster',
    image: '/images/products/jc-ke-73/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-73/hero-satin-pair.jpg',
      '/images/products/jc-ke-73/detail-hands-held.jpg',
      '/images/products/jc-ke-73/model-worn-profile.jpg',
      '/images/products/jc-ke-73/macro-pearl-ribbon.jpg',
    ],
    key_features: [
      'SKU: JC-KE-73 — Architectural looping ribbon motif encrusted with micro-pavé AAA cubic zirconia',
      'Three graduated hand-selected freshwater pearls with high-luster iridescent orient',
      'Mirror-image left and right ear design ergonomically contoured to hug the earlobe',
      'Handcrafted in certified 925 hallmarked Sterling Silver with 18K gold vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 66);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 66).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 66 (JC-KE-73) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 66 (JC-KE-73) inserted!');
  }

  // Visibility
  const visRec = { product_id: 66, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 66);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 66);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 66, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 66);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 66);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-73 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
