-- 063-admin-access-logs.sql
-- Audit trail for admin identity resolution via PHI Proxy / JIT endpoint.
-- Every time an admin views client PII, a row is logged here.
-- Retention: 24 months.

CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_email TEXT,
  boulevard_id TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'VIEW_CLIENT',
  reveal_level TEXT NOT NULL DEFAULT 'masked'
    CHECK (reveal_level IN ('masked', 'full')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for audit queries (by admin, by client, by time)
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin
  ON admin_access_logs (admin_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_access_logs_boulevard
  ON admin_access_logs (boulevard_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_access_logs_created
  ON admin_access_logs (created_at DESC);

-- RLS: service_role only
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_access_logs_service"
  ON admin_access_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
