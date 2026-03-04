// src/data/services/facial-balancing.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('facialbalancing');

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

s.tagline = "Proportional perfection through strategic filler artistry";

s.seo = {
  "title": "Facial Balancing Consultation Westfield IN | RELUXE Med Spa",
  "description": "Expert facial balancing with strategic dermal filler placement. Free consultation, multi-syringe discounts, NP-led treatments in Westfield & Carmel, IN."
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
    "value": "Minimal"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "Immediate"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "12-18 months"
  }
];

s.benefits = [
  "Mathematically harmonized facial proportions using golden ratio principles",
  "Strategic volume restoration across multiple facial regions in one session",
  "Correction of age-related volume loss and asymmetries",
  "Enhanced natural bone structure without over-filling",
  "Long-lasting results with optimized filler placement techniques"
];

s.overview = {
  "p1": "Facial balancing consultation is a comprehensive assessment and treatment planning process that analyzes facial proportions using the golden ratio and anatomical landmarks to create a strategic dermal filler roadmap. This approach uses multiple syringes of hyaluronic acid fillers (Juvederm, RHA, Restylane, Versa) placed strategically across different facial regions to restore volume loss, enhance natural contours, and create mathematical harmony between features. Rather than treating isolated areas, facial balancing addresses the face as a unified structure, correcting asymmetries and age-related changes through precise volumetric restoration.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, your facial balancing journey begins with a complimentary consultation where our nurse practitioners use advanced facial analysis techniques and 3D imaging to map your unique proportions. Our NP-led team develops a personalized multi-syringe treatment plan with transparent pricing, including our multi-syringe discount, and provides 2-week follow-up appointments to ensure optimal results and patient satisfaction."
};

s.whyReluxe = [
  {
    "title": "Proportion-Based Planning",
    "body": "Our nurse practitioners use mathematical facial analysis and golden ratio principles to create treatment plans that enhance your natural bone structure rather than following trends."
  },
  {
    "title": "Multi-Syringe Expertise",
    "body": "We strategically combine different filler types and viscosities in a single session, using Juvederm Ultra for lips, RHA for dynamic areas, and Restylane Lyft for cheek projection."
  },
  {
    "title": "Transparent Pricing",
    "body": "Free consultations with detailed treatment plans and automatic multi-syringe discounts ($100 off 2+ syringes) so you know exactly what to expect before treatment begins."
  }
];

s.howItWorks = [
  {
    "title": "Facial Analysis",
    "body": "Your provider performs detailed proportional measurements, identifying areas of volume loss, asymmetry, and structural imbalance. Digital imaging helps visualize potential outcomes and create your custom treatment map."
  },
  {
    "title": "Strategic Injection",
    "body": "Multiple filler types are placed in predetermined locations using cannulas and needles, starting with structural areas like cheeks and temples, then refining with precision injections to lips, tear troughs, and jawline."
  },
  {
    "title": "Immediate Assessment",
    "body": "Real-time evaluation ensures balanced results, with minor adjustments made during the session. Your provider photographs results and schedules your 2-week follow-up for any refinements needed."
  }
];

s.candidates = {
  "good": [
    "Age-related facial volume loss",
    "Facial asymmetries requiring correction",
    "Desire for comprehensive facial enhancement",
    "Previous filler experience seeking optimization",
    "Realistic expectations for natural-looking results"
  ],
  "notIdeal": [
    "Active facial infections or cold sores",
    "Pregnancy or breastfeeding",
    "Unrealistic expectations for dramatic transformation"
  ]
};

s.pricingMatrix = {
  "subtitle": "Facial balancing uses multiple syringes strategically with automatic multi-syringe savings",
  "sections": [
    {
      "title": "Facial Balancing Packages",
      "note": "Comprehensive treatment plans typically use 3-5 syringes across multiple facial areas",
      "membershipCallout": "VIP Members save 10-15% on all filler treatments",
      "rows": [
        {
          "label": "2-Syringe Package",
          "subLabel": "Foundation treatment with multi-syringe discount",
          "single": "Starting at $1,300",
          "membership": "Member pricing available"
        },
        {
          "label": "3-Syringe Package",
          "subLabel": "Comprehensive facial balancing treatment",
          "single": "Starting at $1,950",
          "membership": "Member pricing available"
        },
        {
          "label": "Custom Treatment Plan",
          "subLabel": "Personalized multi-area approach",
          "single": "Consult for pricing",
          "membership": "Member discounts apply"
        }
      ],
      "promo": "Free consultation included • $100 off 2+ syringes • Cherry financing available",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications, supplements (fish oil, vitamin E, aspirin) for 1 week",
      "Discontinue retinoids and exfoliating treatments 3 days prior",
      "Stay hydrated and avoid alcohol 24 hours before treatment",
      "Arrive with clean skin, no makeup or skincare products"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice for 10-15 minutes every hour for the first 4 hours to minimize swelling",
      "Sleep elevated for 2 nights and avoid lying face-down",
      "Avoid strenuous exercise, saunas, and facial massage for 24-48 hours",
      "Use gentle skincare products and avoid makeup for 12 hours",
      "Attend your 2-week follow-up appointment for optimal result assessment"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for achieving optimal facial balancing results from our experienced injectors",
  "items": [
    {
      "heading": "Staging Strategy",
      "body": "Consider dividing extensive facial balancing into 2 sessions spaced 4-6 weeks apart to allow tissues to settle and ensure natural-looking proportions without over-correction."
    },
    {
      "heading": "Filler Selection",
      "body": "Different facial areas require specific filler properties—we use firmer products like Restylane Lyft for cheek structure and softer RHA fillers for areas with natural movement."
    },
    {
      "heading": "Maintenance Timeline",
      "body": "Plan touch-up appointments 12-15 months after initial treatment, as strategic maintenance with 1-2 syringes preserves results better than waiting for complete dissolution."
    },
    {
      "heading": "Combination Benefits",
      "body": "Pair facial balancing with Botox for comprehensive rejuvenation—neurotoxins prevent muscle-related aging while fillers restore structural volume for optimal anti-aging results."
    }
  ]
};

s.faq = [
  {
    "q": "What is facial balancing?",
    "a": "Facial balancing is a strategic approach to dermal filler placement that enhances overall facial symmetry, proportion, and harmony rather than treating individual areas in isolation. By analyzing your unique bone structure, fat pads, and facial proportions, your provider places filler in complementary areas — such as cheeks, chin, jawline, lips, and temples — to create a naturally balanced, refreshed appearance. Think of it as architectural planning for your face."
  },
  {
    "q": "What areas can facial balancing treat?",
    "a": "Facial balancing can address the chin (projection and definition), jawline (contour and angularity), cheeks (volume and lift), lips (proportion and symmetry), temples (hollowing), under-eyes (dark circles and hollows), nasolabial folds, marionette lines, and the nose (liquid rhinoplasty for non-surgical reshaping). Not every patient needs all areas — your provider identifies which specific placements will create the most impactful improvement for your unique face."
  },
  {
    "q": "How much does facial balancing cost at RELUXE?",
    "a": "Facial balancing is priced per syringe of filler, and the total investment depends on how many areas are treated and how many syringes are needed. Some patients achieve beautiful results with 1-2 syringes in targeted areas, while a comprehensive facial balancing plan may involve 3-5+ syringes. VIP Members save 10-15% on all filler services. We provide a clear, itemized plan with exact pricing during your free consultation."
  },
  {
    "q": "How is facial balancing different from just getting filler?",
    "a": "Standard filler treatments often focus on a single concern — like adding volume to lips or filling a line. Facial balancing takes a holistic approach, considering how every area of the face relates to the others. For example, adding chin projection can make lips appear more proportional, or restoring cheek volume can reduce the appearance of nasolabial folds. It's about treating the big picture, not just individual areas."
  },
  {
    "q": "What is liquid rhinoplasty?",
    "a": "Liquid rhinoplasty is a non-surgical nose reshaping technique using dermal filler. It can smooth bumps on the bridge, refine the tip, improve symmetry, and create a straighter profile — all without surgery, general anesthesia, or significant downtime. Results are immediate and last 12-18 months. It's a popular facial balancing option for patients who want nose refinement without committing to surgical rhinoplasty."
  },
  {
    "q": "Does facial balancing look natural?",
    "a": "When done well, absolutely. The entire goal of facial balancing is to enhance your natural features — not to create an \"overdone\" or artificial look. Our injectors use an anatomy-first approach, placing conservative amounts of filler in strategic locations to improve proportion and harmony. The result should be that people notice you look great, but can't pinpoint exactly what changed. That's the mark of excellent facial balancing."
  },
  {
    "q": "Does facial balancing hurt?",
    "a": "Most dermal fillers contain built-in lidocaine (numbing agent), and we apply topical numbing cream and/or nerve blocks for sensitive areas. Most patients rate discomfort at 3-5 out of 10 depending on the area. Chin and jawline injections tend to be very tolerable, while lip filler is slightly more sensitive. The actual treatment involves a series of small injections and takes 30-60 minutes depending on the number of areas treated."
  },
  {
    "q": "How long do facial balancing results last?",
    "a": "Results vary by area and filler type. Cheek and midface filler typically lasts 12-18 months. Jawline and chin filler lasts 12-24 months. Lip filler lasts 6-12 months. Temple filler lasts 12-18 months. Liquid rhinoplasty results last 12-18 months. Many patients find that with consistent maintenance, they need less filler over time as the structural support is maintained."
  },
  {
    "q": "What is the downtime after facial balancing?",
    "a": "Most patients experience mild swelling and possible bruising that lasts 3-7 days depending on the areas treated. Lip and under-eye areas tend to swell more than chin or jawline. Swelling peaks at 24-48 hours and then resolves. Most patients return to work and social activities the next day, using concealer if needed. We provide detailed aftercare instructions to minimize downtime."
  },
  {
    "q": "Who is a good candidate for facial balancing?",
    "a": "Facial balancing is ideal for patients who feel their face looks \"off\" but can't pinpoint why, those who want to improve symmetry or proportions, patients with a recessed chin or weak jawline, people experiencing age-related volume loss in the midface and temples, and anyone who wants a comprehensive refresh. A free consultation at RELUXE will determine if facial balancing is the right approach for your goals."
  },
  {
    "q": "Can facial balancing be done in one session?",
    "a": "Yes — a full facial balancing plan can often be completed in a single session lasting 45-90 minutes. However, some patients prefer a phased approach, treating the highest-impact areas first and adding to their plan over subsequent visits. This allows you to adjust and appreciate each change before adding more. Your provider will recommend the approach that best fits your goals, comfort level, and budget."
  },
  {
    "q": "Can facial balancing results be reversed?",
    "a": "Yes. Because facial balancing uses hyaluronic acid (HA) fillers, any result can be adjusted or fully reversed using hyaluronidase (filler dissolver). This reversibility provides a safety net and is one of the advantages of HA fillers over surgical options. If you're ever unhappy with a result, we can dissolve and correct it. This is one reason we recommend HA fillers for most facial balancing patients."
  }
];

export default s;
