-- 051-engagement-scoring.sql
-- Engagement Scoring System: Bird webhook events, channel preferences,
-- opt-in/out tracking, engagement scores, and customer classification.

-- ============================================================
-- 1. bird_engagement_events — webhook event sink
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_engagement_events (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bird_message_id   TEXT,
  bird_contact_id   TEXT,
  channel           TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  event_type        TEXT NOT NULL CHECK (event_type IN (
    'accepted', 'delivered', 'delivery_failed',
    'opened', 'clicked', 'bounced',
    'unsubscribe_request', 'subscribe_consent',
    'spam_complaint', 'inbound_reply'
  )),
  phone             TEXT,
  email             TEXT,
  metadata          JSONB DEFAULT '{}',
  marketing_touch_id UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bee_contact ON bird_engagement_events(bird_contact_id);
CREATE INDEX IF NOT EXISTS idx_bee_phone ON bird_engagement_events(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bee_email ON bird_engagement_events(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bee_type ON bird_engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_bee_channel_created ON bird_engagement_events(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bee_message ON bird_engagement_events(bird_message_id) WHERE bird_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bee_created ON bird_engagement_events(created_at DESC);

ALTER TABLE bird_engagement_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bee_service ON bird_engagement_events;
CREATE POLICY bee_service ON bird_engagement_events FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 2. client_channel_status — opt-in/out per channel per client
-- ============================================================
CREATE TABLE IF NOT EXISTS client_channel_status (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id         UUID REFERENCES blvd_clients(id),
  phone             TEXT,
  email             TEXT,
  channel           TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'push')),
  status            TEXT NOT NULL DEFAULT 'subscribed'
    CHECK (status IN ('subscribed', 'unsubscribed', 'unknown')),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source            TEXT CHECK (source IN (
    'bird_webhook', 'manual_admin', 'user_preference', 'system_default', 'bird_sync'
  )),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per client+channel, one row per phone+channel
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccs_client_channel ON client_channel_status(client_id, channel)
  WHERE client_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccs_phone_channel ON client_channel_status(phone, channel)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ccs_client ON client_channel_status(client_id);
CREATE INDEX IF NOT EXISTS idx_ccs_phone ON client_channel_status(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ccs_email ON client_channel_status(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ccs_unsub ON client_channel_status(channel, status)
  WHERE status = 'unsubscribed';

ALTER TABLE client_channel_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ccs_service ON client_channel_status;
CREATE POLICY ccs_service ON client_channel_status FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 3. client_engagement_scores — cached composite scores per client
-- ============================================================
CREATE TABLE IF NOT EXISTS client_engagement_scores (
  client_id         UUID PRIMARY KEY REFERENCES blvd_clients(id),

  -- Dimension scores (0-100 each)
  score_sms         INT NOT NULL DEFAULT 0 CHECK (score_sms BETWEEN 0 AND 100),
  score_email       INT NOT NULL DEFAULT 0 CHECK (score_email BETWEEN 0 AND 100),
  score_web         INT NOT NULL DEFAULT 0 CHECK (score_web BETWEEN 0 AND 100),
  score_booking     INT NOT NULL DEFAULT 0 CHECK (score_booking BETWEEN 0 AND 100),
  score_membership  INT NOT NULL DEFAULT 0 CHECK (score_membership BETWEEN 0 AND 100),
  score_voucher     INT NOT NULL DEFAULT 0 CHECK (score_voucher BETWEEN 0 AND 100),
  score_product     INT NOT NULL DEFAULT 0 CHECK (score_product BETWEEN 0 AND 100),
  score_loyalty     INT NOT NULL DEFAULT 0 CHECK (score_loyalty BETWEEN 0 AND 100),

  -- Composite overall score (0-100)
  score_overall     INT NOT NULL DEFAULT 0 CHECK (score_overall BETWEEN 0 AND 100),

  -- Customer classification
  customer_type     TEXT NOT NULL DEFAULT 'new'
    CHECK (customer_type IN (
      'champion', 'loyal', 'promising', 'at_risk',
      'hibernating', 'lost', 'new'
    )),

  -- Preferred channel
  preferred_channel TEXT CHECK (preferred_channel IN ('sms', 'email', 'web', 'app', 'push')),
  channel_confidence NUMERIC(3,2) DEFAULT 0,

  -- Score breakdown for debugging/admin UI
  score_detail      JSONB DEFAULT '{}',

  -- Timestamps
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ces_overall ON client_engagement_scores(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_ces_type ON client_engagement_scores(customer_type);
CREATE INDEX IF NOT EXISTS idx_ces_channel ON client_engagement_scores(preferred_channel);
CREATE INDEX IF NOT EXISTS idx_ces_computed ON client_engagement_scores(computed_at);

ALTER TABLE client_engagement_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ces_service ON client_engagement_scores;
CREATE POLICY ces_service ON client_engagement_scores FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 4. bird_webhook_log — raw webhook payload audit log
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_webhook_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  processed   BOOLEAN NOT NULL DEFAULT false,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bwl_created ON bird_webhook_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bwl_unprocessed ON bird_webhook_log(processed) WHERE processed = false;

ALTER TABLE bird_webhook_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bwl_service ON bird_webhook_log;
CREATE POLICY bwl_service ON bird_webhook_log FOR ALL
  USING (true) WITH CHECK (true);


-- ============================================================
-- 5. Add Bird message ID to marketing_touches for webhook correlation
-- ============================================================
ALTER TABLE marketing_touches ADD COLUMN IF NOT EXISTS bird_message_id TEXT;
CREATE INDEX IF NOT EXISTS idx_mt_bird_msg ON marketing_touches(bird_message_id)
  WHERE bird_message_id IS NOT NULL;


-- ============================================================
-- 6. Expand concierge_queue flag_reason to include engagement flags
-- ============================================================
ALTER TABLE concierge_queue DROP CONSTRAINT IF EXISTS concierge_queue_flag_reason_check;
ALTER TABLE concierge_queue ADD CONSTRAINT concierge_queue_flag_reason_check
  CHECK (flag_reason IS NULL OR flag_reason IN (
    'CAP_REACHED','ALREADY_BOOKED','QUIET_HOURS',
    'NEGATIVE_SIGNAL_SUPPRESSION','NO_PROVIDER_AVAILABILITY','SEND_FAILED',
    'OPTED_OUT','LOW_ENGAGEMENT'
  ));


-- ============================================================
-- 7. Engagement scoring config in site_config
-- ============================================================
INSERT INTO site_config (key, value) VALUES
  ('engagement_scoring', '{
    "enabled": true,
    "recompute_interval_hours": 6,
    "scoring_weights": {
      "sms": 0.20,
      "email": 0.05,
      "web": 0.10,
      "booking": 0.30,
      "membership": 0.15,
      "voucher": 0.05,
      "product": 0.10,
      "loyalty": 0.05
    }
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- 8. View: client_engagement_overview — admin dashboard
-- ============================================================
CREATE OR REPLACE VIEW client_engagement_overview AS
SELECT
  c.id AS client_id,
  c.name,
  c.email,
  c.phone,
  c.visit_count,
  c.total_spend,
  c.last_visit_at,
  es.score_overall,
  es.score_sms,
  es.score_email,
  es.score_web,
  es.score_booking,
  es.score_membership,
  es.score_voucher,
  es.score_product,
  es.score_loyalty,
  es.customer_type,
  es.preferred_channel,
  es.channel_confidence,
  cs_sms.status AS sms_status,
  cs_email.status AS email_status,
  es.computed_at
FROM blvd_clients c
LEFT JOIN client_engagement_scores es ON es.client_id = c.id
LEFT JOIN client_channel_status cs_sms
  ON cs_sms.client_id = c.id AND cs_sms.channel = 'sms'
LEFT JOIN client_channel_status cs_email
  ON cs_email.client_id = c.id AND cs_email.channel = 'email';


-- ============================================================
-- 9. View: engagement_type_distribution — customer type stats
-- ============================================================
CREATE OR REPLACE VIEW engagement_type_distribution AS
SELECT
  customer_type,
  COUNT(*)::INT AS client_count,
  ROUND(AVG(score_overall))::INT AS avg_score,
  ROUND(AVG(score_booking))::INT AS avg_booking_score,
  ROUND(AVG(score_sms))::INT AS avg_sms_score,
  ROUND(AVG(score_membership))::INT AS avg_membership_score,
  ROUND(AVG(score_product))::INT AS avg_product_score
FROM client_engagement_scores
GROUP BY customer_type
ORDER BY avg_score DESC;
