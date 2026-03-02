-- 059-leads-pii-hash.sql
-- Phase 4A: Add hash columns to leads table for Zero-PHI migration.

-- ============================================================
-- STEP 1: Add hash columns
-- ============================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS email_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_phone_hash_v1
  ON leads (phone_hash_v1) WHERE phone_hash_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_email_hash_v1
  ON leads (email_hash_v1) WHERE email_hash_v1 IS NOT NULL;

-- ============================================================
-- STEP 2: Backfill hashes
-- SET app.pii_salt = '<salt>'; SET app.pii_pepper = '<pepper>';
-- ============================================================

UPDATE leads SET
  phone_hash_v1 = encode(hmac(
    right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;

UPDATE leads SET
  email_hash_v1 = encode(hmac(
    lower(trim(email)) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE email IS NOT NULL AND email_hash_v1 IS NULL;

-- ============================================================
-- STEP 3: Drop raw PII columns (AFTER verification)
-- ============================================================
-- ALTER TABLE leads DROP COLUMN IF EXISTS phone;
-- ALTER TABLE leads DROP COLUMN IF EXISTS email;
-- ALTER TABLE leads DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE leads DROP COLUMN IF EXISTS last_name;
