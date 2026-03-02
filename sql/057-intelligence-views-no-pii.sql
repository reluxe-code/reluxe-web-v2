-- 057-intelligence-views-no-pii.sql
-- Phase 2C: Rebuild intelligence views without PII columns.
-- Views return boulevard_id for JIT resolution instead of name/email/phone.
-- Run AFTER 055 hash columns are added (but BEFORE 056 drops raw columns).

-- ============================================================
-- 1. client_visit_summary — per-client aggregate metrics (no PII)
-- ============================================================
DROP VIEW IF EXISTS client_visit_summary CASCADE;
CREATE VIEW client_visit_summary AS
SELECT
  c.id AS client_id,
  c.boulevard_id,
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
-- 2. client_tox_summary — tox-specific per-client metrics (no PII)
-- ============================================================
DROP VIEW IF EXISTS client_tox_summary CASCADE;
CREATE VIEW client_tox_summary AS
WITH tox_appointments AS (
  SELECT
    a.id AS appointment_id,
    a.client_id,
    a.start_at,
    a.location_key,
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
    AND NOT EXISTS (
      SELECT 1 FROM blvd_appointment_services s
      WHERE s.appointment_id = a.id
        AND (LOWER(s.service_name) LIKE '%post injection%'
          OR LOWER(s.service_name) LIKE '%follow%up%')
    )
),
appointment_details AS (
  SELECT
    ta.appointment_id,
    ta.client_id,
    ta.start_at,
    ta.location_key,
    ta.visit_type,
    COALESCE(SUM(s.price), 0) AS appointment_revenue,
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
    CASE
      WHEN COUNT(*) > 1 THEN
        EXTRACT(DAY FROM (MAX(start_at) - MIN(start_at)))::INT / GREATEST(COUNT(*) - 1, 1)
      ELSE NULL
    END AS avg_tox_interval_days,
    MODE() WITHIN GROUP (ORDER BY tox_type) AS primary_tox_type,
    COUNT(DISTINCT tox_type) FILTER (WHERE tox_type IS NOT NULL) > 1 AS tox_switching,
    (ARRAY_AGG(provider_staff_id ORDER BY start_at DESC))[1] AS last_provider_staff_id,
    (ARRAY_AGG(provider_boulevard_id ORDER BY start_at DESC))[1] AS last_provider_boulevard_id,
    (ARRAY_AGG(location_key ORDER BY start_at DESC))[1] AS last_location_key,
    (ARRAY_AGG(tox_type ORDER BY start_at DESC))[1] AS last_tox_type,
    COUNT(*) FILTER (WHERE visit_type = 'consultation')::INT AS consultation_count,
    COUNT(*) FILTER (WHERE visit_type = 'treatment')::INT AS treatment_count
  FROM appointment_details
  GROUP BY client_id
)
SELECT
  c.id AS client_id,
  c.boulevard_id,
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
  CASE
    WHEN ts.days_since_last_tox <= 90  THEN 'on_schedule'
    WHEN ts.days_since_last_tox <= 120 THEN 'due'
    WHEN ts.days_since_last_tox <= 180 THEN 'overdue'
    WHEN ts.days_since_last_tox <= 365 THEN 'probably_lost'
    ELSE 'lost'
  END AS tox_segment,
  ts.consultation_count,
  ts.treatment_count
FROM blvd_clients c
JOIN tox_stats ts ON ts.client_id = c.id;

-- ============================================================
-- 3. client_massage_summary — massage-specific per-client metrics (no PII)
-- ============================================================
DROP VIEW IF EXISTS client_massage_summary CASCADE;
CREATE VIEW client_massage_summary AS
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
  ms.massage_visits,
  ms.first_massage_visit,
  ms.last_massage_visit,
  ms.total_massage_spend,
  ms.days_since_last_massage,
  ms.avg_massage_interval_days,
  ms.last_provider_staff_id,
  ms.last_location_key,
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
-- 4. client_core4_score — skincare compliance score (no PII)
-- ============================================================
DROP VIEW IF EXISTS rie_provider_sales_dna CASCADE;
DROP VIEW IF EXISTS client_core4_score CASCADE;

CREATE VIEW client_core4_score AS
WITH client_category_status AS (
  SELECT
    ps.client_id,
    m.core4_category AS category,
    MAX(ps.sold_at) AS last_purchase_at,
    m.depletion_days,
    CASE
      WHEN MAX(ps.sold_at) + (m.depletion_days || ' days')::INTERVAL >= NOW() THEN true
      ELSE false
    END AS is_active
  FROM blvd_product_sales ps
  JOIN rie_sku_core4_map m ON m.sku_key = COALESCE(ps.sku, ps.product_name)
  WHERE ps.client_id IS NOT NULL
    AND m.core4_category IN ('cleanser', 'vitamin_c', 'retinol', 'moisturizer')
  GROUP BY ps.client_id, m.core4_category, m.depletion_days

  UNION ALL

  SELECT
    ps.client_id,
    m.core4_secondary AS category,
    MAX(ps.sold_at) AS last_purchase_at,
    m.depletion_days,
    CASE
      WHEN MAX(ps.sold_at) + (m.depletion_days || ' days')::INTERVAL >= NOW() THEN true
      ELSE false
    END AS is_active
  FROM blvd_product_sales ps
  JOIN rie_sku_core4_map m ON m.sku_key = COALESCE(ps.sku, ps.product_name)
  WHERE ps.client_id IS NOT NULL
    AND m.core4_secondary IN ('cleanser', 'vitamin_c', 'retinol', 'moisturizer')
  GROUP BY ps.client_id, m.core4_secondary, m.depletion_days
),
deduped AS (
  SELECT
    client_id,
    category,
    MAX(last_purchase_at) AS last_purchase_at,
    MIN(depletion_days) AS depletion_days,
    BOOL_OR(is_active) AS is_active
  FROM client_category_status
  GROUP BY client_id, category
),
spf_status AS (
  SELECT
    ps.client_id,
    true AS has_spf
  FROM blvd_product_sales ps
  JOIN rie_sku_core4_map m ON m.sku_key = COALESCE(ps.sku, ps.product_name)
  WHERE ps.client_id IS NOT NULL
    AND m.core4_category = 'spf'
    AND ps.sold_at + (m.depletion_days || ' days')::INTERVAL >= NOW()
  GROUP BY ps.client_id
)
SELECT
  c.id AS client_id,
  c.boulevard_id,
  COALESCE(scores.core4_score, 0) AS core4_score,
  COALESCE(scores.has_cleanser, false) AS has_cleanser,
  COALESCE(scores.has_vitamin_c, false) AS has_vitamin_c,
  COALESCE(scores.has_retinol, false) AS has_retinol,
  COALESCE(scores.has_moisturizer, false) AS has_moisturizer,
  COALESCE(spf.has_spf, false) AS has_spf,
  scores.categories_detail
FROM blvd_clients c
JOIN (
  SELECT DISTINCT client_id FROM blvd_product_sales WHERE client_id IS NOT NULL
) buyers ON buyers.client_id = c.id
LEFT JOIN LATERAL (
  SELECT
    d.client_id,
    COUNT(*) FILTER (WHERE d.is_active)::INT AS core4_score,
    BOOL_OR(d.category = 'cleanser' AND d.is_active) AS has_cleanser,
    BOOL_OR(d.category = 'vitamin_c' AND d.is_active) AS has_vitamin_c,
    BOOL_OR(d.category = 'retinol' AND d.is_active) AS has_retinol,
    BOOL_OR(d.category = 'moisturizer' AND d.is_active) AS has_moisturizer,
    JSONB_AGG(JSONB_BUILD_OBJECT(
      'category', d.category,
      'last_purchase_at', d.last_purchase_at,
      'is_active', d.is_active
    )) AS categories_detail
  FROM deduped d
  WHERE d.client_id = c.id
  GROUP BY d.client_id
) scores ON true
LEFT JOIN spf_status spf ON spf.client_id = c.id;

-- ============================================================
-- 5. rie_replenishment_radar — product depletion tracking (no PII)
-- ============================================================
DROP VIEW IF EXISTS rie_replenishment_radar CASCADE;
CREATE VIEW rie_replenishment_radar AS
WITH latest_purchases AS (
  SELECT
    ps.client_id,
    COALESCE(ps.sku, ps.product_name) AS sku_key,
    ps.product_name,
    ps.brand,
    MAX(ps.sold_at) AS last_purchase_at
  FROM blvd_product_sales ps
  WHERE ps.client_id IS NOT NULL
  GROUP BY ps.client_id, COALESCE(ps.sku, ps.product_name), ps.product_name, ps.brand
)
SELECT
  lp.client_id,
  c.boulevard_id,
  lp.sku_key,
  lp.product_name,
  lp.brand,
  m.core4_category,
  m.depletion_days,
  lp.last_purchase_at,
  (lp.last_purchase_at + (m.depletion_days || ' days')::INTERVAL)::DATE AS predicted_exhaustion_date,
  EXTRACT(DAY FROM NOW() - (lp.last_purchase_at + (m.depletion_days || ' days')::INTERVAL))::INT AS days_past_exhaustion,
  CASE
    WHEN lp.last_purchase_at + (m.depletion_days || ' days')::INTERVAL >= NOW() THEN 'active'
    WHEN EXTRACT(DAY FROM NOW() - (lp.last_purchase_at + (m.depletion_days || ' days')::INTERVAL)) <= 30 THEN 'overdue'
    ELSE 'churned'
  END AS replenishment_status
FROM latest_purchases lp
JOIN rie_sku_core4_map m ON m.sku_key = lp.sku_key
JOIN blvd_clients c ON c.id = lp.client_id
WHERE m.core4_category != 'excluded';

-- ============================================================
-- 6. client_engagement_overview — engagement scoring (no PII)
-- ============================================================
DROP VIEW IF EXISTS client_engagement_overview CASCADE;
CREATE VIEW client_engagement_overview AS
SELECT
  c.id AS client_id,
  c.boulevard_id,
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
-- 7. rie_provider_sales_dna — provider retail metrics (no patient PII)
--    Recreated here because CASCADE drop of client_core4_score removes it.
--    Staff names (provider_name, provider_title) are employee data, not PHI.
-- ============================================================
CREATE VIEW rie_provider_sales_dna AS
WITH provider_appointments AS (
  SELECT
    s.provider_staff_id,
    COUNT(DISTINCT a.id)::INT AS total_appointments
  FROM blvd_appointment_services s
  JOIN blvd_appointments a ON a.id = s.appointment_id
  WHERE a.status IN ('completed', 'final')
    AND s.provider_staff_id IS NOT NULL
  GROUP BY s.provider_staff_id
),
provider_retail AS (
  SELECT
    ps.provider_staff_id,
    COUNT(*)::INT AS sale_lines,
    COUNT(DISTINCT COALESCE(ps.sku, ps.product_name))::INT AS unique_skus_sold,
    ROUND(SUM(ps.net_sales)::NUMERIC, 2) AS total_retail_revenue,
    COUNT(DISTINCT ps.client_id)::INT AS retail_clients
  FROM blvd_product_sales ps
  WHERE ps.provider_staff_id IS NOT NULL
  GROUP BY ps.provider_staff_id
),
provider_attachment AS (
  SELECT
    s.provider_staff_id,
    COUNT(DISTINCT a.id)::INT AS appointments_with_sale
  FROM blvd_appointment_services s
  JOIN blvd_appointments a ON a.id = s.appointment_id
  WHERE a.status IN ('completed', 'final')
    AND s.provider_staff_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM blvd_product_sales ps
      WHERE ps.provider_staff_id = s.provider_staff_id
        AND ps.sold_at >= a.start_at
        AND ps.sold_at <= a.start_at + INTERVAL '24 hours'
    )
  GROUP BY s.provider_staff_id
),
provider_adherence AS (
  SELECT
    ps.provider_staff_id,
    COUNT(DISTINCT ps.client_id)::INT AS total_product_clients,
    COUNT(DISTINCT ps.client_id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM client_core4_score c4
        WHERE c4.client_id = ps.client_id AND c4.core4_score = 4
      )
    )::INT AS clients_at_4
  FROM blvd_product_sales ps
  WHERE ps.provider_staff_id IS NOT NULL
    AND ps.client_id IS NOT NULL
  GROUP BY ps.provider_staff_id
)
SELECT
  st.id AS provider_staff_id,
  st.name AS provider_name,
  st.title AS provider_title,
  COALESCE(pa.total_appointments, 0) AS total_appointments,
  COALESCE(pr.sale_lines, 0) AS sale_lines,
  COALESCE(pr.unique_skus_sold, 0) AS unique_skus_sold,
  COALESCE(pr.total_retail_revenue, 0) AS total_retail_revenue,
  COALESCE(pr.retail_clients, 0) AS retail_clients,
  CASE
    WHEN COALESCE(pa.total_appointments, 0) > 0 THEN
      ROUND((COALESCE(patt.appointments_with_sale, 0)::NUMERIC / pa.total_appointments) * 100, 1)
    ELSE 0
  END AS attachment_rate_pct,
  CASE
    WHEN COALESCE(padh.total_product_clients, 0) > 0 THEN
      ROUND((COALESCE(padh.clients_at_4, 0)::NUMERIC / padh.total_product_clients) * 100, 1)
    ELSE 0
  END AS protocol_adherence_pct,
  CASE
    WHEN COALESCE(pr.sale_lines, 0) > 0 THEN
      ROUND((COALESCE(pr.unique_skus_sold, 0)::NUMERIC / pr.sale_lines) * 100, 1)
    ELSE 0
  END AS portfolio_variety_pct
FROM staff st
LEFT JOIN provider_appointments pa ON pa.provider_staff_id = st.id
LEFT JOIN provider_retail pr ON pr.provider_staff_id = st.id
LEFT JOIN provider_attachment patt ON patt.provider_staff_id = st.id
LEFT JOIN provider_adherence padh ON padh.provider_staff_id = st.id
WHERE st.boulevard_provider_id IS NOT NULL
  AND (COALESCE(pa.total_appointments, 0) > 0 OR COALESCE(pr.sale_lines, 0) > 0);

-- ============================================================
-- 8. client_segments — union of all computed segments per client
--    Depends on client_tox_summary + client_visit_summary (views 1 & 2).
--    CASCADE-dropped when those views are rebuilt; must be recreated here.
-- ============================================================
DROP VIEW IF EXISTS client_segments CASCADE;
CREATE VIEW client_segments AS
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

-- No rebook: completed appointment in last 30 days but no future appointment
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
