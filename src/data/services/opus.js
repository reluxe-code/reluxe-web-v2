// src/data/services/opus.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('opus');

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

s.tagline = "Fractional plasma precision for dramatic skin transformation";

s.seo = {
  "title": "Opus Plasma in Westfield, IN | RELUXE Med Spa",
  "description": "Advanced Opus Plasma fractional treatment in Westfield. Reduces acne scars, improves texture & tightens skin with less downtime than CO2 laser."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "45-60 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "3-5 days"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "2-4 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "12+ months"
  }
];

s.benefits = [
  "Reduces acne scars and textural irregularities with precision plasma technology",
  "Tightens skin and improves elasticity through controlled dermal heating",
  "Minimizes pore size and refines skin texture with fractional delivery",
  "Stimulates long-term collagen production for progressive improvement",
  "Offers dramatic results with less downtime than traditional CO2 laser"
];

s.overview = {
  "p1": "Opus Plasma delivers fractional radiofrequency energy through micro-plasma arcs to create controlled microchannels in the skin, triggering collagen remodeling and tissue tightening. This advanced plasma technology targets texture irregularities, acne scarring, fine lines, and skin laxity by generating temperatures up to 3,500°F in microscopic zones while leaving surrounding tissue intact for faster healing. The treatment combines the dramatic results of ablative resurfacing with significantly reduced downtime compared to traditional CO2 laser treatments.",
  "p2": "At RELUXE's Westfield location, our expert providers customize Opus Plasma energy levels and tip configurations to your specific skin concerns and comfort level. Your journey begins with a comprehensive consultation to map your treatment plan, followed by personalized numbing protocols and post-treatment care including our signature 2-week follow-up to monitor your healing progress."
};

s.whyReluxe = [
  {
    "title": "Advanced Technology",
    "body": "Our Opus Plasma system offers precise depth control and multiple tip configurations, allowing our NP-led team to customize treatment intensity for optimal results with minimal downtime."
  },
  {
    "title": "Expert Assessment",
    "body": "We perform detailed skin analysis to determine the ideal energy settings and treatment pattern for your unique concerns, ensuring maximum efficacy while prioritizing your safety and comfort."
  },
  {
    "title": "Comprehensive Care",
    "body": "From pre-treatment numbing protocols to our medical-grade post-treatment skincare recommendations, we support your healing journey every step of the way with 2-week follow-up appointments."
  }
];

s.howItWorks = [
  {
    "title": "Plasma Creation",
    "body": "The Opus handpiece generates micro-plasma arcs that create controlled thermal zones in the skin. These precise microchannels trigger the body's natural healing response while preserving surrounding healthy tissue."
  },
  {
    "title": "Collagen Activation",
    "body": "Controlled thermal injury stimulates fibroblasts to produce new collagen and elastin fibers. The fractional pattern allows for faster healing while maximizing tissue remodeling over the following months."
  },
  {
    "title": "Progressive Renewal",
    "body": "As your skin heals, new collagen forms and existing fibers contract, resulting in smoother texture, improved tone, and visible tightening that continues to enhance over 3-6 months."
  }
];

s.candidates = {
  "good": [
    "Acne scars and textural irregularities",
    "Fine lines and wrinkles",
    "Sun damage and pigmentation",
    "Mild to moderate skin laxity",
    "Large pores and rough texture"
  ],
  "notIdeal": [
    "Active acne or skin infections",
    "Pregnancy or nursing",
    "Recent isotretinoin use (within 6 months)"
  ]
};

s.pricingMatrix = {
  "subtitle": "Opus Plasma pricing is customized based on treatment area and intensity level needed for your specific concerns.",
  "sections": [
    {
      "title": "Opus Plasma Treatments",
      "note": "Treatment areas and energy levels are customized during your consultation for optimal results.",
      "membershipCallout": "VIP Members save 10-15% on all treatments",
      "rows": [
        {
          "label": "Face (Full)",
          "subLabel": "Complete facial resurfacing and tightening",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        },
        {
          "label": "Targeted Areas",
          "subLabel": "Specific concerns like acne scars or wrinkles",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        }
      ],
      "promo": "Available exclusively at our Westfield location with Cherry financing options",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid sun exposure and tanning for 2 weeks prior to treatment",
      "Discontinue retinoids, acids, and exfoliating products 5-7 days before",
      "Arrive with clean skin - no makeup, lotions, or skincare products",
      "Take prescribed pain medication 30 minutes before treatment if recommended"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply recommended healing ointment to maintain moisture and promote healing",
      "Avoid direct sun exposure and wear SPF 30+ daily for at least 4 weeks",
      "Do not pick, scratch, or scrub treated areas during the healing process",
      "Avoid makeup for 24-48 hours or until skin has re-epithelialized",
      "Sleep with head elevated for first 2-3 nights to minimize swelling"
    ]
  }
};

s.flexEverything = {
  "intro": "Our Westfield team shares expert insights for maximizing your Opus Plasma results and comfort.",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule your treatment during cooler months when sun exposure is naturally limited. This protects your healing skin and allows for optimal collagen remodeling without UV interference."
    },
    {
      "heading": "Hydration Protocol",
      "body": "Begin drinking extra water 48 hours before treatment and continue throughout healing. Well-hydrated skin heals faster and shows more dramatic improvement in texture and tone."
    },
    {
      "heading": "Combination Benefits",
      "body": "Opus Plasma pairs exceptionally well with PRP treatments applied immediately post-procedure to accelerate healing and enhance collagen production for superior results."
    },
    {
      "heading": "Recovery Planning",
      "body": "Plan for 3-5 days of social downtime with bronzed, textured skin that gradually peels. The dramatic improvement in skin quality makes this brief recovery period worthwhile."
    }
  ]
};

s.faq = [
  {
    "q": "What is Opus Plasma and how does it work?",
    "a": "Opus Plasma by Alma is a fractional skin resurfacing device that uses plasma energy — not laser, not radiofrequency — to create precise micro-wounds in the skin. Plasma is the fourth state of matter, and Opus harnesses it to vaporize tiny columns of tissue, triggering a powerful healing and collagen remodeling response. The fractional pattern leaves surrounding tissue intact for faster recovery. It treats texture, fine lines, laxity, pores, and scars with adjustable intensity."
  },
  {
    "q": "How much does Opus Plasma cost at RELUXE?",
    "a": "Opus Plasma pricing at RELUXE varies based on the treatment area and the intensity level selected. Full-face treatments are most common, with targeted treatments available for specific areas. We offer package pricing for patients who benefit from multiple sessions. VIP Members save 10-15% on every treatment. Your provider will give you exact pricing during your free consultation based on your goals and recommended settings."
  },
  {
    "q": "Does Opus Plasma hurt?",
    "a": "We apply topical numbing cream for 30-45 minutes before Opus Plasma treatment. During the procedure, you'll feel heat and a prickling sensation. Comfort depends on the intensity setting — lighter settings are very tolerable (3-4 out of 10), while deeper settings may feel more intense (5-6 out of 10). Most patients find it very manageable with proper numbing. The treatment itself is quick, typically 20-30 minutes."
  },
  {
    "q": "How many Opus Plasma sessions do I need?",
    "a": "The number of sessions depends on your goals and the intensity level used. For lighter settings, a series of 2-3 sessions spaced 4-6 weeks apart is typical. At higher intensity settings, a single treatment may deliver significant results comparable to more aggressive lasers. Your RELUXE provider will recommend the optimal approach — sometimes fewer sessions at higher intensity, or more sessions at lighter settings for gradual improvement with less downtime."
  },
  {
    "q": "When will I see Opus Plasma results?",
    "a": "Initial improvement in skin texture and tone is visible once the skin heals — typically within 5-7 days for lighter settings. Collagen remodeling continues for 3-6 months after treatment, delivering progressive tightening, pore reduction, and textural improvement. Full results are usually apparent 2-3 months after your final session. Patients often notice their skin continuing to look better month after month."
  },
  {
    "q": "What is the downtime for Opus Plasma?",
    "a": "Opus Plasma's biggest advantage is adjustable downtime. Lighter settings involve 1-3 days of mild redness and roughness — you can often return to work the next day. Medium settings require 3-5 days of recovery with more visible peeling and redness. Deeper settings are closer to 5-7 days with significant peeling and pinkness. Your provider will help you choose the right intensity based on your goals and schedule."
  },
  {
    "q": "What does Opus Plasma treat?",
    "a": "Opus Plasma effectively treats fine lines and wrinkles, uneven skin texture, enlarged pores, mild to moderate skin laxity, acne scars, sun damage, and dull or rough skin. It's most commonly used on the face, neck, and chest. Its adjustable depth makes it versatile — light settings refresh the skin, while deeper settings address more significant concerns like scarring and deep wrinkles."
  },
  {
    "q": "How is Opus Plasma different from CO2 laser?",
    "a": "Both are fractional resurfacing treatments, but they use different energy sources. CO2 laser is ablative and delivers the most dramatic results in a single session, but requires 7-10+ days of significant downtime. Opus Plasma uses plasma energy with adjustable depth, allowing you to dial in your desired balance of results versus downtime. For patients who want meaningful resurfacing without committing to CO2-level recovery, Opus Plasma is an excellent alternative."
  },
  {
    "q": "Is Opus Plasma safe for all skin tones?",
    "a": "Opus Plasma has a favorable safety profile across a range of skin tones, though lighter skin tones generally carry the lowest risk of hyperpigmentation. For medium skin tones, we may use more conservative settings and specific pre- and post-treatment protocols. For darker skin tones, your RELUXE provider may recommend alternatives like ClearLift or Morpheus8 that carry less pigmentation risk. A thorough consultation ensures the safest approach for your skin."
  },
  {
    "q": "Who is a good candidate for Opus Plasma?",
    "a": "Opus Plasma is ideal for patients who want noticeable skin resurfacing — improved texture, tighter pores, fewer fine lines, and better overall tone — but prefer less downtime than CO2 laser. It's a great fit for patients with busy schedules who want real results with adjustable recovery time. You should avoid it if pregnant, nursing, on isotretinoin, have active skin infections, or have certain implanted devices."
  },
  {
    "q": "What are the side effects of Opus Plasma?",
    "a": "Common side effects include redness, swelling, a rough or sandpaper-like texture, and mild peeling during the healing phase — all of which are expected and resolve within days to a week depending on the treatment intensity. Temporary darkening of treated areas (bronzing) can occur. Rare risks include hyperpigmentation, prolonged redness, or infection. RELUXE's providers follow careful protocols under Medical Director oversight to minimize all risks."
  },
  {
    "q": "Can I combine Opus Plasma with other treatments?",
    "a": "Yes — Opus Plasma pairs well with many treatments. It's commonly combined with tox (Botox/Dysport) for expression lines, fillers for volume loss, and IPL for pigmentation. Many patients alternate Opus Plasma with gentler treatments like HydraFacial or ClearLift for ongoing maintenance. We typically space Opus 4-6 weeks from other energy-based treatments. Your RELUXE provider will design a comprehensive plan during your free consultation."
  }
];

export default s;
