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
