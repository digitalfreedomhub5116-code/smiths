const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-27';
const brainArtifactDir = path.join(brainDir, 'jc_ke_27');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

async function cleanSparkle(data, w, h, ch, cx, cy, R = 28) {
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
}

async function cleanCard(data, w, h, ch) {
  // In media_1790070602682: card text is inside: x: 770..1024, y: 0..270
  const mask = new Uint8Array(w * h);

  for (let y = 0; y < 270; y++) {
    for (let x = 770; x < w; x++) {
      if (y < 0.58 * (x - 700) + 98) {
        const idx = (y * w + x) * ch;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        const diff = Math.abs(r - 203) + Math.abs(g - 179) + Math.abs(b - 143);
        if (diff > 14) {
          mask[y * w + x] = 1;
        }
      }
    }
  }

  // Dilate mask by 3px
  const dilated = new Uint8Array(w * h);
  for (let y = 1; y < 275; y++) {
    for (let x = 765; x < w - 1; x++) {
      let m = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (mask[(y + dy) * w + (x + dx)] === 1) {
            m = 1; break;
          }
        }
        if (m === 1) break;
      }
      dilated[y * w + x] = m;
    }
  }

  const bufR = new Float32Array(w * h);
  const bufG = new Float32Array(w * h);
  const bufB = new Float32Array(w * h);

  for (let y = 0; y < 280; y++) {
    for (let x = 760; x < w; x++) {
      const i = y * w + x;
      bufR[i] = data[i * ch];
      bufG[i] = data[i * ch + 1];
      bufB[i] = data[i * ch + 2];
    }
  }

  for (let y = 0; y < 280; y++) {
    for (let x = 760; x < w; x++) {
      const i = y * w + x;
      if (dilated[i]) {
        bufR[i] = 203; bufG[i] = 179; bufB[i] = 143;
      }
    }
  }

  for (let iter = 0; iter < 1200; iter++) {
    for (let y = 1; y < 275; y++) {
      for (let x = 765; x < w - 1; x++) {
        const i = y * w + x;
        if (dilated[i]) {
          bufR[i] = 0.25 * (bufR[i - 1] + bufR[i + 1] + bufR[i - w] + bufR[i + w]);
          bufG[i] = 0.25 * (bufG[i - 1] + bufG[i + 1] + bufG[i - w] + bufG[i + w]);
          bufB[i] = 0.25 * (bufB[i - 1] + bufB[i + 1] + bufB[i - w] + bufB[i + w]);
        }
      }
    }
  }

  for (let y = 0; y < 280; y++) {
    for (let x = 760; x < w; x++) {
      const i = y * w + x;
      if (dilated[i]) {
        data[i * ch] = Math.round(bufR[i]);
        data[i * ch + 1] = Math.round(bufG[i]);
        data[i * ch + 2] = Math.round(bufB[i]);
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
  console.log('--- Processing JC-KE-27 Images ---');

  // 1. Hero: Pair resting on white satin silk
  console.log('Processing hero-satin-pair.jpg (media_1790070599532.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070599532.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkle(data, info.width, info.height, info.channels, 938, 695, 26);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'hero-satin-pair.jpg'),
      path.join(brainArtifactDir, 'hero-satin-pair.jpg')
    );

    // 5. Macro cabochon detail crop
    console.log('Generating macro-cabochon-detail.jpg from hero-satin-pair...');
    await cropAndSave(data, info.width, info.height, info.channels,
      { left: 270, top: 290, width: 460, height: 350 },
      path.join(publicDestDir, 'macro-cabochon-detail.jpg'),
      path.join(brainArtifactDir, 'macro-cabochon-detail.jpg')
    );
  }

  // 2. Detail: Hand held stud against sheer drape
  console.log('Processing detail-hands-held.jpg (media_1790070594397.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070594397.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    const cx = 932, cy = 686, R = 28;
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(dx, dy);
        if (d <= R) {
          const px = cx + dx, py = cy + dy;
          const rx = px, ry = py - 50;
          const t = d / R;
          const wgt = 1 - (3 * t * t - 2 * t * t * t);
          const pIdx = (py * info.width + px) * info.channels;
          const rIdx = (ry * info.width + rx) * info.channels;
          for (let c = 0; c < info.channels; c++) {
            data[pIdx + c] = Math.round((1 - wgt) * data[pIdx + c] + wgt * data[rIdx + c]);
          }
        }
      }
    }
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'detail-hands-held.jpg'),
      path.join(brainArtifactDir, 'detail-hands-held.jpg')
    );
  }

  // 3. Model worn ear close-up (with cleaned stationary card + step-blended corner)
  console.log('Processing model-worn-ear.jpg (media_1790070602682.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070602682.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);

    // Clean watermark with step-blend
    const cx = 937, cy = 680, R = 28;
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(dx, dy);
        if (d <= R) {
          const px = cx + dx, py = cy + dy;
          const rx = px, ry = py - 40;
          let wgt = 1.0;
          if (d > 22) {
            wgt = (R - d) / (R - 22);
          }
          const pIdx = (py * info.width + px) * info.channels;
          const rIdx = (ry * info.width + rx) * info.channels;
          for (let c = 0; c < info.channels; c++) {
            data[pIdx + c] = Math.round((1 - wgt) * data[pIdx + c] + wgt * data[rIdx + c]);
          }
        }
      }
    }

    // Clean stationary card removing competitor branding
    await cleanCard(data, info.width, info.height, info.channels);

    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-worn-ear.jpg'),
      path.join(brainArtifactDir, 'model-worn-ear.jpg')
    );
  }

  // 4. Model studio portrait
  console.log('Processing model-studio-portrait.jpg (media_1790070605954.jpg)...');
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790070605954.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    await cleanSparkle(data, info.width, info.height, info.channels, 932, 672, 28);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-studio-portrait.jpg'),
      path.join(brainArtifactDir, 'model-studio-portrait.jpg')
    );
  }

  console.log('✓ All 5 JC-KE-27 image assets created successfully!');

  // Sync to Supabase
  console.log('--- Syncing JC-KE-27 to Supabase Live Database ---');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 65,
    name: 'JC-KE-27',
    full_name: "JC-KE-27 Luminous Cat's Eye Bezel Stud Earrings - Smiths Jewellery",
    slug: 'jc-ke-27',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 52,
    bad_count: 1,
    description: "Radiate celestial elegance and timeless vintage glamour with the JC-KE-27 Luminous Cat's Eye Bezel Stud Earrings. Handcrafted in certified 925 hallmarked sterling silver enveloped in opulent 18K gold vermeil, each earring centers a genuine, high-domed chatoyant white cat's eye cabochon stone. As light shifts, an ethereal, luminous slit of light dances across the milky opalescent surface, framed within a substantial, mirror-polished gold bezel rim. Sized to make a refined statement whether paired with sharp tailoring or evening silk, these classic round button studs sit comfortably flush to the earlobe. 100% hypoallergenic, nickel-free, and secured with comfort-fit stud backs for effortless all-day wear.",
    material: "18K Gold Vermeil 925 Sterling Silver & Luminous Chatoyant Cat's Eye Cabochon",
    dimensions: '13mm Diameter / Ultra-Lightweight (2.2g per pair)',
    finish: 'High-Polish 18K Yellow Gold Vermeil & Silky Chatoyant Lustre',
    image: '/images/products/jc-ke-27/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-27/hero-satin-pair.jpg',
      '/images/products/jc-ke-27/detail-hands-held.jpg',
      '/images/products/jc-ke-27/model-worn-ear.jpg',
      '/images/products/jc-ke-27/model-studio-portrait.jpg',
      '/images/products/jc-ke-27/macro-cabochon-detail.jpg',
    ],
    key_features: [
      "SKU: JC-KE-27 — High-domed chatoyant white cat's eye cabochon centerpiece",
      'Radiant 18K yellow gold vermeil bezel frame with mirror-gloss finish',
      'Dynamic chatoyant optical effect shifting with ambient light and movement',
      'Crafted in certified 925 hallmarked Sterling Silver with anti-tarnish barrier',
      '100% Hypoallergenic — Nickel-Free and Lead-Free with secure comfort-fit stud posts',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 65);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 65).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 65 (JC-KE-27) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 65 (JC-KE-27) inserted!');
  }

  // Visibility
  const visRec = { product_id: 65, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 65);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 65);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 65, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 65);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 65);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-27 IMAGE GENERATION & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
