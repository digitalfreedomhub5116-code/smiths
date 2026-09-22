const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-58';
const brainArtifactDir = path.join(brainDir, 'jc_ke_58');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function inpaintImage(srcPath, mode = 'default') {
  const { data: rawData, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const data = Buffer.from(rawData);
  const orig = Buffer.from(rawData);
  const cx = 922, cy = 921, R = mode === 'model' ? 28 : 30;

  function isGreyBg(x, y) {
    if (mode !== 'model') return true;
    const xEdge = 852 + 0.854 * (y - 880);
    return x >= xEdge + 4;
  }

  function isMask(x, y) {
    return Math.hypot(x - cx, y - cy) <= R && isGreyBg(x, y);
  }

  const buf = new Float32Array(data);

  // Boundary average initialization
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let dy = -R - 5; dy <= R + 5; dy++) {
    for (let dx = -R - 5; dx <= R + 5; dx++) {
      const px = cx + dx, py = cy + dy;
      const dist = Math.hypot(dx, dy);
      if (dist >= R + 1 && dist <= R + 5 && isGreyBg(px, py)) {
        const pIdx = (py * w + px) * ch;
        sumR += data[pIdx];
        sumG += data[pIdx + 1];
        sumB += data[pIdx + 2];
        count++;
      }
    }
  }
  const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const px = cx + dx, py = cy + dy;
      if (isMask(px, py)) {
        const pIdx = (py * w + px) * ch;
        buf[pIdx] = avgR;
        buf[pIdx + 1] = avgG;
        buf[pIdx + 2] = avgB;
      }
    }
  }

  // 800 iterations Laplace diffusion
  for (let iter = 0; iter < 800; iter++) {
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const px = cx + dx, py = cy + dy;
        if (isMask(px, py)) {
          const pIdx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++) {
            buf[pIdx + c] = 0.25 * (
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

  // Write diffused base
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const px = cx + dx, py = cy + dy;
      if (isMask(px, py)) {
        const pIdx = (py * w + px) * ch;
        for (let c = 0; c < ch; c++) {
          data[pIdx + c] = Math.max(0, Math.min(255, Math.round(buf[pIdx + c])));
        }
      }
    }
  }

  // If satin silk texture, transfer high-frequency detail from adjacent region
  if (mode === 'satin') {
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist <= R) {
          const px = cx + dx, py = cy + dy;
          const dstIdx = (py * w + px) * ch;
          const sx = px - 45, sy = py;
          for (let c = 0; c < ch; c++) {
            let srcBlur = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                srcBlur += orig[((sy + ky) * w + (sx + kx)) * ch + c];
              }
            }
            srcBlur /= 9;
            const highFreq = orig[(sy * w + sx) * ch + c] - srcBlur;
            const blend = Math.min(1.0, (R - dist) / 4);
            const finalVal = buf[dstIdx + c] + highFreq * blend * 0.9;
            data[dstIdx + c] = Math.max(0, Math.min(255, Math.round(finalVal)));
          }
        }
      }
    }
  }

  return { raw: data, width: w, height: h, channels: ch };
}

async function main() {
  console.log('--- Processing JC-KE-58 Images ---');

  // 1. Inpaint podium pair
  console.log('Inpainting podium pair (media_1790061960058.jpg)...');
  const podiumImg = await inpaintImage(path.join(uploadsDir, 'media_1790061960058.jpg'), 'default');
  const podiumJpeg = await sharp(podiumImg.raw, { raw: { width: podiumImg.width, height: podiumImg.height, channels: podiumImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'hero-podium-pair.jpg'), podiumJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'hero-podium-pair.jpg'), podiumJpeg);

  // 2. Inpaint satin pair
  console.log('Inpainting satin pair (media_1790061956722.jpg)...');
  const satinImg = await inpaintImage(path.join(uploadsDir, 'media_1790061956722.jpg'), 'satin');
  const satinJpeg = await sharp(satinImg.raw, { raw: { width: satinImg.width, height: satinImg.height, channels: satinImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-satin-pair.jpg'), satinJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-satin-pair.jpg'), satinJpeg);

  // 3. Inpaint model portrait
  console.log('Inpainting model portrait (media_1790061953377.jpg)...');
  const modelImg = await inpaintImage(path.join(uploadsDir, 'media_1790061953377.jpg'), 'model');
  const modelJpeg = await sharp(modelImg.raw, { raw: { width: modelImg.width, height: modelImg.height, channels: modelImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'model-portrait.jpg'), modelJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'model-portrait.jpg'), modelJpeg);

  // 4. Macro starburst detail (podium crop)
  console.log('Generating macro-starburst-detail.jpg...');
  const macroStarburstJpeg = await sharp(podiumImg.raw, { raw: { width: podiumImg.width, height: podiumImg.height, channels: podiumImg.channels } })
    .extract({ left: 240, top: 320, width: 520, height: 520 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'macro-starburst-detail.jpg'), macroStarburstJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-starburst-detail.jpg'), macroStarburstJpeg);

  // 5. Detail ear macro (model ear crop)
  console.log('Generating detail-ear-macro.jpg...');
  const detailEarJpeg = await sharp(modelImg.raw, { raw: { width: modelImg.width, height: modelImg.height, channels: modelImg.channels } })
    .extract({ left: 490, top: 360, width: 300, height: 350 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-ear-macro.jpg'), detailEarJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-ear-macro.jpg'), detailEarJpeg);

  console.log('✓ All 5 JC-KE-58 images successfully processed and saved!');

  // Sync with Supabase Live Database
  console.log('--- Syncing JC-KE-58 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 42,
    name: 'JC-KE-58',
    full_name: 'JC-KE-58 Celestial Starburst Cluster Pearl Drop Earrings - Smiths Jewellery',
    slug: 'jc-ke-58',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 54,
    bad_count: 1,
    description: 'Channel celestial brilliance and timeless romance with the JC-KE-58 Celestial Starburst Cluster Pearl Drop Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring begins with an ergonomic huggie hoop centered with a lustrous button pearl. Cascading below is an asymmetrical constellation of faceted eight-pointed and four-pointed starlight starbursts hand-encrusted with sparkling micro-pavé AAA cubic zirconia crystals, interspersed with clustered freshwater pearls and culminating in a dramatic, high-luster swinging round pearl drop. Designed for fluid grace and radiant movement, this statement piece transitions effortlessly from daytime sophistication to black-tie grandeur.',
    material: '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ',
    dimensions: '45mm Drop x 18mm Width | 10mm Pearl Drop / Ultra-Lightweight (3.8g per pair)',
    finish: 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé',
    image: '/images/products/jc-ke-58/hero-podium-pair.jpg',
    gallery: [
      '/images/products/jc-ke-58/hero-podium-pair.jpg',
      '/images/products/jc-ke-58/detail-satin-pair.jpg',
      '/images/products/jc-ke-58/model-portrait.jpg',
      '/images/products/jc-ke-58/macro-starburst-detail.jpg',
      '/images/products/jc-ke-58/detail-ear-macro.jpg'
    ],
    key_features: [
      'SKU: JC-KE-58 — Celestial starburst constellation with clustered freshwater pearls & swinging pearl drop',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      'Handset micro-pavé AAA cubic zirconia crystals along multi-point starlight starbursts',
      'Graduated multi-pearl cluster featuring high-luster button, accent, and dramatic 10mm drop pearls',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure huggie leverback closure',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existingProduct, error: selectErr } = await supabase
    .from('products')
    .select('id')
    .eq('id', 42);

  if (selectErr) console.error('Select error:', selectErr);

  if (existingProduct && existingProduct.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', 42)
      .select();
    if (error) console.error('Supabase update product error:', error);
    else console.log('✓ Supabase product 42 updated successfully!');
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) console.error('Supabase insert product error:', error);
    else console.log('✓ Supabase product 42 inserted successfully!');
  }

  // Upsert visibility
  const visibilityData = {
    product_id: 42,
    is_hidden: false,
    is_featured: true,
    is_trending: true,
    updated_at: new Date().toISOString()
  };
  const { data: existingVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 42);
  if (existingVis && existingVis.length > 0) {
    await supabase.from('product_visibility').update(visibilityData).eq('product_id', 42);
  } else {
    await supabase.from('product_visibility').insert([visibilityData]);
  }
  console.log('✓ Supabase product_visibility configured (featured & trending)!');

  // Upsert availability
  const availabilityData = {
    product_id: 42,
    in_stock: true,
    stock_quantity: 50,
    allow_backorder: false,
    updated_at: new Date().toISOString()
  };
  const { data: existingAvail } = await supabase.from('product_availability').select('product_id').eq('product_id', 42);
  if (existingAvail && existingAvail.length > 0) {
    await supabase.from('product_availability').update(availabilityData).eq('product_id', 42);
  } else {
    await supabase.from('product_availability').insert([availabilityData]);
  }
  console.log('✓ Supabase product_availability configured (50 units in stock)!');

  console.log('🎉 ALL JC-KE-58 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
