-- 033-leads-bird-sync.sql
-- Add Bird CRM sync tracking to leads table.
-- Run in Supabase SQL Editor.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS bird_contact_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS synced_to_bird BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_leads_bird_sync
  ON leads(synced_to_bird) WHERE synced_to_bird = FALSE;

CREATE INDEX IF NOT EXISTS idx_leads_bird_contact
  ON leads(bird_contact_id) WHERE bird_contact_id IS NOT NULL;
