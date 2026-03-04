// src/data/services/clearlift.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('clearlift');

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

s.tagline = "Zero downtime collagen remodeling for naturally refreshed skin";

s.seo = {
  "title": "ClearLift Laser in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Non-ablative ClearLift laser for collagen remodeling with zero downtime in Westfield & Carmel, Indiana. Expert care at RELUXE Med Spa."
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
    "value": "2-4 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "4-6 months"
  }
];

s.benefits = [
  "Stimulates deep collagen production without surface damage",
  "Reduces fine lines and improves skin texture gradually",
  "Minimizes pore appearance and evens skin tone",
  "Safe for all skin types including darker complexions",
  "Zero downtime with immediate return to activities"
];

s.overview = {
  "p1": "ClearLift is a non-ablative Q-switched Nd:YAG laser that uses 1064nm wavelength energy to stimulate deep dermal collagen remodeling without disrupting the skin's surface. This innovative \"laser toning\" technology delivers controlled thermal energy to the dermis, promoting natural collagen synthesis and cellular renewal to improve skin texture, reduce fine lines, minimize pore appearance, and create a brighter, more even complexion. The treatment requires no downtime and is often called the \"lunchtime laser\" due to its gentle approach that leaves skin immediately presentable.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our licensed providers customize ClearLift protocols based on your unique skin analysis and aesthetic goals during your complimentary consultation. We monitor your skin's response closely with our 2-week follow-up appointments, ensuring optimal results while maintaining the natural, refreshed appearance that defines the RELUXE philosophy."
};

s.whyReluxe = [
  {
    "title": "Customized Protocols",
    "body": "Our providers adjust laser parameters based on your Fitzpatrick skin type, specific concerns, and treatment goals for optimal safety and efficacy."
  },
  {
    "title": "Progress Tracking",
    "body": "We document your skin improvement with before/after photography and adjust treatment plans based on your individual response patterns."
  },
  {
    "title": "Combination Expertise",
    "body": "Our team expertly pairs ClearLift with complementary treatments like HydraFacials or medical-grade skincare for enhanced results."
  }
];

s.howItWorks = [
  {
    "title": "Skin Preparation",
    "body": "Your provider cleanses the treatment area and may apply a thin layer of ultrasound gel to optimize laser contact and comfort during the procedure."
  },
  {
    "title": "Laser Delivery",
    "body": "The Q-switched laser delivers precise 1064nm wavelength pulses that penetrate deep into the dermis, creating controlled thermal zones that stimulate collagen without affecting the epidermis."
  },
  {
    "title": "Immediate Recovery",
    "body": "You'll experience mild warmth during treatment with no visible signs afterward, allowing you to resume normal activities including makeup application immediately."
  }
];

s.candidates = {
  "good": [
    "Fine lines and early aging signs",
    "Uneven skin texture and tone",
    "Large or visible pores",
    "Dull or lackluster complexion",
    "Maintenance between aggressive treatments"
  ],
  "notIdeal": [
    "Active acne or skin infections",
    "Pregnancy or nursing",
    "Recent isotretinoin use (within 6 months)"
  ]
};

s.pricingMatrix = {
  "subtitle": "ClearLift pricing reflects the advanced Q-switched laser technology and customized treatment protocols.",
  "sections": [
    {
      "title": "ClearLift Laser Toning",
      "note": "Pricing varies based on treatment area size and specific skin concerns addressed during your session.",
      "membershipCallout": "VIP Members save 10-15% on all sessions",
      "rows": [
        {
          "label": "Single Session",
          "subLabel": "Face or neck treatment area",
          "single": "$300-400",
          "membership": "Starting at $255"
        }
      ],
      "promo": "Multiple session packages available for enhanced results and additional savings",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid sun exposure and tanning for 2 weeks prior",
      "Discontinue retinoids and exfoliating acids 3-5 days before",
      "Arrive with clean skin, free of makeup and skincare products",
      "Inform your provider of any recent cosmetic treatments or medications"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply broad-spectrum SPF 30+ sunscreen daily",
      "Use gentle, hydrating skincare products for 24-48 hours",
      "Avoid harsh exfoliants or retinoids for 2-3 days",
      "Stay hydrated to support the natural healing process",
      "Schedule follow-up sessions 3-4 weeks apart for optimal results"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your ClearLift results and treatment experience.",
  "items": [
    {
      "heading": "Optimal Timing",
      "body": "Schedule sessions 3-4 weeks apart to allow full collagen remodeling cycles between treatments, maximizing cumulative benefits."
    },
    {
      "heading": "Skincare Synergy",
      "body": "Pair with medical-grade vitamin C serums and peptides from our SkinBetter Science or SkinCeuticals lines to enhance collagen production."
    },
    {
      "heading": "Seasonal Strategy",
      "body": "ClearLift works year-round due to minimal photosensitivity, making it ideal for consistent maintenance through Indiana's changing seasons."
    },
    {
      "heading": "Combination Benefits",
      "body": "Layer with HydraFacials monthly to optimize penetration of growth factors and maintain hydration for enhanced laser results."
    }
  ]
};

s.faq = [
  {
    "q": "What is ClearLift and how does it work?",
    "a": "ClearLift by Alma is a non-ablative fractional laser that uses Q-switched Nd:YAG technology to deliver energy beneath the skin's surface without damaging the outer layer. Often called the \"lunchtime facelift,\" it creates controlled micro-injuries deep in the dermis to stimulate collagen and elastin production. This tightens skin, smooths fine lines, and improves texture and tone — all with zero visible downtime."
  },
  {
    "q": "How much does ClearLift cost at RELUXE?",
    "a": "ClearLift pricing at RELUXE depends on the treatment area and number of sessions. Because ClearLift works cumulatively, we recommend a series of treatments for best results and offer package pricing that provides significant savings. VIP Members save 10-15% on every session. Your provider will give you exact pricing during your free consultation."
  },
  {
    "q": "Does ClearLift hurt?",
    "a": "ClearLift is one of the most comfortable laser treatments available. Most patients feel only mild warmth or a slight tingling sensation during the procedure. Because it's non-ablative — meaning it doesn't break the skin's surface — no numbing cream or anesthesia is required. Most patients rate the sensation at 1-2 out of 10. You can truly get it done on your lunch break."
  },
  {
    "q": "How many ClearLift sessions do I need?",
    "a": "A series of 4-6 sessions spaced 2-4 weeks apart is the typical recommendation for optimal results. You'll notice gradual improvement after each session as collagen builds. Some patients with mild concerns see satisfactory results in as few as 3 sessions. Maintenance treatments every 3-6 months help sustain your results long-term."
  },
  {
    "q": "When will I see ClearLift results?",
    "a": "You may notice a subtle glow and smoother texture within a few days of your first session. However, ClearLift's real power is cumulative — collagen remodeling continues for 2-3 months after each treatment. Full results from a complete series become apparent 2-3 months after your final session. Each treatment compounds the improvement in firmness, tone, and texture."
  },
  {
    "q": "What is the downtime after ClearLift?",
    "a": "ClearLift has virtually zero downtime — that's why it's called the \"lunchtime facelift.\" Because the laser works beneath the skin's surface without breaking it, there's no visible wound, peeling, or redness that would keep you from your normal routine. You may experience very mild pinkness for an hour or two. You can apply makeup and return to all activities immediately after treatment."
  },
  {
    "q": "Is ClearLift safe for darker skin tones?",
    "a": "Yes — ClearLift is one of the safest laser treatments for all skin types, including darker skin tones (Fitzpatrick V-VI). Because it's non-ablative and works beneath the surface, the risk of post-inflammatory hyperpigmentation is significantly lower than with ablative lasers or IPL. This makes it an excellent option for patients who may not be candidates for other light-based treatments."
  },
  {
    "q": "What does ClearLift treat?",
    "a": "ClearLift effectively treats fine lines and wrinkles, uneven skin texture, mild skin laxity, enlarged pores, early signs of aging, dull or tired-looking skin, and mild sun damage. It's most commonly used on the face, neck, and decolletage. While it won't deliver the dramatic results of an ablative laser like CO2, it provides meaningful improvement with zero downtime."
  },
  {
    "q": "How is ClearLift different from CO2 or Opus Plasma?",
    "a": "ClearLift is a non-ablative laser — it works beneath the skin without damaging the surface, offering zero downtime but more gradual results over a series of treatments. CO2 is a fractional ablative laser that creates visible surface wounds for dramatic results but requires 5-10+ days of downtime. Opus Plasma falls between the two, with adjustable intensity. Your RELUXE provider will recommend the right option based on your goals and downtime tolerance."
  },
  {
    "q": "Who is a good candidate for ClearLift?",
    "a": "ClearLift is ideal for patients who want to improve skin texture, fine lines, and mild laxity but can't afford downtime. It's excellent for all skin types, including darker tones that may not be candidates for IPL or ablative lasers. It's also a great option for younger patients focused on prevention. You should avoid it if pregnant, have active infections, or have certain photosensitivity conditions."
  },
  {
    "q": "What are the side effects of ClearLift?",
    "a": "Side effects are extremely minimal. Some patients experience very mild redness or warmth that typically resolves within an hour. There's no peeling, scabbing, or visible recovery. Serious side effects are very rare with ClearLift due to its non-ablative nature. RELUXE's expert providers customize settings for your skin type to ensure safe, effective treatment under Medical Director oversight."
  },
  {
    "q": "Can I combine ClearLift with other treatments?",
    "a": "Yes — ClearLift combines beautifully with other treatments. It's commonly paired with IPL for comprehensive tone and texture correction, tox (Botox/Dysport) for dynamic wrinkles, fillers for volume loss, and medical-grade skincare for maintenance. Because there's no downtime, it's easy to fit ClearLift into a broader treatment plan. Your provider will design a customized regimen during your free consultation at RELUXE."
  }
];

export default s;
