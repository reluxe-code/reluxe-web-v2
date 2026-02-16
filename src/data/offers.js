// src/data/offers.js

// Helper: parse ISO or return null
const d = (s) => (s ? new Date(s) : null);

/**
 * Offer shape:
 * {
 *   slug, title, shortTitle, indexable,
 *   hero: { image, kicker, headline, subhead, ctaLabel, bookSlug?, bookUrl? },
 *   overview: "paragraph",
 *   locations: ['carmel'|'westfield'|'both'],
 *   details: [ ...bullet points ... ],
 *   finePrint: [ ...bullets ... ],
 *   price: { amount?: number, currency?: 'USD', display?: string },
 *   schedule: { start?: DateISO, end?: DateISO, neverEnd?: boolean },
 *   seo: { title, description, image },
 * }
 *
 * Booking rules:
 * - If hero.bookUrl is set, CTA opens that URL.
 * - Else if hero.bookSlug is set, CTA uses your window.bookingMap[slug].path and blvd.openBookingWidget with locationId.
 * - Else fallback to /book (intercepted by your injector).
 */

export const OFFERS = [
  // ————————————————— Existing —————————————————
  {
    slug: 'intro-massage-85',
    indexable: true,
    title: '$85 Intro Massage',
    shortTitle: 'Intro Massage $85',
    hero: {
      image: '/images/offers/massage-intro-hero.png',
      kicker: 'Westfield Only',
      headline: 'First Massage • $85',
      subhead: 'A full-body intro massage with our licensed massage therapist.',
      ctaLabel: 'Book Westfield Intro Massage',
      bookSlug: 'intromassage',
    },
    overview:
      'Start with a restorative massage focused on stress relief and circulation. Perfect as your first visit or a tune-up session.',
    locations: ['westfield'],
    details: [
      '60-minute table massage',
      'Consultation and pressure preferences',
      'Soothing aromatherapy finish',
    ],
    finePrint: [
      'New massage patients only. Westfield location.',
      'Cannot be combined with other discounts.',
      'One per guest; limited time.',
    ],
    price: { amount: 85, currency: 'USD', display: '$85' },
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: '$85 Intro Massage in Westfield, IN | RELUXE Med Spa',
      description: 'First-time massage at RELUXE in Westfield. 60-minute session for just $85. Limited time.',
      image: '/images/seo/offer-massage-intro.png',
    },
  },

  {
    slug: 'jeuveau-50u-360',
    indexable: true,
    title: '$360 Jeuveau • 50 Units',
    shortTitle: 'Jeuveau 50U $360',
    hero: {
      image: '/images/offers/jeuveau-50u-hero.png',
      kicker: 'New to Jeuveau®',
      headline: '50 Units of Jeuveau • $360',
      subhead: 'Price reflects $40 Evolus Rewards applied at checkout for new Jeuveau patients.',
      ctaLabel: 'Book Jeuveau',
      bookSlug: 'jeuveau',
    },
    overview:
      'A smooth, natural look—fast onset and consistent results. Perfect for frown lines, forehead, crow’s feet, and more.',
    locations: ['both'],
    details: [
      'Includes 50 units of Jeuveau',
      'Ideal for common forehead/glabella/crow’s feet patterns',
      'Consultation and dosing customized by your injector',
    ],
    finePrint: [
      'New Jeuveau patients only. Must enroll in Evolus Rewards to receive $40 savings.',
      'Cannot combine with other manufacturer offers.',
      'Medical exam required; treatment at injector discretion.',
    ],
    price: { amount: 360, currency: 'USD', display: '$360 after $40 reward' },
    schedule: { start: '2025-09-01', end: '2025-12-31' },
    seo: {
      title: 'Jeuveau Special — 50 Units for $360 | RELUXE Med Spa',
      description:
        'Limited-time Jeuveau offer for new patients. Save with Evolus Rewards. Skilled injectors in Westfield & Carmel.',
      image: '/images/seo/offer-jeuveau-50u.png',
    },
  },

  {
    slug: 'why-choose-jeuveau',
    indexable: true,
    title: 'Why Choose Jeuveau®',
    shortTitle: 'Why Jeuveau',
    hero: {
      image: '/images/offers/why-jeuveau-hero.png',
      kicker: 'Compare neuromodulators',
      headline: 'Why Choose Jeuveau®',
      subhead: 'How Jeuveau compares to Botox® and Dysport®—and when we recommend it.',
      ctaLabel: 'Book a Tox Consult',
      bookSlug: 'tox-consult',
    },
    overview:
      'Jeuveau is a modern neuromodulator loved for its smooth feel and quick onset. We’ll help you decide if it’s the right fit versus Botox or Dysport.',
    locations: ['both'],
    details: [
      'Onset and feel factors that patients notice',
      'How dosing and area selection changes your look',
      'Side-by-side considerations vs. other brands',
    ],
    finePrint: [
      'All neuromodulators require a medical evaluation and informed consent.',
      'Results vary. Not a substitute for a full consultation.',
    ],
    price: {},
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Jeuveau vs. Botox vs. Dysport — Guide & Consult | RELUXE',
      description:
        'A quick guide to Jeuveau with honest comparisons to Botox/Dysport. Book a consult in Westfield or Carmel.',
      image: '/images/seo/offer-why-jeuveau.png',
    },
  },

  // ————————————————— New Offers —————————————————

  // 1) Botox - Save $2 on 30+ units
  {
    slug: 'botox-save-2-30plus',
    indexable: true,
    title: 'Botox® — Save $2 on 30+ Units',
    shortTitle: 'Botox: $2 Off (30+)',
    hero: {
      image: '/images/offers/botox-save2-hero.png',
      kicker: 'Both Locations',
      headline: 'Save $2 per unit on 30+ Units',
      subhead: 'Classic, precise smoothing with our expert injectors.',
      ctaLabel: 'Book Botox',
      bookSlug: 'botox',
    },
    overview:
      'Bank extra savings when your treatment plan is 30 units or more. Personalized dosing for natural, refreshed results.',
    locations: ['both'],
    details: [
      'Applies when 30+ total units are treated in one visit',
      'Great for combined forehead, glabella, and crow’s feet patterns',
      'Customized by your injector after a medical evaluation',
    ],
    finePrint: [
      'Valid on treatment plans totaling 30+ units in a single visit.',
      'Not combinable with other in-house discounts. Manufacturer rewards may still apply per program rules.',
      'Medical exam required; treatment at injector discretion.',
    ],
    price: { display: '$2 off per unit (30+ units)' },
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Botox — Save $2 on 30+ Units | RELUXE Med Spa',
      description:
        'Get $2 off per unit when you treat 30+ units of Botox in one visit. Available in Westfield & Carmel.',
      image: '/images/seo/offer-botox-save2.png',
    },
  },

  // 2) Dysport - Save $1 on 50+ units
  {
    slug: 'dysport-save-1-50plus',
    indexable: true,
    title: 'Dysport® — Save $1 on 50+ Units',
    shortTitle: 'Dysport: $1 Off (50+)',
    hero: {
      image: '/images/offers/dysport-save1-hero.png',
      kicker: 'Both Locations',
      headline: 'Save $1 per unit on 50+ Units',
      subhead: 'Smooth movement, soft finish—popular for broader areas.',
      ctaLabel: 'Book Dysport',
      bookSlug: 'dysport',
    },
    overview:
      'Ideal when your plan calls for higher unit counts—lock in $1 off per unit at 50 units or more.',
    locations: ['both'],
    details: [
      'Applies when 50+ total units are treated in one visit',
      'Often chosen for a softer, blended look across large patterns',
      'Customized after a medical evaluation',
    ],
    finePrint: [
      'Valid on treatment plans totaling 50+ units in a single visit.',
      'Not combinable with other in-house discounts. Manufacturer rewards may still apply per program rules.',
      'Medical exam required; treatment at injector discretion.',
    ],
    price: { display: '$1 off per unit (50+ units)' },
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Dysport — Save $1 on 50+ Units | RELUXE Med Spa',
      description:
        'Save $1 per unit when you treat 50+ units of Dysport in one visit. Available in Westfield & Carmel.',
      image: '/images/seo/offer-dysport-save1.png',
    },
  },

  // 3) Daxxify - Save $1 on 50+ units
  {
    slug: 'daxxify-save-1-50plus',
    indexable: true,
    title: 'Daxxify® — Save $1 on 50+ Units',
    shortTitle: 'Daxxify: $1 Off (50+)',
    hero: {
      image: '/images/offers/daxxify-save1-hero.png',
      kicker: 'Both Locations',
      headline: 'Save $1 per unit on 50+ Units',
      subhead: 'Peptide-enhanced neuromodulator with a reputation for longevity.',
      ctaLabel: 'Book Daxxify',
      bookSlug: 'daxxify',
    },
    overview:
      'If your plan uses 50+ units of Daxxify, you’ll automatically save $1 per unit at checkout.',
    locations: ['both'],
    details: [
      'Applies when 50+ total units are treated in one visit',
      'Discuss area selection and duration goals with your injector',
      'Customized after a medical evaluation',
    ],
    finePrint: [
      'Valid on treatment plans totaling 50+ units in a single visit.',
      'Not combinable with other in-house discounts. Manufacturer rewards may still apply per program rules.',
      'Medical exam required; treatment at injector discretion.',
    ],
    price: { display: '$1 off per unit (50+ units)' },
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Daxxify — Save $1 on 50+ Units | RELUXE Med Spa',
      description:
        'Save $1 per unit on 50+ units of Daxxify in one visit. Westfield & Carmel.',
      image: '/images/seo/offer-daxxify-save1.png',
    },
  },

  // 4) Jeuveau - $200 for 20 units (after $40 reward) + $8/unit after
  {
    slug: 'jeuveau-200-20u-plus-8',
    indexable: true,
    title: 'Jeuveau® — $200 for 20U (after $40 reward) + $8/Unit After',
    shortTitle: 'Jeuveau: $200 for 20U + $8/U',
    hero: {
      image: '/images/offers/jeuveau-200-20u-hero.png',
      kicker: 'Both Locations',
      headline: '$200 for 20 Units*',
      subhead: '*After $40 Evolus Rewards for new Jeuveau patients. Additional units $8 each.',
      ctaLabel: 'Book Jeuveau',
      bookSlug: 'jeuveau',
    },
    overview:
      'A sharp intro price on your first 20 units of Jeuveau (after a $40 Evolus Rewards savings), then just $8 per unit for any additional dosing in the same visit.',
    locations: ['both'],
    details: [
      'First 20 units: $200 after $40 Evolus Rewards for new Jeuveau patients',
      'Additional units beyond 20: $8 per unit in the same visit',
      'Customized plan after a medical evaluation',
    ],
    finePrint: [
      'New Jeuveau patients must enroll in Evolus Rewards to receive $40 savings.',
      'Additional units priced at $8 each during the same appointment.',
      'Not combinable with other in-house discounts.',
      'Medical exam required; treatment at injector discretion.',
    ],
    price: { amount: 200, currency: 'USD', display: '$200 for 20U (+$8/U after)*' },
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Jeuveau — $200 for 20U + $8/Unit After | RELUXE',
      description:
        'Intro Jeuveau pricing after $40 Evolus Rewards for new patients; additional units only $8 each. Westfield & Carmel.',
      image: '/images/seo/offer-jeuveau-200-20u.png',
    },
  },
];

// ————— helpers —————
export function isActive(offer, now = new Date()) {
  if (!offer?.schedule) return true;
  const { start, end, neverEnd } = offer.schedule;
  const s = start ? d(start) : null;
  const e = end ? d(end) : null;
  if (s && now < s) return false;
  if (e && now > e && !neverEnd) return false;
  return true;
}

export function allowedAt(offer, locationKey) {
  const locs = offer?.locations || [];
  if (locs.includes('both')) return true;
  return locs.includes(locationKey);
}
