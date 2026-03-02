-- 068-leads-drop-pii.sql
-- Phase 2: Drop raw PII columns from leads.
-- !! RUN ONLY AFTER backfill + code deploy verified !!
-- !! This is IRREVERSIBLE — back up the database first !!

-- Drop PII indexes that reference raw columns
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_phone;

-- Drop raw PII columns
ALTER TABLE leads
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS last_name;
