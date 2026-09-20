const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/infinity-pearl-double';

  // 1. First, cleanly extract and isolate the left earring from the high-res PNG
  const refPng = path.join(brainDir, '.user_uploaded/media_1789919115528.png');
  
  // Crop around left earring (approx 190 to 330 X, 210 to 460 Y)
  const earringCrop = await sharp(refPng)
    .extract({ left: 190, top: 215, width: 135, height: 235 })
    .toBuffer();

  // Create an exact alpha mask for the earring
  // In the crop, the background is peach/champagne silk.
  // We can remove the background with chroma key + feathering
  const { data, info } = await sharp(earringCrop)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const isolated = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Geometry distance from earring centers
      // Top pearl: center ~ (66, 48), radius ~ (24, 24)
      // Middle twist: center ~ (66, 95), radius ~ (22, 22)
      // Bottom pearl & gold: center ~ (66, 155), radius ~ (44, 46)
      const dTop = Math.sqrt(Math.pow((x - 66) / 26, 2) + Math.pow((y - 48) / 26, 2));
      const dMid = Math.sqrt(Math.pow((x - 66) / 22, 2) + Math.pow((y - 95) / 25, 2));
      const dBot = Math.sqrt(Math.pow((x - 66) / 45, 2) + Math.pow((y - 155) / 47, 2));
      const minDist = Math.min(dTop, dMid, dBot);

      // Background peach silk characteristic: (r - b) > 38 && r > 200
      const isPeachBg = (r - b > 34) && (r > 195) && (g > 175);

      let alpha = 255;
      if (minDist > 1.25) {
        alpha = 0;
      } else if (minDist > 0.95 && isPeachBg) {
        const t = (minDist - 0.95) / 0.3;
        alpha = Math.max(0, Math.min(255, Math.round((1 - t) * 255)));
      } else if (isPeachBg && minDist > 0.85) {
        alpha = Math.max(0, Math.min(255, Math.round((1 - (minDist - 0.85) / 0.2) * 255)));
      }

      // Smooth outer edge antialiasing
      if (minDist > 1.05 && alpha > 0) {
        alpha = Math.round(alpha * (1 - (minDist - 1.05) / 0.2));
      }

      isolated[idx] = r;
      isolated[idx + 1] = g;
      isolated[idx + 2] = b;
      isolated[idx + 3] = Math.max(0, Math.min(255, alpha));
    }
  }

  const isolatedPng = await sharp(isolated, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(brainDir, 'scratch/clean_isolated_earring.png'), isolatedPng);
  console.log('Clean isolated earring saved!');

  // Now let's test compositing on Model and Hand!
}

main().catch(console.error);
