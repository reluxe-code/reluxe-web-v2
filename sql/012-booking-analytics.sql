-- 012-booking-analytics.sql
-- Booking funnel analytics: session tracking + granular events.
-- Run in Supabase SQL Editor.

-- Session-level: one row per booking flow start
CREATE TABLE booking_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL UNIQUE,
  member_id       UUID REFERENCES members(id),
  device_id       TEXT,
  flow_type       TEXT NOT NULL CHECK (flow_type IN ('modal', 'provider_picker')),
  location_key    TEXT,
  outcome         TEXT NOT NULL DEFAULT 'in_progress'
                  CHECK (outcome IN ('in_progress', 'completed', 'abandoned', 'expired')),
  abandon_step    TEXT,
  max_step        TEXT NOT NULL DEFAULT 'HOME',
  steps_visited   TEXT[] DEFAULT '{}',
  step_count      INT NOT NULL DEFAULT 0,
  provider_name   TEXT,
  provider_id     TEXT,
  service_name    TEXT,
  service_id      TEXT,
  category_name   TEXT,
  bundle_title    TEXT,
  contact_phone   TEXT,
  contact_email   TEXT,
  duration_ms     INT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  page_path       TEXT,
  user_agent      TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bs_outcome ON booking_sessions(outcome);
CREATE INDEX idx_bs_started ON booking_sessions(started_at);
CREATE INDEX idx_bs_abandon ON booking_sessions(abandon_step) WHERE outcome = 'abandoned';
CREATE INDEX idx_bs_device ON booking_sessions(device_id);
CREATE INDEX idx_bs_contact ON booking_sessions(contact_phone)
  WHERE contact_phone IS NOT NULL AND outcome = 'abandoned';

ALTER TABLE booking_sessions ENABLE ROW LEVEL SECURITY;

-- Event-level: granular per-action rows
CREATE TABLE booking_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    TEXT NOT NULL,
  event_name    TEXT NOT NULL,
  step          TEXT NOT NULL,
  metadata      JSONB DEFAULT '{}',
  time_on_step  INT,
  step_index    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_be_session ON booking_events(session_id);
CREATE INDEX idx_be_event ON booking_events(event_name);
CREATE INDEX idx_be_created ON booking_events(created_at);

ALTER TABLE booking_events ENABLE ROW LEVEL SECURITY;
