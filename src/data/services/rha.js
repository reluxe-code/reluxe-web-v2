// src/data/services/rha.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('rha');

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

s.tagline = "The only filler engineered to stretch and bounce back with you";

s.seo = {
  "title": "RHA Filler Collection Westfield & Carmel, IN | RELUXE",
  "description": "Advanced RHA resilient hyaluronic acid fillers in Indiana. Natural movement, longer-lasting results. Expert injection at RELUXE Med Spa."
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
    "value": "12-15 months"
  }
];

s.benefits = [
  "Maintains natural facial expressions and movement in dynamic areas",
  "Resilient gel technology stretches and bounces back with facial motion",
  "Longer-lasting results compared to traditional hyaluronic acid fillers",
  "Immediate visible improvement with continued enhancement over 2-4 weeks",
  "FDA-approved collection with proven safety and efficacy profile"
];

s.overview = {
  "p1": "The RHA Collection represents the most advanced hyaluronic acid filler technology available, featuring a unique crosslinking process that creates resilient hyaluronic acid gel designed to maintain flexibility during facial movement. Unlike traditional fillers that can appear stiff or unnatural in dynamic areas, RHA fillers (1, 2, 3, and 4) utilize proprietary PRESERVED Network technology that allows the gel to stretch up to 32% and bounce back to its original shape, making them ideal for areas that move frequently like the lips, nasolabial folds, and marionette lines. This FDA-approved collection offers natural-looking results that adapt to your facial expressions rather than restricting them.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our experienced nurse practitioners and RN injectors assess your unique facial anatomy during your complimentary consultation to determine which RHA formulation will best achieve your aesthetic goals. We provide detailed injection mapping, use advanced comfort techniques including topical numbing, and schedule your complimentary two-week follow-up to ensure optimal results and address any touch-up needs."
};

s.whyReluxe = [
  {
    "title": "Resilient Hyaluronic Technology",
    "body": "We're experts in RHA's unique crosslinking technology that maintains 32% stretch capacity, ensuring natural movement and expression in dynamic facial areas."
  },
  {
    "title": "Precision Injection Mapping",
    "body": "Our providers create detailed injection plans using advanced facial analysis to determine optimal RHA formulation and placement for your specific anatomy and movement patterns."
  },
  {
    "title": "Dynamic Movement Assessment",
    "body": "We evaluate your facial expressions and muscle movement during consultation to select the ideal RHA viscosity that will move naturally with your face."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Mapping",
    "body": "Your provider performs facial analysis including dynamic movement assessment to determine optimal RHA formulation and create a personalized injection plan tailored to your anatomy."
  },
  {
    "title": "Precision Injection",
    "body": "Using advanced injection techniques, RHA gel is placed strategically in targeted areas with topical numbing for comfort, allowing the resilient hyaluronic acid to integrate naturally with your tissue."
  },
  {
    "title": "Integration & Results",
    "body": "The PRESERVED Network technology allows RHA to move naturally with your facial expressions while providing structural support, with results continuing to improve as the gel fully integrates over 2-4 weeks."
  }
];

s.candidates = {
  "good": [
    "Dynamic facial lines that worsen with movement",
    "Lip enhancement requiring natural flexibility",
    "Nasolabial folds and marionette lines",
    "Patients seeking long-lasting, natural-looking results",
    "Those who want to maintain full range of facial expressions"
  ],
  "notIdeal": [
    "Pregnancy or breastfeeding",
    "Active skin infections in treatment area",
    "History of severe allergic reactions to hyaluronic acid"
  ]
};

s.pricingMatrix = {
  "subtitle": "Transparent pricing for all RHA formulations with member savings available.",
  "sections": [
    {
      "title": "RHA Collection Pricing",
      "note": "All RHA formulations (1, 2, 3, and 4) are priced consistently, with selection based on treatment area and desired outcome.",
      "membershipCallout": "VIP Members save $50 per syringe on all RHA treatments",
      "rows": [
        {
          "label": "RHA 1, 2, 3, or 4",
          "subLabel": "Per syringe (selection based on treatment needs)",
          "single": "$650",
          "membership": "$600"
        }
      ],
      "promo": "Complimentary consultation and 2-week follow-up included with all RHA treatments",
      "ctaText": "Book RHA Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications and supplements (aspirin, ibuprofen, fish oil, vitamin E) for 7 days",
      "Discontinue topical retinoids and exfoliating products 3 days prior",
      "Arrive makeup-free or plan to remove makeup before treatment",
      "Stay hydrated and avoid alcohol 24 hours before your appointment"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice intermittently for first 24 hours to minimize swelling",
      "Sleep elevated for the first 2 nights to reduce swelling",
      "Avoid strenuous exercise and excessive heat for 48 hours",
      "Gently massage areas as directed by your provider to optimize distribution",
      "Attend your complimentary 2-week follow-up appointment for assessment and any needed touch-ups"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to optimize your RHA filler experience and results:",
  "items": [
    {
      "heading": "Movement Matters",
      "body": "Unlike traditional fillers, gentle facial exercises and normal expressions actually help RHA integrate optimally with your tissue during the first week."
    },
    {
      "heading": "Hydration Enhancement",
      "body": "RHA's hyaluronic acid attracts up to 1,000 times its weight in water, so maintaining good hydration amplifies your results and longevity."
    },
    {
      "heading": "Combination Approach",
      "body": "RHA pairs excellently with neurotoxins for comprehensive facial rejuvenation, as it's specifically designed to work in areas where muscles remain active."
    },
    {
      "heading": "Progressive Results",
      "body": "While RHA provides immediate improvement, results continue to enhance for 2-4 weeks as the resilient gel fully integrates and hydrates your tissue."
    }
  ]
};

s.faq = [
  {
    "q": "What is RHA filler?",
    "a": "RHA stands for Resilient Hyaluronic Acid, a line of dermal fillers made by Revance. RHA fillers are designed to move naturally with your facial expressions rather than resisting them. The collection includes RHA 2 for moderate lines, RHA 3 for deeper folds, and RHA 4 for severe folds and volume loss. RHA's unique manufacturing process preserves more of the hyaluronic acid's natural structure, allowing it to stretch and bounce back like your own tissue."
  },
  {
    "q": "How much does RHA filler cost at RELUXE?",
    "a": "RHA filler pricing at RELUXE is per syringe and varies by the specific product used (RHA 2, 3, or 4). Most patients need 1-4 syringes depending on the areas being treated. VIP Members save 10-15% on every syringe. We provide a transparent, itemized quote during your free consultation so you know exactly what to expect — no hidden fees or surprises."
  },
  {
    "q": "Does RHA filler hurt?",
    "a": "RHA fillers contain built-in lidocaine to minimize discomfort during injection. Most patients describe the sensation as mild pressure with occasional brief pinching, typically rating it 2-4 out of 10. At RELUXE, we also apply topical numbing cream before treatment and use gentle injection techniques. The overall experience is very tolerable for most patients."
  },
  {
    "q": "How long does RHA filler last?",
    "a": "RHA fillers are FDA-approved to last up to 15 months in the nasolabial folds — one of the longest durations among HA fillers. Many patients enjoy results even longer, especially in areas with less movement. RHA 4 tends to last longest due to its thicker consistency. Your results will depend on the area treated, your metabolism, and the amount of product used. Maintenance appointments at RELUXE help extend your results over time."
  },
  {
    "q": "What makes RHA different from other fillers like Juvederm or Restylane?",
    "a": "RHA is specifically engineered for dynamic facial areas — places that move constantly like around the mouth, smile lines, and cheeks. Traditional fillers can look stiff or unnatural when you smile or talk. RHA's gentle manufacturing process keeps the HA chains closer to their natural state, giving the gel more flexibility. It's the only filler FDA-approved specifically for dynamic facial wrinkles and folds. Your RELUXE provider can help you decide if RHA's natural movement is the best fit for your goals."
  },
  {
    "q": "What areas can RHA filler treat?",
    "a": "RHA fillers treat a wide range of facial areas. RHA 2 works well for moderate lines around the mouth, lips, and under-eye hollows. RHA 3 is ideal for deeper nasolabial folds, marionette lines, and cheek enhancement. RHA 4 addresses severe volume loss in the cheeks, chin, and jawline. Because RHA moves naturally with expressions, it's especially popular for areas around the mouth where you want filler to look invisible when you smile or talk."
  },
  {
    "q": "When will I see results from RHA filler?",
    "a": "You'll see immediate improvement right after your RHA injection. Mild swelling is common for the first 3-7 days, so your final, settled result typically appears around the 2-week mark. Your RELUXE injector may recommend a follow-up visit at 2-4 weeks to evaluate your results and perform any refinements. The results look increasingly natural as the product fully integrates with your tissue."
  },
  {
    "q": "What are the side effects of RHA filler?",
    "a": "The most common side effects of RHA filler are mild swelling, bruising, redness, and tenderness at the injection sites. These are temporary and typically resolve within 3-7 days. Some patients experience mild firmness or small lumps that usually smooth out on their own within 1-2 weeks. Serious complications are rare when performed by skilled injectors. At RELUXE, all filler treatments are performed by expert injectors under Medical Director oversight."
  },
  {
    "q": "Who is a good candidate for RHA filler?",
    "a": "RHA is ideal for anyone who wants filler that looks natural in motion — not just at rest. It's a great choice if you're concerned about filler looking stiff or obvious when you talk, smile, or laugh. Good candidates are healthy adults with moderate to severe facial wrinkles, folds, or volume loss. RHA is not recommended for pregnant or breastfeeding women, those with active infections, or those with allergies to HA or lidocaine. Book a free consultation at RELUXE to see if RHA is right for you."
  },
  {
    "q": "What should I do after RHA filler treatment?",
    "a": "After your RHA treatment at RELUXE, avoid strenuous exercise for 24-48 hours, limit alcohol for 24 hours, and avoid applying heavy pressure to the treated area. Skip saunas, hot tubs, and intense heat for 48 hours. You can gently apply ice to reduce swelling and take Arnica supplements for bruising. Sleep with your head slightly elevated the first night. Your RELUXE injector will give you a detailed aftercare guide."
  },
  {
    "q": "Can RHA filler be dissolved?",
    "a": "Yes. Like all hyaluronic acid fillers, RHA can be dissolved with hyaluronidase if needed. This enzyme breaks down the HA gel within 24-48 hours. Whether you want an adjustment or are experiencing a rare complication, your RELUXE provider can reverse the filler quickly. This dissolvability is one of the key safety advantages of HA fillers over permanent or semi-permanent alternatives."
  },
  {
    "q": "Why choose RELUXE for RHA filler in Westfield or Carmel?",
    "a": "RELUXE's injectors are trained in the full range of HA fillers, including the newest RHA technology, and treat under Medical Director oversight for both safety and beautiful results. We offer free consultations to discuss your goals and help you choose the right filler for each area. VIP Members enjoy 10-15% savings on all treatments. With convenient locations in Westfield and Carmel, Indiana, RELUXE makes advanced filler treatment easy to access with transparent, upfront pricing."
  }
];

export default s;
