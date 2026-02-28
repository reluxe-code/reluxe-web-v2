-- 034-bird-sync-log.sql
-- Audit log for all Bird CRM sync attempts (success and failure).
-- Run in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS bird_sync_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid,
  phone text,
  email text,
  action text NOT NULL,           -- 'upsert', 'retry', 'batch_sync'
  status text NOT NULL,           -- 'success', 'failed'
  error_detail text,
  bird_contact_id text,
  source text,                    -- 'checkout', 'leads_capture', 'leads_ingest', 'admin_sync'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bird_sync_log_created ON bird_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bird_sync_log_status ON bird_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_bird_sync_log_source ON bird_sync_log(source);
