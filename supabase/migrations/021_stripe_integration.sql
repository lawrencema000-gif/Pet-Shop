-- Stripe integration columns

-- Products: store Stripe Product ID
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id text;

-- Product Variants: store Stripe Price ID
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Orders: store Stripe session/payment info
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';

-- Profiles: store Stripe Customer ID
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Pending checkout sessions (for metadata overflow)
CREATE TABLE IF NOT EXISTS pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  email text NOT NULL,
  user_id uuid,
  shipping_address jsonb NOT NULL,
  coupon_code text,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '2 hours')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_stripe_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_variants_stripe_price ON product_variants(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_expires ON pending_checkouts(expires_at);

-- RLS for pending_checkouts
ALTER TABLE pending_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on pending_checkouts"
  ON pending_checkouts FOR ALL
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
