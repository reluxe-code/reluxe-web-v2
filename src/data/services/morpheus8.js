import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('morpheus8'); // slug: 'morpheus8', name: 'Morpheus8'

// Optionally add a hero video poster URL if you have one
// s.heroVideoUrl = 'https://www.youtube.com/embed/XXXXXXXX';

s.variants = {
  hero: 'split',          // use 'video' if you set heroVideoUrl
  quickFacts: 'pills',
  benefits: 'stickers',
  beforeAfter: 'masonry',
  howItWorks: 'steps',
  candidates: 'badges',
  process: 'timeline',
  pricing: 'tiers',
  comparison: 'table',    // optional if you add vs RF needling etc
  video: 'cine',
  faq: 'accordion',
  providers: 'featured',
  related: 'scroll',
  prepAftercare: 'timeline',
  flexEverything: 'tips',
  lasers: 'cards',
};

s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  benefits: 30,
  beforeAfter: 35,
  howItWorks: 45,
  candidates: 55,
  process: 65,
  pricing: 75,
  video: 80,
  faq: 90,
  providerSpotlight: 100,
  flexEverything: 110,
  lasers: 115,            // device credibility
  relatedServices: 120,
  prepAftercare: 130,
  bookingEmbed: 150,
};

s.heroImage = '/images/service/M8/1.png';
s.tagline = s.tagline || 'Tighten, smooth, and refine with RF microneedling.';
s.quickFacts = [
  { iconKey: 'clock', label: 'Treatment Time', value: '90 min with numbing' },
  { iconKey: 'sparkles', label: 'Downtime', value: '1–3 days' },
  { iconKey: 'user', label: 'Suggested Series', value: '3 sessions' },
  { iconKey: 'fire', label: 'Results', value: 'Peaks at ~12 weeks' },
  { iconKey: 'fire', label: 'Benefit', value: 'Firms laxity' },
  { iconKey: 'fire', label: 'Benefit', value: 'Improves acne scars' },
  { iconKey: 'fire', label: 'Benefit', value: 'Refines pores & texture' },
  { iconKey: 'fire', label: 'Benefit', value: 'Stimulates collagen' },
];
s.benefits = [
  'Firms laxity',
  'Improves acne scars',
  'Refines pores & texture',
  'Stimulates collagen',
];
s.howItWorks = [
  { title: 'Mapping & Numbing', body: 'Topical numbing for comfort; we map depths per zone.' },
  { title: 'Fractional RF Delivery', body: 'Energy delivered at precise depths to stimulate remodeling.' },
  { title: 'Recovery & Plan', body: 'Expect pinkness 1–3 days; results build over weeks.' },
];
s.candidates = {
  good: ['Texture & pores', 'Mild–moderate laxity', 'Acne scarring', 'Neck & jawline refinement'],
  notIdeal: ['Active acne flare', 'Open wounds', 'Recent isotretinoin—consult first'],
};
s.appointmentSteps = [
  'Topical numbing 30–45 min.',
  'RF microneedling pass by zones.',
  'Soothing post-care + SPF.',
  'Avoid makeup 24 hrs; gentle care for 3–5 days.',
];
s.pricing = {
  single: '$900/session',
  packages: [
    { label: 'Series of 3', value: '$2,400 (save $300)' },
    { label: 'Face + Neck', value: '$3,000 (series pricing)' },
  ],
};
s.lasers = [
  { machine: 'Morpheus8 RF Microneedling', whatItTreats: ['Texture', 'Laxity', 'Scars', 'Pores'], whyWeChoseIt: 'Depth control, consistent results, strong safety profile.' },
];

s.resultsGallery = [
  {
    src: '/images/results/m8/injector.hannah - 28.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/m8/injector.krista - 01.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
  {
    src: '/images/results/m8/injector.hannah - 29.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
];

s.faq = [
  { q: 'Does it hurt?', a: 'We numb thoroughly; most feel pressure/heat but tolerate well.' },
  { q: 'How many sessions?', a: 'A series of 3 is typical; deep scars may need more.' },
  { q: 'When will I see results?', a: 'Early glow in 1–2 weeks; firmness builds to ~12 weeks.' },
  { q: 'Safe for all skin types?', a: 'Generally yes; we adjust depth/energy for your skin.' },
];

s.flexEverything = {
  intro: 'Customization by depth and energy makes Morpheus8 versatile and effective.',
  items: [
    { heading: 'Zone-specific depths', body: 'Cheeks vs. jawline vs. neck—each tuned for safety & results.' },
    { heading: 'Scar protocols', body: 'Layered passes + spacing for remodeling without bulk heat.' },
    { heading: 'Downtime minimization', body: 'Cooling and barrier support speed recovery.' },
    { heading: 'Stacking strategy', body: 'Pair with tox or IPL after 2–4 weeks for synergy.' },
  ],
};

s.testimonials = [
  {
    author: "Jennifer S.",
    location: "Westfield, IN",
    service: "Morpheus8",
    rating: 5,
    text: "The whole visit was so easy—and I loved my results! Krista was incredibly gentle and explained everything step-by-step.",
    monthYear: "Feb 2025" // or use date: "2025-02"
  },
  {
    author: "Marcus L.",
    location: "Carmel, IN",
    service: "Morpheus8",
    rating: 5,
    text: "Natural look, no heaviness. Booking again before my next event.",
    date: "2025-01" // will render as "Jan 2025"
  },
  {
    author: "Priya A.",
    service: "Morpheus8",
    rating: 4,
    text: "Quick appointment and super friendly team. Subtle but noticeable improvement.",
    monthYear: "Dec 2024"
  },
  {
    author: "Priya A.",
    service: "Morpheus8",
    rating: 4,
    text: "Quick appointment and super friendly team. Subtle but noticeable improvement.",
    monthYear: "Dec 2024"
  },
  {
    author: "Priya A.",
    service: "Morpheus8",
    rating: 4,
    text: "Quick appointment and super friendly team. Subtle but noticeable improvement.",
    monthYear: "Dec 2024"
  },
];

// 👩‍⚕️ Providers (added: Krista & Hannah; ready for Alexis)
s.providers = [
  {
    name: 'Krista Spalding, NP',
    title: 'Nurse Practitioner Injector',
    headshotUrl: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-content/uploads/2025/08/krista.png',
    bio: 'Amazing results. Lots of successfult Morpheus8 success stories.',
    href: '/book/m8', // provider-specific link if available
    instagram: 'https://instagram.com/injector.krista',
    specialties: ['Morpheus8'],
  },
  {
    name: 'Hannah, RN',
    title: 'Nurse Injector',
    headshotUrl: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-content/uploads/2025/08/hannah.png',
    bio: 'Amazing results. Lots of successfult Morpheus8 success stories.',
    href: '/book/m8',
    instagram: 'https://instagram.com/injector.hannah',
    specialties: ['Morpheus8'],
  },
];

export default s;
