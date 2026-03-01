-- 048-social-engine.sql
-- Social Availability Engine: converts calendar gaps into IG Story campaigns.

-- ============================================================
-- 1. social_campaigns — each IG Story availability push
-- ============================================================
CREATE TABLE IF NOT EXISTS social_campaigns (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Provider context
  provider_slug       TEXT NOT NULL,
  provider_name       TEXT NOT NULL,

  -- Location + service
  location_key        TEXT NOT NULL,
  service_slug        TEXT NOT NULL,
  service_name        TEXT,

  -- Promoted slots: [{ date, startTime, label }]
  time_slots          JSONB NOT NULL DEFAULT '[]',

  -- IG / ManyChat config
  keyword             TEXT NOT NULL,
  caption             TEXT,

  -- Generated assets
  image_url           TEXT,
  image_path          TEXT,
  booking_url         TEXT,
  link_token          TEXT,

  -- External sync
  manychat_synced     BOOLEAN NOT NULL DEFAULT false,
  manychat_synced_at  TIMESTAMPTZ,
  sms_sent            BOOLEAN NOT NULL DEFAULT false,
  sms_sent_at         TIMESTAMPTZ,

  -- Status lifecycle
  status              TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'sold_out', 'expired')),

  -- UTM tracking
  utm_params          JSONB NOT NULL DEFAULT '{}',

  -- Performance stats
  stats               JSONB NOT NULL DEFAULT '{"clicks": 0, "bookings": 0}',

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sc_status ON social_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sc_created ON social_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sc_provider ON social_campaigns(provider_slug);

ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sc_service ON social_campaigns;
CREATE POLICY sc_service ON social_campaigns FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 2. Config seed
-- ============================================================
INSERT INTO site_config (key, value) VALUES
  ('social_engine', '{
    "enabled": true,
    "default_keyword": "GLOW",
    "default_expiry_hours": 24,
    "manychat_field": "current_promo_link"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
