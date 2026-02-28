-- 036-audit-flag.sql
-- Seed the audit tracking feature flag (enabled by default).

INSERT INTO site_config (key, value)
VALUES ('audit_tracking_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
