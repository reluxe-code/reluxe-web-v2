-- Migration: Expand testimonials table with location, provider, service, etc.
-- Run this in Supabase SQL Editor on the existing database.

-- 1. Add new columns
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'westfield';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS service TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS recommendable BOOLEAN DEFAULT true;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS review_date TIMESTAMPTZ;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reply_by TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS raw_services TEXT;

-- 2. Copy staff_name → provider for existing rows
UPDATE testimonials SET provider = staff_name WHERE provider IS NULL AND staff_name IS NOT NULL;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_location ON testimonials (location);
CREATE INDEX IF NOT EXISTS idx_testimonials_provider ON testimonials (provider);
CREATE INDEX IF NOT EXISTS idx_testimonials_service ON testimonials (service);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_recommendable ON testimonials (recommendable) WHERE recommendable = true;

-- 4. Update RLS policy to enforce recommendable
DROP POLICY IF EXISTS "Public can read published testimonials" ON testimonials;
CREATE POLICY "Public can read published testimonials"
  ON testimonials FOR SELECT
  USING (status = 'published' AND recommendable = true);
