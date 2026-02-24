-- 028: Add Boulevard sync columns to gift_card_orders
-- Tracks whether each gift card order has been synced to Boulevard

ALTER TABLE gift_card_orders
  ADD COLUMN IF NOT EXISTS blvd_gift_card_id TEXT,
  ADD COLUMN IF NOT EXISTS blvd_synced BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN gift_card_orders.blvd_gift_card_id IS 'Boulevard gift card ID returned from createGiftCard mutation';
COMMENT ON COLUMN gift_card_orders.blvd_synced IS 'Whether the gift card has been created in Boulevard';
