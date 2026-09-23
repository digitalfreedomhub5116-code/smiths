const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-70';
const brainArtifactDir = path.join(brainDir, 'jc_ke_70');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

// Standard circular Laplace inpainting
async function cleanSparkleCircle(data, w, h, ch, cx, cy, R = 30) {
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

  for (let iter = 0; iter < 1000; iter++)
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

// Seam-aligned inpainting for image 0 (model studio portrait)
function cleanSeamAligned(data, w, h, ch, cx = 944, cy = 683) {
  const m = 0.5125;
  const b = 661 - m * 900;
  const R = 28;
  const span = 34;

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      if (Math.hypot(dx, dy) <= R) {
        const px = cx + dx, py = cy + dy;
        const seamY = m * px + b;
        const dSeam = py - seamY;

        const xL = cx - span;
        const yL = Math.round(m * xL + b + dSeam);

        const xR = cx + span;
        const yR = Math.round(m * xR + b + dSeam);

        const t = (dx + span) / (2 * span);

        const idxL = (yL * w + xL) * ch;
        const idxR = (yR * w + xR) * ch;
        const pIdx = (py * w + px) * ch;

        for (let c = 0; c < ch; c++) {
          const val = (1 - t) * data[idxL + c] + t * data[idxR + c];
          data[pIdx + c] = Math.round(val);
        }
      }
    }
  }
}

// Ellipse skin inpainting for image 3 (hands held detail)
function cleanSkinEllipse(data, w, h, ch, cx = 936, cy = 682) {
  const rx = 24;
  const mask = new Uint8Array(w * h);

  for (let dy = -25; dy <= 22; dy++) {
    const ry = dy < 0 ? 21.5 : 18;
    for (let dx = -rx - 2; dx <= rx + 2; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
        mask[(cy + dy) * w + (cx + dx)] = 1;
      }
    }
  }

  let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
  for (let dy = -30; dy <= 26; dy++) {
    const ry = dy < 0 ? 21.5 : 18;
    for (let dx = -rx - 6; dx <= rx + 6; dx++) {
      const px = cx + dx, py = cy + dy;
      if (mask[py * w + px] === 0) {
        const dist = Math.hypot(dx / rx, dy / ry);
        if (dist >= 1.0 && dist <= 1.25) {
          const idx = (py * w + px) * ch;
          sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2]; cnt++;
        }
      }
    }
  }
  const avgR = sumR / cnt, avgG = sumG / cnt, avgB = sumB / cnt;

  const buf = new Float32Array(data);
  for (let dy = -25; dy <= 22; dy++) {
    for (let dx = -rx - 2; dx <= rx + 2; dx++) {
      const px = cx + dx, py = cy + dy;
      if (mask[py * w + px] === 1) {
        const idx = (py * w + px) * ch;
        buf[idx] = avgR; buf[idx + 1] = avgG; buf[idx + 2] = avgB;
      }
    }
  }

  for (let iter = 0; iter < 1500; iter++) {
    for (let dy = -25; dy <= 22; dy++) {
      for (let dx = -rx - 2; dx <= rx + 2; dx++) {
        const px = cx + dx, py = cy + dy;
        if (mask[py * w + px] === 1) {
          const idx = (py * w + px) * ch;
          for (let c = 0; c < ch; c++) {
            buf[idx + c] = 0.25 * (
              buf[((py - 1) * w + px) * ch + c] + buf[((py + 1) * w + px) * ch + c] +
              buf[(py * w + (px - 1)) * ch + c] + buf[(py * w + (px + 1)) * ch + c]
            );
          }
        }
      }
    }
  }

  for (let dy = -25; dy <= 22; dy++) {
    for (let dx = -rx - 2; dx <= rx + 2; dx++) {
      const px = cx + dx, py = cy + dy;
      if (mask[py * w + px] === 1) {
        const idx = (py * w + px) * ch;
        const noise = (Math.random() - 0.5) * 2;
        for (let c = 0; c < ch; c++) {
          data[idx + c] = Math.max(0, Math.min(255, Math.round(buf[idx + c] + noise)));
        }
      }
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
  console.log('=== Processing JC-KE-70 Images ===');

  // 1. Hero: Pair resting on white satin silk (media_1790071019869.jpg)
  console.log('1. Processing hero-satin-pair.jpg (media_1790071019869.jpg)...');
  let cleanHeroBuf;
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071019869.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkleCircle(data, info.width, info.height, info.channels, 941, 670, 28);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'hero-satin-pair.jpg'),
      path.join(brainArtifactDir, 'hero-satin-pair.jpg')
    );
    cleanHeroBuf = data;

    // Macro detail crop
    console.log('   Generating macro-flower-detail.jpg...');
    await cropAndSave(cleanHeroBuf, info.width, info.height, info.channels,
      { left: 240, top: 270, width: 500, height: 420 },
      path.join(publicDestDir, 'macro-flower-detail.jpg'),
      path.join(brainArtifactDir, 'macro-flower-detail.jpg')
    );
  }

  // 2. Detail: Hands held cupped with earrings (media_1790071031229.jpg)
  console.log('2. Processing detail-hands-held.jpg (media_1790071031229.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071031229.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    cleanSkinEllipse(data, info.width, info.height, info.channels, 936, 682);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'detail-hands-held.jpg'),
      path.join(brainArtifactDir, 'detail-hands-held.jpg')
    );
  }

  // 3. Model worn close-up on ear (media_1790071012981.jpg)
  console.log('3. Processing model-worn-ear.jpg (media_1790071012981.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071012981.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkleCircle(data, info.width, info.height, info.channels, 942, 686, 30);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-worn-ear.jpg'),
      path.join(brainArtifactDir, 'model-worn-ear.jpg')
    );
  }

  // 4. Model studio portrait (media_1790071001373.jpg)
  console.log('4. Processing model-studio-portrait.jpg (media_1790071001373.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071001373.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    cleanSeamAligned(data, info.width, info.height, info.channels, 944, 683);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-studio-portrait.jpg'),
      path.join(brainArtifactDir, 'model-studio-portrait.jpg')
    );
  }

  console.log('✓ All 5 JC-KE-70 images saved successfully!');

  // Supabase sync
  console.log('=== Syncing JC-KE-70 to Supabase Database ===');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 67,
    name: 'JC-KE-70',
    full_name: 'JC-KE-70 Asymmetrical Molten Petal Pavé Flower Pearl Stud Earrings - Smiths Jewellery',
    slug: 'jc-ke-70',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 53,
    bad_count: 1,
    description: "Exude Parisian romance and sculptural botanical artistry with the JC-KE-70 Asymmetrical Molten Petal Pavé Flower Pearl Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver layered in radiant 18K gold vermeil, each earring presents a five-petal pinwheel floral silhouette. Four delicate petals are hand-encrusted with brilliant micro-pavé AAA cubic zirconia crystals, dramatically contrasted by a single fluid petal cast in high-mirror molten gold. Nestled at the heart of each blooming whorl is a hand-matched, high-luster round white freshwater pearl stamen. 100% hypoallergenic, nickel-free, and fitted with secure comfort-fit stud posts for effortless day-to-evening luxury.",
    material: '18K Gold Vermeil 925 Sterling Silver, Freshwater Pearl & Micro-Pavé AAA CZ',
    dimensions: '16mm Diameter / Ultra-Lightweight (2.6g per pair)',
    finish: 'Warm 18K Gold Vermeil, Molten Petal Accent, Diamond Pavé & Iridescent Pearl',
    image: '/images/products/jc-ke-70/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-70/hero-satin-pair.jpg',
      '/images/products/jc-ke-70/detail-hands-held.jpg',
      '/images/products/jc-ke-70/model-worn-ear.jpg',
      '/images/products/jc-ke-70/model-studio-portrait.jpg',
      '/images/products/jc-ke-70/macro-flower-detail.jpg',
    ],
    key_features: [
      'SKU: JC-KE-70 — Sculptural 5-petal pinwheel blossom with asymmetrical molten gold accent',
      'Hand-set micro-pavé AAA cubic zirconia crystals across four articulated petals',
      'One fluid molten-gold petal creating dynamic texture and high-contrast light play',
      'Luminous round freshwater pearl centerpiece with deep iridescent luster',
      'Cast in certified 925 hallmarked Sterling Silver with 18K gold vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 67);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 67).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 67 (JC-KE-70) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 67 (JC-KE-70) inserted!');
  }

  // Visibility
  const visRec = { product_id: 67, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 67);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 67);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 67, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 67);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 67);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-70 PRODUCT CREATION & SUPABASE SYNC COMPLETE!');
}

main().catch(console.error);
