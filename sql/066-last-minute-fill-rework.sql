-- 066-last-minute-fill-rework.sql
-- Rework P5 Last-Minute Gap → proactive "Last-Minute Fill" cohort.
-- Adds lead_id + sub_audience columns to concierge_queue,
-- updates SMS templates for the two-audience approach.

-- ============================================================
-- 1. Add lead_id + sub_audience to concierge_queue
-- ============================================================
ALTER TABLE concierge_queue ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE concierge_queue ADD COLUMN IF NOT EXISTS sub_audience TEXT;
CREATE INDEX IF NOT EXISTS idx_cq_lead ON concierge_queue(lead_id) WHERE lead_id IS NOT NULL;

-- ============================================================
-- 2. Update P5 SMS templates
-- ============================================================
-- Single template works for both sub-audiences because
-- {{service_name}} = "Consultation" for prospects, actual service for returning clients.
UPDATE concierge_campaigns SET
  variant_a_template = 'Hi {{first_name}}, we have some last-minute openings at RELUXE this week! We''d love to get you in for a {{service_name}}. {{credit_reminder}}Book here: {{booking_link}}',
  variant_b_template = '{{first_name}}, a few openings just came available at RELUXE. Perfect time to book your {{service_name}}! {{credit_reminder}}Grab a spot: {{booking_link}}',
  unavailable_template = 'Hi {{first_name}}, we have some last-minute openings at RELUXE this week! We''d love to get you in for a {{service_name}}. {{credit_reminder}}Book here: {{booking_link}}',
  updated_at = now()
WHERE campaign_slug = 'last_minute_gap';
