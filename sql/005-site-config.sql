-- 005-site-config.sql
-- Generic key-value config table for site-wide settings.
-- Seed with the current treatment bundles so they're editable from admin.

CREATE TABLE IF NOT EXISTS site_config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed treatment bundles with items (slug + Boulevard display label)
INSERT INTO site_config (key, value) VALUES (
  'treatment_bundles',
  '[
    {"id":"relaxing-glow","title":"Relaxing Glow","description":"Unwind with a results-driven facial.","items":[{"slug":"facials","label":"Signature Facial"},{"slug":"glo2facial","label":"RELUXE Glo2"},{"slug":"hydrafacial","label":"RELUXE HydraFacial"}],"sort_order":0},
    {"id":"tone-texture","title":"Tone & Texture","description":"Even out and smooth your skin.","items":[{"slug":"ipl","label":"IPL Photofacial"},{"slug":"microneedling","label":"SkinPen Microneedling"}],"sort_order":1},
    {"id":"wrinkles-lines","title":"Wrinkles & Lines","description":"Smooth expression lines.","items":[{"slug":"tox","label":"Tox"}],"sort_order":2},
    {"id":"facial-balancing","title":"Facial Balancing","description":"Restore volume & symmetry.","items":[{"slug":"filler","label":"Dermal Fillers"},{"slug":"sculptra","label":"Sculptra"}],"sort_order":3},
    {"id":"glp1-protocol","title":"GLP-1 Protocol","description":"Address volume changes from weight loss.","items":[{"slug":"morpheus8","label":"Morpheus8"},{"slug":"filler","label":"Dermal Fillers"}],"sort_order":4},
    {"id":"wow-factor","title":"The Wow Factor","description":"Maximum transformation.","items":[{"slug":"morpheus8","label":"Morpheus8"},{"slug":"sculptra","label":"Sculptra"}],"sort_order":5}
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- RLS: public read, service-role write
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_config"
  ON site_config FOR SELECT
  USING (true);

CREATE POLICY "Service role write site_config"
  ON site_config FOR ALL
  USING (true)
  WITH CHECK (true);
