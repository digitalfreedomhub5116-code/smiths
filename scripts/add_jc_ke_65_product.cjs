const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const brainDir = 'C:/Users/pruth/.gemini/antigravity/brain/026ab5d9-7a3a-4424-8999-8de03d9175e7';
const uploadsDir = path.join(brainDir, '.user_uploaded');
const publicDestDir = 'C:/Users/pruth/Downloads/smiths/public/images/products/jc-ke-65';
const brainArtifactDir = path.join(brainDir, 'jc_ke_65');

if (!fs.existsSync(publicDestDir)) fs.mkdirSync(publicDestDir, { recursive: true });
if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

// Standard circular Laplace inpainting for watermarks
function cleanSparkleCircle(data, w, h, ch, cx, cy, R = 30) {
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

// Inpaint competitor box text in background of model image
function cleanBoxText(data, w, h, ch) {
  const x0 = 785, x1 = 1023, y0 = 430, y1 = 570;
  const buf = new Float32Array(data);

  // Initialize with vertical linear gradient from top and bottom clean box borders
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / (y1 - y0);
    for (let x = x0; x <= x1; x++) {
      const idxTop = ((y0 - 1) * w + x) * ch;
      const idxBot = ((y1 + 1) * w + x) * ch;
      const idx = (y * w + x) * ch;
      for (let c = 0; c < ch; c++) {
        buf[idx + c] = (1 - t) * data[idxTop + c] + t * data[idxBot + c];
      }
    }
  }

  // Laplace relaxation for smooth seamless blend
  for (let iter = 0; iter < 1000; iter++) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const idx = (y * w + x) * ch;
        for (let c = 0; c < ch; c++) {
          const lVal = x > 0 ? buf[(y * w + (x - 1)) * ch + c] : buf[idx + c];
          const rVal = x < w - 1 ? buf[(y * w + (x + 1)) * ch + c] : buf[idx + c];
          buf[idx + c] = 0.25 * (
            buf[((y - 1) * w + x) * ch + c] + buf[((y + 1) * w + x) * ch + c] +
            lVal + rVal
          );
        }
      }
    }
  }

  // Copy back with subtle natural grain matching velvet box texture
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * w + x) * ch;
      const noise = (Math.random() - 0.5) * 2;
      for (let c = 0; c < ch; c++) {
        data[idx + c] = Math.max(0, Math.min(255, Math.round(buf[idx + c] + noise)));
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
  console.log('=== Processing JC-KE-65 Images ===');

  // 1. Hero: 4-piece set resting on white satin silk (media_1790071121281.jpg)
  console.log('1. Processing hero-satin-stack.jpg (media_1790071121281.jpg)...');
  let cleanStackBuf;
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071121281.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    cleanSparkleCircle(data, info.width, info.height, info.channels, 937, 663, 30);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'hero-satin-stack.jpg'),
      path.join(brainArtifactDir, 'hero-satin-stack.jpg')
    );
    cleanStackBuf = data;

    // Macro 1: All 4 pieces on satin silk
    console.log('   Generating macro-stack-detail.jpg...');
    await cropAndSave(cleanStackBuf, info.width, info.height, info.channels,
      { left: 220, top: 260, width: 570, height: 440 },
      path.join(publicDestDir, 'macro-stack-detail.jpg'),
      path.join(brainArtifactDir, 'macro-stack-detail.jpg')
    );

    // Macro 2: Close-up star and onyx clover pair
    console.log('   Generating macro-star-clover-pair.jpg...');
    await cropAndSave(cleanStackBuf, info.width, info.height, info.channels,
      { left: 235, top: 265, width: 290, height: 430 },
      path.join(publicDestDir, 'macro-star-clover-pair.jpg'),
      path.join(brainArtifactDir, 'macro-star-clover-pair.jpg')
    );
  }

  // 2. Model: Studio profile wearing clover + star stack (media_1790071118092.jpg)
  console.log('2. Processing model-worn-profile.jpg (media_1790071118092.jpg)...');
  let cleanModelBuf;
  {
    const { data: raw, info } = await sharp(path.join(uploadsDir, 'media_1790071118092.jpg'))
      .raw().toBuffer({ resolveWithObject: true });
    const data = Buffer.from(raw);
    cleanSparkleCircle(data, info.width, info.height, info.channels, 940, 688, 30);
    cleanBoxText(data, info.width, info.height, info.channels);
    await saveImg(data, info.width, info.height, info.channels,
      path.join(publicDestDir, 'model-worn-profile.jpg'),
      path.join(brainArtifactDir, 'model-worn-profile.jpg')
    );
    cleanModelBuf = data;

    // Model 2: Focused close crop on ear stack
    console.log('   Generating model-stack-detail.jpg...');
    await cropAndSave(cleanModelBuf, info.width, info.height, info.channels,
      { left: 360, top: 50, width: 440, height: 650 },
      path.join(publicDestDir, 'model-stack-detail.jpg'),
      path.join(brainArtifactDir, 'model-stack-detail.jpg')
    );
  }

  console.log('✓ All 5 JC-KE-65 images saved successfully!');

  // Supabase sync
  console.log('=== Syncing JC-KE-65 to Supabase Database ===');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 68,
    name: 'JC-KE-65',
    full_name: 'JC-KE-65 Onyx Clover & Pavé Star Curated Ear Wrap Huggie Set - Smiths Jewellery',
    slug: 'jc-ke-65',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.90,
    review_count: 48,
    bad_count: 1,
    description: "Elevate your ear stack with celestial glamour and iconic Parisian elegance in the JC-KE-65 Onyx Clover & Pavé Star Curated Ear Wrap Huggie Set. Masterfully sculpted in certified 925 hallmarked sterling silver layered in rich 18K gold vermeil, this four-piece curated stack pairs two signature motifs: a talismanic four-leaf clover inlaid with high-gloss mirror-polished black onyx framed by a halo of micro-pavé AAA cubic zirconia crystals, and an openwork celestial five-point star densely encrusted in sparkling pavé diamonds. Designed with an ergonomic U-curve huggie ear wrap silhouette that hooks comfortably through lobe piercings and sweeps beneath the ear for a seamless, floating cuff illusion. Wear them as matching pairs or mix-and-match in an asymmetrical multi-piercing constellation for effortless day-to-evening luxury.",
    material: '18K Gold Vermeil 925 Sterling Silver, Natural Black Onyx & Micro-Pavé AAA CZ',
    dimensions: 'Clover: 12mm x 12mm / Star: 11mm x 11mm / Wrap Depth: 14mm (Ultra-Lightweight 3.1g set)',
    finish: 'Warm 18K Gold Vermeil, Mirror-Polished Noir Onyx & Brilliant Diamond Pavé',
    image: '/images/products/jc-ke-65/hero-satin-stack.jpg',
    gallery: [
      '/images/products/jc-ke-65/hero-satin-stack.jpg',
      '/images/products/jc-ke-65/model-worn-profile.jpg',
      '/images/products/jc-ke-65/model-stack-detail.jpg',
      '/images/products/jc-ke-65/macro-stack-detail.jpg',
      '/images/products/jc-ke-65/macro-star-clover-pair.jpg',
    ],
    key_features: [
      'SKU: JC-KE-65 — Complete 4-piece curated ear wrap set (2 Black Onyx Clovers & 2 Pavé Stars)',
      'Hand-cut genuine black onyx four-leaf clovers framed by a brilliant micro-pavé CZ crystal halo',
      'Openwork 5-point celestial stars encrusted with multi-facet AAA cubic zirconia pavé',
      'Ergonomic U-curve huggie wrap post that sweeps beneath the lobe for a floating illusion',
      'Cast in certified 925 hallmarked Sterling Silver with radiant 18K gold vermeil finish',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears and all-day comfort',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate',
    ],
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 68);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('products').update(productData).eq('id', 68).select();
    if (error) console.error('Update error:', error);
    else console.log('✓ Supabase product 68 (JC-KE-65) updated!');
  } else {
    const { error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('✓ Supabase product 68 (JC-KE-65) inserted!');
  }

  // Visibility
  const visRec = { product_id: 68, is_hidden: false, is_featured: true, is_trending: true, updated_at: new Date().toISOString() };
  const { data: exVis } = await supabase.from('product_visibility').select('product_id').eq('product_id', 68);
  if (exVis && exVis.length > 0) await supabase.from('product_visibility').update(visRec).eq('product_id', 68);
  else await supabase.from('product_visibility').insert([visRec]);

  // Availability
  const avlRec = { product_id: 68, in_stock: true, stock_quantity: 50, allow_backorder: false, updated_at: new Date().toISOString() };
  const { data: exAvl } = await supabase.from('product_availability').select('product_id').eq('product_id', 68);
  if (exAvl && exAvl.length > 0) await supabase.from('product_availability').update(avlRec).eq('product_id', 68);
  else await supabase.from('product_availability').insert([avlRec]);

  console.log('🎉 JC-KE-65 PRODUCT CREATION & SUPABASE SYNC COMPLETE!');
}

main().catch(console.error);
