-- 060-members-pii-hash.sql
-- Phase 4B: Members table hash columns.
-- NOTE: Hash columns + indexes were already added in 055 for members.
-- This migration handles backfill only if not already done.

-- Backfill is already handled in 055-blvd-clients-pii-hash.sql.
-- This file exists for documentation and for the DROP step.

-- ============================================================
-- STEP 3: Drop raw PII columns (AFTER verification)
-- ============================================================
-- (Already handled in 056-blvd-clients-drop-pii.sql which drops members PII too)
