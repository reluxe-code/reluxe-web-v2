// src/data/services/botox.js
import { getDefaultService } from '../servicesDefault';

const s = getDefaultService('botox'); // slug: 'tox'

// 🔧 Visual variants tuned for injectables overview
s.variants = {
  hero: 'split',
  quickFacts: 'pills',
  benefits: 'compare',
  beforeAfter: 'compare',
  howItWorks: 'steps',
  candidates: 'badges',
  process: 'checklist',

  // ✅ Use pricingMatrix as the "clean visual pricing"
  pricing: 'tiers', // keep, but we'll make it minimal (or you can remove pricing entirely)
  comparison: 'cards',
  video: 'split',
  faq: 'top5',
  providers: 'featured',
  related: 'scroll',
  prepAftercare: 'cards',
  flexEverything: 'tips',
};

// 🧭 Priorities for decision clarity
s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  overviewWhy: 22,
  benefits: 25,
  comparison: 35,
  resultsGallery: 40,
  howItWorks: 50,
  testimonials: 55,
  candidates: 60,
  process: 65,

  // ✅ Put pricingMatrix BEFORE financing + FAQ
  pricingMatrix: 30,
  //pricing: 70,

  financing: 80,
  faq: 85,
  providerSpotlight: 110,
  relatedServices: 120,
  prepAftercare: 130,
  flexEverything: 140,
  lasers: 999,
  bookingEmbed: 150,
};

// ✨ Default content (safe to keep/grow)
s.heroImage = '/images/service/tox/1.png';
s.images = {
  primaryCallout: '/images/service/tox/2.png',
  secondaryCallout: '/images/service/default/3.png',
  testimonialBg: '/images/service/default/4.png',
  ctaBanner: '/images/service/tox/5.png',
  stepByStep: '/images/service/tox/6.png',
  deviceShot: '/images/service/default/7.png',
  techniqueShot: '/images/service/default/8.png',
  benefitHighlight: '/images/service/default/9.png',
  financingVisual: '/images/service/default/10.png',
  packageVisual: '/images/service/default/11.png',
  beforeAfterBg: '/images/service/default/12.png',
};

s.resultsGallery = [
  { src: '/images/results/tox/01.png', alt: 'Forehead lines before/after – smoother after 2 weeks' },
];

s.tagline = s.tagline || 'Smoother lines, natural movement—done right.';

s.quickFacts = s.quickFacts?.length
  ? s.quickFacts
  : [
      { iconKey: 'clock', label: 'Treatment Time', value: '30 min' },
      { iconKey: 'sparkles', label: 'Downtime', value: 'None' },
      { iconKey: 'user', label: 'Results Seen', value: '7-14 days' },
      { iconKey: 'fire', label: 'Duration', value: '3+ months' },
    ];

s.benefits = [
  'Softens expression lines',
  'Prevents new wrinkles',
  'Quick, no downtime',
  'Natural-looking results',
  'Our most popular treatment',
];

s.howItWorks = [
  { title: 'Consult & Map', body: 'We assess movement, anatomy, and goals.' },
  { title: 'Perfect Dosing', body: 'Targeted dosing for balanced results.' },
  { title: 'Review & Plan', body: 'Follow-up for refinement if needed.' },
];

s.candidates = {
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow\'s feet', 'Bunny lines', 'Lip flip'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};

s.overview = {
  p1: 'Botox® is a quick, no-downtime treatment that softens frown lines, forehead lines, and crow\'s feet so you look rested—not "frozen." Tiny injections relax the overactive muscles that create creases, with improvements appearing in a few days and full results at about two weeks. Most people describe it as a few small pinches, and then they\'re back to work, errands, or the gym.',
  p2: 'At RELUXE, your visit starts with a friendly, honest consult. We map your unique expressions, discuss goals and budget, and create a plan that keeps your features natural and balanced. You\'ll leave with simple aftercare tips and a clear timeline for follow-ups (typically every 3–4 months, depending on your muscles and metabolism).',
};

s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Botox & all complementary services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.appointmentSteps = [
  'Arrive makeup-free or we\'ll cleanse.',
  'Photos for tracking (optional).',
  'Treatment: 10–20 tiny pinches.',
  'Back to life—avoid workouts 24 hrs.',
];

s.seo = {
  title: 'Botox® in Westfield & Carmel, IN | RELUXE Med Spa',
  description:
    'Quick, no-downtime Botox® by NP/RN injectors for soft, natural results. Book in Westfield or Carmel. Honest dosing, follow-ups, and member pricing.',
  image: s.images?.ctaBanner || s.heroImage || '/images/seo/botox.png',
};

/**
 * ✅ NEW: Clean visual Botox pricing
 * Matches your 2026 framework:
 * - Foundation: 20 units for $280
 * - Additional (New): $9/unit
 * - Additional (Returning): $10/unit
 */
s.pricingMatrix = {
  subtitle: 'Start with a foundation treatment, then customize only if you need more.',
  sections: [
    {
      title: 'Botox® Pricing',
      note: 'Most people start with a foundation treatment (20 units) and adjust from there.',
      rows: [
        {
          label: 'Foundation Treatment',
          subLabel: '20 units',
          single: '$280',
          singleNote: 'Great for first-time patients and "maintenance" dosing.',
        },
        {
          label: 'Additional Units',
          subLabel: 'Customized after mapping your movement',
          single: 'New: $9/unit',
          package: 'Returning: $10/unit',
          packageNote: 'Returning patient pricing applies after your initial visit.',
        },
      ],
      promo: 'Not sure how many units you need? We\'ll map your expression and recommend the right plan.',
      ctaText: 'Book Botox',
    },
  ],
};

// Keep this minimal so the older "Pricing & Packages" section doesn't compete.
// (You can delete s.pricing entirely if you'd rather rely only on pricingMatrix.)
s.pricing = {
  single: 'Starting at $280',
  packages: [
    { label: 'Additional Units (New Patients)', value: '$9/unit' },
    { label: 'Additional Units (Returning Patients)', value: '$10/unit' },
  ],
};

s.comparison = {
  columns: ['Botox®', 'Dysport®', 'Jeuveau®', 'Daxxify®'],
  rows: [
    { label: 'Onset', options: [{ value: '3–7d' }, { value: '2–4d' }, { value: '2–4d' }, { value: '2–4d' }] },
    { label: 'Typical Duration', options: [{ value: '3–4mo' }, { value: '3–4mo' }, { value: '3–4mo' }, { value: '4–6mo*' }] },
    { label: 'Spread', options: [{ value: 'Standard' }, { value: 'Slightly broader' }, { value: 'Standard' }, { value: 'Tight' }] },
    { label: 'Good For', options: [{ value: 'Balanced control' }, { value: 'Larger areas' }, { value: 'Fast onset' }, { value: 'Longevity focus' }] },
  ],
};

s.faq = [
  { q: 'What is Botox and how does it work?', a: 'Botox is an FDA-approved injectable made from botulinum toxin that temporarily relaxes targeted facial muscles to smooth existing wrinkles and prevent new ones. It works by blocking nerve signals to specific muscles, reducing the contractions that cause forehead lines, frown lines, and crow\'s feet. Results are natural-looking and typically last 3-4 months.' },
  { q: 'How much does Botox cost at RELUXE Med Spa?', a: 'Botox at RELUXE starts with a 20-unit foundation treatment at $280. Additional units are $9/unit for new patients and $10/unit for returning patients. Most patients need 20-40 units depending on the areas treated. VIP Members get the best pricing. We provide exact pricing during your consult — no surprises.' },
  { q: 'Will Botox make me look frozen or unnatural?', a: 'No. Our injectors use a "you, just refreshed" approach that preserves your natural expressions while softening lines. We customize dosing based on your unique muscle strength and movement patterns, so you still look like you — just more rested.' },
  { q: 'How long does a Botox appointment take?', a: 'A typical Botox visit takes about 30 minutes including your consultation. The actual injections take only 10-15 minutes. Most patients come in on their lunch break and return to work right away with no visible signs of treatment.' },
  { q: 'Does Botox hurt?', a: 'Most patients describe Botox as quick pinches and rate the discomfort at 2-3 out of 10. The needles are ultra-fine, and injections are fast. We can apply numbing cream if you\'re sensitive, though most people don\'t need it.' },
  { q: 'When will I see Botox results?', a: 'You\'ll start noticing changes within 3-5 days, with full results visible at about 2 weeks. We recommend scheduling at least 2 weeks before any special event for optimal timing.' },
  { q: 'How long does Botox last?', a: 'Botox typically lasts 3-4 months. With consistent treatments, many patients find results last longer over time as the muscles become trained. We recommend maintenance every 3-4 months to keep your look fresh.' },
  { q: 'Is there downtime after Botox?', a: 'No downtime at all. You can return to work and normal activities immediately. Just avoid lying flat for 4 hours, skip intense exercise for 24 hours, and don\'t rub the treated areas. Minor redness at injection sites fades within an hour.' },
  { q: 'What areas can Botox treat?', a: 'Botox treats forehead lines, frown lines (the "11s"), crow\'s feet, bunny lines, lip flip, chin dimpling, and jawline slimming (masseter). We also use it for brow lifts and neck bands. Your provider will recommend the best areas based on your goals.' },
  { q: 'What is the difference between Botox, Dysport, Jeuveau, and Daxxify?', a: 'All four are FDA-approved neuromodulators that work similarly but have subtle differences. Botox is the gold standard with reliable 3-4 month results. Dysport spreads more (ideal for larger areas like foreheads). Jeuveau often kicks in fastest. Daxxify can last 4-6+ months. We carry all four at RELUXE and help you choose the best fit.' },
  { q: 'Who is a good candidate for Botox?', a: 'Most healthy adults looking to smooth or prevent expression lines are good candidates. Botox is popular from late 20s through 60s+. You should avoid it if pregnant, nursing, or if you have a neuromuscular disorder. Book a free consult and we\'ll confirm the best plan for you.' },
  { q: 'Can I combine Botox with other treatments?', a: 'Absolutely. Botox pairs beautifully with dermal fillers for a "liquid facelift" — tox relaxes lines while filler restores volume. Many patients also combine it with facials, chemical peels, or Morpheus8 for comprehensive rejuvenation. We\'ll design a plan that addresses all your goals.' },
];

s.flexEverything = {
  intro: 'Small, precise doses customized to your muscle pattern.',
  items: [
    { heading: 'Get the right dose', body: 'Everyone is different & our expert nurse injectors will help you get the perfect dose.' },
    { heading: 'Follow-up at 2 weeks', body: 'Optional fine-tuning to perfect symmetry.' },
    { heading: 'Maintenance cadence', body: 'Plan 3–4 months; longer for Daxxify.' },
    { heading: 'Pairing tips', body: 'Lip flip, masseter slimming, skin resurfacing or facial balancing.' },
  ],
};

s.testimonials = [
  {
    author: 'Jennifer S.',
    location: 'Westfield, IN',
    service: 'Botox',
    rating: 5,
    text: 'The whole visit was so easy—and I loved my results! Krista was incredibly gentle and explained everything step-by-step.',
    monthYear: 'Feb 2025',
  },
  {
    author: 'Marcus L.',
    location: 'Carmel, IN',
    service: 'Tox (Forehead + 11s)',
    rating: 5,
    text: 'Natural look, no heaviness. Booking again before my next event.',
    date: '2025-01',
  },
];

// 👩‍⚕️ Providers
s.providers = [
  {
    name: 'Hannah, RN',
    title: 'Nurse Injector',
    headshotUrl: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-content/uploads/2025/08/hannah.png',
    bio: 'Gentle technique + great communication—Hannah makes first-time tox feel easy.',
    href: '/book/tox',
    instagram: 'https://instagram.com/injector.hannah',
    specialties: ['Tox', 'Lip Filler', 'Facial Balancing'],
  },
  {
    name: 'Alexis, RN',
    title: 'Nurse Injector',
    headshotUrl: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-content/uploads/2025/08/alexis.png',
    bio: 'Add Alexis\'s short bio here (1–2 lines).',
    href: '/book/tox',
    instagram: 'https://instagram.com/____',
    specialties: ['Tox', 'Lip Filler', 'Facial Balancing'],
  },
];

export default s;
