-- ============================================================
-- Fix ALL policies that directly query profiles to break recursion
-- ============================================================
-- Chat policies in 003 directly query profiles instead of is_admin().
-- Replace ALL such policies to use admin_role_cache instead.
-- ============================================================

-- ========================
-- Chat Conversations
-- ========================

-- Admin SELECT on chat_conversations
DROP POLICY IF EXISTS "Admins can view all conversations" ON chat_conversations;
CREATE POLICY "Admins can view all conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin UPDATE on chat_conversations
DROP POLICY IF EXISTS "Admins can update all conversations" ON chat_conversations;
CREATE POLICY "Admins can update all conversations"
  ON chat_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========================
-- Chat Messages
-- ========================

-- Admin SELECT on chat_messages
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;
CREATE POLICY "Admins can view all messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin INSERT on chat_messages
DROP POLICY IF EXISTS "Admins can send messages to any conversation" ON chat_messages;
CREATE POLICY "Admins can send messages to any conversation"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_role = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ========================
-- Also update is_admin() one more time to be absolutely sure
-- ========================
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
