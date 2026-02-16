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

  // ✅ Use pricingMatrix as the “clean visual pricing”
  pricing: 'tiers', // keep, but we’ll make it minimal (or you can remove pricing entirely)
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
  good: ['Forehead lines', 'Glabellar (11s)', 'Crow’s feet', 'Bunny lines', 'Lip flip'],
  notIdeal: ['Active infection at site', 'Pregnant or nursing', 'Neuromuscular disorders—consult first'],
};

s.overview = {
  p1: 'Botox® is a quick, no-downtime treatment that softens frown lines, forehead lines, and crow’s feet so you look rested—not “frozen.” Tiny injections relax the overactive muscles that create creases, with improvements appearing in a few days and full results at about two weeks. Most people describe it as a few small pinches, and then they’re back to work, errands, or the gym.',
  p2: 'At RELUXE, your visit starts with a friendly, honest consult. We map your unique expressions, discuss goals and budget, and create a plan that keeps your features natural and balanced. You’ll leave with simple aftercare tips and a clear timeline for follow-ups (typically every 3–4 months, depending on your muscles and metabolism).',
};

s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Care by an anatomy-focused Nurse Practitioner and trained injectors who customize dosing for your face, lifestyle, and goals.' },
  { title: 'Personalized dosing & plans', body: 'We map movement/skin and tailor treatment for results that actually last.' },
  { title: 'Membership value', body: 'Best pricing on Botox & all complementary services for results you can maintain.' },
  { title: 'The RELUXE experience', body: 'Easy booking, zero-pressure consults, and real follow-up care.' },
];

s.appointmentSteps = [
  'Arrive makeup-free or we’ll cleanse.',
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
          singleNote: 'Great for first-time patients and “maintenance” dosing.',
        },
        {
          label: 'Additional Units',
          subLabel: 'Customized after mapping your movement',
          single: 'New: $9/unit',
          package: 'Returning: $10/unit',
          packageNote: 'Returning patient pricing applies after your initial visit.',
        },
      ],
      promo: 'Not sure how many units you need? We’ll map your expression and recommend the right plan.',
      ctaText: 'Book Botox',
    },
  ],
};

// Keep this minimal so the older “Pricing & Packages” section doesn’t compete.
// (You can delete s.pricing entirely if you’d rather rely only on pricingMatrix.)
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
  { q: 'What is Botox?', a: 'Botox is an FDA-approved injectable that relaxes targeted muscles to smooth wrinkles and help prevent new lines from forming.' },
  { q: 'Will I look frozen?', a: 'No—our approach preserves natural movement while softening lines.' },
  { q: 'When do I see results?', a: 'You’ll start to notice changes in 3–5 days, with full results in about 2 weeks.' },
  { q: 'How long does it last?', a: 'Typically 3+ months, but it varies by person and dosing.' },
  { q: 'Does it hurt?', a: 'Quick pinches; most rate it 2–3/10.' },
  { q: 'Is there any downtime?', a: 'No major downtime — you can return to normal activities right after, but avoid exercise for 24 hours and lying flat or rubbing the area for 4 hours.' },

  // ✅ Updated pricing FAQ to match new structure
  {
    q: 'How much does it cost? How many units will I need?',
    a:
      'Botox pricing is a foundation + customization model. Your visit typically starts with a 20-unit foundation treatment ($280). If you need more, additional units are $9/unit for new patients and $10/unit for returning patients. We’ll map your facial movement and recommend a plan that looks natural and lasts.',
  },
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
    name: 'Krista Spalding, NP',
    title: 'Nurse Practitioner Injector',
    headshotUrl: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-content/uploads/2025/08/krista.png',
    bio: 'Detail-obsessed injector focused on natural movement and balanced facial aesthetics.',
    href: '/book/tox',
    instagram: 'https://instagram.com/injector.krista',
    specialties: ['Tox', 'Lip Filler', 'Facial Balancing'],
  },
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
    bio: 'Add Alexis’s short bio here (1–2 lines).',
    href: '/book/tox',
    instagram: 'https://instagram.com/____',
    specialties: ['Tox', 'Lip Filler', 'Facial Balancing'],
  },
];

export default s;
