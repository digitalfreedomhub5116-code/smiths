const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-83';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_83');
  const testCropDir = path.join(brainDir, 'jc_ke_83_test');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });
  if (!fs.existsSync(testCropDir)) fs.mkdirSync(testCropDir, { recursive: true });

  const rawImages = [
    { file: 'media_1790006162572.jpg', name: 'hero-satin-pair.jpg' },
    { file: 'media_1790006166293.jpg', name: 'macro-satin-detail.jpg' },
    { file: 'media_1790006218369.jpg', name: 'model-worn.jpg' },
    { file: 'media_1790006201465.jpg', name: 'detail-held.jpg' },
    { file: 'media_1790006158384.jpg', name: 'packaging-display.jpg' }
  ];

  for (const item of rawImages) {
    const filePath = path.join(uploadsDir, item.file);
    console.log(`Processing ${item.file} -> ${item.name}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);
    const orig = Buffer.from(imgRaw.data);
    const starX = 922, starY = 922, R = 25;

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
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (Math.hypot(dx, dy) <= R) {
          const px = starX + dx, py = starY + dy;
          const pIdx = py * w + px;
          for (let c = 0; c < ch; c++) {
            buf[pIdx * ch + c] = avgBg[c];
          }
        }
      }
    }

    // 300 Laplace iterations
    for (let iter = 0; iter < 300; iter++) {
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          if (Math.hypot(dx, dy) <= R) {
            const px = starX + dx, py = starY + dy;
            const pIdx = py * w + px;
            for (let c = 0; c < ch; c++) {
              const up = ((py - 1) * w + px) * ch + c;
              const down = ((py + 1) * w + px) * ch + c;
              const left = (py * w + (px - 1)) * ch + c;
              const right = (py * w + (px + 1)) * ch + c;
              buf[pIdx * ch + c] = 0.25 * (buf[up] + buf[down] + buf[left] + buf[right]);
            }
          }
        }
      }
    }

    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (Math.hypot(dx, dy) <= R) {
          const px = starX + dx, py = starY + dy;
          const pIdx = py * w + px;
          for (let c = 0; c < ch; c++) {
            data[pIdx * ch + c] = Math.round(buf[pIdx * ch + c]);
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

    console.log(`Saved ${item.name} (${finalBuf.length} bytes)`);
  }

  console.log('Connecting to Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 27,
    name: 'JC-KE-83',
    full_name: 'JC-KE-83 - Smiths Jewellery',
    slug: 'jc-ke-83',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 39,
    bad_count: 1,
    description: 'Evoke celestial wonder with the JC-KE-83 Enchanted Dancing Fairy Stud Earrings. Masterfully sculpted in certified 925 hallmarked sterling silver with a radiant 18K gold vermeil finish, each earring depicts an ethereal dancing fairy ballerina poised in graceful flight. Her luminous translucent wings are shaped from opalescent cat\'s eye moonstone cabochons that shimmer with pearlescent brilliance, accented by a shimmering micro-pavé cubic zirconia crystal ballerina skirt. Featherlight, hypoallergenic, and fitted with secure comfort-fit stud posts for unforgettable day-to-evening magic.',
    material: '18K Gold Plated 925 Sterling Silver, Opalescent Moonstone & CZ',
    dimensions: '27mm x 16mm / Ultra-Lightweight (3.4g per pair)',
    finish: 'High-Polish Warm Gold & Iridescent Fairy Luster',
    image: '/images/products/jc-ke-83/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-83/hero-satin-pair.jpg',
      '/images/products/jc-ke-83/macro-satin-detail.jpg',
      '/images/products/jc-ke-83/model-worn.jpg',
      '/images/products/jc-ke-83/detail-held.jpg',
      '/images/products/jc-ke-83/packaging-display.jpg'
    ],
    key_features: [
      'SKU: JC-KE-83 — Sculptural dancing fairy ballerina silhouette with iridescent wings',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Luminous opalescent cat\'s eye moonstone cabochon wings with pearlescent glow',
      'Handset micro-pavé AAA cubic zirconia crystal ballerina skirt',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 27);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 27).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 27 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 27 inserted:', data);
  }

  console.log('ALL JC-KE-83 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
