// src/data/services/sculptra.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('sculptra');

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

s.tagline = "Build your own collagen for natural, lasting facial volume";

s.seo = {
  "title": "Sculptra in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Natural collagen stimulation with Sculptra at RELUXE Med Spa. Long-lasting volume restoration in Westfield & Carmel, Indiana."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Treatment Time",
    "value": "45-60 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "Minimal"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "2-3 months"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "2+ years"
  }
];

s.benefits = [
  "Stimulates natural collagen production for long-lasting volume restoration",
  "Gradual, subtle improvements that look completely natural",
  "Addresses age-related volume loss in temples, cheeks, and mid-face",
  "Results can last over two years with proper treatment series",
  "Works well for those who want to avoid frequent filler maintenance"
];

s.overview = {
  "p1": "Sculptra is an FDA-approved poly-L-lactic acid (PLLA) collagen stimulator that works beneath the skin's surface to gradually restore facial volume by triggering your body's natural collagen production process. Unlike traditional dermal fillers that provide immediate volume, Sculptra rebuilds the underlying collagen structure over several months, addressing age-related volume loss in the temples, cheeks, and mid-face with results that can last over two years. The treatment involves a series of injections that stimulate fibroblast activity, leading to new collagen formation that creates subtle, natural-looking facial rejuvenation.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our nurse practitioners and RN injectors take a conservative, artistic approach to Sculptra treatments, carefully assessing your facial anatomy during your complimentary consultation to create a customized treatment plan. We ensure proper product reconstitution and injection technique, provide detailed massage instructions for optimal results, and include follow-up visits to monitor your collagen-building progress over the coming months."
};

s.whyReluxe = [
  {
    "title": "Expert Injection Technique",
    "body": "Our NP-led team understands Sculptra's unique injection patterns and dilution requirements, ensuring even distribution and optimal collagen stimulation while minimizing risk of nodule formation."
  },
  {
    "title": "Conservative Treatment Planning",
    "body": "We follow the '5-5-5' massage protocol and space treatments appropriately, building volume gradually to achieve natural-looking results that enhance your features without over-correction."
  },
  {
    "title": "Long-term Partnership",
    "body": "Sculptra requires patience and proper follow-up care — we provide ongoing guidance throughout your collagen-building journey with complimentary check-ins to ensure optimal results."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Planning",
    "body": "Your provider assesses facial volume loss and creates a customized treatment plan, typically requiring 2-3 sessions spaced 4-6 weeks apart to achieve optimal results."
  },
  {
    "title": "Strategic Injection",
    "body": "Sculptra is injected into specific areas using a precise technique to ensure even distribution, with the poly-L-lactic acid particles working as a scaffold for new collagen formation."
  },
  {
    "title": "Collagen Building",
    "body": "Over 2-3 months, your body gradually produces new collagen around the PLLA particles, creating natural volume restoration that continues to improve with time."
  }
];

s.candidates = {
  "good": [
    "Age-related volume loss in temples and cheeks",
    "Those seeking gradual, natural-looking results",
    "Patients who want long-lasting facial rejuvenation",
    "Good overall health with realistic expectations",
    "Willing to complete full treatment series"
  ],
  "notIdeal": [
    "Active skin infections or inflammation",
    "History of keloid scar formation",
    "Unrealistic expectations for immediate results"
  ]
};

s.pricingMatrix = {
  "subtitle": "Sculptra pricing is based on the number of vials needed for your treatment plan",
  "sections": [
    {
      "title": "Sculptra Treatment Pricing",
      "note": "Most patients require 2-3 vials per session over 2-3 treatment sessions for optimal results",
      "membershipCallout": "VIP Members save 10-15% on all Sculptra treatments",
      "rows": [
        {
          "label": "Sculptra",
          "subLabel": "Collagen stimulator (per vial)",
          "single": "Consult for pricing",
          "membership": "Member rates available"
        }
      ],
      "promo": "Cherry financing available for treatment packages",
      "ctaText": "Book Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications and supplements for one week if medically safe",
      "Stay well-hydrated and arrive with clean skin",
      "Avoid alcohol 24 hours before treatment",
      "Inform us of any recent facial treatments or skin conditions"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Perform the '5-5-5' massage protocol: 5 minutes, 5 times daily, for 5 days",
      "Apply ice intermittently for first 24 hours to minimize swelling",
      "Avoid excessive sun exposure and use SPF 30+ daily",
      "Sleep elevated the first night to reduce swelling",
      "Expect gradual improvement over 2-3 months as collagen builds"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for maximizing your Sculptra collagen-building results",
  "items": [
    {
      "heading": "Massage Matters",
      "body": "The post-treatment massage protocol isn't optional — it ensures even product distribution and prevents nodule formation while encouraging optimal collagen production."
    },
    {
      "heading": "Patience Pays Off",
      "body": "Sculptra's gradual results mean you won't see full effects for 2-3 months, but this timeline creates the most natural-looking facial rejuvenation."
    },
    {
      "heading": "Combination Approach",
      "body": "Sculptra works beautifully with neurotoxins and strategic hyaluronic acid filler placement for comprehensive facial rejuvenation without over-treatment."
    },
    {
      "heading": "Long-term Investment",
      "body": "While Sculptra requires multiple sessions upfront, the 2+ year duration makes it cost-effective compared to frequent filler touch-ups."
    }
  ]
};

s.faq = [
  {
    "q": "What is Sculptra and how does it work?",
    "a": "Sculptra is an FDA-approved injectable biostimulator made of poly-L-lactic acid (PLLA). Unlike hyaluronic acid fillers that add volume instantly, Sculptra stimulates your body to produce its own collagen over time. It gradually restores lost volume and improves skin quality from within, giving results that look natural because they literally are your own collagen."
  },
  {
    "q": "How much does Sculptra cost at RELUXE?",
    "a": "Sculptra is priced per vial at RELUXE. Most patients need 2-4 vials per session, with 2-3 sessions spaced 6-8 weeks apart. VIP Members receive discounted pricing. While the upfront investment is higher than HA fillers, Sculptra results last 2+ years, making the per-year cost very competitive. We provide exact pricing during your consult."
  },
  {
    "q": "How long does Sculptra last?",
    "a": "Sculptra results typically last 2-3 years and in some cases even longer. Because it stimulates your own collagen production, the results are long-lasting. After your initial series, some patients do a single maintenance vial annually to keep results at their peak. It's one of the longest-lasting injectable treatments available."
  },
  {
    "q": "How many Sculptra sessions do I need?",
    "a": "Most patients need 2-3 treatment sessions spaced 6-8 weeks apart. The number of vials per session depends on the degree of volume loss and the areas being treated. Your provider will design a treatment plan during your consultation. Some patients with significant volume loss may benefit from an additional session."
  },
  {
    "q": "When will I see Sculptra results?",
    "a": "Sculptra works gradually — that's by design. You'll notice some immediate volume from the injection fluid, but this settles over a few days. Real collagen-building results begin to appear at 6-8 weeks and continue improving for 3-6 months after your final session. The gradual onset means changes look completely natural."
  },
  {
    "q": "What does Sculptra treat?",
    "a": "Sculptra is excellent for hollow cheeks, temple hollowing, jawline definition, nasolabial folds (smile lines), and overall facial volume loss. It's particularly popular for patients who've lost volume due to aging or weight loss (including GLP-1 medications). It restores a youthful facial framework without looking \"filled.\""
  },
  {
    "q": "Does Sculptra hurt?",
    "a": "Sculptra is mixed with lidocaine (numbing) before injection, so most patients find the treatment very comfortable. You'll feel pressure and mild pinching at injection sites. Most patients rate it 3-4 out of 10 for discomfort. We also use ice and can apply topical numbing if desired."
  },
  {
    "q": "What is the downtime after Sculptra?",
    "a": "Downtime is minimal. You may have mild swelling, tenderness, and occasional bruising at injection sites for 2-5 days. You'll need to massage the treated areas 5 times a day for 5 days (the \"5-5-5 rule\") to ensure even distribution. Most patients return to normal activities the same day."
  },
  {
    "q": "What is the difference between Sculptra and filler?",
    "a": "HA fillers (Juvederm, RHA, Restylane) add volume immediately by filling space with a gel. Sculptra stimulates your own collagen production for gradual, natural-looking results. Fillers last 6-18 months; Sculptra lasts 2-3+ years. Fillers are ideal for specific areas like lips; Sculptra is best for overall volume restoration and facial rejuvenation."
  },
  {
    "q": "Is Sculptra good for weight loss face?",
    "a": "Yes — Sculptra is one of the best treatments for volume loss from weight loss, including GLP-1 medications like Ozempic and Mounjaro. It restores the collagen and volume that was lost as facial fat decreases, addressing hollow cheeks, temples, and overall facial deflation. Many of our patients come to RELUXE specifically for this concern."
  },
  {
    "q": "Can I combine Sculptra with other treatments?",
    "a": "Absolutely. Sculptra is often combined with tox (Botox/Dysport) for expression lines and HA fillers for targeted areas like lips or tear troughs. It also pairs well with Morpheus8 for skin tightening. We typically space Sculptra 2-4 weeks from other injectables. Your provider will build a comprehensive plan."
  },
  {
    "q": "Who is a good candidate for Sculptra?",
    "a": "Sculptra is ideal for adults experiencing facial volume loss from aging or weight loss, those who want long-lasting results without frequent maintenance, and patients who prefer a gradual, natural-looking transformation. It's not recommended during pregnancy or nursing, or for patients with active skin infections or autoimmune conditions affecting the skin."
  }
];

export default s;
