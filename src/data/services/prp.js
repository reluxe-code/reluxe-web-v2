// src/data/services/prp.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('prp');

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

s.tagline = "Harness your body's natural healing power for renewal";

s.seo = {
  "title": "PRP Injections Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Expert PRP treatments using your own growth factors for skin rejuvenation & hair restoration. Westfield & Carmel locations. Book consultation."
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
    "value": "24-48 hours"
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
  "Stimulates natural collagen and elastin production using your body's own healing factors",
  "Improves skin texture and reduces appearance of acne scars and stretch marks",
  "Promotes hair follicle regeneration and thickness in areas of thinning",
  "Minimizes fine lines and enhances overall skin quality without synthetic substances",
  "Accelerates healing and cellular turnover for a refreshed, rejuvenated appearance"
];

s.overview = {
  "p1": "PRP (platelet-rich plasma) injections harness the regenerative power of your own blood's growth factors, including PDGF, TGF-β, and VEGF, to stimulate cellular renewal and collagen synthesis. After drawing a small amount of your blood and processing it in a specialized centrifuge to concentrate the platelets up to 5-7 times normal levels, the resulting plasma is precisely injected into treatment areas or combined with microneedling for enhanced absorption. This autologous treatment helps improve skin texture, reduce fine lines, minimize acne scarring, and promote hair growth by delivering concentrated growth factors directly where healing is needed.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our nurse practitioners ensure optimal PRP concentration through medical-grade centrifugation and sterile processing techniques. Your free consultation includes discussing whether standalone PRP injections or combination with Morpheus8 or SkinPen microneedling will best address your concerns, with follow-up care to monitor your regenerative progress."
};

s.whyReluxe = [
  {
    "title": "Medical-Grade Processing",
    "body": "We use advanced centrifugation systems to achieve optimal platelet concentration, ensuring maximum growth factor potency in every treatment."
  },
  {
    "title": "Combination Expertise",
    "body": "Our providers strategically pair PRP with microneedling, RF treatments, or other modalities to enhance penetration and amplify regenerative results."
  },
  {
    "title": "Sterile Technique",
    "body": "All PRP processing and injection follows strict medical protocols in our clinical setting, minimizing contamination risk and ensuring treatment safety."
  }
];

s.howItWorks = [
  {
    "title": "Blood Draw",
    "body": "A small amount of blood (similar to routine lab work) is collected from your arm using sterile technique. The entire collection process takes just a few minutes."
  },
  {
    "title": "Centrifuge Processing",
    "body": "Your blood is processed in a medical-grade centrifuge to separate and concentrate platelets, creating plasma rich in growth factors and healing proteins."
  },
  {
    "title": "Precise Injection",
    "body": "The concentrated PRP is injected into target areas using fine needles or combined with microneedling for broader application and enhanced absorption into deeper skin layers."
  }
];

s.candidates = {
  "good": [
    "Fine lines and skin texture concerns",
    "Acne scarring and post-inflammatory marks",
    "Hair thinning or early pattern loss",
    "Stretch marks and minor scarring",
    "Overall skin rejuvenation goals"
  ],
  "notIdeal": [
    "Active skin infections or inflammation",
    "Blood disorders or platelet dysfunction",
    "Current use of blood-thinning medications"
  ]
};

s.pricingMatrix = {
  "subtitle": "PRP sessions are priced per treatment, with combination packages available for enhanced results.",
  "sections": [
    {
      "title": "PRP Treatment Options",
      "note": "All treatments include consultation, blood processing, and injection technique.",
      "membershipCallout": "VIP Members save 10-15% on all PRP treatments",
      "rows": [
        {
          "label": "PRP Injections",
          "subLabel": "Targeted injection therapy",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        },
        {
          "label": "PRP + Microneedling",
          "subLabel": "Enhanced penetration combo",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        }
      ],
      "promo": "Ask about package pricing for multiple sessions during your consultation",
      "ctaText": "Book PRP Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications (aspirin, ibuprofen) for 1 week prior if cleared by your physician",
      "Stay well-hydrated and eat a light meal before your appointment",
      "Avoid alcohol for 24 hours before treatment",
      "Inform us of any recent illnesses or medications that may affect blood quality"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice packs for 10-15 minutes as needed to reduce swelling",
      "Avoid makeup and harsh skincare for 24 hours post-injection",
      "Stay hydrated to support the healing process",
      "Avoid strenuous exercise for 24-48 hours",
      "Protect treated areas from sun exposure and apply broad-spectrum SPF daily"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your PRP treatment results and recovery.",
  "items": [
    {
      "heading": "Hydration Matters",
      "body": "Proper hydration before and after treatment optimizes blood quality and enhances the concentration of beneficial growth factors in your PRP."
    },
    {
      "heading": "Timing Strategy",
      "body": "Schedule PRP treatments when you can avoid major social events for 48 hours, as initial swelling and injection marks are normal."
    },
    {
      "heading": "Combination Benefits",
      "body": "Pairing PRP with microneedling or radiofrequency treatments can enhance penetration and amplify regenerative results significantly."
    },
    {
      "heading": "Series Approach",
      "body": "Most patients see optimal results with 2-3 sessions spaced 4-6 weeks apart, followed by maintenance treatments every 6-12 months."
    }
  ]
};

s.faq = [
  {
    "q": "What is PRP and how does it work?",
    "a": "PRP (Platelet-Rich Plasma) is a regenerative treatment that uses your own blood to rejuvenate skin and stimulate hair growth. A small blood draw is processed in a centrifuge to concentrate platelets and growth factors, which are then injected into targeted areas. These growth factors trigger your body's natural healing response, producing new collagen, improving blood flow, and revitalizing tissue from the inside out."
  },
  {
    "q": "How much does PRP cost at RELUXE?",
    "a": "PRP pricing at RELUXE varies by treatment area and whether it's a standalone session or added to microneedling (VAMP facial). A series of 3 sessions is recommended for optimal results and is available at a package discount. VIP Members save 10-15% on all PRP treatments. We provide exact pricing during your free consultation based on your specific goals."
  },
  {
    "q": "What can PRP treat?",
    "a": "PRP is used for under-eye rejuvenation (dark circles and hollowing), hair restoration for thinning hair, overall facial rejuvenation, fine lines, and improved skin texture. When combined with SkinPen microneedling — our popular VAMP facial — it supercharges collagen production for acne scars, large pores, and dull skin. It's one of the most versatile regenerative treatments we offer."
  },
  {
    "q": "What is a VAMP facial?",
    "a": "The VAMP facial combines SkinPen microneedling with PRP applied directly to your skin during treatment. The micro-channels created by the SkinPen allow the concentrated growth factors from your PRP to penetrate deeper into the skin, dramatically enhancing collagen production and healing. It's the gold standard for natural skin rejuvenation, acne scarring, and anti-aging — all using your body's own biology."
  },
  {
    "q": "Does PRP hurt?",
    "a": "The blood draw feels like a standard lab draw — a quick pinch. For facial PRP injections, we apply topical numbing cream beforehand, so most patients rate discomfort at 3-4 out of 10. For PRP with microneedling (VAMP), the numbing cream keeps things very manageable. Hair restoration PRP involves small injections across the scalp, which most patients tolerate well with numbing."
  },
  {
    "q": "How many PRP sessions do I need?",
    "a": "We recommend a series of 3 PRP sessions spaced 4-6 weeks apart for optimal results. This allows cumulative collagen building and tissue regeneration with each treatment. For hair restoration, 3 initial sessions followed by maintenance every 6-12 months is the standard protocol. Your provider will customize the plan based on your specific concerns."
  },
  {
    "q": "When will I see PRP results?",
    "a": "Initial improvements in skin tone and glow are visible within 2-3 weeks. Collagen remodeling continues for 3-6 months, so results keep improving over time. For hair restoration PRP, new hair growth typically becomes noticeable around 3-4 months, with peak results at 6-12 months. Each session in your series compounds the benefits."
  },
  {
    "q": "Is there downtime after PRP?",
    "a": "Standalone PRP injections have minimal downtime — mild redness and swelling at injection sites for 24-48 hours. PRP with microneedling (VAMP facial) involves 2-3 days of redness similar to a sunburn, with mild dryness and flaking as skin heals. Hair restoration PRP has virtually no downtime. Most patients return to normal activities the same day or next day."
  },
  {
    "q": "Is PRP safe? Are there side effects?",
    "a": "PRP is one of the safest aesthetic treatments available because it uses your own blood — there's no risk of allergic reaction or rejection. Side effects are minimal and temporary: mild redness, swelling, and tenderness at treatment sites. Because nothing synthetic is introduced, PRP is ideal for patients who want a completely natural approach to rejuvenation."
  },
  {
    "q": "Who is a good candidate for PRP?",
    "a": "PRP is ideal for patients seeking natural rejuvenation without synthetic fillers, those with under-eye dark circles or hollowing, anyone experiencing early hair thinning, and patients wanting to maximize microneedling results. It's safe for all skin types and tones. You should avoid PRP if you have blood disorders, are on blood thinners, or are pregnant or nursing. Book a free consultation at RELUXE and we'll confirm if PRP is right for you."
  },
  {
    "q": "Can I combine PRP with other treatments?",
    "a": "Absolutely. PRP pairs best with SkinPen microneedling (the VAMP facial), which is one of our most popular combination treatments. It also complements neurotoxins and dermal fillers as part of a comprehensive rejuvenation plan. For hair restoration, PRP can be used alongside topical growth therapies. Your provider will design a treatment timeline that maximizes results."
  }
];

export default s;
