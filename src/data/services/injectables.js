// src/data/services/injectables.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('injectables');

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

s.tagline = "Precision injectables for naturally enhanced, never overdone results";

s.seo = {
  "title": "Botox, Filler & Injectable Treatments Westfield IN | RELUXE",
  "description": "Expert Botox, dermal fillers, Sculptra & PRP treatments in Westfield & Carmel. Natural results by experienced NP injectors. Free consultation."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "15-45 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "Minimal"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "3-14 days"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "3-24 months"
  }
];

s.benefits = [
  "Smooths dynamic wrinkles and expression lines without freezing natural movement",
  "Restores lost facial volume and enhances natural contours",
  "Stimulates long-term collagen production for improved skin quality",
  "Provides immediate and gradual results depending on treatment choice",
  "Offers customizable solutions for comprehensive facial rejuvenation"
];

s.overview = {
  "p1": "Injectable treatments at RELUXE include neuromodulators (Botox, Dysport, Jeuveau, and Daxxify) that temporarily relax muscle contractions to smooth dynamic wrinkles, hyaluronic acid dermal fillers (Juvéderm, Restylane, RHA, Versa) that restore volume and enhance facial contours, Sculptra poly-L-lactic acid for gradual collagen stimulation, and PRP (platelet-rich plasma) therapy that harnesses your body's growth factors for tissue regeneration. Each injectable works through distinct mechanisms—neurotoxins blocking acetylcholine release at neuromuscular junctions, HA fillers providing immediate structural support while attracting water molecules, and biostimulators triggering your natural collagen synthesis pathways.",
  "p2": "At our Westfield and Carmel locations, every injectable treatment begins with a comprehensive facial analysis and complimentary consultation to design a personalized approach that honors your natural features. Our NP-led team of expert injectors combines advanced anatomy knowledge with artistic precision, ensuring balanced, natural-looking results that never appear overdone. Every patient receives detailed pre and post-treatment guidance, complimentary two-week follow-up appointments, and access to medical-grade skincare to optimize and maintain your results."
};

s.whyReluxe = [
  {
    "title": "Expert Injector Team",
    "body": "Our nurse practitioners and registered nurse injectors complete extensive training in facial anatomy and advanced injection techniques, with hundreds of hours of specialized education in aesthetic medicine."
  },
  {
    "title": "Comprehensive Product Portfolio",
    "body": "We offer the full spectrum of FDA-approved injectables, from four different neurotoxins to six filler lines, allowing us to select the optimal product for your specific anatomy and goals."
  },
  {
    "title": "Complimentary Follow-Ups",
    "body": "Every injectable treatment includes a two-week follow-up visit to assess results, address any concerns, and provide touch-ups if needed at no additional charge."
  },
  {
    "title": "Natural Philosophy",
    "body": "Our 'you, just refreshed' approach focuses on enhancing your natural beauty with subtle, balanced results that look like the best version of yourself."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Mapping",
    "body": "Your injector analyzes your facial anatomy, discusses your aesthetic goals, and creates a customized treatment plan. We use advanced techniques like facial mapping to ensure precise, balanced placement."
  },
  {
    "title": "Strategic Injection",
    "body": "Using ultra-fine needles or cannulas, your injector places the chosen product with precision, following your unique facial anatomy and muscle patterns for natural-looking enhancement."
  },
  {
    "title": "Immediate Assessment",
    "body": "Results are evaluated immediately for fillers and within minutes for neurotoxins, with any necessary adjustments made during your visit to ensure optimal outcomes."
  }
];

s.candidates = {
  "good": [
    "Dynamic wrinkles from facial expressions (crow's feet, forehead lines, frown lines)",
    "Volume loss in cheeks, lips, temples, or under-eye areas",
    "Desire for facial contouring and enhancement",
    "Skin laxity and texture concerns suitable for biostimulation",
    "Realistic expectations about gradual, natural-looking improvements"
  ],
  "notIdeal": [
    "Active skin infections or inflammation in treatment areas",
    "Pregnancy or breastfeeding",
    "Known allergies to hyaluronic acid or neurotoxin ingredients"
  ]
};

s.pricingMatrix = {
  "subtitle": "Injectable pricing varies by product type, treatment area, and amount needed for optimal results.",
  "sections": [
    {
      "title": "Neurotoxin Treatments",
      "note": "Priced per unit, with treatment areas typically requiring 10-50 units depending on muscle strength and desired outcome.",
      "membershipCallout": "VIP Members save 10-15% on all neurotoxin treatments",
      "rows": [
        {
          "label": "Botox, Dysport, Jeuveau",
          "subLabel": "Dynamic wrinkle treatment",
          "single": "$12-14/unit",
          "membership": "$10-12/unit"
        },
        {
          "label": "Daxxify",
          "subLabel": "Long-lasting neurotoxin",
          "single": "$16/unit",
          "membership": "$14/unit"
        }
      ],
      "ctaText": "Book Consultation"
    },
    {
      "title": "Dermal Fillers",
      "note": "Pricing per syringe, with most areas requiring 1-3 syringes for optimal correction.",
      "membershipCallout": "VIP Members receive exclusive filler discounts",
      "rows": [
        {
          "label": "Juvéderm Collection",
          "subLabel": "Lips, cheeks, lines",
          "single": "Starting at $750",
          "membership": "Member pricing available"
        },
        {
          "label": "RHA Collection",
          "subLabel": "Dynamic facial areas",
          "single": "Starting at $800",
          "membership": "Member pricing available"
        },
        {
          "label": "Restylane Portfolio",
          "subLabel": "Comprehensive facial enhancement",
          "single": "Starting at $700",
          "membership": "Member pricing available"
        }
      ],
      "ctaText": "Schedule Assessment"
    },
    {
      "title": "Biostimulator Treatments",
      "note": "Sculptra and PRP treatments designed for gradual, long-lasting collagen stimulation.",
      "rows": [
        {
          "label": "Sculptra",
          "subLabel": "Collagen stimulation therapy",
          "single": "Consult for pricing"
        },
        {
          "label": "PRP Therapy",
          "subLabel": "Platelet-rich plasma treatment",
          "single": "Consult for pricing"
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
      "Avoid blood-thinning medications, supplements (fish oil, vitamin E, aspirin) for 7-10 days prior",
      "Discontinue retinoids and exfoliating treatments 3 days before injection",
      "Avoid alcohol consumption 24 hours before treatment to minimize bruising risk",
      "Arrive with clean skin, free of makeup in treatment areas"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Remain upright for 4 hours post-neurotoxin treatment to prevent product migration",
      "Apply gentle ice for 10-15 minutes if swelling occurs, avoiding direct pressure on filler areas",
      "Avoid strenuous exercise, saunas, and excessive heat exposure for 24-48 hours",
      "Sleep elevated on your back for the first night after filler treatments",
      "Avoid touching, massaging, or applying pressure to treated areas for 24 hours"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your injectable results and treatment experience.",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule neurotoxin treatments 2-3 weeks before special events, as full results develop gradually. Filler results are immediate but may have temporary swelling."
    },
    {
      "heading": "Combination Approach",
      "body": "The most natural results often come from combining different injectables—neurotoxins for muscle relaxation, fillers for volume, and biostimulators for long-term skin quality."
    },
    {
      "heading": "Maintenance Strategy",
      "body": "Consistent treatment intervals help maintain optimal results and may reduce the amount needed over time as muscles adapt to relaxation patterns."
    },
    {
      "heading": "Product Selection",
      "body": "Different HA fillers have varying properties—some designed for deep volume replacement, others for fine line correction. Your injector will select based on your specific anatomy and goals."
    }
  ]
};

s.faq = [
  {
    "q": "What are injectables and what types does RELUXE offer?",
    "a": "Injectables are minimally invasive treatments delivered via small injections to smooth wrinkles, restore volume, and enhance facial features. RELUXE offers two main categories: neurotoxins (Botox, Dysport, Jeuveau, and Daxxify) that relax muscles causing expression lines, and dermal fillers (Juvederm, Restylane, RHA, Versa, and Sculptra) that restore volume, contour, and structure. We carry the full range so your provider can choose the best product for your unique anatomy and goals."
  },
  {
    "q": "What is the difference between neurotoxins and dermal fillers?",
    "a": "Neurotoxins (like Botox) relax the muscles that create dynamic wrinkles — forehead lines, frown lines, and crow's feet. They prevent and smooth expression-based lines. Dermal fillers add volume, structure, and contour to areas that have lost fullness or need enhancement — cheeks, lips, jawline, chin, under-eyes, and nasolabial folds. Many patients benefit from both: tox for movement-based lines and filler for volume and shape."
  },
  {
    "q": "How much do injectables cost at RELUXE?",
    "a": "Neurotoxin pricing starts with a foundation Botox treatment at $280 (20 units), with additional units at $9-10/unit depending on patient status. Dermal filler is priced per syringe and varies by product type and treatment area. VIP Members save 10-15% on all injectable services. We provide exact pricing during your free consultation — no hidden fees, no surprises."
  },
  {
    "q": "Do injectables hurt?",
    "a": "Most patients describe neurotoxin injections as small pinches — quick and very tolerable. For fillers, we use products that contain built-in lidocaine (numbing agent), and we can apply topical numbing cream and/or dental blocks for sensitive areas like lips. Most patients rate filler discomfort at 3-5 out of 10. Our injectors use techniques that minimize discomfort throughout the treatment."
  },
  {
    "q": "How do I know which injectable is right for me?",
    "a": "That's exactly what your free consultation is for. Your provider will assess your facial anatomy, discuss your goals and budget, and recommend the right combination of products. For wrinkle smoothing, they'll recommend the best neurotoxin for your needs. For volume, contour, or enhancement, they'll select the filler that best matches the treatment area. You'll leave the consult with a clear plan and transparent pricing."
  },
  {
    "q": "What is the difference between Botox, Dysport, Jeuveau, and Daxxify?",
    "a": "All four are FDA-approved neurotoxins that smooth expression lines. Botox is the gold standard with reliable 3-4 month results. Dysport has a slightly faster onset and broader spread, making it great for larger areas like foreheads. Jeuveau is a newer option that often kicks in quickly at a competitive price point. Daxxify is the longest-lasting option at 4-6+ months, ideal for patients who want fewer appointments. We carry all four and help you choose."
  },
  {
    "q": "What filler brands does RELUXE carry?",
    "a": "We carry the most trusted filler lines: Juvederm (Voluma, Vollure, Volbella, Ultra), Restylane (Lyft, Contour, Defyne, Refyne, Kysse, Silk), RHA (Redensity, 2, 3, 4) designed for dynamic movement areas, Revanesse Versa for smooth lip results, and Sculptra for gradual collagen stimulation. Each product has unique properties suited to specific areas and goals. Your provider selects the best match for your treatment plan."
  },
  {
    "q": "How long do injectable results last?",
    "a": "Neurotoxins (Botox, Dysport, Jeuveau) typically last 3-4 months. Daxxify can last 4-6+ months. Dermal filler longevity varies by product and area: lip fillers last 6-12 months, cheek and midface fillers last 12-18 months, jawline fillers last 12-24 months, and Sculptra results can last 2+ years. Your provider will set clear expectations for your specific treatment."
  },
  {
    "q": "What is the downtime for injectables?",
    "a": "Neurotoxins have zero downtime — you can return to normal activities immediately. Dermal fillers may involve mild swelling and possible bruising for 3-7 days depending on the area treated. Lip filler swelling peaks at 24-48 hours and resolves within a week. Most patients go back to work and social activities the same day or next day. We provide detailed aftercare instructions to minimize side effects."
  },
  {
    "q": "Are RELUXE's injectors experienced?",
    "a": "Yes. Our injectors are licensed nurse practitioners and registered nurses with specialized training in facial anatomy and injection techniques. They take an anatomy-first approach — assessing your bone structure, fat pads, and muscle patterns before recommending any treatment. All treatments are performed under Medical Director oversight. This expertise is what delivers natural, balanced results and minimizes risks."
  },
  {
    "q": "Can I combine different injectables in one visit?",
    "a": "Absolutely — in fact, combining neurotoxin and filler is one of the most popular treatment plans. This \"liquid facelift\" approach addresses both expression lines (tox) and volume loss (filler) in a single session. Many patients treat multiple areas in one visit to save time and achieve comprehensive results. Your provider will create a prioritized plan that works with your goals and budget."
  },
  {
    "q": "What should I do before and after injectable treatments?",
    "a": "Before: avoid blood thinners, alcohol, and anti-inflammatory medications like ibuprofen for 24-48 hours to reduce bruising risk. After neurotoxin: avoid lying flat for 4 hours and skip intense exercise for 24 hours. After filler: avoid intense heat, strenuous exercise, and alcohol for 24-48 hours. Ice can help with swelling. We provide complete pre- and post-care instructions at your appointment."
  }
];

export default s;
