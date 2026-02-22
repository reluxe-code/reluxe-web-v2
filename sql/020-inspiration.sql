-- sql/020-inspiration.sql
-- Inspiration content system: articles, widgets, and widget assignments

-- ============================================================
-- 1. SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS inspiration_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  component_name TEXT NOT NULL,
  default_config JSONB DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspiration_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  business_goal TEXT,
  read_time TEXT,
  gradient TEXT,
  author TEXT DEFAULT 'RELUXE Clinical Team',
  hero_image TEXT,
  body JSONB DEFAULT '[]',
  related_services TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspiration_article_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES inspiration_articles(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES inspiration_widgets(id) ON DELETE CASCADE,
  placement_key TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insp_articles_slug ON inspiration_articles(slug);
CREATE INDEX IF NOT EXISTS idx_insp_articles_status ON inspiration_articles(status);
CREATE INDEX IF NOT EXISTS idx_insp_articles_category ON inspiration_articles(category);
CREATE INDEX IF NOT EXISTS idx_insp_article_widgets_article ON inspiration_article_widgets(article_id);
CREATE INDEX IF NOT EXISTS idx_insp_article_widgets_placement ON inspiration_article_widgets(placement_key);

-- RLS
ALTER TABLE inspiration_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_article_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read widgets" ON inspiration_widgets FOR SELECT USING (true);
CREATE POLICY "Service role widgets" ON inspiration_widgets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read published articles" ON inspiration_articles FOR SELECT USING (status = 'published');
CREATE POLICY "Service role articles" ON inspiration_articles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read assignments" ON inspiration_article_widgets FOR SELECT USING (true);
CREATE POLICY "Service role assignments" ON inspiration_article_widgets FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 2. SEED WIDGETS (16)
-- ============================================================

INSERT INTO inspiration_widgets (slug, name, description, component_name, default_config, category) VALUES
('before-after-slider', 'Before & After Slider', 'Side-by-side image comparison with draggable divider', 'BeforeAfterSlider',
 '{"before_label":"Before","after_label":"After","before_image":"","after_image":""}'::jsonb, 'visual'),
('cost-calculator', 'Cost Calculator', 'Interactive cost comparison and savings calculator', 'CostCalculator',
 '{"title":"Cost Calculator","items":[],"membership_discount":0.20}'::jsonb, 'interactive'),
('quiz-assessment', 'Quiz / Assessment', 'Multi-question scored quiz with personalized results', 'QuizAssessment',
 '{"title":"Find Your Match","questions":[],"results":[]}'::jsonb, 'interactive'),
('comparison-table', 'Comparison Table', 'Side-by-side feature comparison columns', 'ComparisonTable',
 '{"title":"","columns":[],"rows":[],"highlight_column":null}'::jsonb, 'content'),
('progress-timeline', 'Progress Timeline', 'Visual step-through treatment journey', 'ProgressTimeline',
 '{"title":"","steps":[]}'::jsonb, 'visual'),
('checklist', 'Checklist', 'Interactive checklist with checkboxes', 'Checklist',
 '{"title":"","items":[],"variant":"default"}'::jsonb, 'interactive'),
('treatment-picker', 'Treatment Picker', 'Card selection leading to a recommendation', 'TreatmentPicker',
 '{"title":"Which Treatment Is Right for You?","options":[]}'::jsonb, 'interactive'),
('countdown-planner', 'Countdown Planner', 'Date input that generates a milestone timeline', 'CountdownPlanner',
 '{"title":"Plan Your Timeline","milestones":[]}'::jsonb, 'interactive'),
('price-toggle', 'Price Toggle', 'Member vs guest pricing comparison switch', 'PriceToggle',
 '{"title":"Member vs Guest Pricing","services":[],"member_label":"Member","guest_label":"Guest"}'::jsonb, 'content'),
('decay-chart', 'Decay Chart', 'Treatment effectiveness fade over time', 'DecayChart',
 '{"title":"","treatment":"","peak_weeks":2,"duration_weeks":16,"retreatment_week":12}'::jsonb, 'visual'),
('day-gallery', 'Day-by-Day Gallery', 'Healing progression gallery by day', 'DayGallery',
 '{"title":"Healing Timeline","days":[]}'::jsonb, 'visual'),
('hotspot-diagram', 'Hotspot Diagram', 'Clickable face/body diagram with tooltips', 'HotspotDiagram',
 '{"title":"","diagram_type":"face","hotspots":[]}'::jsonb, 'visual'),
('syringe-visualizer', 'Syringe Visualizer', 'Visual syringe volume comparison', 'SyringeVisualizer',
 '{"title":"","areas":[],"unit":"mL"}'::jsonb, 'visual'),
('booking-cta', 'Booking CTA', 'Smart contextual booking button', 'BookingCta',
 '{"text":"Book Your Appointment","href":"/book","variant":"primary","subtext":""}'::jsonb, 'conversion'),
('interest-save', 'Save / Interest', 'Heart button to save to member preferences', 'InterestSave',
 '{"key":"","label":"Save This Article"}'::jsonb, 'engagement'),
('reminder-button', 'Reminder Button', 'Calendar .ics download for treatment reminders', 'ReminderButton',
 '{"title":"Set a Reminder","description":"","days_from_now":90,"event_title":""}'::jsonb, 'engagement')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. SEED ARTICLES (20)
-- ============================================================

-- #1 — Tox Maintenance Tracker (booking_frequency)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('tox-maintenance-tracker',
 'Why 12-Week Tox Top-Offs Beat Waiting',
 'Your tox starts fading around week 10. Here is why staying on a 12-week cycle keeps you looking fresh without starting over.',
 'Treatment Guides', 'booking_frequency', '4 min read',
 'linear-gradient(135deg, #7C3AED, #5B21B6)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Most patients wait until their wrinkles are fully back before rebooking tox. By that point, you are essentially starting from scratch every single time. There is a better way."},
   {"type":"h2","text":"How Tox Wears Off"},
   {"type":"p","text":"Neuromodulators like Botox, Dysport, and Jeuveau work by temporarily blocking nerve signals to targeted muscles. Results peak around week 2 and hold strong through week 8. Between weeks 10 and 14, movement gradually returns as the neurotoxin metabolizes. By week 16, most patients are back to baseline."},
   {"type":"widget","key":"decay-chart-tox"},
   {"type":"h2","text":"The 12-Week Sweet Spot"},
   {"type":"p","text":"When you rebook at week 12, you are topping off while residual relaxation is still present. This means your provider can often use fewer units, the muscle stays partially trained, and you never see full-strength lines return. Over time, many patients actually need less product per visit."},
   {"type":"callout","text":"Patients on a consistent 12-week cycle often reduce their annual tox spend by 15-20% compared to reactive rebooking.","variant":"pro-tip"},
   {"type":"h2","text":"Are You on the Right Schedule?"},
   {"type":"p","text":"Your ideal interval depends on your metabolism, muscle strength, and the product used. Take this quick quiz to find your sweet spot."},
   {"type":"widget","key":"quiz-tox-schedule"},
   {"type":"h2","text":"Never Miss Your Window"},
   {"type":"p","text":"Set a calendar reminder so your next appointment is booked before you even notice movement returning."},
   {"type":"widget","key":"reminder-tox"},
   {"type":"cta","text":"Book Your Tox Top-Off"}
 ]'::jsonb,
 ARRAY['tox'], 'published', true, 1, now());

-- #2 — Microneedling Collagen Countdown (booking_frequency)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('microneedling-collagen-countdown',
 'The 28-Day Collagen Countdown: Why Microneedling Works in Series',
 'One session starts the process. A series transforms your skin. Here is what is happening beneath the surface during each 28-day cycle.',
 'Treatment Guides', 'booking_frequency', '5 min read',
 'linear-gradient(135deg, #5B21B6, #1E1B4B)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Microneedling creates thousands of micro-channels in your skin, triggering your body''s natural wound-healing response. But the real magic happens over the next 28 days as new collagen forms, remodels, and strengthens. Here is the full timeline."},
   {"type":"h2","text":"The Collagen Cycle"},
   {"type":"widget","key":"timeline-collagen"},
   {"type":"h2","text":"Why One Session Is Not Enough"},
   {"type":"p","text":"A single microneedling session can improve texture and tone, but collagen remodeling is cumulative. Each session builds on the previous one. Think of it like going to the gym — one workout helps, but a consistent routine transforms your body. Most patients see their best results after 3-4 sessions spaced 4-6 weeks apart."},
   {"type":"h2","text":"What Healing Actually Looks Like"},
   {"type":"p","text":"The first few days after microneedling can look intense, but your skin recovers faster than you think. Here is a day-by-day look at the healing process."},
   {"type":"widget","key":"gallery-microneedling"},
   {"type":"callout","text":"Adding Morpheus8 RF energy to your microneedling session drives collagen remodeling even deeper — up to 4mm below the surface.","variant":"tip"},
   {"type":"h2","text":"Build Your Series"},
   {"type":"p","text":"Whether you choose SkinPen microneedling or Morpheus8 RF microneedling, committing to a series is how you get transformative results. Your provider will customize the depth, frequency, and combination based on your skin goals."},
   {"type":"cta","text":"Book a Microneedling Consultation"}
 ]'::jsonb,
 ARRAY['skinpen','morpheus8'], 'published', false, 2, now());

-- #3 — 365-Day Hair-Free Roadmap (booking_frequency)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('365-day-hair-free-roadmap',
 'The 365-Day Hair-Free Roadmap',
 'Laser hair removal is not a one-and-done treatment. Here is the full-year game plan for permanent reduction — and why consistency is everything.',
 'Treatment Guides', 'booking_frequency', '5 min read',
 'linear-gradient(135deg, #E11D73, #C026D3)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Laser hair removal is one of the best investments in aesthetics — but only if you stick with the program. Hair grows in cycles, and the laser can only target follicles in the active growth phase. That is why you need multiple sessions over 8-12 months for true permanent reduction."},
   {"type":"h2","text":"The Real Cost of Not Committing"},
   {"type":"p","text":"Most people spend $50-150 per month on waxing or shaving supplies over a lifetime. Compare that to a laser series that pays for itself within 2-3 years — and then you are done forever."},
   {"type":"widget","key":"calc-hair-removal"},
   {"type":"h2","text":"Your 12-Month Timeline"},
   {"type":"p","text":"Enter your target start date and we will map out your full treatment timeline, including ideal session spacing based on the body area you are treating."},
   {"type":"widget","key":"countdown-hair"},
   {"type":"h2","text":"Pre-Treatment Checklist"},
   {"type":"p","text":"Laser hair removal requires some prep. Follow these do''s and don''ts to get the best results from every session."},
   {"type":"widget","key":"checklist-laser-prep"},
   {"type":"callout","text":"Never wax or pluck between sessions — shaving only. The laser needs the follicle intact to target it.","variant":"warning"},
   {"type":"h2","text":"Consistency Is Everything"},
   {"type":"p","text":"Missing sessions or spacing them too far apart means you are chasing hair cycles instead of catching them. Sessions are typically spaced 4-6 weeks apart for the face and 6-8 weeks for the body. Stick with the schedule your provider sets and you will see dramatic reduction by month 8-10."},
   {"type":"cta","text":"Book a Laser Hair Removal Consultation"}
 ]'::jsonb,
 ARRAY['laser-hair-removal'], 'published', false, 3, now());

-- #4 — Chemical Peels Winter Reset (booking_frequency)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('chemical-peels-winter-reset',
 'Winter Peel Season: Your Skin''s Annual Reset Button',
 'Fall and winter are prime time for chemical peels. Less sun exposure means better results and faster healing. Here is how to pick the right peel for your goals.',
 'Treatment Guides', 'booking_frequency', '4 min read',
 'linear-gradient(135deg, #9333EA, #7C3AED)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Chemical peels use controlled acids to remove damaged outer layers of skin, revealing fresher, smoother skin underneath. They are one of the oldest and most effective treatments in dermatology — and winter is the perfect time to do them."},
   {"type":"h2","text":"Why Winter Is Peel Season"},
   {"type":"p","text":"After a peel, your skin is more sensitive to UV radiation. In summer, that means a higher risk of hyperpigmentation and sun damage undoing your results. In winter, shorter days and less intense sun give your skin the protected environment it needs to heal and regenerate beautifully."},
   {"type":"h2","text":"Which Peel Is Right for You?"},
   {"type":"p","text":"From light lunchtime peels to deeper resurfacing treatments, there is a peel for every skin type and concern. Select your primary goal below."},
   {"type":"widget","key":"picker-peels"},
   {"type":"h2","text":"Peel Prep and Aftercare"},
   {"type":"widget","key":"checklist-peel-care"},
   {"type":"callout","text":"A series of 3 light peels often delivers better cumulative results than a single deep peel — with far less downtime.","variant":"pro-tip"},
   {"type":"h2","text":"Pair It Up"},
   {"type":"p","text":"Peels pair beautifully with other treatments. A light peel 2 weeks before microneedling can enhance product penetration. A peel series combined with medical-grade retinol accelerates cell turnover dramatically. Ask your provider about combination protocols."},
   {"type":"cta","text":"Book a Peel Consultation"}
 ]'::jsonb,
 ARRAY['peels'], 'published', false, 4, now());

-- #5 — Membership Blueprint (membership_conversion) — uses RELUXE $100/$200 tiers
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('membership-blueprint',
 'The RELUXE Membership Blueprint: How $100 or $200 a Month Funds Your Best Year',
 'Our VIP membership turns a small monthly investment into a year of treatments, discounts, and perks. Here is exactly how the math works.',
 'Membership', 'membership_conversion', '5 min read',
 'linear-gradient(135deg, #C026D3, #9333EA)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Most patients tell us they want consistent treatments but feel like aesthetics is too expensive to keep up with. That is exactly why we built our VIP membership — to make a real skincare routine affordable and rewarding. For $100 or $200 a month, you get a monthly treatment voucher, exclusive discounts, and member-only pricing that adds up fast."},
   {"type":"h2","text":"Two Tiers, One Goal: Your Best Skin"},
   {"type":"p","text":"The VIP $100 membership gives you a monthly voucher redeemable for a 60-minute massage, signature facial, 10 units of tox, or a lip flip. The VIP $200 membership upgrades your monthly voucher to a Glo2Facial, HydraFacial, facial + massage combo, 120-minute massage, or 20 units of tox. Both tiers unlock the same VIP perks."},
   {"type":"h2","text":"The Savings Add Up Fast"},
   {"type":"p","text":"Use the calculator below to see how membership pricing compares to paying guest prices for the same treatments over a year."},
   {"type":"widget","key":"calc-membership"},
   {"type":"h2","text":"Member vs Guest: Side by Side"},
   {"type":"widget","key":"price-membership"},
   {"type":"h2","text":"VIP Perks Beyond the Voucher"},
   {"type":"list","items":["10% off all single eligible services","10% off packages","15% off all products","Member pricing on tox — best per-unit rates","Free monthly salt sauna access","$50 discount on all filler"],"ordered":false},
   {"type":"callout","text":"Your vouchers never expire while your membership is active. After cancellation, you still have 90 days to redeem unused vouchers. And you can share vouchers with family members.","variant":"tip"},
   {"type":"h2","text":"How Members Build a Full Year"},
   {"type":"p","text":"A $200 member who uses their monthly voucher for 20 units of tox is getting $1,200+ worth of tox at regular pricing for the base membership cost alone — before discounts on anything else. Stack that with member pricing on additional tox units, $50 off filler, 15% off products, and free sauna sessions, and most members save $2,000-$4,000 per year compared to guest pricing."},
   {"type":"cta","text":"Join as a VIP Member"}
 ]'::jsonb,
 ARRAY[]::text[], 'published', true, 5, now());

-- #6 — Event-Ready Countdown (membership_conversion)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('event-ready-countdown',
 'Event-Ready Countdown: Your 6-Month Glow-Up Timeline',
 'Wedding, reunion, vacation? Start 6 months out for flawless results. Here is the exact provider-approved timeline.',
 'Glow-Up Ideas', 'membership_conversion', '6 min read',
 'linear-gradient(135deg, #9333EA, #7C3AED)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Whether you are prepping for a wedding, milestone birthday, vacation, or any big event, starting your skin journey 6 months out is the sweet spot. It gives you time for treatments that build over sessions, room for adjustments, and zero last-minute panic. Here is the exact timeline our providers use."},
   {"type":"h2","text":"Build Your Custom Timeline"},
   {"type":"p","text":"Enter your event date and we will map out every milestone — from your first consultation to your final glow-up appointment."},
   {"type":"widget","key":"countdown-event"},
   {"type":"h2","text":"The 6-Month Breakdown"},
   {"type":"widget","key":"timeline-event"},
   {"type":"h2","text":"Why Membership Makes Events Easier"},
   {"type":"p","text":"If your event is 6+ months away, joining as a VIP member at $100 or $200/month means your monthly vouchers cover your core treatments leading up to the big day. You also save 10% on everything else and get $50 off filler. By the time your event arrives, your membership has paid for itself — and you look incredible."},
   {"type":"callout","text":"Never get filler or tox for the first time less than 4 weeks before a major event. Start early so your provider can fine-tune your results.","variant":"warning"},
   {"type":"h2","text":"The Final 2 Weeks"},
   {"type":"p","text":"Book a HydraFacial or Glo2Facial for a deep-clean glow. If you need a tox touch-up, 2 weeks out is the latest safe window. Lock in your skincare routine and skip any new products. Hydrate aggressively. Your skin should be peaking on event day."},
   {"type":"cta","text":"Start Your Glow-Up Timeline"}
 ]'::jsonb,
 ARRAY['tox','filler','hydrafacial','glo2facial'], 'published', false, 6, now());

-- #7 — Medical-Grade vs OTC (membership_conversion)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('medical-grade-vs-otc',
 'Medical-Grade vs. Drugstore Skincare: What You Are Actually Paying For',
 'The price gap between medical-grade and OTC skincare is real. But so is the difference in results. Here is what makes medical-grade worth it.',
 'Skin Tips', 'membership_conversion', '4 min read',
 'linear-gradient(135deg, #7C3AED, #C026D3)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Walk into any drugstore and you will find serums promising the same results as products your aesthetician recommends — at a fraction of the price. So why spend more? Because the active ingredient concentration, delivery system, and clinical testing behind medical-grade products are in a completely different league."},
   {"type":"h2","text":"The Comparison"},
   {"type":"widget","key":"table-skincare"},
   {"type":"h2","text":"Concentration Matters"},
   {"type":"p","text":"A drugstore vitamin C serum might contain 5-10% ascorbic acid in an unstable formula that oxidizes within weeks of opening. A medical-grade vitamin C like SkinCeuticals CE Ferulic delivers 15% L-ascorbic acid in a patented formula proven to remain potent for months. The difference in photoprotection and collagen stimulation is dramatic."},
   {"type":"h2","text":"Penetration Matters"},
   {"type":"p","text":"Medical-grade products use advanced delivery systems (liposomal, encapsulated, time-release) to get active ingredients past the skin barrier and into the layers where they actually work. OTC products often sit on the surface because their molecules are too large to penetrate effectively."},
   {"type":"h2","text":"The Long-Term Math"},
   {"type":"p","text":"When you factor in the number of OTC products you cycle through trying to find one that works, the cost difference shrinks. And the results gap widens."},
   {"type":"widget","key":"calc-skincare"},
   {"type":"callout","text":"VIP members save 15% on all products at RELUXE — including medical-grade skincare. That puts premium products closer to drugstore pricing.","variant":"tip"},
   {"type":"h2","text":"Where to Start"},
   {"type":"p","text":"You do not need to overhaul your entire routine at once. Start with one hero product — typically a vitamin C serum or retinol — and upgrade gradually. Book a Skin IQ analysis and your provider will tell you exactly which product will make the biggest impact for your skin type."},
   {"type":"cta","text":"Book a Skin IQ Analysis"}
 ]'::jsonb,
 ARRAY['skin-iq'], 'published', false, 7, now());

-- #8 — Tox and Glow Duo (cross_category)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('tox-and-glow-duo',
 'The Tox + Glow Duo: Why Our Providers Love This Combo',
 'Tox smooths the lines. A Glo2Facial lights up the skin. Together, they are the ultimate 60-minute glow-up.',
 'Treatment Guides', 'cross_category', '4 min read',
 'linear-gradient(135deg, #C026D3, #E11D73)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"If you are already coming in for tox, adding a facial to the same visit is one of the smartest moves in aesthetics. You are already here, your skin is being prepped, and combining treatments maximizes your results per visit. Our providers'' favorite pairing: tox plus a Glo2Facial."},
   {"type":"h2","text":"Why This Combo Works"},
   {"type":"p","text":"Tox handles dynamic wrinkles — the ones caused by muscle movement like forehead lines and crow''s feet. But it does nothing for skin texture, tone, or glow. That is where the Glo2Facial comes in. It exfoliates, oxygenates, and infuses active serums in one treatment, giving you an instant lit-from-within finish that tox alone cannot deliver."},
   {"type":"h2","text":"See the Difference"},
   {"type":"widget","key":"slider-tox-glow"},
   {"type":"h2","text":"Member vs Guest Pricing"},
   {"type":"p","text":"As a VIP member, this combo gets even more affordable. See how the numbers compare."},
   {"type":"widget","key":"price-tox-glow"},
   {"type":"callout","text":"The Glo2Facial uses OxyGeneo technology to increase oxygen levels in the skin by up to 50%, enhancing product absorption from any treatment done afterward — including tox.","variant":"pro-tip"},
   {"type":"h2","text":"How to Schedule It"},
   {"type":"p","text":"Book your tox and Glo2Facial in the same appointment. Your provider will typically do the facial first to cleanse and prep the skin, then follow with tox injections. The entire visit takes about 60-75 minutes. Results are immediate for the glow and peak at 2 weeks for the tox."},
   {"type":"cta","text":"Book the Tox + Glow Combo"}
 ]'::jsonb,
 ARRAY['tox','glo2facial'], 'published', false, 8, now());

-- #9 — Neck and Decollete (cross_category)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('neck-decollete-reveal',
 'The Neck and Chest: The Age Giveaway Nobody Talks About',
 'Your face might look 10 years younger, but your neck and chest tell the real story. Here is how to close the gap.',
 'Treatment Guides', 'cross_category', '4 min read',
 'linear-gradient(135deg, #5B21B6, #7C3AED)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"You invest in your face — tox, filler, facials, sunscreen. But if your neck and decollete are not getting the same attention, they are quietly aging faster than anything above your jawline. Sun damage, crepey texture, horizontal lines, and brown spots on the chest are some of the most common concerns we see — and some of the most treatable."},
   {"type":"h2","text":"Treatment Zones"},
   {"type":"p","text":"Tap on each zone below to see which treatments work best for that area."},
   {"type":"widget","key":"hotspot-neck"},
   {"type":"h2","text":"Before and After"},
   {"type":"widget","key":"slider-neck"},
   {"type":"h2","text":"The Best Treatments for Each Concern"},
   {"type":"list","items":["Crepey texture and laxity: Morpheus8 RF microneedling tightens and rebuilds collagen from within","Brown spots and sun damage: IPL photofacial breaks up pigmentation in 1-3 sessions","Horizontal neck lines: A combination of microneedling and skin-tightening treatments","Overall tone and glow: Chemical peels and Glo2Facials resurface and brighten"],"ordered":false},
   {"type":"callout","text":"The neck and chest skin is thinner and more delicate than facial skin. Always extend your SPF application below the jawline — every single day.","variant":"warning"},
   {"type":"h2","text":"Start Your Plan"},
   {"type":"p","text":"Most neck and chest treatment plans involve 2-4 sessions of the primary treatment spaced 4-6 weeks apart. Your provider will assess your skin and build a customized approach based on your concerns and timeline."},
   {"type":"cta","text":"Book a Neck and Chest Consultation"}
 ]'::jsonb,
 ARRAY['morpheus8','ipl'], 'published', false, 9, now());

-- #10 — IV Therapy and Aesthetics (cross_category)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('iv-therapy-aesthetics',
 'IV Therapy + Aesthetics: The Recovery Accelerator',
 'Hydration, vitamins, and antioxidants delivered directly to your bloodstream. Here is how IV therapy amplifies your aesthetic results.',
 'Treatment Guides', 'cross_category', '4 min read',
 'linear-gradient(135deg, #7C3AED, #5B21B6)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"IV therapy is not just for hangovers and jet lag. When combined with aesthetic treatments, targeted IV drips can enhance recovery, boost collagen production, and improve skin quality from the inside out. Think of it as the internal support system for everything you are doing externally."},
   {"type":"h2","text":"IV Options Compared"},
   {"type":"widget","key":"table-iv"},
   {"type":"h2","text":"The Synergy Effect"},
   {"type":"p","text":"Vitamin C is essential for collagen synthesis. Glutathione is the body''s master antioxidant, protecting cells from oxidative stress. B-complex vitamins support cellular energy and repair. When you deliver these directly via IV — bypassing the gut where absorption is limited — your body has the raw materials it needs to heal faster and produce better collagen after treatments like microneedling, Morpheus8, and peels."},
   {"type":"h2","text":"Which Drip Matches Your Routine?"},
   {"type":"widget","key":"quiz-iv"},
   {"type":"callout","text":"Schedule your IV drip 1-2 days before a microneedling or Morpheus8 session for optimal collagen support during healing.","variant":"pro-tip"},
   {"type":"h2","text":"What to Expect"},
   {"type":"p","text":"IV therapy takes 30-60 minutes. You sit comfortably while the drip runs. Most patients feel an energy boost and improved hydration within hours. There is zero downtime — you can go right into your next treatment or back to your day."},
   {"type":"cta","text":"Book an IV Therapy Session"}
 ]'::jsonb,
 ARRAY[]::text[], 'published', false, 10, now());

-- #11 — Liquid Lift vs Surgical (high_ticket)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('liquid-lift-vs-surgical',
 'Liquid Lift vs. Surgical Facelift: The Honest Comparison',
 'Filler-based facial rejuvenation can deliver stunning results — but it is not a replacement for surgery. Here is an honest look at both options.',
 'Treatment Guides', 'high_ticket', '5 min read',
 'linear-gradient(135deg, #1E1B4B, #5B21B6)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"The term liquid facelift gets thrown around a lot, and it can mean different things depending on who you talk to. At its core, it refers to using dermal fillers — and sometimes tox — to restore volume, lift sagging tissue, and rejuvenate the face without surgery. For many patients, it is a genuine alternative. For others, surgery is the better path. Here is how to think about it honestly."},
   {"type":"h2","text":"The Comparison"},
   {"type":"widget","key":"table-lift"},
   {"type":"h2","text":"The Cost Over Time"},
   {"type":"p","text":"A surgical facelift has a higher upfront cost but lasts 7-10+ years. A liquid lift costs less per session but requires maintenance every 12-18 months. Use the calculator to compare total cost over different time horizons."},
   {"type":"widget","key":"calc-lift"},
   {"type":"h2","text":"Who Is a Good Candidate for a Liquid Lift?"},
   {"type":"list","items":["Mild to moderate volume loss in the cheeks, temples, or jawline","Early jowling or nasolabial fold deepening","Patients who want improvement without general anesthesia or extended downtime","Patients in their 30s-50s who are not yet candidates for surgical lifting"],"ordered":false},
   {"type":"h2","text":"Who Should Consider Surgery?"},
   {"type":"list","items":["Significant skin laxity that filler alone cannot address","Excess skin on the neck or jawline","Patients who want a one-time intervention with long-lasting results","Cases where adding more filler would create an unnatural overfilled look"],"ordered":false},
   {"type":"callout","text":"A good injector will tell you when filler is not the right answer. If you are being told you need 8+ syringes to achieve your goal, it is worth getting a surgical consultation for comparison.","variant":"tip"},
   {"type":"cta","text":"Book a Facial Balancing Consultation"}
 ]'::jsonb,
 ARRAY['filler','facial-balancing'], 'published', false, 11, now());

-- #12 — Physics of Filler (high_ticket)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('physics-of-filler',
 'The Physics of Filler: Why 4 Syringes Looks More Natural Than 1',
 'More filler does not mean more obvious. Here is why distributing volume across the face creates the most natural, balanced results.',
 'Treatment Guides', 'high_ticket', '5 min read',
 'linear-gradient(135deg, #7C3AED, #C026D3)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"When patients hear they might need 3-4 syringes of filler, the first reaction is usually sticker shock — or fear of looking overdone. But here is the counterintuitive truth: using more product distributed strategically across multiple areas almost always looks more natural than concentrating a single syringe in one spot."},
   {"type":"h2","text":"Understanding Volume by Area"},
   {"type":"p","text":"Each area of the face has a different volume capacity. Lips might take 0.5-1mL. Cheeks often need 1-2mL per side. The chin and jawline can take 1-2mL. When you only treat one area, it can look disproportionate. When you balance volume across the full face, everything harmonizes."},
   {"type":"widget","key":"syringe-face"},
   {"type":"h2","text":"The Injection Map"},
   {"type":"p","text":"Tap on each zone to see typical volume ranges and what that filler does for facial balance."},
   {"type":"widget","key":"hotspot-filler"},
   {"type":"h2","text":"Why Less in One Area Can Look Like More"},
   {"type":"p","text":"If you only add volume to your lips without addressing your cheeks or chin, your lips can look disproportionately large even with modest amounts. But add a little cheek projection and chin definition, and suddenly the same lips look perfectly balanced. This is the art of facial balancing — and it is why experienced injectors think in terms of the full face, not individual features."},
   {"type":"callout","text":"You do not have to do everything in one session. Many patients build their facial balance over 2-3 appointments, starting with the foundation (cheeks and chin) before refining features like the lips and jawline.","variant":"tip"},
   {"type":"h2","text":"The Math of Natural Results"},
   {"type":"p","text":"1 syringe in the lips = noticeable change in one feature. 4 syringes across cheeks, chin, jawline, and lips = subtle enhancement everywhere that makes you look refreshed, rested, and naturally beautiful. That is the physics of filler."},
   {"type":"cta","text":"Book a Facial Balancing Consultation"}
 ]'::jsonb,
 ARRAY['filler','facial-balancing'], 'published', true, 12, now());

-- #13 — Laser Alphabet Soup (high_ticket)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('laser-alphabet-soup',
 'Laser Alphabet Soup: IPL vs. ClearLift vs. Morpheus8',
 'IPL, RF, CO2, BBL — the laser world is full of acronyms. Here is a plain-English guide to what each technology actually does.',
 'Treatment Guides', 'high_ticket', '5 min read',
 'linear-gradient(135deg, #5B21B6, #1E1B4B)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"When you start researching skin treatments beyond injectables, you run into a wall of acronyms. IPL, RF, CO2, BBL, fractional, non-ablative — it can feel like learning a new language. Here is the plain-English breakdown of every laser and energy-based device at RELUXE and what each one does best."},
   {"type":"h2","text":"Pick Your Concern"},
   {"type":"p","text":"Select your primary skin concern and we will recommend the best technology for you."},
   {"type":"widget","key":"picker-laser"},
   {"type":"h2","text":"The Full Comparison"},
   {"type":"widget","key":"table-laser"},
   {"type":"h2","text":"IPL (Intense Pulsed Light)"},
   {"type":"p","text":"Best for: Sun damage, brown spots, redness, rosacea, broken capillaries. IPL uses broad-spectrum light to target pigment and vascular lesions. It is one of the most versatile and popular treatments we offer. Most patients need 2-4 sessions. Downtime: minimal — some darkening of spots for 5-7 days before they flake off."},
   {"type":"h2","text":"ClearLift"},
   {"type":"p","text":"Best for: Fine lines, overall tone, pore size, mild laxity. ClearLift delivers fractional laser energy beneath the skin surface without breaking it — meaning zero downtime. It is the true lunchtime laser. Results build over 3-5 sessions."},
   {"type":"h2","text":"Morpheus8"},
   {"type":"p","text":"Best for: Skin tightening, texture, acne scarring, deeper wrinkles. Morpheus8 combines microneedling with radiofrequency energy for deep collagen remodeling. It is the most powerful non-surgical tightening treatment we offer. Downtime: 2-4 days of redness and mild swelling."},
   {"type":"callout","text":"Many patients benefit from combining technologies. IPL to clear pigment + Morpheus8 to tighten and texture is one of our most popular combination protocols.","variant":"pro-tip"},
   {"type":"cta","text":"Book a Skin Consultation"}
 ]'::jsonb,
 ARRAY['ipl','clearlift','morpheus8'], 'published', false, 13, now());

-- #14 — First Med Spa Visit (brand_authority) — replaced clean-clinical-standard
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('first-med-spa-visit',
 'Your First Med Spa Visit: What to Expect at RELUXE',
 'Never been to a med spa? Here is everything that happens from the moment you walk in — no jargon, no pressure, no surprises.',
 'Treatment Guides', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #E11D73, #9333EA)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Walking into a med spa for the first time can feel intimidating. What do you wear? Will they try to sell you everything? Does it hurt? We hear these questions every day — and we love them, because it means you are doing your research. Here is exactly what a first visit to RELUXE looks like."},
   {"type":"h2","text":"Before You Arrive"},
   {"type":"p","text":"No special prep is needed for a consultation. Come with a clean face if you can, but it is not required. Wear whatever you are comfortable in. If you have specific concerns, jot them down so you do not forget to mention them. That is it."},
   {"type":"h2","text":"The Consultation"},
   {"type":"p","text":"Your provider will sit with you one-on-one and ask about your goals, medical history, and any concerns. This is a conversation — not a pitch. A good provider will tell you what you need, what you do not need, and what can wait. Be honest about your budget. We will work within it."},
   {"type":"h2","text":"First Visit Checklist"},
   {"type":"widget","key":"checklist-first-visit"},
   {"type":"h2","text":"What Will Not Happen"},
   {"type":"list","items":["You will not be pressured to buy anything","You will not be talked into treatments you did not ask about","You will not leave feeling confused or overwhelmed","You will not be judged for being a first-timer"],"ordered":false},
   {"type":"h2","text":"What Happens After"},
   {"type":"p","text":"If you decide to move forward with a treatment, your provider will walk you through every step — what it feels like, how long it takes, what to expect during healing, and when to come back. If you want to think about it, that is completely fine. There is zero pressure to commit on the spot."},
   {"type":"callout","text":"Our VIP membership starts at $100/month and includes a monthly treatment voucher. Many first-time patients find it is the easiest way to get started with consistent care.","variant":"tip"},
   {"type":"widget","key":"save-first-visit"},
   {"type":"cta","text":"Book Your Free Consultation"}
 ]'::jsonb,
 ARRAY[]::text[], 'published', false, 14, now());

-- #15 — Science of Glo2Facial (brand_authority)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('science-of-glo2facial',
 'The Science Behind the Glo2Facial: Why OxyGeneo Technology Works',
 'It exfoliates, oxygenates, and infuses — all in one treatment. Here is the science behind our most popular facial.',
 'Treatment Guides', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #9333EA, #C026D3)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"The Glo2Facial is consistently one of our most-requested treatments — and for good reason. It delivers visible, same-day results using a three-phase technology called OxyGeneo that works with your body''s own biology. Here is what is actually happening to your skin during those 45 minutes."},
   {"type":"h2","text":"The Three Phases"},
   {"type":"widget","key":"timeline-glo2"},
   {"type":"h2","text":"The Bohr Effect: Your Skin''s Natural Oxygen Boost"},
   {"type":"p","text":"The secret behind OxyGeneo is the Bohr Effect — a natural physiological process where CO2-rich blood releases more oxygen to surrounding tissue. The treatment creates a CO2-rich environment on the skin surface, triggering your body to flood the area with oxygenated blood. This is not just marketing — it is basic physiology, and it increases oxygen in the skin by up to 50%."},
   {"type":"h2","text":"Before and After"},
   {"type":"widget","key":"slider-glo2"},
   {"type":"h2","text":"Who Is It For?"},
   {"type":"p","text":"The Glo2Facial works on all skin types and tones with zero downtime. It is ideal for dull or dehydrated skin, uneven texture, fine lines, large pores, and pre-event prep. It is also safe during pregnancy, making it one of the few professional treatments available to expectant mothers."},
   {"type":"callout","text":"VIP $200 members get the Glo2Facial as one of their monthly voucher options — making it effectively free every month.","variant":"tip"},
   {"type":"cta","text":"Book a Glo2Facial"}
 ]'::jsonb,
 ARRAY['glo2facial'], 'published', false, 15, now());

-- #16 — Brotox Guide (brand_authority)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('brotox-guide',
 'The Brotox Guide: Men''s Aesthetics Without the Stigma',
 'More men are getting tox than ever. Here is what guys actually need to know — no filter, no fluff.',
 'Treatment Guides', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #1E1B4B, #5B21B6)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Men now account for over 15% of all cosmetic procedures in the U.S. — and tox is the number one treatment. If you have been curious about Botox but are not sure what to expect or whether it is right for you, here is the straight talk."},
   {"type":"h2","text":"Is Tox Right for You?"},
   {"type":"p","text":"Take this 60-second quiz to see if you are a good candidate."},
   {"type":"widget","key":"quiz-brotox"},
   {"type":"h2","text":"What Men''s Tox Looks Like"},
   {"type":"p","text":"Men typically need 20-30% more units than women because male facial muscles are larger and stronger. The goal is not to freeze your face — it is to soften lines while keeping natural expression. A skilled injector knows the difference between a rested look and a frozen one."},
   {"type":"widget","key":"slider-brotox"},
   {"type":"h2","text":"The Top 3 Areas for Men"},
   {"type":"list","items":["Forehead lines: The number one concern for men. Tox smooths horizontal lines without affecting your ability to show expression.","Crow''s feet: Lines around the eyes that deepen with sun exposure and squinting. A few units here makes a significant difference.","The 11s (glabellar lines): Those vertical lines between your brows that can make you look angry or tired. Tox here is subtle and effective."],"ordered":true},
   {"type":"h2","text":"What to Expect"},
   {"type":"p","text":"The treatment takes 10-15 minutes. Most men describe it as a slight pinch — significantly less painful than a tattoo. Results appear in 3-5 days and last 3-4 months. No one at the office will know unless you tell them."},
   {"type":"callout","text":"Ask about our VIP membership — the $100/month tier includes 10 units of tox per month, which is a great starting point for maintenance.","variant":"tip"},
   {"type":"cta","text":"Book a Tox Consultation"}
 ]'::jsonb,
 ARRAY['tox'], 'published', false, 16, now());

-- #17 — Sunscreen Insurance Policy (brand_authority)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('sunscreen-insurance-policy',
 'SPF Is Insurance: The Math Behind Sun Protection',
 'You spend hundreds on skincare and treatments. Skipping sunscreen is like leaving the front door open. Here is the real cost of UV damage.',
 'Skin Tips', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #E11D73, #C026D3)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Here is a number that should change how you think about sunscreen: UV radiation is responsible for up to 80% of visible skin aging. That means wrinkles, dark spots, loss of firmness, and uneven texture are primarily caused by something you can prevent — for about $1 a day."},
   {"type":"h2","text":"How Good Is Your SPF Game?"},
   {"type":"widget","key":"quiz-spf"},
   {"type":"h2","text":"The Cost of UV Damage vs. Prevention"},
   {"type":"p","text":"Treating sun damage after the fact is dramatically more expensive than preventing it. Use the calculator below to compare the annual cost of good sunscreen vs. the treatments needed to reverse UV damage."},
   {"type":"widget","key":"calc-spf"},
   {"type":"h2","text":"SPF Basics That Actually Matter"},
   {"type":"list","items":["SPF 30 blocks 97% of UVB rays. SPF 50 blocks 98%. The difference is small.","UVA penetrates windows. If you sit near windows, you need SPF indoors.","Chemical and mineral sunscreens are both safe. The best one is the one you actually wear.","Reapply every 2 hours outdoors. SPF powder or spray for midday touch-ups.","Apply SPF as the last step of skincare, before makeup."],"ordered":false},
   {"type":"h2","text":"What to Look For"},
   {"type":"p","text":"Choose broad-spectrum SPF 30-50. Look for formulas you enjoy wearing — if it feels good, you will use it. Tinted mineral sunscreens double as a light foundation and work beautifully on all skin tones. Our providers can recommend specific products during your next visit."},
   {"type":"callout","text":"VIP members save 15% on all products including medical-grade SPF. That brings premium sun protection down to about $35-40 for a 2-3 month supply.","variant":"tip"},
   {"type":"cta","text":"Book a Skin IQ Analysis"}
 ]'::jsonb,
 ARRAY['skin-iq'], 'published', false, 17, now());

-- #18 — Sculptra Biostimulator (brand_authority)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('sculptra-biostimulator',
 'Sculptra: The Collagen Bank Account You Didn''t Know You Needed',
 'Unlike filler, Sculptra does not add volume directly. It tells your body to make its own collagen. Here is why that is a game-changer.',
 'Treatment Guides', 'brand_authority', '5 min read',
 'linear-gradient(135deg, #7C3AED, #5B21B6)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"Most dermal fillers work by adding volume directly — they plump, they lift, they fill. Sculptra works completely differently. It is a biostimulator made of poly-L-lactic acid (PLLA) that triggers your body to produce its own collagen over time. The result is gradual, natural-looking rejuvenation that can last 2+ years."},
   {"type":"h2","text":"How Sculptra Works Over Time"},
   {"type":"widget","key":"decay-sculptra"},
   {"type":"h2","text":"The Collagen Building Phases"},
   {"type":"widget","key":"timeline-sculptra"},
   {"type":"h2","text":"Sculptra vs. Traditional Filler"},
   {"type":"list","items":["Filler: Immediate results, lasts 6-18 months, adds external volume","Sculptra: Gradual results over 3-6 months, lasts 2+ years, builds your own collagen","Filler: Best for precise feature enhancement (lips, chin, jawline)","Sculptra: Best for overall facial volume restoration and skin quality improvement"],"ordered":false},
   {"type":"h2","text":"The Treatment Protocol"},
   {"type":"p","text":"Most patients need 2-3 sessions spaced 4-6 weeks apart. Results begin appearing around week 6-8 as new collagen forms, with full results visible at 3-6 months. Because the results come from your own collagen, they look and feel completely natural."},
   {"type":"callout","text":"Sculptra is the ultimate long-game investment. The collagen it stimulates continues improving your skin quality for months after your last session — and results can last 2 years or more.","variant":"pro-tip"},
   {"type":"cta","text":"Book a Sculptra Consultation"}
 ]'::jsonb,
 ARRAY['sculptra'], 'published', false, 18, now());

-- #19 — Lip Filler French Girl (high_ticket)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('lip-filler-french-girl',
 'The French-Girl Lip: Subtle Filler Done Right',
 'The best lip filler looks like you were born with it. Here is the subtle approach our injectors use for naturally full, balanced lips.',
 'Treatment Guides', 'high_ticket', '4 min read',
 'linear-gradient(135deg, #C026D3, #E11D73)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"The French-girl lip is the antidote to every overfilled Instagram lip you have ever seen. It is full but not puffy, defined but not drawn-on, hydrated and naturally pillowy. Achieving this look is less about how much filler you use and more about where you put it."},
   {"type":"h2","text":"How Much Filler, Really?"},
   {"type":"p","text":"For a subtle, natural enhancement, most patients need just 0.5-1mL. That is half to one syringe. The visualizer below shows what different volumes look like in context."},
   {"type":"widget","key":"syringe-lips"},
   {"type":"h2","text":"Before and After"},
   {"type":"widget","key":"slider-lips"},
   {"type":"h2","text":"The Technique Matters More Than the Product"},
   {"type":"p","text":"An experienced injector focuses on the vermillion border for subtle definition, the body of the lip for gentle volume, and the philtrum columns for that coveted cupid''s bow shape. They also consider your unique lip anatomy, facial proportions, and natural asymmetry. The goal is harmony — not volume for volume''s sake."},
   {"type":"h2","text":"What to Expect"},
   {"type":"list","items":["Treatment time: 15-20 minutes with numbing","Swelling peaks at 24-48 hours — do not judge your results until day 5-7","Final results settle at 2 weeks","Duration: 6-12 months depending on the product and your metabolism","Avoid strenuous exercise, alcohol, and excessive heat for 24 hours post-treatment"],"ordered":false},
   {"type":"callout","text":"VIP members save $50 on every syringe of filler. For lip maintenance, that adds up quickly — especially if you refresh every 6-9 months.","variant":"tip"},
   {"type":"cta","text":"Book a Lip Consultation"}
 ]'::jsonb,
 ARRAY['filler'], 'published', false, 19, now());

-- #20 — Post-Procedure First 24 Hours (brand_authority)
INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('post-procedure-first-24-hours',
 'The First 24 Hours: Your Post-Procedure Survival Guide',
 'What to do (and what to avoid) in the critical first day after your treatment. Covers tox, filler, microneedling, peels, and laser.',
 'Skin Tips', 'brand_authority', '5 min read',
 'linear-gradient(135deg, #5B21B6, #9333EA)',
 'RELUXE Clinical Team',
 '[
   {"type":"p","text":"The first 24 hours after any aesthetic treatment are the most important for your results. What you do — and do not do — in this window can affect healing time, comfort, and final outcomes. Here is your definitive aftercare guide for the most common treatments."},
   {"type":"h2","text":"Day-by-Day Healing"},
   {"type":"p","text":"See what the typical healing timeline looks like for microneedling and resurfacing treatments."},
   {"type":"widget","key":"gallery-healing"},
   {"type":"h2","text":"The Universal Rules"},
   {"type":"list","items":["No strenuous exercise for 24 hours — elevated heart rate increases swelling and bruising","No alcohol for 24 hours — it thins the blood and worsens inflammation","No saunas, hot tubs, or steam rooms for 24-48 hours","Do not touch, rub, or massage the treated area unless instructed","Apply SPF 30+ if going outdoors — your skin is more vulnerable after treatment"],"ordered":false},
   {"type":"h2","text":"Treatment-Specific Aftercare"},
   {"type":"widget","key":"checklist-aftercare"},
   {"type":"h2","text":"When to Call Us"},
   {"type":"p","text":"Some swelling, redness, and mild discomfort are completely normal. Contact your provider if you experience: severe pain that is not relieved by OTC painkillers, signs of infection (increasing redness, warmth, pus), unusual skin color changes (white or blue patches near injection sites), or any symptom that feels concerning. We would rather hear from you and reassure you than have you worry at home."},
   {"type":"callout","text":"Take a photo right after your treatment and on each subsequent day. This helps you and your provider track your healing and results over time.","variant":"tip"},
   {"type":"cta","text":"Book Your Next Treatment"}
 ]'::jsonb,
 ARRAY['morpheus8','skinpen','peels'], 'published', false, 20, now());

-- ============================================================
-- 3b. MIGRATE EXISTING 6 ARTICLES (from data/articles.js)
-- ============================================================

INSERT INTO inspiration_articles (slug, title, excerpt, category, business_goal, read_time, gradient, author, body, related_services, status, featured, sort_order, published_at) VALUES
('botox-vs-dysport-vs-daxxify',
 'Botox vs. Dysport vs. Daxxify: Which Tox Is Right for You?',
 'All four tox brands smooth wrinkles, but they differ in onset, spread, and longevity.',
 'Treatment Guides', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #7C3AED, #5B21B6)',
 'RELUXE Clinical Team',
 '[{"type":"p","text":"If you are considering wrinkle prevention or smoothing, you have probably heard of Botox. But it is not the only option. Dysport, Jeuveau, and Daxxify are all FDA-approved neuromodulators that work by temporarily relaxing the muscles that cause wrinkles."},{"type":"h2","text":"Botox: The OG"},{"type":"p","text":"Botox has been FDA-approved since 2002 and is the most well-known brand. It is precise, predictable, and works beautifully for targeted areas. Onset is typically 3-5 days, with full results at 2 weeks. Duration: 3-4 months."},{"type":"h2","text":"Dysport: The Fast Starter"},{"type":"p","text":"Dysport tends to kick in faster — many patients notice softening within 24-48 hours. It spreads a bit more than Botox, making it great for larger areas like the forehead. Duration: 3-4 months."},{"type":"h2","text":"Jeuveau: The Newcomer"},{"type":"p","text":"Jeuveau is the newest tox on the market, specifically designed for aesthetics. It is priced competitively and performs similarly to Botox. Duration: 3-4 months."},{"type":"h2","text":"Daxxify: The Long-Laster"},{"type":"p","text":"Daxxify lasted 6-9 months in clinical trials — roughly twice as long as traditional tox. It uses novel peptide technology. Higher per-session cost, but fewer appointments per year."},{"type":"h2","text":"How Our Providers Choose"},{"type":"p","text":"There is no single best tox. Your provider considers your anatomy, muscle strength, treatment goals, budget, and history. The most important factor is not the brand — it is the injector."},{"type":"cta","text":"Book a Free Tox Consultation"}]'::jsonb,
 ARRAY['tox'], 'published', false, 21, now()),

('first-filler-appointment',
 'Your First Filler Appointment: What to Actually Expect',
 'Nervous about your first filler session? We walk you through every step — from consultation to aftercare.',
 'Treatment Guides', 'brand_authority', '5 min read',
 'linear-gradient(135deg, #C026D3, #9333EA)',
 'RELUXE Clinical Team',
 '[{"type":"p","text":"Getting filler for the first time can feel like a big deal. Here is exactly what happens when you walk through our door for your first filler appointment."},{"type":"h2","text":"Before You Arrive"},{"type":"p","text":"Avoid blood thinners for 5-7 days before your appointment to minimize bruising. Skip alcohol for 24 hours. Come with a clean face and eat a normal meal beforehand."},{"type":"h2","text":"The Consultation"},{"type":"p","text":"Your provider will assess your facial anatomy and discuss your goals. Be honest about your budget and expectations."},{"type":"h2","text":"The Treatment"},{"type":"p","text":"Most fillers contain lidocaine, and your provider will apply topical numbing cream 15-20 minutes before injecting. The injection process takes 10-30 minutes."},{"type":"h2","text":"Right After"},{"type":"p","text":"Expect mild swelling and possible bruising. Swelling peaks at 24-48 hours and resolves within a week. Apply ice and avoid strenuous exercise for 24 hours."},{"type":"h2","text":"The Results"},{"type":"p","text":"You will see immediate improvement, but the final result settles over 2 weeks. Results last 6-18 months depending on the product and area treated."},{"type":"cta","text":"Book Your First Filler Consult"}]'::jsonb,
 ARRAY['filler'], 'published', false, 22, now()),

('morning-skincare-routine',
 'The Ultimate Morning Skincare Routine (Provider-Approved)',
 'Our aestheticians share their go-to AM routine for every skin type. Spoiler: SPF is non-negotiable.',
 'Skin Tips', 'brand_authority', '3 min read',
 'linear-gradient(135deg, #E11D73, #C026D3)',
 'RELUXE Aesthetics Team',
 '[{"type":"p","text":"Your morning routine sets the tone for how your skin looks and feels all day. Here is the exact routine our aestheticians recommend."},{"type":"h2","text":"Step 1: Gentle Cleanser"},{"type":"p","text":"Skip the harsh foaming cleansers. Use a gentle, pH-balanced cleanser to remove overnight oil."},{"type":"h2","text":"Step 2: Vitamin C Serum"},{"type":"p","text":"The single most impactful antioxidant you can apply. Apply 3-4 drops to clean, slightly damp skin."},{"type":"h2","text":"Step 3: Moisturizer"},{"type":"p","text":"Even oily skin needs moisture. Choose a lightweight, non-comedogenic formula."},{"type":"h2","text":"Step 4: SPF (Non-Negotiable)"},{"type":"p","text":"UV damage causes 80% of visible aging. Use broad-spectrum SPF 30+ every single morning, even on cloudy days."},{"type":"h2","text":"What NOT to Use in the Morning"},{"type":"p","text":"Save retinol and exfoliating acids for nighttime. In the AM, stick to protection and hydration."},{"type":"cta","text":"Book a Skin IQ Analysis"}]'::jsonb,
 ARRAY['skin-iq'], 'published', false, 23, now()),

('morpheus8-guide',
 'Morpheus8: Why It Is Our Most-Requested Skin Remodeling Treatment',
 'Combining microneedling with radiofrequency, Morpheus8 tightens, smooths, and rebuilds collagen from the inside out.',
 'Treatment Guides', 'brand_authority', '4 min read',
 'linear-gradient(135deg, #5B21B6, #1E1B4B)',
 'RELUXE Clinical Team',
 '[{"type":"p","text":"Morpheus8 combines two proven technologies — microneedling plus radiofrequency energy — to remodel skin from the inside out, addressing texture, tightness, and tone."},{"type":"h2","text":"How It Works"},{"type":"p","text":"Morpheus8 delivers RF energy through tiny microneedles that penetrate up to 4mm into the skin, triggering collagen and elastin production."},{"type":"h2","text":"What It Treats"},{"type":"p","text":"On the face: fine lines, wrinkles, acne scarring, enlarged pores, uneven texture, mild jowling. On the body: stretch marks, cellulite, skin laxity, crepey texture."},{"type":"h2","text":"What to Expect"},{"type":"p","text":"Topical numbing for 30-45 minutes. Procedure takes 20-40 minutes. Red and mildly swollen for 2-4 days."},{"type":"h2","text":"How Many Sessions?"},{"type":"p","text":"Most patients see significant improvement after 1-3 sessions spaced 4-6 weeks apart."},{"type":"cta","text":"Book a Morpheus8 Consultation"}]'::jsonb,
 ARRAY['morpheus8'], 'published', false, 24, now()),

('wedding-glow-up-timeline',
 'Wedding Season Prep: Your 6-Month Glow-Up Timeline',
 'Getting married or attending a big event? Here is the exact timeline our providers recommend.',
 'Glow-Up Ideas', 'membership_conversion', '6 min read',
 'linear-gradient(135deg, #9333EA, #7C3AED)',
 'RELUXE Clinical Team',
 '[{"type":"p","text":"Whether you are the bride, a bridesmaid, or attending a milestone event, starting your skin prep early is the secret to looking genuinely radiant."},{"type":"h2","text":"6 Months Out: Foundation Work"},{"type":"p","text":"Book a Skin IQ consultation. Start Morpheus8, SkinPen, or chemical peel series. Begin medical-grade skincare."},{"type":"h2","text":"4 Months Out: Laser and Resurfacing"},{"type":"p","text":"IPL, ClearLift, or laser hair removal should be underway. Consider EvolveX for body contouring."},{"type":"h2","text":"2 Months Out: Injectables"},{"type":"p","text":"Ideal window for tox and filler. Starting 8 weeks out gives time for settling and adjustments."},{"type":"h2","text":"2 Weeks Out: Final Polish"},{"type":"p","text":"HydraFacial or Glo2Facial for deep hydration. Final tox touch-up if needed."},{"type":"h2","text":"Day Of"},{"type":"p","text":"Your skin should be in its best shape ever. Apply SPF and moisturizer, then hand it to your makeup artist."},{"type":"cta","text":"Book Your Glow-Up Consultation"}]'::jsonb,
 ARRAY['tox','filler','morpheus8','hydrafacial'], 'published', false, 25, now()),

('spf-myths-debunked',
 'SPF Myths Debunked: What Your Sunscreen Actually Does',
 'Chemical vs. mineral, SPF 30 vs. 50, reapplying — we clear up the biggest sunscreen myths.',
 'Skin Tips', 'brand_authority', '3 min read',
 'linear-gradient(135deg, #7C3AED, #C026D3)',
 'RELUXE Aesthetics Team',
 '[{"type":"p","text":"Sunscreen is the single most important anti-aging product you can use. Let us debunk the biggest myths."},{"type":"h2","text":"Myth: SPF 50 is twice as good as SPF 30"},{"type":"p","text":"SPF 30 blocks about 97% of UVB rays. SPF 50 blocks about 98%. The bigger factor is how often you reapply."},{"type":"h2","text":"Myth: You do not need sunscreen indoors"},{"type":"p","text":"UVA rays penetrate glass. If you sit near windows, you are getting UV exposure."},{"type":"h2","text":"Myth: Chemical sunscreens are dangerous"},{"type":"p","text":"Both chemical and mineral sunscreens are safe and effective. The best sunscreen is the one you will actually wear."},{"type":"h2","text":"Myth: You only need to apply once"},{"type":"p","text":"Reapply every 2 hours outdoors. For indoor days, a midday touch-up is sufficient."},{"type":"h2","text":"Our Recommendation"},{"type":"p","text":"Use broad-spectrum SPF 30-50 every morning, 365 days a year. Consistency beats perfection."},{"type":"cta","text":"Book a Skin Consultation"}]'::jsonb,
 ARRAY['skin-iq'], 'published', false, 26, now())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. SEED WIDGET ASSIGNMENTS
-- ============================================================

-- Helper: Use subqueries to reference article and widget IDs by slug.

-- #1 tox-maintenance-tracker: decay-chart, quiz-assessment, reminder-button
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'decay-chart-tox',
  '{"title":"How Tox Wears Off Over Time","treatment":"Botox / Dysport","peak_weeks":2,"duration_weeks":16,"retreatment_week":12,"labels":{"peak":"Peak Effect","fade":"Fading","gone":"Baseline"}}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='tox-maintenance-tracker' AND w.slug='decay-chart';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'quiz-tox-schedule',
  '{"title":"What Is Your Ideal Tox Schedule?","questions":[{"q":"How quickly do you notice movement returning?","options":["Before 8 weeks","Around 10-12 weeks","After 14 weeks"],"scores":[3,2,1]},{"q":"How strong are your facial muscles?","options":["Very strong (deep lines at rest)","Moderate","Mild (lines only when moving)"],"scores":[3,2,1]},{"q":"How active is your lifestyle?","options":["Very active (daily intense exercise)","Moderately active","Low activity"],"scores":[3,2,1]}],"results":[{"min":3,"max":4,"title":"Every 16 Weeks","text":"Your tox lasts well. A 16-week cycle keeps you maintained."},{"min":5,"max":7,"title":"Every 12 Weeks","text":"The sweet spot for most patients. Rebook at 12 weeks for best results."},{"min":8,"max":9,"title":"Every 10 Weeks","text":"You metabolize tox quickly. A 10-week cycle prevents full fade."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='tox-maintenance-tracker' AND w.slug='quiz-assessment';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'reminder-tox',
  '{"title":"Set Your Next Tox Reminder","description":"We will send you a calendar reminder so you never miss your window.","days_from_now":84,"event_title":"Time to Rebook Tox at RELUXE"}'::jsonb, 3
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='tox-maintenance-tracker' AND w.slug='reminder-button';

-- #2 microneedling-collagen-countdown: progress-timeline, day-gallery
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'timeline-collagen',
  '{"title":"The 28-Day Collagen Cycle","steps":[{"day":"Day 1","title":"Inflammation Phase","text":"Micro-injuries trigger your immune response. Growth factors flood the area."},{"day":"Days 2-5","title":"Proliferation","text":"New collagen fibers begin forming. Skin may still be pink."},{"day":"Days 6-14","title":"Remodeling Begins","text":"New collagen organizes and strengthens. Texture starts improving."},{"day":"Days 15-28","title":"Maturation","text":"Collagen continues cross-linking and thickening. Full cycle complete — ready for next session."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='microneedling-collagen-countdown' AND w.slug='progress-timeline';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'gallery-microneedling',
  '{"title":"Microneedling Healing Day by Day","days":[{"day":0,"label":"Treatment Day","text":"Skin is red, similar to a sunburn. This is normal."},{"day":1,"label":"Day 1","text":"Redness and mild swelling. Skin feels warm and tight."},{"day":2,"label":"Day 2","text":"Redness fading. Some dryness and flaking may begin."},{"day":3,"label":"Day 3","text":"Most redness gone. Light flaking as skin renews."},{"day":5,"label":"Day 5","text":"Skin looks refreshed. New glow emerging."},{"day":7,"label":"Day 7","text":"Full recovery. Skin is smoother, brighter, and more even."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='microneedling-collagen-countdown' AND w.slug='day-gallery';

-- #3 365-day-hair-free-roadmap: cost-calculator, countdown-planner, checklist
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'calc-hair-removal',
  '{"title":"Laser vs. Waxing: Lifetime Cost","items":[{"label":"Monthly waxing (avg)","guest_price":75,"frequency":"monthly","years":10},{"label":"Shaving supplies (monthly)","guest_price":30,"frequency":"monthly","years":10},{"label":"Laser series (6-8 sessions)","guest_price":1800,"frequency":"once","member_price":1620}],"membership_discount":0.10,"summary_text":"Laser pays for itself within 2 years and saves thousands over a lifetime."}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='365-day-hair-free-roadmap' AND w.slug='cost-calculator';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'countdown-hair',
  '{"title":"Your Hair-Free Timeline","milestones":[{"weeks":0,"label":"Session 1","text":"First treatment. Shave the area 24 hours before."},{"weeks":6,"label":"Session 2","text":"You may notice patchier regrowth already."},{"weeks":12,"label":"Session 3","text":"Significant reduction in active follicles."},{"weeks":18,"label":"Session 4","text":"Most patients see 50-70% reduction."},{"weeks":24,"label":"Session 5","text":"Fine-tuning remaining follicles."},{"weeks":30,"label":"Session 6","text":"Near-complete reduction for most areas."},{"weeks":52,"label":"Annual Touch-Up","text":"One maintenance session per year if needed."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='365-day-hair-free-roadmap' AND w.slug='countdown-planner';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'checklist-laser-prep',
  '{"title":"Laser Hair Removal Prep Checklist","items":[{"text":"Shave the treatment area 24 hours before","checked":false,"type":"do"},{"text":"Avoid sun exposure for 2 weeks before treatment","checked":false,"type":"do"},{"text":"Stop self-tanner at least 1 week before","checked":false,"type":"do"},{"text":"Wear loose, comfortable clothing to your appointment","checked":false,"type":"do"},{"text":"Do NOT wax or pluck between sessions","checked":false,"type":"dont"},{"text":"Do NOT apply lotions or deodorant to the area day-of","checked":false,"type":"dont"},{"text":"Avoid hot tubs and saunas for 24 hours after","checked":false,"type":"dont"}]}'::jsonb, 3
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='365-day-hair-free-roadmap' AND w.slug='checklist';

-- #4 chemical-peels-winter-reset: treatment-picker, checklist
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'picker-peels',
  '{"title":"Which Peel Is Right for You?","options":[{"label":"Dull, uneven tone","title":"Light Peel","text":"A gentle AHA/BHA peel that brightens and evens skin tone with zero downtime. Perfect for beginners.","cta_href":"/services/peels"},{"label":"Acne or congestion","title":"Clarifying Peel","text":"Salicylic acid-based peel that penetrates pores, reduces breakouts, and smooths texture. 1-2 days of mild flaking.","cta_href":"/services/peels"},{"label":"Sun damage or dark spots","title":"Pigment Peel","text":"Targets melanin deposits with TCA or Jessner solution. Visible peeling for 3-5 days, dramatic brightening after.","cta_href":"/services/peels"},{"label":"Fine lines or texture","title":"Resurfacing Peel","text":"Deeper peel that stimulates significant collagen remodeling. 5-7 days of peeling. Best results in a winter series.","cta_href":"/services/peels"}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='chemical-peels-winter-reset' AND w.slug='treatment-picker';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'checklist-peel-care',
  '{"title":"Peel Prep and Aftercare","items":[{"text":"Discontinue retinol 3-5 days before your peel","checked":false,"type":"do"},{"text":"Apply SPF 30+ daily for 2 weeks before and after","checked":false,"type":"do"},{"text":"Use a gentle, hydrating cleanser during healing","checked":false,"type":"do"},{"text":"Let peeling skin shed naturally","checked":false,"type":"do"},{"text":"Do NOT pick or pull at peeling skin","checked":false,"type":"dont"},{"text":"Avoid direct sun exposure during healing","checked":false,"type":"dont"},{"text":"Do NOT use active acids until fully healed","checked":false,"type":"dont"}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='chemical-peels-winter-reset' AND w.slug='checklist';

-- #5 membership-blueprint: cost-calculator, price-toggle
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'calc-membership',
  '{"title":"Membership Savings Calculator","items":[{"label":"Tox (20 units/session, 4x/year)","guest_price":280,"member_price":200,"frequency":"quarterly"},{"label":"Glo2Facial (monthly)","guest_price":185,"member_price":0,"frequency":"monthly","note":"Included in $200 voucher"},{"label":"1 Syringe Filler (annual)","guest_price":650,"member_price":600,"frequency":"annual","note":"$50 member discount"},{"label":"Skincare Products (annual)","guest_price":600,"member_price":510,"frequency":"annual","note":"15% member discount"}],"membership_cost_monthly":200,"summary_text":"See how your annual savings add up as a VIP member."}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='membership-blueprint' AND w.slug='cost-calculator';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'price-membership',
  '{"title":"Member vs Guest Pricing","services":[{"name":"20 Units Tox","guest_price":280,"member_price":200},{"name":"Glo2Facial","guest_price":185,"member_price":0,"note":"$200 voucher"},{"name":"HydraFacial","guest_price":175,"member_price":0,"note":"$200 voucher"},{"name":"60-Min Massage","guest_price":110,"member_price":0,"note":"$100 voucher"},{"name":"Filler (per syringe)","guest_price":650,"member_price":600},{"name":"Skincare Product ($80 value)","guest_price":80,"member_price":68}],"member_label":"VIP Member","guest_label":"Guest"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='membership-blueprint' AND w.slug='price-toggle';

-- #6 event-ready-countdown: countdown-planner, progress-timeline
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'countdown-event',
  '{"title":"Your Event Countdown","milestones":[{"weeks":-24,"label":"6 Months Out","text":"Skin IQ consultation. Start treatment series (Morpheus8, SkinPen, peels). Begin medical-grade skincare."},{"weeks":-16,"label":"4 Months Out","text":"IPL or ClearLift for tone. Laser hair removal underway. Body contouring if desired."},{"weeks":-8,"label":"2 Months Out","text":"First round of tox and filler. Time to settle and adjust."},{"weeks":-4,"label":"1 Month Out","text":"Filler follow-up if needed. Lock in skincare routine."},{"weeks":-2,"label":"2 Weeks Out","text":"HydraFacial or Glo2Facial. Final tox touch-up. No new products."},{"weeks":-1,"label":"Event Week","text":"Hydrate aggressively. Sheet mask. No new anything. You are ready."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='event-ready-countdown' AND w.slug='countdown-planner';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'timeline-event',
  '{"title":"The 6-Month Breakdown","steps":[{"day":"Month 6","title":"Foundation","text":"Consultation, treatment plan, begin skincare and treatment series."},{"day":"Month 4","title":"Laser + Resurfacing","text":"IPL, ClearLift, laser hair removal, body treatments."},{"day":"Month 2","title":"Injectables","text":"Tox and filler — time to settle and fine-tune."},{"day":"Week 2","title":"Final Polish","text":"Glow facial, last tox touch-up, lock in routine."},{"day":"Day Of","title":"Event Ready","text":"SPF, moisturizer, and your most radiant skin ever."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='event-ready-countdown' AND w.slug='progress-timeline';

-- #7 medical-grade-vs-otc: comparison-table, cost-calculator
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'table-skincare',
  '{"title":"Medical-Grade vs. Drugstore Skincare","columns":["Feature","Medical-Grade","Drugstore"],"rows":[["Active concentration","10-20% (clinical strength)","2-5% (cosmetic grade)"],["Delivery system","Advanced (liposomal, encapsulated)","Basic (surface-level)"],["Clinical testing","Peer-reviewed studies","Marketing claims"],["Stability","Airless pumps, stable formulas","May oxidize quickly after opening"],["Results timeline","Visible in 4-6 weeks","Minimal change, if any"],["Cost per month","$40-80","$15-30"],["Available at","Med spas, dermatologists","Drugstores, Amazon"]],"highlight_column":1}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='medical-grade-vs-otc' AND w.slug='comparison-table';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'calc-skincare',
  '{"title":"The Real Cost Comparison","items":[{"label":"Drugstore products you cycle through (annual)","guest_price":360,"frequency":"annual"},{"label":"Medical-grade routine (annual)","guest_price":720,"member_price":612,"frequency":"annual","note":"15% member discount"},{"label":"Treatments to fix OTC-neglected damage","guest_price":2400,"frequency":"once","note":"IPL + peels to reverse sun damage"}],"summary_text":"Medical-grade skincare costs more upfront but prevents expensive corrective treatments later."}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='medical-grade-vs-otc' AND w.slug='cost-calculator';

-- #8 tox-and-glow-duo: before-after-slider, price-toggle
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'slider-tox-glow',
  '{"before_label":"Before","after_label":"After Tox + Glo2Facial","before_image":"/images/inspiration/ba-tox-glow-before.jpg","after_image":"/images/inspiration/ba-tox-glow-after.jpg"}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='tox-and-glow-duo' AND w.slug='before-after-slider';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'price-tox-glow',
  '{"title":"Tox + Glo2Facial: Member vs Guest","services":[{"name":"20 Units Tox","guest_price":280,"member_price":200},{"name":"Glo2Facial","guest_price":185,"member_price":0,"note":"$200 voucher"},{"name":"Combined Visit","guest_price":465,"member_price":200,"note":"Use voucher + member tox pricing"}],"member_label":"VIP Member","guest_label":"Guest"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='tox-and-glow-duo' AND w.slug='price-toggle';

-- #9 neck-decollete-reveal: hotspot-diagram, before-after-slider
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'hotspot-neck',
  '{"title":"Treatment Zones: Neck and Chest","diagram_type":"neck","hotspots":[{"x":50,"y":20,"label":"Horizontal Neck Lines","text":"Microneedling + RF tightening. 2-3 sessions.","treatments":["morpheus8","skinpen"]},{"x":50,"y":45,"label":"Crepey Texture","text":"Morpheus8 RF microneedling rebuilds collagen. 2-3 sessions.","treatments":["morpheus8"]},{"x":50,"y":70,"label":"Sun Damage / Brown Spots","text":"IPL photofacial breaks up pigmentation. 2-4 sessions.","treatments":["ipl"]},{"x":50,"y":90,"label":"Overall Tone","text":"Chemical peels + Glo2Facial for brightening and resurfacing.","treatments":["peels","glo2facial"]}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='neck-decollete-reveal' AND w.slug='hotspot-diagram';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'slider-neck',
  '{"before_label":"Before","after_label":"After Treatment","before_image":"/images/inspiration/ba-neck-before.jpg","after_image":"/images/inspiration/ba-neck-after.jpg"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='neck-decollete-reveal' AND w.slug='before-after-slider';

-- #10 iv-therapy-aesthetics: comparison-table, quiz-assessment
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'table-iv',
  '{"title":"IV Therapy Options","columns":["Drip","Key Ingredients","Best For","Duration"],"rows":[["Hydration","Saline + electrolytes","Dehydrated skin, post-travel","30 min"],["Glow","Vitamin C + glutathione + biotin","Skin brightness, anti-aging","45 min"],["Recovery","B-complex + magnesium + zinc","Post-treatment healing","45 min"],["Immunity","High-dose vitamin C + zinc","Immune support, wellness","45 min"]]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='iv-therapy-aesthetics' AND w.slug='comparison-table';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'quiz-iv',
  '{"title":"Which IV Drip Matches Your Routine?","questions":[{"q":"What is your primary goal?","options":["Better skin quality","Faster treatment recovery","Overall wellness"],"scores":[1,2,3]},{"q":"How often do you get aesthetic treatments?","options":["Monthly","Every few months","Rarely"],"scores":[3,2,1]},{"q":"How is your energy level?","options":["Always tired","Up and down","Pretty good"],"scores":[3,2,1]}],"results":[{"min":3,"max":4,"title":"Hydration Drip","text":"Start with a basic hydration drip to replenish and glow."},{"min":5,"max":7,"title":"Glow Drip","text":"The Glow drip with vitamin C and glutathione pairs perfectly with your aesthetic routine."},{"min":8,"max":9,"title":"Recovery Drip","text":"The Recovery drip will support healing and maximize your treatment results."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='iv-therapy-aesthetics' AND w.slug='quiz-assessment';

-- #11 liquid-lift-vs-surgical: comparison-table, cost-calculator
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'table-lift',
  '{"title":"Liquid Lift vs. Surgical Facelift","columns":["Factor","Liquid Lift","Surgical Facelift"],"rows":[["Procedure time","30-60 minutes","4-6 hours"],["Anesthesia","Topical numbing","General anesthesia"],["Downtime","24-48 hours","2-4 weeks"],["Results visible","Immediately","After swelling resolves (4-8 weeks)"],["Duration","12-18 months","7-10+ years"],["Cost per session","$2,000-$5,000","$15,000-$30,000"],["Reversible","Yes (hyaluronidase)","No"],["Best for","Volume loss, early laxity","Significant laxity, excess skin"]],"highlight_column":1}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='liquid-lift-vs-surgical' AND w.slug='comparison-table';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'calc-lift',
  '{"title":"Cost Over Time","items":[{"label":"Liquid lift (maintenance every 15 months)","guest_price":3500,"frequency":"15months","years":10},{"label":"Surgical facelift (one-time)","guest_price":22000,"frequency":"once"}],"summary_text":"Compare total cost over 5 and 10 years to see which approach fits your budget and goals."}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='liquid-lift-vs-surgical' AND w.slug='cost-calculator';

-- #12 physics-of-filler: syringe-visualizer, hotspot-diagram
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'syringe-face',
  '{"title":"Filler Volume by Area","areas":[{"label":"Temples","volume":1.0,"description":"Restores hollowing, softens skeletal appearance"},{"label":"Cheeks","volume":2.0,"description":"Lifts midface, restores youthful contour"},{"label":"Nasolabial Folds","volume":1.0,"description":"Softens smile lines"},{"label":"Lips","volume":1.0,"description":"Adds volume, defines shape"},{"label":"Chin","volume":1.0,"description":"Projects chin, balances profile"},{"label":"Jawline","volume":2.0,"description":"Defines jaw, reduces jowling"}],"unit":"mL","total_label":"Full Face Balance"}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='physics-of-filler' AND w.slug='syringe-visualizer';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'hotspot-filler',
  '{"title":"Facial Injection Zones","diagram_type":"face","hotspots":[{"x":50,"y":15,"label":"Temples","text":"0.5-1mL per side. Restores volume lost with aging.","volume":"1-2mL total"},{"x":35,"y":35,"label":"Cheeks","text":"1-2mL per side. Foundation of facial balance.","volume":"2-4mL total"},{"x":50,"y":55,"label":"Nasolabial Folds","text":"0.5-1mL per side. Softens deep smile lines.","volume":"1-2mL total"},{"x":50,"y":70,"label":"Lips","text":"0.5-1mL. Subtle volume and definition.","volume":"0.5-1mL"},{"x":50,"y":80,"label":"Chin","text":"1-2mL. Projects and defines.","volume":"1-2mL"},{"x":25,"y":75,"label":"Jawline","text":"1-2mL per side. Contours and lifts.","volume":"2-4mL total"}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='physics-of-filler' AND w.slug='hotspot-diagram';

-- #13 laser-alphabet-soup: treatment-picker, comparison-table
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'picker-laser',
  '{"title":"What Is Your Primary Concern?","options":[{"label":"Sun damage or brown spots","title":"IPL Photofacial","text":"Broad-spectrum light targets pigment and vascular lesions. 2-4 sessions, minimal downtime.","cta_href":"/services/ipl"},{"label":"Fine lines or pore size","title":"ClearLift Laser","text":"Fractional laser beneath the skin surface. Zero downtime. 3-5 sessions for best results.","cta_href":"/services/clearlift"},{"label":"Skin tightening or scarring","title":"Morpheus8","text":"Microneedling + RF for deep collagen remodeling. 1-3 sessions, 2-4 days downtime.","cta_href":"/services/morpheus8"},{"label":"Redness or rosacea","title":"IPL + ClearLift Combo","text":"IPL to reduce redness, ClearLift to strengthen skin. Our most popular combination.","cta_href":"/services/ipl"}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='laser-alphabet-soup' AND w.slug='treatment-picker';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'table-laser',
  '{"title":"Laser and Energy Devices Compared","columns":["","IPL","ClearLift","Morpheus8"],"rows":[["Technology","Broad-spectrum light","Fractional Q-switched laser","RF microneedling"],["Best for","Pigment, redness, vessels","Fine lines, tone, pores","Tightening, texture, scars"],["Downtime","Minimal (spots darken 5-7 days)","Zero","2-4 days"],["Sessions needed","2-4","3-5","1-3"],["All skin tones?","Caution with darker tones","Yes","Yes"],["Pain level","Mild snapping","Minimal","Moderate (numbed)"]],"highlight_column":null}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='laser-alphabet-soup' AND w.slug='comparison-table';

-- #14 first-med-spa-visit: checklist, interest-save
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'checklist-first-visit',
  '{"title":"First Visit Checklist","items":[{"text":"Come with a clean face (no makeup if possible)","checked":false,"type":"do"},{"text":"Write down your top 2-3 skin concerns","checked":false,"type":"do"},{"text":"Know your budget range — we will work within it","checked":false,"type":"do"},{"text":"Bring a list of current skincare products","checked":false,"type":"do"},{"text":"Ask questions — there are no dumb ones","checked":false,"type":"do"},{"text":"Do NOT feel pressured to commit on the spot","checked":false,"type":"dont"},{"text":"Do NOT compare yourself to social media results","checked":false,"type":"dont"}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='first-med-spa-visit' AND w.slug='checklist';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'save-first-visit',
  '{"key":"interested_first_visit","label":"Save This Guide for Later"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='first-med-spa-visit' AND w.slug='interest-save';

-- #15 science-of-glo2facial: progress-timeline, before-after-slider
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'timeline-glo2',
  '{"title":"The Three Phases of Glo2Facial","steps":[{"day":"Phase 1","title":"Exfoliate","text":"OxyGeneo capsule exfoliates the outer skin layer, removing dead cells and preparing skin for absorption."},{"day":"Phase 2","title":"Oxygenate","text":"The Bohr Effect triggers natural oxygenation — CO2-rich environment causes your body to send oxygen-rich blood to the skin."},{"day":"Phase 3","title":"Infuse","text":"Active serums (vitamin C, peptides, hyaluronic acid) are driven deep into freshly exfoliated, oxygenated skin for maximum absorption."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='science-of-glo2facial' AND w.slug='progress-timeline';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'slider-glo2',
  '{"before_label":"Before","after_label":"After Glo2Facial","before_image":"/images/inspiration/ba-glo2-before.jpg","after_image":"/images/inspiration/ba-glo2-after.jpg"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='science-of-glo2facial' AND w.slug='before-after-slider';

-- #16 brotox-guide: quiz-assessment, before-after-slider
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'quiz-brotox',
  '{"title":"Is Tox Right for You?","questions":[{"q":"Do you have visible lines at rest (not just when moving)?","options":["Yes, noticeable lines","Starting to see some","No, only when I move"],"scores":[3,2,1]},{"q":"Does looking tired or angry bother you?","options":["Yes, people comment on it","Sometimes","Not really"],"scores":[3,2,1]},{"q":"How do you feel about maintenance appointments?","options":["Happy to come in every 3-4 months","Would prefer less often","Want a one-time fix"],"scores":[3,2,1]}],"results":[{"min":3,"max":4,"title":"Tox Might Not Be for You Yet","text":"Your lines are minimal. Consider starting with a great skincare routine and revisiting tox in a year or two."},{"min":5,"max":7,"title":"Great Candidate for Preventive Tox","text":"You are at the perfect stage to start. Preventive tox keeps lines from deepening."},{"min":8,"max":9,"title":"You Would See Dramatic Results","text":"Tox would make a noticeable difference. Book a consultation to see what 10-20 units can do."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='brotox-guide' AND w.slug='quiz-assessment';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'slider-brotox',
  '{"before_label":"Before","after_label":"After Tox","before_image":"/images/inspiration/ba-brotox-before.jpg","after_image":"/images/inspiration/ba-brotox-after.jpg"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='brotox-guide' AND w.slug='before-after-slider';

-- #17 sunscreen-insurance-policy: quiz-assessment, cost-calculator
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'quiz-spf',
  '{"title":"How Good Is Your SPF Game?","questions":[{"q":"How often do you apply sunscreen?","options":["Every morning, 365 days","Most days","Only when it is sunny"],"scores":[1,2,3]},{"q":"Do you reapply during the day?","options":["Yes, every 2 hours outdoors","Sometimes","Never"],"scores":[1,2,3]},{"q":"Do you wear SPF indoors near windows?","options":["Yes","Sometimes","No, why would I?"],"scores":[1,2,3]}],"results":[{"min":3,"max":4,"title":"SPF Pro","text":"You are doing it right. Your skin thanks you. Keep it up and make sure your formula is broad-spectrum."},{"min":5,"max":7,"title":"Room for Improvement","text":"You are on the right track but leaving gaps. Focus on daily consistency and midday touch-ups."},{"min":8,"max":9,"title":"UV Unprotected","text":"Your skin is getting significant unprotected UV exposure. Start with a formula you enjoy wearing and commit to every morning."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='sunscreen-insurance-policy' AND w.slug='quiz-assessment';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'calc-spf',
  '{"title":"Prevention vs. Repair Cost","items":[{"label":"Medical-grade SPF (annual)","guest_price":180,"member_price":153,"frequency":"annual","note":"15% member discount"},{"label":"IPL series for sun damage","guest_price":1200,"frequency":"once","note":"3 sessions to reverse years of damage"},{"label":"Chemical peel series for dark spots","guest_price":600,"frequency":"once"},{"label":"Daily anti-aging skincare to repair","guest_price":960,"frequency":"annual"}],"summary_text":"$180/year on SPF vs. $2,760+ to fix the damage later. Sunscreen is the cheapest anti-aging treatment available."}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='sunscreen-insurance-policy' AND w.slug='cost-calculator';

-- #18 sculptra-biostimulator: decay-chart, progress-timeline
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'decay-sculptra',
  '{"title":"Sculptra Results Over Time","treatment":"Sculptra","peak_weeks":26,"duration_weeks":130,"retreatment_week":104,"labels":{"peak":"Peak Collagen","fade":"Gradual Fade","gone":"Consider Retreatment"}}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='sculptra-biostimulator' AND w.slug='decay-chart';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'timeline-sculptra',
  '{"title":"The Collagen Building Phases","steps":[{"day":"Weeks 1-2","title":"Initial Response","text":"Mild swelling from the injection volume. This is not the final result — it is water that will absorb."},{"day":"Weeks 3-6","title":"The Valley","text":"Swelling resolves. You may feel like nothing happened. Be patient — collagen is building."},{"day":"Weeks 6-12","title":"Collagen Activation","text":"New collagen fibers form around the PLLA particles. Volume gradually returns."},{"day":"Months 3-6","title":"Full Results","text":"Collagen continues thickening. You look naturally refreshed — not filled."},{"day":"Year 2+","title":"Longevity","text":"Results can last 2+ years. Most patients return annually for a maintenance session."}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='sculptra-biostimulator' AND w.slug='progress-timeline';

-- #19 lip-filler-french-girl: syringe-visualizer, before-after-slider
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'syringe-lips',
  '{"title":"Lip Filler Volume Guide","areas":[{"label":"Subtle Enhancement","volume":0.5,"description":"Hydration boost, slight plump. The most conservative option."},{"label":"Natural Fullness","volume":0.75,"description":"The French-girl sweet spot. Defined shape, natural volume."},{"label":"Full Volume","volume":1.0,"description":"Noticeable but still balanced. Good for naturally thin lips."}],"unit":"mL"}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='lip-filler-french-girl' AND w.slug='syringe-visualizer';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'slider-lips',
  '{"before_label":"Before","after_label":"After 0.75mL","before_image":"/images/inspiration/ba-lips-before.jpg","after_image":"/images/inspiration/ba-lips-after.jpg"}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='lip-filler-french-girl' AND w.slug='before-after-slider';

-- #20 post-procedure-first-24-hours: day-gallery, checklist
INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'gallery-healing',
  '{"title":"Post-Treatment Healing Timeline","days":[{"day":0,"label":"Treatment Day","text":"Redness, warmth, mild swelling. This is your skin starting to heal."},{"day":1,"label":"Day 1","text":"Peak swelling. Skin feels tight. Avoid touching. Apply SPF if going out."},{"day":2,"label":"Day 2","text":"Swelling reducing. Redness fading to pink. Some dryness beginning."},{"day":3,"label":"Day 3","text":"Light flaking may start. Do not pick — let it shed naturally."},{"day":5,"label":"Day 5","text":"Most redness and flaking resolved. New skin visible underneath."},{"day":7,"label":"Day 7","text":"Full recovery for most treatments. Skin is smoother, brighter, more even."}]}'::jsonb, 1
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='post-procedure-first-24-hours' AND w.slug='day-gallery';

INSERT INTO inspiration_article_widgets (article_id, widget_id, placement_key, config, sort_order)
SELECT a.id, w.id, 'checklist-aftercare',
  '{"title":"Post-Procedure Aftercare by Treatment","items":[{"text":"TOX: Stay upright for 4 hours. No rubbing the injection sites.","checked":false,"type":"do"},{"text":"TOX: Avoid exercise, alcohol, and heat for 24 hours.","checked":false,"type":"do"},{"text":"FILLER: Apply ice 10 min on, 10 min off for swelling.","checked":false,"type":"do"},{"text":"FILLER: Sleep elevated the first night to reduce swelling.","checked":false,"type":"do"},{"text":"MICRONEEDLING: Apply provided healing balm. No makeup for 24 hours.","checked":false,"type":"do"},{"text":"MICRONEEDLING: Avoid sun, sweat, and swimming for 48 hours.","checked":false,"type":"do"},{"text":"PEELS: Use gentle cleanser only. No active ingredients until healed.","checked":false,"type":"do"},{"text":"ALL: Do NOT pick at peeling or flaking skin.","checked":false,"type":"dont"},{"text":"ALL: Do NOT use retinol or acids until provider clears you.","checked":false,"type":"dont"},{"text":"ALL: Apply SPF 30+ whenever going outdoors during healing.","checked":false,"type":"do"}]}'::jsonb, 2
FROM inspiration_articles a, inspiration_widgets w
WHERE a.slug='post-procedure-first-24-hours' AND w.slug='checklist';
