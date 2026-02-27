-- 032: Per-recipient identity tracking tokens for Bird SMS/email campaigns.
-- Maps opaque token -> bird_contact_id -> phone for attribution without PII in URLs.

CREATE TABLE IF NOT EXISTS tracking_tokens (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token            TEXT UNIQUE NOT NULL,
  bird_contact_id  TEXT,
  phone            TEXT,
  email            TEXT,
  synced_to_bird   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_tokens_phone ON tracking_tokens(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_bird ON tracking_tokens(bird_contact_id) WHERE bird_contact_id IS NOT NULL;

ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY tracking_tokens_service ON tracking_tokens FOR ALL USING (true) WITH CHECK (true);

-- Add tracking_token column to existing analytics tables
ALTER TABLE experiment_sessions ADD COLUMN IF NOT EXISTS tracking_token TEXT;
ALTER TABLE booking_sessions ADD COLUMN IF NOT EXISTS tracking_token TEXT;
