-- 070-daily-cap-flag.sql
-- Add DAILY_CAP and CAMPAIGN_COOLDOWN to concierge_queue flag_reason CHECK constraint.

ALTER TABLE concierge_queue DROP CONSTRAINT IF EXISTS concierge_queue_flag_reason_check;
ALTER TABLE concierge_queue ADD CONSTRAINT concierge_queue_flag_reason_check
  CHECK (flag_reason IS NULL OR flag_reason IN (
    'CAP_REACHED','ALREADY_BOOKED','QUIET_HOURS',
    'NEGATIVE_SIGNAL_SUPPRESSION','NO_PROVIDER_AVAILABILITY','SEND_FAILED',
    'OPTED_OUT','LOW_ENGAGEMENT',
    'DAILY_CAP','CAMPAIGN_COOLDOWN'
  ));
