-- 004-treatment-bundles.sql
-- Add optional treatment_bundles override column to staff table.
-- NULL = use global defaults from treatmentBundles.js
-- [] = bundles disabled (falls back to brandItems grid)
-- [{id, title, slugs}] = custom bundles for this provider

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS treatment_bundles JSONB DEFAULT NULL;

COMMENT ON COLUMN staff.treatment_bundles IS
  'Optional override for treatment bundles. NULL = use global defaults. [] = disabled.';
