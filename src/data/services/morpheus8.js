// src/data/services/morpheus8.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('morpheus8');

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

s.tagline = "Deep radiofrequency microneedling for comprehensive skin remodeling";

s.seo = {
  "title": "Morpheus8 RF Microneedling Westfield & Carmel | RELUXE",
  "description": "Morpheus8 radiofrequency microneedling for deep skin remodeling and tightening. Expert treatments in Westfield & Carmel, IN."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "90 min with numbing"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "1–3 days"
  },
  {
    "iconKey": "user",
    "label": "Suggested Series",
    "value": "3 sessions"
  },
  {
    "iconKey": "fire",
    "label": "Results",
    "value": "Peaks at ~12 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Benefit",
    "value": "Firms laxity"
  },
  {
    "iconKey": "fire",
    "label": "Benefit",
    "value": "Improves acne scars"
  },
  {
    "iconKey": "fire",
    "label": "Benefit",
    "value": "Refines pores & texture"
  },
  {
    "iconKey": "fire",
    "label": "Benefit",
    "value": "Stimulates collagen"
  }
];

s.benefits = [
  "Firms laxity",
  "Improves acne scars",
  "Refines pores & texture",
  "Stimulates collagen"
];

s.overview = {
  "p1": "Morpheus8 combines radiofrequency energy with precision microneedling to target the deeper layers of skin and subdermal tissue, reaching depths of up to 4mm. The gold-plated microneedles deliver controlled RF energy directly into the dermis and subcutaneous layers, stimulating collagen and elastin production while remodeling fat cells for comprehensive skin tightening and contouring. This fractional treatment helps address skin laxity, fine lines, acne scars, and uneven texture on both face and body, with the RF energy creating controlled thermal zones that trigger the body's natural healing response.",
  "p2": "At RELUXE's Westfield and Carmel locations, your Morpheus8 treatment begins with a comprehensive consultation and topical numbing for optimal comfort. Our experienced providers customize needle depths and energy levels based on your specific concerns and skin type, ensuring precise treatment delivery. We provide thorough aftercare guidance and schedule your 2-week follow-up to monitor healing and plan your treatment series."
};

s.whyReluxe = [
  {
    "title": "Customized Needle Depths",
    "body": "Our providers adjust microneedle penetration from 1-4mm and RF energy levels based on your individual skin concerns and treatment areas for optimal results."
  },
  {
    "title": "Comprehensive Numbing Protocol",
    "body": "We use topical anesthetics and cooling techniques to maximize your comfort during this deeper microneedling treatment."
  },
  {
    "title": "Strategic Treatment Planning",
    "body": "Your provider maps out a complete series plan, often combining Morpheus8 with complementary treatments like CO2 laser or dermal fillers for enhanced facial rejuvenation."
  }
];

s.howItWorks = [
  {
    "title": "Mapping & Numbing",
    "body": "Topical numbing for comfort; we map depths per zone."
  },
  {
    "title": "Fractional RF Delivery",
    "body": "Energy delivered at precise depths to stimulate remodeling."
  },
  {
    "title": "Recovery & Plan",
    "body": "Expect pinkness 1–3 days; results build over weeks."
  }
];

s.candidates = {
  "good": [
    "Texture & pores",
    "Mild–moderate laxity",
    "Acne scarring",
    "Neck & jawline refinement"
  ],
  "notIdeal": [
    "Active acne flare",
    "Open wounds",
    "Recent isotretinoin—consult first"
  ]
};

s.pricingMatrix = {
  "subtitle": "Morpheus8 pricing varies by treatment area size and depth requirements",
  "sections": [
    {
      "title": "Morpheus8 Pricing",
      "note": "Pricing varies based on treatment area size and number of passes required",
      "membershipCallout": "VIP Members save 10-15% on all sessions",
      "rows": [
        {
          "label": "Single Session",
          "subLabel": "Face, neck, or targeted body area",
          "single": "$900-$1,000",
          "membership": "$810-$900"
        },
        {
          "label": "3-Session Series",
          "subLabel": "Recommended treatment protocol",
          "single": "$2,400-$3,000",
          "membership": "$2,160-$2,700"
        }
      ],
      "promo": "Cherry financing available for treatment series",
      "ctaText": "Book Morpheus8 Consult"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid retinoids, AHAs, and BHAs for 3-5 days prior to treatment",
      "Discontinue blood-thinning medications or supplements if cleared by your physician",
      "Stay hydrated and arrive with clean, makeup-free skin",
      "Avoid excessive sun exposure for one week before treatment"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply recommended healing serums and keep skin moisturized for optimal recovery",
      "Avoid direct sun exposure and use SPF 30+ sunscreen daily for 2 weeks",
      "Do not use active skincare ingredients (retinoids, acids) for 5-7 days post-treatment",
      "Expect mild swelling and redness for 2-3 days, with possible pinpoint bleeding initially",
      "Schedule your next session 4-6 weeks apart for optimal collagen remodeling"
    ]
  }
};

s.flexEverything = {
  "intro": "Customization by depth and energy makes Morpheus8 versatile and effective.",
  "items": [
    {
      "heading": "Zone-specific depths",
      "body": "Cheeks vs. jawline vs. neck—each tuned for safety & results."
    },
    {
      "heading": "Scar protocols",
      "body": "Layered passes + spacing for remodeling without bulk heat."
    },
    {
      "heading": "Downtime minimization",
      "body": "Cooling and barrier support speed recovery."
    },
    {
      "heading": "Stacking strategy",
      "body": "Pair with tox or IPL after 2–4 weeks for synergy."
    }
  ]
};

s.faq = [
  {
    "q": "What is Morpheus8 and how does it work?",
    "a": "Morpheus8 is an FDA-cleared fractional radiofrequency (RF) microneedling device that combines tiny needles with heat energy to remodel collagen deep within the skin. It tightens, smooths, and resurfaces from the inside out — treating wrinkles, acne scars, skin laxity, and uneven texture. It's one of the most effective non-surgical skin tightening treatments available."
  },
  {
    "q": "How much does Morpheus8 cost at RELUXE?",
    "a": "A single Morpheus8 session at RELUXE starts at $1,000, with packages of 3 sessions available at $3,000. VIP Members receive additional savings. Most patients see optimal results with a series of 3 treatments spaced 4-6 weeks apart. We discuss pricing and package options during your free consultation."
  },
  {
    "q": "Does Morpheus8 hurt?",
    "a": "We apply strong topical numbing cream for 30-45 minutes before treatment, so most patients feel only pressure and warmth during the procedure. Comfort levels are very manageable — most patients rate it around 4-5 out of 10. We adjust depth and energy settings based on your comfort and treatment area."
  },
  {
    "q": "How many Morpheus8 sessions do I need?",
    "a": "A series of 3 sessions spaced 4-6 weeks apart is the standard recommendation for most goals. Deep acne scarring or significant skin laxity may benefit from additional sessions. Many patients do a maintenance session every 6-12 months after their initial series to preserve results."
  },
  {
    "q": "When will I see Morpheus8 results?",
    "a": "You'll notice an immediate \"glow\" and skin tightening within 1-2 weeks. However, the real transformation happens over 3-6 months as your body builds new collagen. Results continue to improve for up to 12 weeks after your final session. Each treatment in the series compounds the results."
  },
  {
    "q": "What is the downtime for Morpheus8?",
    "a": "Expect 2-4 days of redness, mild swelling, and tiny pinpoint marks (like a mild sunburn). Most patients are comfortable in public by day 3-4 with makeup. You can return to work the next day if comfortable. Avoid direct sun, heavy exercise, and active skincare (retinol, acids) for 5-7 days."
  },
  {
    "q": "Is Morpheus8 safe for all skin tones?",
    "a": "Yes — Morpheus8 is one of the safest energy-based treatments for all skin types and tones, including darker skin. Because the RF energy is delivered through microneedles beneath the surface, the risk of hyperpigmentation is much lower than with lasers. We customize depth and energy settings for each patient."
  },
  {
    "q": "What areas can Morpheus8 treat?",
    "a": "Morpheus8 treats the face (cheeks, jawline, forehead), under-chin/neck, and body areas including abdomen, thighs, and arms. It's excellent for jowls, acne scars, enlarged pores, stretch marks, and overall skin tightening. The depth and energy can be adjusted for each treatment zone."
  },
  {
    "q": "How is Morpheus8 different from regular microneedling?",
    "a": "Traditional microneedling (like SkinPen) creates surface-level micro-channels to stimulate collagen. Morpheus8 goes deeper — its insulated needles deliver radiofrequency energy 1-4mm into the skin, heating the deeper layers to remodel fat and tighten tissue. The results are significantly more dramatic for skin laxity and contouring."
  },
  {
    "q": "Can I combine Morpheus8 with other treatments?",
    "a": "Yes — Morpheus8 pairs well with tox (Botox/Dysport) for dynamic lines, dermal fillers for volume, and IPL for sun damage and discoloration. We typically recommend waiting 2-4 weeks between Morpheus8 and other treatments. Your provider will design a comprehensive plan that addresses all your concerns."
  },
  {
    "q": "Who is a good candidate for Morpheus8?",
    "a": "Morpheus8 is ideal for adults concerned about skin laxity, fine lines, acne scars, enlarged pores, stretch marks, or overall skin texture. It's a great option for patients who want significant improvement without surgery. You should avoid it if pregnant, nursing, have active skin infections, or have certain implanted devices."
  },
  {
    "q": "How long do Morpheus8 results last?",
    "a": "Results from a full series of 3 treatments typically last 1-3 years, depending on your skin, age, and lifestyle. The collagen remodeling is long-lasting, but natural aging continues. Most patients maintain their results with a single touch-up session every 6-12 months."
  }
];

s.resultsGallery = [
  {
    "src": "/images/results/m8/injector.hannah - 28.png",
    "alt": "Forehead lines before/after – smoother after 2 weeks"
  },
  {
    "src": "/images/results/m8/injector.krista - 01.png",
    "alt": "Forehead lines before/after – smoother after 2 weeks"
  },
  {
    "src": "/images/results/m8/injector.hannah - 29.png",
    "alt": "Forehead lines before/after – smoother after 2 weeks"
  }
];

export default s;
