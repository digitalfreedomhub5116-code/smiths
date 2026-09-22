const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-7';
const brainArtifactDir = path.join(brainDir, 'jc_ke_7');

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
  console.log('--- Processing JC-KE-7 Images ---');

  // 1. Hero — pair on gold/champagne satin (textured) — has sparkle watermark
  console.log('Inpainting hero-satin-pair.jpg (media_1790062263203.jpg)...');
  const satinImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062263203.jpg'), true);
  await saveImg(satinImg, path.join(publicDestDir, 'hero-satin-pair.jpg'));
  await saveImg(satinImg, path.join(brainArtifactDir, 'hero-satin-pair.jpg'));

  // 2. Held in open palm — has sparkle watermark (smooth skin bg)
  console.log('Inpainting detail-hand-palm.jpg (media_1790062267037.jpg)...');
  const palmImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062267037.jpg'), false);
  await saveImg(palmImg, path.join(publicDestDir, 'detail-hand-palm.jpg'));
  await saveImg(palmImg, path.join(brainArtifactDir, 'detail-hand-palm.jpg'));

  // 3. Cream plinth studio shot — very bright corner, borderline watermark, copy clean
  console.log('Processing hero-plinth-pair.jpg (media_1790062272701.jpg)...');
  const plinthBuf = fs.readFileSync(path.join(uploadsDir, 'media_1790062272701.jpg'));
  const plinthJpeg = await sharp(plinthBuf).jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'hero-plinth-pair.jpg'), plinthJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'hero-plinth-pair.jpg'), plinthJpeg);

  // 4. Macro butterfly + pearl detail crop from satin shot
  console.log('Generating macro-butterfly-detail.jpg...');
  // Earrings are roughly centered around 350-600, 280-680 in the satin image
  const macroJpeg = await sharp(satinImg.raw, { raw: { width: satinImg.width, height: satinImg.height, channels: satinImg.channels } })
    .extract({ left: 280, top: 240, width: 400, height: 400 })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(publicDestDir, 'macro-butterfly-detail.jpg'), macroJpeg);
  fs.writeFileSync(path.join(brainArtifactDir, 'macro-butterfly-detail.jpg'), macroJpeg);

  console.log('✓ All 4 JC-KE-7 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-7 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 48,
    name: 'JC-KE-7',
    full_name: 'JC-KE-7 Mother-of-Pearl Butterfly Pearl Arch Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-7',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 52,
    bad_count: 1,
    description: "Capture the delicate poetry of a butterfly in mid-flight with the JC-KE-7 Mother-of-Pearl Butterfly Pearl Arch Stud Earrings. Masterfully crafted in certified 925 hallmarked sterling silver layered in warm 18K gold vermeil, each earring showcases a luminous open-wing butterfly motif inlaid with iridescent ivory mother-of-pearl shell panels — available in a variant with micro seed-pearl encrusted wings for added texture. The butterfly perches gracefully above an elegant swept golden arch frame that cradles a dramatic 9mm high-luster round freshwater pearl in its center, with a delicate accent mini pearl floating on the trailing gold wire. The sweeping open-frame silhouette creates a sculptural negative-space effect that catches light from every angle, making this a modern art-jewellery masterpiece that balances romantic femininity with architectural elegance. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts for effortless day-to-evening glamour.",
    material: '18K Gold Vermeil 925 Sterling Silver, Mother-of-Pearl Shell & Freshwater Pearls',
    dimensions: '24mm Drop x 20mm Width / Ultra-Lightweight (3.6g per pair)',
    finish: 'Warm 18K Gold Vermeil Open Arch Frame, Iridescent Ivory Mother-of-Pearl & High-Luster Pearl',
    image: '/images/products/jc-ke-7/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-7/hero-satin-pair.jpg',
      '/images/products/jc-ke-7/hero-plinth-pair.jpg',
      '/images/products/jc-ke-7/detail-hand-palm.jpg',
      '/images/products/jc-ke-7/macro-butterfly-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-7 — Open-arch butterfly design with mother-of-pearl wings & dramatic 9mm freshwater pearl',
      'Luminous open-wing butterfly motif inlaid with iridescent ivory mother-of-pearl shell panels',
      'Swept sculptural 18K gold vermeil arch frame with 9mm center pearl & floating accent mini pearl',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 48);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 48).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 48 (JC-KE-7) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 48 (JC-KE-7) inserted!');
  }

  const visRec = { product_id: 48, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 48);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 48);
  else await supabase.from('product_visibility').insert([visRec]);
  console.log('✓ product_visibility set (featured & trending)');

  const avlRec = { product_id: 48, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 48);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 48);
  else await supabase.from('product_availability').insert([avlRec]);
  console.log('✓ product_availability set (50 units)');

  console.log('🎉 JC-KE-7 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
