-- 046: Add secondary Core 4 category for combo products (e.g. A-Team = retinol + vitamin_c).

-- 1. Add column
ALTER TABLE rie_sku_core4_map ADD COLUMN IF NOT EXISTS core4_secondary TEXT;

-- 2. Recreate client_core4_score to count secondary categories
CREATE OR REPLACE VIEW client_core4_score AS
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
) scores ON true;
