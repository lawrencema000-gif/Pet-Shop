-- 017: Add shipment tracking fields + admin order notes

-- Shipment tracking on orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','refunded','partially_refunded'));

-- Admin order notes (internal notes, not customer-facing)
CREATE TABLE IF NOT EXISTS order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id),
  author_name text NOT NULL DEFAULT 'Admin',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);

-- RLS for order_notes (admin only)
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order notes"
  ON order_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_role_cache
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-set shipped_at when status changes to shipped
CREATE OR REPLACE FUNCTION set_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.shipped_at = COALESCE(NEW.shipped_at, now());
  END IF;
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = COALESCE(NEW.delivered_at, now());
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_timestamps ON orders;
CREATE TRIGGER trg_order_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_timestamps();

NOTIFY pgrst, 'reload schema';
