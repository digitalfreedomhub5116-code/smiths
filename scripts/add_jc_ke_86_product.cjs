const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const testDir = path.join(brainDir, 'jc_ke_86_test');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-86';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_86');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  const mapping = [
    { src: 'img3.jpg', dest: 'hero-satin-pair.jpg' },
    { src: 'img1.jpg', dest: 'model-worn.jpg' },
    { src: 'img2.jpg', dest: 'detail-held.jpg' },
    { src: 'macro-detail.jpg', dest: 'macro-detail.jpg' },
    { src: 'ear-profile.jpg', dest: 'ear-profile.jpg' }
  ];

  for (const item of mapping) {
    const srcPath = path.join(testDir, item.src);
    const destPath = path.join(destDir, item.dest);
    const brainPath = path.join(brainArtifactDir, item.dest);

    fs.copyFileSync(srcPath, destPath);
    fs.copyFileSync(srcPath, brainPath);
    console.log(`Copied ${item.src} -> ${item.dest} (${fs.statSync(destPath).size} bytes)`);
  }

  console.log('Connecting to Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 22,
    name: 'JC-KE-86',
    full_name: 'JC-KE-86 - Smiths Jewellery',
    slug: 'jc-ke-86',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 35,
    bad_count: 1,
    description: 'Make a bold sculptural statement with the JC-KE-86 Croissant Ribbed Silver C-Hoop Earrings. Precision cast from certified 925 hallmarked sterling silver and finished with mirror-polished triple rhodium plating for enduring tarnish resistance. Featuring a three-tier fluted dome silhouette that catches light dynamically from every angle, these chunky lightweight hoops offer secure comfort-fit stud post closures for effortless day-to-night luxury.',
    material: '925 Sterling Silver, Triple Rhodium Plating',
    dimensions: '24mm x 15mm / Ultra-Lightweight (3.8g per pair)',
    finish: 'High-Luster Mirror Rhodium & Polished Silver',
    image: '/images/products/jc-ke-86/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-86/hero-satin-pair.jpg',
      '/images/products/jc-ke-86/model-worn.jpg',
      '/images/products/jc-ke-86/detail-held.jpg',
      '/images/products/jc-ke-86/macro-detail.jpg',
      '/images/products/jc-ke-86/ear-profile.jpg'
    ],
    key_features: [
      'SKU: JC-KE-86 — Chunky three-tier fluted croissant sculpted C-hoop silhouette',
      'Cast in authentic hallmarked 925 Sterling Silver',
      'Triple Rhodium Plated for enduring tarnish resistance and high-mirror shine',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Secure stud post backings with snug friction clutch',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 22);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 22).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 22 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 22 inserted:', data);
  }

  console.log('ALL JC-KE-86 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
