-- 043: Package catalog table + fix package sync.
--
-- Boulevard's `packages` API returns catalog TEMPLATES (what you sell),
-- not purchased instances (who bought what). This migration:
-- 1. Creates blvd_package_catalog for synced catalog data
-- 2. Keeps blvd_packages for client-level purchases (populated via import)
-- 3. Makes client_boulevard_id nullable (not available from catalog sync)

-- ── 1. Package catalog table (synced from Boulevard API) ─────
CREATE TABLE IF NOT EXISTS blvd_package_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  unit_price INTEGER DEFAULT 0,
  vouchers JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Fix blvd_packages — make client_boulevard_id nullable ─
-- (It was NOT NULL but we populate via import, not Boulevard API)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blvd_packages' AND column_name = 'client_boulevard_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE blvd_packages ALTER COLUMN client_boulevard_id DROP NOT NULL;
  END IF;
END $$;
