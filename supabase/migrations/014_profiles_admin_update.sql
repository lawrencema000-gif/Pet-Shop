-- Re-add admin UPDATE policy on profiles
-- Safe now: is_admin() queries admin_role_cache (no RLS), not profiles
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());
