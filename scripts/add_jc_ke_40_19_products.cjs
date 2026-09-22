const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');

const supabase = createClient(
  'https://znvqgluajmxgdvyfnkzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
);

// ── Inpainting helper ────────────────────────────────────────────────────────
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

async function writeImage(imgObj, destPath) {
  const buf = await sharp(imgObj.raw, { raw: { width: imgObj.width, height: imgObj.height, channels: imgObj.channels } })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(destPath, buf);
  return buf;
}

async function upsertProduct(productData) {
  const { data: existing } = await supabase.from('products').select('id').eq('id', productData.id);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', productData.id).select();
    if (error) console.error(`Update product ${productData.id} error:`, error);
    else console.log(`✓ Supabase product ${productData.id} (${productData.name}) updated!`);
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error(`Insert product ${productData.id} error:`, error);
    else console.log(`✓ Supabase product ${productData.id} (${productData.name}) inserted!`);
  }
}

async function upsertVisibility(id) {
  const rec = { product_id: id, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: ex } = await supabase.from('product_visibility').select('product_id').eq('product_id', id);
  if (ex && ex.length > 0) await supabase.from('product_visibility').update(rec).eq('product_id', id);
  else await supabase.from('product_visibility').insert([rec]);
  console.log(`✓ Visibility set for product ${id}`);
}

async function upsertAvailability(id, qty = 50) {
  const rec = { product_id: id, in_stock: true, stock_quantity: qty, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: ex } = await supabase.from('product_availability').select('product_id').eq('product_id', id);
  if (ex && ex.length > 0) await supabase.from('product_availability').update(rec).eq('product_id', id);
  else await supabase.from('product_availability').insert([rec]);
  console.log(`✓ Availability set for product ${id} (${qty} units)`);
}

// ══════════════════════════════════════════════════════════════════
// JC-KE-40 (ID: 45) — Pink Quartz & Pavé Crystal Clover Stud Earrings
// Images: media_1790062118126 (pink pair on beige), media_1790062121924 (ivory/white pair on gold satin),
//         media_1790062125119 (held in hands), media_1790062129229 (model worn profile)
// ══════════════════════════════════════════════════════════════════
async function processJcKe40() {
  console.log('\n=== Processing JC-KE-40 (ID: 45) ===');
  const destDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-40';
  const artifactDir = path.join(brainDir, 'jc_ke_40');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  // 1. Pink pair on beige background (hero) — has sparkle watermark
  console.log('Processing hero-pink-pair.jpg (media_1790062118126.jpg)...');
  const pinkImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062118126.jpg'), false);
  await writeImage(pinkImg, path.join(destDir, 'hero-pink-pair.jpg'));
  await writeImage(pinkImg, path.join(artifactDir, 'hero-pink-pair.jpg'));

  // 2. Ivory/white pair on gold satin — has sparkle watermark
  console.log('Processing detail-ivory-satin-pair.jpg (media_1790062121924.jpg)...');
  const satinImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062121924.jpg'), true);
  await writeImage(satinImg, path.join(destDir, 'detail-ivory-satin-pair.jpg'));
  await writeImage(satinImg, path.join(artifactDir, 'detail-ivory-satin-pair.jpg'));

  // 3. Held in cupped hands — has sparkle watermark (beige bg)
  console.log('Processing detail-hands-cupped.jpg (media_1790062125119.jpg)...');
  const handsImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062125119.jpg'), false);
  await writeImage(handsImg, path.join(destDir, 'detail-hands-cupped.jpg'));
  await writeImage(handsImg, path.join(artifactDir, 'detail-hands-cupped.jpg'));

  // 4. Model worn profile side shot — has sparkle watermark
  console.log('Processing model-worn-profile.jpg (media_1790062129229.jpg)...');
  const modelImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062129229.jpg'), false);
  await writeImage(modelImg, path.join(destDir, 'model-worn-profile.jpg'));
  await writeImage(modelImg, path.join(artifactDir, 'model-worn-profile.jpg'));

  // 5. Macro clover detail crop from pink pair hero
  console.log('Generating macro-clover-detail.jpg...');
  const macroBuf = await sharp(pinkImg.raw, { raw: { width: pinkImg.width, height: pinkImg.height, channels: pinkImg.channels } })
    .extract({ left: 300, top: 280, width: 380, height: 380 })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(destDir, 'macro-clover-detail.jpg'), macroBuf);
  fs.writeFileSync(path.join(artifactDir, 'macro-clover-detail.jpg'), macroBuf);

  console.log('✓ All 5 JC-KE-40 images processed!');

  // Supabase sync
  await upsertProduct({
    id: 45,
    name: 'JC-KE-40',
    full_name: 'JC-KE-40 Pink Quartz Clover Pavé Crystal Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-40',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 42,
    bad_count: 1,
    description: "Celebrate blooming femininity and botanical romance with the JC-KE-40 Pink Quartz Clover Pavé Crystal Stud Earrings. Masterfully crafted in certified 925 hallmarked sterling silver layered in warm 18K gold vermeil, each earring showcases a sculptural four-leaf clover silhouette. Three petals are inlaid with lustrous blush-pink cat's eye quartz cabochons that glow with a soft candlelit shimmer, while the alternating three petals are densely handset with brilliant round-cut AAA cubic zirconia crystals in antiqued gold prongs for dramatic tonal contrast. At the center where all petals converge, a polished gold knot of warm vermeil gleams as a precision focal point. Available in both romantic blush-pink and timeless ivory-white colorways, these sculptural studs are featherlight, 100% hypoallergenic, and fitted with secure comfort-fit stud posts for effortless day-to-evening elegance.",
    material: '18K Gold Vermeil 925 Sterling Silver, Cat\'s Eye Quartz Cabochons & AAA CZ Crystal',
    dimensions: '22mm x 22mm / Ultra-Lightweight (3.5g per pair)',
    finish: 'Warm 18K Gold Vermeil, Soft Blush-Pink Quartz Luster & Diamond Pavé Crystal Sparkle',
    image: '/images/products/jc-ke-40/hero-pink-pair.jpg',
    gallery: [
      '/images/products/jc-ke-40/hero-pink-pair.jpg',
      '/images/products/jc-ke-40/detail-ivory-satin-pair.jpg',
      '/images/products/jc-ke-40/detail-hands-cupped.jpg',
      '/images/products/jc-ke-40/model-worn-profile.jpg',
      '/images/products/jc-ke-40/macro-clover-detail.jpg',
    ],
    key_features: [
      "SKU: JC-KE-40 — Sculptural four-leaf clover with alternating cat's eye quartz & pavé CZ petals",
      "Three blush-pink cat's eye quartz cabochons with soft candlelit shimmer — also in ivory-white",
      'Three alternating petals densely handset with brilliant AAA cubic zirconia crystals in antique gold prongs',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  });
  await upsertVisibility(45);
  await upsertAvailability(45, 50);
}

// ══════════════════════════════════════════════════════════════════
// JC-KE-19 (ID: 46) — Mermaid Tail Pearl Ear Jacket Earrings
// Images: media_1790062166772 (pair on satin), media_1790062170839 (pair on card),
//         media_1790062175693 (pair held in hands on card)
// ══════════════════════════════════════════════════════════════════
async function processJcKe19() {
  console.log('\n=== Processing JC-KE-19 (ID: 46) ===');
  const destDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-19';
  const artifactDir = path.join(brainDir, 'jc_ke_19');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  // 1. Pair laid on satin fabric — has sparkle watermark
  console.log('Processing hero-satin-pair.jpg (media_1790062166772.jpg)...');
  const satinImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062166772.jpg'), true);
  await writeImage(satinImg, path.join(destDir, 'hero-satin-pair.jpg'));
  await writeImage(satinImg, path.join(artifactDir, 'hero-satin-pair.jpg'));

  // 2. Pair on white display card — diff at (922,921) is only 3.7 so likely clean, just copy
  console.log('Processing detail-card-display.jpg (media_1790062170839.jpg)...');
  const cardBuf = fs.readFileSync(path.join(uploadsDir, 'media_1790062170839.jpg'));
  const cardJpeg = await sharp(cardBuf).jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(destDir, 'detail-card-display.jpg'), cardJpeg);
  fs.writeFileSync(path.join(artifactDir, 'detail-card-display.jpg'), cardJpeg);

  // 3. Pair held in cupped hands on card — has sparkle watermark
  console.log('Processing detail-hands-held.jpg (media_1790062175693.jpg)...');
  const handsImg = await inpaintSparkle(path.join(uploadsDir, 'media_1790062175693.jpg'), false);
  await writeImage(handsImg, path.join(destDir, 'detail-hands-held.jpg'));
  await writeImage(handsImg, path.join(artifactDir, 'detail-hands-held.jpg'));

  // 4. Macro mermaid tail fin crop from satin pair
  console.log('Generating macro-tail-fin-detail.jpg...');
  // The mermaid tails appear in the lower-center of the satin shot
  const macroBuf = await sharp(satinImg.raw, { raw: { width: satinImg.width, height: satinImg.height, channels: satinImg.channels } })
    .extract({ left: 300, top: 350, width: 380, height: 380 })
    .jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(destDir, 'macro-tail-fin-detail.jpg'), macroBuf);
  fs.writeFileSync(path.join(artifactDir, 'macro-tail-fin-detail.jpg'), macroBuf);

  console.log('✓ All 4 JC-KE-19 images processed!');

  // Supabase sync
  await upsertProduct({
    id: 46,
    name: 'JC-KE-19',
    full_name: 'JC-KE-19 Mermaid Tail Pearl Ear Jacket Earrings - Smiths Jewellery',
    slug: 'jc-ke-19',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 38,
    bad_count: 1,
    description: "Dive into oceanic fantasy with the JC-KE-19 Mermaid Tail Pearl Ear Jacket Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in warm 18K gold vermeil, this enchanting 2-in-1 design pairs a lustrous high-luster round freshwater pearl stud sitting elegantly on the earlobe with a sweeping sculptural ear jacket worn behind. The jacket features a gracefully arching golden C-curve that flows into a bifurcated mermaid tail fin densely handset with brilliant micro-pavé AAA cubic zirconia crystals — capturing the shimmering scales of an oceanic fantasy. A smaller accent pearl nestles within the tail fork, completing the ethereal aquatic composition. Designed with hypoallergenic stud posts and smooth-slide jacket arm for effortless day-to-evening wearability. A timeless conversation starter that channels the magic of the deep.",
    material: '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearls & Micro-Pavé AAA CZ',
    dimensions: '38mm Arch x 16mm Tail Width / Ultra-Lightweight (3.8g per pair)',
    finish: 'Warm 18K Gold Vermeil, High-Luster Pearl White & Diamond Pavé Tail Sparkle',
    image: '/images/products/jc-ke-19/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-19/hero-satin-pair.jpg',
      '/images/products/jc-ke-19/detail-card-display.jpg',
      '/images/products/jc-ke-19/detail-hands-held.jpg',
      '/images/products/jc-ke-19/macro-tail-fin-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-19 — Convertible 2-in-1 freshwater pearl stud & sculptural mermaid tail ear jacket',
      'Arching gold C-curve jacket with bifurcated pavé-set mermaid tail fin and accent pearl nestled in fork',
      'Densely handset micro-pavé AAA cubic zirconia crystals replicating shimmering mermaid scales',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold Vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  });
  await upsertVisibility(46);
  await upsertAvailability(46, 50);
}

async function main() {
  await processJcKe40();
  await processJcKe19();
  console.log('\n🎉 ALL JC-KE-40 & JC-KE-19 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
