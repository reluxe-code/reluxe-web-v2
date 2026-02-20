-- Form capture security hardening
-- Store storage path (not public URL) so signed URLs can be generated on-demand.

ALTER TABLE IF EXISTS form_submissions
  ADD COLUMN IF NOT EXISTS raw_image_path TEXT;

-- Keep raw_image_url for backward compatibility; new writes should prefer raw_image_path.
CREATE INDEX IF NOT EXISTS idx_form_submissions_raw_image_path
  ON form_submissions(raw_image_path);
