const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildJcKe63Images() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-63';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_63');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const refPng = path.join(brainDir, '.user_uploaded/media_1789920327397.png');

  console.log('Step 1: Segmenting JC-KE-63 halo wreath earrings with alpha channel...');

  const imgRaw = await sharp(refPng).raw().toBuffer({ resolveWithObject: true });
  const w = imgRaw.info.width, h = imgRaw.info.height;

  function renderEarring(cx, cy) {
    const size = 200;
    const half = size / 2;
    const startX = Math.round(cx - half);
    const startY = Math.round(cy - half);
    const buf = Buffer.alloc(size * size * 4);

    const pearlAngles = [270, 342, 54, 126, 198];
    const crystalAngles = [234, 306, 18, 90, 162];
    const allAngles = [...pearlAngles, ...crystalAngles];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = startX + x;
        const srcY = startY + y;
        const srcIdx = (srcY * w + srcX) * imgRaw.info.channels;
        const r = imgRaw.data[srcIdx];
        const g = imgRaw.data[srcIdx + 1];
        const b = imgRaw.data[srcIdx + 2];

        const dx = srcX - cx;
        const dy = srcY - cy;
        const dist = Math.hypot(dx, dy);

        let minPearlDist = 999;
        for (const a of pearlAngles) {
          const rad = a * Math.PI / 180;
          const d = Math.hypot(dx - 56 * Math.cos(rad), dy - 56 * Math.sin(rad));
          if (d < minPearlDist) minPearlDist = d;
        }

        let minCrystalDist = 999;
        for (const a of crystalAngles) {
          const rad = a * Math.PI / 180;
          const d = Math.hypot(dx - 62 * Math.cos(rad), dy - 62 * Math.sin(rad));
          if (d < minCrystalDist) minCrystalDist = d;
        }

        const curAngleDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        let minSpokeDist = 999;
        for (const sa of allAngles) {
          let diff = Math.abs(curAngleDeg - sa);
          if (diff > 180) diff = 360 - diff;
          const arc = dist * (diff * Math.PI / 180);
          if (arc < minSpokeDist) minSpokeDist = arc;
        }

        const aPearl = minPearlDist <= 23.5 ? 1.0 : Math.max(0, 1.0 - (minPearlDist - 23.5) / 1.5);
        const aCrystal = minCrystalDist <= 18.0 ? 1.0 : Math.max(0, 1.0 - (minCrystalDist - 18.0) / 1.5);
        
        let aRing = 0;
        if (dist >= 33.5 && dist <= 42.5) aRing = 1.0;
        else if (dist >= 32.0 && dist < 33.5) aRing = (dist - 32.0) / 1.5;
        else if (dist > 42.5 && dist <= 44.0) aRing = (44.0 - dist) / 1.5;

        let aSpoke = 0;
        if (dist > 42.0 && dist <= 58.0) {
          aSpoke = minSpokeDist <= 7.5 ? 1.0 : Math.max(0, 1.0 - (minSpokeDist - 7.5) / 1.5);
        }

        let alpha = Math.max(aPearl, aCrystal, aRing, aSpoke);

        // Center hole cutout
        if (dist < 32.0) {
          alpha = 0;
        } else if (dist < 33.5) {
          alpha *= ((dist - 32.0) / 1.5);
        }

        // Shadow detection
        const diffRB = r - b;
        const isShadow = (dy > 42 && r < 178 && diffRB < 65 && minPearlDist > 16.0 && minCrystalDist > 14.0);
        if (isShadow) alpha = 0;
        if (dy > 73.0) alpha = 0;

        const outIdx = (y * size + x) * 4;
        buf[outIdx] = r;
        buf[outIdx + 1] = g;
        buf[outIdx + 2] = b;
        buf[outIdx + 3] = Math.round(Math.min(255, Math.max(0, alpha * 255)));
      }
    }
    return sharp(buf, { raw: { width: size, height: size, channels: 4 } }).png().toBuffer();
  }

  const leftEarringPng = await renderEarring(205.5, 317.5);
  // Mirror left for an identical balanced right earring
  const rightEarringPng = await sharp(leftEarringPng).flop().png().toBuffer();

  console.log('Earrings segmented successfully!');

  // Step 2: Model wearing JC-KE-63
  console.log('Step 2: Creating Image 1 - Model wearing JC-KE-63 on earlobe...');
  const earringForEar = await sharp(leftEarringPng)
    .resize(115, 115, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const earShadow = await sharp({
    create: {
      width: 125,
      height: 125,
      channels: 4,
      background: { r: 50, g: 30, b: 20, alpha: 0.38 }
    }
  })
    .png()
    .blur(7)
    .toBuffer();

  const modelWearingImg = await sharp(path.join(brainDir, 'crisscross_pearl_model_1789917613717.jpg'))
    .composite([
      { input: earShadow, top: 415, left: 375, blend: 'multiply' },
      { input: earringForEar, top: 410, left: 372, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 3: Model hand holding JC-KE-63
  console.log('Step 3: Creating Image 2 - Model hand holding JC-KE-63...');
  const earringForHand = await sharp(leftEarringPng)
    .resize(175, 175, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const handShadow = await sharp({
    create: {
      width: 185,
      height: 185,
      channels: 4,
      background: { r: 40, g: 25, b: 20, alpha: 0.32 }
    }
  })
    .png()
    .blur(8)
    .toBuffer();

  const modelHandImg = await sharp(path.join(brainDir, 'crisscross_pearl_hand_1789917645705.jpg'))
    .composite([
      { input: handShadow, top: 380, left: 372, blend: 'multiply' },
      { input: earringForHand, top: 375, left: 368, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 4: Hero pair on draped glowing satin cloth
  console.log('Step 4: Creating Image 3 - Both earrings on glowing satin cloth (Hero pair)...');
  const satinBg = await sharp(path.join(brainDir, '.user_uploaded/media_1789919115528.png'))
    .extract({ left: 20, top: 20, width: 610, height: 630 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.06, saturation: 1.18 })
    .blur(0.6)
    .toBuffer();

  const pairLeft = await sharp(leftEarringPng)
    .resize(290, 290, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const pairRight = await sharp(rightEarringPng)
    .resize(290, 290, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const satinShadow = await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 4,
      background: { r: 85, g: 55, b: 30, alpha: 0.42 }
    }
  })
    .png()
    .blur(14)
    .toBuffer();

  const satinPairImg = await sharp(satinBg)
    .composite([
      { input: satinShadow, top: 450, left: 145, blend: 'multiply' },
      { input: pairLeft, top: 435, left: 140, blend: 'over' },
      { input: satinShadow, top: 460, left: 475, blend: 'multiply' },
      { input: pairRight, top: 445, left: 470, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 5: Macro detail on glowing satin cloth
  console.log('Step 5: Creating Image 4 - Macro detail on glowing satin cloth...');
  const macroEarring = await sharp(leftEarringPng)
    .resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 1.1, m1: 1.4, m2: 0.6 })
    .toBuffer();

  const macroShadow = await sharp({
    create: {
      width: 540,
      height: 540,
      channels: 4,
      background: { r: 80, g: 50, b: 25, alpha: 0.45 }
    }
  })
    .png()
    .blur(16)
    .toBuffer();

  const macroDetailImg = await sharp(satinBg)
    .composite([
      { input: macroShadow, top: 345, left: 195, blend: 'multiply' },
      { input: macroEarring, top: 330, left: 190, blend: 'over' }
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  // Step 6: Presentation display shot cropped above the banner
  console.log('Step 6: Creating Image 5 - Presentation display shot...');
  const cleanDisplay = await sharp(refPng)
    .extract({ left: 10, top: 10, width: 630, height: 630 })
    .resize(900, 1200, { fit: 'cover' })
    .modulate({ brightness: 1.04, saturation: 1.08 })
    .sharpen({ sigma: 1.0, m1: 1.2, m2: 0.5 })
    .jpeg({ quality: 92 })
    .toBuffer();

  console.log('Saving all 5 images to public and brain directories...');
  const files = [
    { name: 'hero-satin-pair.jpg', buf: satinPairImg },
    { name: 'model-worn.jpg', buf: modelWearingImg },
    { name: 'detail-held.jpg', buf: modelHandImg },
    { name: 'macro-satin-detail.jpg', buf: macroDetailImg },
    { name: 'packaging-display.jpg', buf: cleanDisplay }
  ];

  for (const f of files) {
    fs.writeFileSync(path.join(destDir, f.name), f.buf);
    fs.writeFileSync(path.join(brainArtifactDir, f.name), f.buf);
    fs.writeFileSync(path.join(brainDir, f.name), f.buf);
    console.log(`Saved ${f.name} (${f.buf.length} bytes)`);
  }

  console.log('ALL 5 IMAGES FOR JC-KE-63 GENERATED SUCCESSFULLY!');
}

buildJcKe63Images().catch(console.error);
