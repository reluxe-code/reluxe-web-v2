-- 019-member-preferences.sql
-- Add preferences JSONB to members for tox brand preference, external treatments, etc.

ALTER TABLE members ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Example shape:
-- {
--   "tox_brand": "Daxxify",
--   "external_tox": [{ "date": "2025-01-15", "brand": "Botox", "note": "Got at another provider" }]
-- }
