-- 024: Fix broken Unsplash image URLs (404s)
-- photo-1583337130417-13104dec14a5 → photo-1574158622682-e40e69881006
-- photo-1583337130417-13104dec14c7 → photo-1548199973-03cce0bbc87b

-- Fix category image (Water Fountains)
UPDATE categories
SET image_url = REPLACE(image_url, 'photo-1583337130417-13104dec14a5', 'photo-1574158622682-e40e69881006')
WHERE image_url LIKE '%13104dec14a5%';

-- Fix product images
UPDATE product_images
SET url = REPLACE(url, 'photo-1583337130417-13104dec14a5', 'photo-1574158622682-e40e69881006')
WHERE url LIKE '%13104dec14a5%';

-- Fix collection images
UPDATE collections
SET image_url = REPLACE(image_url, 'photo-1583337130417-13104dec14c7', 'photo-1548199973-03cce0bbc87b')
WHERE image_url LIKE '%13104dec14c7%';

NOTIFY pgrst, 'reload schema';
