-- 030: Experiment analytics tables for A/B tests and campaign landing pages
-- First experiment: "This or That" swipe experience at /landing/thisorthat

-- Session-level tracking (one row per visitor)
CREATE TABLE IF NOT EXISTS experiment_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    TEXT UNIQUE NOT NULL,
  experiment_id TEXT NOT NULL DEFAULT 'thisorthat_v1',
  device_id     TEXT,

  -- Attribution
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  fbclid        TEXT,
  gclid         TEXT,

  -- Progress
  outcome       TEXT NOT NULL DEFAULT 'in_progress',
  abandon_phase TEXT,
  rounds_completed INT NOT NULL DEFAULT 0,

  -- Results
  persona_name       TEXT,
  persona_services   JSONB,
  is_heavy_responder BOOLEAN NOT NULL DEFAULT FALSE,
  choices            JSONB,
  scores             JSONB,

  -- Booking
  booking_started   BOOLEAN NOT NULL DEFAULT FALSE,
  booking_service   TEXT,
  booking_location  TEXT,
  booking_provider  TEXT,
  booking_completed BOOLEAN NOT NULL DEFAULT FALSE,
  appointment_id    TEXT,

  -- Membership
  membership_shown  BOOLEAN NOT NULL DEFAULT FALSE,
  membership_clicked BOOLEAN NOT NULL DEFAULT FALSE,

  -- Contact (phone only — no PII in events table)
  contact_phone TEXT,

  -- Timing
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  duration_ms   INT,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exp_sessions_experiment ON experiment_sessions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_sessions_outcome ON experiment_sessions(outcome);
CREATE INDEX IF NOT EXISTS idx_exp_sessions_started ON experiment_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_exp_sessions_persona ON experiment_sessions(persona_name);

-- Granular per-action events
CREATE TABLE IF NOT EXISTS experiment_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  TEXT NOT NULL,
  event_name  TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exp_events_session ON experiment_events(session_id);
CREATE INDEX IF NOT EXISTS idx_exp_events_name ON experiment_events(event_name);
CREATE INDEX IF NOT EXISTS idx_exp_events_created ON experiment_events(created_at);

-- RLS: allow service_role full access, no anon access
ALTER TABLE experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY exp_sessions_service ON experiment_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY exp_events_service ON experiment_events FOR ALL USING (true) WITH CHECK (true);
