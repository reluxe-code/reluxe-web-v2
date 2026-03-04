// src/data/services/laserhair.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('laser-hair-removal');

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

s.tagline = "Advanced laser technology for lasting smooth, hair-free skin.";

s.seo = {
  "title": "Laser Hair Removal Westfield & Carmel IN | RELUXE Med Spa",
  "description": "Professional laser hair removal in Westfield & Carmel, Indiana. Advanced technology for lasting smooth skin. Free consultation at RELUXE Med Spa."
};

s.quickFacts = [
  {
    "iconKey": "clock",
    "label": "Duration",
    "value": "5–45 min (area-dependent)"
  },
  {
    "iconKey": "fire",
    "label": "Downtime",
    "value": "None"
  },
  {
    "iconKey": "calendar",
    "label": "Sessions",
    "value": "6–10+ (every 4–8 wks)"
  },
  {
    "iconKey": "sparkles",
    "label": "Shedding",
    "value": "7–14 days post-treatment"
  },
  {
    "iconKey": "user",
    "label": "Skin Types",
    "value": "I–VI (device-dependent)"
  },
  {
    "iconKey": "user",
    "label": "Comfort",
    "value": "Low–Moderate (cooling)"
  }
];

s.benefits = [
  "Significant hair reduction",
  "Fast appointments",
  "No more shaving rash"
];

s.overview = {
  "p1": "Laser hair removal targets follicles to reduce growth for smoother, lower-maintenance skin.",
  "p2": "We tailor settings by skin/hair type and offer flexible plans—from single areas to unlimited packages."
};

s.whyReluxe = [
  {
    "title": "Settings by skin type",
    "body": "Safer, more effective results across Fitzpatrick types."
  },
  {
    "title": "Plan flexibility",
    "body": "Unlimited, 12-month, or pay-as-you-go—your call."
  },
  {
    "title": "Fast, friendly visits",
    "body": "Efficient appointments that fit busy calendars."
  }
];

s.howItWorks = [
  {
    "title": "Consultation + test spot",
    "body": "Assess hair/skin type, goals, contraindications; optional test pulse for settings."
  },
  {
    "title": "Treatment with cooling",
    "body": "Target follicles in their growth phase using chilled tip & smooth passes for comfort."
  },
  {
    "title": "Aftercare & schedule",
    "body": "Soothe, protect from sun, and plan your series for best reduction."
  }
];

s.candidates = {
  "good": [
    "Individuals with dark, coarse hair seeking permanent reduction",
    "Those tired of daily shaving, waxing, or tweezing routines",
    "People with ingrown hairs from traditional hair removal methods",
    "Patients wanting smooth skin for athletic or professional reasons",
    "Anyone seeking long-term cost savings from reduced grooming needs"
  ],
  "notIdeal": [
    "Pregnant or breastfeeding women",
    "Those with active tans or recent sun exposure in treatment areas",
    "Individuals taking photosensitizing medications or with certain autoimmune conditions"
  ]
};

s.pricingMatrix = {
  "sections": [
    {
      "title": "Laser Hair Removal",
      "note": "Area guides: Small • Standard • Large • X-Large",
      "rows": [
        {
          "label": "Small Area",
          "single": "$100",
          "package": "$500 (Buy 5, get 3 free)",
          "subLabel": "Areas: Upper Lip, Chin, Hands, Feet"
        },
        {
          "label": "Standard Area",
          "single": "$250",
          "package": "$1250 (Buy 5, get 3 free",
          "subLabel": "Areas: Under Arms, Bikini Lines, Face, Half Arms, Half Back, Stomach, Shoulder"
        },
        {
          "label": "Large Area",
          "single": "$450",
          "package": "$2250 (Buy 5, get 3 free",
          "subLabel": "Areas: Brazilian (female only), Lower Legs, Full Back, Full Chest"
        },
        {
          "label": "X-Large Area",
          "single": "$750",
          "package": "$3750 (Buy 5, get 3 free",
          "subLabel": "Areas: Full Legs"
        },
        {
          "label": "Truly Unlimited",
          "single": "$5000",
          "package": "18-Months",
          "subLabel": "Unlimited sessions. Unlimited areas. 18-months"
        }
      ],
      "promo": "Additional areas 50% off (same visit). Additional Packages 50% off (lowest price)",
      "ctaText": "Book Your Treatment"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Shave the area 12–24 hrs before (no waxing, plucking, or threading for 4+ weeks).",
      "Avoid self-tanner & significant sun for 2 weeks pre-treatment.",
      "Pause photosensitizing products/meds as advised by your provider.",
      "Arrive with clean, lotion-/deodorant-free skin on the area."
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Mild redness/follicular bumps are normal and fade within hours–1 day.",
      "Cool compresses + gentle lotion/aloe as needed; avoid hot tubs/sauna 24–48 hrs.",
      "No plucking/waxing between sessions—shaving only.",
      "Expect shedding of treated hairs in 1–2 weeks (looks like “pepper spots”).",
      "SPF daily; limit sun for 2 weeks post."
    ]
  }
};

s.flexEverything = {
  "intro": "We tailor settings for safety and efficacy by skin type and area.",
  "items": [
    {
      "heading": "Prep",
      "body": "Shave 24 hrs before; no waxing 4+ weeks prior."
    }
  ]
};

s.faq = [
  {
    "q": "What is laser hair removal and how does it work?",
    "a": "Laser hair removal uses concentrated light energy to target the melanin (pigment) in hair follicles. The laser heats and damages the follicle during its active growth phase, preventing future hair growth. Over a series of sessions, you achieve significant, long-lasting hair reduction. At RELUXE, we use advanced devices with built-in cooling for comfort."
  },
  {
    "q": "How much does laser hair removal cost at RELUXE?",
    "a": "Pricing depends on the treatment area. We offer flexible options: single sessions (pay-as-you-go), area packages (buy 5, get 3), and our comprehensive 18-month unlimited package at $5,000 for full-body coverage. VIP Members receive additional savings. We provide exact pricing for your specific areas during your free consultation."
  },
  {
    "q": "How many laser hair removal sessions do I need?",
    "a": "Most areas require 6-10+ sessions spaced 4-8 weeks apart. Hair grows in cycles, and the laser only treats follicles in the active growth phase (about 20-30% at any given time). That's why multiple sessions are needed to catch all follicles. Hormonal areas like chin and bikini may need additional sessions."
  },
  {
    "q": "Does laser hair removal hurt?",
    "a": "Most patients describe it as brief snaps with warmth — like a rubber band flick. Our devices have built-in cooling tips that significantly improve comfort. Pain tolerance varies by area: underarms and bikini tend to be more sensitive, while legs and back are very tolerable. Numbing cream is available but rarely needed."
  },
  {
    "q": "Is laser hair removal permanent?",
    "a": "Laser hair removal delivers long-term hair reduction, not guaranteed permanent removal. Most patients see 70-90% reduction after a full series. Some follicles may go dormant and reactivate due to hormones, aging, or new growth cycles. Occasional maintenance sessions (1-2 per year) keep results smooth."
  },
  {
    "q": "What areas can laser hair removal treat?",
    "a": "We treat virtually any area: face (upper lip, chin, sideburns), underarms, bikini (including Brazilian), legs (full or partial), arms, back, chest, abdomen, shoulders, and neck. Area size affects treatment time — upper lip takes about 5 minutes while full legs can take 30-45 minutes."
  },
  {
    "q": "Is laser hair removal safe for dark skin?",
    "a": "Yes — with the right device and settings. We adjust wavelength and energy levels based on your skin type (Fitzpatrick I-VI). We perform test spots on darker skin tones to confirm settings before full treatment. Our providers are experienced in treating all skin tones safely and effectively."
  },
  {
    "q": "What is the downtime after laser hair removal?",
    "a": "There's essentially no downtime. You may have mild redness and follicular bumps (like a light sunburn) for a few hours to one day. You can return to work and normal activities immediately. Avoid hot tubs, saunas, and intense exercise for 24-48 hours. Wear SPF on treated areas exposed to sun."
  },
  {
    "q": "How do I prepare for laser hair removal?",
    "a": "Shave the treatment area 12-24 hours before your appointment — do not wax, pluck, or thread for at least 4 weeks prior (the follicle must be intact). Avoid self-tanner and significant sun exposure for 2 weeks before. Arrive with clean skin, free of lotions and deodorant on the treatment area."
  },
  {
    "q": "When will I see results from laser hair removal?",
    "a": "Treated hairs don't fall out immediately. Over 7-14 days, you'll notice \"shedding\" — treated hairs push out and fall away (they look like tiny pepper spots). After each session, you'll see progressively less regrowth. Most patients notice significant reduction after 3-4 sessions."
  },
  {
    "q": "Can I shave between laser hair removal sessions?",
    "a": "Yes — shaving is the only approved hair removal method between sessions. Do not wax, tweeze, or thread, as these methods remove the hair follicle that the laser needs to target. Shaving is fine because it cuts hair at the surface without affecting the root."
  },
  {
    "q": "What is the difference between laser hair removal and IPL for hair?",
    "a": "Professional laser hair removal uses a single, concentrated wavelength that targets follicles more precisely and effectively than IPL (broad-spectrum light). Our medical-grade lasers deliver better results in fewer sessions, especially for finer hair and varied skin tones. At-home IPL devices are significantly less powerful than what we use in-clinic."
  }
];

export default s;
