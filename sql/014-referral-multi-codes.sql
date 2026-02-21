-- 014-referral-multi-codes.sql
-- Allow members to have up to 5 referral codes (custom vanity codes).
-- The original auto-generated code stays; members can add up to 4 more custom codes.
-- Run in Supabase SQL Editor.

-- Drop the UNIQUE constraint on member_id so multiple codes per member are allowed
ALTER TABLE referral_codes DROP CONSTRAINT IF EXISTS referral_codes_member_id_key;

-- Add an index for member_id lookups (replaces the implicit unique index)
CREATE INDEX IF NOT EXISTS idx_rc_member_multi ON referral_codes(member_id);

-- Add is_primary column to distinguish the auto-generated code from custom ones
ALTER TABLE referral_codes ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark all existing codes as primary
UPDATE referral_codes SET is_primary = TRUE WHERE is_primary = FALSE;
