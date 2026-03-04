// src/data/services/vascupen.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('vascupen');

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

s.tagline = "Precision vascular treatment for flawless, clear skin";

s.seo = {
  "title": "VascuPen Vascular Treatment in Westfield, IN | RELUXE Med Spa",
  "description": "Precision VascuPen treatment for broken capillaries and spider veins in Westfield, IN. Expert care with permanent results at RELUXE Med Spa."
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
    "value": "2-4 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "Permanent"
  }
];

s.benefits = [
  "Eliminates broken capillaries and spider veins with surgical precision",
  "Treats delicate areas that are difficult to address with larger devices",
  "Provides permanent results for treated vessels",
  "Minimal discomfort with topical numbing available",
  "Quick treatment sessions with immediate return to activities"
];

s.overview = {
  "p1": "VascuPen is a precision vascular treatment that uses radiofrequency energy to target and eliminate broken capillaries, spider veins, and visible blood vessels on the face. The device delivers controlled thermal energy directly to the vessel wall, causing it to coagulate and collapse, which allows the body to naturally reabsorb the treated vessel over time. This pinpoint accuracy makes it ideal for treating delicate areas around the nose, cheeks, and under-eye region where larger laser systems may be too aggressive.",
  "p2": "At RELUXE's Westfield location, our experienced providers use VascuPen to create customized treatment plans that address your specific vascular concerns. During your complimentary consultation, we'll assess your skin and recommend the most effective approach, often combining VascuPen with complementary treatments like IPL for comprehensive vascular improvement."
};

s.whyReluxe = [
  {
    "title": "Precision Targeting",
    "body": "Our skilled providers use VascuPen's fine-tip technology to treat even the smallest facial vessels with surgical precision, minimizing impact on surrounding healthy tissue."
  },
  {
    "title": "Comprehensive Assessment",
    "body": "We evaluate your complete vascular pattern to determine whether VascuPen alone or combination therapy with IPL will deliver your best results."
  },
  {
    "title": "Expert Follow-Up",
    "body": "Our 2-week follow-up appointments ensure optimal healing and allow us to assess if additional spot treatments are needed for complete vessel clearance."
  }
];

s.howItWorks = [
  {
    "title": "Vessel Assessment",
    "body": "We identify and map the specific blood vessels to be treated, determining the optimal energy settings for your skin type and vessel characteristics."
  },
  {
    "title": "Precision Treatment",
    "body": "The VascuPen's fine tip delivers controlled radiofrequency energy directly to each vessel, causing immediate coagulation while protecting surrounding skin."
  },
  {
    "title": "Natural Elimination",
    "body": "Over 2-4 weeks, your body naturally absorbs the treated vessels, revealing clearer, more even-toned skin."
  }
];

s.candidates = {
  "good": [
    "Broken capillaries on nose, cheeks, or chin",
    "Fine spider veins on facial areas",
    "Cherry angiomas and small vascular lesions",
    "Patients seeking precise spot treatment",
    "Those with isolated vessel concerns"
  ],
  "notIdeal": [
    "Large or deep varicose veins",
    "Active skin infections in treatment area",
    "Pregnancy or nursing"
  ]
};

s.pricingMatrix = {
  "subtitle": "VascuPen pricing is based on the number and size of vessels being treated during your session.",
  "sections": [
    {
      "title": "VascuPen Treatments",
      "note": "Targeted treatment for broken capillaries and spider veins. Available at our Westfield location only.",
      "membershipCallout": "VIP Members save 10-15% on all treatments",
      "rows": [
        {
          "label": "VascuPen Session",
          "subLabel": "Spot treatment for facial vessels",
          "single": "Consult for pricing",
          "membership": "Member savings apply"
        }
      ],
      "promo": "Complimentary consultation to assess your vascular concerns and create your treatment plan",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications and supplements for 1 week if medically safe",
      "No sun exposure or tanning 2 weeks prior to treatment",
      "Discontinue retinoids and exfoliating products 3 days before",
      "Arrive with clean skin, free of makeup and skincare products"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply gentle moisturizer and SPF 30+ daily",
      "Avoid touching or picking at treated areas",
      "No strenuous exercise or heat exposure for 24-48 hours",
      "Expect temporary darkening of treated vessels before they fade",
      "Schedule follow-up appointment to assess results and plan additional treatments if needed"
    ]
  }
};

s.flexEverything = {
  "intro": "Our Westfield providers share their expert insights for optimal VascuPen results.",
  "items": [
    {
      "heading": "Combination Approach",
      "body": "For extensive vascular concerns, we often recommend IPL first to address larger areas, followed by VascuPen for precise cleanup of remaining vessels."
    },
    {
      "heading": "Seasonal Timing",
      "body": "Indiana's cooler months are ideal for vascular treatments since sun avoidance is easier and healing conditions are optimal."
    },
    {
      "heading": "Realistic Expectations",
      "body": "Treated vessels may initially appear darker before fading completely over 2-4 weeks - this temporary darkening indicates successful treatment."
    },
    {
      "heading": "Prevention Strategy",
      "body": "Consistent sunscreen use and gentle skincare help prevent new vessel formation after successful VascuPen treatment."
    }
  ]
};

s.faq = [
  {
    "q": "What is VascuPen and how does it work?",
    "a": "VascuPen is a precision vein treatment device that uses pinpoint coagulation technology to target and eliminate small facial spider veins, broken capillaries, and cherry angiomas. A fine probe delivers focused energy directly to the visible vessel, causing it to coagulate and be naturally absorbed by your body over the following days. It's a quick, targeted treatment that addresses individual vessels with remarkable precision."
  },
  {
    "q": "How much does VascuPen cost at RELUXE?",
    "a": "VascuPen pricing at RELUXE is based on the size and number of areas treated. Small treatment areas like individual cherry angiomas or a few broken capillaries are very affordable. VIP Members save 10-15% on every treatment. Your provider will assess your specific concerns and provide exact pricing during your free consultation."
  },
  {
    "q": "Does VascuPen hurt?",
    "a": "Most patients describe VascuPen as a brief, mild stinging or pinching sensation at each treatment point — similar to a tiny snap. Because the device treats such small, precise areas, the discomfort is very brief and tolerable. No numbing cream or anesthesia is typically needed. Most patients rate the discomfort at 2-3 out of 10."
  },
  {
    "q": "What does VascuPen treat?",
    "a": "VascuPen is specifically designed for small superficial vascular concerns: facial spider veins (especially around the nose and cheeks), broken capillaries, cherry angiomas (small red dots on the skin), and tiny visible blood vessels. It excels at treating individual vessels that are too small for laser or IPL to effectively target on their own."
  },
  {
    "q": "How many VascuPen sessions do I need?",
    "a": "Many patients see excellent results after just 1-2 sessions. Small, isolated vessels often resolve in a single treatment. More extensive areas with multiple broken capillaries may benefit from 2-3 sessions spaced 4-6 weeks apart. Your provider will evaluate your specific vascular concerns and recommend the right number of sessions during your free consultation."
  },
  {
    "q": "What is the downtime after VascuPen?",
    "a": "VascuPen has minimal downtime. You may have tiny red dots or mild redness at each treatment point for a few hours to a couple of days. Treated cherry angiomas may form a small scab that falls off within 5-7 days. You can apply makeup the next day and return to normal activities immediately. Avoid direct sun exposure and wear SPF on treated areas."
  },
  {
    "q": "When will I see VascuPen results?",
    "a": "Results are often visible within days. Treated spider veins and broken capillaries typically fade over 1-2 weeks as your body reabsorbs the coagulated vessel. Cherry angiomas may darken initially, scab, and then clear within 1-2 weeks. Final results are usually apparent within 2-4 weeks of treatment. Treated vessels do not return, though new ones can develop over time."
  },
  {
    "q": "What is the difference between VascuPen and IPL for veins?",
    "a": "VascuPen uses direct pinpoint contact to coagulate individual vessels with high precision, making it ideal for isolated spider veins and cherry angiomas. IPL uses broad-spectrum light to treat diffuse redness, rosacea, and larger areas of discoloration. Many patients at RELUXE benefit from combining both — VascuPen for specific vessels and IPL for overall redness and tone correction."
  },
  {
    "q": "Who is a good candidate for VascuPen?",
    "a": "VascuPen is ideal for anyone bothered by visible facial spider veins, broken capillaries around the nose or cheeks, or cherry angiomas on the face or body. It works on all skin types and tones. You should avoid treatment if you're pregnant, have active skin infections in the treatment area, or are on blood-thinning medications without medical clearance."
  },
  {
    "q": "What are the side effects of VascuPen?",
    "a": "Side effects are mild and temporary. The most common include small red marks at treatment points, minor swelling, and occasional tiny scabs on treated cherry angiomas. These typically resolve within a few days to a week. Bruising is uncommon. Serious side effects are very rare. Our providers at RELUXE use careful technique under Medical Director oversight to minimize any risk."
  },
  {
    "q": "Can I combine VascuPen with other treatments?",
    "a": "Absolutely — VascuPen is often paired with IPL for a comprehensive approach to redness and vascular concerns. IPL addresses diffuse redness and sun damage while VascuPen targets specific stubborn vessels. It can also be combined with facials, peels, and other skin treatments. Your provider at RELUXE will create a customized plan during your free consultation."
  },
  {
    "q": "How long do VascuPen results last?",
    "a": "Treated vessels are permanently eliminated — once coagulated and absorbed by your body, those specific veins and capillaries do not return. However, new spider veins and broken capillaries can develop over time due to aging, sun exposure, genetics, and lifestyle factors. Periodic maintenance treatments can address any new vessels as they appear."
  }
];

export default s;
