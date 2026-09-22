const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-3';
const brainArtifactDir = path.join(brainDir, 'jc_ke_3');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function inpaintSparkleDynamic(srcPath) {
  const { data: rawData, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const data = Buffer.from(rawData);

  // Detect sparkle peak in lower right corner
  let maxScore = 0, cx = w - 100, cy = h - 100;
  for (let y = h - 140; y <= h - 50; y++) {
    for (let x = w - 140; x <= w - 50; x++) {
      const idx = (y * w + x) * ch;
      const c = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      let surr = 0, cnt = 0;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const sx = Math.round(x + 35 * Math.cos(angle));
        const sy = Math.round(y + 35 * Math.sin(angle));
        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const sidx = (sy * w + sx) * ch;
          surr += (data[sidx] + data[sidx+1] + data[sidx+2]) / 3;
          cnt++;
        }
      }
      surr /= cnt;
      if (c - surr > maxScore) {
        maxScore = c - surr;
        cx = x;
        cy = y;
      }
    }
  }

  console.log(`Detected watermark at (${cx}, ${cy}) score: ${maxScore.toFixed(1)}`);

  const R = 32;
  const buf = new Float32Array(data);

  let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
  for (let dy = -R - 5; dy <= R + 5; dy++) {
    for (let dx = -R - 5; dx <= R + 5; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist >= R + 1 && dist <= R + 5) {
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
  console.log('--- Processing JC-KE-3 Images ---');

  // 1. Hero: Model worn profile
  console.log('Inpainting hero-model-ear.jpg (media_1790070186035.jpg)...');
  const img_hero = await inpaintSparkleDynamic(path.join(uploadsDir, 'media_1790070186035.jpg'));
  await saveImg(img_hero, path.join(publicDestDir, 'hero-model-ear.jpg'), path.join(brainArtifactDir, 'hero-model-ear.jpg'));

  // 2. Hands held
  console.log('Inpainting detail-hands-held.jpg (media_1790070217296.jpg)...');
  const img_hands = await inpaintSparkleDynamic(path.join(uploadsDir, 'media_1790070217296.jpg'));
  await saveImg(img_hands, path.join(publicDestDir, 'detail-hands-held.jpg'), path.join(brainArtifactDir, 'detail-hands-held.jpg'));

  // 3. Model display shot
  console.log('Inpainting detail-model-display.jpg (media_1790070229366.jpg)...');
  const img_display = await inpaintSparkleDynamic(path.join(uploadsDir, 'media_1790070229366.jpg'));
  await saveImg(img_display, path.join(publicDestDir, 'detail-model-display.jpg'), path.join(brainArtifactDir, 'detail-model-display.jpg'));

  // 4. Macro crop of the heart + pearl fan from hands image
  console.log('Generating macro-heart-detail.jpg...');
  await cropAndSave(img_hands, { left: 320, top: 350, width: 380, height: 280 }, path.join(publicDestDir, 'macro-heart-detail.jpg'), path.join(brainArtifactDir, 'macro-heart-detail.jpg'));

  console.log('✓ All 4 JC-KE-3 images processed!');

  // Supabase sync
  console.log('--- Syncing JC-KE-3 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 63,
    name: 'JC-KE-3',
    full_name: 'JC-KE-3 Molten Gold Heart Pearl Fan Ear Jacket - Smiths Jewellery',
    slug: 'jc-ke-3',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 49,
    bad_count: 1,
    description: "Radiate sweet romantic charm and architectural elegance with the JC-KE-3 Molten Gold Heart Pearl Fan Ear Jacket. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, this playful and sophisticated 2-in-1 convertible design pairs a puffed, high-mirror molten gold heart stud worn on the lobe with an arched five-pearl ear jacket that sweeps gracefully beneath. Five hand-selected, high-luster round white freshwater pearls are aligned along a curved golden wire that peeks beneath the earlobe like a luminous pearl smile. Wear the golden heart stud alone for understated everyday minimalism, or attach the pearl fan jacket behind the lobe for an elevated, red-carpet statement. 100% hypoallergenic, featherlight, and fitted with secure comfort-fit stud posts.",
    material: '18K Gold Vermeil 925 Sterling Silver & Graduated Freshwater Pearls',
    dimensions: '24mm Width x 16mm Drop / Ultra-Lightweight (3.2g per pair)',
    finish: 'Mirror-Polish 18K Gold Vermeil & High-Luster Freshwater Pearl Glow',
    image: '/images/products/jc-ke-3/hero-model-ear.jpg',
    gallery: [
      '/images/products/jc-ke-3/hero-model-ear.jpg',
      '/images/products/jc-ke-3/detail-hands-held.jpg',
      '/images/products/jc-ke-3/detail-model-display.jpg',
      '/images/products/jc-ke-3/macro-heart-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-3 — Convertible 2-in-1 design: puffed molten gold heart stud & curved pearl fan ear jacket',
      'Curved five-pearl jacket arm that hugs the lower curve of the earlobe like a luminous halo',
      'High-mirror polished 3D puffed heart silhouette cast in certified 925 Sterling Silver',
      'Layered in rich, tarnish-resistant 18K Gold Vermeil for an everlasting warm luster',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 63);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 63).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 63 (JC-KE-3) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 63 (JC-KE-3) inserted!');
  }

  // Visibility
  const visRec = { product_id: 63, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 63);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 63);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 63, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 63);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 63);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-3 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
