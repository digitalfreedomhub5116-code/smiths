const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-61';
const brainArtifactDir = path.join(brainDir, 'jc_ke_61');

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
  console.log('--- Processing JC-KE-61 Images ---');

  // 1. Hero on display card & satin silk
  console.log('Inpainting hero-card-satin.jpg (media_1790068543855.jpg)...');
  const img_card = await inpaintSparkle(path.join(uploadsDir, 'media_1790068543855.jpg'), true);
  await saveImg(img_card, path.join(publicDestDir, 'hero-card-satin.jpg'), path.join(brainArtifactDir, 'hero-card-satin.jpg'));

  // 2. Model worn ear close-up
  console.log('Inpainting model-worn-ear.jpg (media_1790068539228.jpg)...');
  const img_model = await inpaintSparkle(path.join(uploadsDir, 'media_1790068539228.jpg'), false);
  await saveImg(img_model, path.join(publicDestDir, 'model-worn-ear.jpg'), path.join(brainArtifactDir, 'model-worn-ear.jpg'));

  // 3. Held in cupped hands
  console.log('Inpainting detail-hands-held.jpg (media_1790068546997.jpg)...');
  const img_hands = await inpaintSparkle(path.join(uploadsDir, 'media_1790068546997.jpg'), false);
  await saveImg(img_hands, path.join(publicDestDir, 'detail-hands-held.jpg'), path.join(brainArtifactDir, 'detail-hands-held.jpg'));

  // 4. Macro crop of the bow from hands shot
  console.log('Generating macro-bow-detail.jpg...');
  await cropAndSave(img_hands, { left: 320, top: 380, width: 380, height: 380 }, path.join(publicDestDir, 'macro-bow-detail.jpg'), path.join(brainArtifactDir, 'macro-bow-detail.jpg'));

  console.log('✓ All 4 JC-KE-61 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-61 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 61,
    name: 'JC-KE-61',
    full_name: 'JC-KE-61 Noir Velvet Bow Shimmer Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-61',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 48,
    bad_count: 1,
    description: "Infuse French-girl elegance and Parisian couture into your everyday styling with the JC-KE-61 Noir Velvet Bow Shimmer Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, each earring presents a three-dimensional fluted ribbon bow finished in deep noir enamel with subtle micro-shimmer specks that catch the light like starlight on velvet. Contoured high-polish gold vermeil piping traces every graceful curve of the knotted loops and flowing ribbon tails, crowned by a sparkling round-cut AAA cubic zirconia stone nestled in the center knot. Featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts, this signature statement piece brings effortless vintage glamour to modern tailoring, evening gowns, and minimalist daywear alike.",
    material: '18K Gold Vermeil 925 Sterling Silver, Shimmer Noir Enamel & AAA CZ Crystal',
    dimensions: '20mm Width x 18mm Height / Ultra-Lightweight (3.2g per pair)',
    finish: 'Warm 18K Gold Vermeil, Shimmering Noir Enamel & Diamond Accent Knot',
    image: '/images/products/jc-ke-61/hero-card-satin.jpg',
    gallery: [
      '/images/products/jc-ke-61/hero-card-satin.jpg',
      '/images/products/jc-ke-61/model-worn-ear.jpg',
      '/images/products/jc-ke-61/detail-hands-held.jpg',
      '/images/products/jc-ke-61/macro-bow-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-61 — Three-dimensional sculpted ribbon bow silhouette in noir enamel with micro-shimmer',
      'Contoured 18K gold vermeil perimeter piping defining the knotted loops and flowing tails',
      'Round-cut brilliant AAA cubic zirconia crystal accent handset at the center bow knot',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 61);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 61).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 61 (JC-KE-61) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 61 (JC-KE-61) inserted!');
  }

  // Visibility
  const visRec = { product_id: 61, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 61);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 61);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 61, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 61);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 61);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-61 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
