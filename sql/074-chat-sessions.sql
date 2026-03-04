-- 074-chat-sessions.sql
-- AI Chat Concierge session metadata. NO message content stored.
-- Only structural/operational data for analytics and abuse detection.

CREATE TABLE IF NOT EXISTS chat_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token    TEXT UNIQUE NOT NULL,
  ip_hash          TEXT,                    -- HMAC hash of IP (not raw)
  user_agent       TEXT,
  location_key     TEXT,
  referrer_path    TEXT,
  message_count    INT NOT NULL DEFAULT 0,
  tool_calls       JSONB NOT NULL DEFAULT '[]',
  total_input_tokens  INT NOT NULL DEFAULT 0,
  total_output_tokens INT NOT NULL DEFAULT 0,
  outcome          TEXT DEFAULT 'active'
    CHECK (outcome IN (
      'active', 'completed', 'booking_started',
      'booking_completed', 'sms_fallback', 'abandoned', 'rate_limited'
    )),
  booking_cart_id  TEXT,
  sms_sent         BOOLEAN NOT NULL DEFAULT false,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_started
  ON chat_sessions (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_outcome
  ON chat_sessions (outcome);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions_service_role"
  ON chat_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Seed chat_enabled toggle (defaults to enabled)
INSERT INTO site_config (key, value) VALUES (
  'chat_enabled',
  '{"enabled": true}'::jsonb
) ON CONFLICT (key) DO NOTHING;
