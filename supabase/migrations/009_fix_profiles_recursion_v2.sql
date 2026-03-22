-- ============================================================
-- Fix infinite recursion on profiles - aggressive fix
-- ============================================================
-- Drop ALL SELECT policies on profiles to break any recursion,
-- then create a single clean policy.
-- ============================================================

-- Drop every known SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "All authenticated can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;

-- Single clean SELECT policy: profiles are public data (name, avatar, role)
CREATE POLICY "profiles_select_open"
  ON profiles FOR SELECT
  USING (true);

-- Also fix the UPDATE policy to avoid recursion
-- Admins update via is_admin() which does a SELECT on profiles.
-- Since SELECT is now open (true), the is_admin() SELECT won't recurse.
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid()  -- users can update own
    OR public.is_admin()  -- admins can update any (safe: SELECT is open)
  );

-- Drop and recreate original user update policy to avoid conflicts
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
