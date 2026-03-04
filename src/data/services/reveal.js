// src/data/services/reveal.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('reveal');

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

s.tagline = "Discover your perfect treatment match with data-driven precision";

s.seo = {
  "title": "REVEAL 3D Skin Analysis Westfield & Carmel IN | RELUXE",
  "description": "Free REVEAL 3D SkinCare IQ assessment matches you to optimal treatments at RELUXE Med Spa. Personalized recommendations in Westfield & Carmel, Indiana."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Assessment Time",
    "value": "10-15 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Cost",
    "value": "Complimentary"
  },
  {
    "iconKey": "user",
    "label": "Results",
    "value": "Immediate"
  },
  {
    "iconKey": "fire",
    "label": "Validity",
    "value": "6-12 months"
  }
];

s.benefits = [
  "Eliminates guesswork in treatment selection",
  "Prevents costly trial-and-error approaches",
  "Creates realistic timeline expectations",
  "Identifies combination treatment opportunities",
  "Tracks progress and adjusts recommendations over time"
];

s.overview = {
  "p1": "REVEAL by RELUXE — 3D SkinCare IQ is our proprietary quiz-based treatment matching system that analyzes your skin concerns, goals, and lifestyle to recommend the most effective treatment pathway from our comprehensive service menu. Using advanced diagnostic questioning and our clinical expertise, REVEAL evaluates factors like skin type, aging patterns, lifestyle habits, and treatment history to create a personalized roadmap that may include neurotoxins, dermal fillers, laser resurfacing, energy-based treatments, or medical-grade skincare protocols.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our nurse practitioner-led team uses REVEAL as the foundation for every patient journey, ensuring your treatment plan aligns with your specific concerns and realistic expectations. This comprehensive assessment helps us recommend the right sequence of treatments while avoiding over-treatment, staying true to our 'you, just refreshed' philosophy."
};

s.whyReluxe = [
  {
    "title": "NP-Led Analysis",
    "body": "Our nurse practitioners personally review every REVEAL assessment, bringing medical expertise to treatment recommendations that purely algorithm-based systems cannot match."
  },
  {
    "title": "Integrated Treatment Planning",
    "body": "REVEAL connects seamlessly with our full service menu, from Morpheus8 to dermal fillers, creating cohesive treatment plans rather than isolated recommendations."
  },
  {
    "title": "Progress Tracking",
    "body": "Your REVEAL profile evolves with you, tracking treatment responses and adjusting recommendations as your skin changes and goals shift over time."
  }
];

s.howItWorks = [
  {
    "title": "Comprehensive Quiz",
    "body": "Complete our detailed questionnaire covering skin concerns, medical history, lifestyle factors, previous treatments, and aesthetic goals. The system analyzes your responses using our clinical protocols."
  },
  {
    "title": "Algorithm Analysis",
    "body": "REVEAL processes your information against our treatment database, considering contraindications, synergistic combinations, and optimal treatment sequencing based on your specific profile."
  },
  {
    "title": "Personalized Recommendations",
    "body": "Receive a customized treatment roadmap with primary recommendations, alternative options, expected timelines, and estimated investment ranges tailored to your goals and preferences."
  }
];

s.candidates = {
  "good": [
    "New patients exploring treatment options",
    "Patients with multiple skin concerns",
    "Those seeking comprehensive treatment planning",
    "Patients wanting to optimize results",
    "Anyone considering their first aesthetic treatment"
  ],
  "notIdeal": [
    "Patients with urgent single concerns",
    "Those preferring immediate treatment selection",
    "Patients uncomfortable with digital assessments"
  ]
};

s.pricingMatrix = {
  "subtitle": "REVEAL assessment is complimentary as part of our commitment to personalized care.",
  "sections": [
    {
      "title": "REVEAL Assessment",
      "note": "Our comprehensive skin analysis and treatment matching service is provided at no cost to help you make informed decisions about your aesthetic journey.",
      "membershipCallout": "VIP Members receive priority booking for recommended treatments",
      "rows": [
        {
          "label": "REVEAL 3D SkinCare IQ",
          "subLabel": "Complete assessment with treatment recommendations",
          "single": "Complimentary",
          "membership": "Complimentary"
        }
      ],
      "promo": "Free follow-up consultations included with recommended treatment bookings",
      "ctaText": "Start Your REVEAL Assessment"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your assessment",
    "points": [
      "Come makeup-free if possible for accurate skin evaluation",
      "List current skincare products and ingredients you're using",
      "Prepare questions about specific concerns or treatment goals",
      "Bring photos of desired results if you have reference images"
    ]
  },
  "after": {
    "title": "After your assessment",
    "points": [
      "Review your personalized treatment recommendations thoroughly",
      "Schedule recommended consultations within 30 days for best accuracy",
      "Continue your current skincare routine unless otherwise advised",
      "Return for progress reassessment every 6-12 months",
      "Contact us with questions about your recommendations anytime"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize your REVEAL assessment results with these expert insights from our clinical team.",
  "items": [
    {
      "heading": "Be Completely Honest",
      "body": "Accurate results depend on truthful responses about skin history, lifestyle habits, and previous treatments. Our providers maintain strict confidentiality and need complete information for optimal recommendations."
    },
    {
      "heading": "Consider Your Timeline",
      "body": "Share realistic timelines for achieving your goals. This helps REVEAL prioritize treatments and create achievable milestone expectations rather than overwhelming comprehensive plans."
    },
    {
      "heading": "Budget Transparency",
      "body": "Providing your investment comfort level helps REVEAL suggest treatment sequences that fit your financial preferences, whether focusing on high-impact single treatments or gradual improvement plans."
    },
    {
      "heading": "Follow-Up Matters",
      "body": "Book your recommended consultation within 30 days while your assessment remains current. Skin conditions and concerns can shift, affecting treatment appropriateness and sequencing priorities."
    }
  ]
};

s.faq = [
  {
    "q": "What is the REVEAL 3D Skin Analysis?",
    "a": "REVEAL is an advanced skin imaging system that photographs your face using specialized lighting and technology to analyze your skin below the surface. It maps sun damage, texture irregularities, pore size, wrinkles, redness, pigmentation, and other concerns that may not be visible to the naked eye. The result is a comprehensive, objective portrait of your skin's current condition — giving you and your provider clear data to build the most effective treatment plan."
  },
  {
    "q": "How much does a REVEAL Skin Analysis cost?",
    "a": "REVEAL 3D Skin Analysis is complimentary for VIP Members as part of their membership benefits. For non-members, it may be included as part of your consultation or available as a standalone analysis. Contact RELUXE or ask during your visit for current pricing. It's one of the most valuable tools we offer because it creates a clear roadmap for your skincare investment."
  },
  {
    "q": "How does the REVEAL analysis work?",
    "a": "You sit in front of the REVEAL imaging system while it takes a series of high-resolution photographs using different lighting modes — standard, UV, and cross-polarized light. The system then processes these images to reveal sun damage beneath the surface, bacteria in pores, vascular conditions (redness), texture issues, and pigmentation patterns. The entire process takes about 10-15 minutes and is completely non-invasive."
  },
  {
    "q": "What does REVEAL show that I can't see in the mirror?",
    "a": "REVEAL detects subsurface sun damage that hasn't yet appeared as visible spots, early signs of pigmentation changes, pore congestion invisible to the eye, vascular redness patterns, and texture irregularities at a microscopic level. Many patients are surprised to discover UV damage or early aging signs they didn't know existed. This information allows us to treat proactively, not just reactively."
  },
  {
    "q": "Why is a skin analysis important before starting treatments?",
    "a": "An objective baseline is essential for two reasons: it helps your provider recommend the right treatments for your specific concerns (not guesswork), and it gives us a measurable starting point to track your progress over time. Without a baseline analysis, it's difficult to know exactly what's happening beneath the surface or to prove that treatments are working. REVEAL removes the guesswork from skincare."
  },
  {
    "q": "Does the REVEAL analysis hurt or have any side effects?",
    "a": "Not at all. REVEAL is completely non-invasive — it's simply advanced photography. There's no touching, no products, no discomfort, and no side effects. You sit comfortably while the system captures images. It's one of the easiest and most informative things you can do for your skin."
  },
  {
    "q": "How is REVEAL used to track my progress?",
    "a": "We save your REVEAL images in your patient file and re-scan at regular intervals — typically every 3-6 months or after completing a treatment series. The system generates side-by-side comparisons showing measurable improvement in sun damage, texture, pores, wrinkles, and redness. This objective data lets you see exactly how your treatments are working and helps your provider adjust your plan as your skin evolves."
  },
  {
    "q": "What treatments does REVEAL help recommend?",
    "a": "Based on your REVEAL results, your provider may recommend treatments targeting your specific concerns: chemical peels or laser treatments for sun damage and pigmentation, microneedling or Morpheus8 for texture and pores, IPL for redness and vascular issues, medical-grade skincare for daily maintenance, or injectables for volume and lines. REVEAL ensures every recommendation is backed by data, not assumptions."
  },
  {
    "q": "How is REVEAL different from the Skin IQ analysis?",
    "a": "REVEAL is a clinical-grade 3D imaging system that uses specialized photography to analyze your skin at a deeper level, producing detailed visual maps of sun damage, pores, wrinkles, and vascular conditions. Skin IQ is an AI-powered assessment tool that evaluates hydration, oiliness, and surface-level skin characteristics to generate product and treatment recommendations. They complement each other — REVEAL goes deeper, while Skin IQ focuses on daily skin health and product guidance."
  },
  {
    "q": "Do I need an appointment for a REVEAL analysis?",
    "a": "Yes, we recommend scheduling a REVEAL analysis as part of a consultation or treatment visit so your provider can review results with you in person and discuss recommendations. VIP Members can request a REVEAL scan at any visit. Book a free consultation at RELUXE in Westfield or Carmel, and we'll include a REVEAL analysis to create your personalized treatment roadmap."
  }
];

export default s;
