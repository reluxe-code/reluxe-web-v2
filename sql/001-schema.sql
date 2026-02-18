-- RELUXE Med Spa — Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project.

-- ===========================================
-- 1. TABLES
-- ===========================================

-- Blog categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly specials / deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  price TEXT,
  compare_at TEXT,
  tag TEXT,
  image TEXT,
  cta_url TEXT,
  cta_text TEXT DEFAULT 'Learn more',
  start_date DATE,
  end_date DATE,
  locations TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  featured_image TEXT,
  transparent_bg TEXT,
  booking_url TEXT,
  fun_fact TEXT,
  video_intro TEXT,
  role TEXT,
  locations JSONB DEFAULT '[]',
  specialties JSONB DEFAULT '[]',
  credentials JSONB DEFAULT '[]',
  availability JSONB DEFAULT '[]',
  social_profiles JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  staff_name TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  featured_image TEXT,
  full_address TEXT,
  city TEXT,
  state TEXT DEFAULT 'IN',
  zip TEXT,
  phone TEXT,
  email TEXT,
  directions_south TEXT,
  directions_north TEXT,
  directions_465 TEXT,
  lat NUMERIC,
  lng NUMERIC,
  hours JSONB DEFAULT '{}',
  faqs JSONB DEFAULT '[]',
  gallery JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- 2. INDEXES (performance)
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals (slug);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON deals (start_date, end_date) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_staff_slug ON staff (slug);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff (status);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations (slug);

-- Full-text search index for blog posts (used by search page)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_blog_posts_fts ON blog_posts USING GIN (fts);

-- ===========================================
-- 3. ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anon/public: read published records only
CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published deals"
  ON deals FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published staff"
  ON staff FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published testimonials"
  ON testimonials FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read locations"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- Service role bypasses RLS automatically, so no policies needed for admin writes.
-- The service role key is used server-side only (API routes, getStaticProps).

-- ===========================================
-- 4. STORAGE BUCKET
-- ===========================================
-- Run this in Supabase Dashboard → Storage → Create Bucket:
--   Name: media
--   Public: ON
--
-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on media bucket
CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Allow authenticated users (admin) to upload
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ===========================================
-- 5. HELPER FUNCTION: blog search
-- ===========================================

CREATE OR REPLACE FUNCTION search_blog_posts(search_query TEXT, result_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  excerpt TEXT,
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE sql STABLE
AS $$
  SELECT
    bp.id,
    bp.slug,
    bp.title,
    bp.excerpt,
    bp.featured_image,
    bp.published_at,
    ts_rank(bp.fts, websearch_to_tsquery('english', search_query)) AS rank
  FROM blog_posts bp
  WHERE bp.status = 'published'
    AND bp.fts @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
$$;
