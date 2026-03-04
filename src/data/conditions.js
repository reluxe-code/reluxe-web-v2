// src/data/conditions.js
// All conditions data — drives /conditions/[slug] pages

const CONDITIONS = {
  'wrinkles-fine-lines': {
    title: 'Wrinkles & Fine Lines',
    seoTitle: 'Wrinkles & Fine Lines Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa offers Botox, Jeuveau, Dysport, Daxxify, fillers, SkinPen, Morpheus8, and laser treatments for wrinkles & fine lines in Carmel & Westfield.',
    heroDescription: 'Whether it\'s forehead lines, crow\'s feet, or frown lines, RELUXE Med Spa helps smooth and soften wrinkles with injectables, lasers, and advanced skin treatments. Natural results. No frozen looks.',
    heroImage: '/images/conditions/wrinkles-hero.jpg',
    aboutHeading: 'Why Wrinkles & Fine Lines Appear',
    aboutP1: 'Wrinkles are a natural part of aging, caused by repeated facial expressions, sun exposure, loss of collagen, and decreased skin elasticity. Fine lines often show up in the 20s and 30s, while deeper wrinkles become more common with age.',
    aboutP2: 'The good news: modern aesthetic treatments can smooth, soften, and even prevent wrinkles, keeping your look fresh, natural, and confident.',
    treatments: [
      { title: 'Neurotoxins', copy: 'Botox\u00ae, Jeuveau\u00ae, Dysport\u00ae, and Daxxify\u00ae relax muscles to soften lines while keeping expressions natural.', href: '/services/tox' },
      { title: 'Dermal Fillers', copy: 'Juv\u00e9derm\u00ae, Restylane\u00ae, RHA\u00ae, and Versa\u00ae restore lost volume and smooth deeper wrinkles or folds.', href: '/services/filler' },
      { title: 'Microneedling (SkinPen\u00ae)', copy: 'Boosts collagen production, improving skin texture and reducing fine lines over time.', href: '/services/skinpen' },
      { title: 'Morpheus8', copy: 'Radiofrequency microneedling that tightens skin, smooths wrinkles, and stimulates collagen.', href: '/services/morpheus8' },
      { title: 'Opus Plasma & ClearLift', copy: 'Fractional skin resurfacing for wrinkles, tone, and texture with minimal downtime.', href: '/services/opus' },
      { title: 'HydraFacial\u00ae & Glo2Facial\u2122', copy: 'Hydration + exfoliation facials to keep skin smooth, plump, and glowing.', href: '/services/facials' },
    ],
    faqs: [
      { q: 'How long do wrinkle treatments last?', a: 'Neurotoxins last 3\u20134 months, while fillers can last 6\u201318 months. Skin treatments like SkinPen and Morpheus8 build long-term collagen over time.' },
      { q: 'Will I look frozen after Botox or Jeuveau?', a: 'No\u2014our approach is natural and conservative. You\'ll look refreshed, not overdone.' },
      { q: 'What\'s the best option for prevention?', a: 'Early use of neurotoxins combined with skincare (SPF + retinol) helps slow wrinkle formation.' },
      { q: 'Is there downtime?', a: 'Most injectable treatments have minimal downtime. Advanced lasers or microneedling may involve a few days of redness.' },
    ],
    ctaHeading: 'Smooth. Natural. Confident.',
    ctaBody: 'Discover wrinkle treatments at RELUXE Med Spa in Carmel & Westfield. From Botox and fillers to advanced lasers\u2014we\'ll create a personalized plan for you.',
  },

  'acne-scars': {
    title: 'Acne & Acne Scars',
    seoTitle: 'Acne & Acne Scar Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers advanced acne and acne scar treatments including SkinPen microneedling, facials, chemical peels, IPL, and laser resurfacing.',
    heroDescription: 'Breakouts and scars can be frustrating, but they\'re also treatable. At RELUXE Med Spa, we combine facials, medical-grade skincare, and advanced devices like SkinPen\u00ae and lasers to clear, smooth, and restore your skin.',
    heroImage: '/images/conditions/acne-hero.jpg',
    aboutHeading: 'Understanding Acne & Scarring',
    aboutP1: 'Acne can be caused by clogged pores, bacteria, hormones, and inflammation. When breakouts damage skin, scars can form, leaving uneven texture and pigmentation.',
    aboutP2: 'The right treatment plan can reduce active acne, fade discoloration, and smooth scars, giving you clearer, healthier-looking skin.',
    treatments: [
      { title: 'SkinPen\u00ae Microneedling', copy: 'Creates micro-injuries that stimulate collagen, smoothing acne scars and improving overall texture.', href: '/services/skinpen' },
      { title: 'Chemical Peels', copy: 'Targets acne, reduces discoloration, and helps skin regenerate for a clearer, brighter look.', href: '/services/peels' },
      { title: 'IPL (Intense Pulsed Light)', copy: 'Fades post-acne redness and hyperpigmentation, evening out skin tone.', href: '/services/ipl' },
      { title: 'Opus Plasma & ClearLift', copy: 'Fractional laser resurfacing for deeper acne scars and skin texture concerns.', href: '/services/opus' },
      { title: 'Customized Facials', copy: 'HydraFacial\u00ae, Glo2Facial\u2122, and acne facials designed to clear pores and prevent breakouts.', href: '/services/facials' },
      { title: 'Medical-Grade Skincare', copy: 'Products from Skinbetter, SkinCeuticals, and Hydrinity help maintain results and control acne long-term.', href: '/skincare' },
    ],
    faqs: [
      { q: 'What\'s the best treatment for acne scars?', a: 'It depends on scar type. SkinPen microneedling and fractional lasers like Opus or ClearLift are highly effective for texture improvement.' },
      { q: 'Do facials really help with acne?', a: 'Yes. HydraFacial and Glo2Facial clear pores and reduce congestion, and pair well with medical treatments for best results.' },
      { q: 'How many sessions will I need?', a: 'Most patients see visible improvement in 3\u20136 treatments as collagen builds and discoloration fades.' },
      { q: 'Is there downtime?', a: 'Microneedling or laser can cause short-term redness. Most facials and light peels have minimal downtime.' },
    ],
    ctaHeading: 'Clear, Smooth, Confident Skin',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield specializes in acne and acne scar treatments with real results. Book your consult today and start your journey to healthier skin.',
  },

  'volume-loss': {
    title: 'Volume Loss & Facial Balancing',
    seoTitle: 'Volume Loss & Facial Balancing | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers dermal fillers, Sculptra, and facial balancing for cheeks, lips, jawline, and temples. Restore youthful volume with natural results.',
    heroDescription: 'Cheeks feel flat? Jawline less defined? Lips thinner? These are signs of natural facial volume loss. At RELUXE Med Spa, we use fillers, Sculptra\u00ae, and balancing techniques to restore harmony and youthfulness\u2014without looking "done."',
    heroImage: '/images/conditions/volume-loss-hero.jpg',
    aboutHeading: 'Why Facial Volume Loss Happens',
    aboutP1: 'As we age, we lose fat, bone, and collagen in the face. This leads to hollow cheeks, thinning lips, deeper folds, and less defined jawlines. Weight loss and genetics can accelerate these changes, making the face appear tired or aged.',
    aboutP2: 'Facial balancing restores harmony by strategically placing volume where it\'s been lost\u2014lifting, contouring, and refreshing your look while keeping it natural.',
    treatments: [
      { title: 'Dermal Fillers', copy: 'Juv\u00e9derm\u00ae, Restylane\u00ae, RHA\u00ae, and Versa\u00ae restore fullness in cheeks, lips, jawline, and temples.', href: '/services/filler' },
      { title: 'Sculptra\u00ae', copy: 'A collagen stimulator that gradually restores volume and skin thickness for natural, lasting results.', href: '/services/sculptra' },
      { title: 'Lip Filler', copy: 'Enhance lip shape and volume while maintaining balance with surrounding features.', href: '/services/filler' },
      { title: 'Jawline Contouring', copy: 'Filler can sharpen, lift, and define the jawline and chin for improved facial proportions.', href: '/services/facial-balancing' },
      { title: 'Facial Balancing Consult', copy: 'Comprehensive assessment and plan blending injectables for natural, proportional results.', href: '/services/facial-balancing' },
      { title: 'Morpheus8 & EvolveX', copy: 'Complement injectables by tightening skin and enhancing contour.', href: '/services/morpheus8' },
    ],
    faqs: [
      { q: 'How do I know if I need facial balancing?', a: 'If you\'ve noticed hollow cheeks, a tired appearance, thinning lips, or less jawline definition, you may benefit from a balancing plan.' },
      { q: 'Will I look overfilled?', a: 'No\u2014RELUXE providers specialize in natural, proportional results. We enhance, not exaggerate.' },
      { q: 'How long do results last?', a: 'Fillers typically last 6\u201318 months depending on the product and area. Sculptra stimulates collagen for up to 2+ years.' },
      { q: 'Can I combine treatments?', a: 'Yes. Facial balancing often blends filler with skin tightening devices like Morpheus8 for comprehensive rejuvenation.' },
    ],
    ctaHeading: 'Balanced. Youthful. Natural.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield specializes in facial balancing with fillers, Sculptra, and advanced devices. Let us create a custom plan to restore harmony and confidence.',
  },

  'sun-damage': {
    title: 'Sun Damage & Pigmentation',
    seoTitle: 'Sun Damage & Pigmentation Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers IPL, Opus Plasma, chemical peels, and medical-grade skincare to treat sun damage, dark spots, and pigmentation.',
    heroDescription: 'Dark spots, uneven skin tone, or visible sun damage? RELUXE Med Spa offers advanced treatments like IPL, laser resurfacing, and chemical peels to restore brighter, clearer skin.',
    heroImage: '/images/conditions/sun-damage-hero.jpg',
    aboutHeading: 'Why Sun Damage & Pigmentation Happen',
    aboutP1: 'UV exposure, hormones, and aging can all cause pigmentation issues. These often appear as dark spots, freckles, melasma, or an overall uneven skin tone.',
    aboutP2: 'While sunscreen is the best prevention, once damage appears, professional treatments are needed to restore clarity and brightness to the skin.',
    treatments: [
      { title: 'IPL Photofacial', copy: 'Targets sun spots, redness, and pigmentation by using pulses of light to restore even tone.', href: '/services/ipl' },
      { title: 'Opus Plasma', copy: 'Fractional skin resurfacing to smooth texture, fade discoloration, and rejuvenate skin tone.', href: '/services/opus' },
      { title: 'ClearLift', copy: 'Gentle laser that helps lift pigment and brighten skin with minimal downtime.', href: '/services/clearlift' },
      { title: 'Chemical Peels', copy: 'Exfoliates damaged surface cells, helping fade dark spots and improve radiance.', href: '/services/peels' },
      { title: 'Microneedling (SkinPen\u00ae)', copy: 'Stimulates collagen and helps fade post-inflammatory pigmentation from acne or sun.', href: '/services/skinpen' },
      { title: 'Medical-Grade Skincare', copy: 'SkinBetter Science, SkinCeuticals, and Hydrinity formulas to prevent and treat pigmentation at home.', href: '/skincare' },
    ],
    faqs: [
      { q: 'What\'s the best treatment for sun spots?', a: 'IPL is one of the most effective options for targeting sun spots and pigmentation, often combined with skincare for maintenance.' },
      { q: 'How many sessions will I need?', a: 'Most patients need 3\u20135 sessions of IPL or Opus spaced a few weeks apart for best results.' },
      { q: 'Will the spots come back?', a: 'Without sun protection, pigmentation can return. We recommend daily SPF and follow-up treatments as needed.' },
      { q: 'Is there downtime?', a: 'IPL and ClearLift have minimal downtime, while Opus or chemical peels may involve a few days of redness and flaking.' },
    ],
    ctaHeading: 'Bright. Clear. Confident.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers advanced treatments for sun damage, dark spots, and pigmentation. Let us design a personalized plan to restore your glow.',
  },

  'skin-texture': {
    title: 'Uneven Skin Tone & Texture',
    seoTitle: 'Uneven Skin Tone & Texture Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers HydraFacial, Glo2Facial, SkinPen microneedling, chemical peels, and laser treatments for uneven skin tone and texture.',
    heroDescription: 'Dullness, roughness, enlarged pores, or blotchy skin? RELUXE Med Spa specializes in treatments like HydraFacial\u00ae, Glo2Facial\u2122, SkinPen\u00ae, and resurfacing lasers to smooth and brighten your complexion.',
    heroImage: '/images/conditions/skin-texture-hero.jpg',
    aboutHeading: 'What Causes Uneven Tone & Texture?',
    aboutP1: 'Uneven tone and texture can come from many factors: sun exposure, aging, acne, clogged pores, or lack of consistent exfoliation. Skin may look dull, rough, blotchy, or unevenly pigmented.',
    aboutP2: 'At RELUXE, we design treatment plans that resurface, rehydrate, and renew your skin\u2014revealing a smoother, more radiant complexion.',
    treatments: [
      { title: 'HydraFacial\u00ae', copy: 'Deep cleansing, exfoliation, hydration, and antioxidant infusion\u2014an all-in-one reset for smoother skin.', href: '/services/hydrafacial' },
      { title: 'Glo2Facial\u2122', copy: 'Exfoliates and oxygenates skin at the same time, leaving a fresh, balanced glow.', href: '/services/glo2facial' },
      { title: 'Microneedling (SkinPen\u00ae)', copy: 'Stimulates collagen, reduces pore size, and refines skin texture long term.', href: '/services/skinpen' },
      { title: 'Opus Plasma', copy: 'Fractional resurfacing laser for more dramatic smoothing of fine lines and rough patches.', href: '/services/opus' },
      { title: 'Chemical Peels', copy: 'Customizable exfoliation to brighten skin, reduce discoloration, and refine texture.', href: '/services/peels' },
      { title: 'Medical-Grade Skincare', copy: 'Daily care with SkinBetter, SkinCeuticals, and Hydrinity maintains smoother tone between visits.', href: '/skincare' },
    ],
    faqs: [
      { q: 'What\'s the fastest way to improve skin texture?', a: 'HydraFacial or Glo2Facial give instant results. For long-term change, SkinPen microneedling or Opus resurfacing build collagen and refine skin.' },
      { q: 'How many treatments will I need?', a: 'Facials can be monthly maintenance. Microneedling and Opus usually require a series of 3\u20134 sessions for best results.' },
      { q: 'Can skincare help uneven tone?', a: 'Yes. Medical-grade products with retinol, vitamin C, and brightening agents maintain results and improve tone at home.' },
      { q: 'Is there downtime?', a: 'Facials have no downtime. Microneedling may cause mild redness for 1\u20132 days, while Opus involves 3\u20135 days of healing.' },
    ],
    ctaHeading: 'Smooth. Bright. Renewed.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers advanced treatments for uneven skin tone and texture. Book your consult today and reveal your best skin yet.',
  },

  'under-eye': {
    title: 'Under-Eye Hollows & Dark Circles',
    seoTitle: 'Under-Eye Hollows & Dark Circles | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield treats under-eye hollows and dark circles with tear trough filler, PRF, and advanced skincare for refreshed, natural results.',
    heroDescription: 'Tired of looking tired? Hollows and dark circles under the eyes are a common concern\u2014but they\'re also highly treatable. RELUXE Med Spa uses fillers, PRF, and advanced skincare to brighten, smooth, and refresh your look.',
    heroImage: '/images/conditions/dark-eyes-hero.jpg',
    aboutHeading: 'Why Hollows & Dark Circles Happen',
    aboutP1: 'Genetics, aging, volume loss, and skin thinning all contribute to under-eye hollows and dark shadows. Even with plenty of sleep, the area may still look tired or sunken.',
    aboutP2: 'With modern injectables and regenerative treatments, we can restore volume, improve skin quality, and reduce discoloration for a refreshed look.',
    treatments: [
      { title: 'Morpheus8 Under-Eye', copy: 'Tighten delicate skin around the eyes, smooth fine lines, and reduce crepiness while inducing collagen.', href: '/services/morpheus8' },
      { title: 'PRP (Platelet-Rich Plasma)', copy: 'Uses your body\'s own growth factors to improve skin thickness, circulation, and pigmentation.', href: '/services/prp' },
      { title: 'SkinPen\u00ae Microneedling', copy: 'Boosts collagen and strengthens under-eye skin, improving fine lines and texture.', href: '/services/skinpen' },
      { title: 'Opus Plasma', copy: 'Fractional resurfacing to smooth crepey skin and brighten under-eye tone.', href: '/services/opus' },
      { title: 'Medical-Grade Skincare', copy: 'SkinBetter EyeMax, Hydrinity, and brightening formulas support long-term results.', href: '/skincare' },
      { title: 'Comprehensive Balancing', copy: 'Treating cheeks and midface with filler helps lift shadows and improve eye area harmony.', href: '/services/facial-balancing' },
    ],
    faqs: [
      { q: 'Is under-eye filler safe?', a: 'Yes\u2014when performed by trained injectors. RELUXE providers are highly experienced with tear trough treatments, prioritizing safety and natural results.' },
      { q: 'How long does filler last under the eyes?', a: 'Typically 9\u201318 months, depending on the product used and your metabolism.' },
      { q: 'Will filler make me look puffy?', a: 'Our approach is conservative. We use just enough to restore volume without overfilling or creating puffiness.' },
      { q: 'What\'s the best option if I don\'t want filler?', a: 'PRF, microneedling, and Opus resurfacing are great non-filler options that improve skin and reduce dark circles naturally.' },
    ],
    ctaHeading: 'Bright. Rested. Refreshed.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield specializes in treating under-eye hollows and dark circles with safe, natural techniques. Book a consult today and wake up your look.',
  },

  'double-chin': {
    title: 'Double Chin / Submental Fullness',
    seoTitle: 'Double Chin & Submental Fullness | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield treats double chin and submental fullness with EvolveX, fillers, and contouring treatments for a defined jawline.',
    heroDescription: 'A double chin or fullness under the jaw can make your face look less defined\u2014no matter your weight. At RELUXE, we use advanced technology and injectable techniques to sculpt, contour, and restore balance to your profile.',
    heroImage: '/images/conditions/double-chin-hero.jpg',
    aboutHeading: 'Why Submental Fullness Happens',
    aboutP1: 'A "double chin" isn\'t always related to weight\u2014it can be genetic, age-related, or due to skin laxity. Fat deposits beneath the chin can create fullness that hides jawline definition and balance.',
    aboutP2: 'The good news: modern med spa treatments can slim, tighten, and contour the area for a sharper, more youthful profile.',
    treatments: [
      { title: 'EvolveX', copy: 'Radiofrequency and EMS technology that reduces fat and tightens skin for jawline definition.', href: '/services/evolvex' },
      { title: 'Jawline Filler', copy: 'Strategically placed filler sharpens and balances the jawline, enhancing profile harmony.', href: '/services/filler' },
      { title: 'Morpheus8', copy: 'Tightens skin and improves laxity under the chin and jawline for a lifted look.', href: '/services/morpheus8' },
      { title: 'Opus Plasma', copy: 'Fractional resurfacing can improve skin tightness and reduce mild laxity under the chin.', href: '/services/opus' },
      { title: 'Comprehensive Balancing', copy: 'Treating cheeks, chin, or midface improves overall proportions and reduces the appearance of fullness.', href: '/services/facial-balancing' },
    ],
    faqs: [
      { q: 'Is double chin treatment permanent?', a: 'EvolveX and Morpheus8 offer lasting contouring with maintenance as needed. Results improve over time with collagen remodeling.' },
      { q: 'How many sessions will I need?', a: 'Most patients need 3\u20136 EvolveX sessions or 2\u20134 Morpheus8 sessions for optimal results.' },
      { q: 'Does it hurt?', a: 'Treatments are well tolerated. EvolveX feels like warming with muscle contractions, while Morpheus8 uses numbing for comfort.' },
      { q: 'Can I combine treatments?', a: 'Yes\u2014combining fat reduction, skin tightening, and filler contouring often provides the best and most natural results.' },
    ],
    ctaHeading: 'Defined. Balanced. Confident.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers advanced treatments to reduce double chin fullness and sculpt the jawline. Book your consult today to discover your best profile.',
  },

  'loose-skin': {
    title: 'Loose or Sagging Skin',
    seoTitle: 'Loose or Sagging Skin Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers Morpheus8, EvolveX, Opus Plasma, and advanced facials for tightening and lifting loose or sagging skin.',
    heroDescription: 'Skin laxity happens to everyone with age. At RELUXE, we restore firmness with Morpheus8, EvolveX, Opus Plasma, and advanced facials\u2014tightening and lifting without surgery.',
    heroImage: '/images/conditions/sagging-skin-hero.jpg',
    aboutHeading: 'Why Skin Starts to Sag',
    aboutP1: 'With age, our bodies produce less collagen and elastin. The skin loses firmness, resulting in sagging around the jawline, neck, eyelids, and midface. Genetics, sun exposure, and weight loss can accelerate this process.',
    aboutP2: 'Non-surgical treatments now make it possible to lift, tighten, and stimulate collagen\u2014without invasive surgery or long downtime.',
    treatments: [
      { title: 'Morpheus8', copy: 'Radiofrequency microneedling that tightens skin and stimulates deep collagen remodeling.', href: '/services/morpheus8' },
      { title: 'EvolveX', copy: 'RF energy plus muscle stimulation firms skin and improves contour, especially on jawline and body.', href: '/services/evolvex' },
      { title: 'Opus Plasma', copy: 'Fractional plasma resurfacing smooths wrinkles, lifts laxity, and improves texture.', href: '/services/opus' },
      { title: 'ClearLift', copy: 'Gentle laser technology to stimulate collagen and tighten skin with no downtime.', href: '/services/clearlift' },
      { title: 'SkinPen\u00ae Microneedling', copy: 'Boosts collagen naturally to improve elasticity and reduce early signs of laxity.', href: '/services/skinpen' },
      { title: 'Comprehensive Plans', copy: 'Custom plans blending injectables, energy devices, and skincare for full-face results.', href: '/services' },
    ],
    faqs: [
      { q: 'What\'s the best treatment for sagging skin?', a: 'Morpheus8 and EvolveX are our most powerful options. Opus and ClearLift complement by resurfacing and stimulating collagen.' },
      { q: 'How many sessions will I need?', a: 'Most patients see improvement after 1 session, but 3\u20134 sessions spaced weeks apart achieve the most noticeable, lasting results.' },
      { q: 'How long do results last?', a: 'Collagen-stimulating treatments can last 1\u20132 years, with maintenance to keep skin firm as you age.' },
      { q: 'Is it painful?', a: 'Treatments are well tolerated with numbing. You may feel heat or tingling, but downtime is typically minimal.' },
    ],
    ctaHeading: 'Tighter. Firmer. Younger.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers the latest skin tightening technologies for loose or sagging skin. Book a consult today and lift your confidence.',
  },

  'unwanted-hair': {
    title: 'Unwanted Hair',
    seoTitle: 'Unwanted Hair Removal | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers advanced laser hair removal for smooth, lasting results. Treat areas like underarms, legs, back, chest, face, and more.',
    heroDescription: 'Shaving, waxing, and ingrown hairs don\'t have to be part of your routine. At RELUXE, our advanced laser hair removal delivers smooth, long-lasting results for all skin types.',
    heroImage: '/images/conditions/lhr-hero.jpg',
    aboutHeading: 'Why Choose Laser Hair Removal?',
    aboutP1: 'Traditional methods like shaving and waxing are temporary, time-consuming, and often cause irritation or ingrown hairs. Laser hair removal offers a long-term solution by targeting follicles to prevent regrowth, leaving skin smooth and hair-free.',
    aboutP2: 'At RELUXE, we use the latest laser technologies\u2014safe for all skin tones\u2014to permanently reduce unwanted hair on virtually any area of the body.',
    treatments: [
      { title: 'Underarms', copy: 'Quick, effective, and one of the most popular areas for both women and men.', href: '/services/laser-hair-removal' },
      { title: 'Legs', copy: 'Ditch the razor\u2014full legs or partial areas treated with long-lasting results.', href: '/services/laser-hair-removal' },
      { title: 'Back & Chest', copy: 'Smooth, clean results for men who want to reduce or remove back and chest hair.', href: '/services/laser-hair-removal' },
      { title: 'Bikini & Brazilian', copy: 'Customizable treatments for your comfort and preference\u2014no more waxing pain.', href: '/services/laser-hair-removal' },
      { title: 'Face & Neck', copy: 'Safely reduce unwanted facial or neck hair while avoiding irritation from shaving.', href: '/services/laser-hair-removal' },
      { title: 'Arms & Hands', copy: 'Soft, smooth results for full arms, forearms, or small spots like hands and fingers.', href: '/services/laser-hair-removal' },
    ],
    faqs: [
      { q: 'How many sessions will I need?', a: 'Most patients need 6\u20138 sessions spaced a few weeks apart for optimal, lasting results.' },
      { q: 'Is it permanent?', a: 'Laser hair removal provides long-term reduction. Many see permanent results, though occasional maintenance may be needed.' },
      { q: 'Does it hurt?', a: 'Most describe it as quick snaps of a rubber band. It\'s well tolerated and much less painful than waxing.' },
      { q: 'Can all skin tones be treated?', a: 'Yes\u2014RELUXE uses advanced laser systems designed for safe, effective treatments across a wide range of skin tones.' },
    ],
    ctaHeading: 'Smooth. Confident. Carefree.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers expert laser hair removal for men and women. Book your consult today and say goodbye to razors and waxing.',
  },

  'rosacea': {
    title: 'Rosacea & Redness',
    seoTitle: 'Rosacea & Redness Treatment | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'RELUXE Med Spa in Carmel & Westfield offers IPL, calming facials, and medical-grade skincare to reduce redness, flushing, and rosacea flare-ups.',
    heroDescription: 'Persistent flushing, redness, or visible vessels? RELUXE Med Spa offers customized solutions for rosacea and redness\u2014using IPL, facials, and skincare to calm and restore balance.',
    heroImage: '/images/conditions/rosacea-hero.jpg',
    aboutHeading: 'What is Rosacea?',
    aboutP1: 'Rosacea is a common skin condition that causes redness, flushing, visible blood vessels, and sometimes breakouts. It often flares with triggers like heat, stress, alcohol, and certain foods. While it can\'t be "cured," it can be managed effectively with the right treatments and skincare.',
    aboutP2: 'RELUXE providers build customized plans to reduce redness, calm irritation, and restore skin confidence.',
    treatments: [
      { title: 'IPL (Intense Pulsed Light)', copy: 'Targets redness, flushing, and visible vessels to even skin tone.', href: '/services/ipl' },
      { title: 'Calming Facials', copy: 'Soothing treatments like HydraFacial\u00ae and Glo2Facial\u2122 designed to reduce irritation and hydrate.', href: '/services/facials' },
      { title: 'Medical-Grade Skincare', copy: 'Products like SkinBetter Alto and Hydrinity reduce inflammation and strengthen the skin barrier.', href: '/skincare' },
      { title: 'Opus Plasma', copy: 'Fractional resurfacing can help reduce chronic redness and improve skin resilience.', href: '/services/opus' },
      { title: 'SkinPen\u00ae Microneedling', copy: 'Supports healthier skin barrier function and reduces vascular flare-ups.', href: '/services/skinpen' },
    ],
    faqs: [
      { q: 'Can rosacea be cured?', a: 'There\'s no permanent cure, but with proper treatments and skincare, symptoms can be dramatically reduced and controlled.' },
      { q: 'What\'s the best treatment for redness?', a: 'IPL is the most effective for visible vessels and flushing, while facials and skincare help maintain results.' },
      { q: 'How many IPL sessions will I need?', a: 'Most patients need 3\u20135 sessions for best results, with maintenance treatments as needed.' },
      { q: 'Does diet or lifestyle matter?', a: 'Yes\u2014common triggers include alcohol, spicy foods, heat, and stress. Identifying and managing triggers helps long-term control.' },
    ],
    ctaHeading: 'Calm. Clear. Confident.',
    ctaBody: 'RELUXE Med Spa in Carmel & Westfield offers IPL, facials, and skincare to reduce rosacea and redness. Book your consult today and let us help you regain skin confidence.',
  },

  'weight-loss-laxity-volume-loss': {
    title: 'Skin Laxity & Volume Loss from Weight Loss',
    seoTitle: 'Skin Laxity & Volume Loss from Weight Loss (GLP-1) | RELUXE Med Spa Carmel & Westfield',
    seoDescription: 'Losing weight with GLP-1s like Ozempic or Mounjaro? RELUXE Med Spa in Carmel & Westfield restores firmness and balanced volume with Sculptra\u00ae, Morpheus8, and expert filler.',
    heroDescription: 'Weight loss \u2014 including GLP-1s like Ozempic\u00ae, Wegovy\u00ae, and Mounjaro\u00ae \u2014 can change facial fat pads and skin elasticity. At RELUXE Carmel & Westfield, we restore structure and firmness with Sculptra\u00ae, Morpheus8, and precision filler so you keep the glow you earned.',
    heroImage: '/images/conditions/weight-loss-laxity-hero.jpg',
    aboutHeading: 'Choose Your Phased Plan',
    aboutP1: 'Rapid fat reduction can deflate key facial fat pads (midface, temples, under-eye) while collagen and elastin decline. This combination can make skin appear lax and features less defined.',
    aboutP2: 'We offer three pathways: Start (protect collagen early), Active (support firmness while losing), and Restore (rebuild volume post-loss). A consult helps pick the right phase for you.',
    treatments: [
      { title: 'Sculptra\u00ae (Biostimulator)', copy: 'Gradually restores collagen for a firmer, lifted look that lasts 18\u201324 months.', href: '/services/sculptra' },
      { title: 'Morpheus8 RF Microneedling', copy: 'Deep remodeling to tighten skin and improve jawline, cheeks, and under-eye support.', href: '/services/morpheus8' },
      { title: 'Artistic Filler Balancing', copy: 'Precise contouring for temples, midface, chin, and jawline \u2014 natural, never overfilled.', href: '/services/filler' },
      { title: 'Opus Plasma / ClearLift', copy: 'Texture + tone perfection that complements tightening and volume strategies.', href: '/services/opus' },
      { title: 'SkinPen\u00ae Microneedling', copy: 'Supports elasticity and texture as your weight changes; minimal downtime.', href: '/services/skinpen' },
    ],
    faqs: [
      { q: 'Why do weight loss and GLP-1s change the face?', a: 'Rapid fat reduction can deflate key facial fat pads (midface, temples, under-eye) while collagen and elastin decline. This combination can make skin appear lax and features less defined.' },
      { q: 'What treatments rebuild structure without looking "done"?', a: 'We pair collagen stimulators like Sculptra\u00ae with RF microneedling (Morpheus8) and strategic filler placement. The result: gradual, natural lift with immediate balancing where needed.' },
      { q: 'When should I start treatments during my GLP-1 journey?', a: 'We offer three pathways: Start (protect collagen early), Active (support firmness while losing), and Restore (rebuild volume post-loss). A consult helps pick the right phase.' },
      { q: 'How many sessions or vials will I need?', a: 'Most plans span 2\u20134 visits. Typical starting points: 1\u20133 Morpheus8 sessions, 2\u20134 vials of Sculptra\u00ae over several months, and 1\u20133 syringes of filler for contour balance.' },
      { q: 'Is there downtime?', a: 'Morpheus8 has 1\u20133 days of social downtime; Sculptra\u00ae and filler have minimal downtime (mild swelling or tenderness). We tailor your plan to events and schedule.' },
      { q: 'Do you offer this in Carmel and Westfield?', a: 'Yes. Our expert injectors and device specialists treat patients at both RELUXE Carmel and RELUXE Westfield with the same protocols and quality standards.' },
    ],
    ctaHeading: 'Lose the weight, keep the glow.',
    ctaBody: 'Carmel & Westfield\'s trusted plan for skin laxity and volume loss after weight loss. Start, support, and restore \u2014 with RELUXE.',
  },
}

export function getCondition(slug) {
  return CONDITIONS[slug] || null
}

export function getAllConditionSlugs() {
  return Object.keys(CONDITIONS)
}

export function getAllConditions() {
  return Object.entries(CONDITIONS).map(([slug, data]) => ({
    slug,
    ...data,
  }))
}

export default CONDITIONS
