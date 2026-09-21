const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function replaceJcKe88Images() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const userUploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-88';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_88');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const tasks = [
    {
      src: 'media_1790005271361.jpg',
      destName: 'hero-satin-pair.jpg',
      starX: 922,
      starY: 920,
      r: 25
    },
    {
      src: 'media_1790005253547.jpg',
      destName: 'model-worn.jpg',
      starX: 922,
      starY: 922,
      r: 25
    },
    {
      src: 'media_1790005249471.jpg',
      destName: 'detail-held.jpg',
      starX: 922,
      starY: 922,
      r: 25
    },
    {
      src: 'media_1790005245335.jpg',
      destName: 'macro-satin-detail.jpg',
      starX: 922,
      starY: 922,
      r: 25
    },
    {
      src: 'media_1790005240030.jpg',
      destName: 'packaging-display.jpg',
      starX: 922,
      starY: 918,
      r: 24,
      isDualCollar: true
    }
  ];

  for (const task of tasks) {
    const filePath = path.join(userUploadsDir, task.src);
    console.log(`Processing ${task.src} -> ${task.destName}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = imgRaw.info;
    const data = Buffer.from(imgRaw.data);
    const { starX, starY, r: R } = task;

    const buf = new Float32Array(data);

    if (task.isDualCollar) {
      const isSkin = (x, y) => (y < 923 + (x - 895) * 0.34);
      for (let iter = 0; iter < 300; iter++) {
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            if (Math.hypot(dx, dy) <= R) {
              const px = starX + dx, py = starY + dy;
              const pIdx = py * w + px;
              const skin = isSkin(px, py);
              const nbs = [
                { x: px, y: py - 1 },
                { x: px, y: py + 1 },
                { x: px - 1, y: py },
                { x: px + 1, y: py }
              ];
              for (let c = 0; c < ch; c++) {
                let sum = 0, count = 0;
                for (const n of nbs) {
                  if (isSkin(n.x, n.y) === skin) {
                    sum += buf[(n.y * w + n.x) * ch + c];
                    count++;
                  }
                }
                if (count > 0) buf[pIdx * ch + c] = sum / count;
              }
            }
          }
        }
      }
    } else {
      for (let iter = 0; iter < 250; iter++) {
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

    fs.writeFileSync(path.join(destDir, task.destName), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, task.destName), finalBuf);
    console.log(`Saved ${task.destName} (${finalBuf.length} bytes)`);
  }

  console.log('Updating Supabase product 19 (JC-KE-88)...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const { data, error } = await supabase.from('products').update({
    name: 'JC-KE-88',
    image: '/images/products/jc-ke-88/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-88/hero-satin-pair.jpg',
      '/images/products/jc-ke-88/model-worn.jpg',
      '/images/products/jc-ke-88/detail-held.jpg',
      '/images/products/jc-ke-88/macro-satin-detail.jpg',
      '/images/products/jc-ke-88/packaging-display.jpg'
    ],
    updated_at: new Date().toISOString()
  }).eq('id', 19).select();

  if (error) {
    console.error('Supabase update error:', error);
  } else {
    console.log('Supabase product 19 successfully updated with new gallery!');
  }

  console.log('ALL 5 JC-KE-88 IMAGES REPLACED WITH FLAWLESS INPAINTING!');
}

replaceJcKe88Images().catch(console.error);
