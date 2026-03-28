-- 020: Collections (curated product groupings)

CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  long_description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order int NOT NULL DEFAULT 0,
  UNIQUE(collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_products_coll ON collection_products(collection_id);

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Public read for active collections
CREATE POLICY "Public read active collections"
  ON collections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage collections"
  ON collections FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public read collection products (if collection is active)
CREATE POLICY "Public read collection products"
  ON collection_products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND is_active = true)
  );

CREATE POLICY "Admins manage collection products"
  ON collection_products FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Seed existing static collections
INSERT INTO collections (slug, title, description, long_description, image_url, display_order) VALUES
  ('best-for-apartments', 'Best for Small Spaces', 'Compact, quiet smart pet products designed for apartment living.', 'Living in a small apartment doesn''t mean your pet has to miss out on premium care.', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=1200&h=500&fit=crop', 1),
  ('multi-pet-homes', 'Multi-Pet Household Essentials', 'Products built for homes with 2+ pets.', 'Managing feeding, hydration, and hygiene for multiple pets is a challenge.', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=500&fit=crop', 2),
  ('new-pet-parent', 'New Pet Parent Starter Kit', 'Everything a first-time pet owner needs.', 'Congratulations on your new furry family member!', 'https://images.unsplash.com/photo-1583337130417-13104dec14c7?w=1200&h=500&fit=crop', 3)
ON CONFLICT (slug) DO NOTHING;

-- Link existing products to collections by slug
DO $$
DECLARE
  coll_id uuid;
  prod_id uuid;
BEGIN
  -- best-for-apartments
  SELECT id INTO coll_id FROM collections WHERE slug = 'best-for-apartments';
  IF coll_id IS NOT NULL THEN
    FOR prod_id IN SELECT id FROM products WHERE slug IN ('granary-smart-camera-feeder','dockstream-2-smart-water-fountain','granary-smart-feeder','dockstream-rfid-water-fountain') LOOP
      INSERT INTO collection_products (collection_id, product_id) VALUES (coll_id, prod_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- multi-pet-homes
  SELECT id INTO coll_id FROM collections WHERE slug = 'multi-pet-homes';
  IF coll_id IS NOT NULL THEN
    FOR prod_id IN SELECT id FROM products WHERE slug IN ('one-rfid-smart-feeder','dockstream-rfid-water-fountain','luma-self-cleaning-litter-box','granary-smart-camera-feeder') LOOP
      INSERT INTO collection_products (collection_id, product_id) VALUES (coll_id, prod_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- new-pet-parent
  SELECT id INTO coll_id FROM collections WHERE slug = 'new-pet-parent';
  IF coll_id IS NOT NULL THEN
    FOR prod_id IN SELECT id FROM products WHERE slug IN ('granary-smart-feeder','dockstream-2-smart-water-fountain','granary-smart-camera-feeder') LOOP
      INSERT INTO collection_products (collection_id, product_id) VALUES (coll_id, prod_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
