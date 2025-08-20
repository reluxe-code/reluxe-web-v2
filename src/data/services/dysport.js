// src/data/services/daxxify.js
import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('dysport'); // slug: 'jeuveau', name preset

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

s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  benefits: 30,
  beforeAfter: 35,
  howItWorks: 45,
  candidates: 55,
  process: 65,
  pricing: 70,
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

s.tagline = s.tagline || 'A modern tox with quick onset and smooth, natural results.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Onset', value: '2–4 days' },
  { iconKey: 'sparkles', label: 'Downtime', value: 'None' },
  { iconKey: 'fire', label: 'Duration', value: '3-4 Months on average' },
  { iconKey: 'user', label: 'Best For', value: 'Forehead • 11s • Crow’s feet' },
];
s.benefits = [
  'Fast-acting smoothing',
  'Soft, natural movement',
  'Great for first-timers',
  'Long lasting results',
];
s.howItWorks = [
  { title: 'Consult & Map', body: 'We assess expressions and set a goal for movement.' },
  { title: 'Precise Dosing', body: 'Micro-injections for balanced brow and eye area.' },
  { title: 'Review & Maintain', body: 'Touch-ups at 2 weeks if desired.' },
];
s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Brow lift effect'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};
s.appointmentSteps = [
  'Cleanse + map.',
  'Injections (20 min).',
  'No downtime; avoid workouts 24 hrs.',
  'Results in 2-4 days; peak by 14.',
];
// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Dysport® is a trusted wrinkle relaxer that helps smooth dynamic lines caused by repeated expressions. It’s known for a soft, natural finish and may kick in a bit sooner for some people, often within a couple of days with little to no downtime.',
  p2: 'Your injector will map how your muscles move and choose dosing that fits your face (and lifestyle), especially helpful for larger areas like the forehead or “11s.” We’ll review what to expect as results settle, common short-lived effects (like tiny red spots), and how to keep your results looking fresh over time.'
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Dysport & all complementary services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.seo = {
  title: 'Dysport® in Westfield & Carmel, IN | RELUXE Med Spa',
  description:
    'Dysport® (fast-onset tox) for smooth, natural results by NP/RN injectors. Book in Westfield or Carmel. Honest dosing, 2-week follow-ups, and member pricing.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/dysport.png',
};

s.pricing = {
  single: '$4.50/unit',
  packages: [{ label: 'Member Unit Price', value: '$4/unit' }],
};
s.comparison = {
  columns: ['Daxxify', 'Jeuveau®', 'Botox®', 'Dysport®'],
  rows: [
    { label: 'Onset', options: [{value:'~2d'},{value:'2–4d'},{value:'3–7d'},{value:'2–4d'}] },
    { label: 'Duration', options: [{value:'6 weeks longer'},{value:'3–4mo'},{value:'3–4mo'},{value:'3–4mo'}] },
    { label: 'Feel', options: [{value:'Silky'},{value:'Silky'},{value:'Classic'},{value:'Feathered'}] },
  ],
};
s.faq = [
  { q: 'What is Dysport?', a: 'Daxxify is an FDA-approved neurotoxin designed to smooth dynamic wrinkles (caused by muscle movement) such as frown lines, forehead lines, and crow’s feet.' },
  { q: 'Why are Dysport units so much cheaper than Botox?', a: 'Dysport units are cheaper because they’re measured differently — it takes about 2.5–3 units of Dysport to equal 1 unit of Botox. The cost per treatment area ends up being similar.'},
  { q: 'How is Dysport different from Botox or Jeuveau?', a: 'Daxxify works the same way but is formulated to last longer — in some patients, results last 6 weeks longer compared to the typical 3–4 months for Botox or Jeuveau.'},
  { q: 'Which should I choose: Dysport or Jeuveau or Botox?', a: 'We love all! If you prefer fewer appointments and potentially longer-lasting results, Daxxify may be your choice. Botox and Jeuveau are great if you like the flexibility to adjust your look more often.'}, 
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'You’ll start to notice changes in 1-2 days, with full results in about 2 weeks. One of the benefits of Daxxify is the fast onset!' },
  { q: 'How long does it last?', a: 'Daxxify was designed as a long-lasting tox, so typically patients see 6+ weeks longer results than other tox options.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2-3/10.' },
  { q: 'Can I switch from another brand?', a: 'Yes—many switch easily based on onset and feel.' },
  { q: 'Is there any downtime?', a: 'No major downtime — you can return to normal activities right after, but avoid exercise for 24 hours and lying flat or rubbing the area for 4 hours.' },
  { q: 'How much does it cost? How many units will I need?', a: 'Daxxify is priced per unit. As a general rule of thumb, you will need 2x your typical Botox or Jeauveau dose (and the price reflect this). At RELUXE, we offer Daxxify at $7/unit and membership pricing for $5/unit for predictable costs.' },
  { q: 'Why membership pricing?', a: 'Because it gives you the best results and the best value. We believe the right dose lasts longer, loyal clients deserve our best Daxxify pricing, and pairing treatments with pro skincare delivers the most youthful, healthy skin — so our members save on every service, every product, every time.' },
  { q: 'Can I pair Dysport with other treatments?', a: 'Absolutely — it pairs beautifully with dermal fillers, facials, and laser treatments for a more complete rejuvenation. Order is important, so our team can help ensure you get the best result!' },
  { q: 'Is Dysport a filler?', a: 'No — Filler that adds volume under the skin, while Daxxify is a neurotoxin that reduces muscle movement to smooth wrinkles. They treat different concerns.' },
];
s.flexEverything = {
  intro: 'Dialed-in dosing with a smooth, modern feel.',
  items: [
    { heading: 'Fast onset', body: 'Great if you want a quick refresh before an event.' },
    { heading: 'Balanced brow', body: 'We keep the brow lifted without a heavy look.' },
    { heading: 'Maintenance plan', body: 'Plan 3–4 months; we can adjust over time.' },
  ],
};

export default s;

