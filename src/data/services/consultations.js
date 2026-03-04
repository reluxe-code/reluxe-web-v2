// src/data/services/consultations.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('consultations');

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

s.tagline = "Your personalized roadmap to refreshed, natural-looking results";

s.seo = {
  "title": "Free Consultations in Westfield & Carmel IN | RELUXE Med Spa",
  "description": "Complimentary aesthetic consultations with NP-led team. SkinIQ analysis, custom treatment plans, exact pricing. Westfield & Carmel locations."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Consultation Time",
    "value": "30-45 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Cost",
    "value": "Complimentary"
  },
  {
    "iconKey": "user",
    "label": "Provider",
    "value": "NP or RN"
  },
  {
    "iconKey": "fire",
    "label": "Obligation",
    "value": "None"
  }
];

s.benefits = [
  "Professional facial analysis using advanced SkinIQ imaging technology",
  "Customized treatment plan with realistic timelines and expectations",
  "Exact pricing for all recommended services with no hidden costs",
  "Education about different treatment options and their mechanisms of action",
  "Option to begin treatment immediately if desired"
];

s.overview = {
  "p1": "A comprehensive consultation at RELUXE Med Spa involves detailed facial analysis using advanced SkinIQ technology, which captures multi-spectral imaging to reveal underlying skin concerns invisible to the naked eye. Our nurse practitioners and RN injectors conduct thorough assessments of your skin texture, pigmentation, muscle movement patterns, and facial anatomy to identify the most effective treatment combinations for your specific goals. This systematic approach ensures every recommendation is backed by clinical evidence rather than guesswork.",
  "p2": "At RELUXE, consultations are always complimentary and conducted by licensed medical professionals who prioritize education over sales pressure. You'll receive a customized treatment roadmap with detailed explanations of recommended procedures, realistic timelines, and exact pricing—plus the option to begin treatment the same day if you're ready."
};

s.whyReluxe = [
  {
    "title": "SkinIQ Analysis",
    "body": "Advanced multi-spectral imaging reveals hidden skin damage and measures improvement over time, providing objective data to guide your treatment plan."
  },
  {
    "title": "Medical Expertise",
    "body": "All consultations conducted by nurse practitioners or RN injectors with extensive aesthetic training, not sales staff or untrained personnel."
  },
  {
    "title": "Zero Pressure Approach",
    "body": "Truly free consultations with no obligation to book—we focus on education and building trust rather than pushing treatments."
  },
  {
    "title": "Same-Day Treatment",
    "body": "If you're ready to proceed, most treatments can be performed immediately after your consultation, saving you an extra trip."
  }
];

s.howItWorks = [
  {
    "title": "Intake Assessment",
    "body": "We discuss your aesthetic goals, medical history, current skincare routine, and any previous treatments to understand your complete picture."
  },
  {
    "title": "Clinical Analysis",
    "body": "SkinIQ imaging captures detailed skin data while our provider performs hands-on assessment of facial anatomy, skin texture, and muscle movement patterns."
  },
  {
    "title": "Treatment Planning",
    "body": "You receive a prioritized treatment roadmap with specific recommendations, exact pricing, timeline expectations, and the opportunity to ask detailed questions."
  }
];

s.candidates = {
  "good": [
    "Anyone considering aesthetic treatments",
    "First-time medical spa patients",
    "Those wanting professional skin analysis",
    "Patients comparing treatment options",
    "Anyone seeking honest, expert guidance"
  ],
  "notIdeal": [
    "Those unwilling to discuss medical history",
    "Patients seeking immediate treatment without consultation",
    "Those not interested in professional recommendations"
  ]
};

s.pricingMatrix = {
  "subtitle": "All consultations at RELUXE are completely complimentary with no obligation to purchase services.",
  "sections": [
    {
      "title": "Consultation Services",
      "note": "Comprehensive assessments conducted by licensed medical professionals at both Westfield and Carmel locations.",
      "rows": [
        {
          "label": "General Consultation",
          "subLabel": "Full facial analysis with treatment recommendations",
          "single": "Complimentary",
          "membership": "Always free"
        },
        {
          "label": "SkinIQ Analysis",
          "subLabel": "Advanced multi-spectral skin imaging",
          "single": "Included",
          "membership": "Included"
        },
        {
          "label": "Treatment Planning",
          "subLabel": "Customized roadmap with exact pricing",
          "single": "Included",
          "membership": "Included"
        }
      ],
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your consultation",
    "points": [
      "Come makeup-free or be prepared to remove makeup for analysis",
      "Bring a list of current skincare products and medications",
      "Think about your aesthetic goals and budget range",
      "Prepare questions about treatments you're considering"
    ]
  },
  "after": {
    "title": "After your consultation",
    "points": [
      "Take time to review your customized treatment plan",
      "No pressure to book immediately—decisions can be made anytime",
      "Follow any skincare recommendations provided by your provider",
      "Schedule treatments when timing is right for your lifestyle",
      "Contact us with any follow-up questions about your recommendations"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximizing the value of your aesthetic consultation with expert insights from our medical team.",
  "items": [
    {
      "heading": "Bring Reference Photos",
      "body": "Photos of desired results help providers understand your aesthetic goals and determine the most appropriate treatment approach."
    },
    {
      "heading": "Discuss Budget Openly",
      "body": "Honest budget conversations allow providers to prioritize treatments and suggest phased approaches that deliver maximum impact within your investment range."
    },
    {
      "heading": "Ask About Combinations",
      "body": "Many concerns require multiple treatment modalities—understanding how services work together creates more comprehensive and cost-effective treatment plans."
    },
    {
      "heading": "Consider Timing",
      "body": "Seasonal factors, upcoming events, and recovery time all influence treatment timing—discussing your schedule optimizes results and convenience."
    }
  ]
};

s.faq = [
  {
    "q": "Are consultations at RELUXE really free?",
    "a": "Yes — consultations at RELUXE are completely free with no obligation. We believe you should be able to discuss your goals, ask questions, and understand your options before making any financial commitment. There's no pressure to book treatments during or after your consultation. Our providers genuinely enjoy educating patients and helping them make informed decisions."
  },
  {
    "q": "What happens during a consultation at RELUXE?",
    "a": "Your provider will sit down with you to discuss your goals and concerns, examine your skin and facial structure, take baseline photos for your file (with your permission), and create a personalized treatment plan with exact pricing. You'll learn which treatments are best suited for your goals, how many sessions or units you'd need, what to expect for results and downtime, and your total investment. You'll leave with a clear plan — whether you book that day or take time to decide."
  },
  {
    "q": "How long does a consultation take?",
    "a": "Most consultations take 15-30 minutes depending on how many concerns or areas you'd like to discuss. If you're interested in a single treatment like Botox, it may be closer to 15 minutes. If you're exploring a comprehensive plan covering multiple services, plan for closer to 30 minutes. We never rush — your provider will take as much time as you need to feel informed and comfortable."
  },
  {
    "q": "Do I need a consultation before getting treatment?",
    "a": "For first-time patients, yes — we require an initial consultation before performing any injectable, laser, or advanced skin treatment. This ensures your safety, sets realistic expectations, and allows your provider to customize the treatment to your unique anatomy and goals. Some services like facials, massage, and salt room/sauna can be booked directly without a prior consultation."
  },
  {
    "q": "Can I get treated the same day as my consultation?",
    "a": "In many cases, yes. If you and your provider align on a treatment plan during your consultation, we can often perform the treatment during the same visit. This is common for neurotoxins (Botox), some filler treatments, and facial services. For treatments that require preparation (like certain laser procedures), we'll schedule a separate appointment. Let our booking team know if you'd like to be treated the same day so we can plan accordingly."
  },
  {
    "q": "Will I get exact pricing during my consultation?",
    "a": "Absolutely. We provide transparent, itemized pricing during every consultation — the exact cost of your recommended treatments with no hidden fees. If your plan involves multiple services, we'll prioritize based on your goals and budget so you can phase treatments over time if preferred. VIP Members receive 10-15% savings on all services, and we'll explain membership benefits during your visit."
  },
  {
    "q": "What should I bring to my consultation?",
    "a": "Come as you are — no special preparation is needed. If you're interested in skin treatments, arriving with minimal or no makeup allows your provider to assess your skin more accurately, but we can cleanse your skin on-site if needed. Bring a list of any medications you take and be ready to discuss your aesthetic goals, concerns, and any treatments you've had previously (including at other providers)."
  },
  {
    "q": "Can I consult for multiple services at once?",
    "a": "Yes — in fact, we encourage it. Discussing all of your goals in one consultation allows your provider to create a comprehensive, prioritized plan. Many patients come in thinking they need one thing and discover that a combination approach (like tox plus filler, or skin resurfacing plus medical-grade skincare) will deliver much better results. We'll explain how different treatments complement each other."
  },
  {
    "q": "Are consultations available at both RELUXE locations?",
    "a": "Yes. Free consultations are available at both our Westfield and Carmel, Indiana locations. You can book online, call, or text to schedule at whichever location is most convenient. Both locations have experienced providers who can evaluate your goals and build a treatment plan. Evening and weekend availability may vary by location."
  },
  {
    "q": "What if I'm nervous or don't know what I want?",
    "a": "That's completely normal and exactly what consultations are for. Many of our patients come in saying \"I don't even know where to start\" — and that's perfectly fine. Your provider will guide the conversation, ask about what bothers you or what you'd like to improve, and educate you on options. There's zero pressure. Our consultations are designed to be informative, welcoming, and empowering, whether you're a first-timer or experienced with aesthetics."
  },
  {
    "q": "How do I book a free consultation?",
    "a": "You can book a free consultation at RELUXE by visiting our website and using our online booking system, calling either our Westfield or Carmel location directly, or texting us. Select \"Consultation\" as your service type and choose your preferred location, provider, and time. Most consultations can be scheduled within a few days. We look forward to meeting you and helping you create your personalized plan."
  }
];

export default s;
