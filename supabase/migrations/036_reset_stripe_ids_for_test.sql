-- 036: Reset Stripe IDs to re-sync with test keys
-- Old IDs were from a different Stripe account (live). Need fresh sync with test keys.

UPDATE products SET stripe_product_id = NULL;
UPDATE product_variants SET stripe_price_id = NULL;

NOTIFY pgrst, 'reload schema';
