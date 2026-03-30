-- 030: Fraud detection (ported from YIWU, adapted for USD)

CREATE TABLE IF NOT EXISTS fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  user_id uuid REFERENCES auth.users(id),
  rule_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details jsonb NOT NULL DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_order ON fraud_flags(order_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_unresolved ON fraud_flags(resolved, created_at DESC);

ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fraud flags"
  ON fraud_flags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- Fraud check function (called after order creation)
CREATE OR REPLACE FUNCTION check_fraud_rules(p_order_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_orders integer;
  v_order_total numeric;
  v_account_age interval;
  v_address_count integer;
BEGIN
  -- Rule 1: Velocity — more than 5 orders in 1 hour
  SELECT COUNT(*) INTO v_recent_orders
  FROM orders
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour';

  IF v_recent_orders > 5 THEN
    INSERT INTO fraud_flags (order_id, user_id, rule_name, severity, details)
    VALUES (p_order_id, p_user_id, 'velocity_check', 'high',
      jsonb_build_object('recent_orders_1h', v_recent_orders));
  END IF;

  -- Rule 2: New account + high value order (>$500 within 24h of signup)
  SELECT (now() - created_at) INTO v_account_age FROM profiles WHERE id = p_user_id;
  SELECT total INTO v_order_total FROM orders WHERE id = p_order_id;

  IF v_account_age < interval '24 hours' AND v_order_total > 500 THEN
    INSERT INTO fraud_flags (order_id, user_id, rule_name, severity, details)
    VALUES (p_order_id, p_user_id, 'new_account_high_value', 'medium',
      jsonb_build_object(
        'account_age_hours', EXTRACT(EPOCH FROM v_account_age) / 3600,
        'order_total', v_order_total
      ));
  END IF;

  -- Rule 3: Multiple different shipping addresses in 24 hours
  SELECT COUNT(DISTINCT shipping_address::text) INTO v_address_count
  FROM orders
  WHERE user_id = p_user_id
    AND created_at > now() - interval '24 hours';

  IF v_address_count > 3 THEN
    INSERT INTO fraud_flags (order_id, user_id, rule_name, severity, details)
    VALUES (p_order_id, p_user_id, 'multiple_addresses', 'medium',
      jsonb_build_object('distinct_addresses_24h', v_address_count));
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
