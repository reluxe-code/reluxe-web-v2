-- 006-blvd-catalog.sql
-- Boulevard service catalog cache.
-- Stores all bookable services from Boulevard so admin can search/pick them
-- without hitting the Boulevard API on every page load.

CREATE TABLE IF NOT EXISTS blvd_service_catalog (
  id TEXT PRIMARY KEY,              -- Boulevard URN ID (urn:blvd:CartAvailableBookableItem:...)
  name TEXT NOT NULL,
  category_name TEXT,
  location_key TEXT NOT NULL,       -- 'westfield' or 'carmel'
  description TEXT,
  duration_min INT,
  duration_max INT,
  price_min INT,
  price_max INT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for location filtering
CREATE INDEX IF NOT EXISTS idx_catalog_location
  ON blvd_service_catalog (location_key);

-- RLS: public read, service-role write
ALTER TABLE blvd_service_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read catalog"
  ON blvd_service_catalog FOR SELECT
  USING (true);

CREATE POLICY "Service role write catalog"
  ON blvd_service_catalog FOR ALL
  USING (true)
  WITH CHECK (true);
