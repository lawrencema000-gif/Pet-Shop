-- ============================================================
-- Additional seed products for testing UI components
-- ============================================================

-- Product 9: Dockstream Mini Fountain
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_new, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0009-4000-8000-000000000009',
   'Dockstream Mini Fountain',
   'dockstream-mini-fountain',
   'Compact Smart Water Fountain',
   'The Dockstream Mini is perfect for small spaces and single-pet households. Features a triple filtration system and whisper-quiet pump with smart hydration reminders via the app.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   49.99, 59.99, true, false,
   '["Triple Filtration", "Ultra-Quiet Pump", "Smart Reminders", "BPA-Free", "Dishwasher Safe"]',
   '{"Capacity": "1.8L", "Noise": "< 25dB", "Material": "BPA-free Tritan", "Filter": "Triple filtration"}',
   'active');

-- Product 10: Granary XL Pro Feeder
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_best_seller, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0010-4000-8000-000000000010',
   'Granary XL Pro Feeder',
   'granary-xl-pro-feeder',
   'Large Capacity Pro-Grade Smart Feeder',
   'Built for multi-pet households and large breeds, the Granary XL Pro holds 10L of dry food with dual dispensing trays and advanced scheduling for up to 10 meals per day.',
   'a1b2c3d4-0001-4000-8000-000000000001',
   199.99, 249.99, true, true,
   '["10L Large Capacity", "Dual Dispensing Trays", "10 Meals/Day Schedule", "Voice Recording", "Battery Backup", "Clog-Free Design"]',
   '{"Capacity": "10L", "Power": "USB-C + Battery", "Meals": "Up to 10/day", "App": "iOS & Android", "Trays": "Dual stainless steel"}',
   'active');

-- Product 11: AquaStream Pro Fountain
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_new, is_best_seller, features, specifications, status) VALUES
  ('b1b2c3d4-0011-4000-8000-000000000011',
   'AquaStream Pro Fountain',
   'aquastream-pro-fountain',
   'Premium Stainless Steel Smart Fountain',
   'The AquaStream Pro is our premium stainless steel fountain with 7-stage filtration, UV sterilization, and real-time water quality monitoring through the PETLIBRO app.',
   'a1b2c3d4-0002-4000-8000-000000000002',
   129.99, NULL, true, true,
   '["7-Stage Filtration", "UV Sterilization", "Water Quality Monitor", "Full Stainless Steel", "App Alerts", "Cordless Option"]',
   '{"Capacity": "3L", "Material": "304 Stainless Steel", "Filtration": "7-stage + UV", "Noise": "< 28dB"}',
   'active');

-- Product 12: Luma Mini Litter Box
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_new, features, specifications, status) VALUES
  ('b1b2c3d4-0012-4000-8000-000000000012',
   'Luma Mini Litter Box',
   'luma-mini-litter-box',
   'Compact Self-Cleaning Litter Box',
   'The Luma Mini brings self-cleaning technology to smaller spaces. Designed for single-cat households, it features the same AI health monitoring as the full-size Luma in a 30% smaller footprint.',
   'a1b2c3d4-0003-4000-8000-000000000003',
   299.99, 349.99, true,
   '["Auto Self-Cleaning", "AI Health Monitoring", "Compact Design", "Odor Lock", "App Notifications"]',
   '{"Capacity": "1 cat", "Cleaning": "Automatic", "AI": "Health monitoring", "Footprint": "30% smaller"}',
   'active');

-- Product 13: SmartBowl Pro
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_featured, features, specifications, status) VALUES
  ('b1b2c3d4-0013-4000-8000-000000000013',
   'SmartBowl Pro',
   'smartbowl-pro',
   'Heated Smart Feeding Bowl',
   'The SmartBowl Pro keeps your pet''s food at the perfect temperature. Built-in food scale tracks portions, and the warming function keeps wet food appetizing for hours.',
   'a1b2c3d4-0004-4000-8000-000000000004',
   59.99, 69.99, true,
   '["Built-in Food Scale", "Warming Function", "Portion Tracking", "Stainless Steel Insert", "App Logging"]',
   '{"Material": "Stainless Steel + Ceramic", "Capacity": "400ml", "Temp Range": "25-40°C", "Power": "USB-C"}',
   'active');

-- Product 14: Pet Camera Collar Tag
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, is_new, features, specifications, status) VALUES
  ('b1b2c3d4-0014-4000-8000-000000000014',
   'Pet Camera Collar Tag',
   'pet-camera-collar-tag',
   'Lightweight GPS + Camera Tag',
   'A lightweight, waterproof collar tag with built-in camera, GPS tracking, and activity monitoring. See the world from your pet''s perspective and track their daily activity.',
   'a1b2c3d4-0004-4000-8000-000000000004',
   79.99, true,
   '["Built-in Camera", "GPS Tracking", "Activity Monitor", "Waterproof IP67", "7-Day Battery"]',
   '{"Weight": "28g", "Battery": "7 days", "Camera": "720p", "Connectivity": "Bluetooth + LTE", "Water Rating": "IP67"}',
   'active');

-- Product 15: Premium Filter Pack (6-Pack)
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_best_seller, features, specifications, status) VALUES
  ('b1b2c3d4-0015-4000-8000-000000000015',
   'Premium Filter Pack (6-Pack)',
   'premium-filter-pack-6',
   '6-Month Supply of Replacement Filters',
   'Keep your PETLIBRO fountain running fresh with our premium 5-stage replacement filters. Each filter lasts approximately 30 days. Compatible with Dockstream and AquaStream models.',
   'a1b2c3d4-0004-4000-8000-000000000004',
   29.99, 35.99, true,
   '["5-Stage Filtration", "6-Month Supply", "Compatible with All Fountains", "Activated Carbon", "Ion Exchange Resin"]',
   '{"Quantity": "6 filters", "Lifespan": "~30 days each", "Compatibility": "Dockstream + AquaStream series"}',
   'active');

-- Product 16: Luma XL Smart Litter Box
INSERT INTO products (id, name, slug, subtitle, description, category_id, base_price, compare_at_price, is_featured, is_best_seller, features, specifications, status) VALUES
  ('b1b2c3d4-0016-4000-8000-000000000016',
   'Luma XL Smart Litter Box',
   'luma-xl-smart-litter-box',
   'Extra-Large Self-Cleaning Litter Box for Multi-Cat Homes',
   'The Luma XL is built for multi-cat households with a 50% larger waste bin and double the cleaning cycles. Video Cloud AI monitors each cat individually with health reports delivered to your app.',
   'a1b2c3d4-0003-4000-8000-000000000003',
   549.99, 649.99, true, true,
   '["50% Larger Waste Bin", "Multi-Cat AI Tracking", "Individual Health Reports", "Auto Self-Cleaning", "Double Cleaning Cycles", "Deodorizer Built-In"]',
   '{"Capacity": "Up to 5 cats", "Waste Bin": "15L (50% larger)", "AI": "Per-cat tracking", "Cleaning": "Double cycle auto", "Noise": "< 35dB"}',
   'active');

-- Product Images for new products

-- Dockstream Mini
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop', 'Dockstream Mini Fountain', 0, true),
  ('b1b2c3d4-0009-4000-8000-000000000009', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=800&fit=crop', 'Dockstream Mini - Detail', 1, false);

-- Granary XL Pro
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'Granary XL Pro Feeder', 0, true),
  ('b1b2c3d4-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop', 'Granary XL Pro - Large Capacity', 1, false),
  ('b1b2c3d4-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=800&fit=crop', 'Granary XL Pro - Dual Trays', 2, false);

-- AquaStream Pro
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop', 'AquaStream Pro Fountain', 0, true),
  ('b1b2c3d4-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=800&fit=crop', 'AquaStream Pro - Stainless Steel', 1, false);

-- Luma Mini
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=800&fit=crop', 'Luma Mini Litter Box', 0, true),
  ('b1b2c3d4-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=800&fit=crop', 'Luma Mini - Compact Design', 1, false);

-- SmartBowl Pro
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0013-4000-8000-000000000013', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&h=800&fit=crop', 'SmartBowl Pro', 0, true),
  ('b1b2c3d4-0013-4000-8000-000000000013', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=800&fit=crop', 'SmartBowl Pro - Warming Function', 1, false);

-- Pet Camera Collar Tag
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0014-4000-8000-000000000014', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'Pet Camera Collar Tag', 0, true);

-- Premium Filter Pack
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0015-4000-8000-000000000015', 'https://images.unsplash.com/photo-1583337130417-13104dec14a5?w=800&h=800&fit=crop', 'Premium Filter Pack', 0, true);

-- Luma XL
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
  ('b1b2c3d4-0016-4000-8000-000000000016', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=800&fit=crop', 'Luma XL Smart Litter Box', 0, true),
  ('b1b2c3d4-0016-4000-8000-000000000016', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=800&fit=crop', 'Luma XL - Extra Large', 1, false),
  ('b1b2c3d4-0016-4000-8000-000000000016', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop', 'Luma XL - Multi-Cat', 2, false);

-- Product Variants for new products

-- Dockstream Mini
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0009-4000-8000-000000000009', 'White', 'color', 49.99, 59.99, 'DOCK-MINI-WHT', 50, true),
  ('b1b2c3d4-0009-4000-8000-000000000009', 'Mint Green', 'color', 49.99, 59.99, 'DOCK-MINI-MNT', 35, false);

-- Granary XL Pro
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0010-4000-8000-000000000010', 'White', 'color', 199.99, 249.99, 'GRAN-XL-WHT', 25, true),
  ('b1b2c3d4-0010-4000-8000-000000000010', 'Black', 'color', 199.99, 249.99, 'GRAN-XL-BLK', 20, false),
  ('b1b2c3d4-0010-4000-8000-000000000010', 'Bundle with Bowl', 'bundle', 229.99, 279.99, 'GRAN-XL-BND', 15, false);

-- AquaStream Pro
INSERT INTO product_variants (product_id, name, variant_type, price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0011-4000-8000-000000000011', 'Silver', 'color', 129.99, 'AQUA-PRO-SLV', 40, true),
  ('b1b2c3d4-0011-4000-8000-000000000011', 'Matte Black', 'color', 139.99, 'AQUA-PRO-BLK', 30, false),
  ('b1b2c3d4-0011-4000-8000-000000000011', 'Cordless Silver', 'style', 149.99, 'AQUA-PRO-CRD', 20, false);

-- Luma Mini
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0012-4000-8000-000000000012', 'White', 'color', 299.99, 349.99, 'LUMA-MINI-WHT', 30, true),
  ('b1b2c3d4-0012-4000-8000-000000000012', 'Beige', 'color', 299.99, 349.99, 'LUMA-MINI-BGE', 25, false);

-- SmartBowl Pro
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0013-4000-8000-000000000013', 'White', 'color', 59.99, 69.99, 'SMBWL-PRO-WHT', 60, true),
  ('b1b2c3d4-0013-4000-8000-000000000013', 'Black', 'color', 59.99, 69.99, 'SMBWL-PRO-BLK', 45, false),
  ('b1b2c3d4-0013-4000-8000-000000000013', 'Small (200ml)', 'size', 44.99, 49.99, 'SMBWL-PRO-SM', 80, false);

-- Pet Camera Collar Tag
INSERT INTO product_variants (product_id, name, variant_type, price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0014-4000-8000-000000000014', 'Space Gray', 'color', 79.99, 'COLLAR-TAG-GRY', 100, true),
  ('b1b2c3d4-0014-4000-8000-000000000014', 'Rose Gold', 'color', 84.99, 'COLLAR-TAG-RSG', 75, false);

-- Premium Filter Pack
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0015-4000-8000-000000000015', '6-Pack', 'size', 29.99, 35.99, 'FLTR-6PK', 200, true),
  ('b1b2c3d4-0015-4000-8000-000000000015', '12-Pack', 'size', 49.99, 65.99, 'FLTR-12PK', 150, false);

-- Luma XL
INSERT INTO product_variants (product_id, name, variant_type, price, compare_at_price, sku, stock_quantity, is_default) VALUES
  ('b1b2c3d4-0016-4000-8000-000000000016', 'White', 'color', 549.99, 649.99, 'LUMA-XL-WHT', 15, true),
  ('b1b2c3d4-0016-4000-8000-000000000016', 'Charcoal', 'color', 569.99, 669.99, 'LUMA-XL-CHR', 10, false);
