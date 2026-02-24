-- =============================================================
-- 027: Gift Card System
-- Tables for gift card sales, promotions, redemption, and service gifting (v2)
-- =============================================================

-- Gift Card Promotions (admin-configurable deals + promo codes)
CREATE TABLE IF NOT EXISTS gift_card_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  badge_text TEXT,
  promo_code TEXT UNIQUE,
  min_purchase_cents INT NOT NULL DEFAULT 0,
  max_purchase_cents INT,
  promo_type TEXT NOT NULL CHECK (promo_type IN (
    'bonus_fixed', 'bonus_percentage', 'discount_fixed', 'discount_percentage', 'service_voucher'
  )),
  promo_value_cents INT,
  promo_percentage NUMERIC(5,2),
  bonus_service_name TEXT,
  bonus_recipient TEXT NOT NULL DEFAULT 'recipient' CHECK (bonus_recipient IN ('sender', 'recipient', 'choice')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  max_claims INT,
  total_claimed INT NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gift Card Orders (immutable purchase record)
CREATE TABLE IF NOT EXISTS gift_card_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_payment_id TEXT UNIQUE,
  square_order_id TEXT,
  amount_cents INT NOT NULL,
  discount_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_member_id UUID REFERENCES members(id),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_member_id UUID REFERENCES members(id),
  personal_message TEXT,
  occasion TEXT,
  deliver_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'scheduled', 'sent', 'failed')),
  promotion_id UUID REFERENCES gift_card_promotions(id),
  promo_code_used TEXT,
  bonus_amount_cents INT DEFAULT 0,
  bonus_recipient_choice TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gco_stripe ON gift_card_orders(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_gco_sender ON gift_card_orders(sender_email);
CREATE INDEX IF NOT EXISTS idx_gco_recipient ON gift_card_orders(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gco_delivery ON gift_card_orders(delivery_status, deliver_at)
  WHERE payment_status = 'paid';

-- Gift Cards (individual redeemable units)
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES gift_card_orders(id),
  code TEXT UNIQUE NOT NULL,
  original_amount_cents INT NOT NULL,
  remaining_amount_cents INT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'monetary' CHECK (card_type IN ('monetary', 'service_voucher')),
  service_name TEXT,
  owner_member_id UUID REFERENCES members(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 years'),
  claimed_at TIMESTAMPTZ,
  claim_token TEXT UNIQUE,
  is_bonus BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gc_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gc_owner ON gift_cards(owner_member_id);
CREATE INDEX IF NOT EXISTS idx_gc_order ON gift_cards(order_id);
CREATE INDEX IF NOT EXISTS idx_gc_status ON gift_cards(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_gc_claim ON gift_cards(claim_token) WHERE claim_token IS NOT NULL;

-- Gift Card Transactions (redemption/adjustment ledger)
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'purchase', 'bonus', 'redeem', 'refund', 'manual_adjust'
  )),
  amount_cents INT NOT NULL,
  balance_after_cents INT NOT NULL,
  admin_note TEXT,
  admin_user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gct_card ON gift_card_transactions(gift_card_id);

-- Giftable Services (v2 — create table now, build UI later)
CREATE TABLE IF NOT EXISTS giftable_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE gift_card_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftable_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_gcp" ON gift_card_promotions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gco" ON gift_card_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gc" ON gift_cards FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gct" ON gift_card_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gs" ON giftable_services FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read for active promotions
CREATE POLICY "public_read_active_promos" ON gift_card_promotions
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));

-- Members can read their own gift cards
CREATE POLICY "member_read_own_gc" ON gift_cards
  FOR SELECT TO authenticated
  USING (owner_member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

CREATE POLICY "member_read_own_orders" ON gift_card_orders
  FOR SELECT TO authenticated
  USING (
    sender_member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
    OR recipient_member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );
