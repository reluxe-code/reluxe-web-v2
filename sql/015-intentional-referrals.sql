-- 015-intentional-referrals.sql
-- Add 'invited' status for intentional referrals (name + phone).
-- Add referee_first_name for display.
-- Run in Supabase SQL Editor.

-- Drop and recreate the status CHECK constraint to include 'invited'
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE referrals ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('invited','clicked','booked','completed','credited','cancelled','expired','fraud_rejected'));

-- Add referee_first_name for intentional referral display
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referee_first_name TEXT;

-- Add invited_at timestamp
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Index for phone-based matching of invited referrals
CREATE INDEX IF NOT EXISTS idx_ref_invited_phone ON referrals(referee_phone) WHERE status = 'invited';
