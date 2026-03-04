// src/data/services/glo2facial.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('glo2facial');

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

s.tagline = "Celebrity-favorite oxygenation for instant, radiant skin transformation";

s.seo = {
  "title": "Glo2Facial in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Experience the celebrity-favorite Glo2Facial at RELUXE Med Spa. Instant oxygenation and radiance in Westfield and Carmel, Indiana."
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
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Results Seen",
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "7-14 days"
  }
];

s.benefits = [
  "Instant 30% increase in skin oxygenation through the natural Bohr Effect",
  "Deep infusion of peptides, hyaluronic acid, and active serums via ultrasonic technology",
  "Immediate improvement in skin texture, plumpness, and luminosity",
  "Gentle exfoliation without irritation or sensitivity",
  "Enhanced lymphatic drainage reducing puffiness and promoting detoxification"
];

s.overview = {
  "p1": "The Glo2Facial is a three-step oxygenation treatment that uses patented OxyPods to trigger the Bohr Effect, naturally increasing oxygen levels in the skin by up to 30%. This process combines CO2-rich gel capsules with specialized serums to create controlled oxygenation, followed by lymphatic massage and ultrasonic infusion of active ingredients like peptides, hyaluronic acid, or brightening compounds. The treatment immediately improves skin texture, hydration, and radiance while delivering targeted serums deep into the dermis through enhanced cellular uptake.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our licensed estheticians customize each Glo2Facial using clinical-grade OxyPods selected for your specific skin concerns during your complimentary consultation. We ensure optimal comfort with our signature lymphatic massage technique and provide detailed aftercare guidance to maximize your results and maintain that celebrity-worthy glow."
};

s.whyReluxe = [
  {
    "title": "Pod Selection Expertise",
    "body": "Our estheticians analyze your skin using advanced diagnostics to select the optimal OxyPod formulation from our complete collection, ensuring targeted treatment for your specific concerns."
  },
  {
    "title": "Immediate Results Protocol",
    "body": "We've perfected the treatment sequence and pressure techniques to maximize oxygen delivery and serum penetration, giving you that coveted instant glow clients travel from across Indiana to experience."
  },
  {
    "title": "Treatment Stacking Options",
    "body": "As a full-service medical spa, we expertly combine Glo2Facials with treatments like Morpheus8 or chemical peels in carefully planned sequences for amplified results."
  }
];

s.howItWorks = [
  {
    "title": "Oxygenation Activation",
    "body": "Your selected OxyPod creates a controlled CO2 reaction on your skin, triggering the Bohr Effect to naturally increase oxygen levels and prepare your skin for enhanced serum absorption."
  },
  {
    "title": "Lymphatic Massage",
    "body": "Our signature massage technique stimulates circulation and lymphatic drainage while the oxygenation process continues, reducing puffiness and promoting cellular renewal."
  },
  {
    "title": "Ultrasonic Infusion",
    "body": "Targeted serums are delivered deep into the dermis using ultrasonic waves, maximizing penetration of active ingredients like peptides, brightening agents, or hydrating compounds based on your skin's needs."
  }
];

s.candidates = {
  "good": [
    "Dull, lackluster complexion",
    "Fine lines and early aging signs",
    "Dehydrated or tired-looking skin",
    "Pre-event skin preparation",
    "Maintenance between other treatments"
  ],
  "notIdeal": [
    "Active acne breakouts",
    "Open wounds or cuts",
    "Recent chemical peel (within 2 weeks)"
  ]
};

s.pricingMatrix = {
  "subtitle": "Glo2Facial treatments are priced per session with VIP member savings available.",
  "sections": [
    {
      "title": "Glo2Facial Treatments",
      "note": "All treatments include consultation, customized OxyPod selection, and aftercare guidance.",
      "membershipCallout": "VIP Members save 10-15% on all treatments",
      "rows": [
        {
          "label": "Single Glo2Facial",
          "subLabel": "Any OxyPod formulation with full treatment protocol",
          "single": "Starting at $150",
          "membership": "Member pricing available"
        }
      ],
      "promo": "Ask about our facial packages and treatment combinations during your consultation.",
      "ctaText": "Book Glo2Facial"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid retinoids and exfoliating treatments for 3 days prior",
      "Come with clean skin - remove all makeup and skincare products",
      "Inform your esthetician of any recent treatments or skin sensitivities",
      "Stay hydrated and avoid excessive sun exposure for 24 hours before treatment"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply gentle, hydrating products only for the first 24 hours",
      "Use broad-spectrum SPF 30+ daily to protect your refreshed skin",
      "Avoid harsh exfoliants, retinoids, or acids for 2-3 days",
      "Stay well-hydrated to support the enhanced cellular oxygenation",
      "Schedule your next treatment in 3-4 weeks for optimal skin maintenance"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your Glo2Facial results and experience.",
  "items": [
    {
      "heading": "OxyPod Selection",
      "body": "The Hydrate pod with hyaluronic acid works best for dry Midwest winter skin, while Illuminate pods with kojic acid are ideal for addressing sun damage common in Indiana summers."
    },
    {
      "heading": "Timing Strategy",
      "body": "Schedule your Glo2Facial 2-3 days before important events for peak glow, or as a monthly maintenance treatment to keep your skin consistently radiant between more intensive procedures."
    },
    {
      "heading": "Treatment Pairing",
      "body": "Combine with our SkinPen microneedling or light chemical peels in alternating months for comprehensive skin renewal, or follow Morpheus8 sessions with Glo2Facials for enhanced healing."
    },
    {
      "heading": "Home Care Enhancement",
      "body": "Use SkinBetter Science or SkinCeuticals vitamin C serums between treatments to maintain oxygenation benefits and extend your results for optimal skin health year-round."
    }
  ]
};

s.faq = [
  {
    "q": "What is a GLO2Facial and how does it work?",
    "a": "The GLO2Facial is an advanced facial treatment powered by Geneo's patented OxyGeneo technology. It works in three steps: exfoliate (a capsule creates CO2 bubbles on your skin), infuse (active ingredients are delivered deep into the skin), and oxygenate (your body's natural response sends oxygen-rich blood to the treated area). This three-in-one process rejuvenates skin from the inside out for an immediate, visible glow."
  },
  {
    "q": "How much does a GLO2Facial cost at RELUXE Med Spa?",
    "a": "GLO2Facial pricing at RELUXE is competitive for the Westfield and Carmel area. VIP Members save 10-15% on every treatment. We offer transparent pricing with no hidden fees — your exact cost is confirmed during your free consultation. Many clients find it comparable to other premium facials but with noticeably better results."
  },
  {
    "q": "Does a GLO2Facial hurt?",
    "a": "Not at all. The GLO2Facial is one of the most comfortable facial treatments available. The OxyGeneo exfoliation feels like a gentle fizzing or bubbling sensation on your skin. Most clients describe it as relaxing and even enjoyable. There are no needles, no harsh chemicals, and no discomfort during or after the treatment."
  },
  {
    "q": "What results can I expect from a GLO2Facial?",
    "a": "You'll see an immediate glow, improved hydration, and smoother texture right after your first session. The oxygenation process gives skin a plump, dewy look that's perfect before events. Over a series of treatments, clients see reduced fine lines, more even skin tone, smaller-looking pores, and improved firmness. Results continue improving for several days after each session."
  },
  {
    "q": "How often should I get a GLO2Facial?",
    "a": "For optimal results, we recommend a GLO2Facial every 3-4 weeks. Many clients use it as their go-to maintenance facial because it delivers consistent, buildable results with zero downtime. Your esthetician will customize a treatment schedule based on your skin goals and the pod type that best addresses your concerns."
  },
  {
    "q": "Is there any downtime after a GLO2Facial?",
    "a": "There is zero downtime. You can apply makeup, go to an event, or return to your normal routine immediately after your treatment. This is why the GLO2Facial is a celebrity favorite before red carpet events and photo shoots — your skin looks incredible right away with no redness or peeling."
  },
  {
    "q": "What are GLO2Facial pods and which one is right for me?",
    "a": "GLO2Facial pods are treatment capsules loaded with different active ingredients for specific skin concerns. Balance targets oily and acne-prone skin, Illuminate brightens dull or uneven tone, Revive addresses aging and fine lines, and Detox purifies congested skin. Your RELUXE esthetician will recommend the best pod based on your skin analysis during your appointment."
  },
  {
    "q": "Who is a good candidate for a GLO2Facial?",
    "a": "The GLO2Facial is suitable for virtually all skin types and tones, making it one of our most versatile treatments. It's ideal for anyone wanting brighter, more hydrated skin — from people in their 20s maintaining healthy skin to those in their 60s addressing aging concerns. It's gentle enough for sensitive skin and effective enough for stubborn skin issues. Book a free consultation at RELUXE to find the right pod for you."
  },
  {
    "q": "What should I expect during a GLO2Facial appointment at RELUXE?",
    "a": "Your appointment begins with a skin analysis to select the ideal treatment pod. Your esthetician then performs the three-step OxyGeneo process — exfoliate, infuse, oxygenate — using the Geneo device. The treatment is relaxing and takes about 30-45 minutes. You'll finish with serums, moisturizer, and SPF, leaving with visibly glowing, hydrated skin and zero redness."
  },
  {
    "q": "How does a GLO2Facial compare to a HydraFacial?",
    "a": "Both are premium no-downtime facials, but they work differently. The GLO2Facial uses OxyGeneo technology to trigger your body's natural oxygenation response, delivering nutrients from the inside out. HydraFacial uses suction-based extraction and infusion. Many clients find the GLO2Facial produces a more natural, long-lasting glow. We offer both at RELUXE and can help you decide which is the best fit during a free consultation."
  },
  {
    "q": "Can I combine a GLO2Facial with other treatments?",
    "a": "Yes. The GLO2Facial pairs beautifully with LED light therapy, dermaplaning, and hydration masks for enhanced results. It also works well as a prep treatment before chemical peels or laser sessions because it optimizes skin health. Many clients add it to their injectable visits for a complete refresh. Your esthetician will recommend the best combination for your goals."
  },
  {
    "q": "Why is the GLO2Facial called a celebrity-favorite treatment?",
    "a": "The GLO2Facial is a go-to for celebrities and influencers because it delivers red-carpet-ready skin in under an hour with absolutely no downtime, redness, or peeling. The oxygenation effect creates a natural, lit-from-within glow that photographs beautifully. At RELUXE in Westfield and Carmel, you get that same premium treatment with expert estheticians at a fraction of the cost."
  }
];

export default s;
