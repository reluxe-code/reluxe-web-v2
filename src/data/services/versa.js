// src/data/services/versa.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('versa');

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

s.tagline = "Premium hyaluronic acid filler engineered for less swelling";

s.seo = {
  "title": "Versa Filler in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Premium Versa hyaluronic acid filler with less swelling. Expert injectors in Westfield & Carmel. $650/syringe. Free consultation."
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
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "9-12 months"
  }
];

s.benefits = [
  "Thixofix Technology designed to reduce post-injection swelling and bruising",
  "Exceptional value pricing for premium hyaluronic acid filler results",
  "Smooth, cohesive gel texture that integrates naturally with facial tissues",
  "Versatile formulation ideal for both lip enhancement and facial contouring",
  "Long-lasting results with natural movement and expression preservation"
];

s.overview = {
  "p1": "Revanesse Versa is a premium hyaluronic acid dermal filler specifically engineered with Thixofix Technology, which creates optimal gel characteristics that may reduce post-injection swelling and bruising. This advanced formulation utilizes cross-linked hyaluronic acid molecules to restore volume, smooth lines, and enhance facial contours, particularly excelling in lip augmentation and nasolabial fold correction. The unique manufacturing process creates a smooth, cohesive gel that integrates naturally with your tissue while maintaining structural integrity for consistent, natural-looking results.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our expert nurse practitioners and RN injectors utilize precise injection techniques with Versa to achieve your aesthetic goals while minimizing discomfort and downtime. Every treatment begins with a complimentary consultation to assess your facial anatomy and create a customized injection plan, followed by our signature 2-week follow-up to ensure optimal results and your complete satisfaction."
};

s.whyReluxe = [
  {
    "title": "Expert Injection Technique",
    "body": "Our NP-led team specializes in advanced injection patterns and cannula techniques that maximize Versa's low-swelling benefits while ensuring precise placement for natural results."
  },
  {
    "title": "Comprehensive Follow-up Care",
    "body": "Every Versa treatment includes a complimentary 2-week follow-up appointment to assess results, address any concerns, and perform touch-ups if needed."
  },
  {
    "title": "Value-Driven Pricing",
    "body": "Versa offers exceptional value at $650 per syringe ($600 for VIP members), making premium filler results more accessible without compromising quality."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Mapping",
    "body": "Your provider analyzes your facial anatomy and discusses your goals, then marks injection points for optimal Versa placement and natural-looking enhancement."
  },
  {
    "title": "Precise Injection",
    "body": "Using fine needles or cannulas, Versa is strategically injected into target areas, with the Thixofix Technology helping minimize immediate swelling and discomfort."
  },
  {
    "title": "Immediate Integration",
    "body": "The hyaluronic acid gel integrates with your natural tissues, providing instant volume and smoothing while continuing to attract moisture for optimal hydration and plumpness."
  }
];

s.candidates = {
  "good": [
    "Thin or aging lips seeking volume enhancement",
    "Nasolabial folds and marionette lines",
    "Cheek volume loss and facial contouring needs",
    "First-time filler patients concerned about swelling",
    "Budget-conscious patients wanting premium results"
  ],
  "notIdeal": [
    "Active skin infections in treatment areas",
    "Pregnancy or breastfeeding",
    "Severe allergies to hyaluronic acid or lidocaine"
  ]
};

s.pricingMatrix = {
  "subtitle": "Transparent, value-driven pricing for premium hyaluronic acid filler treatments",
  "sections": [
    {
      "title": "Revanesse Versa Pricing",
      "note": "Exceptional value for premium filler with advanced Thixofix Technology",
      "membershipCallout": "VIP Members save $50 per syringe",
      "rows": [
        {
          "label": "Versa Dermal Filler",
          "subLabel": "Lips, lines, and facial volume enhancement",
          "single": "$650",
          "membership": "$600"
        }
      ],
      "promo": "Cherry financing available for qualified patients",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Discontinue blood-thinning supplements (fish oil, vitamin E) 1 week prior",
      "Avoid alcohol for 24 hours before treatment to minimize bruising risk",
      "Arrive with clean skin, free of makeup and skincare products",
      "Consider scheduling treatments at least 2 weeks before important events"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply cold compresses for 10-15 minutes several times during the first 24 hours",
      "Avoid strenuous exercise and excessive heat exposure for 24-48 hours",
      "Sleep with your head elevated for the first 1-2 nights to minimize swelling",
      "Avoid touching or massaging treated areas unless specifically instructed",
      "Stay well-hydrated to support the hyaluronic acid's moisture-attracting properties"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your Versa filler results and treatment experience",
  "items": [
    {
      "heading": "Timing Strategy",
      "body": "Schedule Versa treatments 2-3 weeks before important events to allow for any minor swelling to fully resolve and results to settle naturally."
    },
    {
      "heading": "Hydration Benefits",
      "body": "Maintain excellent hydration before and after treatment, as hyaluronic acid attracts up to 1000 times its weight in water for optimal plumping effects."
    },
    {
      "heading": "Combination Approach",
      "body": "Versa pairs beautifully with neurotoxins like Botox or Dysport for comprehensive facial rejuvenation, addressing both volume loss and dynamic wrinkles."
    },
    {
      "heading": "Touch-up Timing",
      "body": "If additional volume is desired, wait at least 2 weeks between sessions to allow for complete integration and accurate assessment of results."
    }
  ]
};

s.faq = [
  {
    "q": "What is Revanesse Versa?",
    "a": "Revanesse Versa is a hyaluronic acid (HA) dermal filler made by Prollenium. It's a versatile, multi-purpose filler known for its smooth consistency and even particle size. Versa is FDA-approved for the correction of moderate to severe nasolabial folds and is widely used off-label for lip enhancement, marionette lines, and other facial areas. Its unique spherical particle technology contributes to a uniform gel that distributes evenly in tissue."
  },
  {
    "q": "How much does Versa filler cost at RELUXE?",
    "a": "Versa is one of the most competitively priced HA fillers on the market, making it an excellent value option without sacrificing quality. Pricing at RELUXE is per syringe. Most patients need 1-3 syringes depending on their goals. VIP Members save 10-15% on every syringe. We provide clear, transparent pricing during your free consultation — you'll know exactly what your treatment will cost before we begin."
  },
  {
    "q": "Does Versa filler hurt?",
    "a": "Versa contains built-in lidocaine to numb the treatment area as it's injected. Most patients rate the discomfort 2-3 out of 10. At RELUXE, we also apply topical numbing cream before treatment for additional comfort. Many patients are surprised at how comfortable the experience is. Lip injections tend to be the most sensitive area, but the built-in anesthetic makes even lip filler very manageable."
  },
  {
    "q": "How long does Versa last?",
    "a": "Versa typically lasts 6-12 months depending on the area treated, the amount injected, and your individual metabolism. Some patients report results lasting beyond 12 months, particularly in areas with less movement. Touch-up appointments at RELUXE can extend and maintain your results over time. Your provider will discuss expected longevity for your specific treatment plan during your consultation."
  },
  {
    "q": "Is it true that Versa causes less swelling?",
    "a": "Yes — Versa is widely recognized for producing less post-injection swelling compared to many competing HA fillers. This is attributed to its unique spherical particle technology, which creates a uniform gel that integrates smoothly into tissue with less inflammatory response. Less swelling means your final results are visible sooner and the recovery period is shorter. This makes Versa a popular choice for patients who want minimal downtime, especially for lip filler."
  },
  {
    "q": "What areas can Versa treat?",
    "a": "Versa is FDA-approved for nasolabial folds (smile lines) and is commonly used for lip augmentation and enhancement, marionette lines, oral commissures (corners of the mouth), chin enhancement, and smoothing fine lines. Its versatility is one of its greatest strengths — the smooth, even consistency works well in both delicate areas like lips and deeper folds around the mouth. Your RELUXE injector will recommend the best product for each area of your face."
  },
  {
    "q": "When will I see results from Versa?",
    "a": "You'll see immediate improvement right after injection. Because Versa typically causes less swelling than other fillers, your results settle faster — many patients see their final result within 3-5 days rather than the 1-2 weeks common with other products. Your RELUXE provider may schedule a follow-up at 2-4 weeks to assess your results and perform any refinements if needed."
  },
  {
    "q": "How is Versa different from Juvederm or Restylane?",
    "a": "Versa uses a unique spherical particle technology that creates an exceptionally uniform, smooth gel. This contributes to less swelling, easier injection, and even distribution in tissue. While Juvederm and Restylane have longer track records and more specialized product lines, Versa offers comparable results at a more accessible price point. Many patients and injectors appreciate Versa for its smoothness and reduced downtime. Your RELUXE provider can help you compare options during your free consultation."
  },
  {
    "q": "What are the side effects of Versa?",
    "a": "Common side effects include mild swelling, bruising, redness, and tenderness at the injection site. Versa is known for producing less swelling than many competitors, so these effects are often milder and shorter-lived. Most side effects resolve within 2-5 days. Lumps or firmness are uncommon but can occur and typically resolve on their own. Serious complications are rare with experienced injectors. All filler treatments at RELUXE are performed under Medical Director oversight."
  },
  {
    "q": "Who is a good candidate for Versa?",
    "a": "Versa is a great option for both first-time filler patients and experienced filler patients looking for a high-quality product with less swelling. It's ideal for anyone wanting to smooth smile lines, enhance lips, or add subtle volume to the lower face. Good candidates are healthy adults who are not pregnant or breastfeeding and have no allergies to HA or lidocaine. Book a free consultation at RELUXE to discuss whether Versa is the right fit for your goals."
  },
  {
    "q": "What should I do after Versa treatment?",
    "a": "After your Versa treatment at RELUXE, avoid strenuous exercise for 24-48 hours, skip alcohol for 24 hours, and avoid pressing or massaging the treated area unless instructed. Stay away from extreme heat (saunas, steam rooms, hot yoga) for 48 hours. Apply ice gently to help with swelling and consider Arnica for bruising. Most patients return to their normal routine immediately. Your injector will provide a detailed aftercare guide."
  },
  {
    "q": "Why choose RELUXE for Versa filler in Westfield or Carmel?",
    "a": "RELUXE offers Versa as part of our comprehensive filler menu because we believe in giving patients options that fit their goals and budget. Our expert injectors are trained in all major filler brands and can recommend the best product for each area of your face. All treatments are performed under Medical Director oversight. VIP Members save 10-15% on every visit. With locations in Westfield and Carmel, Indiana, we offer free consultations and transparent pricing with no hidden fees."
  }
];

export default s;
