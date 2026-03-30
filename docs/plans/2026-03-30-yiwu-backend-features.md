# Copy YIWU Backend Features to Pet Shop

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port proven Supabase backend features from YIWU (mature marketplace) into Pet Shop (single-vendor B2C), filling gaps where the frontend already has UI but no working backend.

**Architecture:** Single SQL migration file per task, applied via `supabase db push --linked`. All tables use RLS with `is_admin()` helper (already exists in Pet Shop via admin_role_cache). Adapt YIWU's JPY integer pricing to Pet Shop's numeric(10,2) USD pricing. Skip vendor/marketplace/B2B/POS/Japan-specific features.

**Tech Stack:** PostgreSQL (Supabase), RLS policies, PL/pgSQL functions, triggers

---

## Features to Port (Priority Order)

| # | Feature | Why | Source Migration |
|---|---------|-----|-----------------|
| 1 | Wishlists | Page exists, queries nothing | `20260330220000_wishlist.sql` |
| 2 | Security hardening | Critical: role escalation prevention | `20260330470000_security_hardening.sql` |
| 3 | Notifications | No notification system exists | `20260314100000_add_notifications.sql` |
| 4 | Gift cards | UI shows "Coming Soon", needs backend | `20260330340000_gift_cards.sql` |
| 5 | Invoices | No receipt/invoice system | `20260312100000_add_invoice_system.sql` |
| 6 | Fraud detection | No fraud checks on checkout | `20260319100000_add_fraud_detection.sql` |
| 7 | Chargebacks | No dispute tracking | `20260330360000_chargebacks.sql` |
| 8 | Product Q&A | No Q&A on product pages | `20260306230000_create_product_qa.sql` |

## Features SKIPPED (not applicable to single-vendor B2C)

- shops, vendor_applications, vendor_payouts, commissions (multi-vendor)
- shipping_carriers, shipping_zones, shipping_rates, shipping_size_tiers (Japan-specific zone system)
- warehouses, warehouse_inventory, fulfillment_tasks (Pet Shop already has simpler stock_movements)
- companies, company_members, price_lists (B2B wholesale)
- pos_sessions, pos_transactions (Point of Sale)
- subscriptions (not in Pet Shop scope)
- shipments/shipment_events (Pet Shop already has tracking_number/carrier/tracking_url on orders table)

---

### Task 1: Wishlists Table

**Files:**
- Create: `supabase/migrations/025_wishlists.sql`

**Step 1: Write migration**

```sql
-- 025: Wishlists (ported from YIWU)
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
  ON wishlists FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all wishlists (analytics)
CREATE POLICY "Admins can view all wishlists"
  ON wishlists FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
```

**Step 2: Apply migration**

```bash
cd /c/Users/lmao/Pet-Shop
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
```

**Step 3: Commit**

```bash
git add supabase/migrations/025_wishlists.sql
git commit -m "feat: add wishlists table (ported from YIWU)"
```

---

### Task 2: Security Hardening (Role Escalation Prevention)

**Files:**
- Create: `supabase/migrations/026_security_hardening.sql`

**Step 1: Write migration**

Adapts YIWU's `20260330470000_security_hardening_role_protection.sql` for Pet Shop's schema (uses admin_role_cache instead of inline profile checks).

```sql
-- 026: Security hardening — role escalation prevention (ported from YIWU)

-- A. is_super_admin() function — checks email whitelist
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_emails jsonb;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN false; END IF;

  SELECT value INTO v_emails FROM public.app_settings WHERE key = 'super_admin_emails';
  IF v_emails IS NULL THEN RETURN false; END IF;

  RETURN v_emails @> to_jsonb(v_email);
END;
$$;

-- B. Prevent role escalation trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_super boolean;
BEGIN
  -- Skip if role and staff_role_id unchanged
  IF OLD.role IS NOT DISTINCT FROM NEW.role
     AND OLD.staff_role_id IS NOT DISTINCT FROM NEW.staff_role_id THEN
    RETURN NEW;
  END IF;

  -- Check if current user is super admin
  SELECT public.is_super_admin() INTO v_is_super;

  IF NOT v_is_super THEN
    -- Non-super-admins cannot change roles
    NEW.role := OLD.role;
    NEW.staff_role_id := OLD.staff_role_id;
  END IF;

  -- Super admins cannot demote themselves
  IF v_is_super AND OLD.id = auth.uid() AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Super admins cannot demote themselves';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- C. Enforce customer role on new signups
CREATE OR REPLACE FUNCTION public.enforce_customer_role_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Force new profiles to customer role (service_role bypasses RLS/triggers)
  IF NOT public.is_super_admin() THEN
    NEW.role := 'customer';
    NEW.staff_role_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_customer_role ON profiles;
CREATE TRIGGER trg_enforce_customer_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_customer_role_on_insert();

-- D. Protect sensitive app_settings keys
CREATE OR REPLACE FUNCTION public.protect_sensitive_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sensitive_keys text[] := ARRAY[
    'super_admin_emails',
    'stripe_secret_key',
    'stripe_webhook_secret'
  ];
BEGIN
  IF NEW.key = ANY(v_sensitive_keys) THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only super admins can modify sensitive settings: %', NEW.key;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_sensitive_settings ON app_settings;
CREATE TRIGGER trg_protect_sensitive_settings
  BEFORE INSERT OR UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION protect_sensitive_settings();

-- E. Seed super_admin_emails setting
INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', '["lawrence.ma000@gmail.com"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
```

**Step 2: Apply migration**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
```

**Step 3: Commit**

```bash
git add supabase/migrations/026_security_hardening.sql
git commit -m "feat: add security hardening — role escalation prevention (ported from YIWU)"
```

---

### Task 3: In-App Notifications

**Files:**
- Create: `supabase/migrations/027_notifications.sql`

**Step 1: Write migration**

```sql
-- 027: In-app notifications with realtime (ported from YIWU)

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  reference_id uuid,
  reference_type text,
  link text DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users read/update own notifications
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins and service role can manage all
CREATE POLICY "Admins manage notifications"
  ON notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role manages notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');

-- Notification log (email/SMS delivery tracking)
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  type text NOT NULL,
  reference_id uuid,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log(user_id);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notification log"
  ON notification_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage notification log"
  ON notification_log FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role manages notification log"
  ON notification_log FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime for instant notifications
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/027_notifications.sql
git commit -m "feat: add notifications system with realtime (ported from YIWU)"
```

---

### Task 4: Gift Cards

**Files:**
- Create: `supabase/migrations/028_gift_cards.sql`

**Step 1: Write migration**

Adapted from YIWU — changed `_jpy int` to `numeric(10,2)` for USD pricing.

```sql
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
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/028_gift_cards.sql
git commit -m "feat: add gift cards system (ported from YIWU)"
```

---

### Task 5: Invoice System

**Files:**
- Create: `supabase/migrations/029_invoices.sql`

**Step 1: Write migration**

Adapted from YIWU — simplified tax structure (single rate instead of Japan's dual 8%/10%), generic seller info.

```sql
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Customers can read invoices for their own orders
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
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/029_invoices.sql
git commit -m "feat: add invoice system with number generator (ported from YIWU)"
```

---

### Task 6: Fraud Detection

**Files:**
- Create: `supabase/migrations/030_fraud_detection.sql`

**Step 1: Write migration**

Adapted from YIWU — changed JPY thresholds to USD, uses Pet Shop's numeric pricing.

```sql
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
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/030_fraud_detection.sql
git commit -m "feat: add fraud detection with velocity/value/address rules (ported from YIWU)"
```

---

### Task 7: Chargebacks / Dispute Tracking

**Files:**
- Create: `supabase/migrations/031_chargebacks.sql`

**Step 1: Write migration**

```sql
-- 031: Chargebacks / dispute tracking (ported from YIWU)

CREATE TABLE IF NOT EXISTS chargebacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  stripe_dispute_id text UNIQUE NOT NULL,
  stripe_charge_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  reason text,
  status text NOT NULL DEFAULT 'needs_response'
    CHECK (status IN ('needs_response', 'under_review', 'won', 'lost')),
  evidence_due_by timestamptz,
  admin_notes text,
  evidence_submitted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chargebacks_order ON chargebacks(order_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_status ON chargebacks(status);

ALTER TABLE chargebacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage chargebacks"
  ON chargebacks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/031_chargebacks.sql
git commit -m "feat: add chargebacks/dispute tracking (ported from YIWU)"
```

---

### Task 8: Product Q&A

**Files:**
- Create: `supabase/migrations/032_product_qa.sql`

**Step 1: Write migration**

Adapted from YIWU — removed vendor/shop references (Pet Shop is single-vendor).

```sql
-- 032: Product Q&A system (ported from YIWU)

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 10),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  answer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_admin_answer boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_product ON questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id);

-- Auto-update answer_count
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE questions SET answer_count = (
    SELECT COUNT(*) FROM question_answers
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  ) WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_question_answer_count
  AFTER INSERT OR UPDATE OR DELETE ON question_answers
  FOR EACH ROW EXECUTE FUNCTION update_question_answer_count();

-- RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Published questions: anyone can read
CREATE POLICY "Anyone can read published questions"
  ON questions FOR SELECT USING (status = 'published');

-- Users can read their own (any status)
CREATE POLICY "Users read own questions"
  ON questions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can ask questions
CREATE POLICY "Auth users can ask questions"
  ON questions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all questions
CREATE POLICY "Admins manage questions"
  ON questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

-- Anyone can read answers
CREATE POLICY "Anyone can read answers"
  ON question_answers FOR SELECT USING (true);

-- Authenticated users can post answers
CREATE POLICY "Auth users can answer"
  ON question_answers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can manage answers
CREATE POLICY "Admins manage answers"
  ON question_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
```

**Step 2: Apply & commit**

```bash
/c/Users/lmao/node_modules/supabase/bin/supabase.exe db push --linked
git add supabase/migrations/032_product_qa.sql
git commit -m "feat: add product Q&A system (ported from YIWU)"
```

---

### Task 9: Final — Push to GitHub and Deploy

**Step 1: Push all commits**

```bash
git push origin master
```

**Step 2: Deploy to Vercel**

```bash
vercel --prod --yes
```

---

## Post-Implementation Notes

After all migrations are applied, the Pet Shop database will have **35+ tables** (up from 27), gaining:
- `wishlists` — proper wishlist persistence
- `notifications` + `notification_log` — in-app + delivery tracking
- `gift_cards` + `gift_card_transactions` — gift card system
- `invoices` + `invoice_items` — receipt/invoice generation
- `fraud_flags` — automated fraud detection
- `chargebacks` — dispute tracking
- `questions` + `question_answers` — product Q&A

Plus security functions: `is_super_admin()`, `prevent_role_escalation()`, `enforce_customer_role_on_insert()`, `protect_sensitive_settings()`, `check_fraud_rules()`, `generate_invoice_number()`.

**Frontend wiring** (separate tasks, not in this plan):
- Wire wishlist page to query `wishlists` table
- Wire gift cards page to create/redeem gift cards
- Add notification bell component
- Add Q&A section to product detail pages
- Add invoice download to order detail pages
- Add fraud flags view to admin dashboard
