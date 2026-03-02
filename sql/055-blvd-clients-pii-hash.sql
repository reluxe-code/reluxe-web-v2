-- 055-blvd-clients-pii-hash.sql
-- Phase 2A: Add versioned hash columns to blvd_clients for Zero-PHI migration.
-- Run STEP 1 immediately. Run STEP 2 backfill after dual-write code is deployed.

-- ============================================================
-- STEP 1: Add hash columns (safe to run immediately)
-- ============================================================

ALTER TABLE blvd_clients
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS email_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS phone_prefix_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_blvd_clients_phone_hash_v1
  ON blvd_clients (phone_hash_v1) WHERE phone_hash_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blvd_clients_email_hash_v1
  ON blvd_clients (email_hash_v1) WHERE email_hash_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blvd_clients_phone_prefix_v1
  ON blvd_clients (phone_prefix_hash_v1) WHERE phone_prefix_hash_v1 IS NOT NULL;

-- Also add hash columns to members table (Phase 4 prep)
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS email_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_members_phone_hash_v1
  ON members (phone_hash_v1) WHERE phone_hash_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_members_email_hash_v1
  ON members (email_hash_v1) WHERE email_hash_v1 IS NOT NULL;

-- ============================================================
-- STEP 2: Backfill hashes from existing PII
-- Run AFTER dual-write code is deployed.
-- Set session variables first:
--   SET app.pii_salt = '<your_PATIENT_DATA_SALT>';
--   SET app.pii_pepper = '<your_PATIENT_DATA_PEPPER>';
-- ============================================================

-- blvd_clients backfill
UPDATE blvd_clients SET
  phone_hash_v1 = encode(hmac(
    right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex'),
  phone_prefix_hash_v1 = encode(hmac(
    left(right(regexp_replace(phone, '\D', '', 'g'), 10), 6) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;

UPDATE blvd_clients SET
  email_hash_v1 = encode(hmac(
    lower(trim(email)) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE email IS NOT NULL AND email_hash_v1 IS NULL;

-- members backfill
UPDATE members SET
  phone_hash_v1 = encode(hmac(
    right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;

UPDATE members SET
  email_hash_v1 = encode(hmac(
    lower(trim(email)) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE email IS NOT NULL AND email_hash_v1 IS NULL;
