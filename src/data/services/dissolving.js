// src/data/services/dissolving.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('dissolving');

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

s.tagline = "Expert correction for filler outcomes you don't love";

s.seo = {
  "title": "Filler Dissolving Westfield & Carmel IN | RELUXE Med Spa",
  "description": "Expert filler dissolving & correction in Indiana. Fix overfilled, migrated, or unwanted HA filler results. Free consultation at RELUXE Med Spa."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "15-30 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "Minimal"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "24-48 hours"
  },
  {
    "iconKey": "fire",
    "label": "Complete Effect",
    "value": "7-14 days"
  }
];

s.benefits = [
  "Safely reverses unwanted hyaluronic acid filler results",
  "Corrects asymmetry and migration issues",
  "Allows for fresh start with new filler placement",
  "Minimally invasive with predictable outcomes",
  "Can address both recent and older filler placements"
];

s.overview = {
  "p1": "Dissolving and cosmetic correction uses hyaluronidase, an enzyme that breaks down hyaluronic acid chains in dermal fillers, effectively reversing unwanted filler outcomes. This precise technique can address overfilled areas, asymmetry, migration, or results that don't align with your aesthetic goals by safely metabolizing HA-based fillers like Juvederm, Restylane, RHA, and Versa. The enzyme works within hours to days, gradually dissolving the targeted filler while allowing your natural facial contours to emerge. Results become visible within 24-48 hours, with complete dissolution typically occurring over 7-14 days.",
  "p2": "At RELUXE, our NP-led team approaches filler correction with the same precision and artistry as original placement, carefully assessing the area and using targeted injection techniques to dissolve only what's necessary. Every dissolving treatment begins with a comprehensive consultation to understand your concerns and develop a correction plan, followed by our signature 2-week follow-up to ensure optimal results and discuss any refinement options."
};

s.whyReluxe = [
  {
    "title": "Expert Assessment",
    "body": "Our NPs and RN injectors evaluate the filler type, placement depth, and integration before developing a precise dissolution strategy tailored to your specific correction needs."
  },
  {
    "title": "Conservative Approach",
    "body": "We dissolve only what's necessary using targeted techniques, preserving your natural volume and avoiding over-correction that could leave you looking hollow or aged."
  },
  {
    "title": "Correction Specialists",
    "body": "Whether correcting our own work or addressing treatments from other providers, we bring the same commitment to natural, balanced results that defines the RELUXE standard."
  }
];

s.howItWorks = [
  {
    "title": "Assessment",
    "body": "Our providers evaluate the filler type, location, and integration to determine the optimal dissolution approach and enzyme concentration needed for your specific correction goals."
  },
  {
    "title": "Targeted Injection",
    "body": "Hyaluronidase is precisely injected into the areas requiring correction using fine needles, with the enzyme immediately beginning to break down hyaluronic acid chains."
  },
  {
    "title": "Monitoring Results",
    "body": "The dissolution process continues over 7-14 days, with our team monitoring progress and scheduling follow-ups to assess results and discuss any refinement needs."
  }
];

s.candidates = {
  "good": [
    "Overfilled or migrated HA fillers",
    "Asymmetrical filler results",
    "Lumps or irregularities from previous treatments",
    "Dissatisfaction with filler outcomes",
    "Preparation for new filler placement"
  ],
  "notIdeal": [
    "Non-HA fillers (Sculptra, Radiesse)",
    "Active infection in treatment area",
    "Severe allergies to hyaluronidase"
  ]
};

s.pricingMatrix = {
  "subtitle": "Pricing varies based on the amount of filler requiring dissolution and treatment complexity",
  "sections": [
    {
      "title": "Hyaluronidase Dissolving",
      "note": "Cost depends on the volume of filler being dissolved and number of areas treated",
      "membershipCallout": "VIP Members save 10-15% on all dissolving treatments",
      "rows": [
        {
          "label": "Filler Dissolving",
          "subLabel": "Per treatment session",
          "single": "Varies by amount",
          "membership": "Member discount applies"
        }
      ],
      "promo": "Consultation included to assess treatment needs and provide accurate pricing",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood thinners (aspirin, ibuprofen, fish oil) for 24 hours if possible",
      "Discontinue topical retinoids 2-3 days before treatment",
      "Inform us of all previous filler types and timeframes",
      "Come with clean skin, free of makeup in treatment areas"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice for 10-15 minutes several times during the first day",
      "Avoid strenuous exercise for 24 hours",
      "Sleep with head elevated for the first night",
      "Expect some swelling and bruising as filler dissolves",
      "Wait 2-4 weeks before new filler placement if desired"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for successful filler dissolution and correction at our Westfield and Carmel locations",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Fresh filler (under 2 weeks) dissolves more predictably than older, integrated filler, which may require additional sessions for complete correction."
    },
    {
      "heading": "Patience Pays",
      "body": "Allow the full 2-week dissolution period before assessing final results, as enzyme activity continues throughout this timeframe."
    },
    {
      "heading": "Plan Strategically",
      "body": "If you're planning new filler after dissolution, wait at least 2-4 weeks to allow complete healing and accurate assessment of your natural anatomy."
    },
    {
      "heading": "Document Everything",
      "body": "Bring photos of your filler journey and details about previous treatments to help our team develop the most effective correction strategy."
    }
  ]
};

s.faq = [
  {
    "q": "What is filler dissolving and how does it work?",
    "a": "Filler dissolving uses an enzyme called hyaluronidase to break down hyaluronic acid (HA) dermal fillers. The enzyme is injected directly into the area where filler needs to be removed, and it works by breaking the bonds in the HA gel. The filler begins dissolving within minutes, with full results visible in 24-72 hours. It's a safe, well-established procedure that restores your natural anatomy."
  },
  {
    "q": "Why would someone need filler dissolved?",
    "a": "Common reasons include filler migration (product shifting from the original placement), overfilling that creates an unnatural look, asymmetry, visible lumps or nodules, a change in aesthetic preferences, or simply wanting to start fresh. Some patients come to us after receiving filler at another provider and being unhappy with the results. Dissolving allows us to reset and, if desired, re-treat with a better approach."
  },
  {
    "q": "How much does filler dissolving cost at RELUXE?",
    "a": "Filler dissolving at RELUXE is priced per session. The amount of hyaluronidase needed depends on how much filler is present and which areas are being treated. Some cases require a single session; others may need 2-3. We provide exact pricing during your free consultation after evaluating the area. VIP Members receive discounted pricing on all services."
  },
  {
    "q": "Does filler dissolving hurt?",
    "a": "Most patients rate the discomfort at 3-5 out of 10. The area is numbed beforehand with topical anesthetic and/or local lidocaine injection. You'll feel some pressure and a mild burning or stinging sensation as the hyaluronidase is injected. The actual injection takes only a few minutes. Any discomfort fades quickly after the procedure."
  },
  {
    "q": "Can you dissolve filler that was done at another provider?",
    "a": "Yes — we routinely correct and dissolve filler from other providers. Whether it's lip filler that has migrated, overfilled cheeks, or under-eye filler causing issues, our experienced injectors can evaluate the area and create a dissolving plan. We approach every case without judgment and focus entirely on getting you to a result you feel good about."
  },
  {
    "q": "How long does it take for dissolved filler to go away?",
    "a": "Hyaluronidase begins working immediately. You'll notice the filler softening and reducing within hours. Most patients see the majority of correction within 24-48 hours, with final results at about 72 hours. Swelling from the dissolving process itself can take 3-7 days to fully resolve, so give it about a week before judging the final outcome."
  },
  {
    "q": "Can I get filler again after dissolving?",
    "a": "Yes, but we recommend waiting at least 2-4 weeks after dissolving before re-injecting. This healing window allows the tissue to fully recover and ensures the hyaluronidase has completely cleared. Starting with a clean canvas actually produces better results because your provider can place filler precisely without interference from old product."
  },
  {
    "q": "Is filler dissolving safe?",
    "a": "Yes. Hyaluronidase is FDA-approved and has been used in medicine for decades. It specifically targets hyaluronic acid filler and does not damage surrounding tissue. Side effects are mild and temporary — swelling, redness, and tenderness at the injection site for a few days. Allergic reactions are rare but possible, which is why we perform this in a clinical setting with experienced providers."
  },
  {
    "q": "Can all types of filler be dissolved?",
    "a": "Hyaluronidase dissolves hyaluronic acid (HA) fillers, which include Juvederm, Restylane, RHA, and Versa. It does not dissolve non-HA fillers such as Sculptra (poly-L-lactic acid), Radiesse (calcium hydroxylapatite), or silicone. During your consultation, we'll determine the type of filler present and whether dissolving is the right solution for your situation."
  },
  {
    "q": "How many dissolving sessions will I need?",
    "a": "Many patients achieve their desired result in one session. However, if a large amount of filler is present — especially old, layered product — 2-3 sessions spaced 2-4 weeks apart may be needed. We take a conservative approach, dissolving gradually to maintain natural contours and avoid over-correcting. Your provider will set clear expectations at your consultation."
  },
  {
    "q": "What is the downtime after filler dissolving?",
    "a": "Downtime is minimal. Expect swelling, redness, and possible bruising at the treatment site for 3-7 days. The area may feel tender or slightly firm as it heals. You can return to normal activities immediately, though we recommend avoiding strenuous exercise for 24 hours. Ice and arnica can help with swelling and bruising."
  }
];

export default s;
