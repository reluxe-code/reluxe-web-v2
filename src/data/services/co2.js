// src/data/services/co2.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('co2');

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

s.tagline = "Transform damaged skin with precision CO₂ laser technology";

s.seo = {
  "title": "CO₂ Laser Resurfacing Westfield IN | RELUXE Med Spa",
  "description": "Dramatic skin renewal with fractional CO₂ resurfacing at RELUXE Westfield. Deep wrinkles, scars & sun damage. Expert NP-led care."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "60-90 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "7-14 days"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "4-6 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "2-5 years"
  }
];

s.benefits = [
  "Dramatic reduction in deep wrinkles and expression lines",
  "Significant improvement in acne scarring and textural irregularities",
  "Reversal of severe photodamage and age spots",
  "Tightening of loose, crepey skin through collagen contraction",
  "Long-lasting results with continued improvement over 12 months"
];

s.overview = {
  "p1": "CO₂ resurfacing uses fractional carbon dioxide laser technology to create controlled thermal zones deep in the dermis, triggering collagen remodeling and cellular renewal. This ablative treatment vaporizes damaged skin tissue while leaving surrounding areas intact, promoting rapid healing and dramatic improvement in deep wrinkles, severe sun damage, acne scarring, and uneven texture. The fractional approach delivers precise energy columns that penetrate up to 1.5mm deep, stimulating new collagen production for up to 12 months post-treatment.",
  "p2": "At RELUXE's Westfield location, our nurse practitioner-led team provides comprehensive CO₂ consultations to determine optimal depth and coverage for your skin goals. We utilize advanced cooling techniques and pain management protocols to maximize comfort during treatment, with detailed 2-week follow-up appointments to monitor healing and optimize results."
};

s.whyReluxe = [
  {
    "title": "NP-Led Expertise",
    "body": "Our nurse practitioners have extensive training in ablative laser protocols, ensuring precise depth control and optimal healing outcomes for Indiana patients."
  },
  {
    "title": "Premium Technology",
    "body": "We use the latest fractional CO₂ systems with variable pulse duration and pattern density for customized treatment intensity."
  },
  {
    "title": "Comprehensive Aftercare",
    "body": "Detailed healing protocols with medical-grade recovery products and scheduled follow-ups to ensure optimal results and minimize complications."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Planning",
    "body": "Comprehensive skin analysis determines optimal laser settings, treatment depth, and coverage area based on your specific concerns and skin type."
  },
  {
    "title": "Laser Treatment",
    "body": "Fractional CO₂ energy creates microscopic treatment zones, vaporizing damaged tissue while preserving surrounding healthy skin for faster healing."
  },
  {
    "title": "Collagen Renewal",
    "body": "Thermal injury triggers extensive collagen remodeling and new tissue formation, with continued improvement visible for up to one year post-treatment."
  }
];

s.candidates = {
  "good": [
    "Deep wrinkles and expression lines",
    "Severe sun damage and age spots",
    "Acne scarring and textural irregularities",
    "Loose, aging skin needing tightening",
    "Patients committed to proper aftercare"
  ],
  "notIdeal": [
    "Active acne or skin infections",
    "Recent isotretinoin use (within 12 months)",
    "Darker skin tones (Fitzpatrick IV-VI)"
  ]
};

s.pricingMatrix = {
  "subtitle": "Investment reflects the advanced technology and dramatic results of ablative laser resurfacing",
  "sections": [
    {
      "title": "CO₂ Fractional Resurfacing",
      "note": "Pricing varies based on treatment area size and depth requirements",
      "membershipCallout": "VIP Members save 10-15% on all laser treatments",
      "rows": [
        {
          "label": "Face (Full)",
          "subLabel": "Complete facial resurfacing",
          "single": "$2,200-2,500",
          "membership": "$1,980-2,250"
        },
        {
          "label": "Face (Partial)",
          "subLabel": "Targeted areas or lighter coverage",
          "single": "$1,500-2,000",
          "membership": "$1,350-1,800"
        }
      ],
      "promo": "Available only at our Westfield flagship location",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Discontinue retinoids and exfoliating acids 1 week prior",
      "Begin antiviral medication if history of cold sores",
      "Avoid sun exposure and self-tanning for 4 weeks",
      "Arrange 7-10 days off work for healing time"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply prescribed healing ointment every 2-3 hours for first 48 hours",
      "Avoid water contact on treated area for 24-48 hours",
      "Sleep elevated and avoid strenuous activity for 1 week",
      "Strict sun avoidance with SPF 30+ for 6 months minimum",
      "Follow prescribed skincare regimen with medical-grade products only"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for optimal CO₂ resurfacing outcomes and recovery",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule treatment during cooler months when sun exposure is naturally limited, allowing optimal healing without UV interference."
    },
    {
      "heading": "Healing Optimization",
      "body": "Pre-treatment skin conditioning with medical-grade products accelerates recovery and enhances final results significantly."
    },
    {
      "heading": "Realistic Expectations",
      "body": "Peak results appear 3-6 months post-treatment as new collagen matures, with continued improvement for up to one year."
    },
    {
      "heading": "Combination Approach",
      "body": "Pairing with PRP during treatment and Sculptra 3 months later maximizes collagen stimulation for superior anti-aging outcomes."
    }
  ]
};

s.faq = [
  {
    "q": "What is CO2 laser resurfacing and how does it work?",
    "a": "CO2 laser resurfacing (using the Solaria by Alma) is a fractional ablative laser — considered the gold standard for deep skin resurfacing. It creates thousands of microscopic channels in the skin, vaporizing damaged tissue layer by layer while triggering a powerful collagen remodeling response. The \"fractional\" approach treats a fraction of the skin at a time, leaving surrounding tissue intact for faster healing. It delivers the most dramatic results of any single skin treatment."
  },
  {
    "q": "How much does CO2 laser resurfacing cost at RELUXE?",
    "a": "CO2 laser resurfacing at RELUXE is priced based on the treatment area and extent of resurfacing. Full-face treatments are the most common, with targeted treatments (around the eyes or mouth) available at lower price points. Because CO2 delivers such dramatic results, many patients achieve their goals in a single session. VIP Members save 10-15%. Exact pricing is provided during your free consultation."
  },
  {
    "q": "Does CO2 laser resurfacing hurt?",
    "a": "We take comfort seriously with CO2 resurfacing. Strong topical numbing cream is applied for 45-60 minutes before treatment, and we may use local anesthesia for sensitive areas. During the procedure, you'll feel heat and a stinging sensation, but it's very manageable with proper numbing. Most patients rate it 4-6 out of 10. The treatment itself is relatively quick — typically 30-45 minutes for a full face."
  },
  {
    "q": "What does CO2 laser treat?",
    "a": "CO2 laser resurfacing treats deep wrinkles and fine lines, severe sun damage and photodamage, acne scars, surgical scars, uneven skin texture and tone, age spots and hyperpigmentation, skin laxity, and enlarged pores. It's the most powerful option for patients who want transformative results. It's most commonly performed on the full face, but can also target specific areas like the perioral (around the mouth) or periorbital (around the eyes) region."
  },
  {
    "q": "How many CO2 laser sessions do I need?",
    "a": "One of the biggest advantages of CO2 laser resurfacing is that most patients achieve dramatic results with just a single treatment. This sets it apart from gentler lasers that require a series. For very deep scars or extensive sun damage, a second session 6-12 months later may be recommended. Many patients return every 2-5 years for a maintenance treatment as natural aging continues."
  },
  {
    "q": "What is the downtime for CO2 laser resurfacing?",
    "a": "CO2 laser resurfacing has the most significant downtime of any treatment at RELUXE — plan for 7-10 days of social downtime minimum. The skin will be raw and weeping for the first 3-5 days, requiring diligent wound care (ointment, gentle cleansing). Redness gradually fades over 2-4 weeks, and residual pinkness can last 1-3 months. Most patients take 5-7 days off work. The dramatic results are well worth the recovery."
  },
  {
    "q": "When will I see CO2 laser results?",
    "a": "Once the initial healing is complete (7-14 days), you'll already see noticeably smoother, tighter, more even skin. Results continue to improve dramatically over 3-6 months as deep collagen remodeling occurs. The full transformation — including scar improvement and skin tightening — is typically visible at the 3-6 month mark. Many patients describe it as taking years off their appearance."
  },
  {
    "q": "How is CO2 laser different from Opus Plasma or ClearLift?",
    "a": "CO2 is the most aggressive option — a fractional ablative laser that delivers the most dramatic results but requires the most downtime (7-10+ days). Opus Plasma uses fractional plasma technology with adjustable depth, offering a middle ground with 3-7 days of downtime. ClearLift is non-ablative with zero downtime but delivers more subtle, gradual results. Your RELUXE provider will recommend the right treatment based on your goals, concerns, and available downtime."
  },
  {
    "q": "Who is a good candidate for CO2 laser resurfacing?",
    "a": "CO2 resurfacing is ideal for patients with deep wrinkles, significant sun damage, acne scars, or skin laxity who want the most dramatic improvement possible and can commit to 7-10+ days of downtime. It works best on lighter skin tones (Fitzpatrick I-III). Darker skin tones have a higher risk of hyperpigmentation — we may recommend Opus Plasma or Morpheus8 as alternatives. You should avoid CO2 if pregnant, on isotretinoin, or have active skin infections."
  },
  {
    "q": "What are the side effects of CO2 laser resurfacing?",
    "a": "Expected effects include redness, swelling, oozing, and crusting during the first week of healing — this is a normal part of the recovery process. Redness can persist for several weeks to months. Risks include hyperpigmentation (more common in darker skin tones), hypopigmentation, infection, and scarring, though these are rare with proper technique and aftercare. RELUXE provides detailed aftercare instructions and follow-up appointments to ensure optimal healing."
  },
  {
    "q": "How do I prepare for CO2 laser resurfacing?",
    "a": "Preparation is important for safe, effective CO2 treatment. Your provider may prescribe antiviral medication to prevent cold sore outbreaks during healing. You'll need to avoid retinoids for 7-10 days prior, discontinue certain medications, and avoid sun exposure for 2-4 weeks before treatment. Plan your downtime in advance — stock up on gentle cleansers, healing ointment, and SPF. Your provider gives you a complete prep guide at your consultation."
  },
  {
    "q": "Can I combine CO2 laser with other treatments?",
    "a": "CO2 laser resurfacing is typically performed as a standalone treatment due to its intensity. After full healing (6-8 weeks minimum), it pairs beautifully with tox (Botox/Dysport), fillers for volume, IPL for maintenance, and medical-grade skincare to protect and maintain your results. Many patients find that CO2 resurfacing creates the ideal canvas for other treatments. Your RELUXE provider will design a long-term plan."
  }
];

export default s;
