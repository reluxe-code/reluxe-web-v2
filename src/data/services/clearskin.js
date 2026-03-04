// src/data/services/clearskin.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('clearskin');

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

s.tagline = "Advanced laser technology for clearer skin without the downtime";

s.seo = {
  "title": "ClearSkin Acne Laser Treatment in Westfield, IN | RELUXE",
  "description": "FDA-cleared ClearSkin laser treats active acne & marks with dual wavelengths. Zero downtime acne treatment in Westfield, IN starting at $250."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "20-30 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "1-2 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Sessions Needed",
    "value": "4-6 treatments"
  }
];

s.benefits = [
  "Reduces active acne lesions and prevents new breakouts",
  "Minimizes post-inflammatory hyperpigmentation and red marks",
  "Controls excess oil production at the source",
  "Eliminates acne bacteria deep within pores",
  "Improves overall skin texture and clarity"
];

s.overview = {
  "p1": "ClearSkin is an advanced dual-wavelength laser system that combines 1320nm Nd:YAG and 532nm KTP wavelengths to target both active acne and post-inflammatory hyperpigmentation. The treatment works by delivering controlled thermal energy to sebaceous glands to reduce oil production while simultaneously targeting bacteria in pores, paired with built-in contact cooling for enhanced comfort. This FDA-cleared technology treats inflammatory acne, comedones, and acne-related discoloration in a single 20-30 minute session with minimal discomfort and no downtime.",
  "p2": "At RELUXE's Westfield location, our experienced nurse practitioners begin every ClearSkin treatment with a thorough skin analysis to customize laser parameters for your specific acne type and skin tone. You'll receive detailed aftercare instructions and a complimentary 2-week follow-up to monitor your progress and adjust your treatment plan as needed for optimal results."
};

s.whyReluxe = [
  {
    "title": "Expert Laser Precision",
    "body": "Our NP-led team customizes wavelength settings and treatment parameters based on your specific acne type, ensuring maximum efficacy while minimizing risk."
  },
  {
    "title": "Comprehensive Acne Plans",
    "body": "ClearSkin pairs beautifully with our medical-grade facials and SkinBetter Science acne products for accelerated clearing and long-term maintenance."
  },
  {
    "title": "Teen-Safe Technology",
    "body": "FDA-cleared for adolescent patients with built-in safety features, making it an ideal first-line acne treatment for younger patients seeking professional care."
  }
];

s.howItWorks = [
  {
    "title": "Skin Assessment",
    "body": "Your provider analyzes your acne type, distribution, and skin tone to determine optimal laser settings and create a personalized treatment protocol."
  },
  {
    "title": "Dual-Wavelength Treatment",
    "body": "The 1320nm wavelength targets sebaceous glands and bacteria while 532nm addresses pigmentation, with integrated cooling protecting the skin surface throughout."
  },
  {
    "title": "Recovery Protocol",
    "body": "You'll receive specific post-treatment skincare instructions and schedule your next session, typically spaced 2-4 weeks apart for optimal acne clearing."
  }
];

s.candidates = {
  "good": [
    "Active inflammatory acne (papules and pustules)",
    "Comedonal acne (blackheads and whiteheads)",
    "Post-acne hyperpigmentation and red marks",
    "Teen patients seeking safe professional treatment",
    "Adults with hormonal or stress-related breakouts"
  ],
  "notIdeal": [
    "Active skin infections or open wounds",
    "Recent isotretinoin use (within 6 months)",
    "Pregnancy or nursing"
  ]
};

s.pricingMatrix = {
  "subtitle": "ClearSkin pricing varies based on treatment area size and acne severity.",
  "sections": [
    {
      "title": "ClearSkin Acne Treatment",
      "note": "Available exclusively at our Westfield location with customized protocols for each patient.",
      "membershipCallout": "VIP Members save 10-15% on all laser treatments",
      "rows": [
        {
          "label": "Single ClearSkin Session",
          "subLabel": "Full face treatment for active acne",
          "single": "$250-400",
          "membership": "Starting at $225"
        }
      ],
      "promo": "Package pricing available for optimal results with 4-6 session protocols",
      "ctaText": "Book Acne Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Discontinue topical retinoids 3-5 days before treatment",
      "Avoid sun exposure and tanning for 2 weeks prior",
      "Remove all makeup and skincare products on treatment day",
      "Inform your provider of any recent acne medications or procedures"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply gentle, fragrance-free moisturizer as needed",
      "Use broad-spectrum SPF 30+ daily and avoid direct sun exposure",
      "Avoid harsh scrubs, retinoids, or active ingredients for 24-48 hours",
      "Do not pick or squeeze any treated areas during healing",
      "Continue prescribed acne regimen as directed by your provider"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize your ClearSkin results with these expert recommendations from our Westfield acne specialists.",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule treatments during lower-stress periods when possible, as cortisol levels can impact acne healing and treatment response."
    },
    {
      "heading": "Product Pairing",
      "body": "Combine ClearSkin with medical-grade salicylic acid cleansers and niacinamide serums for enhanced bacteria control and oil regulation."
    },
    {
      "heading": "Consistency Counts",
      "body": "Complete your full treatment series even if acne improves early—this prevents rebound breakouts and maintains long-term clarity."
    },
    {
      "heading": "Hydration Balance",
      "body": "Use lightweight, non-comedogenic moisturizers between sessions to maintain skin barrier function without clogging newly cleared pores."
    }
  ]
};

s.faq = [
  {
    "q": "What is ClearSkin and how does it work?",
    "a": "ClearSkin by Alma is a laser treatment specifically designed for active acne. It combines three technologies in one handpiece: vacuum suction to draw the skin closer to the energy source, sapphire contact cooling to protect the skin's surface, and laser energy that penetrates into the sebaceous glands to destroy acne-causing bacteria and reduce inflammation. This multi-action approach treats active breakouts while helping prevent future ones."
  },
  {
    "q": "How much does ClearSkin cost at RELUXE?",
    "a": "ClearSkin pricing at RELUXE is based on the treatment area. We offer series packages since acne treatment works best with multiple sessions, providing better value than individual treatments. VIP Members save 10-15% on every session. Your provider will assess your acne severity and create a treatment plan with transparent pricing during your free consultation."
  },
  {
    "q": "Does ClearSkin hurt?",
    "a": "ClearSkin is designed for comfort. The sapphire contact cooling tip protects and cools the skin's surface while laser energy works beneath. Most patients feel a mild warming sensation and slight suction pressure. The treatment is very tolerable — most patients rate it 2-3 out of 10. No numbing cream or anesthesia is required, and sessions are quick."
  },
  {
    "q": "How many ClearSkin sessions do I need?",
    "a": "A series of 6-8 sessions spaced 1-2 weeks apart is typically recommended for the best results. Some patients see noticeable improvement after just 2-3 sessions. Severe or persistent acne may benefit from additional treatments. Your RELUXE provider will assess your skin and customize a treatment plan based on the type and severity of your acne."
  },
  {
    "q": "When will I see ClearSkin results?",
    "a": "Many patients notice a reduction in active breakouts and inflammation within the first 2-3 sessions. Redness and swelling from existing acne often improves within days of each treatment. Full results — including fewer new breakouts, reduced redness, and smoother texture — become most apparent after completing the recommended series. Results continue to improve as inflammation calms."
  },
  {
    "q": "What is the downtime after ClearSkin?",
    "a": "ClearSkin has minimal to no downtime. You may experience mild redness or warmth in the treatment area for a few hours after your session. You can return to normal activities, apply makeup, and continue your skincare routine the same day. There's no peeling, crusting, or visible recovery period, making it easy to fit into your regular schedule."
  },
  {
    "q": "Is ClearSkin safe for teens?",
    "a": "Yes — ClearSkin is an excellent option for teens and adolescents with persistent acne. It's non-invasive, requires no oral medications (avoiding the side effects of antibiotics or isotretinoin), and has a strong safety profile. Many parents choose ClearSkin as an alternative or complement to topical treatments. We require a parent or guardian to be present for patients under 18 during consultation and treatment."
  },
  {
    "q": "How is ClearSkin different from other acne treatments?",
    "a": "Unlike topical creams that sit on the surface or oral medications that affect your entire body, ClearSkin delivers targeted laser energy directly to the source of acne — the sebaceous glands and bacteria beneath the skin. It treats active breakouts without drying or irritating the skin, and it can be combined with your existing skincare regimen. There's no purging phase like with retinoids."
  },
  {
    "q": "Who is a good candidate for ClearSkin?",
    "a": "ClearSkin is ideal for teens and adults with active inflammatory acne, persistent breakouts that haven't responded well to topical treatments, or patients who want to reduce their reliance on oral acne medications. It works on all skin types. You should avoid treatment if pregnant, have active cold sores in the area, or have certain photosensitivity conditions. A free consultation will determine if it's right for you."
  },
  {
    "q": "What are the side effects of ClearSkin?",
    "a": "Side effects are minimal and temporary. The most common include mild redness, slight warmth, and occasional minor swelling in the treatment area — all of which typically resolve within a few hours. There's no blistering, scarring, or prolonged irritation. ClearSkin's sapphire cooling system actively protects the skin's surface during treatment. Our providers customize settings under Medical Director oversight."
  },
  {
    "q": "Can ClearSkin treat acne scars?",
    "a": "ClearSkin is designed primarily for active acne — reducing breakouts, bacteria, and inflammation. For existing acne scars, RELUXE offers treatments like Morpheus8 (RF microneedling), Opus Plasma, CO2 laser resurfacing, or SkinPen microneedling that are specifically designed to remodel scar tissue. Many patients treat active acne with ClearSkin first, then address scarring with complementary treatments."
  },
  {
    "q": "Can I combine ClearSkin with other treatments?",
    "a": "Yes — ClearSkin works well as part of a comprehensive acne management plan. It can be combined with medical-grade skincare, chemical peels, and HydraFacial for enhanced results. For patients with both active acne and scarring, we often pair ClearSkin with Morpheus8 or SkinPen once breakouts are under control. Your provider at RELUXE will build a complete plan during your free consultation."
  }
];

export default s;
