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
  {
    slug: 'intro-massage-85',
    indexable: true,
    title: '$85 Intro Massage',
    shortTitle: 'Intro Massage $85',
    hero: {
      image: '/images/offers/massage-intro-hero.jpg',
      kicker: 'Westfield Only',
      headline: 'First Massage • $85',
      subhead: 'A full-body intro massage with our licensed massage therapist.',
      ctaLabel: 'Book Westfield Intro Massage',
      // If you have a BLVD slug in your _app bookingMap, use it:
      // bookSlug should match one of your keys, e.g. 'intromassage'
      bookSlug: 'intromassage',
    },
    overview:
      'Start with a restorative massage focused on stress relief and circulation. Perfect as your first visit or a tune-up session.',
    locations: ['westfield'], // carmel | westfield | both
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
    schedule: { start: '2025-09-01', neverEnd: true }, // open-ended until you set an end date
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
      image: '/images/offers/jeuveau-50u-hero.jpg',
      kicker: 'New to Jeuveau®',
      headline: '50 Units of Jeuveau • $360',
      subhead: 'Price reflects $40 Evolus Rewards applied at checkout for new Jeuveau patients.',
      ctaLabel: 'Book Jeuveau',
      bookSlug: 'jeuveau', // matches your bookingMap key in _app.js
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
      image: '/images/offers/why-jeuveau-hero.jpg',
      kicker: 'Compare neuromodulators',
      headline: 'Why Choose Jeuveau®',
      subhead: 'How Jeuveau compares to Botox® and Dysport®—and when we recommend it.',
      ctaLabel: 'Book a Tox Consult',
      // This can open the consult flow:
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
    price: {}, // informational landing—no price
    schedule: { start: '2025-09-01', neverEnd: true },
    seo: {
      title: 'Jeuveau vs. Botox vs. Dysport — Guide & Consult | RELUXE',
      description:
        'A quick guide to Jeuveau with honest comparisons to Botox/Dysport. Book a consult in Westfield or Carmel.',
      image: '/images/seo/offer-why-jeuveau.png',
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
