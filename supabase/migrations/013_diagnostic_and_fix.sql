-- ============================================================
-- Nuclear fix: Drop ALL policies on profiles, recreate clean
-- ============================================================
-- The recursion persists because some old policy still references
-- profiles in a way that causes cycles. Drop everything and start fresh.
-- ============================================================

-- Drop EVERY policy on profiles (including unknown/leftover ones)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Recreate minimal, recursion-free policies on profiles
-- SELECT: open (profile data is public: name, avatar, role)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- INSERT: only for auth trigger (signup creates profile)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: own profile only. Admin updates go through service role API routes.
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
