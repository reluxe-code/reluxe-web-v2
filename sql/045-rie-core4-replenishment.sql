-- 045: RIE Core 4 Regimen, Replenishment Radar, Provider Sales DNA.
--
-- 1. rie_sku_core4_map — maps every sold SKU to a Core 4 category + depletion days
-- 2. rie_auto_map_skus() — regex-classifies all distinct SKUs from blvd_product_sales
-- 3. client_core4_score — per-client Core 4 score (0–4)
-- 4. rie_replenishment_radar — per-client, per-product depletion status
-- 5. rie_provider_sales_dna — per-provider retail metrics

-- ============================================================
-- 1. SKU → Core 4 mapping table
-- ============================================================
CREATE TABLE IF NOT EXISTS rie_sku_core4_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku_key TEXT UNIQUE NOT NULL,
  product_name TEXT,
  brand TEXT,
  core4_category TEXT NOT NULL DEFAULT 'secondary',
  depletion_days INT NOT NULL DEFAULT 90,
  auto_mapped BOOLEAN DEFAULT false,
  confidence TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rie_sku_core4_category ON rie_sku_core4_map(core4_category);

ALTER TABLE rie_sku_core4_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_rie_sku_core4_map" ON rie_sku_core4_map FOR ALL
  USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Auto-map function — regex-classifies SKUs
-- ============================================================
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
      v_category := 'secondary';
      v_depletion := 60;
      v_confidence := 'medium';
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
      -- Check if it was an insert or update
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

-- ============================================================
-- 3. Per-client Core 4 Score (0–4)
-- ============================================================
CREATE OR REPLACE VIEW client_core4_score AS
WITH client_category_status AS (
  SELECT
    ps.client_id,
    m.core4_category,
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
  scores.categories_detail
FROM blvd_clients c
JOIN (
  SELECT DISTINCT client_id FROM blvd_product_sales WHERE client_id IS NOT NULL
) buyers ON buyers.client_id = c.id
LEFT JOIN LATERAL (
  SELECT
    ccs.client_id,
    COUNT(*) FILTER (WHERE ccs.is_active)::INT AS core4_score,
    BOOL_OR(ccs.core4_category = 'cleanser' AND ccs.is_active) AS has_cleanser,
    BOOL_OR(ccs.core4_category = 'vitamin_c' AND ccs.is_active) AS has_vitamin_c,
    BOOL_OR(ccs.core4_category = 'retinol' AND ccs.is_active) AS has_retinol,
    BOOL_OR(ccs.core4_category = 'moisturizer' AND ccs.is_active) AS has_moisturizer,
    JSONB_AGG(JSONB_BUILD_OBJECT(
      'category', ccs.core4_category,
      'last_purchase_at', ccs.last_purchase_at,
      'is_active', ccs.is_active
    )) AS categories_detail
  FROM client_category_status ccs
  WHERE ccs.client_id = c.id
  GROUP BY ccs.client_id
) scores ON true;

-- ============================================================
-- 4. Replenishment Radar — per-client, per-product depletion
-- ============================================================
CREATE OR REPLACE VIEW rie_replenishment_radar AS
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
  c.name AS client_name,
  c.email AS client_email,
  c.phone AS client_phone,
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
-- 5. Provider Sales DNA — per-provider retail metrics
-- ============================================================
CREATE OR REPLACE VIEW rie_provider_sales_dna AS
WITH provider_appointments AS (
  -- Count completed appointments per provider
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
  -- Retail sales per provider
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
  -- Appointments that had a product sale within 24h
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
  -- % of provider's product-buying clients at 4/4 Core Score
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
  -- Attachment Rate: % of appointments with a sale
  CASE
    WHEN COALESCE(pa.total_appointments, 0) > 0 THEN
      ROUND((COALESCE(patt.appointments_with_sale, 0)::NUMERIC / pa.total_appointments) * 100, 1)
    ELSE 0
  END AS attachment_rate_pct,
  -- Protocol Adherence: % of product clients at 4/4
  CASE
    WHEN COALESCE(padh.total_product_clients, 0) > 0 THEN
      ROUND((COALESCE(padh.clients_at_4, 0)::NUMERIC / padh.total_product_clients) * 100, 1)
    ELSE 0
  END AS protocol_adherence_pct,
  -- Portfolio Variety: unique SKUs / total sale lines
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
