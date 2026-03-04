-- 071-service-cms.sql
-- Modular Service Engine & CMS Architecture
-- Creates tables for CMS-driven service pages with block-based content,
-- multi-category support, and per-location overrides.

-- ============================================================
-- 1. service_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  type            text NOT NULL CHECK (type IN ('functional', 'creative')),
  hero_image      text,
  description     text,
  seo_title       text,
  seo_description text,
  parent_id       uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  sort_order      integer DEFAULT 0,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_service_role"
  ON service_categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_categories_anon_read"
  ON service_categories FOR SELECT TO anon
  USING (active = true);

-- ============================================================
-- 2. cms_services
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_services (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL,
  tagline         text,
  hero_image      text,
  booking_slug    text,
  consult_slug    text,
  seo             jsonb DEFAULT '{}',
  status          text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  indexable       boolean DEFAULT true,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE cms_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_services_service_role"
  ON cms_services FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cms_services_anon_read"
  ON cms_services FOR SELECT TO anon
  USING (status = 'published');

-- ============================================================
-- 3. cms_service_categories (many-to-many junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_service_categories (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id   uuid NOT NULL REFERENCES cms_services(id) ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  sort_order   integer DEFAULT 0,
  UNIQUE(service_id, category_id)
);

ALTER TABLE cms_service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_service_categories_service_role"
  ON cms_service_categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cms_service_categories_anon_read"
  ON cms_service_categories FOR SELECT TO anon
  USING (true);

-- ============================================================
-- 4. cms_service_blocks (content blocks per service)
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_service_blocks (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id    uuid REFERENCES cms_services(id) ON DELETE CASCADE,
  block_type    text NOT NULL CHECK (block_type IN (
    'hero', 'quick_facts', 'overview', 'benefits',
    'results_gallery', 'how_it_works', 'candidates',
    'pricing_matrix', 'comparison', 'faq',
    'testimonials', 'providers', 'prep_aftercare',
    'flex_everything', 'booking_embed', 'location_copy',
    'custom_tool', 'custom_html'
  )),
  content       jsonb DEFAULT '{}',
  variant       text,
  enabled       boolean DEFAULT true,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_blocks_service
  ON cms_service_blocks(service_id, sort_order);

ALTER TABLE cms_service_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_service_blocks_service_role"
  ON cms_service_blocks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cms_service_blocks_anon_read"
  ON cms_service_blocks FOR SELECT TO anon
  USING (enabled = true);

-- ============================================================
-- 5. cms_location_overrides (per-location content)
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_location_overrides (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id      uuid NOT NULL REFERENCES cms_services(id) ON DELETE CASCADE,
  location_key    text NOT NULL CHECK (location_key IN ('westfield', 'carmel')),
  available       boolean DEFAULT true,
  description     text,
  differences     jsonb DEFAULT '[]',
  faqs            jsonb DEFAULT '[]',
  seo_title       text,
  seo_description text,
  complementary   jsonb DEFAULT '[]',
  alternatives    jsonb DEFAULT '[]',
  extra           jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(service_id, location_key)
);

CREATE INDEX IF NOT EXISTS idx_cms_loc_service
  ON cms_location_overrides(service_id, location_key);

ALTER TABLE cms_location_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_location_overrides_service_role"
  ON cms_location_overrides FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cms_location_overrides_anon_read"
  ON cms_location_overrides FOR SELECT TO anon
  USING (true);

-- ============================================================
-- 6. updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION cms_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_categories_updated
  BEFORE UPDATE ON service_categories
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_services_updated
  BEFORE UPDATE ON cms_services
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_service_blocks_updated
  BEFORE UPDATE ON cms_service_blocks
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();

CREATE TRIGGER trg_cms_location_overrides_updated
  BEFORE UPDATE ON cms_location_overrides
  FOR EACH ROW EXECUTE FUNCTION cms_set_updated_at();
