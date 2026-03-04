// src/data/services/saltsauna.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('saltsauna');

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

s.tagline = "Dual therapy for deeper recovery and respiratory wellness";

s.seo = {
  "title": "Salt Sauna Therapy in Westfield, IN | RELUXE Med Spa",
  "description": "Infrared sauna + halotherapy salt therapy in Westfield. Enhanced recovery, respiratory wellness, and relaxation at RELUXE Med Spa."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Session Time",
    "value": "45-60 minutes"
  },
  {
    "iconKey": "sparkles",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "user",
    "label": "Benefits Felt",
    "value": "Immediately"
  },
  {
    "iconKey": "fire",
    "label": "Temperature",
    "value": "120-140°F"
  }
];

s.benefits = [
  "Enhanced post-treatment recovery through improved lymphatic drainage",
  "Respiratory support through pharmaceutical-grade salt aerosol exposure",
  "Deep muscle relaxation and tension relief via far-infrared penetration",
  "Improved circulation and cellular detoxification processes",
  "Stress reduction through negative ion exposure and chromotherapy"
];

s.overview = {
  "p1": "Salt Sauna combines the respiratory benefits of pharmaceutical-grade sodium chloride aerosol (halotherapy) with the deep tissue warming of full-spectrum infrared heat therapy. This dual modality approach helps open airways through negative ion exposure while promoting circulation, detoxification, and muscle recovery through far-infrared penetration at the cellular level. The micro-particles of pure salt create a sterile environment that may help reduce inflammation in respiratory pathways while the infrared sauna's chromotherapy and heat work synergistically to enhance relaxation and recovery.",
  "p2": "At RELUXE's Westfield location, our Salt Sauna experience is designed as the perfect complement to your aesthetic treatments, providing a meditative space to enhance recovery and overall wellness. Our team will customize your session timing and temperature preferences during your consultation, ensuring optimal comfort whether you're using this as post-treatment recovery or standalone wellness therapy."
};

s.whyReluxe = [
  {
    "title": "Dual Therapy Design",
    "body": "Our unique combination of halotherapy salt exposure and full-spectrum infrared creates a synergistic wellness experience that addresses both respiratory health and muscle recovery in one session."
  },
  {
    "title": "Treatment Integration",
    "body": "Perfectly timed as a recovery enhancement after Morpheus8, CO2 laser, or EvolveX treatments, helping reduce inflammation while promoting healing through improved circulation."
  },
  {
    "title": "Westfield Wellness Hub",
    "body": "Located in our flagship Westfield location alongside our full range of medical spa services, allowing you to create comprehensive wellness and beauty treatment days."
  }
];

s.howItWorks = [
  {
    "title": "Salt Preparation",
    "body": "Pharmaceutical-grade sodium chloride is dispersed as micro-particles through specialized equipment, creating a sterile, negative-ion rich environment that helps open respiratory pathways."
  },
  {
    "title": "Infrared Activation",
    "body": "Full-spectrum infrared panels warm your body from within at the cellular level, promoting circulation, muscle relaxation, and natural detoxification through gentle perspiration."
  },
  {
    "title": "Synergistic Recovery",
    "body": "The combination of salt therapy's anti-inflammatory properties and infrared's circulation enhancement creates an optimal environment for both respiratory wellness and physical recovery."
  }
];

s.candidates = {
  "good": [
    "Post-treatment recovery enhancement",
    "Respiratory wellness support",
    "Muscle tension and soreness",
    "Stress and anxiety management",
    "Circulation improvement needs"
  ],
  "notIdeal": [
    "Active respiratory infections",
    "Severe cardiovascular conditions",
    "Pregnancy (consult required)"
  ]
};

s.pricingMatrix = {
  "subtitle": "Salt Sauna sessions are designed as wellness add-ons to complement your RELUXE treatments",
  "sections": [
    {
      "title": "Salt Sauna Sessions",
      "note": "Available exclusively at our Westfield location as standalone wellness or treatment enhancement",
      "membershipCallout": "VIP Members save 10% on all wellness sessions",
      "rows": [
        {
          "label": "Single Session",
          "subLabel": "45-60 minute combined salt and infrared therapy",
          "single": "Starting at $75",
          "membership": "$68"
        },
        {
          "label": "Treatment Add-On",
          "subLabel": "Enhanced recovery when combined with medical treatments",
          "single": "Starting at $50",
          "membership": "$45"
        }
      ],
      "promo": "Ask about wellness packages combining Salt Sauna with massage and other recovery modalities",
      "ctaText": "Book Wellness Session"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your session",
    "points": [
      "Arrive hydrated and continue hydrating throughout the day",
      "Wear comfortable, loose-fitting clothing or swimwear",
      "Remove all jewelry and metal accessories before entering",
      "Inform staff of any respiratory conditions or recent illness"
    ]
  },
  "after": {
    "title": "After your session",
    "points": [
      "Continue hydrating with electrolyte-rich fluids for optimal recovery",
      "Shower with lukewarm water to rinse salt residue and maintain skin hydration",
      "Avoid intense physical activity for 2-3 hours to maximize circulation benefits",
      "Allow your body to continue sweating naturally for continued detoxification",
      "Monitor how you feel and adjust session frequency based on your body's response"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights to maximize your Salt Sauna wellness experience at RELUXE Westfield",
  "items": [
    {
      "heading": "Post-Treatment Timing",
      "body": "Schedule Salt Sauna 2-4 hours after laser or energy-based treatments to enhance healing without interfering with initial recovery processes."
    },
    {
      "heading": "Hydration Strategy",
      "body": "Begin hydrating 2 hours before your session and continue with electrolyte supplements afterward to maximize detoxification benefits and prevent dehydration."
    },
    {
      "heading": "Frequency Optimization",
      "body": "Start with 1-2 sessions per week and adjust based on your recovery needs and how your body responds to the combined salt and infrared therapy."
    },
    {
      "heading": "Breathing Technique",
      "body": "Practice slow, deep nasal breathing during the first 15 minutes to maximize salt particle absorption and respiratory benefits."
    }
  ]
};

s.faq = [
  {
    "q": "What is halotherapy (salt therapy) and how does it work?",
    "a": "Halotherapy involves sitting in a specially designed salt room where pharmaceutical-grade salt is dispersed into the air as a fine aerosol. As you breathe in the micro-particles, salt naturally reduces inflammation in the airways, loosens mucus, and has antibacterial properties. On the skin, salt helps draw out impurities, reduce inflammation, and improve conditions like eczema and psoriasis. It's a passive, relaxing therapy — you simply sit and breathe."
  },
  {
    "q": "What is an infrared sauna and how is it different from a traditional sauna?",
    "a": "An infrared sauna uses infrared light waves to heat your body directly rather than heating the air around you like a traditional sauna. This means it operates at a lower, more comfortable temperature (120-150 degrees F vs. 180-200 degrees F) while still producing a deep, detoxifying sweat. Benefits include muscle recovery, pain relief, improved circulation, relaxation, and detoxification. Most people find infrared saunas more comfortable and easier to tolerate than steam saunas."
  },
  {
    "q": "How much do salt room and infrared sauna sessions cost?",
    "a": "Sessions start at $25+, with bundle packs available for additional savings. VIP Members receive discounted pricing on all wellness services. These are great add-on experiences to pair with other RELUXE treatments. Check our current pricing online or contact us for bundle and membership details."
  },
  {
    "q": "What are the benefits of the salt room?",
    "a": "The salt room offers respiratory benefits including relief from allergies, sinus congestion, asthma symptoms, and general breathing improvement. For the skin, halotherapy helps with eczema, psoriasis, acne, and overall skin clarity. It's also deeply relaxing and can reduce stress and improve sleep quality. Many clients notice improved breathing and clearer skin after just a few sessions."
  },
  {
    "q": "What are the benefits of infrared sauna?",
    "a": "Infrared sauna benefits include deep detoxification through sweating, muscle and joint pain relief, improved circulation, faster post-workout recovery, stress reduction, better sleep, and a temporary boost in metabolism. The deep-penetrating heat also promotes collagen production and can improve skin tone and clarity. It's a favorite for athletes, chronic pain sufferers, and anyone looking to unwind."
  },
  {
    "q": "How long is a salt room or infrared sauna session?",
    "a": "Salt room sessions typically run 30-45 minutes, which is enough time for the salt aerosol to provide respiratory and skin benefits. Infrared sauna sessions are generally 30-45 minutes as well. You can book them individually or combine both for a full wellness experience. Your body will guide how long feels right, especially if you're new to these therapies."
  },
  {
    "q": "Is the salt room or infrared sauna available at both RELUXE locations?",
    "a": "The salt room and infrared sauna are currently available at our Westfield, Indiana location. These wellness amenities are part of our expanded service offerings designed to complement our aesthetic treatments. Contact us or check our online booking to see current availability and scheduling options."
  },
  {
    "q": "Who should try the salt room or infrared sauna?",
    "a": "The salt room is especially beneficial for anyone with allergies, sinus issues, asthma, skin conditions like eczema or psoriasis, or anyone wanting respiratory and skin improvement. The infrared sauna is ideal for athletes, those with chronic muscle or joint pain, anyone seeking detoxification, or people who simply want deep relaxation. Both are great for general wellness and stress relief."
  },
  {
    "q": "Are there any restrictions or contraindications?",
    "a": "Most healthy adults can enjoy both therapies safely. For the infrared sauna, you should avoid it if you're pregnant, have uncontrolled blood pressure, or have certain heart conditions. Stay well-hydrated before and after. For the salt room, those with severe respiratory conditions should consult their doctor first. We'll review any health concerns during booking or at check-in to ensure a safe, comfortable experience."
  },
  {
    "q": "Can I combine salt room and sauna with other RELUXE services?",
    "a": "Yes — many clients add salt room or infrared sauna sessions before or after other treatments for a full wellness day. Infrared sauna pairs beautifully with massage for enhanced muscle relaxation. The salt room is a calming complement to facials and skin treatments. Ask about combining services when you book to create your ideal experience at RELUXE."
  }
];

export default s;
