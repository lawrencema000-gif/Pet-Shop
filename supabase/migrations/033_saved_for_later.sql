-- 033: Cloud-synced save-for-later items

CREATE TABLE IF NOT EXISTS saved_for_later (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_for_later_user ON saved_for_later(user_id);

ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved items"
  ON saved_for_later FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
