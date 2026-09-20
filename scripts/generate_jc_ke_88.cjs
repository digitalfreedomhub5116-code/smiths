const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildJcKe88Images() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-88';
  const refPng = path.join(brainDir, '.user_uploaded/media_1789920031904.png');

  console.log('Step 1: Segmenting JC-KE-88 earrings with alpha channel...');
  
  // Left Earring Crop: extract around heart and bow (x: 152, y: 260, w: 142, h: 210)
  const leftRaw = await sharp(refPng)
    .extract({ left: 152, top: 260, width: 142, height: 210 })
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
      // Heart center ~ (71, 38), rx ~ 33, ry ~ 32
      // Link center ~ (71, 86), rx ~ 12, ry ~ 14
      // Bow center ~ (71, 138), rx ~ 58, ry ~ 46
      const dHeart = Math.sqrt(Math.pow((x - 71) / 34, 2) + Math.pow((y - 38) / 33, 2));
      const dLink = Math.sqrt(Math.pow((x - 71) / 14, 2) + Math.pow((y - 86) / 16, 2));
      const dBow = Math.sqrt(Math.pow((x - 71) / 60, 2) + Math.pow((y - 138) / 48, 2));
      const minDist = Math.min(dHeart, dLink, dBow);

      // Card background is neutral white/light-grey: high brightness, low saturation
      // r > 215 && g > 215 && b > 220, and |r - g| < 12 && |r - b| < 15
      const isWhiteCard = (r > 210 && g > 210 && b > 215) && (Math.abs(r - b) < 18);

      let alpha = 255;
      if (minDist > 1.25) {
        alpha = 0;
      } else if (minDist > 0.98 && isWhiteCard) {
        const t = (minDist - 0.98) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isWhiteCard && minDist > 0.88) {
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

  // Right Earring Crop: extract around heart and bow (x: 362, y: 260, w: 142, h: 210)
  const rightRaw = await sharp(refPng)
    .extract({ left: 362, top: 260, width: 142, height: 210 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rightBuf = Buffer.alloc(rightRaw.info.width * rightRaw.info.height * 4);
  for (let y = 0; y < rightRaw.info.height; y++) {
    for (let x = 0; x < rightRaw.info.width; x++) {
      const idx = (y * rightRaw.info.width + x) * rightRaw.info.channels;
      const r = rightRaw.data[idx];
      const g = rightRaw.data[idx + 1];
      const b = rightRaw.data[idx + 2];

      const dHeart = Math.sqrt(Math.pow((x - 71) / 34, 2) + Math.pow((y - 38) / 33, 2));
      const dLink = Math.sqrt(Math.pow((x - 71) / 14, 2) + Math.pow((y - 86) / 16, 2));
      const dBow = Math.sqrt(Math.pow((x - 71) / 60, 2) + Math.pow((y - 138) / 48, 2));
      const minDist = Math.min(dHeart, dLink, dBow);

      const isWhiteCard = (r > 210 && g > 210 && b > 215) && (Math.abs(r - b) < 18);

      let alpha = 255;
      if (minDist > 1.25) {
        alpha = 0;
      } else if (minDist > 0.98 && isWhiteCard) {
        const t = (minDist - 0.98) / 0.27;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isWhiteCard && minDist > 0.88) {
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
  console.log('Step 2: Creating Image 1 - Model wearing JC-KE-88...');
  // Model image: 896x1200
  // Lobe center is around x: 435, y: 435
  const earringForEar = await sharp(leftEarringPng)
    .resize(95, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const earShadow = await sharp({
    create: {
      width: 105,
      height: 150,
      channels: 4,
      background: { r: 50, g: 30, b: 25, alpha: 0.35 }
    }
  })
    .png()
    .blur(6)
    .toBuffer();

  const modelWearingImg = await sharp(path.join(brainDir, 'crisscross_pearl_model_1789917613717.jpg'))
    .composite([
      { input: earShadow, top: 405, left: 390, blend: 'multiply' },
      { input: earringForEar, top: 400, left: 388, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 3: Creating Image 2 - Model hand holding the earrings...
  console.log('Step 3: Creating Image 2 - Model hand holding JC-KE-88...');
  // Hand image: 896x1200
  const earringForHand = await sharp(leftEarringPng)
    .resize(150, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const handShadow = await sharp({
    create: {
      width: 160,
      height: 230,
      channels: 4,
      background: { r: 40, g: 25, b: 20, alpha: 0.3 }
    }
  })
    .png()
    .blur(7)
    .toBuffer();

  const modelHandImg = await sharp(path.join(brainDir, 'crisscross_pearl_hand_1789917645705.jpg'))
    .composite([
      { input: handShadow, top: 360, left: 380, blend: 'multiply' },
      { input: earringForHand, top: 355, left: 378, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 4: Creating Image 3 - Both earrings on glowing satin cloth (Hero pair)
  console.log('Step 4: Creating Image 3 - Glowing satin cloth hero pair...');
  // Background: draped champagne silk from earlier reference (900x1200)
  const satinBg = await sharp(path.join(brainDir, '.user_uploaded/media_1789919115528.png'))
    .extract({ left: 20, top: 20, width: 610, height: 630 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.06, saturation: 1.18 })
    .blur(0.6)
    .toBuffer();

  const pairLeft = await sharp(leftEarringPng)
    .resize(260, 385, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const pairRight = await sharp(rightEarringPng)
    .resize(260, 385, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const satinShadow = await sharp({
    create: {
      width: 270,
      height: 395,
      channels: 4,
      background: { r: 85, g: 55, b: 30, alpha: 0.42 }
    }
  })
    .png()
    .blur(14)
    .toBuffer();

  const satinPairImg = await sharp(satinBg)
    .composite([
      { input: satinShadow, top: 415, left: 160, blend: 'multiply' },
      { input: pairLeft, top: 400, left: 155, blend: 'over' },
      { input: satinShadow, top: 425, left: 485, blend: 'multiply' },
      { input: pairRight, top: 410, left: 480, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 5: Creating Image 4 - Macro detail on glowing satin cloth
  console.log('Step 5: Creating Image 4 - Macro detail on glowing satin cloth...');
  const macroEarring = await sharp(leftEarringPng)
    .resize(440, 650, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 1.1, m1: 1.4, m2: 0.6 })
    .toBuffer();

  const macroShadow = await sharp({
    create: {
      width: 460,
      height: 670,
      channels: 4,
      background: { r: 80, g: 50, b: 25, alpha: 0.45 }
    }
  })
    .png()
    .blur(16)
    .toBuffer();

  const macroDetailImg = await sharp(satinBg)
    .composite([
      { input: macroShadow, top: 290, left: 235, blend: 'multiply' },
      { input: macroEarring, top: 275, left: 230, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 6: Creating Image 5 - Clean packaging display shot
  console.log('Step 6: Creating Image 5 - Clean presentation display...');
  // Extract the card and pair cleanly without the bottom text banner
  const cleanCard = await sharp(refPng)
    .extract({ left: 30, top: 20, width: 590, height: 600 })
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

  console.log('ALL 5 IMAGES FOR JC-KE-88 GENERATED SUCCESSFULLY!');
}

buildJcKe88Images().catch(console.error);
