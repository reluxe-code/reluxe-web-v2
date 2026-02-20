-- 004-appointments-sync.sql
-- Tables for Boulevard appointment & client data sync.
-- Run against your Supabase database after 003-boulevard-ids.sql.

-- ============================================================
-- Clients synced from Boulevard
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]',
  first_visit_at TIMESTAMPTZ,
  last_visit_at TIMESTAMPTZ,
  visit_count INT DEFAULT 0,
  total_spend DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Appointments synced from Boulevard
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES blvd_clients(id),
  client_boulevard_id TEXT,
  location_id TEXT,             -- Boulevard location ID
  location_key TEXT,            -- our key: 'westfield' or 'carmel'
  status TEXT NOT NULL,         -- booked, confirmed, arrived, started, completed, cancelled, no_show
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  duration_minutes INT,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Line items (services) within each appointment
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_appointment_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES blvd_appointments(id) ON DELETE CASCADE,
  boulevard_service_id TEXT,
  service_name TEXT NOT NULL,
  service_category TEXT,
  service_slug TEXT,            -- our internal slug (tox, filler, facials, etc.)
  provider_boulevard_id TEXT,
  provider_staff_id UUID REFERENCES staff(id),
  price DECIMAL(10,2),
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Sync log — tracks backfill and incremental runs
-- ============================================================
CREATE TABLE IF NOT EXISTS blvd_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,      -- 'backfill', 'incremental', 'webhook'
  status TEXT NOT NULL,         -- 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  records_processed INT DEFAULT 0,
  records_created INT DEFAULT 0,
  records_updated INT DEFAULT 0,
  cursor TEXT,                  -- for resumable pagination
  error TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blvd_clients_email ON blvd_clients(email);
CREATE INDEX IF NOT EXISTS idx_blvd_clients_boulevard ON blvd_clients(boulevard_id);
CREATE INDEX IF NOT EXISTS idx_blvd_appointments_client ON blvd_appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_blvd_appointments_status ON blvd_appointments(status);
CREATE INDEX IF NOT EXISTS idx_blvd_appointments_start ON blvd_appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_blvd_appointments_location ON blvd_appointments(location_key);
CREATE INDEX IF NOT EXISTS idx_blvd_appt_svc_appt ON blvd_appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_blvd_appt_svc_provider ON blvd_appointment_services(provider_boulevard_id);
CREATE INDEX IF NOT EXISTS idx_blvd_appt_svc_slug ON blvd_appointment_services(service_slug);
CREATE INDEX IF NOT EXISTS idx_blvd_sync_log_type ON blvd_sync_log(sync_type, status);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE blvd_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE blvd_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blvd_appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blvd_sync_log ENABLE ROW LEVEL SECURITY;

-- Service role has full access (admin/API routes only)
CREATE POLICY "service_role_blvd_clients" ON blvd_clients FOR ALL
  USING (true) WITH CHECK (true);
CREATE POLICY "service_role_blvd_appointments" ON blvd_appointments FOR ALL
  USING (true) WITH CHECK (true);
CREATE POLICY "service_role_blvd_appointment_services" ON blvd_appointment_services FOR ALL
  USING (true) WITH CHECK (true);
CREATE POLICY "service_role_blvd_sync_log" ON blvd_sync_log FOR ALL
  USING (true) WITH CHECK (true);
