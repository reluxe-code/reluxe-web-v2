-- 047: Promote SPF from 'secondary' to its own tracked category 'spf'.
-- SPF is NOT part of the Core 4 score (0-4), but is tracked alongside it.

-- 1. Recreate auto-map function with SPF as its own category
CREATE OR REPLACE FUNCTION rie_auto_map_skus()
RETURNS TABLE(inserted INT, updated INT, total INT) AS $$
DECLARE
  v_inserted INT := 0;
  v_updated INT := 0;
  v_total INT := 0;
  rec RECORD;
  v_category TEXT;
  v_depletion INT;
  v_confidence TEXT;
BEGIN
  FOR rec IN
    SELECT
      COALESCE(ps.sku, ps.product_name) AS sku_key,
      ps.product_name,
      ps.brand
    FROM blvd_product_sales ps
    WHERE COALESCE(ps.sku, ps.product_name) IS NOT NULL
    GROUP BY 1, 2, 3
  LOOP
    v_total := v_total + 1;

    -- Classify by product name regex
    IF rec.product_name ~* '(retinol|retinoid|alpharet|alpha-ret|overnight\s+cream|retinal|intensive\s+age\s+refining)' THEN
      v_category := 'retinol';
      v_depletion := 90;
      v_confidence := 'high';
    ELSIF rec.product_name ~* '(ce\s+ferulic|phloretin\s+cf|silymarin\s+cf|vitamin\s*c|alto\s+advanced|c\s+e\s+ferulic|ascorbic|serum\s+10|serum\s+15|serum\s+20|aox)' THEN
      v_category := 'vitamin_c';
      v_depletion := 75;
      v_confidence := 'high';
    ELSIF rec.product_name ~* '(cleanser|cleansing|face\s+wash|gentle\s+cleanser|soothing\s+cleanser|exfoliating\s+cleanser|foaming\s+cleanser|micellar)' THEN
      v_category := 'cleanser';
      v_depletion := 60;
      v_confidence := 'high';
    ELSIF rec.product_name ~* '(moisturizer|moisturiser|triple\s+lipid|trio\s+rebalancing|barrier\s+repair|daily\s+moisture|face\s+cream|hydrating\s+b5|emollience|metacell)' THEN
      v_category := 'moisturizer';
      v_depletion := 60;
      v_confidence := 'high';
    ELSIF rec.product_name ~* '(sunscreen|spf|sun\s+protection|uv\s+defense|sheer\s+physical|daily\s+brightening|physical\s+fusion|solar)' THEN
      v_category := 'spf';
      v_depletion := 60;
      v_confidence := 'high';
    ELSIF rec.product_name ~* '(serum|treatment|corrector|discoloration|hyaluronic|glycolic|resveratrol|equalizing|blemish|acne|eye\s+cream|eye\s+gel|lip)' THEN
      v_category := 'secondary';
      v_depletion := 90;
      v_confidence := 'medium';
    ELSE
      v_category := 'secondary';
      v_depletion := 90;
      v_confidence := 'low';
    END IF;

    -- Insert or update only auto-mapped rows (don't overwrite manual edits)
    INSERT INTO rie_sku_core4_map (sku_key, product_name, brand, core4_category, depletion_days, auto_mapped, confidence)
    VALUES (rec.sku_key, rec.product_name, rec.brand, v_category, v_depletion, true, v_confidence)
    ON CONFLICT (sku_key) DO UPDATE SET
      product_name = EXCLUDED.product_name,
      brand = EXCLUDED.brand,
      core4_category = EXCLUDED.core4_category,
      depletion_days = EXCLUDED.depletion_days,
      confidence = EXCLUDED.confidence,
      updated_at = now()
    WHERE rie_sku_core4_map.auto_mapped = true;

    IF FOUND THEN
      IF EXISTS (SELECT 1 FROM rie_sku_core4_map WHERE sku_key = rec.sku_key AND created_at = updated_at) THEN
        v_inserted := v_inserted + 1;
      ELSE
        v_updated := v_updated + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_inserted, v_updated, v_total;
END;
$$ LANGUAGE plpgsql;

-- 2. Reclassify existing auto-mapped SPF rows
UPDATE rie_sku_core4_map
SET core4_category = 'spf', confidence = 'high', updated_at = now()
WHERE auto_mapped = true
  AND core4_category = 'secondary'
  AND product_name ~* '(sunscreen|spf|sun\s+protection|uv\s+defense|sheer\s+physical|daily\s+brightening|physical\s+fusion|solar)';

-- 3. Recreate client_core4_score view with has_spf
-- Must DROP because adding a column in the middle isn't allowed with CREATE OR REPLACE.
-- rie_provider_sales_dna depends on client_core4_score, so drop it first and recreate after.
DROP VIEW IF EXISTS rie_provider_sales_dna CASCADE;
DROP VIEW IF EXISTS client_core4_score CASCADE;

-- core4_score stays 0-4 (cleanser, vitamin_c, retinol, moisturizer only).
-- has_spf is tracked separately.
CREATE VIEW client_core4_score AS
WITH client_category_status AS (
  -- Primary category
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

  -- Secondary category (combo products like A-Team = retinol + vitamin_c)
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
-- Deduplicate: if a client has a category from both primary and secondary, keep the most recent
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
-- SPF tracking (separate from Core 4 score)
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
  c.name,
  c.email,
  c.phone,
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

-- 4. Recreate rie_provider_sales_dna (was dropped due to dependency on client_core4_score)
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
