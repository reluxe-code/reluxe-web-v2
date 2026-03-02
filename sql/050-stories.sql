-- 050-stories.sql
-- Patient spotlight stories (Blake Mohler, etc.)

CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',

  -- Person info
  person_name TEXT NOT NULL,
  person_title TEXT,
  person_image TEXT,

  -- Page content
  title TEXT NOT NULL,
  subtitle TEXT,
  hero_image TEXT,
  hero_video_url TEXT,
  intro TEXT,
  body_html TEXT,

  -- Structured data (JSONB)
  treatments JSONB DEFAULT '[]',
  social_embeds JSONB DEFAULT '[]',
  gallery JSONB DEFAULT '[]',

  -- CTA
  cta_text TEXT DEFAULT 'Book Your Consultation',
  cta_link TEXT DEFAULT '/start/not-sure',

  -- SEO
  meta_description TEXT,
  og_image TEXT,

  -- Ordering & display
  sort_order INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: public read for published stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published stories"
  ON stories FOR SELECT
  USING (status = 'published');

CREATE POLICY "Service role full access on stories"
  ON stories FOR ALL
  USING (true)
  WITH CHECK (true);
