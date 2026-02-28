-- 038: Add cg_token column to booking_sessions for concierge attribution.
-- Links concierge SMS click-throughs to booking sessions for RPM tracking.

ALTER TABLE booking_sessions ADD COLUMN IF NOT EXISTS cg_token TEXT;

CREATE INDEX IF NOT EXISTS idx_bs_cg_token ON booking_sessions(cg_token) WHERE cg_token IS NOT NULL;
