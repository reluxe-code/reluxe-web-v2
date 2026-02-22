-- sql/022-products.sql
-- Product platform: brands + products tables for skincare commerce

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  hero_image TEXT,
  affiliate_url TEXT,
  purchase_type TEXT NOT NULL DEFAULT 'in_clinic'
    CHECK (purchase_type IN ('affiliate', 'in_clinic', 'direct')),
  website TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active_sort ON brands(active, sort_order);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active brands"
  ON brands FOR SELECT
  USING (active = true);

CREATE POLICY "Service role full access to brands"
  ON brands FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  blvd_catalog_id UUID REFERENCES blvd_product_catalog(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  short_description TEXT,
  category TEXT,
  image_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  price NUMERIC(10,2),
  size TEXT,
  key_ingredients TEXT[] DEFAULT '{}',
  skin_types TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}',
  how_to_use TEXT,
  pro_tip TEXT,
  faq JSONB DEFAULT '[]',
  related_services TEXT[] DEFAULT '{}',
  staff_picks JSONB,
  post_procedure JSONB,
  purchase_url TEXT,
  purchase_type TEXT
    CHECK (purchase_type IS NULL OR purchase_type IN ('affiliate', 'in_clinic', 'direct')),
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  sales_rank INT,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sales_rank ON products(sales_rank);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_brand_active_sort ON products(brand_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_blvd ON products(blvd_catalog_id) WHERE blvd_catalog_id IS NOT NULL;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Service role full access to products"
  ON products FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
