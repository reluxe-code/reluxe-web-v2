-- 009-product-intelligence.sql
-- Product sales intelligence tables + views for retail skincare analytics.
-- Run after 004-appointments-sync.sql and 007-intelligence-views.sql.

-- ============================================================
-- 1) Product catalog (skincare / retail SKUs)
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_product_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_product_id TEXT,
  sku TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (boulevard_product_id),
  UNIQUE (sku)
);

CREATE INDEX IF NOT EXISTS idx_blvd_product_catalog_sku ON blvd_product_catalog(sku);
CREATE INDEX IF NOT EXISTS idx_blvd_product_catalog_name ON blvd_product_catalog(product_name);
CREATE INDEX IF NOT EXISTS idx_blvd_product_catalog_brand ON blvd_product_catalog(brand);

-- ============================================================
-- 2) Product sales line-items (one row per sold sku)
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_product_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_sale_line_id TEXT UNIQUE,
  order_id TEXT,
  order_number TEXT,
  sold_at TIMESTAMPTZ NOT NULL,
  location_key TEXT,
  location_id TEXT,
  client_id UUID REFERENCES blvd_clients(id),
  client_boulevard_id TEXT,
  provider_staff_id UUID REFERENCES staff(id),
  provider_boulevard_id TEXT,
  product_id UUID REFERENCES blvd_product_catalog(id),
  boulevard_product_id TEXT,
  sku TEXT,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_sales NUMERIC(10,2) NOT NULL DEFAULT 0,
  raw JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blvd_product_sales_sold_at ON blvd_product_sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_blvd_product_sales_provider ON blvd_product_sales(provider_staff_id);
CREATE INDEX IF NOT EXISTS idx_blvd_product_sales_client ON blvd_product_sales(client_id);
CREATE INDEX IF NOT EXISTS idx_blvd_product_sales_sku ON blvd_product_sales(sku);
CREATE INDEX IF NOT EXISTS idx_blvd_product_sales_product_id ON blvd_product_sales(product_id);

-- ============================================================
-- 3) Security
-- ============================================================
ALTER TABLE blvd_product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE blvd_product_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_blvd_product_catalog" ON blvd_product_catalog FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_blvd_product_sales" ON blvd_product_sales FOR ALL
  USING (true) WITH CHECK (true);

-- ============================================================
-- 4) Helpful views
-- ============================================================
CREATE OR REPLACE VIEW product_monthly_sales AS
SELECT
  DATE_TRUNC('month', sold_at)::DATE AS month,
  COALESCE(provider_staff_id::TEXT, 'unknown') AS provider_key,
  COUNT(DISTINCT order_id)::INT AS orders,
  ROUND(SUM(quantity)::NUMERIC, 2) AS units_sold,
  ROUND(SUM(net_sales)::NUMERIC, 2) AS net_sales,
  ROUND(AVG(NULLIF(net_sales, 0))::NUMERIC, 2) AS avg_line_value
FROM blvd_product_sales
GROUP BY 1, 2;

CREATE OR REPLACE VIEW product_sku_velocity AS
SELECT
  COALESCE(ps.sku, ps.product_name) AS sku_key,
  ps.sku,
  ps.product_name,
  ps.brand,
  ps.category,
  ROUND(SUM(ps.quantity) FILTER (WHERE ps.sold_at >= NOW() - INTERVAL '30 days')::NUMERIC, 2) AS units_30d,
  ROUND(SUM(ps.quantity) FILTER (WHERE ps.sold_at >= NOW() - INTERVAL '90 days')::NUMERIC, 2) AS units_90d,
  ROUND(SUM(ps.quantity) FILTER (WHERE ps.sold_at >= NOW() - INTERVAL '180 days')::NUMERIC, 2) AS units_180d,
  ROUND(SUM(ps.net_sales) FILTER (WHERE ps.sold_at >= NOW() - INTERVAL '90 days')::NUMERIC, 2) AS sales_90d,
  ROUND(AVG(ps.unit_price)::NUMERIC, 2) AS avg_unit_price,
  MAX(ps.sold_at) AS last_sold_at,
  COUNT(DISTINCT ps.client_id)::INT AS unique_buyers
FROM blvd_product_sales ps
GROUP BY 1, 2, 3, 4, 5;

CREATE OR REPLACE VIEW product_repeat_behavior AS
WITH client_product_orders AS (
  SELECT
    COALESCE(sku, product_name) AS sku_key,
    client_id,
    sold_at,
    order_id
  FROM blvd_product_sales
  WHERE client_id IS NOT NULL
),
client_counts AS (
  SELECT
    sku_key,
    client_id,
    COUNT(DISTINCT order_id)::INT AS purchase_count,
    MIN(sold_at) AS first_purchase_at,
    MAX(sold_at) AS last_purchase_at
  FROM client_product_orders
  GROUP BY sku_key, client_id
)
SELECT
  sku_key,
  COUNT(*)::INT AS buyers,
  COUNT(*) FILTER (WHERE purchase_count >= 2)::INT AS repeat_buyers,
  ROUND(
    CASE WHEN COUNT(*) > 0 THEN
      (COUNT(*) FILTER (WHERE purchase_count >= 2))::NUMERIC / COUNT(*)::NUMERIC * 100
    ELSE 0 END
  , 2) AS repeat_rate_pct,
  ROUND(AVG(purchase_count)::NUMERIC, 2) AS avg_purchase_count,
  ROUND(AVG(EXTRACT(DAY FROM (last_purchase_at - first_purchase_at)))::NUMERIC, 2) AS avg_days_between_first_last
FROM client_counts
GROUP BY sku_key;
