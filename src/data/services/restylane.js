// src/data/services/restylane.js
import { getDefaultService } from '../servicesDefault';
const s = getDefaultService('restylane');

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

s.tagline = "Advanced hyaluronic acid fillers for natural structure and movement";

s.seo = {
  "title": "Restylane in Westfield & Carmel, IN | RELUXE Med Spa",
  "description": "Expert Restylane treatments using NASHA & XpresHAn technology. Lyft, Contour, Defyne & Kysse fillers in Westfield & Carmel. Free consultations."
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
    "value": "12-18 months"
  }
];

s.benefits = [
  "NASHA technology provides stable, long-lasting structural support",
  "XpresHAn gel maintains natural facial movement and expression",
  "Lidocaine integration reduces injection discomfort",
  "Gradual hyaluronic acid breakdown for natural-looking fade",
  "Reversible with hyaluronidase if adjustment needed"
];

s.overview = {
  "p1": "Restylane is a family of FDA-approved hyaluronic acid dermal fillers utilizing advanced NASHA (Non-Animal Stabilized Hyaluronic Acid) and XpresHAn Technology to restore facial volume and smooth lines. The NASHA gel provides stable, long-lasting structure for deeper support areas like cheeks and jawlines, while XpresHAn's flexible gel matrix maintains natural movement in dynamic areas like the lips and nasolabial folds. Each Restylane product is specifically engineered with varying particle sizes and cross-linking densities to target different facial zones, from the precise lip enhancement of Kysse to the structural support of Lyft for midface volumization.",
  "p2": "At RELUXE Med Spa in Westfield and Carmel, our NP-led team and expert RN injectors create personalized Restylane treatment plans during your complimentary consultation, selecting the optimal product formulation for your specific anatomy and aesthetic goals. We provide detailed mapping of injection sites, utilize advanced numbing techniques for comfort, and include complimentary 2-week follow-up appointments to ensure your results meet our exacting standards."
};

s.whyReluxe = [
  {
    "title": "Product Expertise",
    "body": "Our injectors are trained in the specific properties of each Restylane formulation, ensuring Lyft is used for cheek projection, Contour for natural cheek enhancement, Defyne for jawline definition, and Kysse for lip perfection."
  },
  {
    "title": "Precision Mapping",
    "body": "We use detailed facial analysis to determine optimal injection depths and placement patterns, maximizing the unique benefits of NASHA and XpresHAn technologies for natural-looking results."
  },
  {
    "title": "Follow-Up Assurance",
    "body": "Every Restylane treatment includes a complimentary 2-week follow-up to assess settling, symmetry, and satisfaction, with touch-ups performed at no additional charge when needed."
  }
];

s.howItWorks = [
  {
    "title": "Consultation & Planning",
    "body": "Our providers analyze your facial structure and discuss aesthetic goals to select the optimal Restylane formulation and create a detailed injection map for natural-looking enhancement."
  },
  {
    "title": "Precise Injection",
    "body": "Using fine needles or cannulas, we strategically place Restylane at specific depths—superficial for fine lines, mid-dermal for moderate wrinkles, and deep for volume restoration."
  },
  {
    "title": "Sculpting & Assessment",
    "body": "We massage and sculpt the product for optimal distribution, immediately assessing symmetry and projection to ensure results align with your treatment goals."
  }
];

s.candidates = {
  "good": [
    "Volume loss in cheeks or midface",
    "Nasolabial folds and marionette lines",
    "Thin or asymmetrical lips",
    "Jawline definition needs",
    "Non-surgical facial contouring goals"
  ],
  "notIdeal": [
    "Active infection at treatment site",
    "Severe allergies to hyaluronic acid",
    "Unrealistic expectations for surgical-level changes"
  ]
};

s.pricingMatrix = {
  "subtitle": "Restylane pricing is per syringe with specific formulations for targeted treatment areas.",
  "sections": [
    {
      "title": "Restylane Treatment Pricing",
      "note": "Each product is specifically formulated for different facial areas and aesthetic goals.",
      "membershipCallout": "VIP Members save $50 per syringe on all Restylane treatments",
      "rows": [
        {
          "label": "Restylane Lyft",
          "subLabel": "Cheek volumization and lifting",
          "single": "$750",
          "membership": "$700"
        },
        {
          "label": "Restylane Contour",
          "subLabel": "Natural cheek enhancement",
          "single": "$750",
          "membership": "$700"
        },
        {
          "label": "Restylane Defyne",
          "subLabel": "Jawline definition and contouring",
          "single": "$750",
          "membership": "$700"
        },
        {
          "label": "Restylane Kysse",
          "subLabel": "Lip enhancement and definition",
          "single": "$750",
          "membership": "$700"
        }
      ],
      "promo": "Cherry financing available for treatment packages",
      "ctaText": "Book Free Consultation"
    }
  ]
};

s.prepAftercare = {
  "prep": {
    "title": "Before your visit",
    "points": [
      "Avoid blood-thinning medications and supplements for 1 week prior",
      "No alcohol for 24 hours before treatment",
      "Stop retinoids 3 days before injection appointments",
      "Arrive with clean skin, free of makeup in treatment areas"
    ]
  },
  "after": {
    "title": "After your visit",
    "points": [
      "Apply ice for 10-15 minutes every few hours for the first day",
      "Sleep elevated for 2 nights to minimize swelling",
      "Avoid strenuous exercise and heat exposure for 24-48 hours",
      "Do not massage treated areas unless specifically instructed",
      "Contact our team immediately with any concerning symptoms or asymmetry"
    ]
  }
};

s.flexEverything = {
  "intro": "Maximize your Restylane results with these expert strategies from our RELUXE providers.",
  "items": [
    {
      "heading": "Combination Approach",
      "body": "Restylane works beautifully with neurotoxins—treat dynamic lines with Botox first, then address volume loss with fillers 2 weeks later for comprehensive facial rejuvenation."
    },
    {
      "heading": "Maintenance Timing",
      "body": "Schedule touch-ups at 12-14 months for NASHA products and 10-12 months for XpresHAn formulations to maintain continuous results without over-filling."
    },
    {
      "heading": "Swelling Management",
      "body": "Use arnica tablets starting 3 days before treatment and apply cold compresses intermittently for 48 hours to minimize bruising and accelerate healing."
    },
    {
      "heading": "Results Enhancement",
      "body": "Consider adding SkinBetter Science AlphaRet to your routine 1 week post-treatment to improve skin quality and extend the longevity of your filler results."
    }
  ]
};

s.faq = [
  {
    "q": "What is Restylane?",
    "a": "Restylane is a family of hyaluronic acid (HA) dermal fillers made by Galderma. It was one of the first HA fillers approved in the U.S. and remains one of the most trusted names in injectables. The product line includes Restylane (original), Restylane Lyft for cheeks and hands, Restylane Kysse for lips, Restylane Contour for chin and jawline, and Restylane Defyne for deep lines and folds. Galderma uses NASHA and XpresHAn technologies to create distinct gel textures optimized for each area."
  },
  {
    "q": "How much does Restylane cost at RELUXE?",
    "a": "Restylane pricing at RELUXE varies by the specific product used, as each is formulated for different areas and depths. Pricing is per syringe, and most patients need 1-4 syringes depending on their treatment plan. VIP Members save 10-15% on every syringe. We provide transparent, itemized pricing during your free consultation so there are no surprises. Galderma also runs periodic promotions through their Aspire rewards program for additional savings."
  },
  {
    "q": "Does Restylane hurt?",
    "a": "Most Restylane products contain built-in lidocaine to reduce discomfort during injection. Patients typically rate the sensation 2-4 out of 10 — mild pressure with occasional brief pinching. At RELUXE, we apply topical numbing cream before treatment and use advanced injection techniques to maximize comfort. Lip injections with Kysse tend to be the most sensitive, but the lidocaine makes them very tolerable."
  },
  {
    "q": "How long does Restylane last?",
    "a": "Duration varies by product. Restylane Lyft lasts up to 12-18 months in the cheeks and up to 6 months in the hands. Restylane Kysse lasts approximately 6-12 months in the lips. Restylane Defyne and Contour last up to 12-18 months in the lower face. Results depend on the area treated, the amount of product, and your metabolism. Maintenance appointments at RELUXE help keep your results looking fresh over time."
  },
  {
    "q": "What is the difference between NASHA and XpresHAn technology?",
    "a": "NASHA (Non-Animal Stabilized Hyaluronic Acid) is Galderma's original technology used in classic Restylane and Restylane Lyft. It creates a firmer, more structured gel ideal for lifting and volumizing. XpresHAn (Expression HA) technology is used in newer products like Kysse, Defyne, and Contour. It creates a more flexible gel that moves with your facial expressions for a natural look in dynamic areas. Your RELUXE injector will select the right technology for each area of your face."
  },
  {
    "q": "What areas can Restylane treat?",
    "a": "The Restylane family covers virtually every treatable area of the face and hands. Lyft adds volume to cheeks, corrects age-related midface contour deficiencies, and restores volume to the backs of hands. Kysse enhances lip volume, improves lip texture, and defines the lip border. Contour provides natural-looking definition to the chin and jawline. Defyne smooths deep nasolabial folds and marionette lines. Classic Restylane addresses moderate wrinkles and under-eye hollows."
  },
  {
    "q": "When will I see results from Restylane?",
    "a": "You'll see immediate correction right after injection. Mild swelling is common for 3-7 days (up to 2 weeks for lip treatments with Kysse), so your final, settled results are best assessed around the 2-week mark. XpresHAn products like Kysse and Defyne tend to integrate quickly and look very natural within the first week. Your RELUXE provider may schedule a follow-up at 2-4 weeks to check your results and perform any touch-ups."
  },
  {
    "q": "How is Restylane different from Juvederm?",
    "a": "Restylane and Juvederm are both premium HA filler families but use different manufacturing technologies. Restylane's NASHA technology creates a more structured, particulate gel that provides excellent lift, while its XpresHAn products offer flexible movement in dynamic areas. Juvederm's Vycross technology creates a smoother, more cohesive gel. Both brands deliver excellent results — the best choice often depends on the specific area being treated and your injector's preference. At RELUXE, we carry both so your provider can choose the ideal product for each area."
  },
  {
    "q": "What are the side effects of Restylane?",
    "a": "Common side effects include swelling, bruising, redness, pain, and tenderness at the injection site. These are temporary and typically resolve within 3-7 days. Lip treatments may swell more noticeably for up to 2 weeks. Occasional lumps or firmness usually resolve on their own within 1-2 weeks. Serious complications are rare when performed by experienced, trained injectors. At RELUXE, all filler treatments are performed by expert injectors under Medical Director oversight to ensure safety."
  },
  {
    "q": "Who is a good candidate for Restylane?",
    "a": "Restylane is ideal for adults looking to restore volume lost with aging, smooth lines and wrinkles, enhance lips, define the jawline or chin, or rejuvenate the backs of their hands. Good candidates are in general good health, not pregnant or breastfeeding, and have no allergies to HA or lidocaine. Restylane Lyft is the only HA filler FDA-approved for hand rejuvenation, making it a unique option for aging hands. Schedule a free consultation at RELUXE to determine the best Restylane product for your goals."
  },
  {
    "q": "What should I do after Restylane treatment?",
    "a": "After your Restylane treatment at RELUXE, avoid intense exercise for 24-48 hours, limit alcohol for 24 hours, and avoid applying pressure or massaging the treated area unless your injector instructs you to. Skip extreme heat (saunas, hot tubs, hot yoga) for 48 hours. Apply ice gently for swelling and consider Arnica for bruising. Sleep slightly elevated the first night. Most patients can resume their normal daily routine right away. Your injector will provide specific aftercare instructions."
  },
  {
    "q": "Why choose RELUXE for Restylane in Westfield or Carmel?",
    "a": "RELUXE carries the complete Restylane product line alongside Juvederm, RHA, and Versa, so your injector can select the ideal filler for each area of your face. Our providers are expert-level injectors with training in advanced techniques and treat under Medical Director oversight. We offer free consultations, transparent pricing, and VIP Membership savings of 10-15% on every treatment. With locations in Westfield and Carmel, Indiana, RELUXE makes it easy to get premium injectable treatments close to home."
  }
];

export default s;
