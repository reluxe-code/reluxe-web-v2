// src/data/services/evolvex.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('evolvex');

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

s.tagline = "Revolutionary hands-free body remodeling with measurable results";

s.seo = {
  "title": "EvolveX Body Contouring Westfield IN | RELUXE Med Spa",
  "description": "Non-invasive body contouring with EvolveX in Westfield, IN. Skin tightening + muscle building. Expert care at RELUXE Med Spa."
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
    "value": "4-6 weeks"
  },
  {
    "iconKey": "fire",
    "label": "Duration",
    "value": "6+ months"
  }
];

s.benefits = [
  "Non-invasive muscle building equivalent to 20,000 muscle contractions per session",
  "Simultaneous skin tightening through deep dermal collagen remodeling",
  "Measurable reduction in abdominal circumference and improved muscle definition",
  "Comfortable treatment with adjustable intensity levels",
  "No anesthesia, incisions, or recovery time required"
];

s.overview = {
  "p1": "EvolveX combines radiofrequency energy with electromagnetic muscle stimulation to deliver comprehensive body remodeling through three distinct modalities: Tite (bipolar RF for skin tightening), Tone (EMS for muscle building), and Transform (combining both technologies). This FDA-cleared platform uses controlled thermal heating to remodel collagen and elastin while simultaneously triggering involuntary muscle contractions equivalent to thousands of crunches or squats. The hands-free system treats multiple areas simultaneously, delivering measurable improvements in skin laxity, muscle definition, and body circumference.",
  "p2": "At RELUXE's Westfield location, our nurse practitioners design customized EvolveX protocols based on your specific body goals and baseline measurements. We provide detailed body mapping during your complimentary consultation and include 2-week progress assessments to optimize your treatment parameters throughout your series."
};

s.whyReluxe = [
  {
    "title": "Nurse Practitioner Oversight",
    "body": "Our NPs customize energy settings and treatment protocols based on your skin type, muscle density, and aesthetic goals for optimal results."
  },
  {
    "title": "Progress Tracking",
    "body": "We take detailed measurements and photos at each session to document your body contouring progress and adjust protocols as needed."
  },
  {
    "title": "Combination Protocols",
    "body": "We can seamlessly integrate EvolveX with our other body treatments like Morpheus8 or infrared sauna sessions for enhanced results."
  }
];

s.howItWorks = [
  {
    "title": "Assessment & Mapping",
    "body": "We measure treatment areas and assess skin laxity and muscle tone to create your customized protocol. Electrodes are positioned strategically based on your anatomy."
  },
  {
    "title": "Dual Energy Delivery",
    "body": "Radiofrequency energy heats deep tissue to 40-45°C while electromagnetic pulses trigger supramaximal muscle contractions. You'll feel warming and intense muscle engagement."
  },
  {
    "title": "Progressive Intensification",
    "body": "Energy levels are gradually increased throughout your series as your muscles adapt and skin responds, maximizing remodeling effects over 6-8 sessions."
  }
];

s.candidates = {
  "good": [
    "Mild to moderate skin laxity on abdomen, flanks, or thighs",
    "Desire for muscle definition without surgery",
    "Post-pregnancy body changes",
    "Stubborn areas resistant to diet and exercise",
    "Healthy individuals within 30 pounds of ideal weight"
  ],
  "notIdeal": [
    "Pregnancy or breastfeeding",
    "Metal implants in treatment area",
    "Severe skin laxity requiring surgical intervention"
  ]
};

s.pricingMatrix = {
  "subtitle": "EvolveX treatments are priced per modality with package discounts for series",
  "sections": [
    {
      "title": "EvolveX Body Contouring",
      "note": "Series of 6-8 sessions recommended for optimal results. Available at Westfield location only.",
      "membershipCallout": "VIP Members save 10-15% on all packages",
      "rows": [
        {
          "label": "EvolveX Tite",
          "subLabel": "Skin tightening with radiofrequency",
          "single": "Consult for pricing",
          "membership": "Member discount applies"
        },
        {
          "label": "EvolveX Tone",
          "subLabel": "Muscle stimulation and building",
          "single": "Consult for pricing",
          "membership": "Member discount applies"
        },
        {
          "label": "EvolveX Transform",
          "subLabel": "Combined skin tightening + muscle building",
          "single": "Consult for pricing",
          "membership": "Member discount applies"
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
      "Stay well-hydrated for 24 hours before treatment",
      "Avoid anti-inflammatory medications for 48 hours if possible",
      "Wear comfortable athletic clothing",
      "Remove all jewelry and metal objects from treatment area"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Continue drinking plenty of water to support lymphatic drainage",
      "Light exercise like walking is encouraged within 24 hours",
      "Avoid intense workouts for 24-48 hours to allow muscle recovery",
      "Apply moisturizer to treated areas as skin may feel slightly dry",
      "Schedule your next session 5-7 days after previous treatment"
    ]
  }
};

s.flexEverything = {
  "intro": "Expert insights for maximizing your EvolveX body contouring results",
  "items": [
    {
      "heading": "Hydration Protocol",
      "body": "Drink 64+ ounces of water daily throughout your series to optimize lymphatic drainage and enhance collagen synthesis for better skin tightening results."
    },
    {
      "heading": "Nutrition Timing",
      "body": "Consume protein within 2 hours post-treatment to support the muscle repair and building process triggered by electromagnetic stimulation."
    },
    {
      "heading": "Session Spacing",
      "body": "Schedule treatments 5-7 days apart to allow full muscle recovery while maintaining momentum in the collagen remodeling process."
    },
    {
      "heading": "Combination Benefits",
      "body": "Pair EvolveX with our infrared sauna sessions to enhance circulation and potentially accelerate the skin tightening response through improved collagen turnover."
    }
  ]
};

s.faq = [
  {
    "q": "What is EvolveX and how does it work?",
    "a": "EvolveX by InMode is a hands-free body contouring platform that combines three technologies in one system: Tite (radiofrequency skin tightening), Tone (electrical muscle stimulation), and Transform (combined fat reduction, muscle building, and skin tightening). Applicators are strapped to the treatment area, and the device delivers energy while you relax. It's a non-invasive alternative to surgical body contouring that requires zero downtime."
  },
  {
    "q": "What is the difference between EvolveX Tite, Tone, and Transform?",
    "a": "Tite uses radiofrequency energy to heat the deep layers of skin, triggering collagen production and skin tightening. Tone delivers electrical muscle stimulation (EMS) to strengthen and define muscles — similar to thousands of contractions in one session. Transform combines both modalities simultaneously, targeting fat, muscle, and skin in a single treatment for the most comprehensive body contouring results."
  },
  {
    "q": "How much does EvolveX cost at RELUXE?",
    "a": "EvolveX pricing at RELUXE depends on the treatment area and which modality (Tite, Tone, or Transform) is used. We offer package pricing for a series of 6-8 sessions, which is where you'll see the best value and results. VIP Members save 10-15% on all treatments. Your provider will give you exact pricing during your free consultation based on your goals."
  },
  {
    "q": "Does EvolveX hurt?",
    "a": "EvolveX is generally comfortable. During Tite, you'll feel deep warmth as the radiofrequency heats the tissue. During Tone, you'll feel strong muscle contractions that can be intense but are not painful — the intensity is gradually increased to your tolerance. Transform combines both sensations. Most patients describe it as a warm deep-tissue workout. No numbing or anesthesia is required."
  },
  {
    "q": "How many EvolveX sessions do I need?",
    "a": "A series of 6-8 treatments is recommended for optimal results, typically scheduled 1-2 times per week. Each session takes 30-60 minutes depending on the areas treated. You'll start noticing improvements after 3-4 sessions, with full results visible 2-3 months after completing the series as collagen continues to remodel."
  },
  {
    "q": "When will I see results from EvolveX?",
    "a": "Many patients notice subtle tightening and muscle definition after 3-4 sessions. Skin tightening results continue to build for 3-6 months after your final treatment as collagen remodels. Muscle toning results are often visible sooner. A full series of 6-8 treatments delivers the most dramatic improvement. Maintaining a healthy lifestyle helps preserve your results long-term."
  },
  {
    "q": "What is the downtime after EvolveX?",
    "a": "EvolveX requires zero downtime. You can return to work and normal activities immediately after treatment. Some patients experience mild redness or warmth in the treatment area that resolves within a few hours. Muscle soreness similar to a workout may occur after Tone or Transform sessions. There are no incisions, no compression garments, and no recovery period."
  },
  {
    "q": "What areas can EvolveX treat?",
    "a": "EvolveX treats the abdomen, flanks (love handles), thighs (inner and outer), buttocks, and upper arms. It's ideal for patients who want to tighten loose skin, reduce stubborn fat pockets, and build muscle definition in these areas. Your provider will customize the applicator placement and modality selection for your specific body goals."
  },
  {
    "q": "How does EvolveX compare to CoolSculpting or liposuction?",
    "a": "Unlike CoolSculpting (which only reduces fat) or liposuction (which is surgical), EvolveX addresses fat, muscle, and skin simultaneously. It requires no anesthesia, no incisions, and no downtime. While results are more gradual than surgery, EvolveX is ideal for patients who want noticeable improvement without the risks and recovery of invasive procedures. It's body contouring, not weight loss."
  },
  {
    "q": "Who is a good candidate for EvolveX?",
    "a": "EvolveX is ideal for adults near their goal weight who want to address loose skin, stubborn fat, or lack of muscle definition in the abdomen, flanks, thighs, or arms. It's great for post-pregnancy body contouring or for patients who want a non-surgical alternative. You should avoid EvolveX if you're pregnant, have a pacemaker or metal implants in the treatment area, or have certain medical conditions."
  },
  {
    "q": "What are the side effects of EvolveX?",
    "a": "Side effects are minimal and temporary. The most common include mild redness, warmth, and slight swelling in the treatment area that resolves within hours. Muscle soreness similar to an intense workout may last 1-2 days after Tone or Transform sessions. Serious side effects are rare. The treatment has an excellent safety profile under our Medical Director's oversight at RELUXE."
  },
  {
    "q": "Can I combine EvolveX with other treatments?",
    "a": "Yes — EvolveX pairs well with other body and skin treatments. Many patients combine it with Morpheus8 for enhanced skin tightening, Sculptra for volume and collagen stimulation, or facial treatments like tox and filler. Your provider at RELUXE will design a comprehensive plan during your free consultation to address both your body and face goals."
  }
];

export default s;
