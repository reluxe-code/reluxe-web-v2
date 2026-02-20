// src/data/serviceGridData.js
// Shared service grid constants used by LocationServicesGrid and AllServicesGrid.

/* ── Tab → service slugs mapping ── */
export const TAB_SLUGS = {
  Injectables:   ['tox', 'filler', 'facial-balancing'],
  Facials:       ['facials', 'glo2facial', 'hydrafacial', 'peels', 'skinpen', 'skin-iq'],
  Lasers:        ['lasers', 'ipl', 'clearlift', 'clearskin', 'vascupen', 'laser-hair-removal'],
  'Wow Results': ['morpheus8', 'co2', 'opus', 'sculptra'],
  Massage:       ['massage', 'salt-sauna', 'evolvex'],
}

/* One representative slug per tab for the Featured view */
export const FEATURED_PICKS = {
  Injectables:   'tox',
  Facials:       'facials',
  Lasers:        'ipl',
  'Wow Results': 'morpheus8',
  Massage:       'massage',
}

/* ── Category badge colours ── */
export const TAB_COLORS = {
  Injectables:   'bg-violet-100 text-violet-700',
  Facials:       'bg-rose-50 text-rose-600',
  Lasers:        'bg-fuchsia-100 text-fuchsia-700',
  'Wow Results': 'bg-amber-50 text-amber-700',
  Massage:       'bg-emerald-50 text-emerald-700',
}

/* Reverse lookup: slug → tab name */
export const SLUG_TO_TAB = {}
Object.entries(TAB_SLUGS).forEach(([tab, slugs]) => {
  slugs.forEach(s => { SLUG_TO_TAB[s] = tab })
})

/** Patient-focused data for each service slug */
export const SERVICE_INFO = {
  tox: {
    desc: 'Look refreshed, not frozen. Smooths lines so you still look like you — just well-rested.',
    pills: ['✨ Natural Results', '⏱ Quick Treatment', '🔄 Prevention'],
    bestFor: 'First-timers wanting subtle, natural improvement.',
  },
  filler: {
    desc: 'Restore what time took. Natural volume for lips, cheeks & jawline that turns heads, not questions.',
    pills: ['💋 Lips & Cheeks', '✨ Natural Volume', '⏱ Same-Day Results'],
    bestFor: 'Anyone noticing volume loss or wanting fuller lips.',
  },
  'facial-balancing': {
    desc: 'Your whole face, one plan. We map the most impactful changes first so every treatment builds on the last.',
    pills: ['🎯 Custom Plan', '✨ Natural Proportion', '📋 Phased Approach'],
    bestFor: 'Patients wanting a comprehensive, planned refresh.',
  },
  co2: {
    desc: 'The gold standard for a real reset. Dramatically smooths deep lines, scars & years of sun damage.',
    pills: ['💎 Gold Standard', '🔬 Deep Resurfacing', '✨ Dramatic Results'],
    bestFor: 'Deep lines, scarring, or significant texture concerns.',
  },
  'skin-iq': {
    desc: 'Stop guessing, start knowing. A structured analysis that builds your smartest, most efficient care plan.',
    pills: ['📋 Full Analysis', '🎯 Custom Roadmap', '💡 Evidence-Based'],
    bestFor: 'New patients or anyone due for a routine audit.',
  },
  lasers: {
    desc: 'Fix what skincare can\'t. Energy-based treatments that tackle tone, texture & tightness at the source.',
    pills: ['☀️ Sun Damage', '✨ Tone & Texture', '🔬 Multiple Options'],
    bestFor: 'Sun damage, redness, or early signs of laxity.',
  },
  morpheus8: {
    desc: 'Tighter, smoother skin from the inside out. RF microneedling that rebuilds collagen where you need it most.',
    pills: ['🔬 RF Microneedling', '✨ Collagen Boost', '💎 Skin Tightening'],
    bestFor: 'Laxity, acne scarring, or textural concerns.',
  },
  skinpen: {
    desc: 'Unlock your skin\'s own repair system. Visibly smoother, more even skin with minimal downtime.',
    pills: ['✨ Smoother Texture', '🔬 Collagen Boost', '⏱ Minimal Downtime'],
    bestFor: 'Texture, enlarged pores, or mild scarring.',
  },
  massage: {
    desc: 'Unwind completely. Therapeutic bodywork that melts tension and helps your body truly recover.',
    pills: ['🧘 Deep Relaxation', '💪 Muscle Relief', '🔄 Recovery'],
    bestFor: 'Stress relief, muscle tension, or post-treatment recovery.',
  },
  'laser-hair-removal': {
    desc: 'Done with shaving — for good. Permanent hair reduction matched to your skin type for lasting smoothness.',
    pills: ['✨ Permanent Results', '🎯 All Areas', '💎 Smooth Skin'],
    bestFor: 'Anyone ready to ditch the razor for good.',
  },
  facials: {
    desc: 'Your skin, visibly better. Custom facials that leave you clearer, brighter & genuinely glowing.',
    pills: ['✨ Custom Formula', '💎 Deep Cleanse', '🌟 Instant Glow'],
    bestFor: 'Regular maintenance or when your skin needs a reset.',
  },
  glo2facial: {
    desc: 'Instant bounce, zero downtime. Oxygenating treatment that makes your skin look lit from within.',
    pills: ['⏱ Zero Downtime', '✨ Brightening', '💧 Deep Hydration'],
    bestFor: 'Pre-event prep or dull, dehydrated skin.',
  },
  hydrafacial: {
    desc: 'The ultimate skin reset. Deep cleanse, extract & hydrate in one powerful session.',
    pills: ['💎 Deep Extraction', '💧 Hydration', '✨ Instant Results'],
    bestFor: 'Pre-event glow or congested, tired skin.',
  },
  peels: {
    desc: 'Reveal the fresh skin underneath. Peels that brighten, smooth & even out your complexion fast.',
    pills: ['✨ Brightening', '🎯 Adjustable Strength', '🔄 Even Tone'],
    bestFor: 'Dullness, uneven pigment, or rough texture.',
  },
  evolvex: {
    desc: 'Sculpt & tighten without surgery. RF energy + muscle stimulation for a firmer, more toned body.',
    pills: ['💪 Body Toning', '✨ Skin Tightening', '🎯 Non-Invasive'],
    bestFor: 'Body contouring or mild skin laxity on the body.',
  },
  sculptra: {
    desc: 'Build collagen your body actually keeps. Gradual, natural volume that restores structure over weeks — not overnight.',
    pills: ['🔬 Collagen Stimulator', '✨ Gradual Results', '💎 Long-Lasting'],
    bestFor: 'Patients wanting natural, long-term facial volume restoration.',
  },
  ipl: {
    desc: 'Undo years of sun damage in sessions. Clears spots, redness & uneven tone for clearer skin.',
    pills: ['☀️ Sun Spot Removal', '🔴 Redness Relief', '✨ Even Tone'],
    bestFor: 'Sun spots, rosacea, or blotchy complexion.',
  },
  vascupen: {
    desc: 'Say goodbye to visible veins. Precise treatment for those tiny facial veins and redness that won\'t quit.',
    pills: ['🎯 Precision Treatment', '🔴 Vein Removal', '⏱ Quick Session'],
    bestFor: 'Visible facial veins or persistent flushing.',
  },
  clearlift: {
    desc: 'Lunchtime laser, real results. Gentle enough for zero downtime, effective enough to see a difference.',
    pills: ['⏱ Zero Downtime', '✨ Tone Improvement', '🔄 Maintenance'],
    bestFor: 'Busy patients wanting consistent, no-downtime maintenance.',
  },
  clearskin: {
    desc: 'Clear breakouts at the source. Laser treatment that calms active acne and fades the marks it leaves behind.',
    pills: ['🎯 Targets Acne', '🔴 Reduces Redness', '✨ Clearer Skin'],
    bestFor: 'Active breakouts or lingering acne marks.',
  },
  'salt-sauna': {
    desc: 'Sweat it out, feel brand new. Infrared heat + salt therapy for deep relaxation and total-body recovery.',
    pills: ['🧘 Deep Relaxation', '🔥 Infrared Heat', '🧂 Salt Therapy'],
    bestFor: 'Wellness seekers or post-treatment recovery.',
  },
  opus: {
    desc: 'Brighter, smoother skin with less downtime than CO₂. Perfect for fine lines, dullness & crepey texture.',
    pills: ['✨ Brightening', '⏱ Less Downtime', '🔬 Fractional RF'],
    bestFor: 'Fine lines or crepey skin with limited downtime tolerance.',
  },
}

export function getInfo(slug) {
  return SERVICE_INFO[slug] || { desc: 'Expert care with natural-looking results.', pills: ['✨ All Skin Types'], bestFor: 'Anyone looking for expert aesthetic care.' }
}

/** Deduplicate service categories by their resolved slug. */
export function deduped(items) {
  const seen = new Set()
  return items.filter(item => {
    const slug = slugFromHref(item.href)
    if (seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

/** Get the slug from a /services/[slug] href. */
export function slugFromHref(href) {
  return String(href || '')
    .replace(/^\/services\//, '')
    .split('/')[0]
    .split('?')[0]
}
