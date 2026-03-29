-- Product translations table for multi-language support
CREATE TABLE product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'ja', 'zh', 'ko')),
  name text,
  subtitle text,
  description text,
  features jsonb, -- string array
  specifications jsonb, -- key-value object
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, language)
);

-- Category translations table
CREATE TABLE category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'ja', 'zh', 'ko')),
  name text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, language)
);

-- Variant translations table
CREATE TABLE variant_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'ja', 'zh', 'ko')),
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(variant_id, language)
);

-- Indexes for fast lookups
CREATE INDEX idx_product_translations_product ON product_translations(product_id, language);
CREATE INDEX idx_category_translations_category ON category_translations(category_id, language);
CREATE INDEX idx_variant_translations_variant ON variant_translations(variant_id, language);

-- RLS policies
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read product translations" ON product_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read category translations" ON category_translations FOR SELECT USING (true);
CREATE POLICY "Anyone can read variant translations" ON variant_translations FOR SELECT USING (true);

-- Admin write access (using admin_role_cache)
CREATE POLICY "Admins can manage product translations" ON product_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage category translations" ON category_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage variant translations" ON variant_translations FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid())
);
