// src/data/services/peels.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('peels');

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

s.tagline = "Reveal your brightest, smoothest skin with expert chemical peels";

s.seo = {
  "title": "Chemical Peels Westfield & Carmel IN | RELUXE Med Spa",
  "description": "Professional chemical peels including BioRePeel & Perfect Derma Peel. Expert skin resurfacing treatments in Westfield & Carmel, Indiana."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "30-45 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None to 7 days"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "3-7 days"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "3-6 months"
  }
];

s.benefits = [
  "Improved skin texture and reduced appearance of fine lines",
  "Evening of hyperpigmentation and age spots",
  "Minimized appearance of acne scars and enlarged pores",
  "Enhanced skin brightness and radiance",
  "Stimulated collagen production for firmer skin"
];

s.overview = {
  "p1": "Chemical peels use controlled acid solutions to remove damaged skin layers and stimulate cellular renewal, addressing concerns like hyperpigmentation, fine lines, and textural irregularities. Our advanced peel collection features BioRePeel—a revolutionary biphasic peel combining trichloroacetic acid with amino acids and vitamins for immediate glow with zero downtime—and The Perfect Derma Peel, which utilizes glutathione and kojic acid to target melasma and age spots. These medical-grade formulations work by disrupting cellular bonds in the stratum corneum and epidermis, triggering the skin's natural repair mechanism to reveal smoother, more even-toned skin.",
  "p2": "At RELUXE, our licensed estheticians customize each peel treatment based on comprehensive skin analysis and your specific concerns. We provide detailed pre-peel preparation protocols and include complimentary 2-week follow-up consultations to monitor your progress and optimize results, ensuring you achieve maximum benefit from your investment."
};

s.whyReluxe = [
  {
    "title": "Expert Peel Selection",
    "body": "Our team analyzes your skin type, concerns, and lifestyle to recommend the optimal peel depth and formulation, preventing complications and maximizing results."
  },
  {
    "title": "Medical-Grade Formulations",
    "body": "We exclusively offer professional-strength peels with clinically-proven ingredients like TCA, kojic acid, and glutathione that deliver superior results compared to spa-grade treatments."
  },
  {
    "title": "Comprehensive Aftercare",
    "body": "Every peel includes detailed home care instructions and access to medical-grade recovery products to enhance healing and extend your results."
  }
];

s.howItWorks = [
  {
    "title": "Skin Analysis",
    "body": "We assess your skin type, concerns, and sensitivity level to determine the appropriate peel depth and formulation. Your medical history and current skincare regimen are reviewed to ensure safety."
  },
  {
    "title": "Peel Application",
    "body": "The selected peel solution is applied in controlled layers, with careful attention to contact time based on your skin's response. You may experience mild tingling or warmth as the acids begin working."
  },
  {
    "title": "Neutralization & Recovery",
    "body": "The peel is neutralized at the optimal time, and soothing serums are applied to calm the skin. Post-treatment instructions and recommended recovery products are provided for optimal healing."
  }
];

s.candidates = {
  "good": [
    "Hyperpigmentation and sun damage",
    "Fine lines and early signs of aging",
    "Acne scarring and textural irregularities",
    "Enlarged pores and oily skin",
    "Dull, uneven skin tone"
  ],
  "notIdeal": [
    "Active skin infections or open wounds",
    "Recent isotretinoin use (within 6 months)",
    "Pregnant or nursing mothers"
  ]
};

s.pricingMatrix = {
  "subtitle": "Chemical peel pricing varies based on peel depth and treatment area coverage.",
  "sections": [
    {
      "title": "Professional Chemical Peels",
      "note": "Prices include consultation, treatment, and post-care instructions.",
      "membershipCallout": "VIP Members save 10-15% on all peel treatments",
      "rows": [
        {
          "label": "BioRePeel",
          "subLabel": "No-downtime biphasic peel for instant glow",
          "single": "Starting at $200",
          "membership": "Starting at $180"
        },
        {
          "label": "Perfect Derma Peel",
          "subLabel": "Medium-depth peel for pigmentation and aging",
          "single": "Starting at $350",
          "membership": "Starting at $315"
        },
        {
          "label": "Custom Light Peels",
          "subLabel": "Glycolic, lactic, or salicylic acid treatments",
          "single": "Starting at $150",
          "membership": "Starting at $135"
        }
      ],
      "promo": "Ask about peel packages for enhanced results and cost savings",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Discontinue retinoids and exfoliating acids 3-7 days prior to treatment",
      "Avoid sun exposure and tanning for at least one week before your peel",
      "Arrive with clean, makeup-free skin on treatment day",
      "Inform us of any recent facial treatments or new skincare products"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply gentle, fragrance-free moisturizer to maintain hydration during healing",
      "Use broad-spectrum SPF 30+ daily and avoid direct sun exposure",
      "Do not pick, peel, or exfoliate treated skin—allow natural shedding to occur",
      "Avoid harsh skincare ingredients like retinoids until healing is complete",
      "Contact our team if you experience unexpected irritation or prolonged redness"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your chemical peel results and experience:",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule peels during cooler months when sun exposure is naturally reduced, and avoid major events for 7-10 days post-treatment to allow for potential peeling."
    },
    {
      "heading": "Prep Your Skin",
      "body": "Use medical-grade vitamin C serum for 2-3 weeks before treatment to enhance results and accelerate healing, but discontinue all active ingredients 3-5 days prior."
    },
    {
      "heading": "Layer Your Benefits",
      "body": "Combine peels with HydraFacial treatments monthly for maintenance, or follow deeper peels with SkinPen microneedling after 4-6 weeks for enhanced collagen stimulation."
    },
    {
      "heading": "Home Care Investment",
      "body": "Quality post-peel skincare like SkinBetter Science or SkinCeuticals can double your results duration and prevent complications during the healing phase."
    }
  ]
};

s.faq = [
  {
    "q": "What is a chemical peel and how does it work?",
    "a": "A chemical peel applies a controlled acid solution to exfoliate damaged outer layers of skin, revealing smoother, brighter skin underneath. The acids break the bonds between dead and damaged cells, triggering your body's natural healing response to produce fresh, healthy skin. At RELUXE, we offer peels ranging from superficial to medium depth, including BioRePeel and Perfect Derma Peel, each targeting different concerns like acne, hyperpigmentation, fine lines, and uneven texture."
  },
  {
    "q": "How much do chemical peels cost at RELUXE Med Spa?",
    "a": "Chemical peel pricing at RELUXE varies by type and depth. BioRePeel and custom peels are priced competitively for the Westfield and Carmel area, while the Perfect Derma Peel is a premium medium-depth option. VIP Members save 10-15% on every peel treatment. We provide transparent pricing during your free consultation — no surprises."
  },
  {
    "q": "Do chemical peels hurt?",
    "a": "Most clients feel a tingling or warming sensation during the peel that lasts a few minutes. BioRePeel is one of the most comfortable peels available — many clients feel almost nothing. The Perfect Derma Peel may produce moderate stinging during application that subsides quickly. Your esthetician monitors your comfort throughout and can adjust as needed. Any discomfort is brief and well-tolerated."
  },
  {
    "q": "What results can I expect from a chemical peel?",
    "a": "Results depend on the peel type and depth. BioRePeel delivers an immediate glow with improved texture and tone, and results build with a series. The Perfect Derma Peel delivers dramatic improvements in hyperpigmentation, fine lines, acne scarring, and overall radiance — its glutathione formula is a powerful antioxidant that brightens from within. Most clients see their best results 1-2 weeks after peeling is complete."
  },
  {
    "q": "How often should I get a chemical peel?",
    "a": "Frequency depends on the peel type. BioRePeel can be done every 2-4 weeks for a series, making it great for consistent maintenance. The Perfect Derma Peel is typically spaced 6-8 weeks apart due to its deeper action. Custom peels vary based on the acids used and your skin's tolerance. Your RELUXE esthetician will build a personalized schedule based on your goals and skin response."
  },
  {
    "q": "What is the downtime after a chemical peel?",
    "a": "Downtime varies by peel depth. BioRePeel is a no-downtime TCA peel — you can return to your routine immediately with no visible peeling. The Perfect Derma Peel involves 3-7 days of peeling, starting around day 3, with skin looking fresh and renewed by day 7-10. Custom peels range from minimal to moderate peeling depending on depth. We provide detailed aftercare instructions for every peel type."
  },
  {
    "q": "What is a BioRePeel and why is it unique?",
    "a": "BioRePeel is an innovative no-downtime TCA peel that combines 35% TCA with amino acids, vitamins, and GABA to stimulate cellular renewal without visible peeling. It's unique because TCA peels traditionally cause significant downtime, but BioRePeel's patented two-phase technology delivers the benefits of a deep peel without the flaking or redness. It's perfect for clients who want results without any social downtime."
  },
  {
    "q": "What is the Perfect Derma Peel?",
    "a": "The Perfect Derma Peel is a medium-depth chemical peel and the only peel that includes glutathione — the body's master antioxidant. It targets fine lines, acne, hyperpigmentation, melasma, and sun damage with a powerful blend of TCA, kojic acid, retinoic acid, and salicylic acid. It's safe for all skin types and tones. Expect 3-7 days of peeling followed by noticeably clearer, brighter, and more youthful skin."
  },
  {
    "q": "Who is a good candidate for a chemical peel?",
    "a": "Chemical peels benefit most skin types looking to improve texture, tone, acne, hyperpigmentation, or early signs of aging. BioRePeel is ideal for sensitive skin or anyone wanting zero downtime. The Perfect Derma Peel suits those ready for a few days of peeling in exchange for more dramatic results. Peels are not recommended during pregnancy, on actively sunburned skin, or for those using isotretinoin. Book a free consultation at RELUXE to find the right peel for you."
  },
  {
    "q": "What should I expect during a chemical peel appointment at RELUXE?",
    "a": "Your appointment begins with a skin assessment to determine the ideal peel type and strength. Your esthetician cleanses your skin, applies the peel solution in controlled layers while monitoring your comfort, and finishes with soothing products and SPF. BioRePeel appointments take about 30-45 minutes. Perfect Derma Peel applications take about 30 minutes. You'll leave with a clear aftercare plan and know exactly what to expect in the days ahead."
  },
  {
    "q": "Can I combine chemical peels with other treatments?",
    "a": "Yes, with proper spacing. BioRePeel can be combined same-day with treatments like dermaplaning or LED therapy. The Perfect Derma Peel is typically done as a standalone treatment. Chemical peels also complement a broader treatment plan that includes facials, microneedling, or injectables — spaced appropriately. Your RELUXE esthetician will create a timeline that maximizes results without overtreating your skin."
  },
  {
    "q": "How do I choose between a superficial and medium-depth peel?",
    "a": "Superficial peels like BioRePeel target the outermost skin layer for brightening and maintenance with no downtime — great for regular upkeep. Medium-depth peels like the Perfect Derma Peel penetrate deeper to address stubborn pigmentation, acne scars, and more advanced aging concerns, but require several days of peeling. Your RELUXE esthetician will recommend the right depth based on your skin, goals, and lifestyle during a free consultation."
  }
];

export default s;
