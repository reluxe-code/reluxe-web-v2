// src/data/services/massage.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('massage');

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

s.tagline = "Clinical massage therapy designed for true therapeutic benefit";

s.seo = {
  "title": "Therapeutic Massage in Westfield, IN | RELUXE Med Spa",
  "description": "Professional therapeutic massage in Westfield. Licensed therapists, medical integration, custom treatments. 60 & 90-minute sessions available."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Session Length",
    "value": "60 or 90 min"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Results Felt",
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Benefits Last",
    "value": "3-7 days"
  }
];

s.benefits = [
  "Reduces cortisol levels and activates parasympathetic recovery",
  "Improves lymphatic drainage and reduces post-procedure swelling",
  "Releases myofascial adhesions and trigger points",
  "Enhances circulation and tissue oxygenation",
  "Supports better sleep quality and stress management"
];

s.overview = {
  "p1": "Therapeutic massage at RELUXE employs evidence-based techniques including myofascial release, trigger point therapy, deep tissue manipulation, and Swedish massage modalities to address musculoskeletal tension, improve circulation, and activate the parasympathetic nervous system. Our licensed massage therapists utilize targeted pressure and movement patterns to release adhesions in soft tissue, reduce inflammatory markers, and promote lymphatic drainage. Available in 60 and 90-minute sessions, treatments are customized to address specific areas of tension, chronic pain patterns, or stress-related muscle holding.",
  "p2": "At our Westfield flagship location, each massage begins with a thorough assessment of your posture, movement patterns, and areas of concern to create a personalized treatment approach. Our licensed massage therapists integrate seamlessly with your overall wellness plan, often coordinating with our medical providers for post-procedure recovery or as part of comprehensive pain management protocols."
};

s.whyReluxe = [
  {
    "title": "Medical Integration",
    "body": "Our massage therapists work alongside NPs and RNs to support recovery from cosmetic procedures, enhance lymphatic drainage post-treatment, and address tension patterns that may affect facial aging."
  },
  {
    "title": "Clinical Approach",
    "body": "Each session includes postural assessment and targeted myofascial techniques, treating massage as therapeutic intervention rather than simple relaxation."
  },
  {
    "title": "Customized Protocols",
    "body": "Treatment plans are tailored to your specific needs, whether addressing chronic pain, post-procedure recovery, or stress-related tension patterns."
  }
];

s.howItWorks = [
  {
    "title": "Assessment",
    "body": "Your therapist evaluates posture, movement patterns, and areas of tension or concern. We discuss your wellness goals and any recent cosmetic treatments that may benefit from lymphatic support."
  },
  {
    "title": "Customized Treatment",
    "body": "Using appropriate modalities like deep tissue, myofascial release, or Swedish techniques, your therapist addresses specific areas of tension while promoting overall relaxation and circulation."
  },
  {
    "title": "Integration Plan",
    "body": "We provide recommendations for ongoing care and discuss how massage can complement your other RELUXE treatments for optimal results."
  }
];

s.candidates = {
  "good": [
    "Chronic neck and shoulder tension",
    "Post-procedure lymphatic support",
    "Stress-related muscle holding patterns",
    "Athletes or active individuals",
    "Those seeking wellness maintenance"
  ],
  "notIdeal": [
    "Active skin infections or open wounds",
    "Recent injury without medical clearance",
    "Certain medical conditions requiring physician approval"
  ]
};

s.pricingMatrix = {
  "subtitle": "Therapeutic massage pricing with VIP member savings available",
  "sections": [
    {
      "title": "Massage Sessions",
      "note": "All sessions include consultation and customized treatment approach",
      "membershipCallout": "VIP members save 10-15% on all sessions",
      "rows": [
        {
          "label": "60-Minute Therapeutic Massage",
          "subLabel": "Full-body or targeted treatment",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        },
        {
          "label": "90-Minute Therapeutic Massage",
          "subLabel": "Extended full-body treatment",
          "single": "Consult for pricing",
          "membership": "Member pricing available"
        }
      ],
      "promo": "Available exclusively at our Westfield location",
      "ctaText": "Book Massage"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your massage",
    "points": [
      "Arrive 10 minutes early for intake and consultation",
      "Avoid heavy meals 1-2 hours before your session",
      "Communicate any injuries, medical conditions, or recent cosmetic treatments",
      "Wear comfortable clothing that's easy to remove"
    ]
  },
  "after": {
    "title": "After your massage",
    "points": [
      "Drink plenty of water to support lymphatic drainage and toxin elimination",
      "Avoid strenuous activity for 2-4 hours to maintain relaxation benefits",
      "Apply heat or gentle stretching if experiencing mild soreness",
      "Schedule follow-up sessions as recommended for optimal therapeutic benefits",
      "Note any changes in tension patterns or pain levels for your next visit"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your therapeutic massage benefits",
  "items": [
    {
      "heading": "Timing Matters",
      "body": "Schedule massage 24-48 hours after injectable treatments to enhance lymphatic drainage and reduce swelling, or before laser procedures to improve relaxation and treatment tolerance."
    },
    {
      "heading": "Hydration Protocol",
      "body": "Increase water intake 24 hours before and after massage to support lymphatic function and help eliminate metabolic waste products released from muscle tissue."
    },
    {
      "heading": "Communication Key",
      "body": "Provide feedback on pressure and comfort throughout your session - therapeutic massage should feel beneficial, not painful, for optimal nervous system response."
    },
    {
      "heading": "Consistency Counts",
      "body": "Regular sessions every 2-4 weeks maintain therapeutic benefits and prevent return of chronic tension patterns, especially when combined with stress management techniques."
    }
  ]
};

s.faq = [
  {
    "q": "What types of massage does RELUXE offer?",
    "a": "RELUXE offers Swedish massage for relaxation, deep tissue massage for tension and muscle knots, and custom-pressure massage tailored to your preferences. Every session is personalized — your licensed massage therapist will adjust technique and pressure based on your needs, whether you want full-body relaxation or focused work on problem areas like neck, shoulders, or lower back."
  },
  {
    "q": "How much does a massage cost at RELUXE?",
    "a": "RELUXE offers 60-minute and 90-minute massage sessions. Add-ons including hot stone, cupping, and gua sha are available for $20 each. VIP Members receive discounted pricing on all massage services. We recommend booking online or calling for current session rates and any package availability."
  },
  {
    "q": "What add-ons are available for massage?",
    "a": "We offer three premium add-ons for $20 each: hot stone therapy (heated basalt stones placed on tension points for deeper muscle relaxation), cupping (silicone cups that increase blood flow and release tight fascia), and gua sha (a traditional scraping technique that relieves muscle tension and promotes circulation). You can add one or multiple upgrades to any massage session."
  },
  {
    "q": "How long should my massage session be?",
    "a": "A 60-minute session is ideal for general relaxation, stress relief, or targeting one or two specific areas. A 90-minute session is recommended if you want full-body work with extra time on problem areas, or if you're adding services like hot stone or cupping. If it's your first visit and you're unsure, 60 minutes is a great starting point."
  },
  {
    "q": "What should I expect during my first massage at RELUXE?",
    "a": "You'll arrive and complete a brief intake form covering your health history and areas of focus. Your licensed massage therapist will discuss your goals, pressure preferences, and any areas to avoid. You'll be in a private, comfortable treatment room. Only the area being worked on is uncovered at any time. Afterward, we'll recommend hydration and any follow-up care."
  },
  {
    "q": "Do I need to undress completely for a massage?",
    "a": "You undress to your comfort level. Most clients remove clothing but remain draped with a sheet throughout the session — only the area being actively worked on is uncovered. You can leave undergarments on if you prefer. Your comfort and privacy are always the priority."
  },
  {
    "q": "How often should I get a massage?",
    "a": "For general wellness and stress management, once a month is a popular cadence. If you're addressing chronic pain, tension, or recovering from an injury, every 2-3 weeks may be more effective initially. Regular massage has cumulative benefits — consistent sessions keep muscles looser, reduce stress hormones, and improve sleep quality over time."
  },
  {
    "q": "Can massage help with chronic pain or tension?",
    "a": "Yes. Therapeutic massage is clinically shown to reduce chronic muscle tension, headaches, lower back pain, and stress-related symptoms. Deep tissue massage targets the deeper muscle layers where chronic knots and adhesions form. Our licensed massage therapists customize pressure and technique to address your specific pain patterns while keeping the experience comfortable."
  },
  {
    "q": "Who are the massage therapists at RELUXE?",
    "a": "All massage therapists at RELUXE are licensed professionals with training in multiple modalities. They specialize in Swedish, deep tissue, and customized therapeutic techniques. Each therapist tailors every session to your individual needs and preferences, ensuring you get a treatment that's both effective and relaxing."
  },
  {
    "q": "Can I combine massage with other RELUXE services?",
    "a": "Absolutely. Many clients pair massage with facials, infrared sauna, or salt room sessions for a full wellness experience. Massage before a facial can enhance relaxation and improve product absorption. You can also book massage as part of ongoing wellness alongside aesthetic treatments like injectables. Ask about bundling services for the ultimate self-care day."
  }
];

export default s;
