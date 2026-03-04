-- 077: Add allow_online_booking flag to staff table
-- Allows disabling individual providers from online booking without removing their Boulevard data.

ALTER TABLE staff ADD COLUMN IF NOT EXISTS allow_online_booking BOOLEAN DEFAULT true;

-- Disable Krista from online booking
UPDATE staff SET allow_online_booking = false WHERE slug = 'krista';
