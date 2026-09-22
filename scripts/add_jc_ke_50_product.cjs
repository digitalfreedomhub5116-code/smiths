const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-50';
const brainArtifactDir = path.join(brainDir, 'jc_ke_50');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function inpaintImage(srcPath, isSatin = false) {
  const { data: rawData, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const data = Buffer.from(rawData);
  const orig = Buffer.from(rawData);
  const cx = 922, cy = 921, R = isSatin ? 32 : 30;

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

  // If satin silk texture, transfer high-frequency detail from adjacent region
  if (isSatin) {
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
  console.log('--- Processing JC-KE-50 Images ---');

  // 1. Ceramic plate pair (hero)
  console.log('Inpainting ceramic plate pair (media_1790062019705.jpg)...');
  const plateImg = await inpaintImage(path.join(uploadsDir, 'media_1790062019705.jpg'), false);
  const plateJpeg = await sharp(plateImg.raw, { raw: { width: plateImg.width, height: plateImg.height, channels: plateImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'hero-ceramic-pair.jpg'), plateJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'hero-ceramic-pair.jpg'), plateJpeg);

  // 2. Satin silk pair
  console.log('Inpainting satin silk pair (media_1790062022667.jpg)...');
  const satinImg = await inpaintImage(path.join(uploadsDir, 'media_1790062022667.jpg'), true);
  const satinJpeg = await sharp(satinImg.raw, { raw: { width: satinImg.width, height: satinImg.height, channels: satinImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-satin-pair.jpg'), satinJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-satin-pair.jpg'), satinJpeg);

  // 3. Model side portrait
  console.log('Inpainting model side portrait (media_1790062016498.jpg)...');
  const modelImg = await inpaintImage(path.join(uploadsDir, 'media_1790062016498.jpg'), false);
  const modelJpeg = await sharp(modelImg.raw, { raw: { width: modelImg.width, height: modelImg.height, channels: modelImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'model-portrait.jpg'), modelJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'model-portrait.jpg'), modelJpeg);

  // 4. Held in hands detail
  console.log('Inpainting held in hands detail (media_1790062025495.jpg)...');
  const handsImg = await inpaintImage(path.join(uploadsDir, 'media_1790062025495.jpg'), false);
  const handsJpeg = await sharp(handsImg.raw, { raw: { width: handsImg.width, height: handsImg.height, channels: handsImg.channels } })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'detail-held-hands.jpg'), handsJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'detail-held-hands.jpg'), handsJpeg);

  // 5. Macro camellia detail crop (from ceramic plate)
  console.log('Generating macro-camellia-detail.jpg...');
  const macroCamelliaJpeg = await sharp(plateImg.raw, { raw: { width: plateImg.width, height: plateImg.height, channels: plateImg.channels } })
    .extract({ left: 175, top: 310, width: 330, height: 330 })
    .jpeg({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'macro-camellia-detail.jpg'), macroCamelliaJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-camellia-detail.jpg'), macroCamelliaJpeg);

  console.log('✓ All 5 JC-KE-50 images successfully processed and saved!');

  // Sync with Supabase Live Database
  console.log('--- Syncing JC-KE-50 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 43,
    name: 'JC-KE-50',
    full_name: 'JC-KE-50 Camellia Blooming Pearl Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-50',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 48,
    bad_count: 1,
    description: 'Embrace timeless Parisian romance and botanical splendor with the JC-KE-50 Camellia Blooming Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents a layered, three-dimensional blooming camellia blossom. At its heart rests a luminous, hand-selected round freshwater pearl pistil, cradled within three gently cupped inner petals finished with lustrous ivory mother-of-pearl enamel and fine polished gold borders. Cascading outward is a second tier of five sculpted scalloped petals, bordered by delicate micro seed-pearl beading that catches light with subtle radiance. Designed with secure, hypoallergenic comfort-fit stud posts, this signature statement piece brings effortless haute-couture elegance to both daywear and evening soirées.',
    material: '18K Gold Vermeil 925 Sterling Silver, Mother-of-Pearl Enamel & Seed Pearls',
    dimensions: '22mm x 22mm / Ultra-Lightweight (3.4g per pair)',
    finish: 'Warm 18K Gold Vermeil, Iridescent Camellia Petal Luster & Seed Pearl Sheen',
    image: '/images/products/jc-ke-50/hero-ceramic-pair.jpg',
    gallery: [
      '/images/products/jc-ke-50/hero-ceramic-pair.jpg',
      '/images/products/jc-ke-50/detail-satin-pair.jpg',
      '/images/products/jc-ke-50/model-portrait.jpg',
      '/images/products/jc-ke-50/detail-held-hands.jpg',
      '/images/products/jc-ke-50/macro-camellia-detail.jpg'
    ],
    key_features: [
      'SKU: JC-KE-50 — Sculptural 3D blooming camellia flower with tiered mother-of-pearl enamel petals',
      'Hand-selected round freshwater pearl center pistil cradled within golden petal rims',
      'Delicate perimeter halo accented with hand-set miniature micro seed-pearl beading',
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
    .eq('id', 43);

  if (selectErr) console.error('Select error:', selectErr);

  if (existingProduct && existingProduct.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', 43)
      .select();
    if (error) console.error('Supabase update product error:', error);
    else console.log('✓ Supabase product 43 updated successfully!');
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) console.error('Supabase insert product error:', error);
    else console.log('✓ Supabase product 43 inserted successfully!');
  }

  // Upsert visibility
  const visibilityData = {
    product_id: 43,
    is_hidden: false,
    is_featured: true,
    is_trending: true,
    updated_at: new Date().toISOString()
  };
  const { data: existingVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 43);
  if (existingVis && existingVis.length > 0) {
    await supabase.from('product_visibility').update(visibilityData).eq('product_id', 43);
  } else {
    await supabase.from('product_visibility').insert([visibilityData]);
  }
  console.log('✓ Supabase product_visibility configured (featured & trending)!');

  // Upsert availability
  const availabilityData = {
    product_id: 43,
    in_stock: true,
    stock_quantity: 50,
    allow_backorder: false,
    updated_at: new Date().toISOString()
  };
  const { data: existingAvail } = await supabase.from('product_availability').select('product_id').eq('product_id', 43);
  if (existingAvail && existingAvail.length > 0) {
    await supabase.from('product_availability').update(availabilityData).eq('product_id', 43);
  } else {
    await supabase.from('product_availability').insert([availabilityData]);
  }
  console.log('✓ Supabase product_availability configured (50 units in stock)!');

  console.log('🎉 ALL JC-KE-50 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
