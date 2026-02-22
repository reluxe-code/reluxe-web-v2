-- 017-memberships-sync.sql
-- Boulevard membership sync table + account credit tracking.
-- Run after 004-appointments-sync.sql.

-- ============================================================
-- Memberships synced from Boulevard
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES blvd_clients(id),
  client_boulevard_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,               -- ACTIVE, CANCELLED, PAST_DUE, PAUSED
  start_on DATE NOT NULL,
  end_on DATE,
  cancel_on DATE,
  next_charge_date DATE,
  unpause_on DATE,
  interval TEXT,                       -- ISO 8601 duration: P1M, P1Y, etc.
  unit_price INT DEFAULT 0,           -- cents
  term_number INT DEFAULT 1,
  location_boulevard_id TEXT,
  location_key TEXT,
  vouchers JSONB DEFAULT '[]',        -- [{quantity, services: [{id, name}]}]
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Account credit cache (synced from Boulevard per client)
-- ============================================================
ALTER TABLE blvd_clients
  ADD COLUMN IF NOT EXISTS account_credit INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_credit_updated_at TIMESTAMPTZ;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blvd_memberships_client ON blvd_memberships(client_id);
CREATE INDEX IF NOT EXISTS idx_blvd_memberships_blvd_client ON blvd_memberships(client_boulevard_id);
CREATE INDEX IF NOT EXISTS idx_blvd_memberships_status ON blvd_memberships(status);
CREATE INDEX IF NOT EXISTS idx_blvd_memberships_boulevard ON blvd_memberships(boulevard_id);
CREATE INDEX IF NOT EXISTS idx_blvd_clients_credit ON blvd_clients(account_credit) WHERE account_credit > 0;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE blvd_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_blvd_memberships" ON blvd_memberships FOR ALL
  USING (true) WITH CHECK (true);
