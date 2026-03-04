-- 069-product-sales-drop-raw.sql
-- Remove the `raw` JSONB column from blvd_product_sales.
-- This column stored full CSV rows including PII (Client Name, Client Email, etc.).
-- The sync code no longer writes to it (product-sales.js fix), so drop it entirely.

ALTER TABLE blvd_product_sales DROP COLUMN IF EXISTS raw;
