-- 010-members.sql
-- Member Identity Engine: stores member profiles linked to Supabase Auth + Boulevard clients.
-- Run after 004-appointments-sync.sql.

-- ============================================================
-- Members table
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  blvd_client_id UUID REFERENCES blvd_clients(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  interests TEXT[] DEFAULT '{}',
  preferred_location TEXT,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_auth ON members(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_members_blvd ON members(blvd_client_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Members can read their own row
CREATE POLICY "members_own_read" ON members
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Members can update their own row
CREATE POLICY "members_own_update" ON members
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Service role has full access (API routes)
CREATE POLICY "members_service_all" ON members
  FOR ALL USING (true) WITH CHECK (true);
