// src/data/services/men.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('men');

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

s.tagline = "Refined aesthetics designed specifically for men";

s.seo = {
  "title": "Men's Aesthetic Services Westfield & Carmel IN | RELUXE",
  "description": "Botox, laser hair removal & body contouring for men in Westfield & Carmel. Natural results, expert care. Free consultation at RELUXE Med Spa."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "15-90 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "Minimal to none"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "3-14 days"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "3-12+ months"
  }
];

s.benefits = [
  "Reduces signs of aging while maintaining masculine features",
  "Eliminates unwanted body and facial hair permanently",
  "Builds muscle definition while reducing stubborn fat deposits",
  "Improves skin texture and reduces acne scarring",
  "Decreases excessive sweating in underarms, hands, and feet"
];

s.overview = {
  "p1": "Men's aesthetic treatments at RELUXE combine advanced medical technologies with a results-focused approach designed for masculine features and concerns. From neuromodulators like Botox and Dysport that reduce dynamic wrinkles and excessive sweating, to laser hair removal using advanced IPL technology for permanent reduction of unwanted body and facial hair, to body contouring with EvolveX radiofrequency that builds muscle while reducing fat. Our clinical-grade HydraFacials and chemical peels address men's typically thicker, oilier skin with deeper pore cleansing and targeted exfoliation.",
  "p2": "At RELUXE's Westfield and Carmel locations, our NP-led team understands that men prefer subtle, natural-looking results that enhance rather than feminize their features. Every treatment begins with a complimentary consultation to create a personalized plan, and our clinical environment ensures complete comfort and privacy. Our 2-week follow-up appointments ensure optimal results and address any questions about your treatment outcomes."
};

s.whyReluxe = [
  {
    "title": "Masculine Approach",
    "body": "Our injectors specialize in male anatomy, using techniques that preserve strong jawlines and masculine brow positions while achieving natural-looking results."
  },
  {
    "title": "Clinical Expertise",
    "body": "NP-led care with extensive experience treating male patients means understanding unique concerns like razor burn, ingrown hairs, and workplace discretion requirements."
  },
  {
    "title": "Comprehensive Solutions",
    "body": "From tox and laser hair removal to body sculpting and advanced skin treatments, we offer complete aesthetic solutions under one roof with consistent, expert care."
  }
];

s.howItWorks = [
  {
    "title": "Personal Consultation",
    "body": "Our medical providers assess your specific concerns, skin type, and aesthetic goals to create a customized treatment plan. We discuss realistic outcomes, timeline, and combination approaches for optimal results."
  },
  {
    "title": "Treatment Session",
    "body": "Precise application of chosen treatments using advanced techniques and technologies. Our team ensures comfort throughout while maintaining the highest safety and efficacy standards."
  },
  {
    "title": "Results & Follow-up",
    "body": "Results develop over days to weeks depending on the treatment. We provide detailed aftercare instructions and schedule follow-up appointments to monitor progress and optimize outcomes."
  }
];

s.candidates = {
  "good": [
    "Men seeking subtle, natural-looking improvements",
    "Professionals wanting to maintain a polished appearance",
    "Active individuals dealing with excessive sweating",
    "Those with unwanted facial or body hair",
    "Men with aging concerns but wanting to avoid obvious treatments"
  ],
  "notIdeal": [
    "Unrealistic expectations for dramatic changes",
    "Active skin infections or inflammatory conditions",
    "Recent use of blood thinners without medical clearance"
  ]
};

s.pricingMatrix = {
  "subtitle": "Investment varies by treatment type and areas addressed, with VIP Membership offering 10-15% savings on all services.",
  "sections": [
    {
      "title": "Most Popular Men's Treatments",
      "note": "These represent our most requested services for male patients",
      "membershipCallout": "VIP Members save 10-15% on all treatments",
      "rows": [
        {
          "label": "Botox/Dysport (Crow's feet & Forehead)",
          "subLabel": "Reduces dynamic wrinkles",
          "single": "Starting at $350",
          "membership": "Starting at $315"
        },
        {
          "label": "Laser Hair Removal (Face)",
          "subLabel": "6-session package",
          "single": "Starting at $450",
          "membership": "Starting at $405"
        },
        {
          "label": "HydraFacial",
          "subLabel": "Deep cleansing and extraction",
          "single": "$175",
          "membership": "$149"
        },
        {
          "label": "EvolveX Body Contouring",
          "subLabel": "Per treatment session",
          "single": "Starting at $400",
          "membership": "Starting at $350"
        }
      ],
      "promo": "Cherry financing available for treatments over $200",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid aspirin, ibuprofen, and alcohol 24 hours before injections",
      "Stop retinoids 3-5 days before chemical peels or laser treatments",
      "Shave treatment area for laser hair removal appointments",
      "Arrive with clean skin - no lotions, deodorants, or cologne on treatment areas"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Avoid rubbing or massaging treated areas for 4 hours post-injection",
      "Stay upright for 2-4 hours after neuromodulator treatments",
      "Apply ice packs for 10 minutes if swelling occurs",
      "Avoid intense exercise for 24 hours after injectables",
      "Use gentle, fragrance-free products for 48 hours after skin treatments"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for maximizing your aesthetic treatment results as a male patient.",
  "items": [
    {
      "heading": "Start Conservative",
      "body": "Men often achieve the best results with gradual improvements. Begin with smaller doses and build up over time for natural-looking enhancement."
    },
    {
      "heading": "Timing Matters",
      "body": "Schedule treatments 2-3 weeks before important events. This allows time for any minor swelling to resolve and results to fully develop."
    },
    {
      "heading": "Combination Approach",
      "body": "Pairing treatments like tox with professional skincare or laser hair removal with body contouring often produces superior, more comprehensive results."
    },
    {
      "heading": "Maintenance Schedule",
      "body": "Consistent treatment intervals every 3-4 months for tox and following recommended protocols for laser services maintain optimal long-term results."
    }
  ]
};

s.faq = [
  {
    "q": "What services does RELUXE offer for men?",
    "a": "RELUXE offers every service to men — nothing is off limits. Popular treatments for men include Botox and neurotoxins (forehead lines, crow's feet, frown lines), laser hair removal (back, chest, neck), facials and skin treatments, body contouring, chemical peels, and microneedling. Our providers are experienced in tailoring treatments specifically to male anatomy, skin, and aesthetic goals."
  },
  {
    "q": "Is Botox popular for men?",
    "a": "Absolutely — men are the fastest-growing demographic for Botox. At RELUXE, we see men of all ages looking to soften forehead lines, crow's feet, and the \"11s\" between the brows while keeping a strong, natural look. Male Botox dosing is typically higher because men have thicker, stronger facial muscles. Our injectors adjust technique and dosing specifically for masculine facial structure."
  },
  {
    "q": "What areas can men get laser hair removal?",
    "a": "Men commonly get laser hair removal on the back, shoulders, chest, abdomen, neck, and beard line. We also treat arms, legs, and other areas. Laser hair removal is a permanent reduction solution that eliminates the need for constant shaving, waxing, or dealing with ingrown hairs. Multiple sessions are needed for best results, and we customize settings for male hair density and skin type."
  },
  {
    "q": "Will treatments look obvious or overdone?",
    "a": "No. Our philosophy is \"you, just better\" — subtle, natural improvements that don't announce themselves. For men, that means smoothing lines without freezing expression, improving skin quality without looking \"done,\" and enhancing features while maintaining a masculine, natural appearance. No one will know you had anything done — they'll just think you look great."
  },
  {
    "q": "Is the environment at RELUXE comfortable for men?",
    "a": "Yes. RELUXE is a modern, professional med spa — not a day spa with pink robes. We provide a discreet, no-judgment environment where men feel completely comfortable. Many of our male patients tell us they were surprised by how relaxed and welcoming the experience was. You'll be treated by experienced providers who understand that men's aesthetic goals and preferences are unique."
  },
  {
    "q": "What facial treatments are best for men?",
    "a": "Men benefit from medical-grade facials (deep cleansing, extractions, hydration), chemical peels for sun damage and rough texture, microneedling (SkinPen) for acne scarring and skin renewal, and IPL for redness or sun spots. Men's skin is typically thicker and oilier, so we adjust products and protocols accordingly. A consultation will determine the best treatments based on your skin type and goals."
  },
  {
    "q": "Can men get body contouring at RELUXE?",
    "a": "Yes. Body contouring treatments like EvolveX are popular with men looking to tighten skin, reduce stubborn fat pockets, and build muscle definition in areas like the abdomen, flanks (love handles), and chest. These are non-invasive, no-downtime treatments that complement an active lifestyle. Many men use body contouring to target areas that don't respond to diet and exercise alone."
  },
  {
    "q": "How much do men's treatments cost at RELUXE?",
    "a": "Pricing for men is the same as for all patients — there's no upcharge for men's services. Botox starts with a foundation treatment at $280, and other services are priced by treatment type and area. VIP Members save 10-15% on all services. We provide exact pricing during your free consultation so you know the investment before committing to anything."
  },
  {
    "q": "Do many men come to RELUXE?",
    "a": "Yes — and the number is growing every year. Men make up an increasingly significant portion of our patient base. From executives wanting to look sharp and rested to active guys dealing with skin concerns or unwanted body hair, men of all backgrounds choose RELUXE for expert care in a comfortable setting. You'll be in good company."
  },
  {
    "q": "How do I get started as a male patient at RELUXE?",
    "a": "Start with a free consultation — either in person at our Westfield or Carmel location, or book online. Your provider will assess your goals, evaluate your skin and concerns, and create a straightforward treatment plan with transparent pricing. There's no pressure to commit to anything. Most men appreciate how easy and direct the process is from start to finish."
  }
];

export default s;
