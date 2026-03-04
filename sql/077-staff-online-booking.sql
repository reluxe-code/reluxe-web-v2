-- 077: Add allow_online_booking flag to staff table
-- Allows disabling individual providers from online booking without removing their Boulevard data.

ALTER TABLE staff ADD COLUMN IF NOT EXISTS allow_online_booking BOOLEAN DEFAULT true;

-- Backfill NULLs (in case column was added without a default previously)
UPDATE staff SET allow_online_booking = true WHERE allow_online_booking IS NULL;

-- Disable Krista from online booking
UPDATE staff SET allow_online_booking = false WHERE slug = 'krista';
