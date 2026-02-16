// src/data/services/daxxify.js
import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('daxxify'); // slug: 'daxxify'

// 🔧 Visual variants tuned for injectables overview
s.variants = {
  hero: 'classic',
  quickFacts: 'pills',
  benefits: 'classic',
  beforeAfter: 'compare',
  howItWorks: 'steps',
  candidates: 'badges',
  process: 'checklist',
  pricing: 'tiers',
  comparison: 'cards',
  video: 'cine',
  faq: 'top5',
  providers: 'cards',
  related: 'scroll',
  prepAftercare: 'cards',
  flexEverything: 'tips',
};

// 🧭 Priorities for decision clarity
// ✅ pricingMatrix BEFORE pricing
s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  benefits: 30,
  beforeAfter: 35,
  howItWorks: 45,
  candidates: 55,
  process: 65,
  pricingMatrix: 32, // ✅ NEW primary pricing block
  //pricing: 71,       // ✅ legacy (we’ll zero it out below to avoid duplicates)
  comparison: 75,
  faq: 85,
  testimonials: 95,
  providerSpotlight: 110,
  relatedServices: 120,
  flexEverything: 130,
  prepAftercare: 140,
  lasers: 999,
  bookingEmbed: 150,
};

s.tagline = s.tagline || 'A longer-lasting tox option for smoother lines with natural movement.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Onset', value: '2–4 days' },
  { iconKey: 'sparkles', label: 'Downtime', value: 'None' },
  { iconKey: 'fire', label: 'Duration', value: 'May last longer for some' },
  { iconKey: 'user', label: 'Best For', value: 'Forehead • 11s • Crow’s feet' },
];

s.benefits = [
  'Smooths expression lines',
  'Natural-looking movement',
  'Fast onset for many patients',
  'Potentially longer-lasting results',
];

s.howItWorks = [
  { title: 'Consult & Map', body: 'We assess expressions, anatomy, and set a goal for movement.' },
  { title: 'Precise Dosing', body: 'Targeted micro-injections for balanced brow and eye area.' },
  { title: 'Review & Maintain', body: 'Follow-up and maintenance plan based on your goals.' },
];

s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Brow lift effect'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};

s.appointmentSteps = [
  'Cleanse + map.',
  'Injections (10–20 min).',
  'No downtime; avoid workouts 24 hrs.',
  'Results start in ~2–4 days; peak by day 14.',
];

// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'DAXXIFY® is a next-gen wrinkle relaxer that softens frown lines and other expression lines with tiny, precise injections. It helps relax the muscles that create creases so skin looks smoother—without a “frozen” look when done well. Most people notice a refreshed look within a few days, with little to no downtime.',
  p2: 'During your visit, we map your unique expressions and tailor dosing to your goals and schedule. Many clients choose DAXXIFY® because it may last longer than traditional options for some people—meaning fewer appointments over the year. We’ll talk through what that could mean for you, what’s normal right after treatment (mild redness or small bumps for a few minutes), and an easy plan for maintenance.'
};

s.seo = {
  title: 'DAXXIFY® in Westfield & Carmel, IN | RELUXE Med Spa',
  description:
    'DAXXIFY® (peptide-powered, longer-lasting tox option) for smooth, natural results by NP/RN injectors. Book in Westfield or Carmel. Honest dosing, follow-ups & member value.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/daxxify.png',
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on DAXXIFY® & all our services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

/**
 * ✅ NEW: Pricing Matrix — consistent with tox.js
 * Requires the updated PricingMatrix renderer in: src/pages/services/[slug].js
 */
s.pricingMatrix = {
  subtitle: 'Per-unit pricing with member savings.',
  sections: [
    {
      title: 'DAXXIFY®',
      headers: { single: 'Standard', member: 'Member' },
      membershipCallout: 'Members save on every visit',
      rows: [
        { label: 'DAXXIFY®', single: '$7 / unit', membership: '$5 / unit' },
      ],
      ctaText: 'Book DAXXIFY®',
    },
  ],
};

/**
 * ✅ IMPORTANT: avoid duplicate pricing blocks
 * PricingMatrix is the source of truth for this page.
 */
s.pricing = { single: '', packages: [] };

s.comparison = s.comparison || {
  columns: ['DAXXIFY®', 'Jeuveau®', 'Botox®', 'Dysport®'],
  rows: [
    { label: 'Onset', options: [{ value: '2–4 days' }, { value: '2–5 days' }, { value: '3–7 days' }, { value: '2–5 days' }] },
    { label: 'Typical Duration', options: [{ value: 'May last longer for some' }, { value: '3–4 months' }, { value: '3–4 months' }, { value: '3–4 months' }] },
    { label: 'Spread', options: [{ value: 'Tight' }, { value: 'Standard' }, { value: 'Standard' }, { value: 'Slightly broader' }] },
    { label: 'Good For', options: [{ value: 'Longevity focus' }, { value: 'Smooth aesthetic finish' }, { value: 'Balanced control' }, { value: 'Larger areas' }] },
  ],
};

s.faq = [
  { q: 'What is DAXXIFY®?', a: 'DAXXIFY® is an FDA-approved wrinkle relaxer designed to smooth dynamic wrinkles (caused by muscle movement) such as frown lines, forehead lines, and crow’s feet.' },
  { q: 'How is DAXXIFY® different from Botox® or Jeuveau®?', a: 'They work similarly by relaxing muscle movement. DAXXIFY® is designed to potentially last longer for some patients, which can mean fewer visits over the year.' },
  { q: 'Which should I choose: DAXXIFY®, Jeuveau®, or Botox®?', a: 'We love all. If you prefer fewer appointments and potentially longer-lasting results, DAXXIFY® may be a great fit. Botox® and Jeuveau® are great if you like more flexibility to adjust your look more often.' },
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'Most people start to notice changes in 2–4 days, with full results by about 2 weeks.' },
  { q: 'How long does it last?', a: 'Many people see results similar to other tox options (about 3–4 months). Some people may see longer-lasting results with DAXXIFY®.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2–3/10. Numbing is optional.' },
  { q: 'Can I switch from another brand?', a: 'Yes—many patients switch based on onset, feel, pricing, or how long it lasts for them.' },
  { q: 'Is there any downtime?', a: 'No major downtime. Avoid exercise for 24 hours and avoid rubbing the area or lying flat for about 4 hours.' },
  { q: 'How much does it cost? How many units will I need?', a: 'DAXXIFY® is priced per unit. Unit needs vary based on your anatomy and goals. At RELUXE, DAXXIFY® is $7/unit, and members receive $5/unit.' },
  { q: 'Can I pair DAXXIFY® with other treatments?', a: 'Absolutely—it pairs well with fillers, facials, and laser treatments for a more complete rejuvenation. Order can matter, so we’ll guide you.' },
  { q: 'Is DAXXIFY® a filler?', a: 'No. Fillers add volume under the skin, while DAXXIFY® relaxes muscle movement to soften dynamic wrinkles. They treat different concerns.' },
];

s.flexEverything = {
  intro: 'Dialed-in dosing with a smooth, modern feel.',
  items: [
    { heading: 'Fast onset', body: 'Great if you want a quick refresh before an event.' },
    { heading: 'Balanced brow', body: 'We keep the brow lifted without a heavy look.' },
    { heading: 'Micro-dosing around eyes', body: 'Softens crow’s feet while keeping smiles natural.' },
    { heading: 'Maintenance plan', body: 'We’ll help you find your ideal cadence and adjust over time.' },
  ],
};

export default s;
