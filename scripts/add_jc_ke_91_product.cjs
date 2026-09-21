const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-91';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_91');
  const testCropDir = path.join(brainDir, 'jc_ke_91_test');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });
  if (!fs.existsSync(testCropDir)) fs.mkdirSync(testCropDir, { recursive: true });

  const rawImages = [
    { file: 'media_1790005997366.jpg', name: 'hero-satin-pair.jpg' },
    { file: 'media_1790005984545.jpg', name: 'macro-satin-detail.jpg', hasText: true },
    { file: 'media_1790005980402.jpg', name: 'model-worn.jpg' },
    { file: 'media_1790005988701.jpg', name: 'detail-held.jpg' },
    { file: 'media_1790005992843.jpg', name: 'packaging-display.jpg' }
  ];

  for (const item of rawImages) {
    const filePath = path.join(uploadsDir, item.file);
    console.log(`Processing ${item.file} -> ${item.name}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);
    const orig = Buffer.from(imgRaw.data);
    const starX = 939, starY = 679, R = 25;

    // Mask function: includes star, plus text if hasText
    function isMask(x, y) {
      if (Math.hypot(x - starX, y - starY) <= R) return true;
      if (item.hasText && x >= 855 && x <= 1008 && y >= 706 && y <= 748) return true;
      return false;
    }

    // Boundary average for initialization
    const avgBg = [0, 0, 0];
    let countBg = 0;
    for (let a = 0; a < 360; a += 5) {
      const rad = a * Math.PI / 180;
      const bx = Math.round(starX + (R + 2) * Math.cos(rad));
      const by = Math.round(starY + (R + 2) * Math.sin(rad));
      const bIdx = (by * w + bx) * ch;
      avgBg[0] += orig[bIdx]; avgBg[1] += orig[bIdx+1]; avgBg[2] += orig[bIdx+2];
      countBg++;
    }
    avgBg[0] /= countBg; avgBg[1] /= countBg; avgBg[2] /= countBg;

    const buf = new Float32Array(data);
    for (let y = Math.max(0, starY - 50); y < Math.min(h, starY + 80); y++) {
      for (let x = Math.max(0, starX - 100); x < Math.min(w, starX + 80); x++) {
        if (isMask(x, y)) {
          const pIdx = (y * w + x) * ch;
          for (let c = 0; c < ch; c++) buf[pIdx + c] = avgBg[c];
        }
      }
    }

    // Laplace diffusion
    for (let iter = 0; iter < 350; iter++) {
      for (let y = Math.max(1, starY - 50); y < Math.min(h - 1, starY + 80); y++) {
        for (let x = Math.max(1, starX - 100); x < Math.min(w - 1, starX + 80); x++) {
          if (isMask(x, y)) {
            const pIdx = (y * w + x) * ch;
            for (let c = 0; c < ch; c++) {
              const up = ((y - 1) * w + x) * ch + c;
              const down = ((y + 1) * w + x) * ch + c;
              const left = (y * w + (x - 1)) * ch + c;
              const right = (y * w + (x + 1)) * ch + c;
              buf[pIdx + c] = 0.25 * (buf[up] + buf[down] + buf[left] + buf[right]);
            }
          }
        }
      }
    }

    for (let y = Math.max(0, starY - 50); y < Math.min(h, starY + 80); y++) {
      for (let x = Math.max(0, starX - 100); x < Math.min(w, starX + 80); x++) {
        if (isMask(x, y)) {
          const pIdx = (y * w + x) * ch;
          for (let c = 0; c < ch; c++) {
            data[pIdx + c] = Math.round(buf[pIdx + c]);
          }
        }
      }
    }

    const finalBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, item.name), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, item.name), finalBuf);

    // Save test crop around star
    const cropBuf = await sharp(finalBuf)
      .extract({ left: starX - 40, top: starY - 40, width: 80, height: 80 })
      .jpeg({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(testCropDir, `crop_${item.name}`), cropBuf);

    if (item.hasText) {
      const textCrop = await sharp(finalBuf)
        .extract({ left: 1024 - 220, top: 764 - 130, width: 220, height: 130 })
        .jpeg({ quality: 95 })
        .toBuffer();
      fs.writeFileSync(path.join(testCropDir, 'crop_macro_detail_healed_br.jpg'), textCrop);
    }

    console.log(`Saved ${item.name} (${finalBuf.length} bytes)`);
  }

  console.log('Connecting to Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 25,
    name: 'JC-KE-91',
    full_name: 'JC-KE-91 - Smiths Jewellery',
    slug: 'jc-ke-91',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 36,
    bad_count: 1,
    description: 'Channel royal refinement with the JC-KE-91 Pavé Bow Teardrop Pearl Earrings. Sculpted in radiant 18K gold vermeil over certified 925 hallmarked sterling silver, each earring showcases a delicate bow motif that flows into an open teardrop halo encrusted with shimmering pavé-set cubic zirconia crystals. Nestled within the teardrop cradle is a floating, high-luster round white freshwater pearl that radiates iridescent brilliance. Complete with hypoallergenic stud backings for seamless, lightweight day-to-evening elegance.',
    material: '18K Gold Plated 925 Sterling Silver, Freshwater Pearls & CZ',
    dimensions: '24mm x 13mm / Ultra-Lightweight (3.4g per pair)',
    finish: 'High-Polish Warm Gold with Gloss Pearl Sheen',
    image: '/images/products/jc-ke-91/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-91/hero-satin-pair.jpg',
      '/images/products/jc-ke-91/macro-satin-detail.jpg',
      '/images/products/jc-ke-91/model-worn.jpg',
      '/images/products/jc-ke-91/detail-held.jpg',
      '/images/products/jc-ke-91/packaging-display.jpg'
    ],
    key_features: [
      'SKU: JC-KE-91 — Pavé crystal bow stud & open teardrop loop with suspended floating pearl',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Hand-selected luminous round freshwater pearl focal drop',
      'Micro-pavé AAA cubic zirconia stones along the bow and teardrop halo',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 25);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 25).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 25 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 25 inserted:', data);
  }

  console.log('ALL JC-KE-91 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
