-- ============================================================
-- Fix infinite recursion on profiles RLS policies
-- ============================================================
-- Problem: "Admins can view all profiles" calls is_admin(),
--          which queries profiles, triggering the same policy → infinite loop.
-- Fix: Make profiles SELECT open (profile data is public: name, avatar, role).
--       This breaks the recursion chain. UPDATE still uses is_admin() safely
--       because is_admin() only does a SELECT, which now resolves to `true`.
-- ============================================================

-- Drop the recursive admin SELECT policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Allow all users (including anon) to read profiles
-- This is safe: profiles contain name, avatar_url, role — no secrets
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);
