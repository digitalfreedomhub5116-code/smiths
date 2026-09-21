const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function replaceJcKe55Images() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const userUploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-55';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_55');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const tasks = [
    {
      src: 'media_1790005133840.jpg',
      destName: 'hero-satin-pair.jpg',
      hasStar: false
    },
    {
      src: 'media_1790005119236.jpg',
      destName: 'model-worn.jpg',
      hasStar: true,
      starX: 918,
      starY: 935,
      rOut: 38
    },
    {
      src: 'media_1790005130406.jpg',
      destName: 'detail-held.jpg',
      hasStar: true,
      starX: 932,
      starY: 922,
      rOut: 38
    },
    {
      src: 'media_1790005126930.jpg',
      destName: 'macro-satin-detail.jpg',
      hasStar: true,
      starX: 922,
      starY: 922,
      rOut: 38
    },
    {
      src: 'media_1790005123416.jpg',
      destName: 'packaging-display.jpg',
      hasStar: true,
      starX: 922,
      starY: 922,
      rOut: 38
    }
  ];

  for (const task of tasks) {
    const filePath = path.join(userUploadsDir, task.src);
    console.log(`Processing ${task.src} -> ${task.destName}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const w = imgRaw.info.width, h = imgRaw.info.height;
    const outBuf = Buffer.from(imgRaw.data);

    if (task.hasStar) {
      const { starX, starY, rOut: R_OUT } = task;
      for (let dy = -R_OUT; dy <= R_OUT; dy++) {
        for (let dx = -R_OUT; dx <= R_OUT; dx++) {
          const d = Math.hypot(dx, dy);
          if (d <= R_OUT) {
            const theta = Math.atan2(dy, dx);
            const sx = Math.min(w - 1, Math.max(0, Math.round(starX + (R_OUT + 5) * Math.cos(theta))));
            const sy = Math.min(h - 1, Math.max(0, Math.round(starY + (R_OUT + 5) * Math.sin(theta))));
            const srcIdx = (sy * w + sx) * imgRaw.info.channels;
            const dstIdx = ((starY + dy) * w + (starX + dx)) * imgRaw.info.channels;

            const weight = Math.min(1.0, Math.max(0, (R_OUT - d) / 6.0));
            outBuf[dstIdx] = Math.round(imgRaw.data[dstIdx] * (1 - weight) + imgRaw.data[srcIdx] * weight);
            outBuf[dstIdx + 1] = Math.round(imgRaw.data[dstIdx + 1] * (1 - weight) + imgRaw.data[srcIdx + 1] * weight);
            outBuf[dstIdx + 2] = Math.round(imgRaw.data[dstIdx + 2] * (1 - weight) + imgRaw.data[srcIdx + 2] * weight);
          }
        }
      }
    }

    const finalBuf = await sharp(outBuf, { raw: { width: w, height: h, channels: imgRaw.info.channels } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, task.destName), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, task.destName), finalBuf);
    console.log(`Saved ${task.destName} (${finalBuf.length} bytes)`);
  }

  console.log('Updating Supabase product 20 timestamp...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const { error } = await supabase.from('products').update({
    image: '/images/products/jc-ke-55/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-55/hero-satin-pair.jpg',
      '/images/products/jc-ke-55/model-worn.jpg',
      '/images/products/jc-ke-55/detail-held.jpg',
      '/images/products/jc-ke-55/macro-satin-detail.jpg',
      '/images/products/jc-ke-55/packaging-display.jpg'
    ],
    updated_at: new Date().toISOString()
  }).eq('id', 20);

  if (error) console.error('Supabase update error:', error);
  else console.log('Supabase product 20 successfully updated with new gallery!');

  console.log('ALL JC-KE-55 IMAGES REPLACED SUCCESSFULLY!');
}

replaceJcKe55Images().catch(console.error);
