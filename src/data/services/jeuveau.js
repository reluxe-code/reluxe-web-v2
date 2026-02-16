// src/data/services/jeuveau.js
import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('jeuveau'); // slug: 'jeuveau'

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
s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  benefits: 30,
  beforeAfter: 35,
  howItWorks: 45,
  candidates: 55,
  process: 65,

  // Pricing blocks (matrix is the real one)
  pricing: 70,
  pricingMatrix: 71,

  comparison: 75,   // highlight why Jeuveau
  faq: 85,
  testimonials: 95,
  providerSpotlight: 110,
  relatedServices: 120,
  flexEverything: 130,
  prepAftercare: 140,
  lasers: 999,
  bookingEmbed: 150,
};

s.tagline = s.tagline || 'The modern tox with quick onset and smooth, natural results.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Onset', value: '2–5 days' },
  { iconKey: 'sparkles', label: 'Downtime', value: 'None' },
  { iconKey: 'fire', label: 'Duration', value: '3–4 months' },
  { iconKey: 'user', label: 'Best For', value: 'Forehead • 11s • Crow’s feet' },
];

s.benefits = [
  'Fast-acting smoothing',
  'Soft, natural movement',
  'Great for first-timers',
  'Pairs well with lip flip',
];

s.howItWorks = [
  { title: 'Consult & Map', body: 'We assess expressions and set a goal for movement.' },
  { title: 'Precise Dosing', body: 'Micro-injections for balanced brow and eye area.' },
  { title: 'Review & Maintain', body: 'Follow-up plan based on your goals and schedule.' },
];

s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Brow lift effect', 'Lip flip'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};

s.appointmentSteps = [
  'Cleanse + map.',
  'Micro-injections (10–20 min).',
  'No downtime; avoid workouts 24 hrs.',
  'Results start in ~2–5 days; peak by day 14.',
];

// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Jeuveau® is our RELUXE favorite—and it was truly created for aesthetics. It’s great for softening frown lines, forehead lines, and crow’s feet while keeping your expressions natural. Treatments are quick (a few tiny pinches), with little to no downtime, so you can head right back to work or errands.',
  p2: 'We personalize your plan to your facial movement, goals, and budget to create a smooth, rested look that still feels like you. Results start to show in a few days and typically last 3–4 months. We’ll leave you with a simple maintenance plan so your results stay consistent.'
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Jeuveau® & all our favorite services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.seo = {
  title: 'Jeuveau® in Westfield & Carmel, IN - Our Best Value Neurotoxin | RELUXE Med Spa',
  description:
    'Jeuveau® (Newtox) for smooth, natural results by NP/RN injectors. Book in Westfield or Carmel. Honest dosing, follow-ups, and member pricing.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/jeuveau.png',
};

/**
 * Pricing Matrix — per-unit pricing + membership savings.
 * Renders in the <PricingMatrix> block.
 */
s.pricingMatrix = {
  subtitle: 'Per-unit pricing with member savings.',
  sections: [
    {
      title: 'JEUVEAU®',
      membershipCallout: 'Members save on every visit',
      rows: [
        { label: 'Jeuveau®', single: '$12 / unit', membership: '$9.50 / unit' },
      ],
      ctaText: 'Book Jeuveau',
      // promo: 'Ask about lip flip + full-face balancing options',
    },
  ],
};

// Removed old pricing block (you asked to remove current pricing)
// s.pricing = { ... } <-- intentionally removed

s.comparison = {
  columns: ['Jeuveau®', 'Botox®', 'Dysport®', 'DAXXIFY®'],
  rows: [
    { label: 'Onset', options: [{ value: '2–5 days' }, { value: '3–7 days' }, { value: '2–5 days' }, { value: '2–4 days' }] },
    { label: 'Typical Duration', options: [{ value: '3–4 months' }, { value: '3–4 months' }, { value: '3–4 months' }, { value: '4–6 months (varies)' }] },
    { label: 'Feel', options: [{ value: 'Silky' }, { value: 'Classic' }, { value: 'Feathered' }, { value: 'Tight' }] },
  ],
};

s.faq = [
  { q: 'What is Jeuveau®?', a: 'Jeuveau® is an FDA-approved neurotoxin (like Botox®) used to temporarily smooth expression lines by relaxing the underlying facial muscles.' },
  { q: 'How is Jeuveau® different from Botox®?', a: 'They work the same way and can deliver very similar results. Jeuveau® is a newer option created specifically for aesthetic use, and some clients feel it kicks in a bit faster or feels “lighter.”' },
  { q: 'Which should I choose: Jeuveau® or Botox®?', a: 'Both are great. If you want a modern aesthetic finish and potentially quicker onset, Jeuveau® is a favorite. Botox® is the classic, ultra-reliable choice. We’ll help you pick based on your goals and how you respond.' },
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'Most people notice changes in 2–5 days, with full results by about 2 weeks.' },
  { q: 'How long does it last?', a: 'Typically 3–4 months, but it can vary based on dosing, metabolism, and treatment area.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2–3/10. Numbing is optional.' },
  { q: 'Is there any downtime?', a: 'No major downtime. Avoid exercise for 24 hours and avoid rubbing the area or lying flat for about 4 hours.' },
  { q: 'How much does it cost? How many units will I need?', a: 'Jeuveau® is priced per unit. Units vary by your anatomy and goals. Our current pricing is shown above, including member savings.' },
  { q: 'Can I switch from another brand?', a: 'Yes—many patients switch easily based on onset, feel, and pricing. We’ll guide you.' },
  { q: 'Can I pair Jeuveau® with other treatments?', a: 'Absolutely—it pairs beautifully with dermal fillers, facials, and laser treatments for a more complete rejuvenation. Order can matter, so we’ll guide you.' },
  { q: 'Why do patients love Jeuveau® at RELUXE?', a: 'It’s our best-selling tox for a reason: patients love the quick onset, smooth aesthetic finish, and great value.' },
  { q: 'Is Jeuveau® the same as JUVÉDERM®?', a: 'No—JUVÉDERM® is a dermal filler that adds volume, while Jeuveau® is a neurotoxin that relaxes muscle movement to soften dynamic wrinkles.' },
];

s.flexEverything = {
  intro: 'Dialed-in dosing with a smooth, modern feel.',
  items: [
    { heading: 'Fast onset', body: 'Great if you want a quick refresh before an event.' },
    { heading: 'Balanced brow', body: 'We keep the brow lifted without a heavy look.' },
    { heading: 'Micro-dosing around eyes', body: 'Softens crow’s feet while keeping smiles natural.' },
    { heading: 'Maintenance plan', body: 'Plan 3–4 months; we can adjust over time.' },
  ],
};

export default s;
