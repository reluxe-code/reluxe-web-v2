-- sql/016-referral-claimed-status.sql
-- Adds 'claimed' to referral status enum and claimed_at timestamp.
-- A claimed referral means the referee created an account and locked in their $25 credit.

ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_status_check;
ALTER TABLE referrals ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('invited','clicked','claimed','booked','completed','credited','cancelled','expired','fraud_rejected'));

ALTER TABLE referrals ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
