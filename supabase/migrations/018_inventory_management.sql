-- 018: Inventory management — stock movements, thresholds, auto-hide

-- Add low stock threshold to variants
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10;

-- Stock movements audit trail
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('receive','sale','adjust','return','initial')),
  quantity integer NOT NULL,  -- positive = added, negative = removed
  stock_after integer NOT NULL,
  reference_type text,        -- 'order', 'manual', 'csv_import'
  reference_id text,          -- order id, etc.
  notes text DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

-- RLS for stock_movements (admin only)
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stock movements"
  ON stock_movements FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Auto-archive products when ALL variants are out of stock
CREATE OR REPLACE FUNCTION check_auto_hide_product()
RETURNS TRIGGER AS $$
DECLARE
  all_zero boolean;
BEGIN
  -- Only trigger when stock decreases to 0
  IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM product_variants
      WHERE product_id = NEW.product_id AND stock_quantity > 0
    ) INTO all_zero;

    IF all_zero THEN
      UPDATE products SET status = 'archived' WHERE id = NEW.product_id AND status = 'active';
    END IF;
  END IF;

  -- Auto-reactivate if stock added back
  IF NEW.stock_quantity > 0 AND OLD.stock_quantity = 0 THEN
    UPDATE products SET status = 'active' WHERE id = NEW.product_id AND status = 'archived';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_hide_product ON product_variants;
CREATE TRIGGER trg_auto_hide_product
  AFTER UPDATE OF stock_quantity ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION check_auto_hide_product();

-- Prevent negative stock
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_stock_non_negative;
ALTER TABLE product_variants ADD CONSTRAINT product_variants_stock_non_negative
  CHECK (stock_quantity >= 0);

NOTIFY pgrst, 'reload schema';
