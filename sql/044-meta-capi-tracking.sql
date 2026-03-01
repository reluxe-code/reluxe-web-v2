-- 044-meta-capi-tracking.sql
-- Track which completed appointments have been reported to Meta CAPI
-- so the incremental sync doesn't double-send offline conversions.

ALTER TABLE blvd_appointments
  ADD COLUMN IF NOT EXISTS meta_capi_sent_at TIMESTAMPTZ;

-- Partial index for fast lookup of unsent completed appointments
CREATE INDEX IF NOT EXISTS idx_blvd_appts_meta_capi_unsent
  ON blvd_appointments(status, meta_capi_sent_at)
  WHERE meta_capi_sent_at IS NULL AND status = 'completed';
