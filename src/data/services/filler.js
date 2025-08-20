import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('filler'); // slug: 'filler'

s.variants = {
  hero: 'collage',
  quickFacts: 'pills',
  benefits: 'classic',
  beforeAfter: 'masonry',
  howItWorks: 'steps',
  candidates: 'columns',
  process: 'timeline',
  pricing: 'tiers',
  comparison: 'cards',    // optional; can compare RHA vs Juvéderm etc if you add data
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
  beforeAfter: 35,     // ↑ strong visual proof
  howItWorks: 45,
  candidates: 55,
  process: 65,
  pricing: 75,
  faq: 90,
  testimonials: 95,
  providerSpotlight: 110,
  relatedServices: 120,
  flexEverything: 130,
  prepAftercare: 140,
  lasers: 999,
  bookingEmbed: 150,
};

s.tagline = s.tagline || 'Restore volume, refine contours, and hydrate—beautifully.';
s.quickFacts = s.quickFacts?.length ? s.quickFacts : [
  { iconKey: 'clock', label: 'Treatment Time', value: '30–45 min' },
  { iconKey: 'sparkles', label: 'Downtime', value: 'Minimal' },
  { iconKey: 'user', label: 'Areas', value: 'Lips • Cheeks • Chin • Jaw' },
  { iconKey: 'fire', label: 'Duration', value: '6–18 months' },
];
s.benefits = [
  'Balances facial proportions',
  'Natural, soft feel',
  'Immediate results',
  'Custom plan per feature',
];
s.howItWorks = [
  { title: 'Design & Marking', body: 'We map vectors based on your features and goals.' },
  { title: 'Micro-cannula Techniques', body: 'Comfort-forward approach minimizes bruising.' },
  { title: 'Refinement & Aftercare', body: 'We shape and settle, then guide your aftercare.' },
];
s.candidates = {
  good: ['Lip shaping', 'Cheek lift', 'Jawline definition', 'Chin projection', 'Smile lines'],
  notIdeal: ['Active infection', 'Recent dental work (within 2 weeks)—reschedule', 'Pregnant/nursing'],
};
s.resultsGallery = [
  {
    src: '/images/results/filler/injector.hannah - 1.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/filler/injector.hannah - 4.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/filler/alexis - 01.jpeg',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/filler/injector.hannah - 7.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/filler/injector.hannah - 16.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/filler/injector.hannah - 22.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
];
s.appointmentSteps = [
  'Photos (for symmetry planning).',
  'Topical numbing (optional).',
  'Precise placement with needle or cannula.',
  'Mild swelling 24–72 hrs; final look ~2 weeks.',
];
s.pricing = {
  single: '$650/syringe',
  packages: [
    { label: '2-Syringe Plan', value: '$1,200 (save $100)' },
    { label: '3-Syringe Balancing', value: '$1,750 (save $200)' },
  ],
};
s.faq = [
  { q: 'Will it look natural?', a: 'Yes—our goal is balance and harmony, not “done”.' },
  { q: 'How long does swelling last?', a: 'Usually 24–72 hours; lips may swell a bit longer.' },
  { q: 'Can it be dissolved?', a: 'Yes, HA fillers can be reversed with hyaluronidase.' },
  { q: 'How many syringes do I need?', a: 'Depends on area and goals; we’ll design a plan together.' },
  { q: 'When can I exercise?', a: 'Wait 24 hours to minimize swelling and bruising.' },
];
// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Fillers are a quick, non-surgical way to smooth lines, restore volume, and enhance features like lips, cheeks, and jawline all while still looking like you. Most are made with hyaluronic acid (a substance your skin loves), results are visible right away, and there’s little to no downtime.',
  p2: 'At your visit, we’ll chat about your goals and design a natural, balanced plan that fits your features and budget. Our nurse injectors prioritizes comfort and safety, then shares simple aftercare so your results settle beautifully over the next few days.',
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Safety-first care from an anatomy-focused Nurse Practitioner and trained injectors, with personalized treatment plans for your features and goals.' },
  { title: 'Natural results & education', body: 'Face-mapping consults, honest guidance on product choices and cost, and a “you, just refreshed” approach—never overfilled.' },
  { title: 'The RELUXE Difference', body: 'Comfort-first experience (numbing + vibration), photo-guided plans with 2-week check-ins, clear pricing with flexible pay (Cherry), and two convenient locations.' },
];
s.flexEverything = {
  intro: 'We prioritize facial balance and long-term skin health.',
  items: [
    { heading: 'Layered technique', body: 'Deep support + superficial detail for natural structure.' },
    { heading: 'Product selection', body: 'RHA for movement, Juvéderm for structure, Restylane for versatility.' },
    { heading: 'Longevity plan', body: 'Strategic touch-ups to maintain shape without overfilling.' },
    { heading: 'Pair with tox', body: 'Softens dynamic lines around newly balanced features.' },
  ],
};

export default s;
