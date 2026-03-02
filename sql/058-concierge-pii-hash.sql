-- 058-concierge-pii-hash.sql
-- Phase 3: Add hash columns to concierge/marketing tables.
-- concierge_queue.phone stays as nullable text (encrypted in app code, nulled after send).

-- ============================================================
-- STEP 1: Add hash columns (safe to run immediately)
-- ============================================================

-- marketing_touches: hash for frequency cap / negative signal lookups
ALTER TABLE marketing_touches
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_mt_phone_hash_v1
  ON marketing_touches (phone_hash_v1, created_at DESC)
  WHERE phone_hash_v1 IS NOT NULL;

-- client_channel_status: hash for opt-out lookups
ALTER TABLE client_channel_status
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_ccs_phone_hash_v1
  ON client_channel_status (phone_hash_v1, channel)
  WHERE phone_hash_v1 IS NOT NULL;

-- concierge_queue: add encrypted phone, boulevard_id, phone_hash for Zero-PHI pipeline
ALTER TABLE concierge_queue
  ADD COLUMN IF NOT EXISTS phone_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS boulevard_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT;

-- ============================================================
-- STEP 2: Backfill hashes
-- SET app.pii_salt = '<salt>'; SET app.pii_pepper = '<pepper>';
-- ============================================================

UPDATE marketing_touches SET
  phone_hash_v1 = encode(hmac(
    right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;

UPDATE client_channel_status SET
  phone_hash_v1 = encode(hmac(
    right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;

-- ============================================================
-- STEP 3: Drop raw phone columns (AFTER verification)
-- ============================================================
-- ALTER TABLE marketing_touches DROP COLUMN IF EXISTS phone;
-- ALTER TABLE client_channel_status DROP COLUMN IF EXISTS phone;
