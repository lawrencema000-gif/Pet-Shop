-- ============================================================
-- 002: Admin RLS Policies + Missing Tables + Guest Checkout
-- ============================================================
-- Fixes:
--   1. Admin users (profiles.role = 'admin') get full access
--   2. Guest checkout: anon can INSERT into orders & order_items
--   3. Creates missing tables: staff_roles, app_settings, audit_log
--   4. Adds missing columns to profiles: role, is_banned, staff_role_id, email
-- ============================================================

-- ============================================================
-- A. Schema additions
-- ============================================================

-- Add role column to profiles (default 'customer')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned bool NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Staff Roles table
CREATE TABLE IF NOT EXISTS staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system bool NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

-- Add staff_role_id FK to profiles (after staff_roles exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'staff_role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN staff_role_id uuid REFERENCES staff_roles(id);
  END IF;
END $$;

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- B. Helper: is_admin() function
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- C. Admin RLS Policies
-- ============================================================
-- Pattern: DROP IF EXISTS then CREATE, to be idempotent.

-- ---------- profiles ----------
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- ---------- orders ----------
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- ---------- order_items ----------
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (public.is_admin());

-- ---------- products ----------
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (public.is_admin());

-- ---------- product_variants ----------
DROP POLICY IF EXISTS "Admins can insert product variants" ON product_variants;
CREATE POLICY "Admins can insert product variants"
  ON product_variants FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product variants" ON product_variants;
CREATE POLICY "Admins can update product variants"
  ON product_variants FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product variants" ON product_variants;
CREATE POLICY "Admins can delete product variants"
  ON product_variants FOR DELETE
  USING (public.is_admin());

-- ---------- product_images ----------
DROP POLICY IF EXISTS "Admins can insert product images" ON product_images;
CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON product_images;
CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON product_images;
CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  USING (public.is_admin());

-- ---------- categories ----------
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (public.is_admin());

-- ---------- coupons ----------
DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
CREATE POLICY "Admins can insert coupons"
  ON coupons FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
CREATE POLICY "Admins can update coupons"
  ON coupons FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;
CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE
  USING (public.is_admin());

-- ---------- reviews ----------
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
CREATE POLICY "Admins can update reviews"
  ON reviews FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (public.is_admin());

-- ---------- newsletter_subscribers ----------
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (public.is_admin());

-- ---------- staff_roles ----------
DROP POLICY IF EXISTS "Admins can view staff roles" ON staff_roles;
CREATE POLICY "Admins can view staff roles"
  ON staff_roles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert staff roles" ON staff_roles;
CREATE POLICY "Admins can insert staff roles"
  ON staff_roles FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update staff roles" ON staff_roles;
CREATE POLICY "Admins can update staff roles"
  ON staff_roles FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete staff roles" ON staff_roles;
CREATE POLICY "Admins can delete staff roles"
  ON staff_roles FOR DELETE
  USING (public.is_admin());

-- ---------- app_settings ----------
DROP POLICY IF EXISTS "Admins can view app settings" ON app_settings;
CREATE POLICY "Admins can view app settings"
  ON app_settings FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert app settings" ON app_settings;
CREATE POLICY "Admins can insert app settings"
  ON app_settings FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;
CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE
  USING (public.is_admin());

-- ---------- audit_log ----------
DROP POLICY IF EXISTS "Admins can insert audit log" ON audit_log;
CREATE POLICY "Admins can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit log" ON audit_log;
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- D. Guest Checkout: allow anon INSERT on orders & order_items
-- ============================================================

-- Replace the existing authenticated-only insert policy on orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- order_items had no INSERT policy at all; allow anyone
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- E. Done
-- ============================================================
