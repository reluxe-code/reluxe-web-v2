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
  { iconKey: 'clock', label: 'Treatment Time', value: '60-90 min' },
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
    src: '/images/service/filler/krista-filler-4.png',
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
    src: '/images/service/filler/krista-filler-2.png',
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
  {
    src: '/images/service/filler/krista-filler-1.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
    {
    src: '/images/service/filler/krista-filler-3.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
    {
    src: '/images/service/filler/krista-filler-4.png',
    alt: 'Forehead lines before/after – smoother after 2 weeks'
  },
];
s.appointmentSteps = [
  'Photos (for symmetry planning).',
  'Topical numbing.',
  'Precise placement with needle or cannula.',
  'Mild swelling 24–72 hrs; final look ~2 weeks.',
];
s.pricingMatrix = {
  subtitle: 'Per-syringe pricing with member savings.',
  sections: [
    {
      title: 'Dermal Fillers',
      membershipCallout: 'Members save on every syringe',
      rows: [
        // --- Value options ---
        { label: 'Revanesse® Versa', subLabel: 'Lips, nasolabial folds, marionette lines', single: '$650', membership: '$600' },

        // --- RHA family (1–4) ---
        { label: 'RHA® 1', subLabel: 'Fine dynamic lines, perioral (lip lines)', single: '$650', membership: '$600' },
        { label: 'RHA® 2', subLabel: 'Moderate dynamic lines, lips, perioral', single: '$650', membership: '$600' },
        { label: 'RHA® 3', subLabel: 'Deeper folds (NLF), marionette lines, corners of mouth', single: '$650', membership: '$600' },
        { label: 'RHA® 4', subLabel: 'Cheek & jawline structure, deeper dynamic folds', single: '$650', membership: '$600' },

        // --- JUVÉDERM family ---
        { label: 'JUVÉDERM® Volux XC', subLabel: 'Jawline definition, chin sculpting', single: '$800', membership: '$750' },
        { label: 'JUVÉDERM® Voluma XC', subLabel: 'Cheeks / midface lift, chin', single: '$800', membership: '$750' },
        { label: 'JUVÉDERM® Vollure XC', subLabel: 'Smile lines (NLF), marionette lines', single: '$750', membership: '$700' },
        { label: 'JUVÉDERM® Volbella XC', subLabel: 'Lips (subtle), vertical lip lines', single: '$750', membership: '$700' },
        { label: 'JUVÉDERM® Volbella (½ syringe)', subLabel: 'Touch-ups, subtle lip/line work', single: '$500', membership: '$450' },

        // --- Restylane family ---
        { label: 'Restylane® Lyft', subLabel: 'Cheeks / midface support, hands', single: '$750', membership: '$700' },
        { label: 'Restylane® Contour', subLabel: 'Cheek contour with natural expression', single: '$750', membership: '$700' },
        { label: 'Restylane® Defyne', subLabel: 'Deep expression lines, chin/jawline flexibility', single: '$750', membership: '$700' },
        { label: 'Restylane® Kysse', subLabel: 'Lips (soft, flexible volume) & definition', single: '$750', membership: '$700' },
      ],
      promo: 'Save $100 when you purchase 2+ syringes in the same visit.',
      ctaText: 'Book filler consult',
    },
  ],
};

s.faq = [
  { q: 'What are dermal fillers and how do they work?', a: 'Dermal fillers are injectable gels — most made with hyaluronic acid (HA), a substance naturally found in your skin — that restore volume, smooth lines, and enhance facial contours. They work immediately to add structure and hydration to areas like lips, cheeks, jawline, and nasolabial folds. Results are visible right away and improve as swelling settles.' },
  { q: 'How much do dermal fillers cost at RELUXE?', a: 'Filler pricing at RELUXE starts at $650 per syringe for Revanesse Versa (lips, lines) and ranges up to $800 for Juvéderm Voluma and Volux (cheeks, jawline). VIP Members save on every syringe. We also offer $100 off when you purchase 2+ syringes in the same visit. Your provider will recommend the right product and quantity during your consult.' },
  { q: 'Will dermal fillers look natural?', a: 'Yes — our injectors prioritize balance and facial harmony, not an overfilled look. We use face-mapping techniques and take a "less is more" approach, building gradually. The goal is always "you, just refreshed." We can always add more at your follow-up if you want a bit extra.' },
  { q: 'How long do dermal fillers last?', a: 'Duration depends on the product and area treated. Lip fillers typically last 6-12 months. Cheek and jawline fillers (like Voluma) can last 12-18 months. RHA fillers are designed to move naturally with your expressions and last 12-15 months. Your provider will explain expected longevity for your specific treatment plan.' },
  { q: 'Does getting filler hurt?', a: 'Most fillers contain lidocaine (a numbing agent) built into the gel, so discomfort is minimal. We also apply numbing cream before treatment and use vibration devices for comfort. Most patients rate the experience at 3-4 out of 10. Lip filler is typically the most sensitive area, but it\'s still very manageable.' },
  { q: 'What is the downtime after filler?', a: 'Expect mild swelling for 24-72 hours, with lips potentially swelling a bit longer. Bruising is possible but not guaranteed. Most patients return to work and social activities the same day. Avoid intense exercise for 24 hours, and skip alcohol the day of treatment to minimize bruising.' },
  { q: 'How many syringes of filler will I need?', a: 'It depends on the area and your goals. Lips typically need 1 syringe, cheeks usually 1-2 per side, and a full facial balancing plan might use 3-5 syringes total. We always start conservative and build over time. Your provider will design a plan during your free consultation.' },
  { q: 'Can dermal fillers be reversed?', a: 'Yes — hyaluronic acid fillers (which is what we primarily use) can be dissolved quickly and safely with an enzyme called hyaluronidase. This is one of the biggest advantages of HA fillers: if you\'re not happy or there\'s an issue, it\'s fully reversible.' },
  { q: 'What is the difference between filler and Botox?', a: 'They work differently and treat different concerns. Botox relaxes muscles to smooth dynamic wrinkles (lines caused by expressions). Filler adds volume to restore structure, plump lips, or smooth static lines (visible at rest). Many patients get both — Botox for the upper face and filler for the mid/lower face — for a comprehensive refresh.' },
  { q: 'Which filler brand is best for me?', a: 'We carry RHA (great for dynamic areas), Juvéderm (excellent structure), Restylane (versatile), and Revanesse Versa (value-focused). RHA moves naturally with your expressions. Juvéderm Voluma provides strong cheek lift. Restylane Kysse is ideal for soft, natural lips. Your provider will match the best product to each area being treated.' },
  { q: 'Who is a good candidate for filler?', a: 'Most healthy adults looking to restore volume, enhance features, or smooth lines are good candidates. Filler is popular for lips, cheeks, jawline, nasolabial folds, under-eyes, and chin. You should avoid filler if you\'re pregnant, nursing, have an active skin infection, or have certain autoimmune conditions. A free consult will confirm the best plan.' },
  { q: 'Can I combine filler with other treatments?', a: 'Yes — filler pairs perfectly with tox (Botox/Dysport) for a "liquid facelift" approach. Many patients also combine filler with Morpheus8 for skin tightening, or with facials for skin health. We can treat tox and filler in the same appointment for convenience.' },
];
// Overview: keep to 1–2 short paragraphs
s.overview = {
  p1: 'Fillers are a quick, non-surgical way to smooth lines, restore volume, and enhance features like lips, cheeks, and jawline all while still looking like you. Most are made with hyaluronic acid (a substance your skin loves), results are visible right away, and there\'s little to no downtime.',
  p2: 'At your visit, we\'ll chat about your goals and design a natural, balanced plan that fits your features and budget. Our nurse injectors prioritizes comfort and safety, then shares simple aftercare so your results settle beautifully over the next few days.',
};

// Why RELUXE: 3–6 bullets max
s.whyReluxe = [
  { title: 'Expert injectors & providers', body: 'Safety-first care from an anatomy-focused Nurse Practitioner and trained injectors, with personalized treatment plans for your features and goals.' },
  { title: 'Natural results & education', body: 'Face-mapping consults, honest guidance on product choices and cost, and a "you, just refreshed" approach—never overfilled.' },
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
