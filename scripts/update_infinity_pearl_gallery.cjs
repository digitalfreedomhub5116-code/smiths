const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function updateInfinityGallery() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const userUploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/infinity-pearl-double';
  const brainArtifactDir = path.join(brainDir, 'infinity_pearl_gallery');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const tasks = [
    {
      src: 'media_1789922513326.jpg',
      destName: 'hero-satin-pair.jpg',
      star: { x: 918, y: 929, rOut: 36 }
    },
    {
      src: 'media_1789922526989.jpg',
      destName: 'model-worn.jpg',
      star: { x: 928, y: 912, rOut: 36 }
    },
    {
      src: 'media_1789922555378.jpg',
      destName: 'detail-held.jpg',
      star: { x: 935, y: 919, rOut: 36 }
    },
    {
      src: 'media_1789922538161.jpg',
      destName: 'macro-satin-detail.jpg',
      star: { x: 927, y: 933, rOut: 36 }
    },
    {
      src: 'media_1789922538161.jpg',
      destName: 'lifestyle-satin-glow.jpg',
      star: { x: 927, y: 933, rOut: 36 }
    }
  ];

  for (const task of tasks) {
    const filePath = path.join(userUploadsDir, task.src);
    console.log(`Processing ${task.src} -> ${task.destName}...`);
    const imgRaw = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    const w = imgRaw.info.width, h = imgRaw.info.height;
    const outBuf = Buffer.from(imgRaw.data);

    const { x: starX, y: starY, rOut: R_OUT } = task.star;

    // Seamless radial feather heal of the watermark star
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

    const finalBuf = await sharp(outBuf, { raw: { width: w, height: h, channels: imgRaw.info.channels } })
      .jpeg({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(path.join(destDir, task.destName), finalBuf);
    fs.writeFileSync(path.join(brainArtifactDir, task.destName), finalBuf);
    fs.writeFileSync(path.join(brainDir, task.destName), finalBuf);
    console.log(`Saved ${task.destName} (${finalBuf.length} bytes) to public and artifacts`);
  }

  console.log('All gallery images updated successfully!');
}

updateInfinityGallery().catch(console.error);
