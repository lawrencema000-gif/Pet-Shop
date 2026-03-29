-- 023: Add missing tables and columns referenced by frontend

-- ============================================================
-- 1. PETS TABLE (account/pets page)
-- ============================================================
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'dog' CHECK (species IN ('dog', 'cat', 'other')),
  breed text,
  age_years numeric(4,1),
  size text DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'xlarge')),
  dietary_needs text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Users can view their own pets
CREATE POLICY "Users can view own pets"
  ON pets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own pets
CREATE POLICY "Users can create own pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pets
CREATE POLICY "Users can update own pets"
  ON pets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own pets
CREATE POLICY "Users can delete own pets"
  ON pets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 2. PRODUCTS.DISPLAY_ORDER (admin products reordering)
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- ============================================================
-- 3. REVIEWS.IS_APPROVED (admin dashboard filters unapproved reviews)
-- ============================================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved) WHERE is_approved = false;

-- ============================================================
-- 4. NOTIFY POSTGREST TO RELOAD SCHEMA
-- ============================================================
NOTIFY pgrst, 'reload schema';
