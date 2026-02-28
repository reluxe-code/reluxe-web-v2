-- 040: Provider Unavailable support for concierge engine.
-- Adds an "unavailable_template" column to concierge_campaigns for generic SMS
-- when a patient's last provider has left or is otherwise unavailable.
-- The list of unavailable provider slugs is stored in site_config -> concierge_engine JSON.

ALTER TABLE concierge_campaigns
  ADD COLUMN IF NOT EXISTS unavailable_template TEXT;

-- P1 Tox Journey (generic — no provider name)
UPDATE concierge_campaigns SET
  unavailable_template = 'Hi {{first_name}}, it''s been {{days_overdue}} days since your last tox treatment. Ready for a refresh? {{credit_reminder}}Book now: {{booking_link}}'
WHERE campaign_slug = 'tox_journey';

-- P2 Voucher Recovery (generic — no provider name)
UPDATE concierge_campaigns SET
  unavailable_template = 'Hi {{first_name}}, you have an unused {{voucher_service}} voucher from your membership! We have availability this week. {{credit_reminder}}Book now: {{booking_link}}'
WHERE campaign_slug = 'voucher_recovery';

-- P3 Aesthetic Winback (generic — no provider name)
UPDATE concierge_campaigns SET
  unavailable_template = 'Hi {{first_name}}, it''s been a while since your last {{service_name}}. Time for your next glow-up! {{credit_reminder}}Book now: {{booking_link}}'
WHERE campaign_slug = 'aesthetic_winback';

-- P4 Last-Minute Gap (generic — no provider name)
UPDATE concierge_campaigns SET
  unavailable_template = 'Hi {{first_name}}, a same-day opening just appeared at our {{location_name}} location! {{credit_reminder}}Grab it: {{booking_link}}'
WHERE campaign_slug = 'last_minute_gap';
