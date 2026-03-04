// src/data/services/skinpen.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('skinpen');

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

s.tagline = "Refine texture and tone with FDA-cleared precision microneedling";

s.seo = {
  "title": "SkinPen Microneedling Westfield & Carmel IN | RELUXE Med Spa",
  "description": "FDA-cleared SkinPen microneedling for acne scars, fine lines & texture. Add PRP for enhanced results. Expert care in Westfield & Carmel, Indiana."
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
    "value": "2-3 days redness"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "4-6 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "6-12 months"
  }
];

s.benefits = [
  "Reduces appearance of acne scars and surgical scars",
  "Minimizes enlarged pores and improves skin texture",
  "Stimulates natural collagen and elastin production",
  "Safe for all skin types and tones year-round",
  "Enhances absorption of topical skincare products"
];

s.overview = {
  "p1": "SkinPen is the first FDA-cleared microneedling device that creates controlled micro-injuries to stimulate your skin's natural wound healing process, triggering collagen and elastin production. Using 14 precisely calibrated needles that penetrate 0.25-2.5mm deep, this treatment addresses acne scarring, fine lines, enlarged pores, and uneven texture by remodeling dermal architecture from within. The 30-45 minute session begins with topical numbing for comfort, followed by the sterile, single-use tip gliding across treatment areas with adjustable depth settings. For enhanced results, many patients at our Westfield and Carmel locations add PRP (platelet-rich plasma) as a topical serum during treatment, creating our signature VAMP (Vampire) facial.",
  "p2": "At RELUXE, your SkinPen treatment is performed by our licensed medical professionals who customize needle depth and treatment patterns based on your specific skin concerns and goals. We provide comprehensive numbing, sterile technique, and medical-grade aftercare products to ensure optimal healing and results. Every patient receives a complimentary 2-week follow-up to assess progress and answer questions about their skin's transformation."
};

s.whyReluxe = [
  {
    "title": "Medical-Grade Precision",
    "body": "Our providers use the only FDA-cleared microneedling device with precise depth control, ensuring consistent results while maintaining the highest safety standards."
  },
  {
    "title": "PRP Enhancement Option",
    "body": "Add platelet-rich plasma from your own blood as a topical serum during treatment to supercharge healing and collagen production for dramatically improved results."
  },
  {
    "title": "Comprehensive Numbing Protocol",
    "body": "We use medical-grade topical anesthetics applied 30 minutes before treatment, making your SkinPen session comfortable even at therapeutic depths."
  },
  {
    "title": "Sterile Single-Use Tips",
    "body": "Every treatment uses a brand-new, sterile needle cartridge that's discarded after your session, eliminating any risk of cross-contamination or infection."
  }
];

s.howItWorks = [
  {
    "title": "Preparation Phase",
    "body": "Your skin is cleansed and medical-grade numbing cream is applied for 20-30 minutes to ensure comfort during treatment. We also discuss your specific concerns and customize needle depth accordingly."
  },
  {
    "title": "Microneedling Treatment",
    "body": "The SkinPen device creates thousands of controlled micro-channels in your skin at predetermined depths, triggering your body's natural healing cascade and collagen remodeling process."
  },
  {
    "title": "Recovery Support",
    "body": "Immediate post-treatment serum application and detailed aftercare instructions help optimize healing, while your 2-week follow-up ensures you're progressing as expected."
  }
];

s.candidates = {
  "good": [
    "Acne scars and surgical scars",
    "Fine lines and wrinkles",
    "Large pores and rough texture",
    "Melasma and hyperpigmentation",
    "Stretch marks on body"
  ],
  "notIdeal": [
    "Active acne breakouts",
    "Open wounds or active infections",
    "Pregnant or breastfeeding"
  ]
};

s.pricingMatrix = {
  "subtitle": "SkinPen microneedling is priced per session with package discounts available for optimal results.",
  "sections": [
    {
      "title": "SkinPen Microneedling",
      "note": "Most patients achieve best results with a series of 3-6 treatments spaced 4-6 weeks apart.",
      "membershipCallout": "VIP Members save 10-15% on all packages",
      "rows": [
        {
          "label": "Single SkinPen Session",
          "subLabel": "Face and neck treatment",
          "single": "Starting at $400",
          "membership": "Starting at $360"
        },
        {
          "label": "SkinPen + PRP (VAMP)",
          "subLabel": "Enhanced healing with your own platelets",
          "single": "Starting at $500",
          "membership": "Starting at $450"
        },
        {
          "label": "Three-Session Package",
          "subLabel": "Recommended treatment series",
          "single": "Contact for pricing",
          "membership": "Additional member savings apply"
        }
      ],
      "promo": "Cherry financing available for all packages",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid retinoids, AHAs, and BHAs for 3-5 days before treatment",
      "Discontinue blood-thinning medications if medically cleared by your doctor",
      "Arrive with a clean face - no makeup, lotions, or skincare products",
      "Stay hydrated and eat a good meal if adding PRP to prevent lightheadedness"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply only the provided post-treatment serum for first 24 hours",
      "Avoid direct sun exposure and wear SPF 30+ daily for at least one week",
      "Do not use active ingredients (retinoids, acids) for 3-5 days post-treatment",
      "Avoid heavy exercise, saunas, and swimming for 24-48 hours",
      "Keep skin moisturized with gentle, fragrance-free products as directed"
    ]
  }
};

s.flexEverything = {
  "intro": "Our medical team shares their professional insights for maximizing your SkinPen results.",
  "items": [
    {
      "heading": "Series Planning",
      "body": "Schedule treatments 4-6 weeks apart to allow full collagen remodeling between sessions. Most patients see dramatic improvements after their second treatment."
    },
    {
      "heading": "PRP Enhancement",
      "body": "Adding PRP can accelerate healing time and boost collagen production by up to 30%. Best for patients with deeper scarring or those seeking maximum anti-aging benefits."
    },
    {
      "heading": "Depth Customization",
      "body": "We adjust needle depth from 0.25mm for sensitive areas to 2.5mm for deep scars. Your provider will determine optimal settings based on your skin thickness and concerns."
    },
    {
      "heading": "Combination Approach",
      "body": "SkinPen pairs beautifully with our medical-grade chemical peels 4-6 weeks later, or with IPL treatments for comprehensive skin rejuvenation addressing both texture and pigmentation."
    }
  ]
};

s.faq = [
  {
    "q": "What is SkinPen microneedling and how does it work?",
    "a": "SkinPen is an FDA-cleared microneedling device that creates thousands of tiny, controlled micro-channels in the skin using fine sterile needles. This triggers your body's natural wound-healing response, stimulating new collagen and elastin production. The result is smoother texture, refined pores, reduced scarring, and overall skin rejuvenation — all using your body's own repair process."
  },
  {
    "q": "How much does SkinPen cost at RELUXE?",
    "a": "SkinPen microneedling is priced per session at RELUXE, with 4-session packages available at a savings. Adding PRP (VAMP) to your treatment is an additional upgrade. VIP Members receive discounted pricing on all microneedling treatments. We provide exact pricing during your consultation based on your treatment area and goals."
  },
  {
    "q": "Does SkinPen microneedling hurt?",
    "a": "We apply topical numbing cream for 20-30 minutes before treatment, so most patients feel only mild pressure and a light scratching sensation. Most rate the comfort at 3-4 out of 10. The forehead and areas near bone tend to be slightly more sensitive. Overall, it's very manageable and much more comfortable than patients expect."
  },
  {
    "q": "What does SkinPen treat?",
    "a": "SkinPen effectively treats acne scars, fine lines, enlarged pores, uneven skin texture, stretch marks, sun damage, and dull skin. It's also excellent for overall skin rejuvenation and can improve the appearance of surgical scars. Adding PRP (platelet-rich plasma) enhances results for scarring and aging concerns."
  },
  {
    "q": "How many SkinPen sessions do I need?",
    "a": "Most patients see great results with a series of 3-4 sessions spaced 4-6 weeks apart. Mild texture concerns may improve in 2-3 sessions, while deeper acne scarring may benefit from 4-6 sessions. Your provider will recommend a personalized plan. Many patients do 1-2 maintenance sessions per year afterward."
  },
  {
    "q": "What is the downtime after SkinPen?",
    "a": "Expect 24-72 hours of redness, similar to a mild sunburn. Some patients experience minor swelling and skin tightness. By day 3-4, most people are comfortable going without makeup. Skin may feel dry and lightly flaky for 3-5 days as it heals. Avoid active skincare ingredients (retinol, acids, vitamin C) for 5-7 days post-treatment."
  },
  {
    "q": "When will I see SkinPen results?",
    "a": "You'll notice an immediate \"glow\" as your skin heals, with improved texture visible within 2-4 weeks. Collagen remodeling continues for 3-6 months after treatment, so results keep improving. Each session in your series compounds the improvement. Full results from a complete series are typically visible at 2-3 months after the final treatment."
  },
  {
    "q": "What is PRP/VAMP and should I add it?",
    "a": "PRP (Platelet-Rich Plasma), sometimes called VAMP, is drawn from your own blood and applied during microneedling. Your platelets contain growth factors that supercharge the healing and collagen-building process. We recommend adding PRP if you're treating acne scars, aging skin, or want the most impactful results possible. It's a premium upgrade worth considering."
  },
  {
    "q": "What is the difference between SkinPen and Morpheus8?",
    "a": "SkinPen is traditional microneedling — it creates micro-channels to stimulate surface-level collagen. Morpheus8 adds radiofrequency (RF) energy through the needles to heat deeper tissue layers, providing skin tightening and fat remodeling in addition to texture improvement. SkinPen has less downtime and is ideal for texture and scars. Morpheus8 is better for laxity and deeper remodeling."
  },
  {
    "q": "Is SkinPen safe for all skin tones?",
    "a": "Yes — SkinPen is safe for all skin types and tones (Fitzpatrick I-VI). Because it works mechanically (not with light or heat), there's minimal risk of hyperpigmentation, making it one of the safest professional skin resurfacing options for darker skin tones. This is a key advantage over many laser treatments."
  },
  {
    "q": "Can I combine SkinPen with other treatments?",
    "a": "Yes — SkinPen pairs well with PRP (same session), chemical peels (spaced 2-4 weeks apart), and medical-grade skincare for maintenance. It's also a great complement to tox and filler for patients who want both injectable rejuvenation and skin texture improvement. Your provider will time treatments appropriately."
  },
  {
    "q": "How do I prepare for SkinPen microneedling?",
    "a": "Stop retinoids and active exfoliants 5-7 days before treatment. Avoid sun exposure and tanning for 1-2 weeks prior. Arrive with clean skin, free of makeup. If you have a history of cold sores, let your provider know — we may prescribe an antiviral as a precaution. Avoid blood thinners and alcohol 24 hours before to minimize bruising."
  }
];

export default s;
