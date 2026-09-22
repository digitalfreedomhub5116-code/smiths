const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-62';
const brainArtifactDir = path.join(brainDir, 'jc_ke_62');

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

  return { raw: data, width: w, height: h, channels: ch };
}

async function saveImg(imgObj, destPath, brainPath) {
  const buf = await sharp(imgObj.raw, { raw: { width: imgObj.width, height: imgObj.height, channels: imgObj.channels } })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  if (brainPath) fs.writeFileSync(brainPath, buf);
  return buf;
}

async function cropAndSave(imgObj, crop, destPath, brainPath) {
  const buf = await sharp(imgObj.raw, { raw: { width: imgObj.width, height: imgObj.height, channels: imgObj.channels } })
    .extract(crop)
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  if (brainPath) fs.writeFileSync(brainPath, buf);
  return buf;
}

async function main() {
  console.log('--- Processing JC-KE-62 Images ---');

  // 1. Hero studio pair on grey
  console.log('Inpainting hero-studio-pair.jpg (media_1790068600846.jpg)...');
  const img_hero = await inpaintSparkle(path.join(uploadsDir, 'media_1790068600846.jpg'), false);
  await saveImg(img_hero, path.join(publicDestDir, 'hero-studio-pair.jpg'), path.join(brainArtifactDir, 'hero-studio-pair.jpg'));

  // 2. Model worn profile
  console.log('Inpainting model-worn-profile.jpg (media_1790068594959.jpg)...');
  const img_model = await inpaintSparkle(path.join(uploadsDir, 'media_1790068594959.jpg'), false);
  await saveImg(img_model, path.join(publicDestDir, 'model-worn-profile.jpg'), path.join(brainArtifactDir, 'model-worn-profile.jpg'));

  // 3. Hands cupped
  console.log('Inpainting detail-hands-held.jpg (media_1790068598134.jpg)...');
  const img_hands = await inpaintSparkle(path.join(uploadsDir, 'media_1790068598134.jpg'), false);
  await saveImg(img_hands, path.join(publicDestDir, 'detail-hands-held.jpg'), path.join(brainArtifactDir, 'detail-hands-held.jpg'));

  // 4. Macro detail from single studio shot
  console.log('Inpainting macro-butterfly-detail.jpg (media_1790068591030.jpg)...');
  const img_single = await inpaintSparkle(path.join(uploadsDir, 'media_1790068591030.jpg'), false);
  await cropAndSave(img_single, { left: 200, top: 200, width: 620, height: 620 }, path.join(publicDestDir, 'macro-butterfly-detail.jpg'), path.join(brainArtifactDir, 'macro-butterfly-detail.jpg'));

  console.log('✓ All 4 JC-KE-62 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-62 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 62,
    name: 'JC-KE-62',
    full_name: 'JC-KE-62 Pavé Butterfly Pearl Ear Climber Jacket - Smiths Jewellery',
    slug: 'jc-ke-62',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 47,
    bad_count: 1,
    description: "Capture ethereal movement and botanical romance with the JC-KE-62 Pavé Butterfly Pearl Ear Climber Jacket. Masterfully sculpted in certified 925 hallmarked sterling silver plated in radiant 18K gold vermeil, this innovative two-in-one ear jacket silhouette pairs a luminous 8mm freshwater pearl stud on the lobe with an architectural bifurcated golden wire that wraps gracefully beneath. One branch blossoms into an exquisite butterfly motif encrusted with sparkling micro-pavé AAA cubic zirconia crystals, while the lower branch culminates in a delicate accent pearl. The swept open-frame architecture creates a floating negative-space illusion, bringing kinetic whimsy and haute-couture sophistication to every angle. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts for effortless day-to-evening allure.",
    material: '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ',
    dimensions: '26mm Height x 22mm Width / Ultra-Lightweight (3.4g per pair)',
    finish: 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé Sparkle',
    image: '/images/products/jc-ke-62/hero-studio-pair.jpg',
    gallery: [
      '/images/products/jc-ke-62/hero-studio-pair.jpg',
      '/images/products/jc-ke-62/model-worn-profile.jpg',
      '/images/products/jc-ke-62/detail-hands-held.jpg',
      '/images/products/jc-ke-62/macro-butterfly-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-62 — Innovative 2-in-1 ear jacket with top freshwater pearl stud & swept ear climber branch',
      'Bifurcated 18K gold vermeil arm featuring micro-pavé AAA cubic zirconia butterfly motif',
      'Dual freshwater pearls: 8mm high-luster lobe pearl and miniature floating accent pearl',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 62);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 62).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 62 (JC-KE-62) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 62 (JC-KE-62) inserted!');
  }

  // Visibility
  const visRec = { product_id: 62, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 62);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 62);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 62, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 62);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 62);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-62 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
