-- 019: Return requests + refund log

CREATE TABLE IF NOT EXISTS return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  email text NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','completed')),
  admin_notes text,
  refund_amount numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage returns"
  ON return_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Customers can view their own returns
CREATE POLICY "Users view own returns"
  ON return_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Customers can create returns for their own orders
CREATE POLICY "Users create own returns"
  ON return_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Refund log (tracks all refund actions)
CREATE TABLE IF NOT EXISTS refund_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  return_request_id uuid REFERENCES return_requests(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL DEFAULT '',
  refunded_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refund_log_order ON refund_log(order_id);

ALTER TABLE refund_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage refund log"
  ON refund_log FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin')
  );

NOTIFY pgrst, 'reload schema';
