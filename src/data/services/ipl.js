// src/data/services/ipl.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('ipl');

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

s.tagline = "Target sun damage and redness with precision light therapy";

s.seo = {
  "title": "IPL Photofacial Westfield & Carmel IN | RELUXE Med Spa",
  "description": "Professional IPL treatments for sun damage, rosacea & pigmentation. Expert care, advanced technology. Westfield & Carmel locations."
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
    "value": "24-48 hours"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "7-10 days"
  },
  {
    "iconKey": "fire",
    "label": "Sessions Needed",
    "value": "3-5 treatments"
  }
];

s.benefits = [
  "Reduces sun spots, age spots, and melasma with targeted light wavelengths",
  "Minimizes facial redness from rosacea and broken capillaries",
  "Improves overall skin texture and tone uniformity",
  "Stimulates collagen production for firmer, smoother skin",
  "Achieves results with minimal downtime compared to ablative treatments"
];

s.overview = {
  "p1": "IPL (Intense Pulsed Light) delivers precise broadband light wavelengths (515-1200nm) to target melanin and hemoglobin in the skin, effectively treating sun damage, age spots, rosacea, and broken capillaries. The treatment works by heating pigmented lesions and vascular imperfections, causing them to fragment and be naturally absorbed by the body over the following weeks. Each 30-45 minute session delivers controlled light pulses that feel like a rubber band snap, progressively revealing clearer, more even-toned skin with minimal downtime.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our nurse practitioners and trained technicians customize IPL settings based on your specific skin concerns and Fitzpatrick skin type during your complimentary consultation. We provide cooling gel and post-treatment care instructions to maximize comfort and results, plus complimentary 2-week follow-ups to track your progress and adjust treatment plans as needed."
};

s.whyReluxe = [
  {
    "title": "Skin Type Expertise",
    "body": "Our NP-led team performs thorough skin assessments to determine optimal IPL wavelengths and energy levels for your specific pigmentation and vascular concerns, ensuring both safety and efficacy."
  },
  {
    "title": "Advanced IPL Technology",
    "body": "We utilize state-of-the-art IPL systems with multiple wavelength filters, allowing precise targeting of different chromophores for customized treatment of sun damage, redness, and pigmentation irregularities."
  },
  {
    "title": "Comprehensive Treatment Plans",
    "body": "IPL pairs beautifully with our medical-grade peels, HydraFacials, and SkinBetter Science products to accelerate results and maintain your clearer, more radiant complexion between sessions."
  }
];

s.howItWorks = [
  {
    "title": "Skin Assessment",
    "body": "Your provider analyzes your skin type, pigmentation patterns, and vascular concerns to select appropriate IPL wavelength filters and energy settings for optimal results and safety."
  },
  {
    "title": "Light Delivery",
    "body": "Intense pulsed light is applied in controlled flashes across treatment areas, with cooling gel to protect the skin surface while light energy targets melanin and hemoglobin in deeper layers."
  },
  {
    "title": "Healing Process",
    "body": "Treated pigmented lesions darken initially before flaking off over 7-14 days, while damaged capillaries coagulate and are gradually reabsorbed, revealing clearer, more even skin tone."
  }
];

s.candidates = {
  "good": [
    "Sun damage and age spots",
    "Facial redness and rosacea",
    "Broken capillaries and spider veins",
    "Uneven skin tone and texture",
    "Fitzpatrick skin types I-IV"
  ],
  "notIdeal": [
    "Recently tanned or sun-exposed skin",
    "Active skin infections or open wounds",
    "Darker skin tones (Fitzpatrick V-VI)"
  ]
};

s.pricingMatrix = {
  "subtitle": "IPL pricing reflects treatment area size and the number of sessions needed for optimal results.",
  "sections": [
    {
      "title": "IPL Photofacial Pricing",
      "note": "Most patients achieve best results with 3-5 sessions spaced 3-4 weeks apart",
      "membershipCallout": "VIP Members save 10-15% on all IPL packages",
      "rows": [
        {
          "label": "Single IPL Session",
          "subLabel": "Full face treatment for pigmentation and redness",
          "single": "$300-500",
          "membership": "Starting at $270"
        },
        {
          "label": "IPL Package (3 sessions)",
          "subLabel": "Recommended series for optimal results",
          "single": "$850-1350",
          "membership": "$765-1215"
        }
      ],
      "promo": "Cherry financing available for treatment packages",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid sun exposure and tanning for 4 weeks prior to treatment",
      "Discontinue retinoids, AHA/BHA products 1 week before",
      "Remove all makeup and skincare products on treatment day",
      "Inform your provider of any medications or recent procedures"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply cold compresses for 10-15 minutes if experiencing redness or swelling",
      "Use gentle, fragrance-free moisturizer and avoid harsh skincare products for 48 hours",
      "Wear broad-spectrum SPF 30+ sunscreen daily and avoid direct sun exposure",
      "Expect treated spots to darken before naturally exfoliating over 7-14 days",
      "Schedule follow-up sessions 3-4 weeks apart for optimal results"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your IPL photofacial results and maintain clearer skin.",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule IPL treatments during fall and winter months when sun exposure is minimal, allowing your skin to heal properly and reducing risk of post-inflammatory hyperpigmentation."
    },
    {
      "heading": "Enhance Results",
      "body": "Pair IPL with medical-grade vitamin C serums and hydroquinone products from SkinBetter Science or SkinCeuticals to accelerate pigmentation improvement and maintain results longer."
    },
    {
      "heading": "Realistic Expectations",
      "body": "Most patients see 60-80% improvement in sun damage after a complete series, with continued enhancement over 3-6 months as collagen remodeling occurs."
    },
    {
      "heading": "Maintenance Protocol",
      "body": "Annual IPL touch-up sessions help maintain results, while consistent daily SPF use and professional-grade skincare prevent new pigmentation from forming."
    }
  ]
};

s.faq = [
  {
    "q": "What is IPL and how does it work?",
    "a": "IPL (Intense Pulsed Light) is a non-invasive light-based treatment that targets pigment and blood vessels beneath the skin's surface. Broad-spectrum light pulses break down melanin in sun spots and constrict tiny blood vessels that cause redness. Your body naturally clears the treated pigment over the following 1-2 weeks, revealing clearer, more even skin."
  },
  {
    "q": "How much does IPL cost at RELUXE?",
    "a": "IPL pricing at RELUXE is per area treated. We offer 6-session packages for the best results and value since IPL works cumulatively. VIP Members get discounted pricing on every session. Your provider will give you exact pricing during your free consultation based on the areas you want to treat."
  },
  {
    "q": "Does IPL hurt?",
    "a": "Most patients describe IPL as a quick snapping sensation, like a rubber band lightly flicking the skin. It's very tolerable — most rate it 2-3 out of 10. We adjust the energy settings for your comfort and skin type. No numbing is needed for most patients."
  },
  {
    "q": "What does IPL treat?",
    "a": "IPL is excellent for sun damage (brown spots, age spots, freckles), redness and rosacea, broken capillaries, vascular lesions, and overall uneven skin tone. It's most commonly used on the face, neck, chest (decolletage), and hands — areas that get the most sun exposure over time."
  },
  {
    "q": "How many IPL sessions do I need?",
    "a": "Most patients see best results with a series of 3-6 sessions, spaced 3-4 weeks apart. You'll notice improvement after even one session, but cumulative treatments deliver the most dramatic clearing. Maintenance sessions every 6-12 months help keep new sun damage in check."
  },
  {
    "q": "What is the downtime after IPL?",
    "a": "IPL has minimal downtime. Treated sun spots will darken and look like coffee grounds for 5-10 days before naturally flaking off — this is completely normal and means the treatment is working. You may have mild redness for a few hours. Most patients return to normal activities immediately. Avoid direct sun and wear SPF daily."
  },
  {
    "q": "When will I see IPL results?",
    "a": "You'll see darkened spots within 24-48 hours (they rise to the surface), which then flake off over 7-14 days. Redness improvement is often visible within 1-2 weeks. Full results from a series are typically visible 2-4 weeks after your last session. Each treatment builds on the previous one."
  },
  {
    "q": "Is IPL safe for all skin tones?",
    "a": "IPL works best on lighter to medium skin tones (Fitzpatrick I-IV) because the light targets contrast between pigment and surrounding skin. Darker skin tones have a higher risk of hyperpigmentation with IPL. During your consult, we'll assess your skin type and recommend IPL or an alternative like ClearLift if better suited."
  },
  {
    "q": "What is the difference between IPL and laser?",
    "a": "IPL uses broad-spectrum light (multiple wavelengths) to treat a range of concerns simultaneously — pigment, redness, and texture. Lasers use a single, focused wavelength for more targeted treatment. IPL is ideal for overall sun damage and tone correction. We may recommend a specific laser (ClearLift, ClearSkin) for more targeted concerns."
  },
  {
    "q": "Can I combine IPL with other treatments?",
    "a": "Yes — IPL pairs well with many treatments. It's commonly combined with tox (Botox/Dysport) for wrinkles, microneedling for texture, and medical-grade skincare for maintenance. We typically space IPL 2 weeks from other treatments. Your provider will design a comprehensive plan during your consult."
  },
  {
    "q": "How do I prepare for IPL treatment?",
    "a": "Avoid sun exposure and self-tanner for 2-4 weeks before IPL. Discontinue retinoids 5-7 days prior. Arrive with clean skin, free of makeup and sunscreen. If you have a tan, we'll need to wait for it to fade before treating. Your provider will give you specific prep instructions at your consult."
  },
  {
    "q": "Who is a good candidate for IPL?",
    "a": "IPL is ideal for patients with sun damage, brown spots, redness, rosacea, or broken capillaries on fair to medium skin tones. It's great for the face, neck, chest, and hands. You should avoid IPL if you're pregnant, have active skin infections, are on photosensitizing medications, or have a recent tan."
  }
];

export default s;
