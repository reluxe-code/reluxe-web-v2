-- 042: Package voucher sync + P5 campaign + P2 rename.
--
-- 1. Creates blvd_packages table for Boulevard package voucher data
-- 2. Renames voucher_recovery → membership_voucher (P2)
-- 3. Seeds package_voucher (P5) campaign with templates
-- 4. Adds series_intervals + expiry config to concierge engine

-- ── 1. New table: blvd_packages ──────────────────────────────

CREATE TABLE IF NOT EXISTS blvd_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boulevard_id TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES blvd_clients(id),
  client_boulevard_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  location_boulevard_id TEXT,
  location_key TEXT,
  vouchers JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blvd_packages_client ON blvd_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_blvd_packages_status ON blvd_packages(status);
CREATE INDEX IF NOT EXISTS idx_blvd_packages_boulevard ON blvd_packages(boulevard_id);
CREATE INDEX IF NOT EXISTS idx_blvd_packages_expires ON blvd_packages(expires_at) WHERE expires_at IS NOT NULL;

-- ── 2. Rename voucher_recovery → membership_voucher ──────────

UPDATE concierge_campaigns SET campaign_slug = 'membership_voucher' WHERE campaign_slug = 'voucher_recovery';
UPDATE concierge_queue SET campaign_slug = 'membership_voucher' WHERE campaign_slug = 'voucher_recovery';
UPDATE marketing_touches SET campaign_slug = 'membership_voucher' WHERE campaign_slug = 'voucher_recovery';
UPDATE concierge_links SET utm_campaign = 'membership_voucher' WHERE utm_campaign = 'voucher_recovery';

-- ── 3. Seed P5 campaign ──────────────────────────────────────

INSERT INTO concierge_campaigns (campaign_slug, cohort, priority, active, variant_a_template, variant_b_template, unavailable_template, ab_split)
VALUES (
  'package_voucher', 'P5', 5, true,
  'Hi {{first_name}}, you have {{sessions_remaining}} unused {{voucher_service}} session(s) from your package! {{voucher_expiry}}{{credit_reminder}}Book now: {{booking_link}}',
  '{{first_name}}, don''t forget - you still have {{sessions_remaining}} {{voucher_service}} session(s) ready to use! {{voucher_expiry}}{{credit_reminder}}Book here: {{booking_link}}',
  'Hi {{first_name}}, you have {{sessions_remaining}} unused {{voucher_service}} session(s) from your package! {{voucher_expiry}}{{credit_reminder}}Book now: {{booking_link}}',
  0.5
)
ON CONFLICT (campaign_slug) DO NOTHING;

-- ── 4. Update engine config with series intervals + expiry ───

UPDATE site_config
SET value = value || '{
  "series_intervals": {
    "morpheus8": 42,
    "microneedling": 28,
    "ipl": 28,
    "laser-hair-removal": 42
  },
  "package_standalone_inactivity_days": 21,
  "package_expiry_reminder_days": [90, 30, 7]
}'::jsonb,
updated_at = now()
WHERE key = 'concierge_engine';
