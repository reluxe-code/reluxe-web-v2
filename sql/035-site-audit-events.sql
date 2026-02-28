-- 035-site-audit-events.sql
-- Client-side audit event tracking: errors, 404s, login failures, booking fallbacks.
-- Run in Supabase SQL Editor.

CREATE TABLE site_audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,
  message     TEXT,
  metadata    JSONB DEFAULT '{}',
  url         TEXT,
  user_agent  TEXT,
  device_id   TEXT,
  member_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sae_type ON site_audit_events(event_type);
CREATE INDEX idx_sae_created ON site_audit_events(created_at);
CREATE INDEX idx_sae_type_created ON site_audit_events(event_type, created_at);

ALTER TABLE site_audit_events ENABLE ROW LEVEL SECURITY;

-- Service role can insert and read; no public access.
CREATE POLICY "Service role full access site_audit_events"
  ON site_audit_events FOR ALL
  USING (true)
  WITH CHECK (true);
