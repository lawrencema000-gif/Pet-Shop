-- 028: Gift cards system (ported from YIWU, adapted for USD)

CREATE TABLE IF NOT EXISTS gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  initial_balance numeric(10,2) NOT NULL,
  current_balance numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'depleted', 'disabled')),
  purchaser_id uuid REFERENCES auth.users(id),
  recipient_email text,
  recipient_name text,
  personal_message text,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id uuid NOT NULL REFERENCES gift_cards(id),
  order_id uuid REFERENCES orders(id),
  amount numeric(10,2) NOT NULL,
  balance_after numeric(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'redemption', 'refund', 'adjustment')),
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_card_txn_card ON gift_card_transactions(gift_card_id);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
CREATE POLICY "Admins manage gift cards"
  ON gift_cards FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage gc transactions"
  ON gift_card_transactions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- Users can read their own purchased gift cards
CREATE POLICY "Users read own gift cards"
  ON gift_cards FOR SELECT TO authenticated
  USING (purchaser_id = auth.uid());

-- Users can read transactions for their gift cards
CREATE POLICY "Users read own gc transactions"
  ON gift_card_transactions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM gift_cards gc
    WHERE gc.id = gift_card_transactions.gift_card_id
    AND gc.purchaser_id = auth.uid()
  ));

-- Add gift card tracking to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_card_id uuid REFERENCES gift_cards(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_card_amount numeric(10,2) DEFAULT 0;

NOTIFY pgrst, 'reload schema';
