-- 037-concierge-engine.sql
-- Agentic Retention Engine: marketing_touches, concierge_queue,
-- concierge_links, concierge_campaigns, concierge_rpm view.

-- ============================================================
-- 1. marketing_touches — every outbound marketing SMS
-- ============================================================
CREATE TABLE IF NOT EXISTS marketing_touches (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID REFERENCES blvd_clients(id),
  phone         TEXT NOT NULL,
  campaign_slug TEXT NOT NULL,
  cohort        TEXT NOT NULL,
  variant       TEXT,
  sms_body      TEXT NOT NULL,
  link_token    TEXT,
  status        TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent','delivered','clicked','booked','failed')),
  revenue       DECIMAL(10,2) DEFAULT 0,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at  TIMESTAMPTZ,
  clicked_at    TIMESTAMPTZ,
  booked_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mt_client ON marketing_touches(client_id);
CREATE INDEX IF NOT EXISTS idx_mt_phone_sent ON marketing_touches(phone, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_mt_campaign ON marketing_touches(campaign_slug, sent_at);
CREATE INDEX IF NOT EXISTS idx_mt_status ON marketing_touches(status);

ALTER TABLE marketing_touches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mt_service ON marketing_touches;
CREATE POLICY mt_service ON marketing_touches FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 2. concierge_queue — computed candidates awaiting approval
-- ============================================================
CREATE TABLE IF NOT EXISTS concierge_queue (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id        TEXT NOT NULL,
  client_id       UUID REFERENCES blvd_clients(id),
  phone           TEXT NOT NULL,
  campaign_slug   TEXT NOT NULL,
  cohort          TEXT NOT NULL,
  priority        INT NOT NULL,
  variant         TEXT NOT NULL DEFAULT 'A',
  sms_body        TEXT NOT NULL,
  logic_trace     JSONB NOT NULL DEFAULT '[]',
  booking_url     TEXT,
  link_token      TEXT,

  -- Provider + service context
  provider_staff_id UUID,
  provider_name   TEXT,
  service_name    TEXT,
  location_key    TEXT,

  -- Recency + segmentation context
  days_overdue    INT,
  avg_interval    INT,

  -- Status management
  status          TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready','flagged','approved','sent','expired','skipped')),
  flag_reason     TEXT
    CHECK (flag_reason IS NULL OR flag_reason IN (
      'CAP_REACHED','ALREADY_BOOKED','QUIET_HOURS',
      'NEGATIVE_SIGNAL_SUPPRESSION','NO_PROVIDER_AVAILABILITY','SEND_FAILED'
    )),

  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_cq_batch ON concierge_queue(batch_id);
CREATE INDEX IF NOT EXISTS idx_cq_status ON concierge_queue(status);
CREATE INDEX IF NOT EXISTS idx_cq_client ON concierge_queue(client_id);
CREATE INDEX IF NOT EXISTS idx_cq_campaign ON concierge_queue(campaign_slug);
CREATE INDEX IF NOT EXISTS idx_cq_priority ON concierge_queue(priority, status);

ALTER TABLE concierge_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cq_service ON concierge_queue;
CREATE POLICY cq_service ON concierge_queue FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 3. concierge_links — short-lived single-use booking tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS concierge_links (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token        TEXT UNIQUE NOT NULL,
  client_id    UUID REFERENCES blvd_clients(id),
  destination  TEXT NOT NULL,
  utm_source   TEXT DEFAULT 'reluxe_concierge',
  utm_medium   TEXT DEFAULT 'sms',
  utm_campaign TEXT,
  utm_content  TEXT,
  used         BOOLEAN NOT NULL DEFAULT false,
  used_at      TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cl_token ON concierge_links(token);
CREATE INDEX IF NOT EXISTS idx_cl_expires ON concierge_links(expires_at) WHERE NOT used;

ALTER TABLE concierge_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cl_service ON concierge_links;
CREATE POLICY cl_service ON concierge_links FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 4. concierge_campaigns — A/B test config per cohort
-- ============================================================
CREATE TABLE IF NOT EXISTS concierge_campaigns (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_slug       TEXT UNIQUE NOT NULL,
  cohort              TEXT NOT NULL,
  priority            INT NOT NULL,
  active              BOOLEAN NOT NULL DEFAULT true,
  variant_a_template  TEXT NOT NULL,
  variant_b_template  TEXT,
  ab_split            DECIMAL(3,2) DEFAULT 0.50,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Note: Footer (RELUXE Med Spa branding, reply/call CTA, STOP opt-out) is auto-appended by smsBuilder.js.
-- Templates should stay ≤ 240 chars to fit within 2 SMS segments (320 chars) with footer.
INSERT INTO concierge_campaigns (campaign_slug, cohort, priority, variant_a_template, variant_b_template) VALUES
  ('tox_journey', 'P1', 1,
   'Hi {{first_name}}, it''s been {{days_overdue}} days since your last tox with {{provider_name}}. Ready for a refresh? {{credit_reminder}}Book now: {{booking_link}}',
   'Hey {{first_name}}, {{provider_name}} has openings this week for your tox touch-up. Don''t wait too long! {{credit_reminder}}Book here: {{booking_link}}'),
  ('voucher_recovery', 'P2', 2,
   'Hi {{first_name}}, you have an unused {{voucher_service}} voucher from your membership! {{provider_name}} has availability. {{credit_reminder}}Book now: {{booking_link}}',
   '{{first_name}}, don''t let your {{voucher_service}} voucher go to waste! {{provider_name}} can see you this week. {{credit_reminder}}Book here: {{booking_link}}'),
  ('aesthetic_winback', 'P3', 3,
   'Hi {{first_name}}, it''s been about 60 days since your {{service_name}} with {{provider_name}}. Time for your next glow-up! {{credit_reminder}}Book now: {{booking_link}}',
   'Miss that post-facial glow, {{first_name}}? {{provider_name}} has openings for your next {{service_name}}. {{credit_reminder}}Book here: {{booking_link}}'),
  ('last_minute_gap', 'P4', 4,
   'Hi {{first_name}}, a same-day opening just appeared with {{provider_name}} at our {{location_name}} location! {{credit_reminder}}Grab it: {{booking_link}}',
   '{{first_name}}, {{provider_name}} just had a cancellation at {{location_name}}. Want the spot? {{credit_reminder}}Book now: {{booking_link}}')
ON CONFLICT (campaign_slug) DO NOTHING;

ALTER TABLE concierge_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cc_service ON concierge_campaigns;
CREATE POLICY cc_service ON concierge_campaigns FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 5. View: concierge_rpm — Revenue Per Message last 30 days
-- ============================================================
CREATE OR REPLACE VIEW concierge_rpm AS
SELECT
  campaign_slug,
  cohort,
  variant,
  COUNT(*)                                          AS messages_sent,
  COUNT(*) FILTER (WHERE status = 'clicked')        AS clicks,
  COUNT(*) FILTER (WHERE status = 'booked')         AS conversions,
  COALESCE(SUM(revenue), 0)                         AS total_revenue,
  CASE WHEN COUNT(*) > 0
    THEN ROUND((COALESCE(SUM(revenue), 0) / COUNT(*))::NUMERIC, 2)
    ELSE 0
  END                                               AS rpm,
  CASE WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE status = 'booked'))::NUMERIC / COUNT(*)::NUMERIC * 100, 1)
    ELSE 0
  END                                               AS conversion_rate
FROM marketing_touches
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY campaign_slug, cohort, variant;


-- ============================================================
-- 6. Feature flag in site_config
-- ============================================================
INSERT INTO site_config (key, value) VALUES
  ('concierge_engine', '{
    "enabled": true,
    "quiet_start_hour": 10,
    "quiet_end_hour": 19,
    "max_touches_per_week": 2,
    "timezone": "America/New_York"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
