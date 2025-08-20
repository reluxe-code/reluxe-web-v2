// /data/offers.js
export const offers = {
  // —— slugs must match your URL (e.g. /offers/book-jeuveau-offer)
  'book-jeuveau-offer': {
    title: '🔥 Limited-Time Jeuveau Special 🔥',
    startDate: '2025-08-01',         // omit or set null for "start immediately"
    endDate: '2025-08-31',           // omit or set null for "never ends"
    description: `
      Take advantage of our introductory Jeuveau offer—just $10/unit (normally $14/unit)!
      Includes consultation, no downtime, and premium follow-up care.
    `,
    imageUrl: '/images/offers/jeuveau-hero.jpg',
    ctaText: 'Book Your Jeuveau Now',
    ctaUrl: '/book-jeuveau',
    features: [
      '10 units Jeuveau for $100',
      'Free expert consultation',
      '100% satisfaction guarantee',
      'No downtime, all skin types welcome',
    ],
    // you can drop in more fields here (testimonials, FAQs, etc.)
  },

  'intro-massage': {
    title: 'Relaxation Massage Intro Offer',
    startDate: null,
    endDate: null,
    description: `
      Unwind with our signature 60-minute massage—only $75 (normally $120).
      Limited slots available each week!
    `,
    imageUrl: '/images/offers/intro-massage.jpg',
    ctaText: 'Claim My Massage',
    ctaUrl: '/book-intro-massage',
    features: [
      '60-minute full-body massage',
      'Aromatherapy upgrade available',
      'Licensed, award-winning therapists'
    ],
  },
};
