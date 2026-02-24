-- 029: Update gift_card_promotions to allow new promo types
-- Adds bonus_flat and bonus_tiered to the allowed promo_type values

-- Drop the old CHECK constraint and add the updated one
ALTER TABLE gift_card_promotions DROP CONSTRAINT IF EXISTS gift_card_promotions_promo_type_check;
ALTER TABLE gift_card_promotions ADD CONSTRAINT gift_card_promotions_promo_type_check
  CHECK (promo_type IN (
    'bonus_fixed', 'bonus_percentage', 'discount_fixed', 'discount_percentage',
    'service_voucher', 'bonus_flat', 'bonus_tiered'
  ));

-- Also ensure blvd columns exist on gift_card_orders (028 may not have been run)
ALTER TABLE gift_card_orders
  ADD COLUMN IF NOT EXISTS blvd_gift_card_id TEXT,
  ADD COLUMN IF NOT EXISTS blvd_synced BOOLEAN NOT NULL DEFAULT false;
