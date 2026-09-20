const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildJcKe55Images() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-55';
  const refPng = path.join(brainDir, '.user_uploaded/media_1789919917615.png');

  console.log('Step 1: Segmenting JC-KE-55 earrings with alpha channel...');
  
  // Left Earring Crop: extract around leaves, pearl, and accent cz (x: 105, y: 320, w: 160, h: 190)
  const leftRaw = await sharp(refPng)
    .extract({ left: 105, top: 320, width: 160, height: 190 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const leftBuf = Buffer.alloc(leftRaw.info.width * leftRaw.info.height * 4);
  for (let y = 0; y < leftRaw.info.height; y++) {
    for (let x = 0; x < leftRaw.info.width; x++) {
      const idx = (y * leftRaw.info.width + x) * leftRaw.info.channels;
      const r = leftRaw.data[idx];
      const g = leftRaw.data[idx + 1];
      const b = leftRaw.data[idx + 2];

      // Geometry:
      // Pearl center ~ (95, 115), radius ~ 30
      // Leaves center ~ (55, 75), rx ~ 48, ry ~ 65
      // Accent CZ ~ (138, 142), radius ~ 14
      const dPearl = Math.sqrt(Math.pow((x - 95) / 32, 2) + Math.pow((y - 115) / 32, 2));
      const dLeaves = Math.sqrt(Math.pow((x - 55) / 50, 2) + Math.pow((y - 75) / 68, 2));
      const dCz = Math.sqrt(Math.pow((x - 138) / 16, 2) + Math.pow((y - 142) / 16, 2));
      const minDist = Math.min(dPearl, dLeaves, dCz);

      // Card background is warm off-white: r > 215, g > 208, b > 200
      const isCardBg = (r > 208 && g > 204 && b > 196) && (Math.abs(r - g) < 20);

      let alpha = 255;
      if (minDist > 1.25) {
        alpha = 0;
      } else if (minDist > 0.98 && isCardBg) {
        const t = (minDist - 0.98) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isCardBg && minDist > 0.88) {
        alpha = Math.max(0, Math.min(255, Math.round((1 - (minDist - 0.88) / 0.2) * 255)));
      }

      if (minDist > 1.05 && alpha > 0) {
        alpha = Math.round(alpha * (1 - (minDist - 1.05) / 0.2));
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

  // Right Earring Crop: extract around leaves, pearl, and accent cz (x: 390, top: 320, width: 160, height: 190)
  const rightRaw = await sharp(refPng)
    .extract({ left: 390, top: 320, width: 160, height: 190 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rightBuf = Buffer.alloc(rightRaw.info.width * rightRaw.info.height * 4);
  for (let y = 0; y < rightRaw.info.height; y++) {
    for (let x = 0; x < rightRaw.info.width; x++) {
      const idx = (y * rightRaw.info.width + x) * rightRaw.info.channels;
      const r = rightRaw.data[idx];
      const g = rightRaw.data[idx + 1];
      const b = rightRaw.data[idx + 2];

      // Geometry for right earring (mirrored branch):
      // Pearl center ~ (65, 125), radius ~ 30
      // Leaves center ~ (105, 85), rx ~ 50, ry ~ 68
      // Accent CZ ~ (22, 150), radius ~ 14
      const dPearl = Math.sqrt(Math.pow((x - 65) / 32, 2) + Math.pow((y - 125) / 32, 2));
      const dLeaves = Math.sqrt(Math.pow((x - 105) / 52, 2) + Math.pow((y - 85) / 70, 2));
      const dCz = Math.sqrt(Math.pow((x - 22) / 16, 2) + Math.pow((y - 150) / 16, 2));
      const minDist = Math.min(dPearl, dLeaves, dCz);

      const isCardBg = (r > 208 && g > 204 && b > 196) && (Math.abs(r - g) < 20);

      let alpha = 255;
      if (minDist > 1.25) {
        alpha = 0;
      } else if (minDist > 0.98 && isCardBg) {
        const t = (minDist - 0.98) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isCardBg && minDist > 0.88) {
        alpha = Math.max(0, Math.min(255, Math.round((1 - (minDist - 0.88) / 0.2) * 255)));
      }

      if (minDist > 1.05 && alpha > 0) {
        alpha = Math.round(alpha * (1 - (minDist - 1.05) / 0.2));
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

  // Step 2: Creating Image 1 - Model wearing the earrings...
  console.log('Step 2: Creating Image 1 - Model wearing JC-KE-55...');
  // Ear climber sits along the curve of the earlobe (width ~110, height ~130)
  const earringForEar = await sharp(leftEarringPng)
    .resize(110, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const earShadow = await sharp({
    create: {
      width: 120,
      height: 140,
      channels: 4,
      background: { r: 55, g: 35, b: 25, alpha: 0.35 }
    }
  })
    .png()
    .blur(6)
    .toBuffer();

  const modelWearingImg = await sharp(path.join(brainDir, 'crisscross_pearl_model_1789917613717.jpg'))
    .composite([
      { input: earShadow, top: 405, left: 380, blend: 'multiply' },
      { input: earringForEar, top: 400, left: 378, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 3: Creating Image 2 - Model hand holding the earrings...
  console.log('Step 3: Creating Image 2 - Model hand holding JC-KE-55...');
  const earringForHand = await sharp(leftEarringPng)
    .resize(165, 195, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const handShadow = await sharp({
    create: {
      width: 175,
      height: 205,
      channels: 4,
      background: { r: 40, g: 25, b: 20, alpha: 0.3 }
    }
  })
    .png()
    .blur(7)
    .toBuffer();

  const modelHandImg = await sharp(path.join(brainDir, 'crisscross_pearl_hand_1789917645705.jpg'))
    .composite([
      { input: handShadow, top: 375, left: 375, blend: 'multiply' },
      { input: earringForHand, top: 370, left: 372, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 4: Creating Image 3 - Both earrings on glowing satin cloth (Hero pair)
  console.log('Step 4: Creating Image 3 - Glowing satin cloth hero pair...');
  const satinBg = await sharp(path.join(brainDir, '.user_uploaded/media_1789919115528.png'))
    .extract({ left: 20, top: 20, width: 610, height: 630 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.06, saturation: 1.18 })
    .blur(0.6)
    .toBuffer();

  const pairLeft = await sharp(leftEarringPng)
    .resize(280, 330, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const pairRight = await sharp(rightEarringPng)
    .resize(280, 330, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const satinShadow = await sharp({
    create: {
      width: 290,
      height: 340,
      channels: 4,
      background: { r: 85, g: 55, b: 30, alpha: 0.42 }
    }
  })
    .png()
    .blur(14)
    .toBuffer();

  const satinPairImg = await sharp(satinBg)
    .composite([
      { input: satinShadow, top: 435, left: 155, blend: 'multiply' },
      { input: pairLeft, top: 420, left: 150, blend: 'over' },
      { input: satinShadow, top: 445, left: 475, blend: 'multiply' },
      { input: pairRight, top: 430, left: 470, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 5: Creating Image 4 - Macro detail on glowing satin cloth
  console.log('Step 5: Creating Image 4 - Macro detail on glowing satin cloth...');
  const macroEarring = await sharp(leftEarringPng)
    .resize(480, 570, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 1.1, m1: 1.4, m2: 0.6 })
    .toBuffer();

  const macroShadow = await sharp({
    create: {
      width: 500,
      height: 590,
      channels: 4,
      background: { r: 80, g: 50, b: 25, alpha: 0.45 }
    }
  })
    .png()
    .blur(16)
    .toBuffer();

  const macroDetailImg = await sharp(satinBg)
    .composite([
      { input: macroShadow, top: 320, left: 215, blend: 'multiply' },
      { input: macroEarring, top: 305, left: 210, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 6: Creating Image 5 - Clean packaging display shot
  console.log('Step 6: Creating Image 5 - Clean presentation display...');
  const cleanCard = await sharp(refPng)
    .extract({ left: 10, top: 10, width: 635, height: 570 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.03, saturation: 1.08 })
    .sharpen({ sigma: 1.0, m1: 1.2, m2: 0.5 })
    .jpeg({ quality: 92 })
    .toBuffer();

  // Save all 5 images
  console.log('Saving all 5 images to public and brain directories...');
  const files = [
    { name: 'hero-satin-pair.jpg', buf: satinPairImg },
    { name: 'model-worn.jpg', buf: modelWearingImg },
    { name: 'detail-held.jpg', buf: modelHandImg },
    { name: 'macro-satin-detail.jpg', buf: macroDetailImg },
    { name: 'packaging-display.jpg', buf: cleanCard }
  ];

  for (const f of files) {
    fs.writeFileSync(path.join(destDir, f.name), f.buf);
    fs.writeFileSync(path.join(brainDir, f.name), f.buf);
    console.log(`Saved ${f.name} (${f.buf.length} bytes)`);
  }

  console.log('ALL 5 IMAGES FOR JC-KE-55 GENERATED SUCCESSFULLY!');
}

buildJcKe55Images().catch(console.error);
