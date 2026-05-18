-- ============================================================================
-- Phase G — Meta CAPI server tracking + programmatic SEO + co-purchase recos
--
-- Three independent additions bundled together because they all serve the
-- same goal (more efficient paid + organic acquisition):
--
--   1. capi_event_log         — audit trail for every Meta Conversions API
--                               event so we can diagnose attribution gaps.
--   2. product_copurchases    — materialized view of "customers who bought A
--                               also bought B" + RPC to query it.
--   3. seo_pages / authors    — admin-editable programmatic SEO landing pages
--                               (best-of, comparison, gift-guide, how-to)
--                               with E-E-A-T author bylines and structured-
--                               data schema fields.
-- ============================================================================

-- ─── 1. CAPI event log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capi_event_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name   text NOT NULL,
  event_id     text NOT NULL,         -- matches the browser pixel call for dedup
  pixel_id     text NOT NULL,
  status_code  integer NOT NULL,
  response_body text,
  payload      jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capi_event_log_event_id ON capi_event_log(event_id);
CREATE INDEX IF NOT EXISTS idx_capi_event_log_created  ON capi_event_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_capi_event_log_name     ON capi_event_log(event_name);

ALTER TABLE capi_event_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "capi_event_log admin read" ON capi_event_log;
CREATE POLICY "capi_event_log admin read" ON capi_event_log
  FOR SELECT USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "capi_event_log admin all" ON capi_event_log;
CREATE POLICY "capi_event_log admin all" ON capi_event_log
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));


-- ─── 2. Co-purchase recommendations ────────────────────────────────────────
-- Materialized view: pair every two products that ever appeared together in
-- a paid order, with a count. We use a < b ordering so each pair appears once.
DROP MATERIALIZED VIEW IF EXISTS product_copurchases;
CREATE MATERIALIZED VIEW product_copurchases AS
SELECT
  oi1.product_id AS product_a,
  oi2.product_id AS product_b,
  COUNT(DISTINCT oi1.order_id) AS copurchase_count
FROM order_items oi1
JOIN order_items oi2
  ON oi1.order_id = oi2.order_id
 AND oi1.product_id < oi2.product_id
JOIN orders o
  ON oi1.order_id = o.id
 AND o.payment_status = 'paid'
GROUP BY oi1.product_id, oi2.product_id
HAVING COUNT(DISTINCT oi1.order_id) >= 2;

CREATE UNIQUE INDEX IF NOT EXISTS product_copurchases_pair_idx
  ON product_copurchases(product_a, product_b);
CREATE INDEX IF NOT EXISTS product_copurchases_a_idx ON product_copurchases(product_a);
CREATE INDEX IF NOT EXISTS product_copurchases_b_idx ON product_copurchases(product_b);

-- RPC: get top-N recommendations for a given product
CREATE OR REPLACE FUNCTION get_copurchase_recommendations(
  p_product_id uuid,
  p_limit      integer DEFAULT 4
)
RETURNS TABLE (product_id uuid, score bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    CASE
      WHEN cp.product_a = p_product_id THEN cp.product_b
      ELSE cp.product_a
    END AS product_id,
    cp.copurchase_count AS score
  FROM product_copurchases cp
  WHERE cp.product_a = p_product_id OR cp.product_b = p_product_id
  ORDER BY cp.copurchase_count DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION get_copurchase_recommendations(uuid, integer) TO anon, authenticated;

-- Refresh helper — safe to call from cron; uses CONCURRENTLY to avoid locks
CREATE OR REPLACE FUNCTION refresh_product_copurchases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_copurchases;
EXCEPTION WHEN OTHERS THEN
  -- CONCURRENTLY fails on first refresh (needs a unique index but also a row).
  -- Fall back to a plain refresh.
  REFRESH MATERIALIZED VIEW product_copurchases;
END;
$$;

GRANT EXECUTE ON FUNCTION refresh_product_copurchases() TO service_role;


-- ─── 3. Programmatic SEO pages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_authors (
  slug          text PRIMARY KEY,
  name          text NOT NULL,
  headshot_url  text,
  bio           text,
  twitter_url   text,
  linkedin_url  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template          text NOT NULL CHECK (template IN (
    'best', 'buying-guide', 'compare', 'gift-guide', 'how-to', 'under', 'tools'
  )),
  slug              text NOT NULL,
  h1                text NOT NULL,
  meta_title        text,
  meta_description  text NOT NULL,
  body_html         text NOT NULL,
  hero_image_url    text,
  og_image          text,
  author_slug       text REFERENCES seo_authors(slug) ON DELETE SET NULL,
  target_keywords   text[] NOT NULL DEFAULT '{}',
  product_slugs     text[] NOT NULL DEFAULT '{}', -- products to feature
  faq_schema        jsonb,                         -- [{question, answer}, …]
  itemlist_schema   jsonb,
  cluster           text,                          -- topical cluster name
  related_slugs     text[] NOT NULL DEFAULT '{}',
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at      timestamptz,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_pages_template_slug_unique UNIQUE (template, slug)
);

CREATE INDEX IF NOT EXISTS seo_pages_status_template_idx ON seo_pages(status, template);
CREATE INDEX IF NOT EXISTS seo_pages_cluster_idx          ON seo_pages(cluster) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS seo_pages_published_at_idx     ON seo_pages(published_at DESC) WHERE status = 'published';

ALTER TABLE seo_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages   ENABLE ROW LEVEL SECURITY;

-- Public can read all authors + only published pages
DROP POLICY IF EXISTS "seo_authors public read" ON seo_authors;
CREATE POLICY "seo_authors public read" ON seo_authors FOR SELECT USING (true);

DROP POLICY IF EXISTS "seo_pages public read published" ON seo_pages;
CREATE POLICY "seo_pages public read published" ON seo_pages
  FOR SELECT USING (status = 'published');

-- Admin write
DROP POLICY IF EXISTS "seo_authors admin all" ON seo_authors;
CREATE POLICY "seo_authors admin all" ON seo_authors
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "seo_pages admin all" ON seo_pages;
CREATE POLICY "seo_pages admin all" ON seo_pages
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_role_cache WHERE user_id = auth.uid()));

-- updated_at trigger so dateModified in JSON-LD stays fresh
CREATE OR REPLACE FUNCTION seo_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS seo_pages_updated_at ON seo_pages;
CREATE TRIGGER seo_pages_updated_at BEFORE UPDATE ON seo_pages
  FOR EACH ROW EXECUTE FUNCTION seo_set_updated_at();

DROP TRIGGER IF EXISTS seo_authors_updated_at ON seo_authors;
CREATE TRIGGER seo_authors_updated_at BEFORE UPDATE ON seo_authors
  FOR EACH ROW EXECUTE FUNCTION seo_set_updated_at();

-- Seed one author so admins have a default byline
INSERT INTO seo_authors (slug, name, bio)
VALUES (
  'pet-and-angels-team',
  'Pet and Angels Team',
  'A team of pet parents, vets, and product testers who personally try every product before recommending it.'
) ON CONFLICT (slug) DO NOTHING;
