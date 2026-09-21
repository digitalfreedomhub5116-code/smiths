const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Per-image healing config: each image has a starX, starY, R, and optional
// edge-line (for skin edge) expressed as: line: {slope, intercept, bgSide}
// where line = dx - slope*dy - intercept. bgSide = 'positive' means dx > edgeX is bg.
const IMAGE_CONFIGS = [
  {
    file: 'media_1790006292081.jpg', name: 'hero-satin-pair.jpg',
    // Pair on golden satin - no skin edge, just uniform satin background
    starX: 939, starY: 679, R: 25,
    bgSample: { x: 960, y: 700 }
  },
  {
    file: 'media_1790006296443.jpg', name: 'model-worn-1.jpg',
    // Model portrait - skin edge passes through star at 45 degree angle
    starX: 939, starY: 679, R: 25,
    bgSample: { x: 960, y: 660 },
    skinEdge: {
      // Edge line: pixel (starX + dx, starY + dy) is background if dx > -37 + 1.025*dy + 15
      // i.e. dx - 1.025*dy > -37 + 15 = -22
      // i.e. dx - dy > -22 => means: bg when dx - dy > -15
      bgThreshold: -15,  // dx - dy > bgThreshold => background
      bgColor: [108, 96, 86],
      skinColor: [186, 150, 125]
    }
  },
  {
    file: 'media_1790006300803.jpg', name: 'detail-held.jpg',
    // Palms held - skin edge
    starX: 939, starY: 679, R: 25,
    bgSample: { x: 960, y: 680 }
  },
  {
    file: 'media_1790006304882.jpg', name: 'macro-satin-detail.jpg',
    // Pair on cream satin - no skin edge
    starX: 939, starY: 679, R: 25,
    bgSample: { x: 960, y: 690 }
  },
  {
    file: 'media_1790006312063.jpg', name: 'model-worn-2.jpg',
    // Model dark portrait - skin edge
    starX: 939, starY: 679, R: 25,
    bgSample: { x: 960, y: 670 },
    skinEdge: {
      bgThreshold: -10,  // dx - dy > -10 => background (dark studio backdrop)
      bgColor: [50, 45, 43],
      skinColor: [170, 130, 110]
    }
  }
];

async function healImage(imgRaw, config) {
  const { width: w, height: h, channels: ch } = imgRaw.info;
  const data = Buffer.from(imgRaw.data);
  const { starX, starY, R, bgSample, skinEdge } = config;

  // Sample bg color
  const bgIdx = (bgSample.y * w + bgSample.x) * ch;
  const bgR = data[bgIdx], bgG = data[bgIdx + 1], bgB = data[bgIdx + 2];

  const buf = new Float32Array(data);

  // Initialization: fill masked area with bg color (or blended with skin on edge)
  for (let dy = -R - 2; dy <= R + 2; dy++) {
    for (let dx = -R - 2; dx <= R + 2; dx++) {
      if (Math.hypot(dx, dy) > R) continue;
      const px = starX + dx, py = starY + dy;
      const pIdx = py * w + px;

      if (skinEdge) {
        const side = dx - dy; // simplified edge criterion
        if (side > skinEdge.bgThreshold + 2) {
          // Background
          buf[pIdx * ch] = bgR;
          buf[pIdx * ch + 1] = bgG;
          buf[pIdx * ch + 2] = bgB;
        } else if (side < skinEdge.bgThreshold - 2) {
          // Skin - initialize with skin color estimate
          buf[pIdx * ch] = skinEdge.skinColor[0];
          buf[pIdx * ch + 1] = skinEdge.skinColor[1];
          buf[pIdx * ch + 2] = skinEdge.skinColor[2];
        } else {
          // Transition zone - blend
          const t = (side - (skinEdge.bgThreshold - 2)) / 4.0;
          buf[pIdx * ch] = Math.round((1 - t) * skinEdge.skinColor[0] + t * bgR);
          buf[pIdx * ch + 1] = Math.round((1 - t) * skinEdge.skinColor[1] + t * bgG);
          buf[pIdx * ch + 2] = Math.round((1 - t) * skinEdge.skinColor[2] + t * bgB);
        }
      } else {
        buf[pIdx * ch] = bgR;
        buf[pIdx * ch + 1] = bgG;
        buf[pIdx * ch + 2] = bgB;
      }
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

  return { data, w, h, ch };
}

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-82';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_82');
  const testCropDir = path.join(brainDir, 'jc_ke_82_test');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });
  if (!fs.existsSync(testCropDir)) fs.mkdirSync(testCropDir, { recursive: true });

  for (const config of IMAGE_CONFIGS) {
    const filePath = path.join(uploadsDir, config.file);
    console.log(`Processing ${config.file} -> ${config.name}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { data, w, h, ch } = await healImage(imgRaw, config);

    const finalBuf = await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, config.name), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, config.name), finalBuf);

    const { starX, starY } = config;
    const cropBuf = await sharp(finalBuf)
      .extract({ left: starX - 50, top: starY - 50, width: 100, height: 100 })
      .jpeg({ quality: 95 })
      .toBuffer();
    fs.writeFileSync(path.join(testCropDir, 'crop_' + config.name), cropBuf);

    console.log(`Saved ${config.name} (${finalBuf.length} bytes)`);
  }

  console.log('Connecting to Supabase...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 28,
    name: 'JC-KE-82',
    full_name: 'JC-KE-82 - Smiths Jewellery',
    slug: 'jc-ke-82',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 41,
    bad_count: 1,
    description: 'Command bold two-tone sophistication with the JC-KE-82 Gold Dome & Textured Silver Fan Drop Earrings. Sculpted in certified 925 hallmarked sterling silver, each earring pairs a luminous high-polish 18K gold vermeil dome stud with a striking hand-etched radiating silver fan drop reminiscent of a cascading seashell. The mesmerizing contrasting metals create a modern architectural statement that transitions effortlessly from daywear to black-tie elegance. Hypoallergenic and featherlight with secure comfort-fit stud posts.',
    material: '18K Gold Plated 925 Sterling Silver & Rhodium Silver',
    dimensions: '32mm x 18mm / Ultra-Lightweight (4.2g per pair)',
    finish: 'High-Mirror Warm Gold Dome & Brushed Rhodium Fan',
    image: '/images/products/jc-ke-82/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-82/hero-satin-pair.jpg',
      '/images/products/jc-ke-82/model-worn-1.jpg',
      '/images/products/jc-ke-82/detail-held.jpg',
      '/images/products/jc-ke-82/macro-satin-detail.jpg',
      '/images/products/jc-ke-82/model-worn-2.jpg'
    ],
    key_features: [
      'SKU: JC-KE-82 — Architectural two-tone gold dome stud & etched silver fan drop',
      'Cast in certified 925 hallmarked Sterling Silver',
      'Radiant high-polish 18K gold vermeil dome contrasted with brushed rhodium fan',
      'Precision hand-etched radiating fan drop with seashell texture',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 28);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 28).select();
    if (error) console.error('Update error:', error);
    else console.log('Updated product 28:', data[0].name);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Insert error:', error);
    else console.log('Inserted product 28:', data[0].name);
  }

  console.log('JC-KE-82 COMPLETE!');
}

main().catch(console.error);
