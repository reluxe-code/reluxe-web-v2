-- 018-leads.sql
-- Lead management & campaign attribution.
-- Run in Supabase SQL Editor.

-- ============================================================
-- Main leads table
-- ============================================================
CREATE TABLE leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info (from Facebook / any source)
  first_name          TEXT,
  last_name           TEXT,
  email               TEXT,
  phone               TEXT,

  -- Attribution
  source              TEXT NOT NULL DEFAULT 'facebook',
  platform            TEXT,
  campaign            TEXT,
  ad_set              TEXT,
  ad_name             TEXT,

  -- Service interest (parsed from campaign or set manually)
  service_interest    TEXT,

  -- Pipeline status
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'contacted', 'booked', 'converted', 'lost')),

  -- Conversion linkage
  blvd_client_id      UUID REFERENCES blvd_clients(id),
  first_appointment_id UUID REFERENCES blvd_appointments(id),
  converted_at        TIMESTAMPTZ,
  days_to_convert     INT,

  -- Notes & metadata
  notes               TEXT,
  tags                JSONB DEFAULT '[]',
  raw_payload         JSONB DEFAULT '{}',

  -- Source timestamp (when the lead was created on FB, not when ingested)
  source_created_at   TIMESTAMPTZ,

  -- Standard timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Lead status change audit log
-- ============================================================
CREATE TABLE lead_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_campaign ON leads(campaign) WHERE campaign IS NOT NULL;
CREATE INDEX idx_leads_service ON leads(service_interest) WHERE service_interest IS NOT NULL;
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_blvd_client ON leads(blvd_client_id) WHERE blvd_client_id IS NOT NULL;
CREATE INDEX idx_leads_source_status ON leads(source, status);

CREATE INDEX idx_lead_events_lead ON lead_events(lead_id);
CREATE INDEX idx_lead_events_type ON lead_events(event_type);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_leads" ON leads FOR ALL
  USING (true) WITH CHECK (true);
CREATE POLICY "service_role_lead_events" ON lead_events FOR ALL
  USING (true) WITH CHECK (true);

-- ============================================================
-- Phone index on blvd_clients (needed for lead-to-client matching)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blvd_clients_phone
  ON blvd_clients(phone)
  WHERE phone IS NOT NULL;
