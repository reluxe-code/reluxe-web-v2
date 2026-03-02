-- 056-blvd-clients-drop-pii.sql
-- Phase 2: Drop raw PII columns from blvd_clients and members.
-- !! RUN ONLY AFTER all code is verified working with hash columns !!
-- !! This is IRREVERSIBLE — back up the database first !!

-- Drop PII index first
DROP INDEX IF EXISTS idx_blvd_clients_email;

-- Drop raw PII columns from blvd_clients
ALTER TABLE blvd_clients
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone;

-- Drop raw PII columns from members
ALTER TABLE members
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone;

-- Drop raw phone from concierge pipeline tables (dual-write removed in code)
ALTER TABLE concierge_queue DROP COLUMN IF EXISTS phone;
ALTER TABLE marketing_touches DROP COLUMN IF EXISTS phone;
