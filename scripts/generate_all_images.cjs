const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildAllImages() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/infinity-pearl-double';
  const refPng = path.join(brainDir, '.user_uploaded/media_1789919115528.png');

  // Step 1: Isolate the left and right earrings with alpha transparency
  console.log('Step 1: Isolating earrings from reference image...');
  
  // Left Earring
  const leftRaw = await sharp(refPng)
    .extract({ left: 190, top: 215, width: 135, height: 235 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const leftBuf = Buffer.alloc(leftRaw.info.width * leftRaw.info.height * 4);
  for (let y = 0; y < leftRaw.info.height; y++) {
    for (let x = 0; x < leftRaw.info.width; x++) {
      const idx = (y * leftRaw.info.width + x) * leftRaw.info.channels;
      const r = leftRaw.data[idx];
      const g = leftRaw.data[idx + 1];
      const b = leftRaw.data[idx + 2];

      const dTop = Math.sqrt(Math.pow((x - 66) / 26, 2) + Math.pow((y - 48) / 26, 2));
      const dMid = Math.sqrt(Math.pow((x - 66) / 22, 2) + Math.pow((y - 95) / 25, 2));
      const dBot = Math.sqrt(Math.pow((x - 66) / 45, 2) + Math.pow((y - 155) / 47, 2));
      const minDist = Math.min(dTop, dMid, dBot);

      const isPeachBg = (r - b > 34) && (r > 195) && (g > 175);
      let alpha = 255;
      if (minDist > 1.22) {
        alpha = 0;
      } else if (minDist > 0.95 && isPeachBg) {
        const t = (minDist - 0.95) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isPeachBg && minDist > 0.85) {
        alpha = Math.max(0, Math.min(255, Math.round((1 - (minDist - 0.85) / 0.2) * 255)));
      }

      if (minDist > 1.05 && alpha > 0) {
        alpha = Math.round(alpha * (1 - (minDist - 1.05) / 0.17));
      }

      const outIdx = (y * leftRaw.info.width + x) * 4;
      leftBuf[outIdx] = r;
      leftBuf[outIdx + 1] = g;
      leftBuf[outIdx + 2] = b;
      leftBuf[outIdx + 3] = Math.max(0, Math.min(255, alpha));
    }
  }

  const leftEarringPng = await sharp(leftBuf, {
    raw: { width: leftRaw.info.width, height: leftRaw.info.height, channels: 4 }
  }).png().toBuffer();

  // Right Earring
  const rightRaw = await sharp(refPng)
    .extract({ left: 350, top: 235, width: 135, height: 235 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rightBuf = Buffer.alloc(rightRaw.info.width * rightRaw.info.height * 4);
  for (let y = 0; y < rightRaw.info.height; y++) {
    for (let x = 0; x < rightRaw.info.width; x++) {
      const idx = (y * rightRaw.info.width + x) * rightRaw.info.channels;
      const r = rightRaw.data[idx];
      const g = rightRaw.data[idx + 1];
      const b = rightRaw.data[idx + 2];

      const dTop = Math.sqrt(Math.pow((x - 66) / 26, 2) + Math.pow((y - 48) / 26, 2));
      const dMid = Math.sqrt(Math.pow((x - 66) / 22, 2) + Math.pow((y - 95) / 25, 2));
      const dBot = Math.sqrt(Math.pow((x - 66) / 45, 2) + Math.pow((y - 155) / 47, 2));
      const minDist = Math.min(dTop, dMid, dBot);

      const isPeachBg = (r - b > 34) && (r > 195) && (g > 175);
      let alpha = 255;
      if (minDist > 1.22) {
        alpha = 0;
      } else if (minDist > 0.95 && isPeachBg) {
        const t = (minDist - 0.95) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isPeachBg && minDist > 0.85) {
        alpha = Math.max(0, Math.min(255, Math.round((1 - (minDist - 0.85) / 0.2) * 255)));
      }

      if (minDist > 1.05 && alpha > 0) {
        alpha = Math.round(alpha * (1 - (minDist - 1.05) / 0.17));
      }

      const outIdx = (y * rightRaw.info.width + x) * 4;
      rightBuf[outIdx] = r;
      rightBuf[outIdx + 1] = g;
      rightBuf[outIdx + 2] = b;
      rightBuf[outIdx + 3] = Math.max(0, Math.min(255, alpha));
    }
  }

  const rightEarringPng = await sharp(rightBuf, {
    raw: { width: rightRaw.info.width, height: rightRaw.info.height, channels: 4 }
  }).png().toBuffer();

  console.log('Step 2: Creating Image 1 - Model wearing the earrings...');
  // Model image: 896x1200
  // Ear position: lobe center is around x: 440, y: 440
  // Scale earring to match earlobe scale (width ~86, height ~150)
  const earringForEar = await sharp(leftEarringPng)
    .resize(88, 153, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create soft drop shadow for earring on skin
  const earShadow = await sharp({
    create: {
      width: 96,
      height: 160,
      channels: 4,
      background: { r: 60, g: 30, b: 20, alpha: 0.35 }
    }
  })
    .png()
    .blur(5)
    .toBuffer();

  const modelWearingImg = await sharp(path.join(brainDir, 'crisscross_pearl_model_1789917613717.jpg'))
    .composite([
      {
        input: earShadow,
        top: 395,
        left: 395,
        blend: 'multiply'
      },
      {
        input: earringForEar,
        top: 390,
        left: 392,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 3: Creating Image 2 - Model hand holding the earrings...
  console.log('Step 3: Creating Image 2 - Model hand holding the earrings...');
  // In hand image (896x1200):
  // Fingers are holding at x: 420-530, y: 350-520
  // Earring scale between fingers: width ~140, height ~244
  const earringForHand = await sharp(leftEarringPng)
    .resize(145, 252, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const handShadow = await sharp({
    create: {
      width: 155,
      height: 260,
      channels: 4,
      background: { r: 40, g: 25, b: 20, alpha: 0.3 }
    }
  })
    .png()
    .blur(7)
    .toBuffer();

  const modelHandImg = await sharp(path.join(brainDir, 'crisscross_pearl_hand_1789917645705.jpg'))
    .composite([
      {
        input: handShadow,
        top: 355,
        left: 385,
        blend: 'multiply'
      },
      {
        input: earringForHand,
        top: 350,
        left: 382,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 4: Creating Image 3 - Both earrings on glowing champagne satin cloth (Hero pair)
  console.log('Step 4: Creating Image 3 - Glowing satin cloth hero pair...');
  // Generate a clean 3:4 (900x1200) glowing champagne silk backdrop
  // From reference image, extract rich textured satin cloth area and upscale with subtle illumination
  const satinBg = await sharp(refPng)
    .extract({ left: 20, top: 20, width: 610, height: 630 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.05, saturation: 1.15 })
    .blur(0.8) // soft silky glow
    .toBuffer();

  const pairLeft = await sharp(leftEarringPng)
    .resize(250, 435, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const pairRight = await sharp(rightEarringPng)
    .resize(250, 435, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const satinShadow = await sharp({
    create: {
      width: 260,
      height: 445,
      channels: 4,
      background: { r: 90, g: 60, b: 35, alpha: 0.4 }
    }
  })
    .png()
    .blur(12)
    .toBuffer();

  const satinPairImg = await sharp(satinBg)
    .composite([
      // Left earring shadow & earring
      { input: satinShadow, top: 385, left: 165, blend: 'multiply' },
      { input: pairLeft, top: 370, left: 160, blend: 'over' },
      // Right earring shadow & earring
      { input: satinShadow, top: 405, left: 475, blend: 'multiply' },
      { input: pairRight, top: 390, left: 470, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 5: Creating Image 4 - Macro detail on glowing satin cloth
  console.log('Step 5: Creating Image 4 - Macro detail on glowing satin cloth...');
  const macroEarring = await sharp(leftEarringPng)
    .resize(420, 730, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
    .toBuffer();

  const macroShadow = await sharp({
    create: {
      width: 440,
      height: 750,
      channels: 4,
      background: { r: 85, g: 55, b: 30, alpha: 0.45 }
    }
  })
    .png()
    .blur(16)
    .toBuffer();

  const macroDetailImg = await sharp(satinBg)
    .composite([
      { input: macroShadow, top: 245, left: 245, blend: 'multiply' },
      { input: macroEarring, top: 230, left: 240, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 6: Creating Image 5 - Angled studio flatlay on draped satin
  console.log('Step 6: Creating Image 5 - Angled studio flatlay on draped satin...');
  // Reference photo original view carefully framed with enhanced glow & contrast
  const lifestyleSilkImg = await sharp(refPng)
    .extract({ left: 75, top: 45, width: 500, height: 600 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.04, saturation: 1.12 })
    .sharpen({ sigma: 1.0, m1: 1.3, m2: 0.5 })
    .jpeg({ quality: 92 })
    .toBuffer();

  // Save all 5 images to public/images/products/infinity-pearl-double/ and brain dir
  console.log('Saving all 5 images to public and brain directories...');
  const files = [
    { name: 'model-worn.jpg', buf: modelWearingImg },
    { name: 'detail-held.jpg', buf: modelHandImg },
    { name: 'hero-satin-pair.jpg', buf: satinPairImg },
    { name: 'macro-satin-detail.jpg', buf: macroDetailImg },
    { name: 'lifestyle-satin-glow.jpg', buf: lifestyleSilkImg }
  ];

  for (const f of files) {
    fs.writeFileSync(path.join(destDir, f.name), f.buf);
    fs.writeFileSync(path.join(brainDir, f.name), f.buf);
    console.log(`Saved ${f.name} (${f.buf.length} bytes)`);
  }

  // Also clean up any old unneeded images in destDir
  const oldFiles = ['detail-left.jpg', 'detail-right.jpg', 'hero-pair.jpg', 'lifestyle-silk.jpg', 'macro-twist.jpg'];
  for (const old of oldFiles) {
    const p = path.join(destDir, old);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Deleted obsolete image ${old}`);
    }
  }

  console.log('ALL 5 STUDIO-QUALITY IMAGES GENERATED & DEPLOYED SUCCESSFULLY!');
}

buildAllImages().catch(console.error);
