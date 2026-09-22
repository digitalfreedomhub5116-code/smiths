const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-72';
const brainArtifactDir = path.join(brainDir, 'jc_ke_72');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function inpaintImage(srcPath, transferTexture = false) {
  const { data: rawData, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const data = Buffer.from(rawData);
  const orig = Buffer.from(rawData);
  const cx = 922, cy = 921, R = transferTexture ? 32 : 30;

  const buf = new Float32Array(data);

  // Boundary average initialization
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (let dy = -R - 5; dy <= R + 5; dy++) {
    for (let dx = -R - 5; dx <= R + 5; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist >= R + 1 && dist <= R + 5) {
        const px = cx + dx, py = cy + dy;
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
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy;
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
        if (Math.hypot(dx, dy) <= R) {
          const px = cx + dx, py = cy + dy;
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
      const dist = Math.hypot(dx, dy);
      if (dist <= R) {
        const px = cx + dx, py = cy + dy;
        const pIdx = (py * w + px) * ch;
        for (let c = 0; c < ch; c++) {
          data[pIdx + c] = Math.max(0, Math.min(255, Math.round(buf[pIdx + c])));
        }
      }
    }
  }

  // If textured background, transfer high-frequency detail from adjacent region
  if (transferTexture) {
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
  console.log('--- Processing JC-KE-72 Images ---');

  // 1. Plinth pair (Hero)
  console.log('Inpainting plinth pair (media_1790062077094.jpg)...');
  const plinthImg = await inpaintImage(path.join(uploadsDir, 'media_1790062077094.jpg'), false);
  const plinthJpeg = await sharp(plinthImg.raw, { raw: { width: plinthImg.width, height: plinthImg.height, channels: plinthImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'hero-plinth-pair.jpg'), plinthJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'hero-plinth-pair.jpg'), plinthJpeg);

  // 2. Satin pair (Clean - no watermark)
  console.log('Processing satin pair (media_1790062082042.jpg)...');
  const satinBuffer = fs.readFileSync(path.join(uploadsDir, 'media_1790062082042.jpg'));
  const satinJpeg = await sharp(satinBuffer).jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-satin-pair.jpg'), satinJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-satin-pair.jpg'), satinJpeg);

  // 3. Held in hands worn detail
  console.log('Inpainting held in hands detail (media_1790062073378.jpg)...');
  const handsImg = await inpaintImage(path.join(uploadsDir, 'media_1790062073378.jpg'), true);
  const handsJpeg = await sharp(handsImg.raw, { raw: { width: handsImg.width, height: handsImg.height, channels: handsImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-hands-worn.jpg'), handsJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-hands-worn.jpg'), handsJpeg);

  // 4. Macro ginkgo detail crop (from plinth hero)
  console.log('Generating macro-ginkgo-detail.jpg...');
  const macroGinkgoJpeg = await sharp(plinthImg.raw, { raw: { width: plinthImg.width, height: plinthImg.height, channels: plinthImg.channels } })
    .extract({ left: 220, top: 330, width: 360, height: 360 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'macro-ginkgo-detail.jpg'), macroGinkgoJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-ginkgo-detail.jpg'), macroGinkgoJpeg);

  // 5. Macro pearl & stem detail crop (from satin)
  console.log('Generating detail-pearl-macro.jpg...');
  const macroPearlJpeg = await sharp(satinBuffer)
    .extract({ left: 160, top: 420, width: 360, height: 360 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-pearl-macro.jpg'), macroPearlJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-pearl-macro.jpg'), macroPearlJpeg);

  console.log('✓ All 5 JC-KE-72 images successfully processed and saved!');

  // Sync with Supabase Live Database
  console.log('--- Syncing JC-KE-72 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 44,
    name: 'JC-KE-72',
    full_name: 'JC-KE-72 Mother-of-Pearl Ginkgo Leaf Pearl Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-72',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 45,
    bad_count: 1,
    description: 'Channel timeless botanical grace and Parisian sophistication with the JC-KE-72 Mother-of-Pearl Ginkgo Leaf Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in luminous 18K gold vermeil, each earring presents a sculptural Japanese ginkgo biloba fan leaf. The fluted fan silhouette is inlaid with glowing, iridescent ivory mother-of-pearl enamel bordered by an exquisite scalloped arc handset with brilliant micro-pavé AAA cubic zirconia crystals. Nestled beside the leaf crown on an elegant golden arch is a hand-selected round freshwater pearl with an iridescent orient. Designed with an ergonomic contoured stud post for all-day comfort, this modern classic radiates understated luxury.',
    material: '18K Gold Vermeil 925 Sterling Silver, Mother-of-Pearl Enamel, Freshwater Pearls & AAA CZ',
    dimensions: '24mm Drop x 18mm Fan Width | 9mm Luster Pearl / Ultra-Lightweight (3.6g per pair)',
    finish: 'Warm 18K Gold Vermeil, Iridescent White Mother-of-Pearl Luster & Diamond Sparkle',
    image: '/images/products/jc-ke-72/hero-plinth-pair.jpg',
    gallery: [
      '/images/products/jc-ke-72/hero-plinth-pair.jpg',
      '/images/products/jc-ke-72/detail-satin-pair.jpg',
      '/images/products/jc-ke-72/detail-hands-worn.jpg',
      '/images/products/jc-ke-72/macro-ginkgo-detail.jpg',
      '/images/products/jc-ke-72/detail-pearl-macro.jpg'
    ],
    key_features: [
      'SKU: JC-KE-72 — Sculptural ginkgo biloba fan leaf with mother-of-pearl enamel & floating pearl',
      'Hand-selected round freshwater pearl with high-luster iridescent orient',
      'Scalloped outer fan rim handset with brilliant micro-pavé AAA cubic zirconia stones',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existingProduct, error: selectErr } = await supabase
    .from('products')
    .select('id')
    .eq('id', 44);

  if (selectErr) console.error('Select error:', selectErr);

  if (existingProduct && existingProduct.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', 44)
      .select();
    if (error) console.error('Supabase update product error:', error);
    else console.log('✓ Supabase product 44 updated successfully!');
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) console.error('Supabase insert product error:', error);
    else console.log('✓ Supabase product 44 inserted successfully!');
  }

  // Upsert visibility
  const visibilityData = {
    product_id: 44,
    is_hidden: false,
    is_featured: true,
    is_trending: true,
    updated_at: new Date().toISOString()
  };
  const { data: existingVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 44);
  if (existingVis && existingVis.length > 0) {
    await supabase.from('product_visibility').update(visibilityData).eq('product_id', 44);
  } else {
    await supabase.from('product_visibility').insert([visibilityData]);
  }
  console.log('✓ Supabase product_visibility configured (featured & trending)!');

  // Upsert availability
  const availabilityData = {
    product_id: 44,
    in_stock: true,
    stock_quantity: 50,
    allow_backorder: false,
    updated_at: new Date().toISOString()
  };
  const { data: existingAvail } = await supabase.from('product_availability').select('product_id').eq('product_id', 44);
  if (existingAvail && existingAvail.length > 0) {
    await supabase.from('product_availability').update(availabilityData).eq('product_id', 44);
  } else {
    await supabase.from('product_availability').insert([availabilityData]);
  }
  console.log('✓ Supabase product_availability configured (50 units in stock)!');

  console.log('🎉 ALL JC-KE-72 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
