// src/data/services/dysport.js
import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('dysport'); // slug: 'dysport'

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

  // Pricing blocks (matrix is the real one; pricing kept for legacy layout if your renderer expects it)
  //pricing: 70,
  pricingMatrix: 32,

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

s.tagline = s.tagline || 'A fast-onset tox option with a soft, natural finish.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Onset', value: '2–5 days' },
  { iconKey: 'sparkles', label: 'Downtime', value: 'None' },
  { iconKey: 'fire', label: 'Duration', value: '3–4 months' },
  { iconKey: 'user', label: 'Best For', value: 'Forehead • 11s • Crow’s feet' },
];

s.benefits = [
  'Softens expression lines',
  'Fast onset for many patients',
  'Great for larger areas',
  'Natural-looking movement',
];

s.howItWorks = [
  { title: 'Consult & Map', body: 'We assess expressions and set a goal for movement.' },
  { title: 'Precise Dosing', body: 'Micro-injections for balanced brow, forehead, and eye area.' },
  { title: 'Review & Maintain', body: 'Follow-up plan based on your goals and events.' },
];

s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Brow lift effect'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};

s.appointmentSteps = [
  'Cleanse + map.',
  'Injections (10–20 min).',
  'No downtime; avoid workouts 24 hrs.',
  'Results start in ~2–5 days; peak by day 14.',
];

// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Dysport® is a trusted wrinkle relaxer that helps smooth dynamic lines caused by repeated expressions—like frown lines (“11s”), forehead lines, and crow’s feet. Many clients love Dysport for its soft, natural finish, and some notice results a bit sooner compared to other options.',
  p2: 'Your injector will map how your muscles move and tailor dosing to your goals (and your lifestyle). Dysport can be a great choice for larger treatment areas. We’ll walk you through what to expect as results settle, common short-lived effects (like tiny red spots), and the best cadence to keep your results looking fresh.'
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Dysport® & all complementary services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.seo = {
  title: 'Dysport® in Westfield & Carmel, IN | RELUXE Med Spa',
  description:
    'Dysport® (fast-onset tox option) for smooth, natural results by NP/RN injectors. Book in Westfield or Carmel. Honest dosing, follow-ups, and member pricing.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/dysport.png',
};

/**
 * Pricing Matrix — per-unit pricing + membership savings.
 * Renders in the <PricingMatrix> block.
 */
s.pricingMatrix = {
  subtitle: 'Per-unit pricing with member savings.',
  sections: [
    {
      title: 'DYSPORT®',
      membershipCallout: 'Members save on every visit',
      rows: [
        { label: 'Dysport®', single: '$4.50 / unit', membership: '$4.00 / unit' },
      ],
      ctaText: 'Book Dysport',
      // promo: 'Ask about event-ready timing & maintenance plans',
    },
  ],
};

// Existing lightweight "pricing" block removed (you asked to remove current pricing)
// s.pricing = { ... }  <-- intentionally removed

// ✅ Correct comparison content (no Daxxify copy)
s.comparison = {
  columns: ['Botox®', 'Dysport®', 'Jeuveau®', 'DAXXIFY®'],
  rows: [
    { label: 'Onset', options: [{ value: '3–7 days' }, { value: '2–5 days' }, { value: '2–5 days' }, { value: '2–4 days' }] },
    { label: 'Typical Duration', options: [{ value: '3–4 months' }, { value: '3–4 months' }, { value: '3–4 months' }, { value: '4–6 months (varies)' }] },
    { label: 'Spread', options: [{ value: 'Standard' }, { value: 'Slightly broader' }, { value: 'Standard' }, { value: 'Tight' }] },
    { label: 'Good For', options: [{ value: 'Balanced control' }, { value: 'Larger areas' }, { value: 'Smooth aesthetic finish' }, { value: 'Longevity focus' }] },
  ],
};

// ✅ Correct FAQ (no Daxxify/Jeuveau unit language mistakes)
s.faq = [
  { q: 'What is Dysport®?', a: 'Dysport® is an FDA-approved wrinkle relaxer designed to smooth dynamic wrinkles (caused by muscle movement) such as frown lines, forehead lines, and crow’s feet.' },
  { q: 'Why are Dysport® units cheaper than Botox® units?', a: 'Units are measured differently across brands. Dysport dosing typically uses more units than Botox for a similar treatment area, so the per-unit price is lower—but the total treatment cost is often comparable.' },
  { q: 'How is Dysport® different from Botox® or Jeuveau®?', a: 'They work in a similar way by relaxing muscle movement. Some people feel Dysport has a slightly faster onset and a softer “spread,” which can be helpful for larger areas.' },
  { q: 'Which should I choose: Dysport®, Jeuveau®, or Botox®?', a: 'All are great options. If you want a potentially faster onset or you’re treating larger areas, Dysport can be a great fit. Botox and Jeuveau are excellent if you like a classic, precise feel. We’ll match you to the best option for your goals.' },
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'Many people notice results in 2–5 days, with full results by about 2 weeks.' },
  { q: 'How long does it last?', a: 'Typically about 3–4 months, depending on dosing, metabolism, and treatment area.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2–3/10. Numbing is optional.' },
  { q: 'Is there any downtime?', a: 'No major downtime. Avoid exercise for 24 hours and avoid rubbing the area or lying flat for about 4 hours.' },
  { q: 'How much does it cost? How many units will I need?', a: 'Dysport is priced per unit. Unit needs vary based on your anatomy and goals. Our current pricing is shown above, including member savings.' },
  { q: 'Can I pair Dysport® with other treatments?', a: 'Absolutely—it pairs well with fillers, facials, and laser treatments for a more complete rejuvenation. Order can matter, so we’ll guide you.' },
  { q: 'Is Dysport® a filler?', a: 'No. Fillers add volume under the skin, while Dysport relaxes muscle movement to soften dynamic wrinkles. They treat different concerns.' },
];

s.flexEverything = {
  intro: 'Soft, balanced dosing with an easy-maintenance plan.',
  items: [
    { heading: 'Fast onset', body: 'Great if you want a quick refresh before an event.' },
    { heading: 'Feathered feel', body: 'A softer “spread” can be ideal for larger areas.' },
    { heading: 'Maintenance plan', body: 'Most people plan 3–4 months; we’ll personalize your cadence.' },
  ],
};

export default s;
