-- 062-drop-appointment-notes.sql
-- Phase 5: NULL out appointment notes and cancellation_reason (potential PHI).
-- These free-text fields may contain treatment details and are not used
-- in concierge logic, scoring, or any analytics queries.

-- NULL out existing values
UPDATE blvd_appointments SET notes = NULL WHERE notes IS NOT NULL;
UPDATE blvd_appointments SET cancellation_reason = NULL WHERE cancellation_reason IS NOT NULL;

-- Optionally drop the columns entirely:
-- ALTER TABLE blvd_appointments DROP COLUMN IF EXISTS notes;
-- ALTER TABLE blvd_appointments DROP COLUMN IF EXISTS cancellation_reason;
