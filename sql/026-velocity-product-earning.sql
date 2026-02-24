-- 026-velocity-product-earning.sql
-- Add product sale earning to the Velocity rewards system.

-- 1. Add product_sale_id column to velocity_ledger
ALTER TABLE velocity_ledger
  ADD COLUMN IF NOT EXISTS product_sale_id UUID REFERENCES blvd_product_sales(id);

CREATE INDEX IF NOT EXISTS idx_vl_product_sale ON velocity_ledger(product_sale_id)
  WHERE product_sale_id IS NOT NULL;

-- 2. Update event_type CHECK constraint to include 'earn_product'
ALTER TABLE velocity_ledger DROP CONSTRAINT IF EXISTS velocity_ledger_event_type_check;
ALTER TABLE velocity_ledger ADD CONSTRAINT velocity_ledger_event_type_check
  CHECK (event_type IN (
    'earn', 'earn_package', 'earn_product', 'expire', 'freeze', 'unfreeze',
    'reactivate', 'clawback', 'manual_adjust', 'import',
    'promo',
    'bonus_rebook', 'bonus_package_complete'
  ));
