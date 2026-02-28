-- 039: Update concierge SMS templates.
-- - Shorter, GSM-7 safe copy (no smart quotes/em dashes)
-- - Footer (RELUXE branding, reply/call CTA, STOP opt-out) is now auto-appended by smsBuilder.js
-- - Target: body ≤ 240 chars so total with footer stays within 2 SMS segments (320 chars)

-- P1 Tox Journey
UPDATE concierge_campaigns SET
  variant_a_template = 'Hi {{first_name}}, it''s been {{days_overdue}} days since your last tox with {{provider_name}}. Ready for a refresh? {{credit_reminder}}Book now: {{booking_link}}',
  variant_b_template = 'Hey {{first_name}}, {{provider_name}} has openings this week for your tox touch-up. Don''t wait too long! {{credit_reminder}}Book here: {{booking_link}}',
  updated_at = now()
WHERE campaign_slug = 'tox_journey';

-- P2 Voucher Recovery
UPDATE concierge_campaigns SET
  variant_a_template = 'Hi {{first_name}}, you have an unused {{voucher_service}} voucher from your membership! {{provider_name}} has availability. {{credit_reminder}}Book now: {{booking_link}}',
  variant_b_template = '{{first_name}}, don''t let your {{voucher_service}} voucher go to waste! {{provider_name}} can see you this week. {{credit_reminder}}Book here: {{booking_link}}',
  updated_at = now()
WHERE campaign_slug = 'voucher_recovery';

-- P3 Aesthetic Winback
UPDATE concierge_campaigns SET
  variant_a_template = 'Hi {{first_name}}, it''s been about 60 days since your {{service_name}} with {{provider_name}}. Time for your next glow-up! {{credit_reminder}}Book now: {{booking_link}}',
  variant_b_template = 'Miss that post-facial glow, {{first_name}}? {{provider_name}} has openings for your next {{service_name}}. {{credit_reminder}}Book here: {{booking_link}}',
  updated_at = now()
WHERE campaign_slug = 'aesthetic_winback';

-- P4 Last-Minute Gap
UPDATE concierge_campaigns SET
  variant_a_template = 'Hi {{first_name}}, a same-day opening just appeared with {{provider_name}} at our {{location_name}} location! {{credit_reminder}}Grab it: {{booking_link}}',
  variant_b_template = '{{first_name}}, {{provider_name}} just had a cancellation at {{location_name}}. Want the spot? {{credit_reminder}}Book now: {{booking_link}}',
  updated_at = now()
WHERE campaign_slug = 'last_minute_gap';
