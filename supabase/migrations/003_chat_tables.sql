-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id),
  customer_email text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  sender_role text NOT NULL DEFAULT 'customer' CHECK (sender_role IN ('customer', 'admin')),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer ON chat_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;

-- ============================================
-- RLS Policies for chat_conversations
-- ============================================

-- Customers can see their own conversations
CREATE POLICY "Customers can view own conversations"
  ON chat_conversations FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can create conversations
CREATE POLICY "Customers can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Customers can update their own conversations (e.g. close)
CREATE POLICY "Customers can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (customer_id = auth.uid());

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON chat_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all conversations
CREATE POLICY "Admins can update all conversations"
  ON chat_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS Policies for chat_messages
-- ============================================

-- Customers can view messages in their own conversations
CREATE POLICY "Customers can view own conversation messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
        AND chat_conversations.customer_id = auth.uid()
    )
  );

-- Customers can insert messages to their own conversations (sender_role must be 'customer')
CREATE POLICY "Customers can send messages in own conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_role = 'customer'
    AND EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
        AND chat_conversations.customer_id = auth.uid()
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert messages to any conversation (sender_role must be 'admin')
CREATE POLICY "Admins can send messages to any conversation"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_role = 'admin'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger for chat_conversations
CREATE OR REPLACE FUNCTION update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_conversation_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_updated_at();
