-- 076-search-events.sql
-- Search analytics: tracks queries, result counts, and click-throughs.
-- NO PII stored — session identified by anonymous device fingerprint only.

CREATE TABLE IF NOT EXISTS search_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL CHECK (event_type IN ('query', 'click', 'suggestion_click')),

  -- Query context
  query           TEXT NOT NULL,
  query_normalized TEXT NOT NULL,
  result_count    INT NOT NULL DEFAULT 0,

  -- Click context (only for event_type = 'click' or 'suggestion_click')
  clicked_url     TEXT,
  clicked_title   TEXT,
  clicked_type    TEXT,
  click_position  INT,

  -- Facet/filter context
  active_filter   TEXT,

  -- Session context (NO PII)
  device_id       TEXT,
  session_id      TEXT,
  source          TEXT DEFAULT 'overlay' CHECK (source IN ('overlay', 'page', 'keyboard_shortcut')),
  page_path       TEXT,

  -- Timing
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_search_events_created   ON search_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_type      ON search_events (event_type);
CREATE INDEX IF NOT EXISTS idx_search_events_query     ON search_events (query_normalized);
CREATE INDEX IF NOT EXISTS idx_search_events_zero      ON search_events (result_count) WHERE result_count = 0;
CREATE INDEX IF NOT EXISTS idx_search_events_device    ON search_events (device_id, created_at DESC);

-- RLS
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_events_service_role"
  ON search_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);
