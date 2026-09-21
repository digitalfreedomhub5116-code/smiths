const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-85';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_85');
  const testCropDir = path.join(brainDir, 'jc_ke_85_test');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });
  if (!fs.existsSync(testCropDir)) fs.mkdirSync(testCropDir, { recursive: true });

  const rawImages = [
    { file: 'media_1790005868901.jpg', name: 'hero-satin-pair.jpg', textured: true },
    { file: 'media_1790005873423.jpg', name: 'macro-satin-detail.jpg', textured: false },
    { file: 'media_1790005877484.jpg', name: 'model-worn.jpg', textured: false },
    { file: 'media_1790005881729.jpg', name: 'detail-held.jpg', textured: false },
    { file: 'media_1790005885445.jpg', name: 'packaging-display.jpg', textured: false, hasText: true }
  ];

  for (const item of rawImages) {
    const filePath = path.join(uploadsDir, item.file);
    console.log(`Processing ${item.file} -> ${item.name}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);
    const orig = Buffer.from(imgRaw.data);
    const starX = 939, starY = 679, R = 25;

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

    // 300 Laplace iterations for star
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

    if (item.textured) {
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const d = Math.hypot(dx, dy);
          if (d <= R) {
            const px = starX + dx, py = starY + dy;
            const pIdx = py * w + px;
            const srcX = px - 60;
            const srcIdx = py * w + srcX;

            for (let c = 0; c < ch; c++) {
              let srcMean = 0, count = 0;
              for (let ky = -2; ky <= 2; ky++) {
                for (let kx = -2; kx <= 2; kx++) {
                  srcMean += orig[((py + ky) * w + (srcX + kx)) * ch + c];
                  count++;
                }
              }
              srcMean /= count;
              const highFreq = orig[srcIdx * ch + c] - srcMean;
              const val = buf[pIdx * ch + c] + highFreq * 0.9;
              data[pIdx * ch + c] = Math.min(255, Math.max(0, Math.round(val)));
            }
          }
        }
      }
    } else {
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
    }

    // Inpaint text if present (for image 5)
    if (item.hasText) {
      console.log('Inpainting AURA & ÉTOILE branding text...');
      const x1 = 370, x2 = 502, y1 = 730, y2 = 754;
      // Initialize text box to average of boundary
      const textAvg = [0, 0, 0];
      let tCount = 0;
      for (let x = x1; x <= x2; x++) {
        const topIdx = ((y1 - 1) * w + x) * ch;
        const botIdx = ((y2 + 1) * w + x) * ch;
        for (let c = 0; c < ch; c++) {
          textAvg[c] += orig[topIdx + c] + orig[botIdx + c];
        }
        tCount += 2;
      }
      for (let c = 0; c < ch; c++) textAvg[c] /= tCount;

      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          const pIdx = (y * w + x) * ch;
          for (let c = 0; c < ch; c++) {
            buf[pIdx + c] = textAvg[c];
          }
        }
      }

      for (let iter = 0; iter < 300; iter++) {
        for (let y = y1; y <= y2; y++) {
          for (let x = x1; x <= x2; x++) {
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

      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
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
        .extract({ left: 350, top: 720, width: 170, height: 40 })
        .jpeg({ quality: 95 })
        .toBuffer();
      fs.writeFileSync(path.join(testCropDir, 'crop_text_healed.jpg'), textCrop);
    }

    console.log(`Saved ${item.name} (${finalBuf.length} bytes)`);
  }

  console.log('Connecting to Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 24,
    name: 'JC-KE-85',
    full_name: 'JC-KE-85 - Smiths Jewellery',
    slug: 'jc-ke-85',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 33,
    bad_count: 1,
    description: 'Captivate every gaze with the JC-KE-85 Pavé Crystal Ribbon Bow Drop Earrings. Masterfully sculpted in warm 18K gold over certified 925 hallmarked sterling silver, each earring features a dimensional ribbon bow motif densely handset with brilliant diamond-cut cubic zirconia crystals. Suspended beneath are dual articulated pavé tennis ribbons that cascade with fluid kinetic sparkle at every turn. Hypoallergenic, featherlight, and engineered for unforgettable day-to-night glamour.',
    material: '18K Gold Plated 925 Sterling Silver & AAA Cubic Zirconia',
    dimensions: '28mm x 14mm / Ultra-Lightweight (3.5g per pair)',
    finish: 'High-Polish Warm Gold & Diamond Pavé Luster',
    image: '/images/products/jc-ke-85/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-85/hero-satin-pair.jpg',
      '/images/products/jc-ke-85/macro-satin-detail.jpg',
      '/images/products/jc-ke-85/model-worn.jpg',
      '/images/products/jc-ke-85/detail-held.jpg',
      '/images/products/jc-ke-85/packaging-display.jpg'
    ],
    key_features: [
      'SKU: JC-KE-85 — Micro-pavé crystal ribbon bow stud & dual cascading tennis streamer drop',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Hand-set AAA brilliant diamond-cut cubic zirconia crystals with diamond sparkle',
      'Articulated dual-strand drop ribbons for fluid light-catching motion',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 24);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 24).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 24 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 24 inserted:', data);
  }

  console.log('ALL JC-KE-85 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
