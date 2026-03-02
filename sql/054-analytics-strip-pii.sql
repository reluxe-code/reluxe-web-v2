-- 054-analytics-strip-pii.sql
-- Phase 1: Add versioned hash columns to analytics tables, backfill, drop raw PII.
-- Run backfill AFTER deploying dual-write code. Drop PII columns AFTER verification.
-- Requires pgcrypto extension (already enabled in Supabase).

-- ============================================================
-- STEP 1: Add hash columns (safe to run immediately)
-- ============================================================

-- booking_sessions: replace contact_phone / contact_email with hashes
ALTER TABLE booking_sessions
  ADD COLUMN IF NOT EXISTS contact_phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS contact_email_hash_v1 TEXT;

CREATE INDEX IF NOT EXISTS idx_bs_phone_hash_v1
  ON booking_sessions (contact_phone_hash_v1) WHERE contact_phone_hash_v1 IS NOT NULL;

-- experiment_sessions: replace contact_phone, client_name, client_email with hashes/initials
ALTER TABLE experiment_sessions
  ADD COLUMN IF NOT EXISTS contact_phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS client_email_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS client_name_initial TEXT;  -- "K." instead of "Kyle"

-- ============================================================
-- STEP 2: Backfill hashes from existing PII
-- Run this AFTER dual-write code is deployed.
-- Set the salt and pepper as session variables before running:
--   SET app.pii_salt = '<your_PATIENT_DATA_SALT>';
--   SET app.pii_pepper = '<your_PATIENT_DATA_PEPPER>';
-- ============================================================

-- booking_sessions backfill
UPDATE booking_sessions SET
  contact_phone_hash_v1 = encode(hmac(
    right(regexp_replace(contact_phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE contact_phone IS NOT NULL AND contact_phone_hash_v1 IS NULL;

UPDATE booking_sessions SET
  contact_email_hash_v1 = encode(hmac(
    lower(trim(contact_email)) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE contact_email IS NOT NULL AND contact_email_hash_v1 IS NULL;

-- experiment_sessions backfill
UPDATE experiment_sessions SET
  contact_phone_hash_v1 = encode(hmac(
    right(regexp_replace(contact_phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE contact_phone IS NOT NULL AND contact_phone_hash_v1 IS NULL;

UPDATE experiment_sessions SET
  client_email_hash_v1 = encode(hmac(
    lower(trim(client_email)) || current_setting('app.pii_pepper'),
    current_setting('app.pii_salt'), 'sha256'), 'hex')
WHERE client_email IS NOT NULL AND client_email_hash_v1 IS NULL;

UPDATE experiment_sessions SET
  client_name_initial = left(client_name, 1) || '.'
WHERE client_name IS NOT NULL AND client_name_initial IS NULL;

-- ============================================================
-- STEP 3: Drop raw PII columns
-- Run ONLY after verifying hash-based lookups work correctly.
-- ============================================================

-- Drop the PII index first
-- DROP INDEX IF EXISTS idx_bs_contact;

-- Then drop columns
-- ALTER TABLE booking_sessions DROP COLUMN IF EXISTS contact_phone;
-- ALTER TABLE booking_sessions DROP COLUMN IF EXISTS contact_email;

-- ALTER TABLE experiment_sessions DROP COLUMN IF EXISTS contact_phone;
-- ALTER TABLE experiment_sessions DROP COLUMN IF EXISTS client_name;
-- ALTER TABLE experiment_sessions DROP COLUMN IF EXISTS client_email;
