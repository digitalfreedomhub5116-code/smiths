const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const { from, to } of replacements) {
    if (typeof from === 'string') {
      content = content.split(from).join(to);
    } else if (from instanceof RegExp) {
      content = content.replace(from, to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  } else {
    console.log(`  No changes in: ${filePath}`);
  }
}

console.log('=== Step 1: Updating CheckoutPage.jsx ===');
replaceInFile('src/pages/CheckoutPage.jsx', [
  { from: "name: 'SMITHS JEWELLERY'", to: "name: 'SMITS JEWELLERY'" },
  { from: 'Smiths Silver Jewellery', to: 'Smits Silver Jewellery' },
  { from: "order_source: 'smithsjewellery.in'", to: "order_source: 'smitsjewellery.in'" },
  { from: '© 2026 Smiths Jewellery.', to: '© 2026 Smits Jewellery.' },
  { from: "'Create Smiths Account'", to: "'Create Smits Account'" },
  { from: "'Sign in to Smiths Jewellery'", to: "'Sign in to Smits Jewellery'" },
  { from: '>SMITHS</span>', to: '>SMITS</span>' },
  { from: 'SMITHS\r\n', to: 'SMITS\r\n' },
  { from: 'SMITHS\n', to: 'SMITS\n' },
  { from: "sessionStorage.getItem('smiths_buy_now_item')", to: "(sessionStorage.getItem('smits_buy_now_item') || sessionStorage.getItem('smiths_buy_now_item'))" },
  { from: "sessionStorage.setItem('smiths_buy_now_item'", to: "sessionStorage.setItem('smits_buy_now_item'" },
  { from: "sessionStorage.removeItem('smiths_buy_now_item')", to: "sessionStorage.removeItem('smits_buy_now_item'); try { sessionStorage.removeItem('smiths_buy_now_item') } catch (e) {}" },
  { from: "sessionStorage.getItem('smiths_checkout_step')", to: "(sessionStorage.getItem('smits_checkout_step') || sessionStorage.getItem('smiths_checkout_step'))" },
  { from: "sessionStorage.setItem('smiths_checkout_step'", to: "sessionStorage.setItem('smits_checkout_step'" },
  { from: "sessionStorage.removeItem('smiths_checkout_step')", to: "sessionStorage.removeItem('smits_checkout_step'); try { sessionStorage.removeItem('smiths_checkout_step') } catch (e) {}" },
  { from: "sessionStorage.getItem('smiths_selected_address_id')", to: "(sessionStorage.getItem('smits_selected_address_id') || sessionStorage.getItem('smiths_selected_address_id'))" },
  { from: "sessionStorage.setItem('smiths_selected_address_id'", to: "sessionStorage.setItem('smits_selected_address_id'" },
  { from: "sessionStorage.removeItem('smiths_selected_address_id')", to: "sessionStorage.removeItem('smits_selected_address_id'); try { sessionStorage.removeItem('smiths_selected_address_id') } catch (e) {}" },
  { from: "sessionStorage.getItem('smiths_payment_method')", to: "(sessionStorage.getItem('smits_payment_method') || sessionStorage.getItem('smiths_payment_method'))" },
  { from: "sessionStorage.setItem('smiths_payment_method'", to: "sessionStorage.setItem('smits_payment_method'" },
  { from: "'smiths_restart_checkout'", to: "'smits_restart_checkout'" },
]);

console.log('=== Step 2: Updating AdminPanelPage.jsx ===');
replaceInFile('src/pages/AdminPanelPage.jsx', [
  { from: "const MASTER_ADMIN_PASSWORD = 'smiths@5116'", to: "const MASTER_ADMIN_PASSWORD = 'smits@5116'" },
  { from: "const AUTH_KEY_DEVICE = 'smiths_admin_device_authenticated'", to: "const AUTH_KEY_DEVICE = 'smits_admin_device_authenticated'" },
  { from: "const AUTH_KEY_SESSION = 'smiths_admin_session_authenticated'", to: "const AUTH_KEY_SESSION = 'smits_admin_session_authenticated'" },
  { from: "storeName: 'Smiths Jewellery'", to: "storeName: 'Smits Jewellery'" },
  { from: "'support@smithsjewellery.com'", to: "'support@smitsjewellery.com'" },
  { from: "'orders@smithsjewellery.com'", to: "'orders@smitsjewellery.com'" },
  { from: 'Cancelled by seller in Smiths Jewellery Admin Portal', to: 'Cancelled by seller in Smits Jewellery Admin Portal' },
  { from: '© 2026 Smiths Jewellery', to: '© 2026 Smits Jewellery' },
  { from: 'Smiths Jewellery Enterprise Dashboard', to: 'Smits Jewellery Enterprise Dashboard' },
  { from: 'https://smithsjewellery.in', to: 'https://smitsjewellery.in' },
  { from: '>SMITHS</span>', to: '>SMITS</span>' },
  { from: 'SMITHS\r\n', to: 'SMITS\r\n' },
  { from: 'SMITHS\n', to: 'SMITS\n' },
  // Password check: allow both smits@5116 and smiths@5116 for seamless login
  { from: "enteredPassword === MASTER_ADMIN_PASSWORD", to: "(enteredPassword === MASTER_ADMIN_PASSWORD || enteredPassword === 'smiths@5116')" },
  // Local storage check for device auth: check both
  { from: "localStorage.getItem(AUTH_KEY_DEVICE)", to: "(localStorage.getItem(AUTH_KEY_DEVICE) || localStorage.getItem('smiths_admin_device_authenticated'))" },
  { from: "sessionStorage.getItem(AUTH_KEY_SESSION)", to: "(sessionStorage.getItem(AUTH_KEY_SESSION) || sessionStorage.getItem('smiths_admin_session_authenticated'))" },
]);

console.log('=== Step 3: Updating src/lib/analytics.js & imageOptimizer.js ===');
replaceInFile('src/lib/analytics.js', [
  { from: 'Smiths Jewellery Analytics', to: 'Smits Jewellery Analytics' },
  { from: 'Smiths Jewellery Admin Panel', to: 'Smits Jewellery Admin Panel' },
]);
replaceInFile('src/lib/imageOptimizer.js', [
  { from: 'Smiths Jewellery', to: 'Smits Jewellery' },
]);

console.log('=== Step 4: Updating src/lib/db.js ===');
replaceInFile('src/lib/db.js', [
  { from: "const LOCAL_STORAGE_ORDERS_KEY = 'smiths_jewellery_orders'", to: "const LOCAL_STORAGE_ORDERS_KEY = 'smits_jewellery_orders'" },
  { from: "const LOCAL_STORAGE_USER_KEY = 'smiths_jewellery_user'", to: "const LOCAL_STORAGE_USER_KEY = 'smits_jewellery_user'" },
  { from: "const LOCAL_STORAGE_ADDRESSES_KEY = 'smiths_jewellery_addresses'", to: "const LOCAL_STORAGE_ADDRESSES_KEY = 'smits_jewellery_addresses'" },
  { from: "const LOCAL_STORAGE_PRODUCTS_KEY = 'smiths_jewellery_products_v2'", to: "const LOCAL_STORAGE_PRODUCTS_KEY = 'smits_jewellery_products_v2'" },
  { from: "const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smiths_deleted_product_ids'", to: "const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smits_deleted_product_ids'" },
  { from: "const LOCAL_STORAGE_CART_KEY = 'smiths_jewellery_cart'", to: "const LOCAL_STORAGE_CART_KEY = 'smits_jewellery_cart'" },
  { from: "const LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY = 'smiths_admin_notification_settings'", to: "const LOCAL_STORAGE_NOTIFICATION_SETTINGS_KEY = 'smits_admin_notification_settings'" },
  { from: "Smiths Jewellery", to: "Smits Jewellery" },
  { from: "Smiths Online Store", to: "Smits Online Store" },
  { from: "Smiths Studio, Bengaluru", to: "Smits Studio, Bengaluru" },
  { from: "Smiths Fulfillment Hub, Bengaluru", to: "Smits Fulfillment Hub, Bengaluru" },
  { from: "https://smithsjewellery.com", to: "https://smitsjewellery.com" },
  { from: "https://smithsjewellery.in", to: "https://smitsjewellery.in" },
]);

console.log('=== Step 5: Updating src/store/cartStore.js ===');
replaceInFile('src/store/cartStore.js', [
  { from: "const LOCAL_STORAGE_PRODUCTS_KEY = 'smiths_jewellery_products_v2'", to: "const LOCAL_STORAGE_PRODUCTS_KEY = 'smits_jewellery_products_v2'" },
  { from: "const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smiths_deleted_product_ids'", to: "const LOCAL_STORAGE_DELETED_PRODUCTS_KEY = 'smits_deleted_product_ids'" },
  { from: "Smiths Jewellery", to: "Smits Jewellery" },
  { from: "Signature Smiths midnight velvet", to: "Signature Smits midnight velvet" },
]);

console.log('=== Step 6: Updating src/data/productsData.js ===');
replaceInFile('src/data/productsData.js', [
  { from: "custom Smiths engraved box lock", to: "custom Smits engraved box lock" },
  { from: "signature Smiths velvet presentation box", to: "signature Smits velvet presentation box" },
  { from: "Smiths Jewellery", to: "Smits Jewellery" },
  { from: "Arrives in Smiths Signature Velvet Presentation Box with Authenticity Certificate", to: "Arrives in Smits Signature Velvet Presentation Box with Authenticity Certificate" },
  { from: "Arrives in Smiths Signature Gift Packaging", to: "Arrives in Smits Signature Gift Packaging" },
]);

console.log('=== Step 7: Updating api/generate-awb.js & api/shiprocket-webhook.js ===');
replaceInFile('api/generate-awb.js', [
  { from: 'https://smithsjewellery.in', to: 'https://smitsjewellery.in' },
  { from: 'orders@smithsjewellery.com', to: 'orders@smitsjewellery.com' },
  { from: 'Smiths Silver Jewellery Piece', to: 'Smits Silver Jewellery Piece' },
  { from: 'Smiths 925 Sterling Silver Jewellery Piece', to: 'Smits 925 Sterling Silver Jewellery Piece' },
  { from: 'Smiths Jewellery - Luxury Silver Jewellery, Handle with Care', to: 'Smits Jewellery - Luxury Silver Jewellery, Handle with Care' },
  { from: 'Smiths Jewellery Fulfillment Hub, Mumbai', to: 'Smits Jewellery Fulfillment Hub, Mumbai' },
]);
replaceInFile('api/shiprocket-webhook.js', [
  { from: 'Smiths Jewellery Shiprocket Webhook Listener', to: 'Smits Jewellery Shiprocket Webhook Listener' },
]);

console.log('=== Step 8: Updating SQL files ===');
replaceInFile('supabase/setup_database.sql', [
  { from: 'Smiths Jewellery', to: 'Smits Jewellery' },
  { from: 'Smiths Signature', to: 'Smits Signature' },
  { from: 'signature Smiths', to: 'signature Smits' },
  { from: 'custom Smiths', to: 'custom Smits' },
]);
replaceInFile('supabase/migrations/20260918_smiths_jewellery_init.sql', [
  { from: 'Smiths Jewellery', to: 'Smits Jewellery' },
  { from: 'Smiths Signature', to: 'Smits Signature' },
  { from: 'signature Smiths', to: 'signature Smits' },
  { from: 'custom Smiths', to: 'custom Smits' },
]);

console.log('=== Step 9: Updating scripts/ product scripts ===');
const scriptsDir = path.join(__dirname);
const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.cjs') || f.endsWith('.js'));
for (const sf of scriptFiles) {
  if (sf === 'replace_smiths_brand.cjs') continue;
  replaceInFile(path.join(scriptsDir, sf), [
    { from: 'Smiths Jewellery', to: 'Smits Jewellery' },
    { from: 'Smiths Signature', to: 'Smits Signature' },
  ]);
}

console.log('🎉 Codebase substitution completed!');
