import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('jeuveau'); // slug: 'jeuveau', name preset

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

s.tagline = s.tagline || 'The modern tox with quick onset and smooth, natural results.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Onset', value: '2–4 days' },
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
  { title: 'Review & Maintain', body: 'Touch-ups at 2–3 weeks if desired.' },
];
s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Brow lift effect'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};
s.appointmentSteps = [
  'Cleanse + map.',
  'Micro-injections (10–20 min).',
  'No downtime; avoid workouts 24 hrs.',
  'Results in ~2–4 days; peak by 14.',
];
// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Jeuveau® is our most popular tox and truly made for aesthetics. It is great for softening frown lines, forehead lines, and crow’s feet while keeping your expressions natural. Treatments are quick (think: a few tiny pinches), and you can head right back to work or errands.',
  p2: 'We’ll personalize your plan to your features and budget, aiming for a smooth, rested look that still feels like you. Results start to show in a few days and typically last several months; we’ll set simple touch-up timelines so your results stay consistent.'
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Jeuveau & all our favorite services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.seo = {
  title: 'Jeuveau® (Newtox) in Westfield & Carmel, IN | RELUXE Med Spa',
  description:
    'Jeuveau® (Newtox) for smooth, natural results by NP/RN injectors. Book in Westfield or Carmel. Honest dosing, 2-week follow-ups, and member pricing.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/jeuveau.png',
};


s.pricing = {
  single: '$12/unit',
  packages: [{ label: 'Member Unit Price', value: '$10/unit' }],
};
s.comparison = {
  columns: ['Jeuveau®', 'Botox®', 'Dysport®'],
  rows: [
    { label: 'Onset', options: [{value:'2–4d'},{value:'3–7d'},{value:'2–4d'}] },
    { label: 'Duration', options: [{value:'3–4mo'},{value:'3–4mo'},{value:'3–4mo'}] },
    { label: 'Feel', options: [{value:'Silky'},{value:'Classic'},{value:'Feathered'}] },
  ],
};
s.faq = [
  { q: 'What is Jeuveau?', a: 'Jeuveau is an FDA-approved neurotoxin (like Botox) used to temporarily smooth fine lines and wrinkles by relaxing the underlying facial muscles.' },
  { q: 'How is Jeuveau different from Botox?', a: 'Both work the same way and deliver similar results, but Jeuveau is a newer formulation with a slightly different manufacturing process — some clients find it kicks in faster or feels “lighter.'},
  { q: 'Which should I choose: Jeuveau or Botox?', a: 'We love both! It depends on your preference, past experience, and how your body responds. We offer both so you can choose what works best for your goals. Many clients try each before deciding.'}, 
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'You’ll start to notice changes in 2-4 days, with full results in about 2 weeks' },
  { q: 'How long does it last?', a: 'Typically 3+ months, but it can vary for each person.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2-3/10.' },
  { q: 'Can I switch from another brand?', a: 'Yes—many switch easily based on onset and feel.' },
  { q: 'Is there any downtime?', a: 'No major downtime — you can return to normal activities right after, but avoid exercise for 24 hours and lying flat or rubbing the area for 4 hours.' },
  { q: 'How much does it cost? How many units will I need?', a: 'Jeuveau typically priced per unit. At RELUXE, we offer Jeuveau at $12/unit and membership pricing for $10/unit for predictable costs.' },
  { q: 'Why membership pricing?', a: 'Because it gives you the best results and the best value. We believe the right dose lasts longer, loyal clients deserve our best Jeuveau pricing, and pairing treatments with pro skincare delivers the most youthful, healthy skin — so our members save on every service, every product, every time.' },
  { q: 'Can I pair Jeuveau with other treatments?', a: 'Absolutely — it pairs beautifully with dermal fillers, facials, and laser treatments for a more complete rejuvenation. Order is important, so our team can help ensure you get the best result!' },
  { q: 'Why choose Jeuveau?', a: 'Jeuveau is our best selling tox for a reason! Patients love the quick onset, the long-lasting results, & the budget friendly price.' },
  { q: 'What is the difference between Jeuveau & Juvederm?', a: 'No — Juvederm is a filler that adds volume under the skin, while Jeuveau is a neurotoxin that reduces muscle movement to smooth wrinkles. They treat different concerns.' },
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
