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

s.heroImage = '/images/service/m8/1.png';
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
  { q: 'What is Morpheus8 and how does it work?', a: 'Morpheus8 is an FDA-cleared fractional radiofrequency (RF) microneedling device that combines tiny needles with heat energy to remodel collagen deep within the skin. It tightens, smooths, and resurfaces from the inside out — treating wrinkles, acne scars, skin laxity, and uneven texture. It\'s one of the most effective non-surgical skin tightening treatments available.' },
  { q: 'How much does Morpheus8 cost at RELUXE?', a: 'A single Morpheus8 session at RELUXE starts at $1,000, with packages of 3 sessions available at $3,000. VIP Members receive additional savings. Most patients see optimal results with a series of 3 treatments spaced 4-6 weeks apart. We discuss pricing and package options during your free consultation.' },
  { q: 'Does Morpheus8 hurt?', a: 'We apply strong topical numbing cream for 30-45 minutes before treatment, so most patients feel only pressure and warmth during the procedure. Comfort levels are very manageable — most patients rate it around 4-5 out of 10. We adjust depth and energy settings based on your comfort and treatment area.' },
  { q: 'How many Morpheus8 sessions do I need?', a: 'A series of 3 sessions spaced 4-6 weeks apart is the standard recommendation for most goals. Deep acne scarring or significant skin laxity may benefit from additional sessions. Many patients do a maintenance session every 6-12 months after their initial series to preserve results.' },
  { q: 'When will I see Morpheus8 results?', a: 'You\'ll notice an immediate "glow" and skin tightening within 1-2 weeks. However, the real transformation happens over 3-6 months as your body builds new collagen. Results continue to improve for up to 12 weeks after your final session. Each treatment in the series compounds the results.' },
  { q: 'What is the downtime for Morpheus8?', a: 'Expect 2-4 days of redness, mild swelling, and tiny pinpoint marks (like a mild sunburn). Most patients are comfortable in public by day 3-4 with makeup. You can return to work the next day if comfortable. Avoid direct sun, heavy exercise, and active skincare (retinol, acids) for 5-7 days.' },
  { q: 'Is Morpheus8 safe for all skin tones?', a: 'Yes — Morpheus8 is one of the safest energy-based treatments for all skin types and tones, including darker skin. Because the RF energy is delivered through microneedles beneath the surface, the risk of hyperpigmentation is much lower than with lasers. We customize depth and energy settings for each patient.' },
  { q: 'What areas can Morpheus8 treat?', a: 'Morpheus8 treats the face (cheeks, jawline, forehead), under-chin/neck, and body areas including abdomen, thighs, and arms. It\'s excellent for jowls, acne scars, enlarged pores, stretch marks, and overall skin tightening. The depth and energy can be adjusted for each treatment zone.' },
  { q: 'How is Morpheus8 different from regular microneedling?', a: 'Traditional microneedling (like SkinPen) creates surface-level micro-channels to stimulate collagen. Morpheus8 goes deeper — its insulated needles deliver radiofrequency energy 1-4mm into the skin, heating the deeper layers to remodel fat and tighten tissue. The results are significantly more dramatic for skin laxity and contouring.' },
  { q: 'Can I combine Morpheus8 with other treatments?', a: 'Yes — Morpheus8 pairs well with tox (Botox/Dysport) for dynamic lines, dermal fillers for volume, and IPL for sun damage and discoloration. We typically recommend waiting 2-4 weeks between Morpheus8 and other treatments. Your provider will design a comprehensive plan that addresses all your concerns.' },
  { q: 'Who is a good candidate for Morpheus8?', a: 'Morpheus8 is ideal for adults concerned about skin laxity, fine lines, acne scars, enlarged pores, stretch marks, or overall skin texture. It\'s a great option for patients who want significant improvement without surgery. You should avoid it if pregnant, nursing, have active skin infections, or have certain implanted devices.' },
  { q: 'How long do Morpheus8 results last?', a: 'Results from a full series of 3 treatments typically last 1-3 years, depending on your skin, age, and lifestyle. The collagen remodeling is long-lasting, but natural aging continues. Most patients maintain their results with a single touch-up session every 6-12 months.' },
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

// 👩‍⚕️ Providers
s.providers = [
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
