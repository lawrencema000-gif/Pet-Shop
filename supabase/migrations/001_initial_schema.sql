-- ============================================================
-- Pet Shop Initial Schema Migration
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  display_order int4 DEFAULT 0,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text,
  description text,
  category_id uuid REFERENCES categories(id),
  base_price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  is_featured bool DEFAULT false,
  is_best_seller bool DEFAULT false,
  is_new bool DEFAULT false,
  rating_avg numeric(2,1) DEFAULT 0.0,
  rating_count int4 DEFAULT 0,
  features jsonb,
  specifications jsonb,
  status text DEFAULT 'active',
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product Images
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  display_order int4 DEFAULT 0,
  is_primary bool DEFAULT false
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product Variants
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  variant_type text,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  sku text UNIQUE,
  stock_quantity int4 DEFAULT 100,
  image_url text,
  is_default bool DEFAULT false
);
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Addresses
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  label text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text DEFAULT 'US',
  is_default bool DEFAULT false
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  email text NOT NULL,
  status text DEFAULT 'pending',
  subtotal numeric(10,2),
  discount_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  shipping_address jsonb,
  coupon_code text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  product_name text,
  variant_name text,
  quantity int4 NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Reviews
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_verified_purchase bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Coupons
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text,
  discount_value numeric(10,2),
  min_order_amount numeric(10,2),
  max_uses int4,
  current_uses int4 DEFAULT 0,
  expires_at timestamptz,
  is_active bool DEFAULT true
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. RLS POLICIES
-- ============================================================

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Products: public read
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Product Images: public read
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

-- Product Variants: public read
CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (true);

-- Profiles: own row
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert for the trigger (service role inserts on signup)
CREATE POLICY "Enable insert for authentication trigger"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Addresses: full CRUD own rows
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Orders: select own + insert for authenticated
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Order Items: select via order ownership
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Reviews: public read, insert for authenticated, update/delete own
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Coupons: select active
CREATE POLICY "Active coupons are viewable"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Newsletter: insert for everyone
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 3. TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recalculate product rating on review change
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE public.products
  SET
    rating_avg = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.reviews
      WHERE product_id = target_product_id
    ), 0),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = target_product_id
    ),
    updated_at = now()
  WHERE id = target_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- ============================================================
-- 5. SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Pet Feeders', 'pet-feeders', 'Smart automatic pet feeders with app control', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop', 1),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Water Fountains', 'water-fountains', 'Smart water fountains for cats and dogs', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=600&fit=crop', 2),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Litter Boxes', 'litter-boxes', 'Self-cleaning smart litter boxes', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop', 3),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Accessories', 'accessories', 'Pet accessories and essentials', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&h=600&fit=crop', 4);

-- Products
-- 1. Granary Smart Camera Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_best_seller, features, specifications, status) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001',
   'Granary Smart Camera Feeder',
   'granary-smart-camera-feeder',
   'HD Camera + App-Controlled Feeding',
   'The Granary Smart Camera Feeder lets you watch, talk to, and feed your pet from anywhere. Equipped with a 1080p HD camera with night vision, voice recording, and precise portion control — all managed through the app.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   139.99, 159.99, true,
   '["HD Camera with Night Vision", "App-Controlled Feeding Schedule", "Voice Recording", "Portion Control", "Food Level Monitor"]',
   '{"Capacity": "5L", "Power": "USB-C", "Camera": "1080p HD", "App": "iOS & Android", "Material": "Food-grade ABS"}',
   'active');

-- 2. Granary Smart Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, features, specifications, status) VALUES
  ('b1b2c3d4-0002-4000-8000-000000000002',
   'Granary Smart Feeder',
   'granary-smart-feeder',
   'App-Controlled Automatic Feeder',
   'The Granary Smart Feeder provides reliable automatic feeding with app control, portion management, and dual power supply for uninterrupted feeding.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   89.99, 99.99,
   '["App-Controlled Schedule", "Portion Control", "Low Food Alert", "Dual Power Supply"]',
   '{"Capacity": "5L", "Power": "USB-C + Battery", "App": "iOS & Android"}',
   'active');

-- 3. Polar Smart Wet Food Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0003-4000-8000-000000000003',
   'Polar Smart Wet Food Feeder',
   'polar-smart-wet-food-feeder',
   'Keep Wet Food Fresh All Day',
   'The Polar Smart Wet Food Feeder features an innovative cooling system with ice packs to keep wet food fresh. Schedule up to 6 meals per day through the app.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   149.99, 169.99, true,
   '["Smart Freshness System", "Ice Pack Cooling", "6 Meal Portions", "App Scheduling"]',
   '{"Meals": "6 portions", "Cooling": "Ice pack included", "Power": "USB-C"}',
   'active');

-- 4. One RFID Smart Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0004-4000-8000-000000000004',
   'One RFID Smart Feeder',
   'one-rfid-smart-feeder',
   'Multi-Pet RFID Recognition Feeder',
   'The One RFID Smart Feeder uses RFID tag recognition to ensure each pet eats only their own food. Perfect for multi-pet households with food-stealing concerns.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   149.99, 169.99, true,
   '["RFID Tag Recognition", "Multi-Pet Household", "Prevents Food Stealing", "App Analytics"]',
   '{"Capacity": "3.5L", "Technology": "RFID", "Pets": "Multi-pet support"}',
   'active');

-- 5. Air Smart Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, features, specifications, status) VALUES
  ('b1b2c3d4-0005-4000-8000-000000000005',
   'Air Smart Feeder',
   'air-smart-feeder',
   'Compact Smart Feeder',
   'The Air Smart Feeder is a compact, space-saving automatic feeder with app control and a fresh food seal to keep kibble fresh.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   69.99, 79.99,
   '["Compact Design", "App Control", "Portion Management", "Fresh Food Seal"]',
   '{"Capacity": "3L", "Power": "USB-C", "Size": "Compact"}',
   'active');

-- 6. Dockstream 2 Smart Fountain
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_best_seller, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0006-4000-8000-000000000006',
   'Dockstream 2 Smart Fountain',
   'dockstream-2-smart-fountain',
   'Smart Hydration Tracking Fountain',
   'The Dockstream 2 Smart Fountain features a stainless steel bowl, ultra-quiet pump, and 5-stage filtration. Track your pet''s hydration through the app.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   79.99, 89.99, true, true,
   '["Smart Water Monitoring", "App Hydration Tracking", "Stainless Steel Bowl", "Ultra-Quiet Pump", "5-Stage Filtration"]',
   '{"Capacity": "2.5L", "Material": "Stainless Steel + BPA-free", "Noise": "< 30dB", "Filter": "5-stage"}',
   'active');

-- 7. Luma Smart Litter Box
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, is_new, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0007-4000-8000-000000000007',
   'Luma Smart Litter Box',
   'luma-smart-litter-box',
   'AI-Powered Self-Cleaning Litter Box',
   'The Luma Smart Litter Box features automatic self-cleaning with Video Cloud AI for health monitoring. Whisper-quiet operation supports up to 3 cats.',
   'a1b2c3d4-0003-4000-8000-000000000003',
   399.99, true, true,
   '["Automatic Self-Cleaning", "Video Cloud AI", "Health Monitoring", "Odor Control", "Whisper Quiet"]',
   '{"Capacity": "Up to 3 cats", "Cleaning": "Automatic", "AI": "Video Cloud AI", "Noise": "< 40dB"}',
   'active');

-- 8. Cove Placemat
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, features, specifications, status) VALUES
  ('b1b2c3d4-0008-4000-8000-000000000008',
   'Cove Placemat',
   'cove-placemat',
   'Waterproof Silicone Pet Placemat',
   'The Cove Placemat keeps your floors clean with a waterproof, non-slip silicone design. Raised edges contain spills and it cleans up in seconds.',
   'a1b2c3d4-0004-4000-8000-000000000004',
   24.99,
   '["Waterproof Silicone", "Non-Slip Base", "Easy to Clean", "Raised Edges"]',
   '{"Material": "Food-grade Silicone", "Size": "19\" x 12\""}',
   'active');

-- Product Images
-- Granary Smart Camera Feeder
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800&h=800&fit=crop', 'Granary Smart Camera Feeder - Front View', 0, true),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'Granary Smart Camera Feeder - Side View', 1, false),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=800&fit=crop', 'Granary Smart Camera Feeder - In Use', 2, false);

-- Granary Smart Feeder
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop', 'Granary Smart Feeder - Front View', 0, true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop', 'Granary Smart Feeder - Detail', 1, false);

-- Polar Smart Wet Food Feeder
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop', 'Polar Smart Wet Food Feeder - Front View', 0, true),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=800&h=800&fit=crop', 'Polar Smart Wet Food Feeder - Open', 1, false);

-- One RFID Smart Feeder
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'One RFID Smart Feeder - Front View', 0, true),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=800&fit=crop', 'One RFID Smart Feeder - With RFID Tag', 1, false);

-- Air Smart Feeder
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop', 'Air Smart Feeder - Front View', 0, true),
  ('b1b2c3d4-0005-4000-8000-000000000005', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop', 'Air Smart Feeder - Compact Design', 1, false);

-- Dockstream 2 Smart Fountain
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop', 'Dockstream 2 Smart Fountain - Front View', 0, true),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=800&fit=crop', 'Dockstream 2 Smart Fountain - Stainless Bowl', 1, false);

-- Luma Smart Litter Box
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=800&fit=crop', 'Luma Smart Litter Box - Front View', 0, true),
  ('b1b2c3d4-0007-4000-8000-000000000007', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=800&fit=crop', 'Luma Smart Litter Box - Open View', 1, false);

-- Cove Placemat
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=800&fit=crop', 'Cove Placemat - Top View', 0, true),
  ('b1b2c3d4-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&h=800&fit=crop', 'Cove Placemat - In Use', 1, false);

-- Product Variants
-- Granary Smart Camera Feeder
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'White', 'color', 139.99, 159.99, 'GRAN-CAM-WHT', true),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Black', 'color', 139.99, 159.99, 'GRAN-CAM-BLK', false);

-- Granary Smart Feeder
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0002-4000-8000-000000000002', 'White', 'color', 89.99, 99.99, 'GRAN-SMT-WHT', true),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Black', 'color', 89.99, 99.99, 'GRAN-SMT-BLK', false);

-- Polar Smart Wet Food Feeder
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0003-4000-8000-000000000003', 'White', 'color', 149.99, 169.99, 'POLR-WET-WHT', true);

-- One RFID Smart Feeder
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0004-4000-8000-000000000004', 'White', 'color', 149.99, 169.99, 'ONE-RFID-WHT', true);

-- Air Smart Feeder
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0005-4000-8000-000000000005', 'White', 'color', 69.99, 79.99, 'AIR-SMT-WHT', true),
  ('b1b2c3d4-0005-4000-8000-000000000005', 'Gray', 'color', 69.99, 79.99, 'AIR-SMT-GRY', false);

-- Dockstream 2 Smart Fountain
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, is_default) VALUES
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Plug-In White', 'model', 79.99, 89.99, 'DOCK2-PLG-WHT', true),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Plug-In Black', 'model', 79.99, 89.99, 'DOCK2-PLG-BLK', false),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Cordless White', 'model', 89.99, NULL, 'DOCK2-CRD-WHT', false),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Cordless Black', 'model', 89.99, NULL, 'DOCK2-CRD-BLK', false),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Bundle with 6 Filters White', 'model', 99.99, NULL, 'DOCK2-BND-WHT', false),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Bundle with 6 Filters Black', 'model', 99.99, NULL, 'DOCK2-BND-BLK', false);

-- Luma Smart Litter Box
INSERT INTO product_variants (product_id, name, variant_type, price, sku, is_default) VALUES
  ('b1b2c3d4-0007-4000-8000-000000000007', 'White', 'color', 399.99, 'LUMA-LTR-WHT', true),
  ('b1b2c3d4-0007-4000-8000-000000000007', 'Black', 'color', 429.99, 'LUMA-LTR-BLK', false);

-- Cove Placemat
INSERT INTO product_variants (product_id, name, variant_type, price, sku, is_default) VALUES
  ('b1b2c3d4-0008-4000-8000-000000000008', 'Gray', 'color', 24.99, 'COVE-MAT-GRY', true),
  ('b1b2c3d4-0008-4000-8000-000000000008', 'Beige', 'color', 24.99, 'COVE-MAT-BGE', false);
