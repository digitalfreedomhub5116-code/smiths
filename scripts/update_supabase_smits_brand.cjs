const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znvqgluajmxgdvyfnkzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudnFnbHVham14Z2R2eWZua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MDQxMjksImV4cCI6MjEwNTI4MDEyOX0.IqDzvx_MNHanK1lD4xxZO7qcyM7aZi5NfFxjyb-NCDE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Fetching products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  console.log(`Total products in Supabase: ${products.length}`);

  let updatedCount = 0;
  for (const product of products) {
    let changed = false;
    let fullName = product.full_name;
    let description = product.description;
    let keyFeatures = product.key_features;

    // Check full_name
    if (fullName && fullName.includes('Smiths')) {
      fullName = fullName.split('Smiths').join('Smits');
      changed = true;
    }

    // Check description - be careful not to replace silversmith
    if (description && description.includes('Smiths')) {
      fullName = fullName.split('Smiths').join('Smits');
      description = description.split('Smiths').join('Smits');
      changed = true;
    }

    // Check key_features array
    if (Array.isArray(keyFeatures)) {
      const newFeatures = keyFeatures.map(f => {
        if (typeof f === 'string' && f.includes('Smiths')) {
          changed = true;
          return f.split('Smiths').join('Smits');
        }
        return f;
      });
      if (changed) {
        keyFeatures = newFeatures;
      }
    }

    if (changed) {
      const updatePayload = {
        full_name: fullName,
        description: description,
        key_features: keyFeatures,
        updated_at: new Date().toISOString()
      };
      const { error: updateError } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', product.id);

      if (updateError) {
        console.error(`Failed to update product ${product.id} (${product.name}):`, updateError);
      } else {
        updatedCount++;
        console.log(`✓ Product ${product.id} (${product.name}) updated to Smits`);
      }
    }
  }

  console.log(`\nUpdated ${updatedCount} products in Supabase.`);

  // Verify
  const { data: remaining } = await supabase
    .from('products')
    .select('id, name, full_name')
    .ilike('full_name', '%Smiths%');
  console.log(`Remaining products with 'Smiths' in full_name: ${remaining ? remaining.length : 0}`);
}

main().catch(console.error);
