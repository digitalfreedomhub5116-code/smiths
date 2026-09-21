const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-77';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_77');
  const testCropDir = path.join(brainDir, 'jc_ke_77_test');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });
  if (!fs.existsSync(testCropDir)) fs.mkdirSync(testCropDir, { recursive: true });

  // JC-KE-77: Black Enamel & Pavé CZ Bow Earrings - 4 images (1024x764)
  // Star at (939, 679), R = 25
  const rawImages = [
    { file: 'media_1790006497838.jpg', name: 'hero-satin-pair.jpg' },
    { file: 'media_1790006521636.jpg', name: 'model-worn.jpg' },
    { file: 'media_1790006533922.jpg', name: 'detail-held.jpg' },
    { file: 'media_1790006546945.jpg', name: 'packaging-display.jpg' }
  ];

  const starX = 939, starY = 679, R = 25;

  for (const item of rawImages) {
    const filePath = path.join(uploadsDir, item.file);
    console.log('Processing', item.file, '->', item.name, '...');
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);

    // Sample background near star
    const bgIdx = ((starY - 30) * w + (starX + 30)) * ch;
    const bgR = data[bgIdx], bgG = data[bgIdx + 1], bgB = data[bgIdx + 2];
    console.log('Background sample:', bgR, bgG, bgB);

    const buf = new Float32Array(data);

    // Initialize masked region with background
    for (let dy = -R - 2; dy <= R + 2; dy++) {
      for (let dx = -R - 2; dx <= R + 2; dx++) {
        if (Math.hypot(dx, dy) > R) continue;
        const px = starX + dx, py = starY + dy;
        const pIdx = py * w + px;
        buf[pIdx * ch] = bgR;
        buf[pIdx * ch + 1] = bgG;
        buf[pIdx * ch + 2] = bgB;
      }
    }

    // 300 Laplace iterations
    for (let iter = 0; iter < 300; iter++) {
      for (let dy = -R - 2; dy <= R + 2; dy++) {
        for (let dx = -R - 2; dx <= R + 2; dx++) {
          if (Math.hypot(dx, dy) > R) continue;
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

    for (let dy = -R - 2; dy <= R + 2; dy++) {
      for (let dx = -R - 2; dx <= R + 2; dx++) {
        if (Math.hypot(dx, dy) > R) continue;
        const px = starX + dx, py = starY + dy;
        const pIdx = py * w + px;
        for (let c = 0; c < ch; c++) {
          data[pIdx * ch + c] = Math.round(buf[pIdx * ch + c]);
        }
      }
    }

    const finalBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, item.name), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, item.name), finalBuf);

    const cropBuf = await sharp(finalBuf)
      .extract({ left: starX - 50, top: starY - 50, width: 100, height: 100 })
      .jpeg({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(testCropDir, 'crop_' + item.name), cropBuf);

    console.log('Saved', item.name, '(' + finalBuf.length + ' bytes)');
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 29,
    name: 'JC-KE-77',
    full_name: 'JC-KE-77 - Smiths Jewellery',
    slug: 'jc-ke-77',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 44,
    bad_count: 1,
    description: 'Elevate your signature look with the JC-KE-77 Black Enamel & Pavé Crystal Bow Stud Earrings. Sculpted in certified 925 hallmarked sterling silver with a luminous 18K gold vermeil finish, each earring showcases an oversized dimensional ribbon bow motif hand-set with brilliant round-cut cubic zirconia crystals along every edge. Deep black glossy enamel fills each petal panel for dramatic contrast and a couture finish. A solitaire round CZ gleams at the bow center knot. Hypoallergenic, featherlight, and perfect for bold day-to-evening glamour.',
    material: '18K Gold Plated 925 Sterling Silver, Black Enamel & CZ',
    dimensions: '22mm x 20mm / Ultra-Lightweight (3.8g per pair)',
    finish: 'High-Polish Warm Gold, Glossy Black Enamel & Diamond Pavé',
    image: '/images/products/jc-ke-77/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-77/hero-satin-pair.jpg',
      '/images/products/jc-ke-77/model-worn.jpg',
      '/images/products/jc-ke-77/detail-held.jpg',
      '/images/products/jc-ke-77/packaging-display.jpg'
    ],
    key_features: [
      'SKU: JC-KE-77 — Oversized dimensional ribbon bow with black enamel & pavé CZ',
      'Cast in certified 925 hallmarked Sterling Silver with warm 18K Gold finish',
      'Hand-set brilliant round-cut AAA cubic zirconia crystals along all bow edges',
      'Glossy black enamel petal fill for couture contrast',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 29);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 29).select();
    if (error) console.error('Update error:', error);
    else console.log('Updated product 29:', data[0].name);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('Inserted product 29:', data[0].name);
  }

  console.log('JC-KE-77 COMPLETE!');
}

main().catch(console.error);
