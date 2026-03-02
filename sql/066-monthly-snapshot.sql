-- 066-monthly-snapshot.sql
-- Tables for monthly snapshot report: tox unit usage tracking + service COGS mapping.

-- ============================================================
-- 1. Tox unit usage (imported from Boulevard inventory adjustments)
-- ============================================================
CREATE TABLE IF NOT EXISTS tox_unit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,        -- QuantityAdjustment id (dedup key)
  product_name TEXT NOT NULL,               -- "Botox Unit", "Dysport Unit", etc.
  brand TEXT NOT NULL,                      -- "Botox", "Dysport", "Jeuveau", "Daxxify"
  location_key TEXT,                        -- "westfield" / "carmel"
  units NUMERIC(10,2) NOT NULL,             -- units used (positive)
  cost_cents INT NOT NULL,                  -- COGS in cents (positive)
  service_date DATE NOT NULL,               -- date of usage
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tox_unit_usage_date ON tox_unit_usage (service_date);
CREATE INDEX IF NOT EXISTS idx_tox_unit_usage_brand ON tox_unit_usage (brand);
CREATE INDEX IF NOT EXISTS idx_tox_unit_usage_location ON tox_unit_usage (location_key);

ALTER TABLE tox_unit_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tox_unit_usage_service ON tox_unit_usage;
CREATE POLICY tox_unit_usage_service ON tox_unit_usage
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Service COGS mapping (manual per service_name)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_cogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT UNIQUE NOT NULL,
  cogs_cents INT NOT NULL DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE service_cogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_cogs_service ON service_cogs;
CREATE POLICY service_cogs_service ON service_cogs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
