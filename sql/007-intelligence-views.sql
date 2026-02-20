-- 007-intelligence-views.sql
-- Intelligence views for Revenue Intelligence Engine.
-- Run after 004-appointments-sync.sql.
-- Uses regular views (not materialized) — fast enough for admin-only queries.

-- ============================================================
-- Postgres function: compute_client_lifecycle
-- Called by incremental sync to update client visit stats.
-- Accepts an array of client UUIDs.
-- ============================================================
CREATE OR REPLACE FUNCTION compute_client_lifecycle(client_ids UUID[])
RETURNS TABLE(client_id UUID, updated_visit_count INT) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      a.client_id AS cid,
      COUNT(*)::INT AS visit_count,
      MIN(a.start_at) AS first_visit,
      MAX(a.start_at) AS last_visit,
      COALESCE(SUM(s.price), 0) AS total_spend
    FROM blvd_appointments a
    LEFT JOIN blvd_appointment_services s ON s.appointment_id = a.id
    WHERE a.client_id = ANY(client_ids)
      AND a.status IN ('completed', 'final')
    GROUP BY a.client_id
  )
  UPDATE blvd_clients c SET
    visit_count = COALESCE(stats.visit_count, 0),
    total_spend = COALESCE(stats.total_spend, 0),
    first_visit_at = stats.first_visit,
    last_visit_at = stats.last_visit,
    updated_at = NOW()
  FROM stats
  WHERE c.id = stats.cid
  RETURNING c.id AS client_id, c.visit_count AS updated_visit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Indexes for intelligence query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blvd_appt_completed
  ON blvd_appointments (client_id, start_at)
  WHERE status IN ('completed', 'final');

CREATE INDEX IF NOT EXISTS idx_blvd_appt_svc_tox
  ON blvd_appointment_services (appointment_id)
  WHERE service_slug = 'tox';

CREATE INDEX IF NOT EXISTS idx_blvd_appt_svc_slug_price
  ON blvd_appointment_services (service_slug, price);

CREATE INDEX IF NOT EXISTS idx_blvd_appt_client_status
  ON blvd_appointments (client_id, status, start_at);

-- ============================================================
-- 1. client_visit_summary — per-client aggregate metrics
-- ============================================================
CREATE OR REPLACE VIEW client_visit_summary AS
SELECT
  c.id AS client_id,
  c.boulevard_id,
  c.first_name,
  c.last_name,
  c.name,
  c.email,
  c.phone,
  COALESCE(stats.total_visits, 0) AS total_visits,
  COALESCE(stats.total_spend, 0) AS total_spend,
  stats.first_visit,
  stats.last_visit,
  EXTRACT(DAY FROM NOW() - stats.last_visit)::INT AS days_since_last_visit,
  stats.avg_days_between_visits,
  stats.locations_visited,
  CASE
    WHEN COALESCE(stats.total_spend, 0) >= 5000 THEN 'vip'
    WHEN COALESCE(stats.total_spend, 0) >= 2000 THEN 'high'
    WHEN COALESCE(stats.total_spend, 0) >= 500  THEN 'medium'
    ELSE 'low'
  END AS ltv_bucket
FROM blvd_clients c
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::INT AS total_visits,
    SUM(svc_totals.appt_total) AS total_spend,
    MIN(a.start_at) AS first_visit,
    MAX(a.start_at) AS last_visit,
    CASE
      WHEN COUNT(*) > 1 THEN
        EXTRACT(DAY FROM (MAX(a.start_at) - MIN(a.start_at)))::INT / GREATEST(COUNT(*) - 1, 1)
      ELSE NULL
    END AS avg_days_between_visits,
    COUNT(DISTINCT a.location_key)::INT AS locations_visited
  FROM blvd_appointments a
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(s.price), 0) AS appt_total
    FROM blvd_appointment_services s
    WHERE s.appointment_id = a.id
  ) svc_totals ON true
  WHERE a.client_id = c.id
    AND a.status IN ('completed', 'final')
) stats ON true;

-- ============================================================
-- 2. client_tox_summary — tox-specific per-client metrics
--
-- Data model: a tox "visit" = one appointment (blvd_appointments row).
-- Each appointment has a container service (e.g. "Botox, Dysport,
-- Jeuveau, Daxxify Treatment") plus 1-4 add-on services that carry
-- the actual brand, units, and price.
--
-- Container detection: service name mentions 2+ brand names.
-- Brand is extracted from add-ons only (exactly 1 brand in name).
-- Revenue = sum of ALL tox services per appointment.
-- Post-injection follow-ups are excluded from visit counts.
-- ============================================================
CREATE OR REPLACE VIEW client_tox_summary AS
WITH tox_appointments AS (
  -- One row per appointment that contains tox services.
  -- Excludes post-injection follow-ups.
  SELECT
    a.id AS appointment_id,
    a.client_id,
    a.start_at,
    a.location_key,
    -- Classify: consultation vs treatment
    CASE
      WHEN EXISTS (
        SELECT 1 FROM blvd_appointment_services s2
        WHERE s2.appointment_id = a.id
          AND s2.service_slug = 'tox'
          AND LOWER(s2.service_name) LIKE '%consultation%'
      ) THEN 'consultation'
      ELSE 'treatment'
    END AS visit_type
  FROM blvd_appointments a
  WHERE a.status IN ('completed', 'final')
    AND EXISTS (
      SELECT 1 FROM blvd_appointment_services s
      WHERE s.appointment_id = a.id
        AND s.service_slug = 'tox'
    )
    -- Exclude post-injection follow-ups (named "Post Injection <Brand>")
    AND NOT EXISTS (
      SELECT 1 FROM blvd_appointment_services s
      WHERE s.appointment_id = a.id
        AND (LOWER(s.service_name) LIKE '%post injection%'
          OR LOWER(s.service_name) LIKE '%follow%up%')
    )
),
appointment_details AS (
  -- Per-appointment: total tox revenue, brand, provider.
  SELECT
    ta.appointment_id,
    ta.client_id,
    ta.start_at,
    ta.location_key,
    ta.visit_type,
    -- Revenue = sum of all tox-slug services in this appointment
    COALESCE(SUM(s.price), 0) AS appointment_revenue,
    -- Brand: pre-June 2024 data predates system switch — default to Jeuveau.
    -- Post-June 2024: from the highest-revenue add-on (exclude container).
    -- Container = service name with 2+ brand names.
    CASE
      WHEN ta.start_at < '2024-06-01' THEN 'Jeuveau'
      ELSE (
        SELECT CASE
          WHEN LOWER(s2.service_name) LIKE '%botox%' THEN 'Botox'
          WHEN LOWER(s2.service_name) LIKE '%dysport%' THEN 'Dysport'
          WHEN LOWER(s2.service_name) LIKE '%jeuveau%' THEN 'Jeuveau'
          WHEN LOWER(s2.service_name) LIKE '%daxxify%' THEN 'Daxxify'
          WHEN LOWER(s2.service_name) LIKE '%xeomin%' THEN 'Xeomin'
          ELSE 'Neurotoxin'
        END
        FROM blvd_appointment_services s2
        WHERE s2.appointment_id = ta.appointment_id
          AND s2.service_slug = 'tox'
          -- Only add-ons: service name mentions at most 1 brand
          AND (
            (CASE WHEN LOWER(s2.service_name) LIKE '%botox%' THEN 1 ELSE 0 END) +
            (CASE WHEN LOWER(s2.service_name) LIKE '%dysport%' THEN 1 ELSE 0 END) +
            (CASE WHEN LOWER(s2.service_name) LIKE '%jeuveau%' THEN 1 ELSE 0 END) +
            (CASE WHEN LOWER(s2.service_name) LIKE '%daxxify%' THEN 1 ELSE 0 END) +
            (CASE WHEN LOWER(s2.service_name) LIKE '%xeomin%' THEN 1 ELSE 0 END)
          ) <= 1
        ORDER BY s2.price DESC
        LIMIT 1
      )
    END AS tox_type,
    -- Provider from highest-revenue tox add-on
    (
      SELECT s3.provider_staff_id
      FROM blvd_appointment_services s3
      WHERE s3.appointment_id = ta.appointment_id
        AND s3.service_slug = 'tox'
        AND s3.provider_staff_id IS NOT NULL
      ORDER BY s3.price DESC
      LIMIT 1
    ) AS provider_staff_id,
    (
      SELECT s3.provider_boulevard_id
      FROM blvd_appointment_services s3
      WHERE s3.appointment_id = ta.appointment_id
        AND s3.service_slug = 'tox'
        AND s3.provider_boulevard_id IS NOT NULL
      ORDER BY s3.price DESC
      LIMIT 1
    ) AS provider_boulevard_id
  FROM tox_appointments ta
  LEFT JOIN blvd_appointment_services s ON s.appointment_id = ta.appointment_id
    AND s.service_slug = 'tox'
  GROUP BY ta.appointment_id, ta.client_id, ta.start_at, ta.location_key, ta.visit_type
),
tox_stats AS (
  SELECT
    client_id,
    COUNT(*)::INT AS tox_visits,
    MIN(start_at) AS first_tox_visit,
    MAX(start_at) AS last_tox_visit,
    SUM(appointment_revenue) AS total_tox_spend,
    EXTRACT(DAY FROM NOW() - MAX(start_at))::INT AS days_since_last_tox,
    -- Average interval between tox visits
    CASE
      WHEN COUNT(*) > 1 THEN
        EXTRACT(DAY FROM (MAX(start_at) - MIN(start_at)))::INT / GREATEST(COUNT(*) - 1, 1)
      ELSE NULL
    END AS avg_tox_interval_days,
    -- Most common tox type (from add-ons)
    MODE() WITHIN GROUP (ORDER BY tox_type) AS primary_tox_type,
    -- Has used multiple tox brands?
    COUNT(DISTINCT tox_type) FILTER (WHERE tox_type IS NOT NULL) > 1 AS tox_switching,
    -- Most recent provider (from most recent appointment)
    (ARRAY_AGG(provider_staff_id ORDER BY start_at DESC))[1] AS last_provider_staff_id,
    (ARRAY_AGG(provider_boulevard_id ORDER BY start_at DESC))[1] AS last_provider_boulevard_id,
    -- Most recent location
    (ARRAY_AGG(location_key ORDER BY start_at DESC))[1] AS last_location_key,
    -- Most recent tox type
    (ARRAY_AGG(tox_type ORDER BY start_at DESC))[1] AS last_tox_type,
    -- Consultation vs treatment breakdown
    COUNT(*) FILTER (WHERE visit_type = 'consultation')::INT AS consultation_count,
    COUNT(*) FILTER (WHERE visit_type = 'treatment')::INT AS treatment_count
  FROM appointment_details
  GROUP BY client_id
)
SELECT
  c.id AS client_id,
  c.boulevard_id,
  c.first_name,
  c.last_name,
  c.name,
  c.email,
  c.phone,
  ts.tox_visits,
  ts.first_tox_visit,
  ts.last_tox_visit,
  ts.total_tox_spend,
  ts.days_since_last_tox,
  ts.avg_tox_interval_days,
  ts.primary_tox_type,
  ts.last_tox_type,
  ts.tox_switching,
  ts.last_provider_staff_id,
  ts.last_provider_boulevard_id,
  ts.last_location_key,
  -- Tox scheduling segment (must stay in original column position)
  CASE
    WHEN ts.days_since_last_tox <= 90  THEN 'on_schedule'
    WHEN ts.days_since_last_tox <= 120 THEN 'due'
    WHEN ts.days_since_last_tox <= 180 THEN 'overdue'
    WHEN ts.days_since_last_tox <= 365 THEN 'probably_lost'
    ELSE 'lost'
  END AS tox_segment,
  -- New columns appended at end
  ts.consultation_count,
  ts.treatment_count
FROM blvd_clients c
JOIN tox_stats ts ON ts.client_id = c.id;

-- ============================================================
-- 3. client_segments — union of all computed segments per client
-- ============================================================
CREATE OR REPLACE VIEW client_segments AS
-- Tox segments
SELECT
  client_id,
  'tox_' || tox_segment AS segment_name,
  tox_segment AS segment_detail,
  days_since_last_tox AS days_value
FROM client_tox_summary

UNION ALL

-- Tox due within 2 weeks (between 76-90 days since last tox)
SELECT
  client_id,
  'tox_due_2_weeks' AS segment_name,
  'due_soon' AS segment_detail,
  days_since_last_tox AS days_value
FROM client_tox_summary
WHERE days_since_last_tox BETWEEN 76 AND 90

UNION ALL

-- High-value at risk: spent > $1000, no visit in 90+ days
SELECT
  cvs.client_id,
  'at_risk_high_value' AS segment_name,
  cvs.ltv_bucket AS segment_detail,
  cvs.days_since_last_visit AS days_value
FROM client_visit_summary cvs
WHERE cvs.total_spend >= 1000
  AND cvs.days_since_last_visit > 90

UNION ALL

-- Drop-off: 3+ visits historically, then stopped (no visit in 90+ days)
SELECT
  cvs.client_id,
  'drop_off' AS segment_name,
  'stopped_visiting' AS segment_detail,
  cvs.days_since_last_visit AS days_value
FROM client_visit_summary cvs
WHERE cvs.total_visits >= 3
  AND cvs.days_since_last_visit > 90

UNION ALL

-- No rebook: completed appointment in last 14 days but no future appointment
SELECT
  a.client_id,
  'no_rebook' AS segment_name,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - a.start_at)::INT <= 2  THEN '48h'
    WHEN EXTRACT(DAY FROM NOW() - a.start_at)::INT <= 7  THEN '7d'
    WHEN EXTRACT(DAY FROM NOW() - a.start_at)::INT <= 14 THEN '14d'
    ELSE '14d+'
  END AS segment_detail,
  EXTRACT(DAY FROM NOW() - a.start_at)::INT AS days_value
FROM blvd_appointments a
WHERE a.status IN ('completed', 'final')
  AND a.start_at >= NOW() - INTERVAL '30 days'
  AND a.start_at < NOW()
  AND a.client_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM blvd_appointments future
    WHERE future.client_id = a.client_id
      AND future.start_at > NOW()
      AND future.status IN ('booked', 'confirmed', 'arrived')
  );

-- ============================================================
-- 4. provider_performance — per-provider metrics
-- ============================================================
CREATE OR REPLACE VIEW provider_performance AS
WITH provider_appts AS (
  SELECT
    s.provider_staff_id,
    s.provider_boulevard_id,
    a.client_id,
    a.start_at,
    a.status,
    a.location_key,
    s.service_slug,
    s.price,
    s.duration_minutes
  FROM blvd_appointment_services s
  JOIN blvd_appointments a ON a.id = s.appointment_id
  WHERE s.provider_staff_id IS NOT NULL
),
completed AS (
  SELECT * FROM provider_appts WHERE status IN ('completed', 'final')
),
rebooks AS (
  -- For each client-provider pair, check if client returned within 90 days
  SELECT
    c1.provider_staff_id,
    c1.client_id,
    c1.start_at AS visit_date,
    EXISTS (
      SELECT 1 FROM completed c2
      WHERE c2.client_id = c1.client_id
        AND c2.provider_staff_id = c1.provider_staff_id
        AND c2.start_at > c1.start_at
        AND c2.start_at <= c1.start_at + INTERVAL '90 days'
    ) AS did_rebook
  FROM completed c1
)
SELECT
  st.id AS provider_staff_id,
  st.name AS provider_name,
  st.title AS provider_title,
  st.boulevard_provider_id,
  -- Completed appointment stats
  COUNT(DISTINCT c.start_at)::INT AS total_appointments,
  COUNT(DISTINCT c.client_id)::INT AS unique_clients,
  COALESCE(SUM(c.price), 0) AS total_revenue,
  -- Revenue per hour (based on actual service duration)
  CASE
    WHEN SUM(c.duration_minutes) > 0 THEN
      ROUND((SUM(c.price) / (SUM(c.duration_minutes) / 60.0))::NUMERIC, 2)
    ELSE 0
  END AS revenue_per_hour,
  -- Last 30 days revenue
  COALESCE(SUM(c.price) FILTER (WHERE c.start_at >= NOW() - INTERVAL '30 days'), 0) AS revenue_last_30d,
  -- Rebooking rate
  CASE
    WHEN COUNT(DISTINCT r.visit_date) > 0 THEN
      ROUND(
        (COUNT(DISTINCT r.visit_date) FILTER (WHERE r.did_rebook))::NUMERIC
        / COUNT(DISTINCT r.visit_date)::NUMERIC * 100, 1
      )
    ELSE 0
  END AS rebooking_rate_pct,
  -- Cancellation rate
  CASE
    WHEN COUNT(DISTINCT pa.start_at) > 0 THEN
      ROUND(
        (COUNT(DISTINCT pa.start_at) FILTER (WHERE pa.status IN ('cancelled', 'no_show')))::NUMERIC
        / COUNT(DISTINCT pa.start_at)::NUMERIC * 100, 1
      )
    ELSE 0
  END AS cancellation_rate_pct,
  -- Service mix (top 3 services)
  (
    SELECT ARRAY_AGG(sub.service_slug ORDER BY sub.cnt DESC)
    FROM (
      SELECT c2.service_slug, COUNT(*)::INT AS cnt
      FROM completed c2
      WHERE c2.provider_staff_id = st.id
        AND c2.service_slug IS NOT NULL
      GROUP BY c2.service_slug
      ORDER BY cnt DESC
      LIMIT 3
    ) sub
  ) AS top_services
FROM staff st
LEFT JOIN completed c ON c.provider_staff_id = st.id
LEFT JOIN provider_appts pa ON pa.provider_staff_id = st.id
LEFT JOIN rebooks r ON r.provider_staff_id = st.id
WHERE st.boulevard_provider_id IS NOT NULL
GROUP BY st.id, st.name, st.title, st.boulevard_provider_id;

-- ============================================================
-- 5. service_mix — service popularity + trends
-- ============================================================
CREATE OR REPLACE VIEW service_mix AS
SELECT
  s.service_slug,
  COUNT(*)::INT AS total_bookings,
  COALESCE(SUM(s.price), 0) AS total_revenue,
  COUNT(DISTINCT a.client_id)::INT AS unique_clients,
  ROUND(AVG(s.price)::NUMERIC, 2) AS avg_price,
  COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '30 days')::INT AS bookings_last_30d,
  COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '60 days' AND a.start_at < NOW() - INTERVAL '30 days')::INT AS bookings_prev_30d,
  CASE
    WHEN COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '60 days' AND a.start_at < NOW() - INTERVAL '30 days') > 0 THEN
      ROUND(
        (
          (COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '30 days'))::NUMERIC
          - (COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '60 days' AND a.start_at < NOW() - INTERVAL '30 days'))::NUMERIC
        )
        / (COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '60 days' AND a.start_at < NOW() - INTERVAL '30 days'))::NUMERIC * 100
      , 1)
    ELSE NULL
  END AS trend_pct
FROM blvd_appointment_services s
JOIN blvd_appointments a ON a.id = s.appointment_id
WHERE a.status IN ('completed', 'final')
  AND s.service_slug IS NOT NULL
GROUP BY s.service_slug;

-- ============================================================
-- 6. location_summary — per-location rollup
-- ============================================================
CREATE OR REPLACE VIEW location_summary AS
SELECT
  a.location_key,
  COUNT(*)::INT AS total_appointments,
  COALESCE(SUM(s.price), 0) AS total_revenue,
  COUNT(DISTINCT a.client_id)::INT AS unique_clients,
  ROUND(AVG(s.price)::NUMERIC, 2) AS avg_ticket,
  COUNT(*) FILTER (WHERE a.start_at >= NOW() - INTERVAL '30 days')::INT AS appointments_last_30d,
  COALESCE(SUM(s.price) FILTER (WHERE a.start_at >= NOW() - INTERVAL '30 days'), 0) AS revenue_last_30d,
  (
    SELECT sub.service_slug
    FROM blvd_appointment_services sub
    JOIN blvd_appointments sub_a ON sub_a.id = sub.appointment_id
    WHERE sub_a.location_key = a.location_key
      AND sub_a.status IN ('completed', 'final')
      AND sub.service_slug IS NOT NULL
    GROUP BY sub.service_slug
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) AS top_service
FROM blvd_appointments a
LEFT JOIN blvd_appointment_services s ON s.appointment_id = a.id
WHERE a.status IN ('completed', 'final')
GROUP BY a.location_key;
