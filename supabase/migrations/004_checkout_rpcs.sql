-- Increment coupon usage count after successful order
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE id = coupon_id;
END;
$$;

-- Decrement variant stock after successful order
CREATE OR REPLACE FUNCTION decrement_variant_stock(p_variant_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - p_quantity)
  WHERE id = p_variant_id;
END;
$$;
