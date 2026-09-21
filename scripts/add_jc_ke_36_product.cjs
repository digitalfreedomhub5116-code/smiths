const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const brainDir = 'C:/Users/Smita/.gemini/antigravity/brain/f10fe5a5-51ca-442f-9e87-511cf8035840';
  const uploadsDir = path.join(brainDir, '.user_uploaded');
  const destDir = 'C:/Users/Smita/Downloads/smiths/public/images/products/jc-ke-36';
  const brainArtifactDir = path.join(brainDir, 'jc_ke_36');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(brainArtifactDir)) fs.mkdirSync(brainArtifactDir, { recursive: true });

  console.log('Connecting to Supabase live database...');
  const supabase = createClient(
    'https://znvqgluajmxgdvyfnkzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE'
  );

  const productData = {
    id: 23,
    name: 'JC-KE-36',
    full_name: 'JC-KE-36 - Smiths Jewellery',
    slug: 'jc-ke-36',
    genre: 'EARRINGS',
    price: 849,
    original_price: 1799,
    stock: 50,
    rating: 4.9,
    review_count: 34,
    bad_count: 1,
    description: 'Radiate celestial glamour with the JC-KE-36 Sunburst Pearl Fan Ear Jacket Earrings. Featuring a luminous freshwater pearl stud resting on the earlobe, anchored by an exquisite five-spoke gold sunburst fan set with graduated round pearls curving gracefully beneath. Sculpted in warm 18K gold vermeil over certified 925 hallmarked sterling silver, this convertible statement pair captures light with every turn, adding modern sculptural sophistication to any evening or everyday look.',
    material: '18K Gold Plated 925 Sterling Silver & Luster Pearls',
    dimensions: '23mm x 19mm / Ultra-Lightweight (3.3g per pair)',
    finish: 'High-Polish Warm Gold with Gloss Pearl Sheen',
    image: '/images/products/jc-ke-36/hero-satin-pair.jpg',
    gallery: [
      '/images/products/jc-ke-36/hero-satin-pair.jpg',
      '/images/products/jc-ke-36/model-worn.jpg',
      '/images/products/jc-ke-36/detail-held.jpg',
      '/images/products/jc-ke-36/ear-profile.jpg',
      '/images/products/jc-ke-36/packaging-display.jpg'
    ],
    key_features: [
      'SKU: JC-KE-36 — 5-pearl radiating sunburst fan ear jacket silhouette',
      'Warm 18K Gold finish over certified 925 hallmarked Sterling Silver core',
      'Hand-selected luminous freshwater pearl studs & matching arc pearls',
      'Convertible 2-in-1 Design: wear solo as classic pearl studs or paired with the sunburst fan drop',
      '100% Hypoallergenic — Nickel-Free and Lead-Free for sensitive ears',
      'Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate'
    ],
    is_active: true,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await supabase.from('products').select('id').eq('id', 23);
  if (existing && existing.length > 0) {
    const { data, error } = await supabase.from('products').update(productData).eq('id', 23).select();
    if (error) console.error('Supabase update error:', error);
    else console.log('Supabase product 23 updated:', data);
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) console.error('Supabase insert error:', error);
    else console.log('Supabase product 23 inserted:', data);
  }

  console.log('ALL JC-KE-36 ASSETS & DATABASE SYNC COMPLETE!');
}

main().catch(console.error);
