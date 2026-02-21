-- 013-referral-program.sql
-- Referral program: codes, referrals, events, shares.
-- Run in Supabase SQL Editor.

-- One referral code per member
CREATE TABLE referral_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  code            TEXT NOT NULL UNIQUE,
  custom_code     TEXT UNIQUE,
  tier            TEXT NOT NULL DEFAULT 'member'
                  CHECK (tier IN ('member', 'advocate', 'ambassador', 'vip_ambassador')),
  total_shares    INT NOT NULL DEFAULT 0,
  total_clicks    INT NOT NULL DEFAULT 0,
  total_signups   INT NOT NULL DEFAULT 0,
  total_completed INT NOT NULL DEFAULT 0,
  total_earned    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rc_code ON referral_codes(code);
CREATE INDEX idx_rc_member ON referral_codes(member_id);
CREATE INDEX idx_rc_tier ON referral_codes(tier);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Individual referral tracking from click to credit
CREATE TABLE referrals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id        UUID NOT NULL REFERENCES referral_codes(id),
  referrer_member_id      UUID NOT NULL REFERENCES members(id),
  referee_device_id       TEXT,
  referee_phone           TEXT,
  referee_email           TEXT,
  referee_member_id       UUID REFERENCES members(id),
  referee_blvd_client_id  UUID,
  landing_url             TEXT,
  share_channel           TEXT,
  status                  TEXT NOT NULL DEFAULT 'clicked'
                          CHECK (status IN ('clicked', 'booked', 'completed', 'credited', 'cancelled', 'expired', 'fraud_rejected')),
  booking_session_id      TEXT,
  appointment_blvd_id     TEXT,
  appointment_date        TIMESTAMPTZ,
  location_key            TEXT,
  referrer_reward_amount  NUMERIC(10,2) DEFAULT 25.00,
  referee_reward_amount   NUMERIC(10,2) DEFAULT 25.00,
  referrer_credit_issued  BOOLEAN NOT NULL DEFAULT FALSE,
  referrer_credited_at    TIMESTAMPTZ,
  referee_credit_issued   BOOLEAN NOT NULL DEFAULT FALSE,
  is_self_referral        BOOLEAN NOT NULL DEFAULT FALSE,
  fraud_flags             JSONB DEFAULT '[]',
  clicked_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  booked_at               TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  credited_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_code ON referrals(referral_code_id);
CREATE INDEX idx_ref_referrer ON referrals(referrer_member_id);
CREATE INDEX idx_ref_phone ON referrals(referee_phone);
CREATE INDEX idx_ref_device ON referrals(referee_device_id);
CREATE INDEX idx_ref_status ON referrals(status);
CREATE INDEX idx_ref_appointment ON referrals(appointment_blvd_id);
CREATE INDEX idx_ref_booked ON referrals(status, referrer_credit_issued)
  WHERE status = 'booked' AND referrer_credit_issued = FALSE;

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Audit log for state changes
CREATE TABLE referral_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id),
  event_type  TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_re_referral ON referral_events(referral_id);
CREATE INDEX idx_re_type ON referral_events(event_type);

ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Share action tracking per channel
CREATE TABLE referral_shares (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  member_id        UUID NOT NULL REFERENCES members(id),
  channel          TEXT NOT NULL,
  context          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rs_code ON referral_shares(referral_code_id);
CREATE INDEX idx_rs_member ON referral_shares(member_id);

ALTER TABLE referral_shares ENABLE ROW LEVEL SECURITY;
