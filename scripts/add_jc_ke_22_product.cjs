const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-22';
const brainArtifactDir = path.join(brainDir, 'jc_ke_22');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function inpaintSparkle(srcPath, textureTransfer = false) {
  const { data: rawData, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const data = Buffer.from(rawData);
  const orig = Buffer.from(rawData);
  const cx = 922, cy = 921, R = textureTransfer ? 32 : 30;
  const buf = new Float32Array(data);

  let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
  for (let dy = -R - 5; dy <= R + 5; dy++) {
    for (let dx = -R - 5; dx <= R + 5; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist >= R + 1 && dist <= R + 5) {
        const px = cx + dx, py = cy + dy;
        const pIdx = (py * w + px) * ch;
        sumR += data[pIdx]; sumG += data[pIdx + 1]; sumB += data[pIdx + 2]; cnt++;
      }
    }
  }
  const avgR = sumR / cnt, avgG = sumG / cnt, avgB = sumB / cnt;

  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++)
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy, pIdx = (py * w + px) * ch;
        buf[pIdx] = avgR; buf[pIdx + 1] = avgG; buf[pIdx + 2] = avgB;
      }

  for (let iter = 0; iter < 800; iter++)
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++)
        if (Math.hypot(dx, dy) <= R) {
          const px = cx + dx, py = cy + dy, pIdx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++)
            buf[pIdx + c] = 0.25 * (
              buf[((py - 1) * w + px) * ch + c] + buf[((py + 1) * w + px) * ch + c] +
              buf[(py * w + (px - 1)) * ch + c] + buf[(py * w + (px + 1)) * ch + c]
            );
        }

  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++)
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy, pIdx = (py * w + px) * ch;
        for (let c = 0; c < ch; c++)
          data[pIdx + c] = Math.max(0, Math.min(255, Math.round(buf[pIdx + c])));
      }

  if (textureTransfer) {
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const dist = Math.hypot(dx, dy);
        if (dist <= R) {
          const px = cx + dx, py = cy + dy, dstIdx = (py * w + px) * ch;
          const sx = px - 45, sy = py;
          for (let c = 0; c < ch; c++) {
            let srcBlur = 0;
            for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) srcBlur += orig[((sy + ky) * w + (sx + kx)) * ch + c];
            srcBlur /= 9;
            const highFreq = orig[(sy * w + sx) * ch + c] - srcBlur;
            const blend = Math.min(1.0, (R - dist) / 4);
            data[dstIdx + c] = Math.max(0, Math.min(255, Math.round(buf[dstIdx + c] + highFreq * blend * 0.9)));
          }
        }
      }
  }
  return { raw: data, width: w, height: h, channels: ch };
}

async function saveImg(imgObj, destPath) {
  const buf = await sharp(imgObj.raw, { raw: { width: imgObj.width, height: imgObj.height, channels: imgObj.channels } })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  return buf;
}

async function main() {
  console.log('--- Processing JC-KE-22 Images ---');

  // 1. Hero — pair on cream/champagne satin fabric (textured — use texture transfer)
  console.log('Inpainting hero-satin-pair.jpg (media_1790062226379.jpg)...');
  const satinImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062226379.jpg'), true);
  await saveImg(satinImg, path.join(publicDestDir, 'hero-satin-pair.jpg'));
  await saveImg(satinImg, path.join(brainArtifactDir, 'hero-satin-pair.jpg'));

  // 2. Model worn profile — smooth beige background
  console.log('Inpainting model-worn-profile.jpg (media_1790062230108.jpg)...');
  const modelImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062230108.jpg'), false);
  await saveImg(modelImg, path.join(publicDestDir, 'model-worn-profile.jpg'));
  await saveImg(modelImg, path.join(brainArtifactDir, 'model-worn-profile.jpg'));

  // 3. Held in cupped hands — cream fabric background
  console.log('Inpainting detail-hands-held.jpg (media_1790062235144.jpg)...');
  const handsImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062235144.jpg'), false);
  await saveImg(handsImg, path.join(publicDestDir, 'detail-hands-held.jpg'));
  await saveImg(handsImg, path.join(brainArtifactDir, 'detail-hands-held.jpg'));

  // 4. Macro leaf detail crop from satin hero — the leaves are centered around (380,430) area
  console.log('Generating macro-leaf-detail.jpg...');
  const macroLeafBuf = await sharp(satinImg.raw, { raw: { width: satinImg.width, height: satinImg.height, channels: satinImg.channels } })
    .extract({ left: 160, top: 200, width: 440, height: 440 })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'macro-leaf-detail.jpg'), macroLeafBuf);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-leaf-detail.jpg'), macroLeafBuf);

  console.log('✓ All 4 JC-KE-22 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-22 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 47,
    name: 'JC-KE-22',
    full_name: 'JC-KE-22 Dual Leaf Ombre Shell Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-22',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 36,
    bad_count: 1,
    description: "Inspired by the quiet poetry of an autumn garden, the JC-KE-22 Dual Leaf Ombré Shell Stud Earrings are a masterclass in understated sculptural luxury. Precision-crafted in certified 925 hallmarked sterling silver with a warm 18K gold vermeil border, each earring presents two cascading marquise leaf forms arranged in a graceful overlapping composition. The upper leaf is inlaid with a luminous ivory-white mother-of-shell cabochon that glows with soft nacreous light, while the lower leaf is finished with a deeply sculpted slate-grey shell enamel featuring hand-etched botanical vein details that mimic nature's own intricate artistry. The warm polished gold bezel outlines each leaf with architectural precision, creating a sophisticated two-tone contrast of warm gold, cool grey, and luminous ivory. Featherlight and 100% hypoallergenic, these botanical statement studs wear effortlessly from minimalist daywear to refined evening looks.",
    material: '18K Gold Vermeil 925 Sterling Silver, White Shell Cabochon & Grey Shell Enamel',
    dimensions: '28mm Drop x 16mm Width / Ultra-Lightweight (3.4g per pair)',
    finish: 'Warm 18K Gold Vermeil Bezel, Luminous White Shell & Hand-Etched Grey Shell Vein Enamel',
    image: '/images/products/jc-ke-22/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-22/hero-satin-pair.jpg',
      '/images/products/jc-ke-22/model-worn-profile.jpg',
      '/images/products/jc-ke-22/detail-hands-held.jpg',
      '/images/products/jc-ke-22/macro-leaf-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-22 — Sculptural dual cascading marquise leaf composition with ombré ivory-to-grey shell inlay',
      'Upper leaf: luminous ivory-white mother-of-shell cabochon with nacreous glow',
      'Lower leaf: slate-grey shell enamel with hand-etched botanical vein detailing',
      'Warm 18K Gold Vermeil architectural bezel outlines each leaf with precision',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 47);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 47).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 47 (JC-KE-22) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 47 (JC-KE-22) inserted!');
  }

  // Visibility
  const visRec = { product_id: 47, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 47);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 47);
  else await supabase.from('product_visibility').insert([visRec]);
  console.log('✓ product_visibility set (featured & trending)');

  // Availability
  const avlRec = { product_id: 47, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 47);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 47);
  else await supabase.from('product_availability').insert([avlRec]);
  console.log('✓ product_availability set (50 units)');

  console.log('🎉 JC-KE-22 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
