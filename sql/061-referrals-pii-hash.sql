-- 061-referrals-pii-hash.sql
-- Phase 4C: Add hash columns to referral_attributions if phone is stored.

-- Check if referral_attributions has a phone column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_attributions' AND column_name = 'phone'
  ) THEN
    ALTER TABLE referral_attributions ADD COLUMN IF NOT EXISTS phone_hash_v1 TEXT;

    -- Backfill (requires SET app.pii_salt and app.pii_pepper)
    -- UPDATE referral_attributions SET
    --   phone_hash_v1 = encode(hmac(
    --     right(regexp_replace(phone, '\D', '', 'g'), 10) || current_setting('app.pii_pepper'),
    --     current_setting('app.pii_salt'), 'sha256'), 'hex')
    -- WHERE phone IS NOT NULL AND phone_hash_v1 IS NULL;
  END IF;
END $$;

-- Also check referral_codes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referral_codes' AND column_name = 'referee_phone'
  ) THEN
    ALTER TABLE referral_codes ADD COLUMN IF NOT EXISTS referee_phone_hash_v1 TEXT;
  END IF;
END $$;
