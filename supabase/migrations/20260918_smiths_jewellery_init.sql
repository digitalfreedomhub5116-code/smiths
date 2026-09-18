-- ==============================================================================
-- SMITHS JEWELLERY — PRODUCTION DATABASE SCHEMA & SEED SCRIPT (PostgreSQL / Supabase)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. PROFILES (Extends Supabase Auth users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. ADDRESSES (Customer Delivery Addresses) ──
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  delivery_instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. CATEGORIES / COLLECTIONS ──
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. PRODUCTS (Solid 925 Sterling Silver Jewellery) ──
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  genre TEXT REFERENCES public.categories(id),
  price NUMERIC(10,2) NOT NULL DEFAULT 1299.00,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 2599.00,
  stock INTEGER DEFAULT 50,
  rating NUMERIC(3,2) DEFAULT 4.9,
  review_count INTEGER DEFAULT 18,
  bad_count INTEGER DEFAULT 0,
  description TEXT,
  material TEXT DEFAULT 'Solid 925 Sterling Silver',
  dimensions TEXT DEFAULT 'Adjustable / Standard Fit',
  finish TEXT DEFAULT 'Brilliant High-Luster Rhodium Finish',
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  key_features TEXT[] DEFAULT '{"Solid 925 Hallmarked Sterling Silver", "High-Luster Rhodium Finish (Tarnish Resistant)", "AAA+ Cubic Zirconia / Freshwater Pearls", "Hypoallergenic, Nickel-Free & Lead-Free", "Includes Midnight Black Velvet Gift Box & Authenticity Certificate"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. PRODUCT VISIBILITY & AVAILABILITY ──
CREATE TABLE IF NOT EXISTS public.product_visibility (
  product_id INTEGER PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  is_hidden BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT true,
  is_trending BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_availability (
  product_id INTEGER PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 50,
  allow_backorder BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 6. PRODUCT REVIEWS ──
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  date TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. ORDERS (Checkout & Live Tracking) ──
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_fee NUMERIC(10,2) DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'Payment Received',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 8. ORDER ITEMS ──
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  image TEXT
);

-- ── 9. SHIPMENTS (Logistics & Courier Tracking) ──
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  courier_partner TEXT DEFAULT 'Delhivery Air (Express)',
  awb_code TEXT,
  tracking_url TEXT,
  status TEXT DEFAULT 'Payment Received',
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 10. TRACKING EVENTS ──
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id SERIAL PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  activity TEXT NOT NULL,
  location TEXT,
  event_time TIMESTAMPTZ DEFAULT now()
);

-- ── 11. WISHLISTS & CART ──
CREATE TABLE IF NOT EXISTS public.wishlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ── 12. ADMIN SETTINGS ──
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 13. ANALYTICS EVENTS ──
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT,
  path TEXT,
  product_id TEXT,
  product_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── ROW LEVEL SECURITY (RLS) POLICIES ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles insert" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles update" ON public.profiles;
  CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
  CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

  DROP POLICY IF EXISTS "Public addresses read" ON public.addresses;
  DROP POLICY IF EXISTS "Public addresses insert" ON public.addresses;
  DROP POLICY IF EXISTS "Public addresses update" ON public.addresses;
  DROP POLICY IF EXISTS "Public addresses delete" ON public.addresses;
  CREATE POLICY "Public addresses read" ON public.addresses FOR SELECT USING (true);
  CREATE POLICY "Public addresses insert" ON public.addresses FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public addresses update" ON public.addresses FOR UPDATE USING (true);
  CREATE POLICY "Public addresses delete" ON public.addresses FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Public categories read" ON public.categories;
  CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Public products read" ON public.products;
  DROP POLICY IF EXISTS "Public products write" ON public.products;
  CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);
  CREATE POLICY "Public products write" ON public.products FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public product visibility read" ON public.product_visibility;
  DROP POLICY IF EXISTS "Public product visibility write" ON public.product_visibility;
  CREATE POLICY "Public product visibility read" ON public.product_visibility FOR SELECT USING (true);
  CREATE POLICY "Public product visibility write" ON public.product_visibility FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public product availability read" ON public.product_availability;
  DROP POLICY IF EXISTS "Public product availability write" ON public.product_availability;
  CREATE POLICY "Public product availability read" ON public.product_availability FOR SELECT USING (true);
  CREATE POLICY "Public product availability write" ON public.product_availability FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public reviews read" ON public.product_reviews;
  DROP POLICY IF EXISTS "Public reviews insert" ON public.product_reviews;
  CREATE POLICY "Public reviews read" ON public.product_reviews FOR SELECT USING (true);
  CREATE POLICY "Public reviews insert" ON public.product_reviews FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Public orders read" ON public.orders;
  DROP POLICY IF EXISTS "Public orders insert" ON public.orders;
  DROP POLICY IF EXISTS "Public orders update" ON public.orders;
  DROP POLICY IF EXISTS "Public orders delete" ON public.orders;
  CREATE POLICY "Public orders read" ON public.orders FOR SELECT USING (true);
  CREATE POLICY "Public orders insert" ON public.orders FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public orders update" ON public.orders FOR UPDATE USING (true);
  CREATE POLICY "Public orders delete" ON public.orders FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Public order items read" ON public.order_items;
  DROP POLICY IF EXISTS "Public order items insert" ON public.order_items;
  DROP POLICY IF EXISTS "Public order items delete" ON public.order_items;
  CREATE POLICY "Public order items read" ON public.order_items FOR SELECT USING (true);
  CREATE POLICY "Public order items insert" ON public.order_items FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public order items delete" ON public.order_items FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Public shipments read" ON public.shipments;
  DROP POLICY IF EXISTS "Public shipments insert" ON public.shipments;
  DROP POLICY IF EXISTS "Public shipments update" ON public.shipments;
  DROP POLICY IF EXISTS "Public shipments delete" ON public.shipments;
  CREATE POLICY "Public shipments read" ON public.shipments FOR SELECT USING (true);
  CREATE POLICY "Public shipments insert" ON public.shipments FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public shipments update" ON public.shipments FOR UPDATE USING (true);
  CREATE POLICY "Public shipments delete" ON public.shipments FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Public tracking events read" ON public.tracking_events;
  DROP POLICY IF EXISTS "Public tracking events insert" ON public.tracking_events;
  DROP POLICY IF EXISTS "Public tracking events delete" ON public.tracking_events;
  CREATE POLICY "Public tracking events read" ON public.tracking_events FOR SELECT USING (true);
  CREATE POLICY "Public tracking events insert" ON public.tracking_events FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public tracking events delete" ON public.tracking_events FOR DELETE USING (true);

  DROP POLICY IF EXISTS "Public wishlists read" ON public.wishlists;
  DROP POLICY IF EXISTS "Public wishlists write" ON public.wishlists;
  CREATE POLICY "Public wishlists read" ON public.wishlists FOR SELECT USING (true);
  CREATE POLICY "Public wishlists write" ON public.wishlists FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public cart items read" ON public.cart_items;
  DROP POLICY IF EXISTS "Public cart items write" ON public.cart_items;
  CREATE POLICY "Public cart items read" ON public.cart_items FOR SELECT USING (true);
  CREATE POLICY "Public cart items write" ON public.cart_items FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public admin settings read" ON public.admin_settings;
  DROP POLICY IF EXISTS "Public admin settings write" ON public.admin_settings;
  CREATE POLICY "Public admin settings read" ON public.admin_settings FOR SELECT USING (true);
  CREATE POLICY "Public admin settings write" ON public.admin_settings FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public analytics events read" ON public.analytics_events;
  DROP POLICY IF EXISTS "Public analytics events insert" ON public.analytics_events;
  CREATE POLICY "Public analytics events read" ON public.analytics_events FOR SELECT USING (true);
  CREATE POLICY "Public analytics events insert" ON public.analytics_events FOR INSERT WITH CHECK (true);
END $$;

-- ── REALTIME PUBLICATION ──
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── SEED CATEGORIES ──
INSERT INTO public.categories (id, name, slug, image_url) VALUES
('NECKLACES', 'Necklaces', 'necklaces', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80'),
('BRACELETS', 'Bracelets', 'bracelets', 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80'),
('EARRINGS', 'Earrings', 'earrings', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80'),
('RINGS', 'Rings', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80'),
('SCARFS', 'Scarfs', 'scarfs', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80'),
('COMBOS', 'Combos', 'combos', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url;

-- ── SEED PRODUCTS ──
INSERT INTO public.products (id, name, full_name, slug, genre, price, original_price, stock, rating, review_count, bad_count, description, material, dimensions, finish, image, gallery, key_features, is_active) VALUES
(1, 'Luxe Solitaire Silver Pendant', 'Luxe Solitaire Silver Pendant - Smiths Jewellery', 'luxe-solitaire-silver-pendant-silver', 'NECKLACES', 1299, 2599, 50, 4.9, 19, 2, 'Command timeless attention with the Luxe Solitaire Silver Pendant. Sculpted in authentic 925 hallmarked sterling silver and crowned with a brilliant round-cut AAA cubic zirconia that dances under every ray of light. Finished in high-luster rhodium for lasting tarnish resistance.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(2, 'Celestial Crescent Moon Choker', 'Celestial Crescent Moon Choker - Smiths Jewellery', 'celestial-crescent-moon-choker-silver', 'NECKLACES', 1499, 2999, 50, 4.8, 15, 1, 'Embrace celestial poetry with the Crescent Moon Choker. Delicately curved polished silver rests gracefully along the collarbone, accented with micro-pave crystals that mimic starry constellations. A dreamlike centerpiece for both everyday charm and evening soirees.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(3, 'Sterling Silver Figaro Chain', 'Sterling Silver Figaro Chain - Smiths Jewellery', 'sterling-silver-figaro-chain-silver', 'NECKLACES', 1099, 2199, 50, 4.7, 11, 2, 'Rooted in classic Italian silversmith heritage, this solid sterling silver Figaro chain blends alternating oval and elongated links with precision beveled edges. Designed for enduring strength, effortless layering, and high-shine sophistication.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(4, 'Gothic Starlight Silver Locket', 'Gothic Starlight Silver Locket - Smiths Jewellery', 'gothic-starlight-silver-locket-silver', 'NECKLACES', 1699, 3399, 50, 4.9, 23, 2, 'Keep your dearest memories close with the Gothic Starlight Silver Locket. Hand-etched starburst engravings on an antique polished silver medallion frame open smoothly with a secure magnetic clasp. Built for heirloom longevity.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&q=80', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(5, 'Radiant Tennis Silver Bracelet', 'Radiant Tennis Silver Bracelet - Smiths Jewellery', 'radiant-tennis-silver-bracelet-silver', 'BRACELETS', 1399, 2799, 50, 4.9, 17, 1, 'The pinnacle of modern glamour. Featuring a seamless infinity line of hand-set AAA diamond-grade cubic zirconia stones set into solid 925 silver prongs with an ultra-secure double-latch safety clasp.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(6, 'Minimalist Polished Silver Cuff', 'Minimalist Polished Silver Cuff - Smiths Jewellery', 'minimalist-polished-silver-cuff-silver', 'BRACELETS', 899, 1799, 50, 4.7, 13, 2, 'Pure architectural symmetry. Forged from cold-rolled solid silver, this open-ended cuff flexes gently to contour your wrist perfectly. High-mirror finish gives it an immaculate liquid chrome glow.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80', 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(7, 'Silver Cuban Link Chain Bracelet', 'Silver Cuban Link Chain Bracelet - Smiths Jewellery', 'silver-cuban-link-chain-bracelet-silver', 'BRACELETS', 1199, 2399, 50, 4.8, 15, 2, 'Bold, weighty, and unapologetically stylish. Interlocking flat-beveled silver links drape comfortably around the wrist, secured with a custom Smiths engraved box lock.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80', 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(8, 'Aurora Crystal Teardrop Earrings', 'Aurora Crystal Teardrop Earrings - Smiths Jewellery', 'aurora-crystal-teardrop-earrings-silver', 'EARRINGS', 999, 1999, 50, 4.8, 21, 1, 'Catching every glance with graceful motion, the Aurora Teardrop Earrings showcase faceted crystal briolettes suspended from slender sterling silver hooks. Feather-light and hypoallergenic.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(9, 'Classic Princess-Cut Solitaire Studs', 'Classic Princess-Cut Solitaire Studs - Smiths Jewellery', 'classic-princess-cut-solitaire-studs-silver', 'EARRINGS', 799, 1599, 50, 4.9, 25, 2, 'The quintessential silver stud. Square princess-cut stones held securely in four-prong 925 silver basket mounts. Features comfortable friction backs that keep them centered all day.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=900&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(10, 'Midnight Silver Huggie Hoops', 'Midnight Silver Huggie Hoops - Smiths Jewellery', 'midnight-silver-huggie-hoops-silver', 'EARRINGS', 849, 1699, 50, 4.7, 14, 2, 'Chic, snug-fitting hoops embedded with a row of shimmering pavé crystals. Engineered with a smooth snap-click closure that will never catch on clothes or hair.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(11, 'Eternal Wave Sterling Silver Band', 'Eternal Wave Sterling Silver Band - Smiths Jewellery', 'eternal-wave-sterling-silver-band-silver', 'RINGS', 749, 1499, 50, 4.8, 16, 1, 'Inspired by the fluid rhythm of ocean waves, this contoured silver ring features alternating polished and brushed silver textures. Ergonomically shaped for seamless 24/7 comfort.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(12, 'Crown Solitaire CZ Silver Ring', 'Crown Solitaire CZ Silver Ring - Smiths Jewellery', 'crown-solitaire-cz-silver-ring-silver', 'RINGS', 999, 1999, 50, 4.9, 22, 2, 'Regal and majestic. A six-prong elevated crown setting elevates a hand-faceted solitaire stone above a pavé encrusted 925 silver band.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=900&q=80', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(13, 'Monogram Silver Silk Satin Scarf', 'Monogram Silver Silk Satin Scarf - Smiths Jewellery', 'monogram-silver-silk-satin-scarf-silver', 'SCARFS', 1199, 2399, 50, 4.9, 13, 1, 'Crafted from 100% pure Mulberry silk with hand-rolled hems, this lustrous scarf features an ethereal silver-toned geometric monogram. Drapes with fluid elegance across the shoulders or neck.', 'Pure Silk / Cashmere Blend', '90cm x 90cm', 'Lustrous Silk Satin', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80', 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=900&q=80'], ARRAY['100% Pure Mulberry Silk / Cashmere blend texture', 'Hand-rolled and stitched edges', 'Breathable, lightweight and rich drape', 'Arrives in Smiths Signature Gift Packaging'], true),
(14, 'Midnight Cashmere Touch Winter Scarf', 'Midnight Cashmere Touch Winter Scarf - Smiths Jewellery', 'midnight-cashmere-touch-winter-scarf-silver', 'SCARFS', 1399, 2799, 50, 4.8, 11, 1, 'Ultra-soft brushed wool and cashmere blend with subtle silver metallic thread weaving throughout the fringe. Wraps you in warmth while delivering refined luxury aesthetics.', 'Pure Silk / Cashmere Blend', '90cm x 90cm', 'Lustrous Silk Satin', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=900&q=80', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80'], ARRAY['100% Pure Mulberry Silk / Cashmere blend texture', 'Hand-rolled and stitched edges', 'Breathable, lightweight and rich drape', 'Arrives in Smiths Signature Gift Packaging'], true),
(15, 'The Royal Silver Ensemble', 'The Royal Silver Ensemble - Smiths Jewellery', 'the-royal-silver-ensemble-silver', 'COMBOS', 1999, 3999, 50, 5, 29, 1, 'The definitive luxury pairing. Combines our bestselling Luxe Solitaire Silver Pendant with matching Princess-Cut Solitaire Studs, nestled inside a signature Smiths velvet presentation box.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true),
(16, 'Signature Luxe Gift Box', 'Signature Luxe Gift Box - Smiths Jewellery', 'signature-luxe-gift-box-silver', 'COMBOS', 2399, 4799, 50, 4.9, 19, 1, 'The ultimate gesture of affection. Uniting the Minimalist Polished Silver Cuff and the Monogram Silver Silk Scarf inside a ribbon-tied velvet gift box complete with an authenticity certificate.', '925 Sterling Silver', 'Adjustable Length / Standard Comfort Fit', 'High-Luster Rhodium & Polished Silver', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80', ARRAY['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80', 'https://images.unsplash.com/photo-1611591475152-478311394c8b?w=900&q=80', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80'], ARRAY['Crafted from certified 925 Sterling Silver', 'Triple Rhodium Plated for enduring tarnish resistance', 'AAA Grade brilliant cubic zirconia stones', '100% Hypoallergenic — Nickel-Free and Lead-Free', 'Includes Velvet Presentation Box & Authenticity Certificate'], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  slug = EXCLUDED.slug,
  genre = EXCLUDED.genre,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  dimensions = EXCLUDED.dimensions,
  finish = EXCLUDED.finish,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  key_features = EXCLUDED.key_features;

SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));

-- ── SEED PRODUCT VISIBILITY & AVAILABILITY ──
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (1, false, true, true) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (1, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (2, false, true, true) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (2, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (3, false, true, true) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (3, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (4, false, true, true) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (4, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (5, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (5, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (6, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (6, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (7, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (7, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (8, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (8, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (9, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (9, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (10, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (10, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (11, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (11, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (12, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (12, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (13, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (13, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (14, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (14, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (15, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (15, true, 50, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_visibility (product_id, is_hidden, is_featured, is_trending) VALUES (16, false, true, false) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.product_availability (product_id, in_stock, stock_quantity, allow_backorder) VALUES (16, true, 50, false) ON CONFLICT (product_id) DO NOTHING;

-- ── SEED REVIEWS ──
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (1, 'Saurabh Tiwari', 3, 'gift bag handle had slight wrinkle inside shipping carton', '2 days ago', true), (1, 'Mayank Mishra', 3, 'chain size is delicate needs gentle handling otherwise shine is top', '3 days ago', true), (1, 'Simran Bansal', 5, 'chain length is perfect and clasp is solid sterling silver', 'Just now', true), (1, 'Aditya Patel', 5, 'proper solid silver feel not that cheap coated metal totally worth the price', '8 days ago', true), (1, 'Sneha Rao', 4, 'looks unreal in person everyone at party was asking where i got it', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (2, 'Mayank Mishra', 3, 'chain size is delicate needs gentle handling otherwise shine is top', '2 days ago', true), (2, 'Aarushi Pandey', 5, 'choker sits so gracefully on the neckline got tons of compliments', 'Just now', true), (2, 'Priyanka Iyer', 5, 'super happy with the purchase looks stunning for daily wear', '6 days ago', true), (2, 'Tanvi Deshmukh', 5, 'next level craftsmanship polish is mirror finish', '8 days ago', true), (2, 'Divya Joshi', 4, 'mast product hai worth every single rupee', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (3, 'Chetan Bhagat', 3, 'outer brown cardboard had small corner press gift box inside was safe', '2 days ago', true), (3, 'Anand Ahuja', 2, 'took nearly 5 days to reach hyderabad delivery speed could be faster', '3 days ago', true), (3, 'Riddhima Saxena', 5, 'layered chain looks high fashion and feels lightweight', 'Just now', true), (3, 'Ishaan Sen', 5, 'fast delivery and solid build quality gifted to my fiance', '8 days ago', true), (3, 'Nandini Kulkarni', 4, 'anti tarnish coating is legit wearing it daily without any discoloration', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (4, 'Anand Ahuja', 2, 'took nearly 5 days to reach hyderabad delivery speed could be faster', '2 days ago', true), (4, 'Pankaj Tripathi', 3, 'wish there was a silver polishing cloth included in standard box', '3 days ago', true), (4, 'Natasha Roy', 5, 'pendant sparkle is so dazzling catches light from every angle', 'Just now', true), (4, 'Shreya Yadav', 5, 'solid weight to it looks very classy and elegant', '8 days ago', true), (4, 'Rohan Reddy', 4, 'clean edges and high polish feels very luxurious in hand', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (5, 'Pankaj Tripathi', 3, 'wish there was a silver polishing cloth included in standard box', '2 days ago', true), (5, 'Avani Kapoor', 5, 'cuban link is bold and shining premium weight on wrist', 'Just now', true), (5, 'Pooja Sharma', 5, 'silver shine is genuinely top tier looks so royal and feels like real 925 sterling silver', '6 days ago', true), (5, 'Rhea Nair', 5, 'rhodium finish is crazy clean sparkles 10x better than pictures', '8 days ago', true), (5, 'Ananya Verma', 4, 'received in 3 days packaging was luxury velvet box sister loved it', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (6, 'Deepak Mehra', 2, 'courier executive took 4 days to deliver in pune', '2 days ago', true), (6, 'Saurabh Tiwari', 3, 'gift bag handle had slight wrinkle inside shipping carton', '3 days ago', true), (6, 'Tara Singhania', 5, 'tennis bracelet clasp has double safety lock cz stones look like real diamonds', 'Just now', true), (6, 'Aditya Patel', 5, 'proper solid silver feel not that cheap coated metal totally worth the price', '8 days ago', true), (6, 'Sneha Rao', 4, 'looks unreal in person everyone at party was asking where i got it', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (7, 'Saurabh Tiwari', 3, 'gift bag handle had slight wrinkle inside shipping carton', '2 days ago', true), (7, 'Mayank Mishra', 3, 'chain size is delicate needs gentle handling otherwise shine is top', '3 days ago', true), (7, 'Kritika Johar', 5, 'silver cuff fits perfectly on the wrist very chic minimal look', 'Just now', true), (7, 'Priyanka Iyer', 5, 'super happy with the purchase looks stunning for daily wear', '8 days ago', true), (7, 'Tanvi Deshmukh', 4, 'next level craftsmanship polish is mirror finish', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (8, 'Mayank Mishra', 3, 'chain size is delicate needs gentle handling otherwise shine is top', '2 days ago', true), (8, 'Sanya Singhal', 5, 'hoops are lightweight and easy to wear all day', 'Just now', true), (8, 'Ishaan Sen', 5, 'fast delivery and solid build quality gifted to my fiance', '6 days ago', true), (8, 'Nandini Kulkarni', 5, 'anti tarnish coating is legit wearing it daily without any discoloration', '8 days ago', true), (8, 'Kavya Mehta', 4, 'gifted to my mom she went emotional seeing the velvet box', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (9, 'Chetan Bhagat', 3, 'outer brown cardboard had small corner press gift box inside was safe', '2 days ago', true), (9, 'Anand Ahuja', 2, 'took nearly 5 days to reach hyderabad delivery speed could be faster', '3 days ago', true), (9, 'Diya Malik', 5, 'studs are hypoallergenic no irritation even after wearing 14 hours', 'Just now', true), (9, 'Shreya Yadav', 5, 'solid weight to it looks very classy and elegant', '8 days ago', true), (9, 'Rohan Reddy', 4, 'clean edges and high polish feels very luxurious in hand', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (10, 'Anand Ahuja', 2, 'took nearly 5 days to reach hyderabad delivery speed could be faster', '2 days ago', true), (10, 'Pankaj Tripathi', 3, 'wish there was a silver polishing cloth included in standard box', '3 days ago', true), (10, 'Anushka Mittal', 5, 'crystal drops have royal sway perfect for wedding functions', 'Just now', true), (10, 'Pooja Sharma', 5, 'silver shine is genuinely top tier looks so royal and feels like real 925 sterling silver', '8 days ago', true), (10, 'Rhea Nair', 4, 'rhodium finish is crazy clean sparkles 10x better than pictures', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (11, 'Pankaj Tripathi', 3, 'wish there was a silver polishing cloth included in standard box', '2 days ago', true), (11, 'Palak Khurana', 5, 'wave band is so comfortable smooth inner finish', 'Just now', true), (11, 'Aditya Patel', 5, 'proper solid silver feel not that cheap coated metal totally worth the price', '6 days ago', true), (11, 'Sneha Rao', 5, 'looks unreal in person everyone at party was asking where i got it', '8 days ago', true), (11, 'Meera Malhotra', 4, 'insane detailing on the silver setting proper premium weight', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (12, 'Deepak Mehra', 2, 'courier executive took 4 days to deliver in pune', '2 days ago', true), (12, 'Saurabh Tiwari', 3, 'gift bag handle had slight wrinkle inside shipping carton', '3 days ago', true), (12, 'Mansi Bhatt', 5, 'solitaire setting is flawless stone looks massive and brilliant', 'Just now', true), (12, 'Priyanka Iyer', 5, 'super happy with the purchase looks stunning for daily wear', '8 days ago', true), (12, 'Tanvi Deshmukh', 4, 'next level craftsmanship polish is mirror finish', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (13, 'Saurabh Tiwari', 3, 'gift bag handle had slight wrinkle inside shipping carton', '2 days ago', true), (13, 'Sunita Bhatia', 5, 'monogram print is sophisticated pairs with formal and casual outfits', 'Just now', true), (13, 'Ishaan Sen', 5, 'fast delivery and solid build quality gifted to my fiance', '6 days ago', true), (13, 'Nandini Kulkarni', 5, 'anti tarnish coating is legit wearing it daily without any discoloration', '8 days ago', true), (13, 'Kavya Mehta', 4, 'gifted to my mom she went emotional seeing the velvet box', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (14, 'Mayank Mishra', 3, 'chain size is delicate needs gentle handling otherwise shine is top', '2 days ago', true), (14, 'Bhavna Gill', 5, 'pure silk touch is buttery smooth rich sheen and drape', 'Just now', true), (14, 'Shreya Yadav', 5, 'solid weight to it looks very classy and elegant', '6 days ago', true), (14, 'Rohan Reddy', 5, 'clean edges and high polish feels very luxurious in hand', '8 days ago', true), (14, 'Ritu Choudhary', 4, 'proper luxury brand aesthetic loving the timeless silver vibe', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (15, 'Chetan Bhagat', 3, 'outer brown cardboard had small corner press gift box inside was safe', '2 days ago', true), (15, 'Radhika Chauhan', 5, 'best anniversary gift set both necklace and earrings match seamlessly', 'Just now', true), (15, 'Pooja Sharma', 5, 'silver shine is genuinely top tier looks so royal and feels like real 925 sterling silver', '6 days ago', true), (15, 'Rhea Nair', 5, 'rhodium finish is crazy clean sparkles 10x better than pictures', '8 days ago', true), (15, 'Ananya Verma', 4, 'received in 3 days packaging was luxury velvet box sister loved it', '10 days ago', true);
INSERT INTO public.product_reviews (product_id, name, rating, text, date, verified) VALUES (16, 'Anand Ahuja', 2, 'took nearly 5 days to reach hyderabad delivery speed could be faster', '2 days ago', true), (16, 'Ragini Agrawal', 5, 'gift combo packaging is breathtaking velvet box with certificate', 'Just now', true), (16, 'Aditya Patel', 5, 'proper solid silver feel not that cheap coated metal totally worth the price', '6 days ago', true), (16, 'Sneha Rao', 5, 'looks unreal in person everyone at party was asking where i got it', '8 days ago', true), (16, 'Meera Malhotra', 4, 'insane detailing on the silver setting proper premium weight', '10 days ago', true);

-- ── SEED DEFAULT ADMIN NOTIFICATION SETTINGS ──
INSERT INTO public.admin_settings (key, value) VALUES
('notifications', '{"whatsapp_enabled": true, "whatsapp_number": "918530085116", "email_enabled": true, "admin_email": "digitalfreedomhub5116@gmail.com"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
