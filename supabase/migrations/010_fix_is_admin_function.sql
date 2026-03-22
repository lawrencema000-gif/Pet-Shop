-- ============================================================
-- Fix is_admin() to break infinite recursion
-- ============================================================
-- Problem: is_admin() queries `profiles`, which has RLS policies.
-- PostgreSQL's recursive policy detector flags ANY function that
-- queries a table with policies, even if SECURITY DEFINER.
--
-- Fix: Query auth.users directly (no RLS) and store admin role
-- in raw_user_meta_data, OR use a separate approach.
--
-- Cleanest fix: Use a dedicated admin_lookup table WITHOUT RLS.
-- ============================================================

-- Step 1: Create a lookup table for admin role (no RLS!)
CREATE TABLE IF NOT EXISTS public.admin_role_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer'
);

-- DO NOT enable RLS on admin_role_cache — this is the key to breaking recursion
-- Grant read to all roles so is_admin() can access it
GRANT SELECT ON public.admin_role_cache TO anon, authenticated, service_role;

-- Populate from existing profiles data
INSERT INTO admin_role_cache (user_id, role)
  SELECT id, role FROM public.profiles
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Step 2: Rewrite is_admin() to use admin_role_cache (no RLS = no recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_role_cache
    WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- Step 3: Keep admin_role_cache in sync with profiles via trigger
CREATE OR REPLACE FUNCTION public.sync_admin_role_cache()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_role_cache (user_id, role)
    VALUES (NEW.id, NEW.role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_admin_role_cache_trigger ON profiles;
CREATE TRIGGER sync_admin_role_cache_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_admin_role_cache();
