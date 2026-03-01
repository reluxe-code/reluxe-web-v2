-- 049-massage-journey.sql
-- P6: Massage Journey cohort — client_massage_summary view + campaign seed.

-- ============================================================
-- 1. client_massage_summary view
-- ============================================================
-- Mirrors client_tox_summary pattern from 007-intelligence-views.sql.
-- One row per client with completed massage appointments.

CREATE OR REPLACE VIEW client_massage_summary AS
WITH massage_appointments AS (
  SELECT
    a.id AS appointment_id,
    a.client_id,
    a.start_at,
    a.location_key
  FROM blvd_appointments a
  WHERE a.status IN ('completed', 'final')
    AND EXISTS (
      SELECT 1 FROM blvd_appointment_services s
      WHERE s.appointment_id = a.id
        AND s.service_slug = 'massage'
    )
),
appointment_details AS (
  SELECT
    ma.appointment_id,
    ma.client_id,
    ma.start_at,
    ma.location_key,
    COALESCE(SUM(s.price), 0) AS appointment_revenue,
    (
      SELECT s2.provider_staff_id
      FROM blvd_appointment_services s2
      WHERE s2.appointment_id = ma.appointment_id
        AND s2.service_slug = 'massage'
        AND s2.provider_staff_id IS NOT NULL
      ORDER BY s2.price DESC
      LIMIT 1
    ) AS provider_staff_id
  FROM massage_appointments ma
  LEFT JOIN blvd_appointment_services s ON s.appointment_id = ma.appointment_id
    AND s.service_slug = 'massage'
  GROUP BY ma.appointment_id, ma.client_id, ma.start_at, ma.location_key
),
massage_stats AS (
  SELECT
    client_id,
    COUNT(*)::INT AS massage_visits,
    MIN(start_at) AS first_massage_visit,
    MAX(start_at) AS last_massage_visit,
    SUM(appointment_revenue) AS total_massage_spend,
    EXTRACT(DAY FROM NOW() - MAX(start_at))::INT AS days_since_last_massage,
    CASE
      WHEN COUNT(*) > 1 THEN
        EXTRACT(DAY FROM (MAX(start_at) - MIN(start_at)))::INT / GREATEST(COUNT(*) - 1, 1)
      ELSE NULL
    END AS avg_massage_interval_days,
    (ARRAY_AGG(provider_staff_id ORDER BY start_at DESC))[1] AS last_provider_staff_id,
    (ARRAY_AGG(location_key ORDER BY start_at DESC))[1] AS last_location_key
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
  ms.massage_visits,
  ms.first_massage_visit,
  ms.last_massage_visit,
  ms.total_massage_spend,
  ms.days_since_last_massage,
  ms.avg_massage_interval_days,
  ms.last_provider_staff_id,
  ms.last_location_key,
  -- Milestone tier (±3 day windows around 25, 40, 55, 70, 85)
  CASE
    WHEN ms.days_since_last_massage BETWEEN 22 AND 28 THEN 'gentle'
    WHEN ms.days_since_last_massage BETWEEN 37 AND 43 THEN 'reminder'
    WHEN ms.days_since_last_massage BETWEEN 52 AND 58 THEN 'winback'
    WHEN ms.days_since_last_massage BETWEEN 67 AND 73 THEN 'urgent'
    WHEN ms.days_since_last_massage BETWEEN 82 AND 88 THEN 'last_call'
    ELSE NULL
  END AS massage_tier
FROM blvd_clients c
JOIN massage_stats ms ON ms.client_id = c.id;


-- ============================================================
-- 2. Campaign seed
-- ============================================================
INSERT INTO concierge_campaigns (campaign_slug, cohort, priority, variant_a_template, variant_b_template, ab_split, active)
VALUES (
  'massage_journey', 'P6', 6,
  'Hi {{first_name}}, it''s been {{days_overdue}} days since your last massage with {{provider_name}}. Your body will thank you! {{credit_reminder}}Book here: {{booking_link}}',
  '{{first_name}}, {{provider_name}} has openings for your next massage. Time to unwind! {{credit_reminder}}Book now: {{booking_link}}',
  0.50, true
) ON CONFLICT (campaign_slug) DO NOTHING;
