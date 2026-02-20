-- 003-boulevard-ids.sql
-- Add Boulevard provider ID and service mapping to staff table
-- for custom booking system integration.

-- Links each provider to their Boulevard staff ID
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS boulevard_provider_id TEXT;

-- Maps service slugs to Boulevard CartAvailableBookableItem IDs per location
-- Example shape:
-- {
--   "tox": { "westfield": "urn:blvd:CartAvailableBookableItem:abc", "carmel": "urn:blvd:CartAvailableBookableItem:def" },
--   "filler": { "westfield": "...", "carmel": "..." }
-- }
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS boulevard_service_map JSONB DEFAULT '{}';

-- Index for looking up staff by Boulevard provider ID
CREATE INDEX IF NOT EXISTS idx_staff_blvd_provider_id
  ON staff (boulevard_provider_id)
  WHERE boulevard_provider_id IS NOT NULL;
