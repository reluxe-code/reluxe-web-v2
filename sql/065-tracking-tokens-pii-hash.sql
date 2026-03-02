-- 065-tracking-tokens-pii-hash.sql
-- Add hash columns to tracking_tokens, drop raw PII.
-- Run AFTER code changes are deployed (generate.js already writes hashes).

-- Add hash columns
ALTER TABLE tracking_tokens
  ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT,
  ADD COLUMN IF NOT EXISTS email_hash_v1 TEXT;

-- Index for hash-based dedup lookups
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_phone_hash
  ON tracking_tokens (phone_hash_v1) WHERE phone_hash_v1 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tracking_tokens_email_hash
  ON tracking_tokens (email_hash_v1) WHERE email_hash_v1 IS NOT NULL;

-- Drop raw PII columns + old index (run AFTER verification)
DROP INDEX IF EXISTS idx_tracking_tokens_phone;
ALTER TABLE tracking_tokens
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS email;
