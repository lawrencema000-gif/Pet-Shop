-- 015: Atomic checkout, guest order viewing, indexes, coupon race fix

-- 1. Atomic checkout function — validates stock, creates order + items, decrements stock in ONE transaction
CREATE OR REPLACE FUNCTION public.process_checkout(
  p_user_id uuid,
  p_email text,
  p_items jsonb,           -- [{product_id, variant_id, quantity}]
  p_shipping_address jsonb,
  p_coupon_code text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_shipping_cost numeric DEFAULT 5.99,
  p_tax_rate numeric DEFAULT 0.08,
  p_free_shipping_threshold numeric DEFAULT 75
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_item jsonb;
  v_product record;
  v_variant record;
  v_unit_price numeric;
  v_variant_name text;
  v_total_price numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_coupon_id uuid;
  v_coupon record;
  v_shipping numeric;
  v_tax numeric;
  v_total numeric;
  v_order_id uuid;
  v_order_items jsonb := '[]'::jsonb;
  v_existing_order_id uuid;
BEGIN
  -- Idempotency check: if same key already used, return existing order
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_order_id
    FROM public.orders
    WHERE notes = ('idempotency:' || p_idempotency_key)
    LIMIT 1;

    IF v_existing_order_id IS NOT NULL THEN
      RETURN jsonb_build_object('order_id', v_existing_order_id, 'duplicate', true);
    END IF;
  END IF;

  -- Validate and build order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Fetch product with lock
    SELECT id, name, base_price, status INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND status = 'active'
    FOR UPDATE;

    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product not found or unavailable: %', v_item->>'product_id';
    END IF;

    v_unit_price := v_product.base_price;
    v_variant_name := NULL;

    -- Validate variant with row lock for stock
    IF v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null' THEN
      SELECT id, product_id, name, price, stock_quantity INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item->>'variant_id')::uuid
      FOR UPDATE;

      IF v_variant IS NULL OR v_variant.product_id != v_product.id THEN
        RAISE EXCEPTION 'Variant not found: %', v_item->>'variant_id';
      END IF;

      v_unit_price := v_variant.price;
      v_variant_name := v_variant.name;

      -- Atomic stock check
      IF v_variant.stock_quantity IS NOT NULL AND v_variant.stock_quantity < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'Insufficient stock for % (%). Only % available.',
          v_product.name, v_variant_name, v_variant.stock_quantity;
      END IF;

      -- Decrement stock immediately (inside this transaction)
      UPDATE public.product_variants
      SET stock_quantity = GREATEST(0, stock_quantity - (v_item->>'quantity')::int)
      WHERE id = v_variant.id;
    END IF;

    v_total_price := v_unit_price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_total_price;

    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product.id,
      'variant_id', CASE WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null'
                         THEN (v_item->>'variant_id')::uuid ELSE NULL END,
      'product_name', v_product.name,
      'variant_name', v_variant_name,
      'quantity', (v_item->>'quantity')::int,
      'unit_price', v_unit_price,
      'total_price', v_total_price
    );
  END LOOP;

  -- Validate coupon atomically
  IF p_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = upper(p_coupon_code) AND is_active = true
    FOR UPDATE;  -- Lock coupon row to prevent race

    IF v_coupon IS NOT NULL THEN
      IF (v_coupon.expires_at IS NULL OR v_coupon.expires_at >= now())
        AND (v_coupon.max_uses IS NULL OR COALESCE(v_coupon.current_uses, 0) < v_coupon.max_uses)
        AND (v_coupon.min_order_amount IS NULL OR v_subtotal >= v_coupon.min_order_amount)
      THEN
        IF v_coupon.discount_type = 'percentage' THEN
          v_discount := v_subtotal * (v_coupon.discount_value / 100);
        ELSE
          v_discount := LEAST(v_coupon.discount_value, v_subtotal);
        END IF;
        v_discount := ROUND(v_discount, 2);
        v_coupon_id := v_coupon.id;

        -- Increment coupon usage atomically
        UPDATE public.coupons
        SET current_uses = COALESCE(current_uses, 0) + 1
        WHERE id = v_coupon_id;
      END IF;
    END IF;
  END IF;

  -- Calculate totals — tax on subtotal + shipping
  v_shipping := CASE WHEN v_subtotal >= p_free_shipping_threshold THEN 0 ELSE p_shipping_cost END;
  v_tax := ROUND((v_subtotal + v_shipping) * p_tax_rate, 2);
  v_total := ROUND(v_subtotal + v_shipping + v_tax - v_discount, 2);

  -- Create order
  INSERT INTO public.orders (user_id, email, status, subtotal, discount_amount, shipping_amount, tax_amount, total, shipping_address, coupon_code, notes)
  VALUES (
    p_user_id, p_email, 'pending', v_subtotal, v_discount, v_shipping, v_tax, v_total,
    p_shipping_address,
    CASE WHEN p_coupon_code IS NOT NULL THEN upper(p_coupon_code) ELSE NULL END,
    CASE WHEN p_idempotency_key IS NOT NULL THEN 'idempotency:' || p_idempotency_key ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  INSERT INTO public.order_items (order_id, product_id, variant_id, product_name, variant_name, quantity, unit_price, total_price)
  SELECT
    v_order_id,
    (item->>'product_id')::uuid,
    CASE WHEN item->>'variant_id' IS NOT NULL AND item->>'variant_id' != 'null'
         THEN (item->>'variant_id')::uuid ELSE NULL END,
    item->>'product_name',
    item->>'variant_name',
    (item->>'quantity')::int,
    (item->>'unit_price')::numeric,
    (item->>'total_price')::numeric
  FROM jsonb_array_elements(v_order_items) AS item;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'shipping_amount', v_shipping,
    'tax_amount', v_tax,
    'total', v_total,
    'duplicate', false
  );
END;
$$;

-- 2. Guest order viewing — allow lookup by order ID + email (for guest order tracking)
CREATE POLICY "Guests can view own orders by id"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND email = current_setting('request.headers', true)::jsonb->>'x-guest-email')
  );

-- 3. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products(lower(name));

-- 4. Grant RPC access
GRANT EXECUTE ON FUNCTION public.process_checkout TO anon, authenticated;

-- 5. Notify PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
