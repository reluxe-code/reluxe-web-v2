// src/data/locationContent/index.js
/**
 * Return unique, location-specific content for a given service slug + city key.
 * Add specific overrides per service by exporting objects like:
 *   { westfield: {...}, carmel: {...} }
 */
import { getLocation } from '@/data/locations';

/** small helper to build a compact FAQ item */
const fq = (q, a) => ({ q, a });

/**
 * Service-focused locale overrides.
 * Keep descriptions 2–3 sentences and include duration.
 * "differences" should be about the SERVICE (approach, devices, outcomes),
 * not about the physical location.
 */
const OVERRIDES = {
  // ===========================
  // INJECTABLES – TOX
  // ===========================
  tox: {
    westfield: {
      exists: true,
      durationText: 'Typically 20–30 minutes',
      description:
        'Wrinkle relaxers soften lines in the forehead, crow’s feet, and frown area for a smoother, rested look. We tailor dosing to your expression patterns and goals, prioritizing natural movement. Typically 20–30 minutes including mapping and aftercare.',
      differences: [
        'Conservative first-session dosing with optional tweak at 2 weeks',
        'Expression-based mapping to avoid heaviness and preserve lift',
      ],
      faqs: [
        fq('How fast will I see results?', 'You’ll notice softening in 2–5 days with full results ~14 days.'),
        fq('How long does it last?', 'About 3–4 months on average; metabolism and area treated matter.'),
        fq('Will I look “frozen”?', 'No—our approach preserves natural expressions and brow lift.'),
        fq('Is there downtime?', 'Minimal. Small bumps resolve within an hour; avoid workouts for 12–24 hours.'),
        fq('Can I do this before an event?', 'Yes—plan 2 weeks ahead to allow full onset and any touch-ups.'),
        fq('Does it hurt?', 'Pinches last seconds; we use tiny needles and comfort techniques.'),
      ],
      complementary: [{ href: '/services/facials', label: 'Facial Prep' }, { href: '/services/skinpen', label: 'SkinPen' }],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 20–30 minutes',
      description:
        'Neurotoxin treats dynamic lines with precision dosing for a refreshed, not “done,” look. Mapping focuses on balance and lift where it flatters your features. Appointments typically take 20–30 minutes including consultation.',
      differences: [
        'Lift-preserving brow strategy to avoid lid heaviness',
        'Micro-aliquots for lip lines and gummy-smile refinement',
      ],
      faqs: [
        fq('When do touch-ups happen?', 'We recheck at ~2 weeks to fine-tune if needed.'),
        fq('How long is a visit?', 'Most visits are 20–30 minutes including planning and aftercare.'),
        fq('Can I wear makeup after?', 'Wait 2–3 hours; avoid rubbing the area the rest of the day.'),
        fq('Workout rules?', 'Skip vigorous exercise for 12–24 hours to reduce migration risk.'),
        fq('Safe with filler?', 'Yes—often combined; your provider will sequence appropriately.'),
        fq('Any prep?', 'Arrive clean-skinned; avoid alcohol the night prior and blood thinners if approved by your MD.'),
      ],
      complementary: [{ href: '/services/lip-flip', label: 'Lip Flip' }, { href: '/services/facials', label: 'Event Facial' }],
    },
  },
  botox: 'tox',
  dysport: 'tox',
  jeuveau: 'tox',
  daxxify: 'tox',

  // ===========================
  // INJECTABLES – FILLER FAMILY
  // ===========================
  filler: {
    westfield: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'Dermal filler restores structure and light-reflection in lips, cheeks, chin, and jawline. We layer product strategically for lift with minimal weight, aiming for believable harmony. Appointments are usually 45–60 minutes.',
      differences: [
        'Layered, low-volume technique to avoid heaviness',
        'Anatomy-first approach to support light and proportion',
      ],
      faqs: [
        fq('How long does filler last?', '6–18 months depending on product, area, and metabolism.'),
        fq('Is swelling normal?', 'Yes—expect 24–72 hours; lips swell the most. Ice in short intervals.'),
        fq('Reversible?', 'Hyaluronic fillers are dissolvable with hyaluronidase if needed.'),
        fq('Will it look obvious?', 'We prioritize subtlety—your face, just refreshed.'),
        fq('Pain level?', 'Topical numbing + built-in lidocaine make it very tolerable.'),
        fq('Aftercare?', 'Avoid heat, saunas, strenuous workouts, and pressure for 24–48 hours.'),
      ],
      complementary: [{ href: '/services/facial-balancing', label: 'Balancing Consult' }],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'We use modern fillers to refine lips and lift midface contours without bulk. Expect precise placement and conservative first sessions to ensure natural harmony. Most treatments take 45–60 minutes including plan and photos.',
      differences: [
        'Micro-bolus placement to reduce swelling and improve integration',
        'Focus on shape over size—support > volume',
      ],
      faqs: [
        fq('When will results settle?', 'Great immediately, then refine over 1–2 weeks as swelling resolves.'),
        fq('Longevity?', 'Usually 6–12+ months depending on area and product.'),
        fq('Can I combine with tox?', 'Common combo for smoothing + contour—often same day.'),
        fq('Massage or leave it?', 'Avoid firm pressure for a week; we’ll guide if molding is appropriate.'),
        fq('Bruising risk?', 'Possible; arnica and avoiding blood thinners (if approved) help.'),
        fq('Follow-up?', 'We like a check-in at 2 weeks to confirm symmetry and feel.'),
      ],
      complementary: [{ href: '/services/tox', label: 'Tox for Lines' }],
    },
  },
  juvederm: 'filler',
  restylane: 'filler',
  versa: 'filler',
  rha: 'filler',

  // ===========================
  // BIOSTIMULATOR – SCULPTRA
  // ===========================
  sculptra: {
    westfield: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'Sculptra gradually stimulates collagen for subtle, global firming and contour support. It’s ideal for soft deflation rather than sharp edges. Sessions are typically 45 minutes.',
      differences: [
        'Dilution and vectoring customized to skin thickness and goals',
        'Series-based plan (usually 2–3) for steady, believable change',
      ],
      faqs: [
        fq('When do I see results?', 'Collagen builds over 6–12 weeks; improvements continue for months.'),
        fq('How long does it last?', 'Often 18–24+ months with proper series and maintenance.'),
        fq('Massage rules?', 'Yes—5 minutes, 5 times/day, for 5 days (“5-5-5”).'),
        fq('Pairs with filler?', 'Yes—Sculptra for foundation, filler for fine tuning.'),
        fq('Downtime?', 'Mild swelling/bruise; resume normal activities next day.'),
        fq('Who’s a candidate?', 'Great for early laxity or deflation; we’ll screen thoroughly.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'This collagen stimulator improves structure and skin quality over time without a “filled” look. Plans are spaced for steady collagen building. Most visits are about 45 minutes.',
      differences: [
        'Feathered fanning patterns to avoid nodularity',
        'Skin-quality focus (porosity, bounce) in addition to contour',
      ],
      faqs: [
        fq('Series needed?', 'Most do 2–3 sessions 6–8 weeks apart, then yearly maintenance.'),
        fq('Event timing?', 'Start 3–4 months ahead to allow collagen to build.'),
        fq('Can it be dissolved?', 'No—this isn’t HA filler; we mitigate risk with technique.'),
        fq('Aftercare?', 'Follow 5-5-5 massage; avoid high heat/workouts for 24 hours.'),
        fq('Combos?', 'Excellent with Morpheus8 or Opus for skin tightening.'),
        fq('Side effects?', 'Temporary swelling/bruise; small nodule risk is minimized by dilution and technique.'),
      ],
    },
  },

  // ===========================
  // FACIAL BALANCING CONSULT
  // ===========================
  'facial-balancing': {
    westfield: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'A full consult focused on proportion, light, and balance—not chasing lines or single features. We map priorities and phase treatment to keep results natural. Expect ~45 minutes including photos and plan.',
      differences: [
        'Priority mapping (what moves the needle first)',
        'Blend of foundation (structure) + finish (skin tone/texture)',
      ],
      faqs: [
        fq('Is this a treatment or consult?', 'Consult—some treatments can begin same day if appropriate.'),
        fq('Bring photos?', 'Optional inspo is welcome; we’ll set realistic, you-forward goals.'),
        fq('Cost credit?', 'Consult fee is often credited to treatment—ask your provider.'),
        fq('Need makeup off?', 'Yes—clean skin helps assessment and photography.'),
        fq('Will you recommend surgery?', 'If needed, we’ll advise honestly and coordinate care.'),
        fq('Follow-up plan?', 'We’ll outline a phased plan and timelines that fit your schedule.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'We evaluate facial contours, animation, and skin quality to design a phased, natural plan. The goal is balance and believable refinement, not a single “fix.” Visits last ~45 minutes.',
      differences: [
        'Expression and smile analysis to guide dosing/placement',
        'Photo-guided progress tracking over time',
      ],
      faqs: [
        fq('Same-day treatment?', 'Often possible for tox; fillers/energy devices may be scheduled.'),
        fq('Budget planning?', 'We prioritize by impact; you’ll have transparent options.'),
        fq('Skin plan too?', 'Yes—texture/tone often elevate results as much as volume.'),
        fq('Can I pause between steps?', 'Absolutely—plans flex with timelines and events.'),
        fq('What about asymmetry?', 'We address baseline asymmetries conservatively for harmony.'),
        fq('Who performs it?', 'Experienced injectors and aesthetic providers only.'),
      ],
    },
  },

  // ===========================
  // FILLER DISSOLVING
  // ===========================
  'filler-dissolving': {
    westfield: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'Hyaluronidase can selectively reduce or remove hyaluronic acid filler. We dissolve conservatively, often in stages, to address migration or heaviness. Most visits take ~30 minutes.',
      differences: [
        'Test-spot dosing for sensitive areas (e.g., lips)',
        'Layer-by-layer approach to avoid over-dissolving',
      ],
      faqs: [
        fq('Will it remove everything?', 'We can target small areas or do fuller reduction if desired.'),
        fq('Is it instant?', 'You’ll see change within minutes to hours; swelling may mask final outcome for 1–2 days.'),
        fq('Can I refill later?', 'Yes—usually after 1–2 weeks once tissues settle.'),
        fq('Does it hurt?', 'Brief sting; we buffer and use comfort measures.'),
        fq('Risks?', 'Allergy is rare; we’ll screen and may do a test dose.'),
        fq('Downtime?', 'Mild swelling/bruising—most resume routine the same day.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'We use hyaluronidase to correct migration, asymmetry, or overfilled areas safely. Expect a measured approach and recheck before refilling. Appointments are ~30 minutes.',
      differences: [
        'Precision micro-aliquots for borders and “pillowing”',
        'Re-build plan to restore shape thoughtfully',
      ],
      faqs: [
        fq('How soon can I refill?', 'Usually 1–2 weeks after dissolving once swelling settles.'),
        fq('Will skin look loose?', 'Temporary laxity can occur; refilling or skin tightening helps.'),
        fq('Pain control?', 'Topicals and buffered solution reduce sting significantly.'),
        fq('Multiple sessions?', 'Sometimes—depends on product, depth, and goals.'),
        fq('Cost varies?', 'Yes—based on units used and area complexity.'),
        fq('Aftercare?', 'Avoid pressure/heat for 24 hours; expect small bruises possible.'),
      ],
    },
  },

  // ===========================
  // PRP / PRF
  // ===========================
  prp: {
    westfield: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'Platelet-rich plasma is concentrated from your own blood to support healing and collagen in skin or scalp. We use refined processing and fine cannulas or microneedling for delivery. Sessions are 45–60 minutes.',
      differences: [
        'Customized spin times for platelet yield and purity',
        'Choice of microneedling vs cannula based on target',
      ],
      faqs: [
        fq('How many sessions?', 'Usually 3 spaced a month apart, then maintenance.'),
        fq('Downtime?', 'Redness 24–48 hours if microneedled; scalp is minimal.'),
        fq('Safe with filler/tox?', 'Yes—sequenced properly by your provider.'),
        fq('When are results visible?', 'Skin glow in weeks; hair requires 3–6 months.'),
        fq('Pain level?', 'Topicals and fine needles make it very tolerable.'),
        fq('Add-ons?', 'Often paired with SkinPen or Morpheus8 for synergy.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'PRP leverages your growth factors to improve texture, luminosity, and hair density. Delivery is customized to your goals. Appointments run 45–60 minutes.',
      differences: [
        'High-yield protocols for consistent concentration',
        'Targeted passes for crepey under-eyes or thinning temples',
      ],
      faqs: [
        fq('Series?', 'Plan 3 initial sessions, then 2–3 times/year as needed.'),
        fq('Any prep?', 'Hydrate well and avoid NSAIDs 24–48 hours unless prescribed.'),
        fq('Microneedling or injections?', 'We’ll choose based on area and downtime tolerance.'),
        fq('Combine with exosomes?', 'Discuss options; we’ll align on safety and evidence.'),
        fq('Scalp sensitivity?', 'Mild; numbing and vibration tools help.'),
        fq('Sun limits?', 'Standard sun care; avoid heat for the rest of the day.'),
      ],
    },
  },

  // ===========================
  // MICRONEEDLING – SKINPEN
  // ===========================
  skinpen: {
    westfield: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'SkinPen microneedling creates micro-channels to stimulate collagen for smoother texture and refined pores. It’s a reliable reset with minimal downtime. Sessions take ~45 minutes.',
      differences: [
        'Depth mapping by zone to respect thin vs thicker skin',
        'Optional growth-factor infusion for added glow',
      ],
      faqs: [
        fq('Downtime?', 'Redness 24–48 hours; makeup after 24 hours if skin allows.'),
        fq('Series needed?', 'Often 3 sessions a month apart, then maintenance.'),
        fq('Good for acne scars?', 'Helps shallow rolling scars; we’ll assess severity.'),
        fq('Pain?', 'Topical numbing makes it comfortable.'),
        fq('Sun?', 'Strict SPF; avoid heat/sauna for 24–48 hours.'),
        fq('Combine with PRP?', 'Popular combo to amplify results.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'This controlled micro-injury remodels collagen for improved tone and texture with light downtime. Expect a rosy glow as skin renews. Appointments are about 45 minutes.',
      differences: [
        'Feathered passes at borders to avoid demarcation lines',
        'Tailored serum layering for barrier support',
      ],
      faqs: [
        fq('When do I see change?', 'Glow within a week; texture over 4–6 weeks.'),
        fq('Safe for darker tones?', 'Yes—customized settings minimize PIH risk.'),
        fq('Peeling?', 'Mild flaking day 3–4 is common.'),
        fq('Skincare after?', 'Gentle cleanse + bland moisturizer; pause actives for ~5 days.'),
        fq('Can I work out?', 'Wait 24 hours to reduce inflammation.'),
        fq('Numbing used?', 'Yes, for comfort.'),
      ],
    },
  },

  // ===========================
  // RF MICRONEEDLING – MORPHEUS8
  // ===========================
  morpheus8: {
    westfield: {
      exists: true,
      durationText: 'Typically 60–75 minutes',
      description:
        'Morpheus8 combines microneedling with radiofrequency to tighten and smooth skin. It targets laxity, texture, and acne scarring with measurable firmness. Sessions take 60–75 minutes including numbing.',
      differences: [
        'Energy stacking plan based on skin thickness and laxity',
        'Edge feathering to avoid “square mask” look',
      ],
      faqs: [
        fq('How many sessions?', 'Commonly 2–3 spaced 4–6 weeks apart.'),
        fq('Downtime?', 'Redness/swelling 2–4 days; makeup after ~48 hours.'),
        fq('Pain level?', 'Topical + advanced comfort techniques used.'),
        fq('Safe for neck/jaw?', 'Yes—protocols tailored per zone.'),
        fq('Results timing?', 'Notice tightening in 4–6 weeks; continues for months.'),
        fq('Pairs well with?', 'Sculptra or Opus for texture and lift synergy.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 60–75 minutes',
      description:
        'RF microneedling remodels collagen for firmer, tighter skin and softened scars. We sequence energy safely to protect the barrier. Visits are 60–75 minutes including numbing.',
      differences: [
        'Heat-budgeted passes to reduce PIH risk',
        'Custom needle depth by zone for comfort and efficacy',
      ],
      faqs: [
        fq('Is it good for pores?', 'Yes—noticeably refines pore look as collagen rebuilds.'),
        fq('Series?', 'Plan on 2–3 sessions; maintenance yearly.'),
        fq('Makeup after?', 'Usually after 48 hours if skin looks calm.'),
        fq('Exercise?', 'Skip 24 hours to limit heat and swelling.'),
        fq('Any peeling?', 'Mild flaking is normal days 2–4.'),
        fq('Who’s not a candidate?', 'Active acne flares or infections—let us treat first.'),
      ],
    },
  },

  // ===========================
  // FRACTIONAL RF – OPUS
  // ===========================
  opus: {
    westfield: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'Opus fractional RF brightens and smooths with less downtime than traditional lasers. Great for crepey areas and etched lines. Sessions usually take 45–60 minutes.',
      differences: [
        'Densities adjusted per zone for even glow without over-treating',
        'Perioral/periocular finesse for etched lines',
      ],
      faqs: [
        fq('Downtime?', 'Pinkness 1–3 days; sandpaper feel for ~5–7 days.'),
        fq('Series?', 'Often 2–3 sessions for best results.'),
        fq('Good for eyelids?', 'Yes—careful settings improve crepiness.'),
        fq('Pain?', 'Numbing + air cooling for comfort.'),
        fq('When to expect glow?', 'Initial glow in a week; collagen over 4–8 weeks.'),
        fq('Combos?', 'Pairs well with tox/filler for comprehensive refresh.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'This fractional radiofrequency treatment refines texture and tone with efficient recovery. It’s ideal for delicate skin zones. Appointments are typically 45–60 minutes.',
      differences: [
        'Feathered edges to avoid demarcation on the cheeks',
        'Parameter mapping for thin eyelid skin',
      ],
      faqs: [
        fq('Makeup after?', 'Usually after 24 hours if redness is mild.'),
        fq('Sun rules?', 'Diligent SPF; avoid intense sun for 1–2 weeks.'),
        fq('Peeling?', 'Flaking is light and short-lived.'),
        fq('How many?', 'Plan 2–3 sessions; maintenance as desired.'),
        fq('Sensitive skin?', 'We can throttle energy to stay gentle.'),
        fq('Treats acne scars?', 'Improves shallow/boxcar scars; deeper scars may need combo care.'),
      ],
    },
  },

  // ===========================
  // IPL
  // ===========================
  ipl: {
    westfield: {
      exists: true,
      durationText: 'Typically 30–45 minutes',
      description:
        'IPL targets sun spots, redness, and uneven tone with pulses of broad-spectrum light. Expect clearer, brighter skin over a short series. Treatments take ~30–45 minutes.',
      differences: [
        'Pulse stacking for resistant pigment',
        'Vascular settings tuned to reduce flush with minimal downtime',
      ],
      faqs: [
        fq('Will spots darken?', 'Yes, they “pepper” and flake off over ~7–10 days.'),
        fq('Series needed?', 'Usually 3 sessions a month apart.'),
        fq('Tanned skin?', 'We avoid recent tanning to reduce risk.'),
        fq('Pain?', 'Snappy but quick; cooling helps.'),
        fq('Aftercare?', 'SPF strict; avoid heat for 24 hours.'),
        fq('Rosacea help?', 'Can reduce redness and flushing frequency.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30–45 minutes',
      description:
        'Photofacial clears brown and red discoloration for a more even canvas. We tailor energy to your tone and targets. Sessions are 30–45 minutes.',
      differences: [
        'Gentle “test lanes” on first visit to profile response',
        'Custom vessel vs pigment passes for efficiency',
      ],
      faqs: [
        fq('Makeup after?', 'Usually next day if skin is calm.'),
        fq('Sun exposure?', 'Be diligent with SPF; avoid tanning during series.'),
        fq('Neck/chest?', 'Great areas to include—ask about combo pricing.'),
        fq('Peeling?', 'Dark flecks lift off naturally; no picking.'),
        fq('Acne marks?', 'Helps brown marks; active acne needs a different plan too.'),
        fq('Sensitive skin?', 'We throttle energy and spot-test as needed.'),
      ],
    },
  },

  // ===========================
  // CLEARLIFT (Q-SWITCHED)
  // ===========================
  clearlift: {
    westfield: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'ClearLift is a gentle, no-downtime laser for tone, mild texture, and early laxity. It’s a fast “lunchtime” refresh. Sessions are about 30 minutes.',
      differences: [
        'Multiple passes to build effect without downtime',
        'Eye-safe periocular techniques for crepiness',
      ],
      faqs: [
        fq('Downtime?', 'None—mild pinkness resolves quickly.'),
        fq('Series?', '3–4 sessions yield best glow.'),
        fq('Pain?', 'Very tolerable—no numbing required.'),
        fq('Good for events?', 'Yes—nice pre-event polish a week prior.'),
        fq('Skin types?', 'Generally safe across tones with adjusted parameters.'),
        fq('Combo ideas?', 'Pairs with facials or tox for refined finish.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'This low-downtime laser brightens and subtly tightens, ideal for maintenance between bigger treatments. Appointments last ~30 minutes.',
      differences: [
        'Feathered jawline passes to improve light scatter',
        'Parameter stepping to limit heat buildup',
      ],
      faqs: [
        fq('Makeup right after?', 'Yes, if skin is calm.'),
        fq('How many?', 'Plan 3–4 initially; maintain every 2–3 months.'),
        fq('Any peeling?', 'Minimal to none.'),
        fq('Safe around eyes?', 'Yes with eye shields and conservative settings.'),
        fq('Redness?', 'Usually fades within hours.'),
        fq('Sensitive skin?', 'We can dial down energy to stay gentle.'),
      ],
    },
  },

  // ===========================
  // CLEARSKIN (ACNE LASER) – *Not in Carmel*
  // ===========================
  clearskin: {
    westfield: {
      exists: true,
      durationText: 'Typically 30–40 minutes',
      description:
        'ClearSkin targets acne bacteria and oil while calming redness, helping active breakouts and residual marks. Sessions run 30–40 minutes with minimal downtime.',
      differences: [
        'Pulse sequencing for active vs healing lesions',
        'Cooling passes to reduce post-treatment redness',
      ],
      faqs: [
        fq('How many sessions?', 'Usually 4–6 spaced 2 weeks apart.'),
        fq('Safe with topicals?', 'We’ll guide timing with retinoids/benzoyl peroxide.'),
        fq('For acne scars?', 'Helps redness; deeper scars need RF or microneedling too.'),
        fq('Downtime?', 'Low—mild pinkness only.'),
        fq('Sun care?', 'Strict SPF enhances results and safety.'),
        fq('Teen-friendly?', 'Yes—with guardian consent and good home care.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // CO2 (ABLATIVE/FRAX) – *Not in Carmel*
  // ===========================
  co2: {
    westfield: {
      exists: true,
      durationText: 'Typically 60–90 minutes',
      description:
        'CO₂ resurfacing treats etched lines, scars, and texture with the most dramatic single-session change we offer. Expect real downtime with transformative results. Sessions are 60–90 minutes including numbing.',
      differences: [
        'Conservative first-time density to balance outcome and downtime',
        'Perioral/periocular focus where lines etch first',
      ],
      faqs: [
        fq('Downtime?', 'Plan 7–10 days of crusting/peel; pinkness can persist for weeks.'),
        fq('Pain?', 'Numbing + cooling + detailed aftercare minimize discomfort.'),
        fq('How many?', 'Often one strong session, sometimes a second at 3–6 months.'),
        fq('Makeup timing?', 'Usually 10–14 days when skin re-epithelializes.'),
        fq('Sun rules?', 'Strict SPF; avoid direct sun for several weeks.'),
        fq('Best candidates?', 'Etched lines, scars, and significant texture change goals.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // LASER HAIR REMOVAL
  // ===========================
  'laser-hair-removal': {
    westfield: {
      exists: true,
      durationText: 'Typically 20–45 minutes',
      description:
        'Laser hair removal disables follicles to reduce regrowth for smoother, low-maintenance skin. We modulate fluence and pulse width for comfort and efficacy. Most areas take 20–45 minutes.',
      differences: [
        'Skin-type matched wavelengths and pulse widths',
        'Overlap mapping to reduce missed strips',
      ],
      faqs: [
        fq('How many sessions?', 'Usually 6–8 with 4–8 week spacing.'),
        fq('Shave or grow hair?', 'Shave 24 hours before; no waxing/tweezing between.'),
        fq('Works on light hair?', 'Dark hair responds best; very light/gray is limited.'),
        fq('Pain?', 'Snappy but brief; cooling helps a lot.'),
        fq('Sun rules?', 'Avoid tanning; SPF daily on treated areas.'),
        fq('Maintenance?', 'Some need yearly touch-ups due to hormones/cycles.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 20–45 minutes',
      description:
        'We target active follicles to steadily reduce regrowth for long-term smoothness. Settings are personalized to your hair and skin type. Sessions run 20–45 minutes depending on area.',
      differences: [
        'Test patches at first visit for precise settings',
        'High-coverage grids to limit “skip” lines',
      ],
      faqs: [
        fq('Any prep?', 'Close shave the day before; skip self-tanner and sun.'),
        fq('How spaced?', 'Every 4–8 weeks based on area and growth cycles.'),
        fq('Ingrowns?', 'Often improve significantly with a series.'),
        fq('Safe for darker skin?', 'Yes—parameters adjusted for safety.'),
        fq('Aftercare?', 'Cool compress if tender; SPF daily.'),
        fq('When do I see reduction?', 'Usually after 2–3 sessions it’s noticeable.'),
      ],
    },
  },

  // ===========================
  // HYDRAFACIAL – *Not in Carmel*
  // ===========================
  hydrafacial: {
    westfield: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'HydraFacial cleanses, extracts, and infuses skin for immediate glow with zero downtime. It’s the perfect pre-event refresh. Sessions take ~45 minutes.',
      differences: [
        'Booster customization for pigment, pores, or hydration',
        'Neck/chest add-ons for uniform glow',
      ],
      faqs: [
        fq('Safe for sensitive skin?', 'Yes—customized to stay gentle.'),
        fq('Any peeling?', 'Usually none; occasional light flaking.'),
        fq('Makeup after?', 'You can—many prefer to enjoy the glow bare.'),
        fq('How often?', 'Monthly or seasonally for maintenance.'),
        fq('Extracts blackheads?', 'Yes—vacuum extractions are part of it.'),
        fq('Good with events?', 'Excellent same-week polish.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // Glo2Facial
  // ===========================
  glo2facial: {
    westfield: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'Glo2Facial oxygenates and infuses actives for bright, bouncy skin with no downtime. It’s a highly customizable facial. Sessions are ~45 minutes.',
      differences: [
        'Active capsules chosen by skin goal (glow, clarify, calm)',
        'Neck add-on encouraged for photo-ready finish',
      ],
      faqs: [
        fq('Safe for pregnancy?', 'Many steps are; we’ll adjust products appropriately.'),
        fq('Breakout-prone?', 'We’ll select clarifying actives and keep it gentle.'),
        fq('Redness?', 'Usually minimal and short-lived.'),
        fq('Series or single?', 'Great single or monthly maintenance.'),
        fq('Aftercare?', 'Simple hydrate/SPF; pause strong actives 24 hours.'),
        fq('Combine with tox?', 'Yes—same day is fine with sequencing.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 45 minutes',
      description:
        'This oxygenating facial brightens tone and restores bounce with zero downtime. We adapt the active blend to your skin that day. Appointments take ~45 minutes.',
      differences: [
        'Barrier-friendly protocols for reactive skin',
        'Optional eye focus to de-puff and smooth',
      ],
      faqs: [
        fq('Any peeling?', 'No—skin feels clean and hydrated afterwards.'),
        fq('Good before photos?', 'Yes—glow is immediate.'),
        fq('Actives too strong?', 'We modulate them gently for sensitivity.'),
        fq('How often?', 'Monthly or as needed pre-events.'),
        fq('Massage included?', 'Yes—lymphatic techniques are included.'),
        fq('Makeup after?', 'You can apply right away if you choose.'),
      ],
    },
  },

  // ===========================
  // SIGNATURE FACIALS / PEELS / MICROPEELS
  // ===========================
  facials: {
    westfield: {
      exists: true,
      durationText: 'Typically 50–60 minutes',
      description:
        'Custom facials cleanse, exfoliate, and nourish for a clearer, brighter complexion. Each session adapts to your current skin needs. Most take 50–60 minutes.',
      differences: [
        'Goal-based protocol (clarify, hydrate, brighten)',
        'Neck/decolletage blending for even tone',
      ],
      faqs: [
        fq('Downtime?', 'None; mild pinkness fades quickly.'),
        fq('Extractions?', 'As needed with gentle technique.'),
        fq('Pregnancy safe?', 'Yes—products are adjusted.'),
        fq('How often?', 'Every 4–6 weeks for maintenance.'),
        fq('Combine with dermaplane?', 'Common add-on for smooth makeup lay.'),
        fq('Tips after?', 'Hydrate, SPF, and pause strong actives 1–2 days.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 50–60 minutes',
      description:
        'Our adaptive facials refine texture and restore hydration with zero downtime. Expect a clean, calm glow. Sessions last 50–60 minutes.',
      differences: [
        'Massage emphasis for lymphatic de-puffing',
        'Seasonal mask rotation to match skin needs',
      ],
      faqs: [
        fq('Breakout-safe?', 'Yes—protocol changes if you’re flaring.'),
        fq('Redness?', 'Usually minimal and short-lived.'),
        fq('Series?', 'Monthly is ideal for consistent results.'),
        fq('Teens?', 'Yes—education-forward and gentle.'),
        fq('Event timing?', 'Within the same week is perfect.'),
        fq('Aftercare?', 'Hydrate + SPF; avoid sauna same day.'),
      ],
    },
  },
  peels: {
    westfield: {
      exists: true,
      durationText: 'Typically 30–40 minutes',
      description:
        'Chemical peels brighten, smooth, and even tone with adjustable strength. We match acids to your skin and downtime tolerance. Sessions take 30–40 minutes.',
      differences: [
        'Layered application for even frosting',
        'Post-peel plan to protect barrier while you shed',
      ],
      faqs: [
        fq('Will I peel?', 'Light to moderate flaking is common for a few days.'),
        fq('Series?', 'Often 3 peels spaced 4 weeks apart.'),
        fq('Safe for darker skin?', 'Yes—careful acid choice minimizes PIH risk.'),
        fq('Actives after?', 'Pause retinoids/acids ~5–7 days.'),
        fq('Sun rules?', 'SPF daily; avoid intense sun for 1–2 weeks.'),
        fq('Tingle/burn?', 'Short-lived; we neutralize promptly.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30–40 minutes',
      description:
        'We use modern peel systems to lift dullness and refine texture with predictable shedding. Strength is tailored to the event calendar. Appointments are 30–40 minutes.',
      differences: [
        'Spot-peel technique for pigment/breakout zones',
        'Barrier-first aftercare kit recommendations',
      ],
      faqs: [
        fq('Redness time?', 'Usually hours; peeling days 2–5.'),
        fq('Makeup?', 'Light/mineral if needed; avoid heavy friction.'),
        fq('Sting level?', 'Brief; fans and cool compress reduce it.'),
        fq('How many?', 'Plan a short series for best results.'),
        fq('Acne-prone?', 'We can steer toward salicylic/mandelic blends.'),
        fq('When to schedule?', '2 weeks before important events.'),
      ],
    },
  },
  micropeels: 'peels',

  // ===========================
  // MASSAGE
  // ===========================
  massage: {
    westfield: {
      exists: true,
      durationText: 'Typically 60 minutes',
      description:
        'A focused, therapeutic massage that blends relaxation with targeted muscle work. Pressure is adjusted to your preference. Standard sessions are 60 minutes.',
      differences: [
        'Goal-based intake (mobility, stress, recovery)',
        'Add-on focus for neck/shoulders or low back',
      ],
      faqs: [
        fq('60 or 90 minutes?', 'Choose 60 for general relief; 90 for deeper focus.'),
        fq('Deep tissue available?', 'Yes—pressure is adjustable.'),
        fq('Soreness after?', 'Mild soreness can occur and resolves quickly.'),
        fq('Combine with sauna?', 'Great combo—sauna after the massage feels amazing.'),
        fq('Tipping?', 'Optional and appreciated; not required.'),
        fq('Prenatal?', 'Yes—with trimester-appropriate positioning.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 60 minutes',
      description:
        'Therapeutic bodywork customized for relaxation or recovery. Techniques vary by your goals each visit. A standard session is 60 minutes.',
      differences: [
        'Breath-paced flow to calm the nervous system',
        'Targeted mobility techniques for desk-strain',
      ],
      faqs: [
        fq('Focus areas?', 'We’ll prioritize 1–2 zones for meaningful results.'),
        fq('Pressure level?', 'Fully customized—from gentle to deep.'),
        fq('Hot towels?', 'Available by request.'),
        fq('Stretching included?', 'Yes—if desired and appropriate.'),
        fq('Aftercare?', 'Hydrate and gentle movement are recommended.'),
        fq('Bundle options?', 'Ask about packages for regular care.'),
      ],
    },
  },

  // ===========================
  // SAUNA / SALT – *Not in Carmel*
  // ===========================
  'salt-sauna': {
    westfield: {
      exists: true,
      durationText: 'Typically 25–40 minutes',
      description:
        'Infrared sauna and salt booth support relaxation and recovery. Sessions are short, restorative, and easy to stack with other services. Most are 25–40 minutes.',
      differences: [
        'Temperature ramping for comfort',
        'Optional breath-work focus to deepen relaxation',
      ],
      faqs: [
        fq('Shower needed?', 'Not required—wiping down is plenty.'),
        fq('Hydration?', 'Drink water before/after to feel your best.'),
        fq('Contraindications?', 'We’ll screen for heat sensitivity and medical devices.'),
        fq('How often?', '1–3 times/week based on goals.'),
        fq('Combine with massage?', 'Yes—great before or after.'),
        fq('What to wear?', 'Light clothing; we provide towels.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // BODY CONTOUR – EVOLVEX  *Not in Carmel*
  // ===========================
  evolvex: {
    westfield: {
      exists: true,
      durationText: 'Typically 45–60 minutes',
      description:
        'EvolveX combines RF energy and muscle stimulation to tighten skin and tone. It’s non-invasive and series-based. Sessions are 45–60 minutes.',
      differences: [
        'Zone-stacking plan for abdomen/flanks',
        'Comfort-titrated settings for consistency',
      ],
      faqs: [
        fq('How many sessions?', 'Usually 6–8 weekly sessions.'),
        fq('Downtime?', 'Minimal—mild soreness like a workout.'),
        fq('Pain?', 'Tingling/muscle contraction sensation—very tolerable.'),
        fq('Results timing?', 'Toning within weeks; tightening over months.'),
        fq('Best candidates?', 'Mild laxity and tone goals; not a weight-loss tool.'),
        fq('Maintain?', 'Periodic touch-ups keep results longer.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // VASCULAR – VASCUPEN  *Not in Carmel*
  // ===========================
  vascupen: {
    westfield: {
      exists: true,
      durationText: 'Typically 20–30 minutes',
      description:
        'Targeted vascular treatment for small facial veins and redness. It’s quick with minimal downtime. Sessions are ~20–30 minutes.',
      differences: [
        'Spot targeting to avoid diffuse heat',
        'Layered passes for persistent vessels',
      ],
      faqs: [
        fq('Downtime?', 'Mild redness; occasional tiny scabs that self-resolve.'),
        fq('How many?', 'Often 1–3 sessions depending on vessel size.'),
        fq('Sun rules?', 'SPF daily; avoid tanning during series.'),
        fq('Pain?', 'Snappy but brief; cooling helps.'),
        fq('Safe for nose vessels?', 'Yes—carefully targeted.'),
        fq('Combine with IPL?', 'Often paired for diffuse redness.'),
      ],
    },
    carmel: { exists: false },
  },

  // ===========================
  // SKIN IQ (ASSESSMENT)
  // ===========================
  'skin-iq': {
    westfield: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'A quick, structured skin consult to pinpoint priorities and build an efficient plan. Expect product simplification and treatment sequencing. Typically 30 minutes.',
      differences: [
        'Evidence-based product curation (fewer, better)',
        'Phased treatment roadmap by season',
      ],
      faqs: [
        fq('Bring products?', 'Yes—photos or a list help us streamline.'),
        fq('Same-day treatment?', 'Often possible for gentle options.'),
        fq('Budget friendly?', 'We build stepped plans that scale.'),
        fq('Photos?', 'Yes—progress tracking included.'),
        fq('Teen-appropriate?', 'Absolutely—simple, sustainable routines.'),
        fq('Follow-up?', 'We like a 6–8 week check-in.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'This strategy session clarifies what matters most for your skin right now. We align home care and treatments to your goals. Appointments are ~30 minutes.',
      differences: [
        'Sensitivity-aware routine building',
        'Clear “do this, skip that” next steps',
      ],
      faqs: [
        fq('Product conflicts?', 'We’ll remove duplicates and ingredient clashes.'),
        fq('Actives timing?', 'We’ll set AM/PM cadence that fits your life.'),
        fq('Treatments first?', 'We prioritize high-impact steps and timing.'),
        fq('Pregnancy safe?', 'We’ll tailor around all restrictions.'),
        fq('How soon to recheck?', '6–8 weeks is ideal to refine.'),
        fq('Can we keep it minimal?', 'Absolutely—simple plans are often best.'),
      ],
    },
  },

  // ===========================
  // CATCH-ALL / CATEGORY PAGES
  // ===========================
  injectables: {
    westfield: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'From wrinkle relaxers to fillers, injectables refresh features with natural-looking results. We map dosing and placement for balance and harmony. Duration varies by service.',
      differences: [
        '“Natural first” philosophy—movement and contours matter',
        'Phased planning to keep results believable',
      ],
      faqs: [
        fq('Will it look obvious?', 'Our goal is refined and undetectable.'),
        fq('Same-day?', 'Often possible after consultation.'),
        fq('Downtime?', 'Usually minimal—plan ahead for filler swelling.'),
        fq('Pain?', 'Topicals and tiny needles keep it tolerable.'),
        fq('How long do results last?', 'Months to years depending on modality.'),
        fq('Cost transparency?', 'You’ll have a clear plan and pricing.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'We use modern injectables to enhance features without changing your character. Plans are personalized to your expressions and goals. Duration varies by service.',
      differences: [
        'Micro-dosing and structural support over bulk',
        'Safety-forward techniques for sensitive zones',
      ],
      faqs: [
        fq('Touch-ups?', 'We recheck in ~2 weeks and refine as needed.'),
        fq('Numbing?', 'Available and commonly used.'),
        fq('Event timing?', 'Book tox 2 weeks, filler 3–4 weeks before events.'),
        fq('Bruising risk?', 'Possible—plan buffers around big events.'),
        fq('Can I combine services?', 'Yes—often more efficient.'),
        fq('Who treats me?', 'Experienced, licensed providers only.'),
      ],
    },
  },
  lasers: {
    westfield: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'Laser and energy devices treat tone, texture, vessels, and laxity with tailored parameters. We match tech to goals and downtime tolerance. Duration varies by treatment.',
      differences: [
        'Device-agnostic matching to the goal',
        'Edge feathering to ensure seamless blending',
      ],
      faqs: [
        fq('Downtime range?', 'From none (ClearLift) to 7–10 days (CO₂).'),
        fq('Safe for my tone?', 'We adjust to your skin type for safety.'),
        fq('Series vs single?', 'Some are single hits; many work best in a series.'),
        fq('Pain?', 'Numbing/cooling as needed.'),
        fq('Sun rules?', 'SPF daily; avoid tanning during series.'),
        fq('Combos?', 'Often paired for faster overall change.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'Energy-based treatments refine tone, texture, and tightness with personalized settings. We plan to your timeline and comfort. Duration varies by treatment.',
      differences: [
        'Test patches for parameter confidence',
        'Barrier-first aftercare to protect glow',
      ],
      faqs: [
        fq('Which device is right?', 'We’ll choose based on your goals, timeline, and skin type.'),
        fq('Makeup after?', 'Depends on modality—often 24–48 hours.'),
        fq('Peeling?', 'Light flaking to full peel depending on treatment.'),
        fq('How many?', 'We’ll outline a realistic plan at consult.'),
        fq('Sensitive skin?', 'We throttle energy and space sessions appropriately.'),
        fq('Scars?', 'Specific protocols target texture safely.'),
      ],
    },
  },
  consultations: {
    westfield: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'A focused aesthetic consult to clarify goals and outline a smart, phased plan. We cover options, timelines, and cost. Typically 30 minutes.',
      differences: [
        'Impact-first sequencing to respect budget and time',
        'Clear home-care + in-clinic roadmap',
      ],
      faqs: [
        fq('Same-day treatment?', 'Often yes for low-downtime options.'),
        fq('Cost?', 'Consults are often credited—ask your provider.'),
        fq('Photos?', 'Yes—progress matters.'),
        fq('Medical history?', 'Bring meds/allergies for safety.'),
        fq('Event timing?', 'We’ll back-plan from your date.'),
        fq('Can I bring ideas?', 'Always—your inspo helps alignment.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Typically 30 minutes',
      description:
        'We translate your aesthetic goals into a practical plan with honest timelines and options. Expect clarity and next steps. Sessions are ~30 minutes.',
      differences: [
        'Expectation setting with before/afters',
        'Blend of quick wins + long-game changes',
      ],
      faqs: [
        fq('Same-day?', 'Often possible for consult-friendly services.'),
        fq('Pricing?', 'Transparent quote for each step.'),
        fq('Contraindications?', 'We’ll review for safety.'),
        fq('Skincare plan too?', 'Yes—home care supports results.'),
        fq('Follow-up?', 'We’ll schedule check-ins as needed.'),
        fq('Photos allowed?', 'Yes—we encourage progress tracking.'),
      ],
    },
  },
  men: {
    westfield: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'Subtle, masculine refinement across injectables, facials, and energy-based care. We respect natural contours and hair patterns. Duration varies by service.',
      differences: [
        'Male brow/cheek/jaw proportions respected',
        'Beard-aware techniques for natural outcomes',
      ],
      faqs: [
        fq('Will it look obvious?', 'No—we keep it undetectable.'),
        fq('Downtime?', 'Most options have little to none.'),
        fq('Shaving and treatments?', 'We’ll plan around your routine.'),
        fq('Hairline and tox?', 'Strategic dosing preserves lift without shine.'),
        fq('Sweat control?', 'Tox can help hyperhidrosis—ask us.'),
        fq('Gym timing?', 'Skip heavy workouts for a day post-tox/filler.'),
      ],
    },
    carmel: {
      exists: true,
      durationText: 'Varies by service',
      description:
        'Treatments for men that maintain natural structure while boosting skin quality. Plans are low-maintenance and discreet. Duration varies by service.',
      differences: [
        'Subtle volume with structure (not roundness)',
        'Texture/pores prioritized for a healthy look',
      ],
      faqs: [
        fq('Beard areas?', 'We work around follicles to avoid odd lay.'),
        fq('Event timing?', 'We’ll schedule to avoid downtime conflicts.'),
        fq('Skincare minimalism?', 'We’ll keep routines simple and effective.'),
        fq('Brow position?', 'We avoid feminizing lift; balance is key.'),
        fq('Sun/sport?', 'SPF that actually feels good—no white cast.'),
        fq('Privacy?', 'Always—your goals drive the plan.'),
      ],
    },
  },

  // Aliases / category routes you may have:
  injectables: 'injectables',
  lasers: 'lasers',
  consult: 'consultations',
  'tox-consult': 'consultations',
};

/** expand string references (aliases) to actual objects */
Object.keys(OVERRIDES).forEach((k) => {
  const v = OVERRIDES[k];
  if (typeof v === 'string') OVERRIDES[k] = OVERRIDES[v];
});

/** Fallback generator if no override is present */
function defaultContent({ service, cityKey }) {
  const loc = getLocation(cityKey);
  const name = service?.name || 'Service';
  const exists = true;

  return {
    exists,
    durationText: 'Typically 30–60 minutes',
    description: `${name} delivers noticeable refresh with a focus on natural results and low downtime. We tailor technique and sequencing to your goals for reliable, repeatable outcomes.`,
    differences: ['Personalized plan and conservative first dose/pass', 'Emphasis on natural, you-forward results'],
    faqs: [
      fq('Downtime?', 'Usually minimal; your provider will review specifics.'),
      fq('How many sessions?', 'Varies by modality—often a short series then maintenance.'),
      fq('Safe for my skin type?', 'Yes—parameters and products are adjusted as needed.'),
      fq('When will I see results?', 'Some changes are immediate; others build over weeks.'),
      fq('Can I combine treatments?', 'Often yes; sequencing improves efficiency.'),
      fq('Prep/aftercare?', 'We’ll outline simple, effective steps for best results.'),
    ],
    complementary: service?.relatedServices?.slice(0, 3)?.map(rs => ({ href: rs.href, label: rs.name })) || [],
  };
}

export function getLocationContent({ service, cityKey }) {
  const slug = String(service?.slug || '').toLowerCase();
  const override = OVERRIDES[slug]?.[cityKey];
  if (override) return override;
  return defaultContent({ service, cityKey });
}
