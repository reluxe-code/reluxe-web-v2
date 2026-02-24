-- 025-velocity-loyalty.sql
-- Velocity Loyalty Rewards: ledger, config, promotions, balance cache.

-- ============================================================
-- Program Configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key TEXT,
  earn_rate NUMERIC(6,4) NOT NULL DEFAULT 0.01,
  expiry_days INT NOT NULL DEFAULT 90,
  excluded_service_slugs TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  paused_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (location_key)
);

-- Seed global default
INSERT INTO velocity_config (location_key) VALUES (NULL)
ON CONFLICT (location_key) DO NOTHING;

-- ============================================================
-- Service Multipliers (time-limited bonuses per service)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_service_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL,
  multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.0,
  label TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  location_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vsm_slug ON velocity_service_multipliers(service_slug);
CREATE INDEX IF NOT EXISTS idx_vsm_active ON velocity_service_multipliers(is_active, starts_at, ends_at);

-- ============================================================
-- Promotions (configurable promotional credits)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'bulk', 'app_download', 'first_login', 'manual'
  )),
  expiry_days INT NOT NULL DEFAULT 90,
  one_per_member BOOLEAN NOT NULL DEFAULT true,
  max_claims INT,
  total_claimed INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Velocity Ledger (immutable audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  blvd_client_id UUID REFERENCES blvd_clients(id),

  event_type TEXT NOT NULL CHECK (event_type IN (
    'earn', 'earn_package', 'expire', 'freeze', 'unfreeze',
    'reactivate', 'clawback', 'manual_adjust', 'import',
    'promo',
    'bonus_rebook', 'bonus_package_complete'
  )),

  promotion_id UUID REFERENCES velocity_promotions(id),

  amount_cents INT NOT NULL DEFAULT 0,
  balance_after_cents INT NOT NULL DEFAULT 0,

  -- Linkage
  appointment_id UUID REFERENCES blvd_appointments(id),
  appointment_boulevard_id TEXT,
  service_name TEXT,
  location_key TEXT,

  -- Earn metadata
  qualifying_spend_cents INT,
  earn_rate NUMERIC(6,4),
  multiplier NUMERIC(4,2) DEFAULT 1.0,

  -- Expiry tracking
  expires_at TIMESTAMPTZ,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  frozen_until_appointment_id UUID,
  expired_at TIMESTAMPTZ,

  -- BLVD sync
  blvd_pushed BOOLEAN NOT NULL DEFAULT false,
  blvd_push_failed BOOLEAN NOT NULL DEFAULT false,

  -- Phase 2
  rebook_bonus_status TEXT CHECK (rebook_bonus_status IN ('pending', 'confirmed', 'voided')),

  -- Admin
  admin_note TEXT,
  admin_user_email TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vl_member ON velocity_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_vl_type ON velocity_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_vl_appointment ON velocity_ledger(appointment_id);
CREATE INDEX IF NOT EXISTS idx_vl_expires ON velocity_ledger(expires_at)
  WHERE event_type IN ('earn', 'earn_package', 'import', 'promo') AND expired_at IS NULL AND amount_cents > 0;
CREATE INDEX IF NOT EXISTS idx_vl_frozen ON velocity_ledger(is_frozen)
  WHERE is_frozen = true;
CREATE INDEX IF NOT EXISTS idx_vl_member_active ON velocity_ledger(member_id, event_type, expired_at)
  WHERE event_type IN ('earn', 'earn_package', 'import', 'promo') AND expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vl_blvd_appt ON velocity_ledger(appointment_boulevard_id);
CREATE INDEX IF NOT EXISTS idx_vl_unpushed ON velocity_ledger(blvd_pushed, member_id)
  WHERE blvd_pushed = false AND amount_cents > 0;

-- ============================================================
-- Promotion Claims (prevents double-claiming)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_promotion_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES velocity_promotions(id),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  ledger_entry_id UUID REFERENCES velocity_ledger(id),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promotion_id, member_id)
);

-- ============================================================
-- Balance Cache (denormalized for fast reads)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_balances (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  total_earned_cents INT NOT NULL DEFAULT 0,
  total_expired_cents INT NOT NULL DEFAULT 0,
  active_balance_cents INT NOT NULL DEFAULT 0,
  next_expiry_at TIMESTAMPTZ,
  next_expiry_amount_cents INT DEFAULT 0,
  has_active_booking BOOLEAN NOT NULL DEFAULT false,
  last_earn_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Processed Appointments (idempotency guard)
-- ============================================================
CREATE TABLE IF NOT EXISTS velocity_processed_appointments (
  appointment_id UUID PRIMARY KEY REFERENCES blvd_appointments(id),
  member_id UUID NOT NULL REFERENCES members(id),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  qualifying_spend_cents INT NOT NULL DEFAULT 0,
  earned_cents INT NOT NULL DEFAULT 0,
  skipped_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_vpa_member ON velocity_processed_appointments(member_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE velocity_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_service_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_promotion_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_processed_appointments ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_role_velocity_config" ON velocity_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_multipliers" ON velocity_service_multipliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_promotions" ON velocity_promotions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_ledger" ON velocity_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_claims" ON velocity_promotion_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_balances" ON velocity_balances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_velocity_processed" ON velocity_processed_appointments FOR ALL USING (true) WITH CHECK (true);

-- Members can read their own data
CREATE POLICY "member_read_own_ledger" ON velocity_ledger
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "member_read_own_balance" ON velocity_balances
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "member_read_own_claims" ON velocity_promotion_claims
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );
