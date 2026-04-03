-- 035: Add physical attributes to products (weight, dimensions, barcode)

ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_g integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm numeric(6,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width_cm numeric(6,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm numeric(6,1);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Also add weight per variant
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight_g integer;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS barcode text;

NOTIFY pgrst, 'reload schema';
