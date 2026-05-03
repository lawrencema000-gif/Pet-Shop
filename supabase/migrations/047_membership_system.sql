-- ============================================
-- Phase F: Membership System
-- ============================================
--
-- Two layers:
--   1. membership_tiers — admin-editable lifetime-spend tiers (Bronze→Diamond),
--      drives loyalty point earn rate + perks
--   2. membership_plans + memberships — paid Stripe-subscribed Premium tier
--      (Pet+ monthly/yearly) layered ON TOP of free tiers
--
-- Replaces the hardcoded tier definitions in src/app/account/rewards/page.tsx
-- Lifetime spend (USD) is auto-tracked via Stripe webhook hook.

-- ── 1. Membership tiers (admin-editable) ────────────────────────────
CREATE TABLE IF NOT EXISTS membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  min_lifetime_spend_usd numeric(10,2) NOT NULL DEFAULT 0,

  -- Loyalty point modifiers
  points_earn_multiplier numeric(5,2) NOT NULL DEFAULT 1.00,  -- 1.0 = base 1pt/$1, 1.5 = 1.5pt/$1
  max_redemption_pct integer NOT NULL DEFAULT 50,             -- max % of order payable in points
  free_shipping_threshold_usd numeric(10,2) DEFAULT 75,       -- NULL = always free
  birthday_bonus_points integer DEFAULT 200,

  -- Perks
  priority_support boolean DEFAULT false,
  early_access_hours integer DEFAULT 0,
  member_deals boolean DEFAULT true,
  free_returns boolean DEFAULT false,
  extended_returns_days integer DEFAULT 30,

  -- Visual
  color_hex text NOT NULL DEFAULT '#92400e',
  icon_emoji text NOT NULL DEFAULT '🥉',
  perks jsonb NOT NULL DEFAULT '[]'::jsonb, -- bullet list shown to customer

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_tiers_order ON membership_tiers(display_order);

ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiers_public_read" ON membership_tiers FOR SELECT USING (true);
CREATE POLICY "tiers_admin_all" ON membership_tiers
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));

-- Seed five tiers (mapped from existing hardcoded rewards page)
INSERT INTO membership_tiers (slug, name, display_order, min_lifetime_spend_usd,
                              points_earn_multiplier, max_redemption_pct,
                              free_shipping_threshold_usd, birthday_bonus_points,
                              priority_support, early_access_hours, free_returns,
                              extended_returns_days, color_hex, icon_emoji, perks)
VALUES
  ('bronze',   'Bronze',   0, 0,    1.00, 50, 75,   100,  false, 0,   false, 30, '#A88E73', '🥉',
   '["1 point per $1 spent","Free shipping over $75","30-day returns"]'::jsonb),
  ('silver',   'Silver',   1, 100,  1.25, 50, 75,   200,  false, 0,   false, 30, '#9CA3AF', '🥈',
   '["1.25× points","Early access to sales","100 birthday bonus points"]'::jsonb),
  ('gold',     'Gold',     2, 500,  1.50, 60, 50,   300,  true,  24,  false, 60, '#D4A843', '🥇',
   '["1.5× points","Free shipping over $50","Priority support","60-day returns","Early access (24h)"]'::jsonb),
  ('platinum', 'Platinum', 3, 1500, 2.00, 70, 25,   500,  true,  48,  true,  90, '#94A3B8', '💎',
   '["2× points","Free shipping over $25","Free returns","90-day returns","Priority support","48h early access"]'::jsonb),
  ('diamond',  'Diamond',  4, 5000, 2.50, 80, 0,    1000, true,  72,  true,  120,'#67E8F9', '💠',
   '["2.5× points","Free shipping always","Free returns always","120-day returns","Personal shopper","72h early access","Surprise gifts"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. Profile additions for tier tracking ──────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lifetime_spend_usd numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS membership_tier text DEFAULT 'bronze';

CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(membership_tier);


-- ── 3. Tier history audit log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS tier_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_tier text,
  new_tier text NOT NULL,
  lifetime_spend_usd numeric(10,2) NOT NULL,
  reason text DEFAULT 'spend_threshold',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tier_history_user ON tier_history(user_id, created_at DESC);

ALTER TABLE tier_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tier_history_user_read" ON tier_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tier_history_admin_all" ON tier_history
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));


-- ── 4. recalculate_member_tier — only upgrades, never auto-downgrades
CREATE OR REPLACE FUNCTION recalculate_member_tier(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_spend numeric;
  v_current_tier text;
  v_new_tier text;
BEGIN
  SELECT lifetime_spend_usd, membership_tier
  INTO v_spend, v_current_tier
  FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT slug INTO v_new_tier
  FROM membership_tiers
  WHERE min_lifetime_spend_usd <= COALESCE(v_spend, 0)
  ORDER BY display_order DESC
  LIMIT 1;

  v_new_tier := COALESCE(v_new_tier, 'bronze');

  IF v_current_tier IS DISTINCT FROM v_new_tier THEN
    -- Only upgrades (compare display_order)
    IF (SELECT display_order FROM membership_tiers WHERE slug = v_new_tier) >
       COALESCE((SELECT display_order FROM membership_tiers WHERE slug = v_current_tier), -1)
    THEN
      UPDATE profiles SET membership_tier = v_new_tier WHERE id = p_user_id;
      INSERT INTO tier_history (user_id, old_tier, new_tier, lifetime_spend_usd, reason)
      VALUES (p_user_id, v_current_tier, v_new_tier, v_spend, 'spend_threshold');
    END IF;
  END IF;

  RETURN v_new_tier;
END;
$$;


-- ── 5. update_lifetime_spend — called by webhook on paid order ──────
CREATE OR REPLACE FUNCTION update_lifetime_spend(p_user_id uuid, p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total numeric;
BEGIN
  SELECT total INTO v_total FROM orders WHERE id = p_order_id;
  IF NOT FOUND OR v_total IS NULL THEN RETURN; END IF;

  UPDATE profiles
  SET lifetime_spend_usd = COALESCE(lifetime_spend_usd, 0) + v_total
  WHERE id = p_user_id;

  PERFORM recalculate_member_tier(p_user_id);
END;
$$;

REVOKE ALL ON FUNCTION update_lifetime_spend FROM public, anon, authenticated;


-- ── 6. Membership plans (paid Premium subscription) ─────────────────
CREATE TABLE IF NOT EXISTS membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_usd numeric(10,2) NOT NULL,
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  interval_count integer NOT NULL DEFAULT 1,
  trial_days integer NOT NULL DEFAULT 14,

  -- Stripe linkage (cached on first checkout)
  stripe_product_id text,
  stripe_price_id text,

  -- Benefits
  points_earn_multiplier numeric(5,2) NOT NULL DEFAULT 1.00,
  free_shipping_threshold_usd numeric(10,2) DEFAULT 0,
  early_access_hours integer DEFAULT 0,
  member_discount_pct integer DEFAULT 0,
  birthday_bonus_points integer DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,

  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "plans_admin_all" ON membership_plans
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));

-- Seed Pet+ plans
INSERT INTO membership_plans (slug, name, description, price_usd, interval, interval_count,
                              trial_days, points_earn_multiplier, free_shipping_threshold_usd,
                              early_access_hours, member_discount_pct, birthday_bonus_points,
                              features, display_order)
VALUES
  ('pet_plus_monthly', 'Pet+ Monthly', 'Premium membership for committed pet parents.',
    4.99, 'month', 1, 14,
    1.50, 0, 24, 5, 250,
    '["1.5× points on every order","Free shipping always","5% off every order","250 birthday bonus","24h early access to drops","Priority support"]'::jsonb,
    1),
  ('pet_plus_yearly', 'Pet+ Yearly', 'Save $10/yr vs monthly.',
    49.99, 'year', 1, 14,
    1.50, 0, 24, 5, 250,
    '["1.5× points on every order","Free shipping always","5% off every order","250 birthday bonus","24h early access to drops","Priority support","Save $10 vs monthly"]'::jsonb,
    2)
ON CONFLICT (slug) DO NOTHING;


-- ── 7. Customer memberships (paid Stripe subscription) ──────────────
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES membership_plans(id),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memberships_user_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_stripe ON memberships(stripe_subscription_id);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_user_read" ON memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "memberships_admin_all" ON memberships
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));


-- ── 8. is_active_premium_member helper ──────────────────────────────
CREATE OR REPLACE FUNCTION is_active_premium_member(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = p_user_id
      AND status IN ('trialing', 'active')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;


-- ── 9. Auto-update updated_at ────────────────────────────────────────
CREATE TRIGGER membership_tiers_updated_at BEFORE UPDATE ON membership_tiers
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at(); -- reuse from migration 042

CREATE TRIGGER membership_plans_updated_at BEFORE UPDATE ON membership_plans
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
