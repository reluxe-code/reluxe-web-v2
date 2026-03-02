-- 067-leads-encrypt-phone.sql
-- Phase 1: Add encrypted phone column to leads.
-- AES-256-GCM encryption done in application code (piiHash.js).

ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_encrypted TEXT;
