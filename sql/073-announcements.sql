-- 073-announcements.sql
-- Admin-managed announcement popups (exit-intent, on-load, manual)

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  cta_label   TEXT NOT NULL DEFAULT 'Learn More',
  cta_url     TEXT NOT NULL DEFAULT '/',
  dismiss_label TEXT NOT NULL DEFAULT 'No thanks',

  -- Visual
  style       TEXT NOT NULL DEFAULT 'gradient'
    CHECK (style IN ('gradient', 'minimal', 'dark', 'neon')),
  image_url   TEXT,

  -- Trigger behaviour
  trigger     TEXT NOT NULL DEFAULT 'exit'
    CHECK (trigger IN ('load', 'exit', 'both')),
  delay_ms    INT NOT NULL DEFAULT 3000,
  frequency_days INT NOT NULL DEFAULT 7,

  -- Route targeting (NULL = all routes)
  include_routes TEXT[],
  exclude_routes TEXT[],

  -- Scheduling
  active      BOOLEAN NOT NULL DEFAULT false,
  start_date  DATE,
  end_date    DATE,
  priority    INT NOT NULL DEFAULT 0,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: public read for active announcements, service_role for writes
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active announcements"
  ON announcements FOR SELECT
  USING (active = true);

CREATE POLICY "Service role full access on announcements"
  ON announcements
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
