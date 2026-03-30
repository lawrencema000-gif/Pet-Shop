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

CREATE POLICY "Admins can view all wishlists"
  ON wishlists FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid() AND role = 'admin'));

NOTIFY pgrst, 'reload schema';
