// src/data/cost-guides.js
// Cost guide page data — drives /cost/[slug] pages

const COST_GUIDES = {
  botox: {
    title: 'How Much Does Botox Cost?',
    seoTitle: 'Botox Cost in Indiana (2026 Pricing Guide) | RELUXE Med Spa',
    seoDescription: 'How much does Botox cost in Indiana? RELUXE Med Spa pricing: $9–$14/unit, $180–$400+ per visit. See exact pricing by area, member savings, and what affects your cost.',
    heroDescription: 'Transparent Botox pricing from RELUXE Med Spa in Carmel & Westfield, Indiana. No hidden fees, no surprises — just honest numbers so you can plan with confidence.',
    serviceLink: '/services/botox',
    serviceName: 'Botox',
    intro: {
      p1: 'Botox is priced per unit, and the number of units you need depends on the treatment area, your muscle strength, and your goals. At RELUXE Med Spa, our Botox pricing starts at $9/unit for new patients ($10/unit returning) with a 20-unit foundation treatment at $280.',
      p2: 'Unlike many med spas that quote vague price ranges, we give you exact pricing before any treatment. Your provider maps your facial expressions during your free consultation and tells you the exact number of units and total cost — no guessing, no upselling.',
    },
    pricingTable: {
      title: 'Botox Pricing at RELUXE',
      headers: ['', 'Standard', 'VIP Member'],
      rows: [
        { label: 'Foundation Treatment (20 units)', values: ['$280 ($14/unit)', '$200 ($10/unit)'] },
        { label: 'Additional Units (new patients)', values: ['$9/unit', '$9/unit'] },
        { label: 'Additional Units (returning)', values: ['$10/unit', '$10/unit'] },
      ],
    },
    areaBreakdown: {
      title: 'Typical Botox Cost by Area',
      note: 'Ranges reflect individual variation in muscle strength and anatomy. Your provider gives you an exact quote during your free consultation.',
      areas: [
        { area: 'Forehead Lines', units: '10–30 units', cost: '$90–$300' },
        { area: 'Frown Lines ("11s")', units: '15–30 units', cost: '$135–$300' },
        { area: 'Crow\'s Feet', units: '12–24 units (both sides)', cost: '$108–$240' },
        { area: 'Bunny Lines', units: '5–10 units', cost: '$45–$100' },
        { area: 'Lip Flip', units: '4–8 units', cost: '$36–$80' },
        { area: 'Chin (dimpling)', units: '4–8 units', cost: '$36–$80' },
        { area: 'Masseter (jaw slimming)', units: '20–40 units per side', cost: '$180–$400' },
        { area: 'Full Face (forehead + 11s + crow\'s feet)', units: '40–60+ units', cost: '$360–$600+' },
      ],
    },
    sections: [
      {
        heading: 'What Affects Your Botox Cost?',
        content: 'Three main factors determine your total: (1) Treatment area — forehead and crow\'s feet need fewer units than masseter slimming. (2) Muscle strength — stronger muscles need more units for the same result. (3) Your goals — some patients prefer a softer, more subtle effect (fewer units) while others want complete smoothing. Your provider assesses all three during your free consultation.',
      },
      {
        heading: 'How RELUXE Compares to Other Indiana Med Spas',
        content: 'The average Botox price in Indiana ranges from $10–$16 per unit at reputable med spas. Discount Botox ($8 or less per unit) often signals inexperienced injectors, diluted product, or hidden consultation fees. At RELUXE, our per-unit pricing is competitive and includes a thorough consultation, expert injection technique from Medical Director-supervised providers, and a complimentary two-week follow-up.',
      },
      {
        heading: 'How to Save on Botox at RELUXE',
        content: 'VIP Membership is the best way to save — members get preferred per-unit pricing on all neurotoxins (Botox, Dysport, Jeuveau, Daxxify) plus 10–15% off other treatments. Allē Rewards (Allergan\'s loyalty program) earns points on every Botox treatment that you can redeem for discounts on future visits. We also offer Cherry financing with plans starting at 0% APR.',
      },
      {
        heading: 'Botox vs. Other Tox Brands: Cost Comparison',
        content: 'RELUXE carries four neurotoxin brands. Jeuveau is our most affordable option (starting at $200 for 20 units, after Evolus Rewards). Dysport uses more units at a lower per-unit cost — total treatment cost is usually within $20–$50 of Botox. Daxxify costs more per session but may last 4–6+ months (vs. 3–4 months for Botox), potentially reducing your annual cost. Your provider can help you compare options during your free consultation.',
      },
      {
        heading: 'Is Botox Worth the Investment?',
        content: 'Botox is the most popular cosmetic treatment in the world for a reason: it works, it\'s safe, and it requires no downtime. A typical Botox patient visits 3–4 times per year at $300–$500 per visit, totaling roughly $1,200–$2,000 annually. For many, that\'s less than a daily coffee habit — and the confidence boost is significant. Plus, consistent Botox use can actually prevent deeper wrinkles from forming, reducing future treatment needs.',
      },
    ],
    faqs: [
      { q: 'How much does Botox cost per unit at RELUXE?', a: 'Botox starts at $9/unit for new patients and $10/unit for returning patients. The foundation treatment includes 20 units at $280. VIP Members get the best per-unit pricing.' },
      { q: 'How many units of Botox will I need?', a: 'It depends on the area and your muscle strength. Forehead typically needs 10–30 units, frown lines 15–30 units, and crow\'s feet 12–24 units. Full face treatments average 40–60+ units. Your provider gives you an exact number during your free consultation.' },
      { q: 'Is there a consultation fee?', a: 'No — all consultations at RELUXE are free and no-pressure. Your provider assesses your anatomy, discusses your goals, and gives you exact pricing before any treatment.' },
      { q: 'Do you offer financing for Botox?', a: 'Yes — Cherry financing with plans starting at 0% APR. Apply in seconds with no hard credit check.' },
      { q: 'How can I save on Botox?', a: 'Three ways: (1) VIP Membership for preferred per-unit pricing. (2) Allē Rewards for Allergan loyalty points. (3) Consider Jeuveau or Dysport — they deliver similar results at different price points.' },
      { q: 'Why is Botox cheaper at some places?', a: 'Extremely low pricing ($8 or less per unit) can indicate diluted product, inexperienced injectors, or hidden fees for the consultation. At RELUXE, pricing is transparent and every provider is Medical Director-supervised.' },
    ],
    ctaHeading: 'Get Your Exact Botox Price',
    ctaBody: 'Book a free consultation at RELUXE Med Spa in Carmel or Westfield. Your provider will map your facial expressions and give you a precise quote — no surprises.',
  },

  filler: {
    title: 'How Much Do Fillers Cost?',
    seoTitle: 'Dermal Filler Cost in Indiana (2026 Pricing Guide) | RELUXE Med Spa',
    seoDescription: 'How much do fillers cost in Indiana? RELUXE Med Spa pricing: $650–$800/syringe for lips, cheeks, jawline. See exact pricing by brand, area, and member savings.',
    heroDescription: 'Transparent filler pricing from RELUXE Med Spa in Carmel & Westfield, Indiana. Every brand, every area — with exact numbers so you know what to expect.',
    serviceLink: '/services/filler',
    serviceName: 'Dermal Fillers',
    intro: {
      p1: 'Dermal fillers are priced per syringe, and the number of syringes you need depends on the treatment area and your goals. At RELUXE Med Spa, filler prices range from $650–$800 per syringe depending on the brand and product. We carry Juvéderm, Restylane, RHA, and Revanesse Versa.',
      p2: 'During your free consultation, your provider assesses your facial anatomy and recommends the right product and number of syringes — with exact pricing before any treatment. We also offer $100 off when you purchase 2+ syringes in the same visit.',
    },
    pricingTable: {
      title: 'Filler Pricing at RELUXE (Per Syringe)',
      headers: ['Product', 'Standard', 'VIP Member'],
      rows: [
        { label: 'Revanesse Versa', values: ['$650', '$600'] },
        { label: 'RHA 1 / RHA 2 / RHA 3 / RHA 4', values: ['$650', '$600'] },
        { label: 'Juvéderm Vollure XC', values: ['$750', '$700'] },
        { label: 'Juvéderm Volbella XC', values: ['$750', '$700'] },
        { label: 'Juvéderm Volbella (½ syringe)', values: ['$500', '$450'] },
        { label: 'Juvéderm Voluma XC', values: ['$800', '$750'] },
        { label: 'Juvéderm Volux XC', values: ['$800', '$750'] },
        { label: 'Restylane Kysse', values: ['$750', '$700'] },
        { label: 'Restylane Contour', values: ['$750', '$700'] },
        { label: 'Restylane Defyne', values: ['$750', '$700'] },
        { label: 'Restylane Lyft', values: ['$750', '$700'] },
      ],
    },
    areaBreakdown: {
      title: 'Typical Filler Cost by Area',
      note: 'Ranges reflect individual variation. Your provider gives you an exact quote with the recommended product and number of syringes during your free consultation.',
      areas: [
        { area: 'Lips (subtle enhancement)', units: '1 syringe', cost: '$650–$750' },
        { area: 'Lips (full enhancement)', units: '1–2 syringes', cost: '$650–$1,500' },
        { area: 'Cheeks / Midface Lift', units: '1–2 syringes per side', cost: '$650–$1,600' },
        { area: 'Smile Lines (nasolabial folds)', units: '1–2 syringes', cost: '$650–$1,500' },
        { area: 'Jawline Definition', units: '1–2 syringes per side', cost: '$650–$1,600' },
        { area: 'Chin Sculpting', units: '1–2 syringes', cost: '$650–$1,600' },
        { area: 'Under-Eye Hollows', units: '1 syringe', cost: '$650–$750' },
        { area: 'Full Facial Balancing', units: '3–5 syringes', cost: '$1,950–$4,000' },
      ],
    },
    sections: [
      {
        heading: 'What Determines Your Filler Cost?',
        content: 'Three factors drive your total: (1) The product — Versa and RHA start at $650/syringe while Juvéderm Voluma and Volux are $800/syringe. Your provider chooses the product based on the treatment area, not price. (2) Number of syringes — lips typically need 1, cheeks 1–2 per side, and full facial balancing 3–5 total. (3) Your anatomy and goals — a subtle enhancement costs less than a full transformation. Start conservative and add more later if desired.',
      },
      {
        heading: 'Which Brand Is the Best Value?',
        content: 'Revanesse Versa and RHA are the most affordable at $650/syringe ($600 for members). Versa is known for less post-injection swelling, and RHA is the only filler FDA-approved for dynamic facial wrinkles. Juvéderm products cost $750–$800 but may last longer — Voluma can last up to 2 years in the cheeks. "Best value" depends on whether you prioritize upfront cost or cost-per-month of results. Your provider will help you weigh the options.',
      },
      {
        heading: 'How to Save on Fillers at RELUXE',
        content: 'VIP Members save $50–$100 per syringe on every product. We offer $100 off when purchasing 2+ syringes in the same visit. Both Allergan (Allē) and Galderma (Aspire) have loyalty rewards programs that earn points toward future treatments. Cherry financing is available with plans starting at 0% APR.',
      },
      {
        heading: 'How RELUXE Compares to Other Indiana Med Spas',
        content: 'Average filler pricing in Indiana ranges from $600–$900 per syringe at reputable med spas. Prices below $500/syringe may indicate off-brand products, inexperienced injectors, or undisclosed consultation fees. At RELUXE, pricing is all-inclusive (consultation, product, injection, and follow-up). Every provider is Medical Director-supervised and uses FDA-approved products from Allergan, Galderma, Revance, and Prollenium.',
      },
      {
        heading: 'How Long Do Fillers Last? (Cost Per Month)',
        content: 'Lips: 6–12 months ($55–$125/month). Cheeks with Voluma: up to 24 months ($33–$67/month). Smile lines: 12–18 months ($36–$63/month). Jawline: 12–18 months ($36–$67/month). The longer a filler lasts, the lower the cost per month — products like Voluma and Restylane Lyft have higher upfront costs but stretch further over time.',
      },
    ],
    faqs: [
      { q: 'How much does lip filler cost at RELUXE?', a: 'Lip filler starts at $650/syringe with Versa or RHA. Juvéderm Volbella is $750/syringe ($500 for a half syringe for subtle touch-ups). Restylane Kysse is $750/syringe. Most lip treatments use 1 syringe. VIP Members save on every syringe.' },
      { q: 'How many syringes of filler will I need?', a: 'Lips: usually 1. Cheeks: 1–2 per side. Jawline: 1–2 per side. Full facial balancing: 3–5 total across multiple areas. Your provider gives an exact recommendation at your free consultation — we start conservative and can always add more.' },
      { q: 'Is there a consultation fee?', a: 'No — all consultations at RELUXE are free and no-pressure. Your provider assesses your facial anatomy, discusses products, and gives exact pricing before any treatment.' },
      { q: 'Can fillers be dissolved if I don\'t like them?', a: 'Yes. All HA fillers (Juvéderm, Restylane, RHA, Versa) can be dissolved with hyaluronidase. This is one of the biggest safety advantages of hyaluronic acid fillers.' },
      { q: 'Do you offer financing?', a: 'Yes — Cherry financing with plans starting at 0% APR. Apply in seconds with no hard credit check. Our team will help you find a payment option that works for your budget.' },
      { q: 'Why are some fillers more expensive than others?', a: 'Higher-priced fillers like Voluma ($800) are formulated for specific purposes (deep cheek volume that lasts up to 2 years) using advanced crosslinking technology. Value options like Versa ($650) use different technology and may have shorter duration. Price reflects formulation and longevity — your provider matches the product to the area, not the budget.' },
    ],
    ctaHeading: 'Get Your Exact Filler Price',
    ctaBody: 'Book a free consultation at RELUXE Med Spa in Carmel or Westfield. Your provider will assess your facial anatomy and give you a precise quote with the right products for your goals.',
  },
}

export function getCostGuide(slug) {
  return COST_GUIDES[slug] || null
}

export function getAllCostGuideSlugs() {
  return Object.keys(COST_GUIDES)
}

export default COST_GUIDES
