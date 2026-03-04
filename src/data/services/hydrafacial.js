// src/data/services/hydrafacial.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('hydrafacial');

s.variants = {
  hero: 'split',
  quickFacts: 'pills',
  benefits: 'compare',
  beforeAfter: 'compare',
  howItWorks: 'steps',
  candidates: 'badges',
  process: 'checklist',
  pricing: 'tiers',
  comparison: 'cards',
  faq: 'top5',
  providers: 'featured',
  related: 'scroll',
  prepAftercare: 'cards',
  flexEverything: 'tips',
};

s.blockPriorities = {
  hero: 10,
  quickFacts: 20,
  overviewWhy: 22,
  benefits: 25,
  pricingMatrix: 30,
  resultsGallery: 40,
  howItWorks: 50,
  testimonials: 55,
  candidates: 60,
  faq: 85,
  providerSpotlight: 110,
  relatedServices: 120,
  prepAftercare: 130,
  flexEverything: 140,
  bookingEmbed: 150,
};

s.tagline = "Instant luminosity with zero downtime—your skin, refreshed.";

s.seo = {
  "title": "HydraFacial in Westfield, IN | RELUXE Med Spa",
  "description": "Get instant skin luminosity with HydraFacial at RELUXE Westfield. Three treatment tiers, expert estheticians, and VIP member pricing available."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "30-60 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Maintenance",
    "value": "Monthly"
  }
];

s.benefits = [
  "Immediate skin luminosity and hydration without irritation",
  "Reduced appearance of fine lines and surface texture irregularities",
  "Minimized pore size through deep extraction and exfoliation",
  "Improved skin tone and reduced hyperpigmentation",
  "Enhanced product absorption for your home skincare routine"
];

s.overview = {
  "p1": "HydraFacial is a medical-grade resurfacing treatment that uses patented Vortex-Fusion technology to simultaneously cleanse, extract, and infuse the skin with intensive serums. The multi-step process combines gentle physical and chemical exfoliation with salicylic and glycolic acids, followed by vacuum extraction of impurities and immediate infusion of antioxidants, peptides, and hyaluronic acid. This comprehensive approach addresses fine lines, hyperpigmentation, enlarged pores, and dehydration while providing instant luminosity and long-term skin health improvements.",
  "p2": "At RELUXE in Westfield, our licensed estheticians customize each HydraFacial with targeted boosters and LED light therapy based on your skin's specific needs during your complimentary consultation. We offer three treatment tiers to match your goals and budget, with VIP members receiving exclusive pricing and priority booking for this popular monthly maintenance treatment."
};

s.whyReluxe = [
  {
    "title": "Customized Treatment Tiers",
    "body": "Our Signature, Deluxe, and Platinum options allow us to target your specific concerns with advanced boosters like Growth Factor or Britenol for hyperpigmentation."
  },
  {
    "title": "Expert Esthetician Team",
    "body": "Our licensed estheticians assess your skin during consultation and adjust suction levels, serum selection, and add-ons for optimal comfort and results."
  },
  {
    "title": "VIP Member Benefits",
    "body": "Members save 10-15% on all HydraFacial treatments and receive priority booking for monthly maintenance appointments at our Westfield location."
  }
];

s.howItWorks = [
  {
    "title": "Cleanse & Exfoliate",
    "body": "The HydraPeel tip removes dead skin cells and opens pores while infusing cleansing serums with salicylic and glycolic acids to prepare skin for extraction."
  },
  {
    "title": "Extract & Hydrate",
    "body": "Automated vortex extraction removes blackheads and impurities while simultaneously delivering intense moisturizers and nourishing peptides deep into the skin."
  },
  {
    "title": "Fuse & Protect",
    "body": "The final step saturates skin with antioxidants like vitamin C and hyaluronic acid, followed by optional LED light therapy to enhance cellular renewal and collagen production."
  }
];

s.candidates = {
  "good": [
    "All skin types seeking gentle resurfacing",
    "Fine lines and early signs of aging",
    "Enlarged pores and blackheads",
    "Uneven skin tone and texture",
    "Dehydrated or dull complexion"
  ],
  "notIdeal": [
    "Active rosacea flares",
    "Open wounds or active infections",
    "Recent chemical peels or laser treatments"
  ]
};

s.pricingMatrix = {
  "subtitle": "Choose from three treatment tiers designed to address different skin concerns and budgets.",
  "sections": [
    {
      "title": "HydraFacial Treatment Options",
      "note": "All treatments include cleansing, extraction, and hydration with customized serums.",
      "membershipCallout": "VIP members save 10-15% on all treatments",
      "rows": [
        {
          "label": "Signature HydraFacial",
          "subLabel": "Essential 3-step treatment with basic serums",
          "single": "Starting at $175",
          "membership": "VIP pricing available"
        },
        {
          "label": "Deluxe HydraFacial",
          "subLabel": "Enhanced treatment with targeted boosters",
          "single": "Starting at $225",
          "membership": "VIP pricing available"
        },
        {
          "label": "Platinum HydraFacial",
          "subLabel": "Premium experience with LED therapy and lymphatic drainage",
          "single": "Starting at $275",
          "membership": "VIP pricing available"
        }
      ],
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid retinoids and exfoliating products for 24 hours prior",
      "Arrive with clean skin free of makeup and skincare products",
      "Inform your esthetician of any recent chemical peels or laser treatments",
      "Discontinue use of blood-thinning medications if cleared by your physician"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply SPF 30+ sunscreen immediately and reapply every 2 hours",
      "Avoid harsh exfoliants and retinoids for 24-48 hours post-treatment",
      "Keep skin hydrated with gentle, fragrance-free moisturizers",
      "Avoid excessive heat from saunas, hot yoga, or steam rooms for 24 hours",
      "Schedule your next treatment in 4-6 weeks for optimal skin maintenance"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize your HydraFacial results with these expert recommendations from our Westfield estheticians.",
  "items": [
    {
      "heading": "Monthly Consistency",
      "body": "Regular treatments every 4-6 weeks maintain the cellular renewal cycle and compound results, making each subsequent HydraFacial more effective than the last."
    },
    {
      "heading": "Strategic Timing",
      "body": "Book your HydraFacial 3-5 days before special events for peak luminosity, or start monthly treatments 3 months before major occasions for transformative results."
    },
    {
      "heading": "Serum Selection",
      "body": "Discuss your primary concerns during consultation—Growth Factor boosters for aging, Britenol for pigmentation, or DermaBuilder peptides for hydration and plumping."
    },
    {
      "heading": "Home Maintenance",
      "body": "Extend results with medical-grade products from SkinBetter Science or SkinCeuticals, which penetrate deeper into freshly exfoliated skin post-treatment."
    }
  ]
};

s.faq = [
  {
    "q": "What is a HydraFacial and how does it work?",
    "a": "HydraFacial is a medical-grade facial that uses patented Vortex-Fusion technology to cleanse, extract, and hydrate your skin in one treatment. It works in three steps: deep cleansing and gentle exfoliation, painless suction extraction of debris from pores, and infusion of hydrating serums with antioxidants, peptides, and hyaluronic acid. You leave with an instant glow."
  },
  {
    "q": "How much does a HydraFacial cost at RELUXE?",
    "a": "HydraFacial treatments at RELUXE start at $150. Pricing varies based on add-on boosters (like Britenol for dark spots or DermaBuilder for anti-aging). VIP Members receive special pricing on all facials. We also offer facial packages for ongoing skin maintenance. Your aesthetician will recommend the best options during your appointment."
  },
  {
    "q": "How long does a HydraFacial take?",
    "a": "A standard HydraFacial takes about 30 minutes. With add-on boosters or LED light therapy, sessions may run 45-60 minutes. It's a popular lunchtime treatment — you can come in on your break and return to work or events immediately with glowing skin and zero downtime."
  },
  {
    "q": "Is there downtime after a HydraFacial?",
    "a": "Zero downtime. Your skin will look and feel hydrated, plump, and glowing immediately after treatment. There's no redness, peeling, or sensitivity for most patients. You can apply makeup right away and return to all normal activities. It's one of the most gentle yet effective treatments we offer."
  },
  {
    "q": "How often should I get a HydraFacial?",
    "a": "For optimal skin health, we recommend a HydraFacial every 4-6 weeks. This aligns with your skin's natural renewal cycle. Monthly treatments help maintain clear pores, consistent hydration, and a healthy glow. Many of our VIP Members include HydraFacial in their regular maintenance routine."
  },
  {
    "q": "Does a HydraFacial hurt?",
    "a": "Not at all. HydraFacial is one of our most comfortable treatments. The suction extraction feels like a gentle vacuum on the skin — most patients find it oddly satisfying. There are no needles, no harsh chemicals, and no discomfort. Many patients describe it as relaxing and even fall asleep during treatment."
  },
  {
    "q": "What skin types can get a HydraFacial?",
    "a": "HydraFacial is safe and effective for all skin types, all skin tones, and all ages. Whether you have oily, dry, sensitive, acne-prone, or combination skin, the treatment is customizable to your needs. It's one of the few facials that works universally well — including for patients with rosacea or sensitive skin."
  },
  {
    "q": "What does a HydraFacial treat?",
    "a": "HydraFacial addresses a wide range of concerns: clogged and enlarged pores, dull or dehydrated skin, fine lines and early wrinkles, uneven skin tone and texture, oily or congested skin, and sun damage. With targeted boosters, it can also address hyperpigmentation, firmness, and lip/eye area concerns."
  },
  {
    "q": "What is the difference between HydraFacial and a regular facial?",
    "a": "Traditional facials rely on manual extraction (squeezing), which can be painful and cause irritation. HydraFacial uses painless vortex suction to remove debris while simultaneously infusing active serums. It's more consistent, more hygienic, and delivers better results than a standard facial. You also see visible improvement in just one session."
  },
  {
    "q": "Can I combine HydraFacial with other treatments?",
    "a": "Yes — HydraFacial is a great complement to many treatments. It pairs well with tox or filler (same-day OK, facial first), LED light therapy (often added as an upgrade), and is an excellent skin prep treatment before events or before starting a more intensive treatment plan like microneedling or lasers."
  },
  {
    "q": "What is the difference between HydraFacial and Glo2Facial?",
    "a": "Both are excellent medical-grade facials. HydraFacial focuses on suction-based extraction and serum infusion. Glo2Facial uses CO2 technology to oxygenate skin from within, which can boost product absorption and give a unique plumping effect. We carry both and your aesthetician will recommend the best fit for your skin goals."
  },
  {
    "q": "Is HydraFacial worth it?",
    "a": "HydraFacial delivers visible results in a single session with zero downtime — you literally walk out glowing. For patients who want consistent skin maintenance without the commitment of more intensive treatments, it's one of the best investments in skin health. Many patients become regulars after their first experience."
  }
];

export default s;
