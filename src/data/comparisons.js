// src/data/comparisons.js
// Comparison page data — drives /compare/[slug] pages

const COMPARISONS = {
  'botox-vs-dysport': {
    title: 'Botox vs. Dysport',
    seoTitle: 'Botox vs. Dysport: Which Is Better? | RELUXE Med Spa Indiana',
    seoDescription: 'Botox vs. Dysport — side-by-side comparison of cost, onset, duration, spread, and results. Expert breakdown from RELUXE Med Spa in Carmel & Westfield, Indiana.',
    heroDescription: 'Both smooth wrinkles. Both are FDA-approved. But they\'re not identical. Here\'s an honest, expert-level breakdown of Botox and Dysport so you can choose the right one for your goals.',
    category: 'Neurotoxins (Wrinkle Relaxers)',
    categoryLink: '/services/tox',
    intro: {
      p1: 'Botox and Dysport are both injectable neurotoxins (neuromodulators) that temporarily relax the muscles causing expression lines — forehead wrinkles, frown lines ("11s"), and crow\'s feet. They work the same way: blocking nerve signals so muscles soften and lines smooth out.',
      p2: 'The differences are subtle but real. Onset time, unit measurement, spread pattern, and pricing all vary. Neither is objectively "better" — the right choice depends on your anatomy, goals, and preferences. At RELUXE, we carry both (plus Jeuveau and Daxxify) and match the product to you.',
    },
    comparisonTable: {
      headers: ['', 'Botox', 'Dysport'],
      rows: [
        { label: 'Active Ingredient', values: ['OnabotulinumtoxinA', 'AbobotulinumtoxinA'] },
        { label: 'FDA Approved', values: ['2002', '2009'] },
        { label: 'Onset', values: ['3–7 days', '2–5 days'], highlight: 1 },
        { label: 'Full Results', values: ['~14 days', '~14 days'] },
        { label: 'Duration', values: ['3–4 months', '3–4 months'] },
        { label: 'Spread', values: ['Standard (precise)', 'Slightly broader'] },
        { label: 'Best For', values: ['Targeted areas, precision', 'Larger areas (forehead)'] },
        { label: 'Unit Pricing', values: ['$9–$10/unit', '$3.50–$4.50/unit*'] },
        { label: 'Typical Forehead Cost', values: ['$180–$300', '$160–$270'] },
        { label: 'Feel', values: ['Classic, reliable', 'Soft, natural spread'] },
      ],
    },
    unitNote: '* Dysport uses a different unit measurement — more units are needed per area, so the per-unit price is lower but the total treatment cost is often comparable to Botox.',
    sections: [
      {
        heading: 'When Botox Might Be the Better Choice',
        content: 'Botox is the most studied neuromodulator on the market with over 20 years of FDA approval. Its precise, predictable spread makes it ideal for targeted areas like crow\'s feet, lip flips, and brow lifts where you want controlled placement. If you\'re a first-timer looking for a well-understood, ultra-reliable option, Botox is a great starting point.',
      },
      {
        heading: 'When Dysport Might Be the Better Choice',
        content: 'Dysport tends to kick in faster — many patients notice softening within 2–3 days vs. 5–7 for Botox. It also diffuses slightly more, which can be an advantage for larger treatment zones like the forehead, creating a smooth, even result across a wider area. Some patients describe the finish as "softer" or more natural-feeling.',
      },
      {
        heading: 'Do They Cost the Same?',
        content: 'Not exactly, but close. Dysport is priced per unit at a lower rate ($3.50–$4.50 vs. $9–$10 for Botox), but Dysport units are measured differently — you need roughly 2.5–3x more Dysport units to achieve the same result as Botox. So a 20-unit Botox treatment ($180–$200) is roughly equivalent to a 50–60 unit Dysport treatment ($175–$270). The total cost per visit is usually within $20–$50 of each other. VIP Members get the best per-unit pricing on both.',
      },
      {
        heading: 'Can You Switch Between Them?',
        content: 'Yes — you can switch between Botox and Dysport (or Jeuveau or Daxxify) at any appointment. Some patients prefer one brand for certain areas and a different brand for others. Your provider will help you decide based on how your muscles respond, your timeline, and your goals.',
      },
      {
        heading: 'What About Jeuveau and Daxxify?',
        content: 'RELUXE carries all four FDA-approved neurotoxins. Jeuveau is a newer aesthetic-focused option with fast onset and competitive pricing. Daxxify is the first peptide-powered tox and may last 4–6+ months for some patients — roughly twice as long as traditional options. Your provider can walk you through all four during a free consultation.',
      },
      {
        heading: 'The Bottom Line',
        content: 'The best tox is the one your provider recommends based on your anatomy, muscle strength, and goals. The brand matters less than the injector. At RELUXE, every provider is trained in all four neurotoxins and will match the right product to each treatment area for the most natural result possible.',
      },
    ],
    faqs: [
      { q: 'Is Dysport cheaper than Botox?', a: 'Per unit, yes — but you need more units. Total treatment cost is usually within $20–$50 of each other for the same area. VIP Members get the best per-unit pricing on both brands.' },
      { q: 'Does Dysport wear off faster than Botox?', a: 'Not typically. Both last about 3–4 months for most patients. Individual metabolism, muscle strength, and dosing affect longevity more than the brand itself.' },
      { q: 'Can I try Dysport if I\'ve always used Botox?', a: 'Absolutely. Many patients switch between brands to see which they prefer. You can change at any appointment with no issues.' },
      { q: 'Which has fewer side effects?', a: 'Both have the same safety profile — mild redness, possible bruising, and very rare headache. Neither is "safer" than the other. Both are FDA-approved and well-studied.' },
      { q: 'Does Dysport spread too much?', a: 'When injected by an experienced provider, Dysport\'s slightly broader diffusion is an advantage for areas like the forehead. It\'s not "uncontrolled" — it\'s just a different spread pattern that skilled injectors use strategically.' },
      { q: 'Which is better for crow\'s feet?', a: 'Both work well. Botox\'s tighter spread is often preferred for crow\'s feet since it\'s a smaller, more targeted area. But experienced injectors achieve excellent results with either.' },
    ],
    ctaHeading: 'Not Sure Which Tox Is Right for You?',
    ctaBody: 'Book a free consultation at RELUXE Med Spa in Carmel or Westfield. Your provider will assess your anatomy, discuss your goals, and recommend the best option — no pressure, no upselling.',
    relatedServices: ['tox', 'botox', 'dysport'],
  },

  'juvederm-vs-restylane': {
    title: 'Juvéderm vs. Restylane',
    seoTitle: 'Juvéderm vs. Restylane: Which Filler Is Better? | RELUXE Med Spa Indiana',
    seoDescription: 'Juvéderm vs. Restylane — compare filler brands, product lines, pricing, and results. Expert guide from RELUXE Med Spa in Carmel & Westfield, Indiana.',
    heroDescription: 'Two of the most trusted filler families in the world. Same active ingredient (hyaluronic acid), different technologies. Here\'s how to know which one is right for your face.',
    category: 'Dermal Fillers',
    categoryLink: '/services/filler',
    intro: {
      p1: 'Juvéderm (by Allergan) and Restylane (by Galderma) are both hyaluronic acid (HA) filler families. Hyaluronic acid is a substance your body naturally produces — it holds moisture, adds volume, and supports skin structure. Injectable HA fillers restore what time takes away: fullness in the cheeks, definition in the jawline, and volume in the lips.',
      p2: 'Both brands are FDA-approved, safe, reversible (dissolvable with hyaluronidase), and have decades of clinical data. The difference is in the technology — how the gel is manufactured, how it feels under the skin, and which specific products are designed for which areas. At RELUXE, we carry both full lines (plus RHA and Versa) and choose based on your anatomy and goals.',
    },
    comparisonTable: {
      headers: ['', 'Juvéderm', 'Restylane'],
      rows: [
        { label: 'Manufacturer', values: ['Allergan (AbbVie)', 'Galderma'] },
        { label: 'Technology', values: ['Vycross (smooth, cohesive gel)', 'NASHA + XpresHAn (structured + flexible)'] },
        { label: 'Product Line', values: ['Voluma, Vollure, Volbella, Volux', 'Lyft, Contour, Defyne, Kysse'] },
        { label: 'Best for Cheeks', values: ['Voluma (up to 2 years)', 'Lyft or Contour (12–18 months)'] },
        { label: 'Best for Lips', values: ['Volbella (subtle, ~12 months)', 'Kysse (soft, 6–12 months)'] },
        { label: 'Best for Jawline', values: ['Volux (firmest HA filler)', 'Defyne (flexible definition)'] },
        { label: 'Best for Smile Lines', values: ['Vollure (up to 18 months)', 'Defyne (12–18 months)'] },
        { label: 'Price Range', values: ['$750–$800/syringe', '$750/syringe'] },
        { label: 'Swelling', values: ['Moderate (settles 5–7 days)', 'Moderate (settles 5–7 days)'] },
        { label: 'Longevity', values: ['12–24 months', '6–18 months'] },
        { label: 'Reversible', values: ['Yes (hyaluronidase)', 'Yes (hyaluronidase)'] },
      ],
    },
    unitNote: null,
    sections: [
      {
        heading: 'How the Technologies Differ',
        content: 'Juvéderm uses Vycross crosslinking technology, which creates a smooth, cohesive gel with a higher concentration of crosslinked HA. This tends to give it excellent longevity — Voluma can last up to 2 years in the cheeks. Restylane uses two technologies: NASHA (a firmer, particulate gel ideal for structural support) and XpresHAn (a flexible gel that moves naturally with facial expressions). XpresHAn products like Kysse and Defyne are designed specifically for dynamic areas where movement matters.',
      },
      {
        heading: 'When Juvéderm Might Be Better',
        content: 'Juvéderm excels in longevity and structure. Voluma is the go-to for cheek augmentation and midface lift — it lasts up to 2 years, the longest of any HA filler on the market. Volux is the firmest HA filler available, purpose-built for jawline definition and chin sculpting. If you want maximum duration and structural support, Juvéderm products are often the choice.',
      },
      {
        heading: 'When Restylane Might Be Better',
        content: 'Restylane\'s XpresHAn technology is unique — it\'s engineered to move with your facial expressions rather than sitting rigidly under the skin. Kysse is a patient favorite for lips because it feels soft and natural when you smile or talk. Restylane Lyft is the only HA filler FDA-approved for hand rejuvenation. If you prioritize natural movement and flexibility, Restylane products are excellent options.',
      },
      {
        heading: 'What About RHA and Versa?',
        content: 'RELUXE also carries RHA (by Revance) — the only filler FDA-approved specifically for dynamic facial wrinkles — and Revanesse Versa, a value-priced option with less post-injection swelling. RHA starts at $650/syringe and Versa at $650/syringe, making them accessible alternatives. Your provider will help you weigh all options during a free consultation.',
      },
      {
        heading: 'Price Comparison',
        content: 'At RELUXE, Juvéderm products range from $750–$800 per syringe and Restylane products are $750 per syringe. VIP Members save on every syringe. We also offer $100 off when you purchase 2+ syringes in the same visit. Both Allergan (Allē) and Galderma (Aspire) have loyalty rewards programs that can add further savings.',
      },
      {
        heading: 'The Bottom Line',
        content: 'There is no single "best" filler brand. The best results come from choosing the right product for the right area — and that\'s a clinical decision your provider makes based on your facial anatomy, skin quality, and goals. Many patients end up with products from both families in a single treatment session (e.g., Voluma in the cheeks + Kysse in the lips). The injector matters far more than the brand.',
      },
    ],
    faqs: [
      { q: 'Can I mix Juvéderm and Restylane in the same appointment?', a: 'Yes — it\'s very common. Your provider may use one brand for cheeks and another for lips or jawline, choosing each product for its specific strengths in that area.' },
      { q: 'Which lasts longer?', a: 'Generally, Juvéderm Voluma has the longest duration (up to 2 years in cheeks). Restylane products typically last 6–18 months depending on the specific product and area treated.' },
      { q: 'Which hurts less?', a: 'Both contain built-in lidocaine (numbing agent) and feel very similar during injection. Lip filler tends to be the most sensitive area regardless of brand. RELUXE also applies topical numbing before treatment.' },
      { q: 'Are both reversible?', a: 'Yes. All hyaluronic acid fillers — Juvéderm, Restylane, RHA, and Versa — can be dissolved with hyaluronidase if needed. This is one of the biggest safety advantages of HA fillers.' },
      { q: 'How many syringes will I need?', a: 'Lips typically require 1 syringe. Cheeks usually need 1–2 per side. Full facial balancing may use 3–5 syringes across multiple areas. Your provider will give you an exact quote during your free consultation.' },
      { q: 'I\'ve never had filler — which should I start with?', a: 'First-timers often start with lips or smile lines. Your provider will recommend the best product for your specific area and goals. There\'s no need to choose a brand before your appointment — your injector will guide you.' },
    ],
    ctaHeading: 'Ready to Find Your Perfect Filler?',
    ctaBody: 'Book a free consultation at RELUXE Med Spa in Carmel or Westfield. Your provider will assess your facial anatomy and recommend the ideal filler products — no pressure.',
    relatedServices: ['filler', 'juvederm', 'restylane'],
  },

  'morpheus8-vs-co2': {
    title: 'Morpheus8 vs. CO2 Laser',
    seoTitle: 'Morpheus8 vs. CO2 Laser: Which Is Better? | RELUXE Med Spa Indiana',
    seoDescription: 'Morpheus8 vs. CO2 laser resurfacing — compare downtime, results, cost, and skin tone safety. Expert guide from RELUXE Med Spa in Carmel & Westfield, Indiana.',
    heroDescription: 'Both transform skin. Both stimulate collagen. But one has 3 days of downtime and the other has 10+. Here\'s how to decide between Morpheus8 and CO2 laser resurfacing.',
    category: 'Skin Resurfacing & Tightening',
    categoryLink: '/services',
    intro: {
      p1: 'Morpheus8 and CO2 laser resurfacing are two of the most powerful skin rejuvenation treatments available — but they work very differently. Morpheus8 is a radiofrequency (RF) microneedling device that delivers heat energy through insulated needles beneath the skin surface. CO2 laser resurfacing is a fractional ablative laser that vaporizes damaged surface tissue layer by layer.',
      p2: 'Both stimulate dramatic collagen remodeling. Both improve wrinkles, scars, texture, and laxity. The key difference is intensity, downtime, and who they\'re safe for. Morpheus8 is gentler with 1–3 days of downtime and is safe for all skin tones. CO2 is the most aggressive single treatment at RELUXE with 7–10+ days of downtime but delivers the most dramatic results in one session.',
    },
    comparisonTable: {
      headers: ['', 'Morpheus8', 'CO2 Laser'],
      rows: [
        { label: 'Technology', values: ['RF microneedling (insulated needles + heat)', 'Fractional ablative laser (vaporizes surface tissue)'] },
        { label: 'Downtime', values: ['1–3 days (redness, mild swelling)', '7–10+ days (raw, weeping, then peeling)'], highlight: 0 },
        { label: 'Sessions Needed', values: ['3 sessions (4–6 weeks apart)', '1 session (usually sufficient)'], highlight: 1 },
        { label: 'Results Timeline', values: ['Build over 3–6 months', 'Visible at 2 weeks, full at 3–6 months'] },
        { label: 'Results Duration', values: ['1–3 years with maintenance', '2–5+ years'] },
        { label: 'Best For', values: ['Laxity, acne scars, pores, tightening', 'Deep wrinkles, severe sun damage, deep scars'] },
        { label: 'Safe for Dark Skin', values: ['Yes (all Fitzpatrick types)', 'Best for Fitzpatrick I–III'], highlight: 0 },
        { label: 'Treats Body Areas', values: ['Yes (neck, abdomen, thighs, arms)', 'Primarily face'] },
        { label: 'Pain Level', values: ['4–5/10 (numbing applied)', '4–6/10 (numbing + possible local anesthesia)'] },
        { label: 'Starting Price', values: ['$900/session', 'Consultation-based pricing'] },
        { label: 'Intensity', values: ['Moderate (adjustable depths)', 'Aggressive (gold standard)'] },
      ],
    },
    unitNote: null,
    sections: [
      {
        heading: 'When Morpheus8 Is the Better Choice',
        content: 'Morpheus8 is ideal for patients who want significant improvement with minimal downtime. It\'s the go-to for skin laxity (jowls, neck, under-chin), acne scarring, enlarged pores, and overall texture refinement. Because it delivers energy beneath the skin surface through insulated needles, there\'s a much lower risk of hyperpigmentation — making it safe for all skin tones, including darker complexions where laser treatments carry higher risk. Most patients need 3 sessions spaced 4–6 weeks apart, with results building over 3–6 months as collagen remodels.',
      },
      {
        heading: 'When CO2 Laser Is the Better Choice',
        content: 'CO2 laser resurfacing delivers the most dramatic results of any single treatment at RELUXE. It\'s the gold standard for deep wrinkles, severe sun damage, deep acne scars, and significant texture/tone concerns. Most patients achieve transformative results in just one session — the kind of improvement that "takes years off." The trade-off is 7–10+ days of social downtime (raw/weeping skin, then peeling) and it\'s best suited for lighter skin tones (Fitzpatrick I–III) due to higher pigmentation risk.',
      },
      {
        heading: 'What About Downtime?',
        content: 'This is the biggest practical difference. Morpheus8: 1–3 days of redness and mild swelling — most patients are comfortable in public by day 3 with makeup. CO2: 7–10+ days minimum social downtime. The first 3–5 days involve raw/weeping skin requiring diligent wound care. Most patients take 5–7 days off work. Residual redness can last 2–4 weeks (concealable with makeup after day 10). If you can\'t take a week off, Morpheus8 is the practical choice.',
      },
      {
        heading: 'Can You Combine Them?',
        content: 'Yes — some patients do both at different times. Morpheus8 for tightening and pore refinement, CO2 for surface-level resurfacing and deep wrinkle improvement. They address slightly different layers of the skin. Your provider can create a multi-treatment plan that uses both strategically. Opus Plasma (our fractional plasma resurfacing device) is also a middle-ground option with 3–7 days of adjustable downtime.',
      },
      {
        heading: 'Price Comparison',
        content: 'Morpheus8 starts at $900 per session, with packages of 3 sessions available. CO2 pricing is consultation-based since it varies by treatment area and extent of resurfacing. While Morpheus8 requires multiple sessions, CO2 is typically a single treatment — so the total investment can be comparable. VIP Members save 10–15% on both treatments.',
      },
      {
        heading: 'The Bottom Line',
        content: 'If you want maximum results and can commit to 7–10+ days of downtime, CO2 laser is the most powerful option. If you want significant improvement with 1–3 days of downtime (or have darker skin), Morpheus8 is the better fit. During a free consultation at RELUXE, your provider will assess your skin, discuss your goals and available downtime, and recommend the best approach.',
      },
    ],
    faqs: [
      { q: 'Which gives better results — Morpheus8 or CO2?', a: 'CO2 delivers more dramatic results in a single session, especially for surface-level concerns like deep wrinkles and sun damage. Morpheus8 excels at tightening, laxity, and pore refinement. Many patients benefit from both.' },
      { q: 'Can I do Morpheus8 on my body?', a: 'Yes — Morpheus8 treats the face, neck, under-chin, abdomen, thighs, and arms. It\'s excellent for stretch marks and body skin tightening. CO2 is primarily used on the face.' },
      { q: 'I have darker skin — which is safer?', a: 'Morpheus8 is safe for all skin tones because the RF energy is delivered beneath the surface through insulated needles. CO2 carries a higher risk of hyperpigmentation for Fitzpatrick IV–VI skin types.' },
      { q: 'How long do results last?', a: 'Morpheus8 results last 1–3 years with recommended maintenance (1 session every 6–12 months after your initial series). CO2 results can last 2–5+ years depending on sun protection and skincare habits.' },
      { q: 'Is there a middle-ground option?', a: 'Yes — Opus Plasma is our fractional plasma resurfacing device with adjustable intensity: 1–3 days of downtime at lighter settings, or 5–7 days at higher settings. It\'s a great compromise between Morpheus8 and CO2.' },
      { q: 'Can I combine either with Botox or fillers?', a: 'Yes, but wait 2–4 weeks between treatments. Many patients do tox + filler for structure and Morpheus8 or CO2 for skin quality. Your provider will create a treatment timeline.' },
    ],
    ctaHeading: 'Which Resurfacing Treatment Is Right for You?',
    ctaBody: 'Book a free consultation at RELUXE Med Spa in Carmel or Westfield. Your provider will assess your skin, discuss your goals and available downtime, and recommend the best treatment plan.',
    relatedServices: ['morpheus8', 'co2', 'opus'],
  },
}

export function getComparison(slug) {
  return COMPARISONS[slug] || null
}

export function getAllComparisonSlugs() {
  return Object.keys(COMPARISONS)
}

export function getAllComparisons() {
  return Object.entries(COMPARISONS).map(([slug, data]) => ({
    slug,
    ...data,
  }))
}

export default COMPARISONS
