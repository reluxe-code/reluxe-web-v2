// src/data/services/facials.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('facials');

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

s.tagline = "Custom glow for every skin type. Dermaplaning included.";

s.seo = {
  "title": "Custom Facials in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Signature facials with dermaplaning at RELUXE Med Spa. Medical-grade skincare for all skin types in Westfield and Carmel, Indiana."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "60 minutes"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Frequency",
    "value": "Monthly"
  }
];

s.benefits = [
  "Deep pore cleansing and extraction of blackheads and congestion",
  "Immediate smoothness and glow from dermaplaning exfoliation",
  "Enhanced absorption of active ingredients and serums",
  "Reduced appearance of fine lines and texture irregularities",
  "Customized treatment for acne, aging, pigmentation, or sensitivity"
];

s.overview = {
  "p1": "Our Signature Facials combine professional-grade cleansing, exfoliation, extractions, and hydrating masks with complimentary dermaplaning using a medical-grade surgical blade to remove vellus hair and dead skin cells. This multi-step treatment deep cleanses pores, improves product absorption, and reveals smoother, more radiant skin through customized serums and medical-grade ingredients tailored to your specific skin type and concerns.",
  "p2": "At RELUXE, our licensed estheticians begin every facial with a complimentary SkinIQ Analysis to identify your unique skin needs, then customize your treatment using clinical-grade products from SkinBetter Science, SkinCeuticals, and other pharmaceutical brands. Your experience includes personalized product recommendations and a follow-up consultation to track your skin's progress."
};

s.whyReluxe = [
  {
    "title": "Always Includes Dermaplaning",
    "body": "Every Signature Facial includes complimentary dermaplaning with a sterile surgical blade, removing vellus hair and dead skin cells for immediate smoothness and enhanced product penetration."
  },
  {
    "title": "Medical-Grade Products",
    "body": "We use only pharmaceutical-grade skincare including SkinBetter Science, SkinCeuticals, and Alastin formulations that deliver clinical results beyond what's available at traditional day spas."
  },
  {
    "title": "Customized Analysis",
    "body": "Our complimentary SkinIQ skin analysis uses advanced imaging technology to identify concerns invisible to the naked eye, ensuring your facial addresses your specific skin needs."
  }
];

s.howItWorks = [
  {
    "title": "Analysis & Cleansing",
    "body": "Your esthetician performs a SkinIQ analysis to identify your skin type and concerns, then begins with a thorough cleanse using medical-grade products selected for your specific needs."
  },
  {
    "title": "Dermaplaning & Extractions",
    "body": "A sterile surgical blade removes vellus hair and dead skin cells, followed by gentle extractions to clear congested pores and remove blackheads."
  },
  {
    "title": "Customized Treatment",
    "body": "Based on your skin analysis, we apply targeted serums, masks, and treatments using pharmaceutical-grade ingredients, finishing with appropriate moisturizer and SPF protection."
  }
];

s.candidates = {
  "good": [
    "All skin types seeking regular maintenance",
    "Dull or rough skin texture",
    "Clogged pores and blackheads",
    "Fine lines and aging concerns",
    "Preparation for special events"
  ],
  "notIdeal": [
    "Active inflammatory acne or cystic breakouts",
    "Open wounds or active skin infections",
    "Recent chemical peels or laser treatments"
  ]
};

s.pricingMatrix = {
  "subtitle": "Signature Facials include dermaplaning and are customized to your unique skin needs",
  "sections": [
    {
      "title": "Facial Services",
      "note": "All facials include complimentary dermaplaning and SkinIQ analysis",
      "membershipCallout": "VIP Members save 10-15% on all facial services",
      "rows": [
        {
          "label": "Signature Facial",
          "subLabel": "60-minute customized treatment with dermaplaning",
          "single": "Starting at $150",
          "membership": "Starting at $135"
        },
        {
          "label": "Teen Facial",
          "subLabel": "Customized treatment for adolescent skin concerns",
          "single": "Starting at $120",
          "membership": "Starting at $108"
        }
      ],
      "promo": "Ask about package pricing for multiple sessions",
      "ctaText": "Book Your Facial"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your facial",
    "points": [
      "Discontinue retinoids and exfoliating acids 2-3 days prior",
      "Arrive makeup-free or plan extra time for removal",
      "Inform your esthetician of any new skincare products or recent treatments",
      "Avoid sun exposure and tanning for 48 hours before treatment"
    ]
  },
  "after": {
    "title": "After your facial",
    "points": [
      "Apply SPF 30+ and avoid direct sun exposure for 24-48 hours",
      "Skip active ingredients like retinoids or acids for 24-48 hours",
      "Keep skin hydrated with gentle, non-comedogenic moisturizers",
      "Avoid touching or picking at your skin",
      "Schedule your next facial in 4-6 weeks for optimal results"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert tips to maximize your facial results and maintain healthy skin between treatments",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule facials 3-7 days before important events to allow any minor redness to subside while maintaining your glow."
    },
    {
      "heading": "Home Maintenance",
      "body": "Use medical-grade cleansers and moisturizers between treatments to extend results—our estheticians will recommend the best products for your skin type."
    },
    {
      "heading": "Seasonal Adjustments",
      "body": "Indiana's changing seasons require different skincare approaches—dry winters need more hydrating treatments while humid summers may require deeper pore cleansing."
    },
    {
      "heading": "Combination Benefits",
      "body": "Pair monthly facials with quarterly chemical peels or Morpheus8 treatments for comprehensive skin rejuvenation and anti-aging results."
    }
  ]
};

s.faq = [
  {
    "q": "What is a facial and what does it include at RELUXE?",
    "a": "A facial at RELUXE is a 60-minute customized skin treatment performed by an expert esthetician. Every facial includes dermaplaning to remove dead skin and peach fuzz, followed by cleansing, exfoliation, extractions (if needed), a treatment mask, and hydration. We offer a Signature Facial, Teen Facial, and custom facials tailored for concerns like acne, anti-aging, and brightening."
  },
  {
    "q": "How much does a facial cost at RELUXE Med Spa?",
    "a": "Facial pricing at RELUXE varies by treatment type. Our Signature Facial and custom facials are competitively priced for the Westfield and Carmel area. VIP Members save 10-15% on every facial. We provide transparent pricing during your free consultation so you know exactly what to expect before booking."
  },
  {
    "q": "Does a facial hurt?",
    "a": "Facials at RELUXE are designed to be relaxing and comfortable. Extractions can cause mild, brief discomfort, and dermaplaning feels like a gentle scraping sensation with no pain. Most clients describe the experience as deeply relaxing — many even fall asleep during their treatment."
  },
  {
    "q": "How often should I get a facial?",
    "a": "We recommend a professional facial every 4-6 weeks to align with your skin's natural renewal cycle. Consistent treatments help manage acne, slow visible aging, and maintain a healthy glow. Your esthetician will build a personalized schedule based on your skin type, concerns, and budget."
  },
  {
    "q": "What results can I expect from a facial?",
    "a": "After a single facial you'll notice brighter, smoother, more hydrated skin immediately. Over a series of treatments, clients see reduced breakouts, more even skin tone, smaller-looking pores, and improved texture. Dermaplaning also allows your skincare products to absorb more effectively at home."
  },
  {
    "q": "Is there any downtime after a facial?",
    "a": "There is little to no downtime after most facials. You may experience mild redness for an hour or two, especially after extractions. We recommend avoiding direct sun, heavy makeup, and active ingredients like retinol for 24 hours. Most clients return to their normal routine immediately."
  },
  {
    "q": "What is the difference between a facial and a chemical peel?",
    "a": "A facial is a comprehensive skin treatment that includes cleansing, dermaplaning, exfoliation, extractions, and hydration — it's both therapeutic and relaxing. A chemical peel uses acids to exfoliate at a deeper level for more dramatic results on texture, pigmentation, and fine lines. Many clients alternate between facials and peels for the best results."
  },
  {
    "q": "Who is a good candidate for a facial?",
    "a": "Almost everyone benefits from professional facials — from teens dealing with breakouts to adults managing aging concerns. Our Teen Facial is specifically designed for younger skin, while our Signature and custom facials address adult acne, dullness, fine lines, and hyperpigmentation. The only exceptions are active skin infections or open wounds. Book a free consultation and we'll recommend the right treatment."
  },
  {
    "q": "What should I expect during my facial appointment at RELUXE?",
    "a": "Your 60-minute appointment begins with a skin analysis and discussion of your goals. Your esthetician then performs dermaplaning, customized cleansing and exfoliation, extractions if needed, a targeted treatment mask, and finishes with serums, moisturizer, and SPF. You'll leave with glowing skin and personalized at-home care recommendations."
  },
  {
    "q": "Can I combine a facial with other treatments?",
    "a": "Yes. Facials pair well with LED light therapy, chemical peels, and hydration masks for enhanced results. Many clients add a facial to their injectable visits for a full refresh. Your esthetician can recommend the best combination based on your skin goals and schedule."
  },
  {
    "q": "What makes RELUXE facials different from other med spas in Westfield and Carmel?",
    "a": "Every RELUXE facial includes dermaplaning at no extra charge, is fully customized to your skin concerns, and is performed by experienced estheticians — not rushed technicians. We use medical-grade products, provide honest recommendations, and never upsell treatments you don't need. Our VIP Membership makes consistent skincare affordable, and our Westfield and Carmel locations make it convenient."
  },
  {
    "q": "Do you offer facials for acne-prone skin?",
    "a": "Absolutely. Our custom acne facials target breakouts with deep cleansing, extractions, anti-bacterial treatments, and calming masks. We address the root causes — excess oil, clogged pores, inflammation — without irritating your skin. Your esthetician will also recommend at-home products and a treatment frequency to keep breakouts under control long-term."
  }
];

export default s;
