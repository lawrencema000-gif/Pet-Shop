-- 034: Batch 2 — ported from YIWU (single-vendor applicable features)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. EMAIL CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  segment text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients int DEFAULT 0,
  total_sent int DEFAULT 0,
  total_opened int DEFAULT 0,
  total_clicked int DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at DESC);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email campaigns"
  ON email_campaigns FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 2. CUSTOMER SEGMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  logic text NOT NULL DEFAULT 'and' CHECK (logic IN ('and', 'or')),
  customer_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage segments"
  ON customer_segments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 3. AUTOMATION RULES + LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL
    CHECK (trigger_type IN ('order_created', 'order_shipped', 'inventory_low', 'review_submitted', 'signup', 'scheduled')),
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  run_count integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  affected_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON automation_logs(created_at DESC);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage automation rules"
  ON automation_rules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage automation logs"
  ON automation_logs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 4. REVIEW IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS review_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);

ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved review images"
  ON review_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM reviews WHERE id = review_id));

CREATE POLICY "Authors can insert review images"
  ON review_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM reviews WHERE id = review_id AND user_id = auth.uid()));

CREATE POLICY "Admins manage review images"
  ON review_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 5. STAFF INVITATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role_id uuid NOT NULL REFERENCES staff_roles(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON staff_invitations(token);

ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage staff invitations"
  ON staff_invitations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 6. SAVED VIEWS (admin filter persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  page text NOT NULL DEFAULT 'products',
  filters jsonb NOT NULL DEFAULT '{}',
  sort_by text,
  sort_dir text DEFAULT 'desc',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved views"
  ON saved_views FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. PRODUCT CHANGE HISTORY (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id),
  field_name text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_history_product ON product_change_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_created ON product_change_history(created_at DESC);

ALTER TABLE product_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read product history"
  ON product_change_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins insert product history"
  ON product_change_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 8. STOCK NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_notif_product ON stock_notifications(product_id);

ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stock notifications"
  ON stock_notifications FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins view all stock notifications"
  ON stock_notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 9. CANCEL ORDER FUNCTION (with inventory restoration)
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order record;
  v_item record;
BEGIN
  SELECT * INTO v_order FROM public.orders
  WHERE id = p_order_id AND (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'
  ));

  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Order cannot be cancelled (status: %)', v_order.status;
  END IF;

  -- Update order status
  UPDATE public.orders SET status = 'cancelled', updated_at = now() WHERE id = p_order_id;

  -- Restore inventory for each item
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + v_item.quantity
      WHERE id = v_item.variant_id;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_order TO authenticated;

NOTIFY pgrst, 'reload schema';
