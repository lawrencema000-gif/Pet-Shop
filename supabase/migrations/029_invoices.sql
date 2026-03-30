-- 029: Invoice & receipt system (ported from YIWU, adapted for USD)

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'invoice'
    CHECK (type IN ('invoice', 'receipt', 'credit_note')),
  status text NOT NULL DEFAULT 'issued'
    CHECK (status IN ('draft', 'issued', 'paid', 'cancelled', 'refunded')),
  seller_name text NOT NULL,
  seller_address text NOT NULL DEFAULT '',
  seller_phone text NOT NULL DEFAULT '',
  buyer_name text NOT NULL,
  buyer_email text NOT NULL DEFAULT '',
  buyer_address text NOT NULL DEFAULT '',
  subtotal numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  issued_at timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  qty integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  tax_rate numeric(4,2) NOT NULL DEFAULT 8.00,
  line_total numeric(10,2) NOT NULL,
  sort_order integer DEFAULT 0
);

-- Invoice number generator
CREATE OR REPLACE FUNCTION generate_invoice_number(p_type text DEFAULT 'invoice')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix text;
  seq_val bigint;
BEGIN
  prefix := CASE p_type
    WHEN 'invoice' THEN 'INV'
    WHEN 'receipt' THEN 'RCP'
    WHEN 'credit_note' THEN 'CN'
    ELSE 'INV'
  END;
  seq_val := nextval('invoice_number_seq');
  RETURN prefix || '-' || to_char(now(), 'YYYYMM') || '-' || lpad(seq_val::text, 6, '0');
END;
$$;

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Customers read own invoices
CREATE POLICY "Customers read own invoices"
  ON invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Customers read own invoice items"
  ON invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM invoices i
    JOIN orders o ON o.id = i.order_id
    WHERE i.id = invoice_items.invoice_id AND o.user_id = auth.uid()
  ));

-- Admins full access
CREATE POLICY "Admins manage invoices"
  ON invoices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage invoice items"
  ON invoice_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- Service role bypass
CREATE POLICY "Service role manages invoices"
  ON invoices FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages invoice items"
  ON invoice_items FOR ALL USING (auth.role() = 'service_role');

-- Seed invoice settings
INSERT INTO app_settings (key, value) VALUES
  ('invoiceSellerName', '"PETLIBRO Inc."'::jsonb),
  ('invoiceSellerAddress', '""'::jsonb),
  ('invoiceSellerPhone', '""'::jsonb),
  ('defaultTaxRate', '8'::jsonb)
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
