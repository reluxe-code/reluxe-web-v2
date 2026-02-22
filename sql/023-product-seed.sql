-- sql/023-product-seed.sql
-- Seed 5 brands + 30 products from existing hardcoded skincare pages

-- ============================================================
-- BRANDS
-- ============================================================
INSERT INTO brands (slug, name, tagline, description, logo_url, hero_image, affiliate_url, purchase_type, website, sort_order) VALUES
(
  'skinbetter-science',
  'skinbetter science',
  'AlphaRet®, InterFuse®, Alto Advanced.',
  'Clinical, elegant formulas that deliver visible results with great tolerability. skinbetter science combines patented technologies like AlphaRet® with sophisticated delivery systems.',
  '/images/brands/skinbetter-logo.png',
  '/images/brands/skinbetter-hero.png',
  'https://connect.skinbetter.com/reluxemedspa',
  'affiliate',
  'https://skinbetter.com',
  1
),
(
  'colorescience',
  'Colorescience',
  'Total Protection™ mineral suncare & color-correctors.',
  'Mineral SPF and corrective color that patients love to wear daily. Colorescience combines sun protection with skincare benefits in elegant, wearable formulas.',
  '/images/brands/colorscience-logo.jpg',
  '/images/brands/colorscience-hero.png',
  'https://www.colorescience.com/?designate-location=25130',
  'affiliate',
  'https://colorescience.com',
  2
),
(
  'skinceuticals',
  'SkinCeuticals',
  'Antioxidant pioneers (CE Ferulic®, Silymarin CF).',
  'Gold-standard antioxidants and targeted correctives backed by decades of clinical research. SkinCeuticals is the dermatologist-recommended brand for photoaging and pigmentation.',
  '/images/brands/skinceuticals-logo.png',
  '/images/brands/skinceuticals-hero.jpg',
  NULL,
  'in_clinic',
  'https://skinceuticals.com',
  3
),
(
  'hydrinity',
  'Hydrinity',
  'Accelerated recovery & deep hydration.',
  'Recovery-first skincare that speeds healing after lasers, microneedling, and resurfacing. Hydrinity is the go-to for post-procedure comfort and barrier support.',
  '/images/brands/hydrinity-logo.svg',
  '/images/brands/hydrinity-hero.jpg',
  NULL,
  'in_clinic',
  'https://hydrinity.com',
  4
),
(
  'universkin',
  'Universkin',
  'Truly personalized formulas.',
  'Your actives, your goals—customized into a simple, potent serum. Universkin blends are designed by your RELUXE provider based on your unique skin profile.',
  '/images/brands/universkin-logo.svg',
  '/images/brands/universkin-hero.jpg',
  NULL,
  'in_clinic',
  'https://universkin.com',
  5
);

-- ============================================================
-- PRODUCTS — skinbetter science
-- ============================================================
INSERT INTO products (brand_id, slug, name, subtitle, short_description, description, category, image_url, key_ingredients, skin_types, concerns, how_to_use, pro_tip, faq, staff_picks, purchase_url, purchase_type, is_bestseller, sales_rank, sort_order) VALUES

-- 1. AlphaRet® Overnight Cream (Top seller #1)
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'alpharet-overnight-cream',
  'AlphaRet® Overnight Cream',
  'Retinoid + AHA Technology',
  'Retinoid + AHA technology for smoother texture with great tolerability.',
  'AlphaRet® Overnight Cream is an anti-aging treatment by skinbetter science that combines a retinoid with an alpha hydroxy acid in a single molecule. This patented technology delivers visible smoothing and texture improvement with significantly less irritation than traditional retinoids. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.

AlphaRet works by stimulating cell turnover and collagen production while simultaneously exfoliating the skin surface. Most patients see noticeable improvement in fine lines, texture, and tone within 4-6 weeks of consistent use.',
  'anti-aging',
  '/images/products/skinbetter/alpharet-cream.svg',
  ARRAY['AlphaRet (Retinoid + AHA)', 'Peptides', 'Ceramides', 'Squalane'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['fine-lines', 'texture', 'dullness'],
  'Apply a pea-sized amount to clean, dry skin in the evening. Follow with moisturizer if needed. Start every other night and build to nightly use over 2-3 weeks.',
  'Layer Trio Rebalancing Moisture on top if you experience any initial dryness—it won''t diminish the retinoid effect.',
  '[{"q":"What makes AlphaRet different from regular retinol?","a":"AlphaRet combines a retinoid and alpha hydroxy acid into a single patented molecule, delivering anti-aging benefits with significantly less irritation than traditional retinoids."},{"q":"How long until I see results?","a":"Most patients notice smoother texture and improved tone within 4-6 weeks of consistent nightly use."},{"q":"Can I use AlphaRet after a procedure?","a":"Wait until your provider clears you to resume retinoids, typically 5-7 days after microneedling or laser treatments."},{"q":"Is this available online?","a":"Yes, AlphaRet Overnight Cream is available through our authorized skinbetter science store at skinbetter.pro/reluxemedspa."}]'::JSONB,
  '{"westfield":"Delivers visible smoothing within weeks—our most re-purchased product.","carmel":"Fast texture improvement with great tolerability."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/anti-aging/alpharet-overnight-cream-M001.html#PageName=reluxemedspa',
  'affiliate',
  true,
  1,
  1
),

-- 2. AlphaRet® Exfoliating Peel Pads
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'alpharet-peel-pads',
  'AlphaRet® Exfoliating Peel Pads',
  'On-Demand Glow',
  'On-demand glow; great travel refiner.',
  'AlphaRet® Exfoliating Peel Pads are a convenient at-home exfoliation treatment by skinbetter science. Each pre-soaked pad delivers a blend of glycolic, lactic, and salicylic acids for instant brightening and texture refinement. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'anti-aging',
  '/images/products/skinbetter/peel-pads.svg',
  ARRAY['Glycolic Acid', 'Lactic Acid', 'Salicylic Acid', 'AlphaRet'],
  ARRAY['normal', 'combination', 'oily'],
  ARRAY['texture', 'dullness', 'dark-spots'],
  'Swipe one pad across clean face and neck 1-2 times per week in the evening. Do not rinse. Follow with moisturizer.',
  'Use the night before a special event for an instant glow—they''re a travel bag essential.',
  '[]'::JSONB,
  '{"carmel":"Fast event-ready glow; easy routine add-on."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/masks-%2B-peels/alpharet-exfoliating-peel-pads-M008.html#PageName=reluxemedspa',
  'affiliate',
  false,
  NULL,
  2
),

-- 3. Alto Advanced Defense and Repair
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'alto-advanced',
  'Alto Advanced Defense and Repair Serum',
  'Broad-Spectrum Antioxidant Powerhouse',
  'Broad-spectrum antioxidant powerhouse for daily defense.',
  'Alto Advanced Defense and Repair Serum is an antioxidant treatment by skinbetter science that provides broad-spectrum protection against environmental damage. This AM serum combines multiple antioxidants to defend against UV-induced free radicals and visible light damage. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'anti-aging',
  '/images/products/skinbetter/alto.svg',
  ARRAY['Vitamin C', 'Vitamin E', 'Lipochroman', 'Diethylhexyl Syringylidenemalonate'],
  ARRAY['normal', 'dry', 'combination', 'oily', 'sensitive'],
  ARRAY['fine-lines', 'dullness', 'dark-spots'],
  'Apply 2-3 pumps to clean skin every morning before SPF. Allow 30 seconds to absorb before layering sunscreen.',
  'This is your AM defense layer—pair it with AlphaRet PM for a complete anti-aging protocol.',
  '[]'::JSONB,
  '{"carmel":"AM antioxidant that boosts brightness and defenses."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/antioxidants/alto-defense-serum-M007.html#PageName=reluxemedspa',
  'affiliate',
  false,
  NULL,
  3
),

-- 4. InterFuse® Treatment Cream EYE (Top seller #4)
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'interfuse-eye',
  'InterFuse® Treatment Cream EYE',
  'Peptide Eye Treatment',
  'Peptide eye treatment for crepiness and lines around the eyes.',
  'InterFuse® Treatment Cream EYE is a peptide-rich eye treatment by skinbetter science that targets lines, puffiness, and crepiness around the delicate eye area. The InterFuse delivery system enhances penetration of active peptides for visible results. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.

This formula addresses all major signs of aging around the eyes in a single product, making it a staple in both AM and PM routines.',
  'anti-aging',
  '/images/products/skinbetter/interfuse-eye.svg',
  ARRAY['Peptides', 'Retinol', 'Caffeine', 'Niacinamide'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY['fine-lines', 'dark-circles', 'puffiness'],
  'Apply a small amount around the orbital bone morning and evening. Gently pat in with ring finger—avoid pulling the delicate skin.',
  'Plays beautifully with neuromodulators—use daily between Botox appointments to maintain smooth eye area.',
  '[{"q":"Can I use this with Botox?","a":"Yes. InterFuse EYE is an excellent daily complement to neuromodulator treatments, helping maintain smoothness between appointments."},{"q":"Is it safe for sensitive eyes?","a":"The formula is ophthalmologist tested and designed for the delicate peri-orbital area."}]'::JSONB,
  '{"westfield":"Daily eye staple—plays well with injectables."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/eye-care/interfuse-treatment-cream-eye-M011.html#PageName=reluxemedspa',
  'affiliate',
  true,
  4,
  4
),

-- 5. Trio Rebalancing Moisture Treatment
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'trio-rebalancing-moisture',
  'Trio Rebalancing Moisture Treatment',
  'Lightweight Barrier Support',
  'Lightweight but effective barrier support that layers with actives.',
  'Trio Rebalancing Moisture Treatment is a lightweight hydrator by skinbetter science that supports the skin barrier without heaviness. Ideal for layering over active ingredients and perfect for acne-prone skin types. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/skinbetter/trio.svg',
  ARRAY['Ceramides', 'Fatty Acids', 'Cholesterol', 'Squalane'],
  ARRAY['normal', 'dry', 'combination', 'oily', 'sensitive'],
  ARRAY['dryness', 'sensitivity'],
  'Apply over serums and actives morning and evening. Use as needed for barrier support during retinoid introduction.',
  'The perfect buffer when starting AlphaRet—apply on top to ease the transition without reducing efficacy.',
  '[]'::JSONB,
  '{"carmel":"Lightweight hydration that layers with actives.","westfield":"Hydrates without heaviness; acne-friendly."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/moisturizers/trio-rebalancing-moisture-treatment-M012.html#PageName=reluxemedspa',
  'affiliate',
  false,
  NULL,
  5
),

-- 6. Even Tone Correcting Serum
(
  (SELECT id FROM brands WHERE slug = 'skinbetter-science'),
  'even-tone-correcting-serum',
  'Even Tone Correcting Serum',
  'Pigment Correction',
  'Targets visible discoloration and dullness for a more even complexion.',
  'Even Tone Correcting Serum is a brightening treatment by skinbetter science that targets visible discoloration, dark spots, and dullness. This multi-pathway approach to pigment correction helps achieve a more even, radiant complexion. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'brightening',
  '/images/products/skinbetter/even-tone.svg',
  ARRAY['Arbutin', 'Niacinamide', 'Hexylresorcinol', 'Phytic Acid'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['dark-spots', 'dullness', 'melasma'],
  'Apply 1-2 pumps to clean skin in the evening. Can be layered under AlphaRet for enhanced results.',
  'Melasma-friendly maintenance between in-clinic treatments like chemical peels or IPL.',
  '[]'::JSONB,
  '{"carmel":"Melasma-friendly maintenance between treatments."}'::JSONB,
  'https://www.skinbetter.com/shop-skincare/product-category/serums/even-skin-tone-correcting-serum-M018.html#PageName=reluxemedspa',
  'affiliate',
  false,
  NULL,
  6
);

-- ============================================================
-- PRODUCTS — Colorescience
-- ============================================================
INSERT INTO products (brand_id, slug, name, subtitle, short_description, description, category, image_url, key_ingredients, skin_types, concerns, how_to_use, pro_tip, faq, staff_picks, purchase_url, purchase_type, is_bestseller, sales_rank, sort_order) VALUES

-- 7. Face Shield Flex SPF 50 (Top seller #3)
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'face-shield-flex-spf50',
  'Total Protection™ Face Shield Flex SPF 50',
  'Adaptive Tint Mineral SPF + EnviroScreen®',
  'Flexible-tint mineral SPF that adapts to your skin tone while shielding against UV, blue light, and infrared.',
  'Total Protection™ Face Shield Flex SPF 50 is a mineral sunscreen by Colorescience featuring EnviroScreen® technology—a proprietary blend of 100% mineral UV filters plus antioxidants that defends against UVA, UVB, blue light (HEV), and infrared radiation. The flexible-tint pigments use iron oxide technology that self-adjusts across a wide range of skin tones, eliminating the shade-matching guesswork of traditional tinted SPFs. Available at RELUXE Med Spa in Westfield and Carmel, Indiana, where our skincare specialists can shade-match you in person at either Hamilton County location.

Face Shield Flex replaces light foundation for many patients, delivering a natural, skin-like finish with legitimate broad-spectrum protection. The lightweight, water-resistant formula layers seamlessly under makeup or wears beautifully on its own. Iron oxides provide the added benefit of visible-light protection—something non-tinted mineral sunscreens cannot offer—making this especially valuable for patients managing melasma or post-inflammatory hyperpigmentation. Whether you''re commuting through downtown Indianapolis, spending a weekend at Grand Park in Westfield, or walking the Monon Trail in Carmel, Face Shield Flex provides dependable all-day mineral protection.',
  'sun-protection',
  '/images/products/colorescience/flex.png',
  ARRAY['Zinc Oxide 12%', 'Titanium Dioxide 7.5%', 'Iron Oxides', 'Hyaluronic Acid', 'Vitamin E', 'Artemia Extract'],
  ARRAY['normal', 'dry', 'combination', 'oily', 'sensitive'],
  ARRAY['sun-protection', 'blue-light', 'dark-spots', 'melasma'],
  'Shake well. Apply as the last step of your morning skincare routine, before makeup. Squeeze a nickel-sized amount onto fingertips and blend across face, neck, and ears. Reapply every 2 hours during direct sun exposure. Water-resistant for up to 80 minutes.',
  'Iron oxides block visible light that standard mineral SPFs miss—critical for melasma patients and anyone with pigment concerns. This is the SPF we recommend most after IPL and laser treatments once cleared by your provider.',
  '[{"q":"Does Face Shield Flex replace foundation?","a":"For many patients at RELUXE Med Spa, yes. The flexible-tint iron oxides adapt to a wide range of skin tones and provide medium, natural-looking coverage that evens tone while delivering SPF 50 mineral protection."},{"q":"Does mineral SPF leave a white cast?","a":"No. Face Shield Flex uses iron oxide tinting that blends seamlessly without a white cast, unlike traditional zinc oxide formulas. Our patients in Westfield and Carmel consistently say it''s the most natural-looking mineral SPF they''ve tried."},{"q":"Is this safe after procedures at RELUXE?","a":"Mineral SPF is typically the first sunscreen your RELUXE provider will clear after laser, microneedling, or chemical peels—usually within 24-72 hours. The iron oxides add visible-light protection that''s especially important on healing skin."},{"q":"Where can I buy Colorescience Face Shield Flex near me in Indiana?","a":"Face Shield Flex is available at both RELUXE Med Spa locations—in Westfield at Grand Park Village and in Carmel at Merchant''s Square. Our skincare specialists can shade-match you during a complimentary consultation."}]'::JSONB,
  '{"westfield":"Our #1 SPF at the Westfield clinic—adaptive tint replaces foundation and provides visible-light protection critical for pigment-prone skin. Patients heading to Grand Park Sports Campus grab this on the way out.","carmel":"The one SPF that checks every box for our Carmel patients: mineral, tinted, blue-light blocking, and gorgeous enough to wear to lunch on Main Street."}'::JSONB,
  'https://www.colorescience.com/products/sunforgettable-total-protection-face-shield-flex-spf-50?designate-location=25130',
  'affiliate',
  true,
  3,
  1
),

-- 8. Face Shield Glow SPF 50
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'face-shield-glow-spf50',
  'Total Protection™ Face Shield Glow SPF 50',
  'Luminous Finish Mineral SPF + EnviroScreen®',
  'Dewy, luminous-finish mineral SPF that gives skin an editorial glow while protecting against UV, blue light, and IR.',
  'Total Protection™ Face Shield Glow SPF 50 is a mineral sunscreen by Colorescience that delivers a radiant, lit-from-within finish with full EnviroScreen® environmental protection. The formula uses light-reflecting minerals and hyaluronic acid to create a luminous, dewy look that instantly brightens dull or tired-looking skin—without glitter or shimmer. Available at RELUXE Med Spa in Westfield and Carmel, Indiana, where our Hamilton County skincare team can help you choose the right Face Shield for your skin type.

Face Shield Glow is ideal for patients with dry or mature skin who want their SPF to add radiance rather than mattify. The hydrating base with hyaluronic acid and vitamin E nourishes while zinc oxide and titanium dioxide provide broad-spectrum UVA/UVB defense. Worn alone, it gives skin a fresh, healthy sheen—our Carmel patients love it for date nights on Main Street. Under makeup, it creates a glowing base that photographs beautifully. Indiana''s harsh winters are especially drying, and Face Shield Glow counteracts the flat, chalky look that many mineral SPFs create in cold weather. Many patients mix it 50/50 with Face Shield Flex for a custom coverage-plus-glow finish.',
  'sun-protection',
  '/images/products/colorescience/glow.png',
  ARRAY['Zinc Oxide 12%', 'Titanium Dioxide 4.5%', 'Hyaluronic Acid', 'Vitamin E', 'Light-Reflecting Minerals'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['sun-protection', 'dullness', 'dryness', 'blue-light'],
  'Shake well. Apply a nickel-sized amount as the last step of your morning skincare routine. Blend across face and neck with fingertips. For a custom finish, mix equal parts with Face Shield Flex. Reapply every 2 hours during direct sun exposure.',
  'Mix 50/50 with Face Shield Flex for a custom coverage + glow combination. For dry-skin patients or Indiana winters, the Glow version prevents that flat, chalky look that some mineral SPFs create.',
  '[{"q":"Is the glow finish subtle or noticeable?","a":"It''s a natural, lit-from-within radiance—not glittery or shimmery. Think fresh, dewy skin rather than sparkle. Our patients at both RELUXE locations say it photographs beautifully."},{"q":"Can I wear this under makeup?","a":"Absolutely. Face Shield Glow makes an excellent glowing primer. It layers smoothly under foundation or tinted moisturizer and holds up through a full day."},{"q":"What''s the difference between Glow and Flex?","a":"Both provide the same SPF 50 EnviroScreen® protection. Flex has adaptive tint for coverage and color-matching. Glow has a luminous, dewy finish for radiance. Many of our Hamilton County patients own both and mix them. Visit RELUXE in Westfield or Carmel and we''ll help you decide."},{"q":"Is this a good SPF for Indiana winters?","a":"Yes—it''s one of our top recommendations for cold-weather months. Indiana winters are brutal on dry skin, and most mineral SPFs make it worse with a chalky, flat finish. Face Shield Glow adds hydration and radiance that counteracts winter dullness."}]'::JSONB,
  '{"westfield":"Our Westfield patients'' go-to for Indiana winters—hydrating, radiant, and gorgeous without glitter. Counteracts the dullness that cold weather creates.","carmel":"The glow finish makes tired, dry skin look alive instantly. Our Carmel team recommends mixing with Flex for custom coverage + radiance."}'::JSONB,
  'https://www.colorescience.com/products/sunforgettable-total-protection-face-shield-glow-spf-50?designate-location=25130',
  'affiliate',
  false,
  NULL,
  2
),

-- 9. Brush-On Shield SPF 50 (Top seller #6)
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'brush-on-shield-spf50',
  'Sunforgettable® Brush-On Shield SPF 50',
  'On-the-Go Powder SPF + EnviroScreen®',
  'Self-dispensing mineral powder SPF that makes midday reapplication over makeup effortless.',
  'Sunforgettable® Brush-On Shield SPF 50 is a mineral powder sunscreen by Colorescience that solves the single biggest problem in sun protection: reapplication. The self-dispensing brush delivers a precise dose of zinc oxide and titanium dioxide powder that goes over makeup, moisturizer, or bare skin without disruption, mess, or a mirror. Available at RELUXE Med Spa in Westfield and Carmel, Indiana—our most repurchased Colorescience product across both Hamilton County locations.

Dermatologists agree that SPF reapplication every 2 hours is essential, but most liquid sunscreens are impractical to reapply over a full face of makeup. The Brush-On Shield eliminates that barrier entirely. The portable brush fits in a purse, glove box, or desk drawer and applies in seconds—whether you''re running errands through Westfield, at your desk in Carmel, or watching kids at Grand Park. The powder also absorbs excess oil, making it especially useful for combination and oily skin types in Indiana''s humid summers. EnviroScreen® technology provides protection beyond UV—defending against blue light from screens, infrared radiation, and pollution. Available in four tint-matched shades plus a translucent option.',
  'sun-protection',
  '/images/products/colorescience/brush-on.png',
  ARRAY['Zinc Oxide 22.5%', 'Titanium Dioxide 22.5%', 'Iron Oxides', 'Artemia Extract', 'Buddleja Stem Extract'],
  ARRAY['normal', 'dry', 'combination', 'oily', 'sensitive'],
  ARRAY['sun-protection', 'blue-light', 'oiliness'],
  'Twist the cap to the right to dispense powder into the brush. Tap the brush gently on the back of your hand to distribute evenly. Buff onto face, neck, ears, and the part line of your hair in circular motions. Reapply every 2-3 hours during sun exposure, or after sweating or toweling off.',
  'Keep one in your car, one in your bag, one at your desk. SPF reapplication only works if it actually happens—and this is the only format most patients will realistically use midday. Don''t forget your ears, neck, and hair part.',
  '[{"q":"Can I apply this over a full face of makeup?","a":"Yes—that''s exactly what it''s designed for. The powder brush goes over foundation, concealer, and setting powder without disrupting them. No mirror needed. Our patients at RELUXE in Westfield and Carmel use it on the go between meetings, at school pickup, and during outdoor events."},{"q":"How often should I reapply?","a":"Every 2-3 hours during sun exposure, or immediately after sweating, swimming, or toweling off. Each brush contains approximately 30 full-face applications. Indiana summers are intense—keep one in your car and one in your bag."},{"q":"What shades are available?","a":"Brush-On Shield comes in Fair, Medium, Tan, Deep, and Translucent. The Translucent option works across skin tones without adding color. Visit RELUXE Med Spa in Westfield or Carmel for a complimentary shade-match with one of our skincare specialists."},{"q":"Where can I buy Colorescience Brush-On Shield in Westfield or Carmel?","a":"Brush-On Shield is available at both RELUXE Med Spa locations in Hamilton County—our Westfield clinic at Grand Park Village and our Carmel clinic at Merchant''s Square. We always keep every shade in stock."}]'::JSONB,
  '{"westfield":"Our Westfield team''s most-repurchased product—the brush that makes SPF reapplication actually happen. Keep one in your car for Grand Park weekends and Monon Trail walks.","carmel":"Carmel patients who start using Brush-On Shield never go back. Perfect for school pickup, errands on Rangeline Road, and keeping SPF consistent between outdoor activities."}'::JSONB,
  'https://www.colorescience.com/products/sunforgettable-total-protection-brush-on-shield-spf-50?designate-location=25130',
  'affiliate',
  true,
  6,
  3
),

-- 10. Even Up® Clinical Pigment Perfector SPF 50
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'even-up-pigment-perfector',
  'Even Up® Clinical Pigment Perfector SPF 50',
  'Pigment Correction + Mineral SPF',
  'Clinically proven to reduce visible discoloration while preventing new pigment with mineral SPF 50.',
  'Even Up® Clinical Pigment Perfector SPF 50 is a tinted mineral sunscreen by Colorescience that combines active pigment correction with broad-spectrum sun protection. Unlike standard SPFs that only prevent future damage, Even Up uses Oleosome technology to deliver vitamin C and niacinamide into the skin throughout the day, actively improving the appearance of existing dark spots, sun damage, and post-inflammatory hyperpigmentation. In clinical studies, patients saw visible improvement in discoloration within 4 weeks of daily use. Available at RELUXE Med Spa in Westfield and Carmel, Indiana—the leading med spa for pigment correction in Hamilton County.

Even Up is a med spa favorite for melasma management. Melasma is notoriously difficult to treat because even minor UV exposure can reverse weeks of progress from peels, lasers, and topicals. Even Up addresses both sides of the equation: the tinted mineral formula prevents UV-triggered melanin production while the corrective ingredients reduce existing pigment. The medium-coverage tint also provides instant cosmetic improvement, camouflaging spots while the actives work over time. For our melasma patients across Westfield, Carmel, Fishers, Noblesville, and greater Indianapolis, this is non-negotiable daily maintenance between in-clinic treatments like IPL, chemical peels, and laser resurfacing at RELUXE.',
  'sun-protection',
  '/images/products/colorescience/even-up.png',
  ARRAY['Zinc Oxide 10.8%', 'Titanium Dioxide 3%', 'Vitamin C (Ascorbyl Palmitate)', 'Niacinamide', 'Oleosome Delivery', 'Plankton Extract'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['dark-spots', 'melasma', 'sun-protection', 'dullness'],
  'Apply evenly to face in the morning as your SPF step after serums and moisturizer. Blend with fingertips for medium coverage. Reapply every 2 hours during sun exposure. For spot-specific correction, layer slightly more product over areas of visible discoloration.',
  'Non-negotiable for melasma patients between IPL, peel, or laser sessions. The Oleosome delivery keeps vitamin C and niacinamide releasing into skin all day—it''s correction and protection in one step. Pair with Discoloration Defense by SkinCeuticals at night for a complete pigment protocol.',
  '[{"q":"How is Even Up different from a regular tinted SPF?","a":"Most tinted SPFs only protect. Even Up actively corrects existing discoloration using Oleosome delivery technology that releases vitamin C and niacinamide throughout the day. In clinical studies, patients saw measurable improvement in discoloration within 4 weeks of consistent use."},{"q":"Can Even Up help with melasma treatment in Indianapolis?","a":"Yes—it''s one of the most-recommended products for melasma management at RELUXE Med Spa in Westfield and Carmel. It prevents UV-triggered melanin production while actively fading existing pigment. For best results, pair with an in-clinic treatment like IPL or a chemical peel at either Hamilton County location."},{"q":"Does it provide enough coverage to skip concealer?","a":"Even Up offers medium coverage that camouflages most dark spots and uneven tone. Many of our patients across Carmel, Westfield, and Fishers find it replaces their concealer or light foundation entirely."},{"q":"Where can I get melasma treatment near me in Hamilton County?","a":"RELUXE Med Spa offers comprehensive melasma treatment at both our Westfield and Carmel locations. Even Up is a key part of our at-home melasma protocol, paired with in-clinic treatments like IPL, chemical peels, and SkinCeuticals Discoloration Defense. Book a complimentary skin consultation to build your personalized pigment plan."}]'::JSONB,
  '{"westfield":"Our Westfield melasma patients'' daily essential—correction and protection in one elegant step. We pair it with SkinCeuticals Discoloration Defense at night and in-clinic IPL for the complete pigment protocol.","carmel":"Clinically proven pigment correction that Carmel patients actually enjoy wearing daily. Replaces foundation for most with medium, spot-camouflaging coverage. A cornerstone of our Hamilton County melasma program."}'::JSONB,
  'https://www.colorescience.com/products/even-up-clinical-pigment-perfector-spf-50?designate-location=25130',
  'affiliate',
  false,
  NULL,
  4
),

-- 11. All Calm® Clinical Redness Corrector SPF 50
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'all-calm-redness-corrector',
  'All Calm® Clinical Redness Corrector SPF 50',
  'Redness Neutralization + Calming Mineral SPF',
  'Green-to-beige tint instantly neutralizes visible redness while calming ingredients soothe reactive skin.',
  'All Calm® Clinical Redness Corrector SPF 50 is a mineral sunscreen by Colorescience specifically formulated for redness-prone, rosacea, and post-procedure skin. The color-correcting formula uses green mineral pigments that neutralize visible redness on contact, then transition to a natural beige tone that blends with surrounding skin. Beneath the color technology, calming botanicals including algae extract and caffeine work to reduce reactivity over time. Available at RELUXE Med Spa in Westfield and Carmel, Indiana—trusted by rosacea patients across Hamilton County and greater Indianapolis.

Redness-prone skin is inherently more reactive to UV exposure, heat, and environmental stress—and Indiana''s seasonal swings between humid summers and dry winters can aggravate rosacea and sensitivity. All Calm was designed specifically for this population. The 100% mineral formula avoids the chemical UV filters that can trigger flushing in sensitive skin. The calming botanicals reduce baseline reactivity with consistent use, and the color-correcting tint provides instant cosmetic improvement that gives patients confidence while their skin heals. Our providers at RELUXE in Westfield and Carmel recommend All Calm extensively after BBL, IPL, and vascular laser treatments once patients are cleared to resume sun protection—typically within 24-72 hours.',
  'sun-protection',
  '/images/products/colorescience/all-calm.png',
  ARRAY['Zinc Oxide 6.6%', 'Titanium Dioxide 4%', 'Algae Extract', 'Caffeine', 'Green Mineral Pigments', 'Bisabolol'],
  ARRAY['sensitive', 'normal', 'dry'],
  ARRAY['redness', 'rosacea', 'sun-protection', 'sensitivity', 'post-procedure'],
  'Apply to clean skin in the morning as your SPF step. Use fingertips to blend the green-tinted formula—it transitions to a natural beige as you blend. Layer over serums and calming moisturizer. Reapply every 2 hours during sun exposure.',
  'The green tint disappears as you blend—patients always worry it won''t, but it does. This is our go-to recommendation after BBL and vascular laser treatments. The mineral formula is gentle enough for freshly treated skin, and the redness neutralization provides cosmetic confidence during the healing window.',
  '[{"q":"Will the green tint show on my skin?","a":"No. The green mineral pigments neutralize redness as you blend, then transition to a natural beige tone. The finished look is calm, even-toned skin—not green skin. Our RELUXE patients are always surprised at how seamless the color transition is."},{"q":"Is this safe for rosacea patients in Indiana?","a":"Yes. All Calm was specifically formulated for rosacea-prone skin. The 100% mineral formula avoids chemical UV filters that can trigger flushing, and calming botanicals like algae extract and bisabolol help reduce baseline reactivity over time. Indiana''s seasonal extremes can aggravate rosacea—this helps manage flares year-round."},{"q":"Can I use this after laser or IPL at RELUXE?","a":"All Calm is one of the first products our Westfield and Carmel providers recommend after vascular laser and IPL treatments. Once cleared for sun protection (typically 24-72 hours), the mineral formula is gentle enough for healing skin and the redness correction provides cosmetic confidence during recovery."},{"q":"Where can I get rosacea treatment near me in Westfield or Carmel?","a":"RELUXE Med Spa offers comprehensive rosacea management at both Hamilton County locations—Westfield and Carmel. All Calm is part of our at-home rosacea protocol alongside in-clinic treatments like BBL and vascular laser therapy. Schedule a complimentary skin consultation to build your personalized plan."}]'::JSONB,
  '{"westfield":"Our Westfield rosacea and post-laser patients'' go-to—instant redness neutralization with calming botanicals. Indiana''s weather swings trigger flares, and this manages them beautifully.","carmel":"The green-to-beige color shift looks like magic. Carmel patients leave the clinic wearing it and feel confident immediately after vascular treatments. A staple in our Hamilton County rosacea protocol."}'::JSONB,
  'https://www.colorescience.com/products/all-calm-clinical-redness-corrector-spf-50?designate-location=25130',
  'affiliate',
  false,
  NULL,
  5
),

-- 12. Total Eye® 3-in-1 Renewal Therapy SPF 35
(
  (SELECT id FROM brands WHERE slug = 'colorescience'),
  'total-eye-renewal-therapy',
  'Total Eye® 3-in-1 Renewal Therapy SPF 35',
  'Brighten + Correct + Protect for Eyes',
  'Three-in-one eye treatment that brightens dark circles, reduces fine lines, and provides mineral SPF 35.',
  'Total Eye® 3-in-1 Renewal Therapy SPF 35 is a multi-benefit eye treatment by Colorescience that combines active anti-aging ingredients with color-correcting pigments and mineral sun protection—three functions in a single product for the delicate peri-orbital area. Peptides and niacinamide target fine lines, crepiness, and loss of firmness. The tinted formula provides instant brightening that camouflages dark circles on contact. Mineral SPF 35 protects the thin, vulnerable skin around the eyes from UV-accelerated aging. Available at RELUXE Med Spa in Westfield and Carmel, Indiana—both Hamilton County locations carry the full Colorescience clinical line.

The skin around the eyes is the thinnest on the face and shows signs of aging first—fine lines, dark circles, hollowness, and crepiness. Most patients use separate products for treatment, concealment, and sun protection in this area. Total Eye consolidates all three into one application, which reduces friction and increases compliance. The peptide complex stimulates collagen for visible firming over time, caffeine reduces puffiness and dark circles, and the mineral tint provides an instant optical lift. It''s equally effective for patients using injectable neuromodulators and fillers around the eyes—the formula is designed to complement, not compete with, Botox and filler treatments at RELUXE in Westfield and Carmel.',
  'sun-protection',
  '/images/products/colorescience/total-eye.png',
  ARRAY['Zinc Oxide 7%', 'Titanium Dioxide 4.3%', 'Palmitoyl Tripeptide-5', 'Niacinamide', 'Caffeine', 'Vitamin K'],
  ARRAY['normal', 'dry', 'combination', 'sensitive'],
  ARRAY['dark-circles', 'fine-lines', 'puffiness', 'sun-protection'],
  'Using your ring finger (lightest pressure), apply a small amount along the orbital bone from inner to outer corner, morning and evening. Pat gently—never drag or pull the delicate eye skin. In the morning, allow 30 seconds to set before applying makeup over it.',
  'Three products in one tube means patients actually use it consistently. The eye area is the most neglected zone for SPF—and the first to show aging. Complements Botox beautifully; use it daily between injectable appointments to maintain smoothness and brightness.',
  '[{"q":"Can this replace my under-eye concealer?","a":"For many patients at RELUXE, yes. The color-correcting tint neutralizes dark circles and provides enough coverage that a separate concealer isn''t needed. The finish is smooth and crease-resistant throughout the day."},{"q":"Is it safe to use with Botox or filler at RELUXE?","a":"Absolutely. Total Eye is designed to complement injectable treatments, not interfere with them. Our Westfield and Carmel injectors recommend using it daily between Botox and filler appointments to maintain brightness and firmness around the eyes."},{"q":"Why does the eye area need its own SPF?","a":"The skin around the eyes is the thinnest on the face and extremely susceptible to UV damage—especially in Indiana''s high-UV summers. Most patients skip SPF in this area because regular sunscreens sting or feel too heavy. Total Eye is specifically formulated for peri-orbital use and won''t migrate into eyes or cause irritation."},{"q":"Where can I buy Colorescience Total Eye near me in Indiana?","a":"Total Eye 3-in-1 Renewal Therapy is available at both RELUXE Med Spa locations—Westfield at Grand Park Village and Carmel at Merchant''s Square. Our skincare specialists can recommend the right Colorescience eye and SPF combination for your skin during a complimentary consultation."}]'::JSONB,
  '{"westfield":"Three products in one tube—treatment, concealer, and SPF for the most-neglected zone on the face. Our Westfield Botox patients who start Total Eye always repurchase. Simplifies the morning routine dramatically.","carmel":"Our Carmel injectors'' favorite pairing with Botox and filler—daily brightness + firmness between appointments, with mineral SPF the peri-orbital area desperately needs. A top repurchase across Hamilton County."}'::JSONB,
  'https://www.colorescience.com/products/total-eye-3-in-1-renewal-therapy-spf-35?designate-location=25130',
  'affiliate',
  false,
  NULL,
  6
);

-- ============================================================
-- PRODUCTS — SkinCeuticals
-- ============================================================
INSERT INTO products (brand_id, slug, name, subtitle, short_description, description, category, image_url, key_ingredients, skin_types, concerns, how_to_use, pro_tip, faq, staff_picks, purchase_url, purchase_type, is_bestseller, sales_rank, sort_order) VALUES

-- 13. CE Ferulic® (Top seller #2)
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'ce-ferulic',
  'CE Ferulic®',
  'Gold-Standard Antioxidant Serum',
  'Iconic vitamin C antioxidant serum for glow, firmness, and photoprotection.',
  'CE Ferulic® is an antioxidant serum by SkinCeuticals that combines 15% pure vitamin C (L-ascorbic acid), 1% vitamin E, and 0.5% ferulic acid. This patented daytime formula is the gold standard for environmental protection and is clinically proven to reduce oxidative damage from UV exposure and pollution. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.

CE Ferulic has been the #1 antioxidant serum recommended by dermatologists for over a decade. When used daily, it visibly improves fine lines, firmness, and brightness.',
  'anti-aging',
  '/images/products/skinceuticals/ce-ferulic.svg',
  ARRAY['15% L-Ascorbic Acid', '1% Vitamin E', '0.5% Ferulic Acid'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['fine-lines', 'dullness', 'dark-spots', 'firmness'],
  'Apply 4-5 drops to dry skin every morning after cleansing. Allow to absorb fully before applying SPF. Do not mix with other serums in the palm.',
  'Daily gold standard for photoaging—apply before SPF for 8x enhanced photoprotection.',
  '[{"q":"Why is CE Ferulic so popular?","a":"CE Ferulic is the most-studied antioxidant serum in dermatology. The patented combination of vitamins C, E, and ferulic acid provides 8x the skin''s natural photoprotection."},{"q":"Why does it smell that way?","a":"The slight scent comes from pure L-ascorbic acid—it indicates potency. The scent dissipates within seconds of application."},{"q":"Can I buy CE Ferulic online?","a":"CE Ferulic is an in-clinic exclusive. Visit RELUXE Med Spa in Westfield or Carmel to purchase with a complimentary skin consultation."},{"q":"How long does one bottle last?","a":"With daily use (4-5 drops), one 30ml bottle lasts approximately 2-3 months."}]'::JSONB,
  '{"westfield":"Daily gold standard for photoaging in Indiana''s seasons.","carmel":"The one product every skincare routine should start with."}'::JSONB,
  NULL,
  'in_clinic',
  true,
  2,
  1
),

-- 14. Phloretin CF®
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'phloretin-cf',
  'Phloretin CF®',
  'Brightening Antioxidant',
  'Brightening antioxidant for discoloration and uneven tone.',
  'Phloretin CF® is an antioxidant serum by SkinCeuticals formulated with phloretin, vitamin C, and ferulic acid. Designed for combination and oily skin types, it brightens, firms, and protects while helping reduce discoloration. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'brightening',
  '/images/products/skinceuticals/phloretin.svg',
  ARRAY['2% Phloretin', '10% L-Ascorbic Acid', '0.5% Ferulic Acid'],
  ARRAY['combination', 'oily'],
  ARRAY['dark-spots', 'dullness', 'fine-lines'],
  'Apply 4-5 drops to dry skin every morning after cleansing. Follow with SPF.',
  'Preferred over CE Ferulic for pigment-prone, combination skin.',
  '[]'::JSONB,
  '{"carmel":"Preferred for pigment-prone, combination skin."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  2
),

-- 15. Silymarin CF
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'silymarin-cf',
  'Silymarin CF',
  'Oil-Friendly Vitamin C',
  'Oil-friendly vitamin C for blemish-prone skin.',
  'Silymarin CF is an antioxidant serum by SkinCeuticals specifically formulated for oily and blemish-prone skin. Combining silymarin (milk thistle extract), vitamin C, and ferulic acid, it reduces oiliness, refines pores, and prevents environmental damage. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'acne',
  '/images/products/skinceuticals/silymarin.svg',
  ARRAY['0.5% Silymarin', '15% L-Ascorbic Acid', '0.5% Ferulic Acid', 'Salicylic Acid'],
  ARRAY['oily', 'combination'],
  ARRAY['acne', 'oiliness', 'dark-spots'],
  'Apply 4-5 drops to dry skin every morning. Follow with oil-free moisturizer and SPF.',
  'Vitamin C love for oily/acne-prone complexions—won''t add shine or trigger breakouts.',
  '[]'::JSONB,
  '{"carmel":"Vitamin C love for oily/acne-prone complexions."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  3
),

-- 16. Discoloration Defense
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'discoloration-defense',
  'Discoloration Defense',
  'Targeted Pigment Corrector',
  'Targets stubborn spots and post-inflammatory marks.',
  'Discoloration Defense is a pigment-correcting serum by SkinCeuticals that targets stubborn dark spots, post-inflammatory hyperpigmentation, and melasma maintenance. This multi-pathway formula addresses discoloration at multiple stages of melanin production. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'brightening',
  '/images/products/skinceuticals/discoloration.svg',
  ARRAY['3% Tranexamic Acid', '1% Kojic Acid', '5% Niacinamide', '5% HEPES'],
  ARRAY['normal', 'dry', 'combination', 'oily'],
  ARRAY['dark-spots', 'melasma', 'post-inflammatory'],
  'Apply 3-4 drops to discolored areas twice daily. Can be layered with your vitamin C serum.',
  'Adds measurable progress between in-clinic treatments like IPL or chemical peels.',
  '[]'::JSONB,
  '{"westfield":"Targets stubborn spots and melasma maintenance.","carmel":"Measurable pigment reduction between clinic visits."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  4
),

-- 17. Triple Lipid Restore 2:4:2 (Top seller #5)
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'triple-lipid-restore',
  'Triple Lipid Restore 2:4:2',
  'Ceramide Barrier Repair Cream',
  'Ceramide-rich barrier repair cream with cholesterol and fatty acids.',
  'Triple Lipid Restore 2:4:2 is a barrier repair moisturizer by SkinCeuticals that contains an optimal ratio of ceramides (2%), cholesterol (4%), and fatty acids (2%). This lipid-replenishing formula restores the skin barrier, improves texture, and provides deep nourishment. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.

Essential for patients on retinoid protocols or recovering from energy-based treatments where barrier integrity is critical.',
  'hydration',
  '/images/products/skinceuticals/triple-lipid.svg',
  ARRAY['2% Ceramides', '4% Cholesterol', '2% Fatty Acids'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY['dryness', 'sensitivity', 'barrier-damage'],
  'Apply a pea-sized amount to face and neck morning and evening over serums. Can be used as a standalone moisturizer or barrier support layer.',
  'Barrier support during retinoid or laser protocols—essential, not optional.',
  '[{"q":"When should I use Triple Lipid Restore?","a":"Use morning and evening over serums. It''s especially important during retinoid introduction and post-procedure recovery when the barrier needs extra support."},{"q":"Is it heavy or greasy?","a":"Despite being a rich cream, it absorbs well and doesn''t feel heavy. The 2:4:2 ratio is designed to match the skin''s natural lipid composition."}]'::JSONB,
  '{"westfield":"Barrier support during retinoid or laser protocols.","carmel":"Go-to lipid layer for sensitized or winter-stressed skin."}'::JSONB,
  NULL,
  'in_clinic',
  true,
  5,
  5
),

-- 18. Glycolic 10 Renew Overnight
(
  (SELECT id FROM brands WHERE slug = 'skinceuticals'),
  'glycolic-10-renew-overnight',
  'Glycolic 10 Renew Overnight',
  'Refining AHA Night Treatment',
  'Refining AHA treatment for smoother texture overnight.',
  'Glycolic 10 Renew Overnight is a night treatment by SkinCeuticals featuring 10% glycolic acid in a time-release formula. It refines texture, smooths roughness, and improves radiance while you sleep. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'anti-aging',
  '/images/products/skinceuticals/glycolic.svg',
  ARRAY['10% Glycolic Acid', 'Phytic Acid', 'Soothing Complex'],
  ARRAY['normal', 'combination', 'oily'],
  ARRAY['texture', 'dullness', 'fine-lines'],
  'Apply a thin layer to clean skin at bedtime. Start 2-3 times per week and increase as tolerated.',
  'Simple night refiner for dullness and texture—great for patients who can''t tolerate retinoids.',
  '[]'::JSONB,
  '{"carmel":"Simple night refiner for dullness and texture."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  6
);

-- ============================================================
-- PRODUCTS — Hydrinity
-- ============================================================
INSERT INTO products (brand_id, slug, name, subtitle, short_description, description, category, image_url, key_ingredients, skin_types, concerns, how_to_use, pro_tip, faq, staff_picks, purchase_url, purchase_type, is_bestseller, sales_rank, sort_order) VALUES

-- 19. Restorative HA Serum
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'restorative-ha-serum',
  'Restorative HA Serum',
  'Deep Hydration Serum',
  'Deep hydration for compromised or dehydrated skin.',
  'Restorative HA Serum is a hyaluronic acid treatment by Hydrinity that delivers deep hydration for compromised, dehydrated, or post-procedure skin. This multi-weight HA formula penetrates at multiple levels for sustained moisture. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/ha-serum.svg',
  ARRAY['Multi-Weight Hyaluronic Acid', 'Peptides', 'Aloe Vera'],
  ARRAY['normal', 'dry', 'sensitive'],
  ARRAY['dryness', 'sensitivity', 'post-procedure'],
  'Apply 2-3 drops to damp skin morning and evening. Follow with moisturizer to seal hydration.',
  'Universal hydrator—pairs perfectly with lasers and microneedling recovery.',
  '[]'::JSONB,
  '{"westfield":"Universal hydrator—pairs with lasers and microneedling."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  1
),

-- 20. Soothing Recovery Gel
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'soothing-recovery-gel',
  'Soothing Recovery Gel',
  'Post-Procedure Comfort',
  'Calms post-procedure redness and tightness for immediate comfort.',
  'Soothing Recovery Gel is a post-procedure calming treatment by Hydrinity that reduces redness, tightness, and discomfort after energy-based treatments. This gel formula cools on contact and supports natural healing. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/recovery-gel.svg',
  ARRAY['Aloe Vera', 'Allantoin', 'Hyaluronic Acid', 'Centella Asiatica'],
  ARRAY['sensitive', 'normal', 'dry'],
  ARRAY['post-procedure', 'redness', 'sensitivity'],
  'Apply generously to treated areas immediately after procedure and as needed during the first 24-48 hours.',
  'Comforts immediately after energy-based treatments—keep refrigerated for extra soothing.',
  '[]'::JSONB,
  '{"westfield":"Comforts immediately after energy-based treatments."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  2
),

-- 21. Barrier Repair Cream
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'barrier-repair-cream',
  'Barrier Repair Cream',
  'Resilience Rebuilder',
  'Rebuilds resilience and layers well with actives post-recovery.',
  'Barrier Repair Cream is a restorative moisturizer by Hydrinity that rebuilds skin resilience after procedures and during active regimen introduction. Layers well with retinoids and other actives. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/barrier-cream.svg',
  ARRAY['Ceramides', 'Peptides', 'Shea Butter', 'Hyaluronic Acid'],
  ARRAY['dry', 'sensitive', 'normal'],
  ARRAY['dryness', 'barrier-damage', 'sensitivity'],
  'Apply over serums morning and evening. Use generously during post-procedure recovery.',
  'Great night cap when starting retinoids—buffers without reducing active ingredient efficacy.',
  '[]'::JSONB,
  '{"westfield":"Great night cap when starting retinoids."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  3
),

-- 22. Post-Treatment Essentials Kit
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'post-treatment-essentials-kit',
  'Post-Treatment Essentials Kit',
  'Turn-Key Recovery Routine',
  'Simple, safe early-recovery routine in a complete kit.',
  'Post-Treatment Essentials Kit is a curated recovery set by Hydrinity containing everything needed for the first 3-7 days after procedures. Includes gentle cleanser, hydrating serum, and barrier cream in travel-friendly sizes. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/essentials-kit.svg',
  ARRAY['Hyaluronic Acid', 'Ceramides', 'Aloe Vera', 'Peptides'],
  ARRAY['normal', 'dry', 'sensitive', 'combination', 'oily'],
  ARRAY['post-procedure'],
  'Follow the included guide: cleanse gently, apply serum to damp skin, seal with barrier cream. Use exclusively for 3-7 days post-procedure.',
  'Turn-key kit for the first 3-7 days after procedures—takes the guesswork out of recovery.',
  '[]'::JSONB,
  '{"carmel":"Turn-key kit for the first 3-7 days after procedures."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  4
),

-- 23. Replenishing Cleanser
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'replenishing-cleanser',
  'Replenishing Cleanser',
  'Gentle Barrier-Friendly Cleanser',
  'Gentle cleanse that preserves the barrier without stripping.',
  'Replenishing Cleanser is a gentle cleanser by Hydrinity that removes impurities without stripping the skin barrier. Leaves no tightness or film—ideal for post-procedure skin and daily use. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/cleanser.svg',
  ARRAY['Hyaluronic Acid', 'Glycerin', 'Chamomile Extract'],
  ARRAY['normal', 'dry', 'sensitive', 'combination'],
  ARRAY['sensitivity', 'dryness'],
  'Massage onto damp skin, rinse with lukewarm water. Use morning and evening.',
  'Patients stick with it—no tightness, no film. The cleanser that doesn''t undo your routine.',
  '[]'::JSONB,
  '{"carmel":"Patients stick with it—no tightness, no film."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  5
),

-- 24. Renewal HA Cream
(
  (SELECT id FROM brands WHERE slug = 'hydrinity'),
  'renewal-ha-cream',
  'Renewal HA Cream',
  'Rich Nighttime Moisture',
  'Rich moisture for seasonal dryness or nighttime repair.',
  'Renewal HA Cream is a rich moisturizer by Hydrinity that provides deep hydration for seasonal dryness and nighttime skin repair. The multi-weight hyaluronic acid formula locks in moisture for sustained comfort. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/hydrinity/renewal-cream.svg',
  ARRAY['Multi-Weight Hyaluronic Acid', 'Shea Butter', 'Ceramides', 'Vitamin E'],
  ARRAY['dry', 'normal', 'sensitive'],
  ARRAY['dryness', 'fine-lines'],
  'Apply as the last step of your evening routine. Use generously during winter months or when skin feels tight.',
  'Go-to for winter dehydration in Indiana—layer over Restorative HA Serum for maximum hydration.',
  '[]'::JSONB,
  '{"carmel":"Go-to for winter dehydration."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  6
);

-- ============================================================
-- PRODUCTS — Universkin
-- ============================================================
INSERT INTO products (brand_id, slug, name, subtitle, short_description, description, category, image_url, key_ingredients, skin_types, concerns, how_to_use, pro_tip, faq, staff_picks, purchase_url, purchase_type, is_bestseller, sales_rank, sort_order) VALUES

-- 25. P Serum + Niacinamide (NIA)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-niacinamide',
  'P Serum + Niacinamide (NIA)',
  'Oil Balance & Barrier Support',
  'Balances oil and supports the skin barrier.',
  'P Serum + Niacinamide is a personalized serum by Universkin that balances oil production and strengthens the skin barrier. Your RELUXE provider customizes the concentration based on your skin assessment. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'acne',
  '/images/products/universkin/nia.svg',
  ARRAY['Niacinamide (Custom %)', 'Universkin P Base'],
  ARRAY['oily', 'combination', 'normal'],
  ARRAY['oiliness', 'acne', 'sensitivity'],
  'Apply as directed by your RELUXE provider—typically 2-3 drops to clean skin morning and/or evening.',
  'The foundation of most custom blends—niacinamide plays well with nearly every other active.',
  '[]'::JSONB,
  NULL,
  NULL,
  'in_clinic',
  false,
  NULL,
  1
),

-- 26. P Serum + Azelaic Acid (AZA)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-azelaic-acid',
  'P Serum + Azelaic Acid (AZA)',
  'Redness, Congestion & Pigment',
  'Targets redness, congestion, and pigment concerns.',
  'P Serum + Azelaic Acid is a personalized serum by Universkin that targets redness, congestion, and post-inflammatory pigmentation. Azelaic acid is particularly effective for rosacea-prone and acne-prone skin types. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'acne',
  '/images/products/universkin/aza.svg',
  ARRAY['Azelaic Acid (Custom %)', 'Universkin P Base'],
  ARRAY['combination', 'oily', 'sensitive'],
  ARRAY['redness', 'acne', 'dark-spots'],
  'Apply as directed by your RELUXE provider. Frequency depends on your custom concentration.',
  'Particularly effective for rosacea-prone skin—calms and clarifies simultaneously.',
  '[]'::JSONB,
  '{"westfield":"Redness-prone, breakout-prone skin that needs clarity."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  2
),

-- 27. P Serum + Retinol (RET)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-retinol',
  'P Serum + Retinol (RET)',
  'Texture Refinement & Anti-Aging',
  'Refines texture and fine lines with customized retinol strength.',
  'P Serum + Retinol is a personalized serum by Universkin that refines texture and addresses fine lines with a provider-selected retinol concentration. Start low and scale up based on tolerance. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'anti-aging',
  '/images/products/universkin/ret.svg',
  ARRAY['Retinol (Custom %)', 'Universkin P Base'],
  ARRAY['normal', 'combination'],
  ARRAY['fine-lines', 'texture', 'dullness'],
  'Apply in the evening as directed by your RELUXE provider. Start every other night and increase frequency as tolerated.',
  'Gentle anti-aging start that can scale up as your skin builds tolerance.',
  '[]'::JSONB,
  '{"westfield":"Gentle anti-aging start that can scale up.","carmel":"Texture + fine line focus with support actives."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  3
),

-- 28. P Serum + Tranexamic Acid (TA)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-tranexamic-acid',
  'P Serum + Tranexamic Acid (TA)',
  'Melasma Maintenance',
  'Supports melasma maintenance and pigment control.',
  'P Serum + Tranexamic Acid is a personalized serum by Universkin that supports melasma maintenance and ongoing pigment management. Tranexamic acid inhibits melanin transfer for visible brightening over time. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'brightening',
  '/images/products/universkin/ta.svg',
  ARRAY['Tranexamic Acid (Custom %)', 'Universkin P Base'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['melasma', 'dark-spots'],
  'Apply as directed—typically twice daily for active melasma management.',
  'Targeted pigment protocol—pair with daily mineral SPF for best results.',
  '[]'::JSONB,
  '{"westfield":"Targeted pigment protocol with daily sunscreen.","carmel":"Melasma maintenance with clarity benefits."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  4
),

-- 29. P Serum + Kojic Acid (KOJ)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-kojic-acid',
  'P Serum + Kojic Acid (KOJ)',
  'Stubborn Dark Spot Treatment',
  'Helps with stubborn dark spots and hyperpigmentation.',
  'P Serum + Kojic Acid is a personalized serum by Universkin that targets stubborn dark spots and post-inflammatory hyperpigmentation. Kojic acid inhibits tyrosinase, a key enzyme in melanin production. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'brightening',
  '/images/products/universkin/koj.svg',
  ARRAY['Kojic Acid (Custom %)', 'Universkin P Base'],
  ARRAY['normal', 'dry', 'combination'],
  ARRAY['dark-spots', 'post-inflammatory'],
  'Apply to targeted areas as directed by your RELUXE provider.',
  'Best combined with tranexamic acid (TA) for multi-pathway pigment correction.',
  '[]'::JSONB,
  NULL,
  NULL,
  'in_clinic',
  false,
  NULL,
  5
),

-- 30. P Serum + Madecassoside (MAD)
(
  (SELECT id FROM brands WHERE slug = 'universkin'),
  'p-serum-madecassoside',
  'P Serum + Madecassoside (MAD)',
  'Calming & Soothing',
  'Soothes and calms reactive, sensitive skin.',
  'P Serum + Madecassoside is a personalized serum by Universkin that soothes and calms reactive, sensitive skin. Derived from Centella asiatica, madecassoside promotes healing and reduces irritation. Available at RELUXE Med Spa in Westfield and Carmel, Indiana.',
  'hydration',
  '/images/products/universkin/mad.svg',
  ARRAY['Madecassoside (Custom %)', 'Universkin P Base'],
  ARRAY['sensitive', 'normal', 'dry'],
  ARRAY['sensitivity', 'redness', 'post-procedure'],
  'Apply to reactive areas as directed by your RELUXE provider.',
  'Barrier-friendly blend for sensitivity—excellent post-procedure support serum.',
  '[]'::JSONB,
  '{"carmel":"Barrier-friendly blend for sensitivity."}'::JSONB,
  NULL,
  'in_clinic',
  false,
  NULL,
  6
);
