-- 021-widget-events.sql
-- Tracks user interactions with inspiration article widgets.

CREATE TABLE IF NOT EXISTS widget_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name    TEXT NOT NULL,                    -- e.g. 'quiz_complete', 'calculator_use', 'slider_interact'
  widget_type   TEXT NOT NULL,                    -- component name: 'QuizAssessment', 'CostCalculator', etc.
  article_slug  TEXT,                             -- which article the widget was embedded in
  metadata      JSONB DEFAULT '{}'::jsonb,        -- flexible event data (quiz result, calculator values, etc.)
  device_id     TEXT,                             -- persistent device identifier from localStorage
  member_id     UUID REFERENCES members(id),      -- if logged in
  page_path     TEXT,                             -- window.location.pathname
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common dashboard queries
CREATE INDEX idx_widget_events_created ON widget_events (created_at DESC);
CREATE INDEX idx_widget_events_name    ON widget_events (event_name);
CREATE INDEX idx_widget_events_widget  ON widget_events (widget_type);
CREATE INDEX idx_widget_events_article ON widget_events (article_slug);

-- RLS
ALTER TABLE widget_events ENABLE ROW LEVEL SECURITY;

-- Public can insert (client-side tracking)
CREATE POLICY widget_events_insert ON widget_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only service role can read (admin dashboards)
CREATE POLICY widget_events_select ON widget_events
  FOR SELECT TO service_role USING (true);
