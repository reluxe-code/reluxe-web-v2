// src/data/services/juvederm.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('juvederm');

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

s.tagline = "FDA-approved hyaluronic acid technology for natural volume restoration";

s.seo = {
  "title": "Juvéderm Fillers in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Expert Juvéderm injections in Indiana. Voluma, Vollure, Volbella treatments by NP-led team. Free consultation. Book in Westfield or Carmel today."
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
    "value": "Minimal"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "Immediate"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "12-24 months"
  }
];

s.benefits = [
  "Immediate volume restoration with continued improvement over 2-4 weeks",
  "VYCROSS technology provides smoother integration and longer duration",
  "Lidocaine pre-mixed in formulation for enhanced comfort during injection",
  "Reversible results with hyaluronidase if adjustments are needed",
  "Stimulates natural collagen production for ongoing skin quality improvement"
];

s.overview = {
  "p1": "Juvéderm is a collection of FDA-approved hyaluronic acid dermal fillers engineered with proprietary VYCROSS technology, which cross-links hyaluronic acid molecules to create smooth, long-lasting gels that integrate naturally with your tissue. Each formula in the Juvéderm portfolio is specifically designed for different facial areas and concerns: Voluma and Volux for deep structural support in cheeks and jawlines, Vollure for nasolabial folds and marionette lines, and Volbella for subtle lip enhancement and perioral lines. The hyaluronic acid attracts and binds water molecules, providing immediate volume restoration while stimulating your skin's natural collagen production over time.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our nurse practitioner and registered nurse injectors conduct thorough facial analysis during your complimentary consultation, mapping your unique anatomy to determine the optimal Juvéderm formulation and injection technique for natural-looking results. We provide comprehensive comfort measures including topical numbing and utilize advanced injection techniques to minimize discomfort, followed by our signature two-week follow-up to ensure optimal settling and address any touch-up needs."
};

s.whyReluxe = [
  {
    "title": "Expert Product Selection",
    "body": "Our injectors are trained in the complete Juvéderm portfolio and select the precise formulation based on your facial anatomy, skin thickness, and aesthetic goals rather than using a one-size-fits-all approach."
  },
  {
    "title": "Advanced Injection Techniques",
    "body": "We employ cannula and needle techniques specific to each Juvéderm product, including micro-droplet placement for Volbella and deep structural layering for Voluma to achieve natural, long-lasting results."
  },
  {
    "title": "Comprehensive Follow-Up Care",
    "body": "Every Juvéderm treatment includes a complimentary two-week follow-up appointment to assess settling, address any concerns, and perform touch-ups if needed to ensure optimal results."
  }
];

s.howItWorks = [
  {
    "title": "Facial Mapping",
    "body": "Your injector performs detailed facial analysis to determine optimal injection points, depths, and Juvéderm formulations based on your bone structure, muscle movement, and aesthetic goals."
  },
  {
    "title": "Strategic Injection",
    "body": "Using precise needle or cannula techniques, the selected Juvéderm product is placed in specific tissue layers, with massage and molding to ensure smooth integration and natural contours."
  },
  {
    "title": "Integration Period",
    "body": "The hyaluronic acid immediately attracts water for volume while integrating with your natural tissue over 2-4 weeks, with final results visible once any minor swelling subsides."
  }
];

s.candidates = {
  "good": [
    "Lost facial volume due to aging",
    "Hollow cheeks or temples",
    "Nasolabial folds and marionette lines",
    "Thin or asymmetrical lips",
    "Jawline definition enhancement"
  ],
  "notIdeal": [
    "Active skin infections or inflammation",
    "Severe allergies to hyaluronic acid",
    "Unrealistic expectations for results"
  ]
};

s.pricingMatrix = {
  "subtitle": "Investment varies by product type and treatment area complexity.",
  "sections": [
    {
      "title": "Juvéderm Portfolio Pricing",
      "note": "Pricing reflects the advanced VYCROSS technology and FDA-approved formulations in the Juvéderm collection.",
      "membershipCallout": "VIP Members save $50 per syringe on all Juvéderm treatments",
      "rows": [
        {
          "label": "Voluma/Volux",
          "subLabel": "Deep structural support for cheeks and jawline",
          "single": "$800",
          "membership": "$750"
        },
        {
          "label": "Vollure/Volbella",
          "subLabel": "Nasolabial folds, lips, and fine lines",
          "single": "$750",
          "membership": "$700"
        },
        {
          "label": "Half Syringe Option",
          "subLabel": "Available for touch-ups or minor enhancements",
          "single": "$500",
          "membership": "$450"
        }
      ],
      "promo": "Complimentary consultation and 2-week follow-up included with all treatments",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications, alcohol, and supplements like fish oil for 1 week prior",
      "Discontinue retinoids and exfoliating products 3 days before treatment",
      "Stay well-hydrated and eat a light meal before your appointment",
      "Arrive with clean skin free of makeup in the treatment area"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice intermittently for first 24 hours to minimize swelling",
      "Sleep elevated for 2-3 nights to reduce overnight swelling",
      "Avoid strenuous exercise, saunas, and excessive heat for 48 hours",
      "Gently massage areas as instructed to promote even settling",
      "Avoid makeup for 6 hours and dental work for 2 weeks post-treatment"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights from our nurse practitioner and injection specialists:",
  "items": [
    {
      "heading": "Product Layering",
      "body": "Different Juvéderm products can be strategically layered in the same session—Voluma for deep structural support, then Vollure for surface smoothing—for comprehensive rejuvenation."
    },
    {
      "heading": "Injection Timing",
      "body": "Schedule Juvéderm treatments 2-3 weeks before important events to allow for complete settling and any necessary touch-ups during your follow-up visit."
    },
    {
      "heading": "Combination Benefits",
      "body": "Juvéderm pairs exceptionally well with neuromodulators like Botox, addressing both volume loss and dynamic wrinkles for complete facial rejuvenation."
    },
    {
      "heading": "Maintenance Strategy",
      "body": "Touch-up treatments typically require 30-50% less product than initial sessions, making maintenance more cost-effective while maintaining your results."
    }
  ]
};

s.faq = [
  {
    "q": "What is Juvederm?",
    "a": "Juvederm is a family of hyaluronic acid (HA) dermal fillers made by Allergan, the same company behind Botox. The collection includes several specialized products — Voluma for cheeks and chin, Vollure for nasolabial folds and marionette lines, and Volbella for lips and perioral lines. Each formula uses Allergan's proprietary Vycross technology to create a smooth, long-lasting gel that integrates naturally into your tissue."
  },
  {
    "q": "How much does Juvederm cost at RELUXE?",
    "a": "Juvederm pricing at RELUXE is per syringe and varies by product. Voluma (cheeks/chin) is priced as a premium volumizer, while Vollure and Volbella are priced for their specific indications. VIP Members save 10-15% on every syringe. Most patients need 1-4 syringes depending on their goals. We provide transparent, itemized pricing during your free consultation — no hidden fees."
  },
  {
    "q": "Does Juvederm hurt?",
    "a": "Juvederm contains lidocaine (a numbing agent) mixed directly into the gel, so discomfort is minimal. Most patients rate the experience a 2-4 out of 10. Our injectors at RELUXE also apply topical numbing cream before treatment and use techniques like micro-cannulas when appropriate to further minimize discomfort. Lip injections tend to be the most sensitive area, but the built-in lidocaine makes even lip filler very manageable."
  },
  {
    "q": "How long does Juvederm last?",
    "a": "Duration depends on the specific product. Voluma lasts up to 2 years in the cheeks, making it one of the longest-lasting HA fillers available. Vollure lasts up to 18 months in nasolabial folds. Volbella lasts approximately 12 months in the lips. Individual results vary based on your metabolism, the area treated, and the amount injected. Touch-up appointments help maintain your results over time."
  },
  {
    "q": "When will I see results from Juvederm?",
    "a": "You'll see immediate volume and correction right after your Juvederm injection. However, there is typically mild swelling for 3-7 days (up to 2 weeks for lips), so your final results settle in around the 2-week mark. Your RELUXE injector may schedule a follow-up at 2-4 weeks to assess your results and perform any touch-ups if needed."
  },
  {
    "q": "What areas can Juvederm treat?",
    "a": "The Juvederm family covers nearly every facial area. Voluma adds volume and structure to cheeks, chin, and jawline. Vollure smooths nasolabial folds (smile lines), marionette lines, and pre-jowl areas. Volbella enhances lips, defines the lip border, and softens vertical lip lines. Together, these products allow your RELUXE injector to create a comprehensive facial balancing plan."
  },
  {
    "q": "How is Juvederm different from other fillers?",
    "a": "Juvederm uses Allergan's Vycross crosslinking technology, which creates a smoother gel with a higher concentration of crosslinked HA. This means it typically integrates seamlessly into tissue with less swelling than older formulations. Juvederm has the longest track record of any HA filler family in the U.S. and is the most widely studied. Your RELUXE provider can compare Juvederm to Restylane, RHA, or Versa based on your specific goals."
  },
  {
    "q": "What are the side effects of Juvederm?",
    "a": "Common side effects include mild swelling, bruising, redness, and tenderness at the injection site. These typically resolve within 3-7 days (lip swelling may take up to 2 weeks). Lumps or firmness can occasionally occur and usually resolve on their own or with gentle massage. Serious side effects are rare when performed by an experienced injector. RELUXE's providers are expert-level injectors with Medical Director oversight."
  },
  {
    "q": "Who is a good candidate for Juvederm?",
    "a": "Juvederm is ideal for adults who want to restore lost facial volume, smooth lines and folds, enhance lip size or shape, or improve overall facial proportions. Good candidates are in general good health, not pregnant or breastfeeding, and have realistic expectations. People with allergies to lidocaine or HA, or those with active skin infections in the treatment area, should not receive Juvederm. A free consultation at RELUXE will confirm your candidacy."
  },
  {
    "q": "What should I do after Juvederm injections?",
    "a": "After your Juvederm treatment at RELUXE, avoid strenuous exercise for 24-48 hours, skip alcohol for 24 hours, and don't apply heavy pressure or massage to the treated area unless instructed. Avoid extreme heat (saunas, hot yoga) for 48 hours. Sleep with your head slightly elevated the first night to minimize swelling. You can apply ice gently and take Arnica to help with bruising. Your injector will provide detailed aftercare instructions."
  },
  {
    "q": "Can Juvederm be dissolved if I don't like it?",
    "a": "Yes — one of the major advantages of all hyaluronic acid fillers, including Juvederm, is that they can be dissolved with an enzyme called hyaluronidase. If you're unhappy with your results or experience any complications, your RELUXE provider can inject hyaluronidase to break down the filler within 24-48 hours. This reversibility makes HA fillers the safest category of dermal fillers."
  },
  {
    "q": "Why choose RELUXE for Juvederm in Westfield or Carmel?",
    "a": "RELUXE's injectors specialize in advanced filler techniques and treat under Medical Director oversight, ensuring both safety and artistry. We offer a free consultation to discuss your goals and design a customized plan. Our VIP Membership provides 10-15% savings on every treatment. With locations in Westfield and Carmel, Indiana, we make expert-level filler treatment convenient and accessible. We believe in transparent pricing with no surprise fees."
  }
];

export default s;
