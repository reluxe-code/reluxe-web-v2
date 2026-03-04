// src/data/services/micropeels.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('micropeels');

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

s.tagline = "Gentle exfoliation, glowing results—perfect for busy lifestyles.";

s.seo = {
  "title": "Micropeels in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Gentle chemical peels for brighter, smoother skin. Professional micropeels in Westfield & Carmel, IN. Minimal downtime, maximum results."
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
    "value": "Minimal to none"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "3-7 days"
  },
  {
    "iconKey": "fire",
    "label": "Frequency",
    "value": "Every 4-6 weeks"
  }
];

s.benefits = [
  "Smooths rough skin texture and minimizes pore appearance",
  "Brightens dull complexion and evens skin tone",
  "Reduces appearance of fine lines and surface wrinkles",
  "Fades minor sun damage and age spots",
  "Improves product absorption for enhanced skincare results"
];

s.overview = {
  "p1": "Micropeels are gentle chemical exfoliation treatments using lower concentrations of alpha hydroxy acids (glycolic, lactic), beta hydroxy acids (salicylic), or fruit enzymes to remove the outermost layer of dead skin cells. These lighter peels stimulate cellular turnover without the intensity of deeper chemical peels, revealing smoother, brighter skin while improving minor texture irregularities, fine lines, and mild hyperpigmentation. The treatment involves applying the selected acid solution for a controlled time period, creating a mild tingling sensation as it works to dissolve the bonds between dead skin cells.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our licensed estheticians customize each micropeel based on your SkinIQ analysis results and skin goals during your complimentary consultation. We offer post-treatment soothing masks and provide detailed aftercare instructions, plus our signature 2-week follow-up ensures your skin is responding optimally to the treatment."
};

s.whyReluxe = [
  {
    "title": "Custom Acid Selection",
    "body": "Our estheticians choose from multiple acid types and concentrations based on your specific skin concerns and tolerance, ensuring optimal results without over-treating."
  },
  {
    "title": "SkinIQ Analysis",
    "body": "Every micropeel begins with our advanced skin analysis to identify exactly which areas need attention and which acid formulation will be most effective."
  },
  {
    "title": "Medical-Grade Formulations",
    "body": "We use professional-strength peeling agents from trusted brands like SkinBetter Science and SkinCeuticals that aren't available for at-home use."
  }
];

s.howItWorks = [
  {
    "title": "Skin Assessment",
    "body": "Your esthetician analyzes your skin using our SkinIQ technology and selects the appropriate acid type and concentration for your specific needs and sensitivity level."
  },
  {
    "title": "Acid Application",
    "body": "The chosen chemical solution is carefully applied to clean skin and left on for a predetermined time based on your skin's response and tolerance."
  },
  {
    "title": "Neutralization & Soothing",
    "body": "The acid is neutralized and removed, followed by application of a calming mask and moisturizer to comfort the skin and minimize any temporary redness."
  }
];

s.candidates = {
  "good": [
    "Mild sun damage and age spots",
    "Rough or uneven skin texture",
    "Clogged pores and blackheads",
    "Dull, lackluster complexion",
    "Fine lines around eyes and mouth"
  ],
  "notIdeal": [
    "Active acne breakouts or inflamed skin",
    "Recent sunburn or excessive sun exposure",
    "Pregnancy or breastfeeding"
  ]
};

s.pricingMatrix = {
  "subtitle": "Micropeels offer an affordable entry point for professional chemical exfoliation with maintenance-friendly pricing.",
  "sections": [
    {
      "title": "Micropeel Pricing",
      "note": "Perfect for monthly maintenance and gradual skin improvement",
      "membershipCallout": "VIP Members save 10-15% on all services",
      "rows": [
        {
          "label": "Single Micropeel",
          "subLabel": "Customized acid selection based on skin analysis",
          "single": "Starting at $89",
          "membership": "Starting at $76"
        },
        {
          "label": "Micropeel + Dermaplaning",
          "subLabel": "Enhanced exfoliation with hair removal",
          "single": "Starting at $139",
          "membership": "Starting at $119"
        }
      ],
      "promo": "Add LED light therapy for additional $25",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid retinoids, AHA/BHA products for 3-5 days prior",
      "No sun exposure or tanning 1 week before treatment",
      "Discontinue any exfoliating treatments or scrubs",
      "Arrive with clean skin free of makeup and products"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply gentle, fragrance-free moisturizer as needed",
      "Use broad-spectrum SPF 30+ daily (essential for 1-2 weeks)",
      "Avoid active ingredients like retinoids for 3-5 days",
      "No picking or peeling of flaking skin",
      "Gentle cleansing only - avoid scrubs or harsh products"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize your micropeel results with these expert recommendations from our Indiana providers.",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule micropeels during cooler months or when you can avoid extended sun exposure for best results and minimal complications."
    },
    {
      "heading": "Layer Smart",
      "body": "Pair monthly micropeels with HydraFacials every 6 weeks for comprehensive skin renewal that addresses both surface texture and deep pore cleansing."
    },
    {
      "heading": "Product Prep",
      "body": "Use SkinBetter Science or SkinCeuticals vitamin C serums between treatments to enhance brightening results and protect newly revealed skin."
    },
    {
      "heading": "Gradual Progression",
      "body": "Start with gentler acids like lactic or mandelic, then progress to glycolic or salicylic based on your skin's adaptation and tolerance over time."
    }
  ]
};

s.faq = [
  {
    "q": "What is a micropeel?",
    "a": "A micropeel is a lighter chemical peel designed for gentle exfoliation with minimal downtime — often called a \"lunchtime peel.\" It uses mild concentrations of acids like glycolic, salicylic, lactic, or light TCA to remove the outermost layer of dead skin cells, revealing brighter, smoother skin underneath. Micropeels are perfect for regular maintenance between deeper treatments or for clients who want consistent improvement without disrupting their schedule."
  },
  {
    "q": "How much does a micropeel cost at RELUXE Med Spa?",
    "a": "Micropeel pricing at RELUXE is accessible and varies depending on the acid type and any add-ons like dermaplaning, LED light therapy, or hydration masks. VIP Members save 10-15% on every treatment. We offer transparent pricing during your free consultation so you know exactly what to expect. Many clients find micropeels to be one of the most affordable ways to maintain great skin."
  },
  {
    "q": "Does a micropeel hurt?",
    "a": "Micropeels are very well-tolerated. Most clients feel a mild tingling or slight warmth during the application that lasts just a few minutes. Lighter glycolic and lactic peels are the gentlest, while TCA-based micropeels may produce a bit more sensation. Your esthetician adjusts the strength to your comfort level and skin tolerance. Most clients rate discomfort at 1-2 out of 10."
  },
  {
    "q": "What results can I expect from a micropeel?",
    "a": "After a single micropeel you'll notice brighter, smoother skin with a healthy glow. Over a series of treatments, clients see improved texture, reduced pore appearance, faded dark spots, and a more even skin tone. Micropeels also enhance the effectiveness of your at-home skincare products by removing the dead skin barrier. Results are cumulative — the more consistent you are, the better your skin looks."
  },
  {
    "q": "How often should I get a micropeel?",
    "a": "Micropeels can safely be done every 2-4 weeks, making them ideal for regular maintenance. Many clients schedule them monthly as part of their skincare routine. They also work well between deeper treatments like the Perfect Derma Peel or Morpheus8 to keep skin bright and smooth during recovery periods. Your RELUXE esthetician will recommend a frequency based on your skin type and goals."
  },
  {
    "q": "What is the downtime after a micropeel?",
    "a": "Downtime is minimal to none — that's why they're called lunchtime peels. You may experience slight dryness or very mild flaking for 1-2 days, but nothing that requires you to cancel plans. Most clients apply makeup the same day and return to work immediately. Avoid direct sun and use SPF for 48 hours. Deeper micropeel options (like light TCA) may cause an extra day of flaking."
  },
  {
    "q": "What is the difference between a micropeel and a regular chemical peel?",
    "a": "Micropeels use lower acid concentrations and work on the superficial layer of skin, delivering gentle exfoliation with minimal downtime. Regular chemical peels — like the BioRePeel or Perfect Derma Peel — penetrate deeper for more dramatic results but may involve more peeling and recovery time. Think of micropeels as consistent maintenance and deeper peels as periodic intensive treatments. At RELUXE, we help you build a plan that uses both strategically."
  },
  {
    "q": "Who is a good candidate for a micropeel?",
    "a": "Micropeels are suitable for nearly all skin types and tones. They're ideal for clients new to chemical peels, those with sensitive skin, anyone wanting maintenance between deeper treatments, and people who simply cannot afford downtime. They're also excellent for teens and young adults dealing with mild acne or uneven texture. Micropeels are not recommended on actively sunburned skin, open wounds, or for those using isotretinoin. Book a free consultation at RELUXE to get started."
  },
  {
    "q": "What should I expect during a micropeel appointment at RELUXE?",
    "a": "Your appointment takes about 30-45 minutes depending on add-ons. Your esthetician starts with a skin analysis, cleanses your skin, and applies the micropeel solution in controlled layers. After the peel, soothing products and SPF are applied. If you've added dermaplaning, LED therapy, or a hydration mask, those are incorporated into the session. You'll leave with clear aftercare instructions and noticeably fresher skin."
  },
  {
    "q": "Can I add dermaplaning or LED therapy to my micropeel?",
    "a": "Absolutely — and we recommend it. Dermaplaning before your micropeel removes dead skin and peach fuzz, allowing the acids to penetrate more evenly for better results. LED light therapy after the peel calms inflammation and boosts collagen production. A hydration mask is another popular add-on that locks in moisture and soothes the skin. Your esthetician will recommend the best combination for your skin."
  },
  {
    "q": "Can I combine micropeels with other treatments at RELUXE?",
    "a": "Yes. Micropeels fit seamlessly into a broader skincare plan. Many clients alternate micropeels with deeper peels or facials on a monthly rotation. They also complement injectable treatments, microneedling, and laser sessions when spaced appropriately. Micropeels are one of the most flexible treatments we offer — your RELUXE esthetician will help you build a schedule that keeps your skin looking its best year-round."
  },
  {
    "q": "What types of micropeels does RELUXE offer?",
    "a": "RELUXE offers a range of micropeel options tailored to your skin concerns. Light glycolic peels brighten and smooth, salicylic peels target acne and congestion, lactic peels hydrate and gently exfoliate sensitive skin, and light TCA peels address texture and early pigmentation. Your esthetician selects the acid type and strength based on your skin analysis, goals, and tolerance — every micropeel at RELUXE is customized, never one-size-fits-all."
  }
];

export default s;
