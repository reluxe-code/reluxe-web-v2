// src/data/services/skiniq.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('skiniq');

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

s.tagline = "See beneath the surface. Plan smarter.";

s.seo = {
  "title": "3D Skin Analysis in Westfield & Carmel | RELUXE Med Spa",
  "description": "Advanced Skin IQ 3D analysis reveals subsurface damage & creates personalized treatment plans. Expert consultation in Westfield & Carmel, IN."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Analysis Time",
    "value": "15-20 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Preparation",
    "value": "None required"
  },
  {
    "iconKey": "user",
    "label": "Results",
    "value": "Immediate"
  },
  {
    "iconKey": "fire",
    "label": "Frequency",
    "value": "Every 6-12 months"
  }
];

s.benefits = [
  "Reveals subsurface UV damage and pigmentation before it becomes visible",
  "Identifies optimal treatment candidates for specific laser and skincare protocols",
  "Provides objective measurements to track treatment progress over time",
  "Predicts future skin concerns to enable preventive intervention strategies",
  "Creates personalized product recommendations based on actual skin analysis data"
];

s.overview = {
  "p1": "REVEAL 3D Skin Analysis utilizes multi-spectral imaging technology to capture and analyze skin beneath the surface, measuring pigmentation, pore structure, UV damage, inflammation, and texture irregularities invisible to the naked eye. This advanced diagnostic system creates a comprehensive map of your skin's current condition and predicts future concerns, enabling precise treatment planning tailored to your unique skin profile. The analysis takes detailed photographs under standard, cross-polarized, and UV light to reveal subsurface damage, melasma patterns, and vascular concerns that may not yet be visible on the surface.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, your Skin IQ analysis is conducted by our expert providers who interpret results within the context of your aesthetic goals and lifestyle. We use this detailed skin mapping to create personalized treatment protocols combining our advanced services like Morpheus8, IPL, and medical-grade skincare regimens for optimal results that address your skin's specific needs."
};

s.whyReluxe = [
  {
    "title": "Expert Analysis",
    "body": "Our NP-led team interprets your 3D results to create comprehensive treatment plans that prioritize your most pressing concerns while building long-term skin health."
  },
  {
    "title": "Integrated Planning",
    "body": "We seamlessly connect your Skin IQ results with our full range of treatments, from injectables to laser services, ensuring every recommendation works synergistically."
  },
  {
    "title": "Progress Tracking",
    "body": "Regular reassessments allow us to document improvement and adjust protocols, providing measurable proof of your investment in professional skincare."
  }
];

s.howItWorks = [
  {
    "title": "Image Capture",
    "body": "Advanced cameras capture your skin under multiple lighting conditions including standard, polarized, and UV light to reveal surface and subsurface conditions. The entire face is photographed from multiple angles for comprehensive analysis."
  },
  {
    "title": "Analysis Processing",
    "body": "Proprietary algorithms analyze texture, pigmentation, pore structure, wrinkles, UV spots, and vascular patterns, comparing your results to age-matched databases. The system generates detailed reports with specific measurements and severity scores."
  },
  {
    "title": "Treatment Planning",
    "body": "Our providers review your results and discuss findings, creating prioritized treatment recommendations that address your primary concerns while building comprehensive skin health strategies."
  }
];

s.candidates = {
  "good": [
    "Anyone seeking objective skin assessment and treatment planning",
    "Patients with sun damage, melasma, or uneven pigmentation concerns",
    "Individuals planning laser treatments or advanced skincare regimens",
    "Those wanting to track treatment progress with measurable data",
    "Clients interested in preventive skincare and anti-aging strategies"
  ],
  "notIdeal": [
    "Patients with active skin infections or open wounds",
    "Those unable to remain still during photography",
    "Individuals with unrealistic expectations about instant visible changes"
  ]
};

s.pricingMatrix = {
  "subtitle": "Comprehensive skin analysis with personalized treatment planning",
  "sections": [
    {
      "title": "Skin IQ Analysis",
      "note": "Investment in detailed skin assessment and customized treatment planning",
      "membershipCallout": "VIP Members save on analysis and recommended treatments",
      "rows": [
        {
          "label": "Complete 3D Analysis",
          "subLabel": "Full face assessment with treatment recommendations",
          "single": "Consult for pricing",
          "membership": "Member discounts apply"
        }
      ],
      "promo": "Often complimentary when bundled with treatment packages",
      "ctaText": "Schedule Analysis"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your analysis",
    "points": [
      "Arrive with clean skin - no makeup, moisturizer, or skincare products",
      "Avoid self-tanning products for at least one week prior",
      "Remove contact lenses if wearing them for accurate eye area assessment",
      "Bring a list of current skincare products and treatments for comprehensive consultation"
    ]
  },
  "after": {
    "title": "After your analysis",
    "points": [
      "Review your detailed results report and treatment recommendations with our team",
      "Schedule recommended treatments based on priority and your timeline preferences",
      "Begin any suggested skincare regimen changes gradually to avoid irritation",
      "Plan follow-up analysis in 6-12 months to track progress and adjust protocols",
      "Take advantage of member pricing on recommended treatments and products"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize the value of your Skin IQ analysis with expert strategies from our providers:",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule your analysis before starting any new treatments to establish baseline measurements. This allows for accurate progress tracking and protocol adjustments."
    },
    {
      "heading": "Seasonal Planning",
      "body": "Spring and fall analyses help adjust protocols for seasonal changes in skin behavior and prepare for upcoming sun exposure or indoor heating effects."
    },
    {
      "heading": "Treatment Sequencing",
      "body": "Use results to prioritize treatments logically - address pigmentation before texture, or combine complementary modalities like IPL with medical-grade skincare for enhanced outcomes."
    },
    {
      "heading": "Investment Strategy",
      "body": "Bundle analysis with treatment packages for cost savings, and consider VIP membership for ongoing discounts on recommended protocols and products."
    }
  ]
};

s.faq = [
  {
    "q": "What is Skin IQ Analysis?",
    "a": "Skin IQ is an AI-powered skin assessment tool that evaluates your skin's current condition across multiple dimensions including hydration levels, oiliness, pore size, spots and pigmentation, wrinkles, and skin firmness. It uses advanced imaging and artificial intelligence to generate a detailed skin profile and personalized treatment and skincare recommendations — all in just a few minutes with no discomfort whatsoever."
  },
  {
    "q": "How much does a Skin IQ Analysis cost?",
    "a": "Skin IQ Analysis is complimentary at RELUXE. We offer it as a free service because we believe everyone deserves to understand their skin before investing in treatments or products. It's available during consultations, as a standalone visit, or as an add-on to any appointment. VIP Members can request a Skin IQ assessment at any visit."
  },
  {
    "q": "How does the Skin IQ assessment work?",
    "a": "The process is quick and simple. The Skin IQ system captures images of your skin and uses AI algorithms to analyze hydration, oil production, pore size, pigmentation, fine lines, and elasticity. Within minutes, it generates a comprehensive report with scores for each category and identifies your primary skin concerns. Your provider then reviews the results with you and recommends targeted treatments and products."
  },
  {
    "q": "What does Skin IQ measure?",
    "a": "Skin IQ evaluates six key skin parameters: hydration (moisture levels), oiliness (sebum production), pore size and visibility, spots and pigmentation irregularities, wrinkles and fine lines, and skin firmness and elasticity. Each parameter is scored individually, giving you and your provider a clear picture of where your skin excels and where it needs attention."
  },
  {
    "q": "Is Skin IQ the same as the REVEAL 3D Skin Analysis?",
    "a": "No — they're complementary but different tools. Skin IQ is an AI-powered assessment focused on daily skin health metrics like hydration, oiliness, and firmness, generating product and treatment recommendations. REVEAL is a clinical-grade 3D imaging system that uses specialized photography to detect subsurface sun damage, vascular conditions, and deeper skin issues. Together, they provide the most complete picture of your skin's health."
  },
  {
    "q": "How long does a Skin IQ assessment take?",
    "a": "The entire Skin IQ process takes about 5-10 minutes — imaging, AI analysis, and a brief review of your results with your provider. It's one of the quickest and most informative things you can do at RELUXE. Many patients have it done at the start of a consultation to guide the conversation about treatments and goals."
  },
  {
    "q": "Does Skin IQ hurt or require any preparation?",
    "a": "Not at all. Skin IQ is completely non-invasive — no needles, no products, no discomfort. For the most accurate results, arrive with clean skin free of heavy makeup. If you're coming in for another treatment and want to add Skin IQ, we can cleanse your skin before the assessment. There are no side effects and no downtime."
  },
  {
    "q": "What kind of recommendations does Skin IQ provide?",
    "a": "Based on your unique skin profile, Skin IQ generates personalized recommendations for both in-office treatments and at-home skincare. If your skin shows dehydration, it may recommend hydrating facials and specific serums. If pigmentation is a concern, it could suggest chemical peels or IPL. The recommendations are data-driven and tailored to your specific scores, taking the guesswork out of building an effective skincare routine."
  },
  {
    "q": "How often should I get a Skin IQ assessment?",
    "a": "We recommend a Skin IQ assessment every 3-6 months or whenever you're starting a new treatment plan or skincare regimen. Regular assessments let you track improvements in hydration, texture, and other metrics over time, confirming that your treatments and products are working. It's a great way to stay on top of your skin's evolving needs, especially with seasonal changes."
  },
  {
    "q": "Who should get a Skin IQ analysis?",
    "a": "Everyone can benefit from a Skin IQ assessment. It's especially valuable for anyone new to professional skincare who wants a clear starting point, patients trying to decide between treatments, those building a medical-grade skincare routine, and anyone curious about their skin's health beyond what they see in the mirror. Since it's complimentary, there's no reason not to try it at your next RELUXE visit."
  }
];

export default s;
