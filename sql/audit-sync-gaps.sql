-- audit-sync-gaps.sql
-- Detect gaps and anomalies in Boulevard appointment sync data.
-- Run manually in Supabase SQL Editor whenever you suspect missing data.

-- ============================================================
-- 1. Stale appointments: still booked/confirmed but start_at is past
--    These should have been completed or cancelled in Boulevard.
-- ============================================================
SELECT
  'stale_status' AS issue,
  count(*) AS count,
  min(start_at::date) AS oldest,
  max(start_at::date) AS newest
FROM blvd_appointments
WHERE status IN ('booked', 'confirmed')
  AND start_at < now() - interval '2 hours'
  AND start_at > now() - interval '90 days';

-- ============================================================
-- 2. Daily appointment counts (last 60 days)
--    Look for business days with 0 or suspiciously low counts.
--    Weekdays with < 5 completed appointments likely indicate a gap.
-- ============================================================
WITH days AS (
  SELECT generate_series(
    (current_date - 60)::date,
    current_date,
    '1 day'::interval
  )::date AS day
),
counts AS (
  SELECT
    start_at::date AS day,
    count(*) FILTER (WHERE status IN ('completed', 'final')) AS completed,
    count(*) FILTER (WHERE status IN ('booked', 'confirmed')) AS still_booked,
    count(*) FILTER (WHERE status IN ('cancelled', 'no_show')) AS cancelled,
    count(*) AS total
  FROM blvd_appointments
  WHERE start_at >= current_date - 60
  GROUP BY start_at::date
)
SELECT
  d.day,
  extract(dow FROM d.day) AS dow,
  CASE extract(dow FROM d.day)
    WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
    WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
    WHEN 6 THEN 'Sat'
  END AS day_name,
  coalesce(c.completed, 0) AS completed,
  coalesce(c.still_booked, 0) AS still_booked,
  coalesce(c.cancelled, 0) AS cancelled,
  coalesce(c.total, 0) AS total,
  CASE
    WHEN coalesce(c.total, 0) = 0 AND extract(dow FROM d.day) NOT IN (0) THEN '!! NO DATA'
    WHEN coalesce(c.still_booked, 0) > 0 AND d.day < current_date THEN '! STALE'
    ELSE 'ok'
  END AS flag
FROM days d
LEFT JOIN counts c ON c.day = d.day
ORDER BY d.day DESC;

-- ============================================================
-- 3. Revenue sanity check: completed appointments with $0 services
--    These may have missing or un-synced service line items.
-- ============================================================
SELECT
  a.id,
  a.boulevard_id,
  a.start_at::date AS appt_date,
  a.location_key,
  a.status,
  coalesce(sum(s.price), 0) AS total_price,
  count(s.id) AS service_count
FROM blvd_appointments a
LEFT JOIN blvd_appointment_services s ON s.appointment_id = a.id
WHERE a.status IN ('completed', 'final')
  AND a.start_at >= current_date - 30
GROUP BY a.id, a.boulevard_id, a.start_at, a.location_key, a.status
HAVING coalesce(sum(s.price), 0) = 0
ORDER BY a.start_at DESC
LIMIT 50;

-- ============================================================
-- 4. Sync freshness: when was each location last synced?
-- ============================================================
SELECT
  location_key,
  count(*) AS total_appointments,
  max(synced_at) AS last_synced,
  max(start_at) AS newest_appointment,
  count(*) FILTER (WHERE status IN ('completed', 'final') AND start_at >= current_date - 7) AS completed_last_7d,
  count(*) FILTER (WHERE status IN ('booked', 'confirmed') AND start_at < now() - interval '2 hours') AS stale_count
FROM blvd_appointments
GROUP BY location_key
ORDER BY location_key;

-- ============================================================
-- 5. Month-over-month revenue comparison
--    Quick check that revenue isn't unexpectedly dropping to $0.
-- ============================================================
SELECT
  date_trunc('month', a.start_at)::date AS month,
  a.location_key,
  count(DISTINCT a.id) AS completed_appts,
  round(coalesce(sum(s.price), 0)::numeric, 2) AS service_revenue
FROM blvd_appointments a
JOIN blvd_appointment_services s ON s.appointment_id = a.id
WHERE a.status IN ('completed', 'final')
  AND a.start_at >= current_date - 180
GROUP BY date_trunc('month', a.start_at), a.location_key
ORDER BY month DESC, location_key;
