#!/usr/bin/env node
// scripts/seed-location-seo.mjs
// Populates cms_location_overrides with unique, SEO-rich descriptions
// targeting top local search keywords per service × location.
//
// Run: node scripts/seed-location-seo.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Load .env.local ──
function loadEnv() {
  try {
    const envPath = resolve(root, '.env.local');
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Location metadata ──
const LOCATIONS = {
  westfield: {
    city: 'Westfield',
    state: 'IN',
    zip: '46074',
    address: '514 E State Road 32, Westfield, IN 46074',
    neighborhoods: ['Grand Park', 'Bridgewater', 'Chatham Hills', 'Downtown Westfield'],
    nearby: ['Carmel', 'Noblesville', 'Fishers', 'Zionsville'],
    landmarks: ['Grand Park', 'Monon Trail'],
    hours: 'Mon–Wed, Fri 9am–5pm · Thu 9am–7pm · Sat 9am–3pm',
    note: 'off US-32 near Birdies',
  },
  carmel: {
    city: 'Carmel',
    state: 'IN',
    zip: '46280',
    address: '10485 N Pennsylvania St, Suite 150, Carmel, IN 46280',
    neighborhoods: ['Arts & Design District', 'Midtown', 'Downtown Carmel', 'Home Place'],
    nearby: ['Westfield', 'Fishers', 'Zionsville', 'Indianapolis'],
    landmarks: ['Monon Trail', 'Carmel City Center'],
    hours: 'Mon–Fri 9am–5pm',
    note: 'south Carmel off US-31 & 106th Street',
  },
};

// ── Service-specific copy data ──
// Maps service slugs → { shortName, category, benefit, ideal, recovery, duration }
const SERVICE_COPY = {
  tox: {
    shortName: 'Tox',
    displayName: 'neurotoxin treatments',
    category: 'injectable',
    benefit: 'smooth forehead lines, crow\'s feet, and frown lines',
    ideal: 'anyone looking to soften expression lines without surgery',
    recovery: 'zero downtime — most patients return to their day immediately',
    duration: '20–30 minutes',
  },
  botox: {
    shortName: 'Botox',
    displayName: 'Botox injections',
    category: 'injectable',
    benefit: 'reduce fine lines and wrinkles for a naturally refreshed look',
    ideal: 'patients wanting the gold-standard neurotoxin with proven, predictable results',
    recovery: 'no downtime — you can return to your routine right away',
    duration: '15–30 minutes',
  },
  dysport: {
    shortName: 'Dysport',
    displayName: 'Dysport injections',
    category: 'injectable',
    benefit: 'soften moderate to severe frown lines with a natural spread',
    ideal: 'patients who prefer a softer, more diffused result across larger treatment areas',
    recovery: 'minimal downtime — resume normal activities the same day',
    duration: '15–20 minutes',
  },
  jeuveau: {
    shortName: 'Jeuveau',
    displayName: 'Jeuveau treatments',
    category: 'injectable',
    benefit: 'smooth frown lines with a modern, purpose-built neurotoxin',
    ideal: 'patients seeking an affordable, effective alternative to traditional tox brands',
    recovery: 'no downtime required',
    duration: '15–20 minutes',
  },
  daxxify: {
    shortName: 'Daxxify',
    displayName: 'Daxxify treatments',
    category: 'injectable',
    benefit: 'enjoy longer-lasting wrinkle reduction — up to 6 months per session',
    ideal: 'patients who want fewer appointments and extended results',
    recovery: 'zero downtime — results develop over 1–2 weeks',
    duration: '15–30 minutes',
  },
  filler: {
    shortName: 'Dermal Filler',
    displayName: 'dermal filler treatments',
    category: 'injectable',
    benefit: 'restore volume, sculpt contours, and smooth deep lines',
    ideal: 'anyone looking to enhance lips, cheeks, jawline, or under-eyes',
    recovery: 'mild swelling for 2–3 days; most patients resume activities immediately',
    duration: '30–60 minutes',
  },
  'facial-balancing': {
    shortName: 'Facial Balancing',
    displayName: 'facial balancing consultations',
    category: 'injectable',
    benefit: 'achieve harmonious proportions using a customized combination of filler and tox',
    ideal: 'patients who want a comprehensive, proportional enhancement rather than treating one area',
    recovery: 'varies by treatment plan — typically minimal downtime',
    duration: '45–60 minute consultation',
  },
  juvederm: {
    shortName: 'Juvéderm',
    displayName: 'Juvéderm filler treatments',
    category: 'injectable',
    benefit: 'add natural-looking volume to lips, cheeks, and jawline',
    ideal: 'patients wanting smooth, long-lasting hyaluronic acid filler results',
    recovery: 'minimal swelling; results are visible immediately',
    duration: '30–45 minutes',
  },
  rha: {
    shortName: 'RHA Filler',
    displayName: 'RHA Collection filler treatments',
    category: 'injectable',
    benefit: 'move naturally with your expressions while maintaining smooth, youthful contours',
    ideal: 'patients who want a dynamic filler designed to flex with facial movement',
    recovery: 'light swelling for 1–2 days; immediate results',
    duration: '30–45 minutes',
  },
  versa: {
    shortName: 'Revanesse Versa',
    displayName: 'Revanesse Versa filler treatments',
    category: 'injectable',
    benefit: 'smooth moderate to severe facial wrinkles and folds with less swelling',
    ideal: 'patients looking for a versatile, low-swelling hyaluronic acid filler',
    recovery: 'minimal swelling — many patients see results immediately',
    duration: '30–45 minutes',
  },
  restylane: {
    shortName: 'Restylane',
    displayName: 'Restylane filler treatments',
    category: 'injectable',
    benefit: 'plump lips, lift cheeks, and smooth wrinkles with a trusted HA filler line',
    ideal: 'patients who want targeted enhancement with a range of formulations for different areas',
    recovery: 'mild swelling for 1–3 days; results visible immediately',
    duration: '30–45 minutes',
  },
  sculptra: {
    shortName: 'Sculptra',
    displayName: 'Sculptra treatments',
    category: 'injectable',
    benefit: 'stimulate your body\'s own collagen for gradual, long-lasting volume restoration',
    ideal: 'patients seeking a subtle, building result that can last up to two years',
    recovery: 'mild tenderness; massage the area for 5 minutes, 5 times a day, for 5 days',
    duration: '30–45 minutes',
  },
  prp: {
    shortName: 'PRP',
    displayName: 'PRP injection treatments',
    category: 'injectable',
    benefit: 'harness your body\'s own growth factors to rejuvenate skin and stimulate healing',
    ideal: 'patients interested in natural, autologous regenerative treatments for skin and hair',
    recovery: 'mild redness for 24–48 hours; no major downtime',
    duration: '45–60 minutes',
  },
  facials: {
    shortName: 'Facials',
    displayName: 'signature facial treatments',
    category: 'facial',
    benefit: 'deeply cleanse, hydrate, and revitalize your skin with medical-grade products',
    ideal: 'anyone wanting a customized facial experience — from relaxation to targeted skin correction',
    recovery: 'no downtime — your skin glows immediately',
    duration: '45–75 minutes',
  },
  glo2facial: {
    shortName: 'Glo2Facial',
    displayName: 'Glo2Facial treatments',
    category: 'facial',
    benefit: 'oxygenate, exfoliate, and infuse active ingredients for instantly luminous skin',
    ideal: 'patients wanting a next-generation facial with visible results in one session',
    recovery: 'zero downtime — perfect as a lunchtime treatment',
    duration: '45–60 minutes',
  },
  hydrafacial: {
    shortName: 'HydraFacial',
    displayName: 'HydraFacial treatments',
    category: 'facial',
    benefit: 'cleanse, extract, and hydrate skin in one satisfying session',
    ideal: 'all skin types — including sensitive skin — looking for deep cleansing and hydration',
    recovery: 'no downtime; immediate glow',
    duration: '30–60 minutes',
  },
  peels: {
    shortName: 'Chemical Peels',
    displayName: 'chemical peel treatments',
    category: 'facial',
    benefit: 'accelerate cell turnover to reveal smoother, more even-toned skin',
    ideal: 'patients addressing acne scars, hyperpigmentation, fine lines, or dull texture',
    recovery: 'light peeling for 3–7 days; sun protection essential',
    duration: '30–45 minutes',
  },
  massage: {
    shortName: 'Massage',
    displayName: 'massage therapy',
    category: 'wellness',
    benefit: 'release tension, improve circulation, and restore balance to body and mind',
    ideal: 'anyone seeking therapeutic relaxation or targeted muscle relief',
    recovery: 'no downtime — you\'ll leave feeling restored',
    duration: '60–90 minutes',
  },
  evolvex: {
    shortName: 'EvolveX',
    displayName: 'EvolveX body contouring treatments',
    category: 'body',
    benefit: 'simultaneously tone muscle, reduce fat, and tighten skin — hands-free',
    ideal: 'patients wanting non-invasive body sculpting without surgery or downtime',
    recovery: 'no downtime — may feel like an intense workout',
    duration: '30–60 minutes per session',
  },
  'laser-hair-removal': {
    shortName: 'Laser Hair Removal',
    displayName: 'laser hair removal treatments',
    category: 'laser',
    benefit: 'permanently reduce unwanted hair with fast, comfortable laser technology',
    ideal: 'patients tired of shaving, waxing, or plucking — nearly any body area can be treated',
    recovery: 'mild redness for a few hours; resume activities immediately',
    duration: '15–60 minutes depending on area',
  },
  lasers: {
    shortName: 'Laser Treatments',
    displayName: 'advanced laser treatments',
    category: 'laser',
    benefit: 'address pigmentation, texture, redness, and signs of aging with precision light energy',
    ideal: 'patients seeking targeted correction for sun damage, scarring, or uneven skin tone',
    recovery: 'varies by laser — from zero downtime to 5–7 days of healing',
    duration: '20–60 minutes',
  },
  ipl: {
    shortName: 'IPL',
    displayName: 'IPL photofacial treatments',
    category: 'laser',
    benefit: 'reduce sun spots, redness, and broken capillaries with broad-spectrum light',
    ideal: 'patients with sun damage, rosacea, or uneven pigmentation',
    recovery: 'darkened spots may flake off over 7–10 days; minimal downtime',
    duration: '20–30 minutes',
  },
  vascupen: {
    shortName: 'VascuPen',
    displayName: 'VascuPen vascular treatments',
    category: 'laser',
    benefit: 'eliminate spider veins and small vascular lesions with precision RF technology',
    ideal: 'patients bothered by visible veins or cherry angiomas on face or body',
    recovery: 'minimal — treated areas may be slightly red for a day',
    duration: '15–30 minutes',
  },
  clearlift: {
    shortName: 'ClearLift',
    displayName: 'ClearLift laser treatments',
    category: 'laser',
    benefit: 'tighten skin and smooth fine lines with a non-ablative fractional laser — no visible downtime',
    ideal: 'patients wanting lunchtime skin tightening without redness or peeling',
    recovery: 'zero visible downtime — return to your day immediately',
    duration: '20–30 minutes',
  },
  clearskin: {
    shortName: 'ClearSkin',
    displayName: 'ClearSkin laser treatments',
    category: 'laser',
    benefit: 'target active acne and reduce breakouts with combined laser and vacuum technology',
    ideal: 'patients with active acne who want a non-invasive alternative to medication',
    recovery: 'no downtime; may see clearing after the first session',
    duration: '20–30 minutes',
  },
  morpheus8: {
    shortName: 'Morpheus8',
    displayName: 'Morpheus8 microneedling RF treatments',
    category: 'laser',
    benefit: 'remodel collagen deep below the surface for firmer, smoother skin and a lifted contour',
    ideal: 'patients addressing skin laxity, acne scars, stretch marks, or jawline definition',
    recovery: '3–5 days of mild redness and swelling; full results develop over 3–6 months',
    duration: '45–60 minutes',
  },
  skinpen: {
    shortName: 'SkinPen',
    displayName: 'SkinPen microneedling treatments',
    category: 'laser',
    benefit: 'stimulate collagen with controlled micro-injuries to improve texture, scars, and pores',
    ideal: 'patients wanting to refine skin texture, minimize pores, or fade acne scars',
    recovery: 'mild redness for 24–72 hours; results build over weeks',
    duration: '30–45 minutes',
  },
  co2: {
    shortName: 'CO₂ Resurfacing',
    displayName: 'CO₂ laser resurfacing treatments',
    category: 'laser',
    benefit: 'dramatically improve deep wrinkles, scars, and sun damage with fractional CO₂ laser',
    ideal: 'patients ready for a transformative result — best for moderate to severe skin concerns',
    recovery: '5–10 days of healing; sun avoidance essential for several weeks',
    duration: '30–60 minutes',
  },
  consultations: {
    shortName: 'Consultations',
    displayName: 'aesthetic consultations',
    category: 'general',
    benefit: 'get personalized recommendations from expert providers — no commitment required',
    ideal: 'first-time patients or anyone exploring their options',
    recovery: 'N/A — consultations are informational',
    duration: '15–30 minutes',
  },
  reveal: {
    shortName: 'REVEAL',
    displayName: 'REVEAL 3D skin analysis',
    category: 'general',
    benefit: 'see beneath the surface with advanced 3D imaging that maps sun damage, pores, and texture',
    ideal: 'patients who want data-driven skincare recommendations',
    recovery: 'N/A — this is a diagnostic session',
    duration: '15–20 minutes',
  },
  dissolving: {
    shortName: 'Filler Dissolving',
    displayName: 'filler dissolving treatments',
    category: 'injectable',
    benefit: 'safely dissolve unwanted or migrated hyaluronic acid filler',
    ideal: 'patients who want to correct overfilled areas or asymmetry from previous filler',
    recovery: 'swelling for 24–48 hours; results visible within days',
    duration: '15–30 minutes',
  },
  saltsauna: {
    shortName: 'Salt Sauna',
    displayName: 'salt sauna sessions',
    category: 'wellness',
    benefit: 'breathe in mineral-rich salt air while enjoying deep infrared heat for total relaxation',
    ideal: 'anyone seeking respiratory relief, detoxification, or stress reduction',
    recovery: 'no downtime — leave feeling rejuvenated',
    duration: '30–45 minutes',
  },
  opus: {
    shortName: 'Opus',
    displayName: 'Opus plasma resurfacing treatments',
    category: 'laser',
    benefit: 'resurface skin with fractional plasma technology for dramatic texture and tone improvement',
    ideal: 'patients with wrinkles, scars, or uneven texture who want significant results',
    recovery: '5–7 days of peeling; full results over 3–6 months',
    duration: '30–45 minutes',
  },
  men: {
    shortName: 'Men\'s Services',
    displayName: 'men\'s aesthetic treatments',
    category: 'general',
    benefit: 'achieve a refreshed, confident look with treatments tailored to masculine features',
    ideal: 'men who want subtle enhancements — from tox to laser to body sculpting',
    recovery: 'varies by treatment; many options have zero downtime',
    duration: 'varies by treatment plan',
  },
  'skin-iq': {
    shortName: 'Skin IQ',
    displayName: 'Skin IQ analysis',
    category: 'general',
    benefit: 'get a comprehensive skin health score with personalized product and treatment recommendations',
    ideal: 'patients beginning their skincare journey or optimizing an existing routine',
    recovery: 'N/A — this is an assessment session',
    duration: '20–30 minutes',
  },
  micropeels: {
    shortName: 'Micropeel',
    displayName: 'micropeel treatments',
    category: 'facial',
    benefit: 'gently exfoliate and brighten skin with a light, refreshing peel',
    ideal: 'patients wanting a quick skin refresh with no downtime',
    recovery: 'no peeling or downtime — perfect for a quick glow-up',
    duration: '20–30 minutes',
  },
  injectables: {
    shortName: 'Injectables',
    displayName: 'injectable treatments',
    category: 'injectable',
    benefit: 'smooth wrinkles, restore volume, and sculpt features with expert-administered injectables',
    ideal: 'patients seeking non-surgical facial rejuvenation — tox, filler, Sculptra, or PRP',
    recovery: 'minimal — most patients return to normal activities immediately',
    duration: '15–60 minutes depending on treatment',
  },
};

// ── SEO description generators ──
// Each service × location gets a unique 3–4 sentence description
// targeting top local keywords.

function generateDescription(slug, locKey) {
  const svc = SERVICE_COPY[slug];
  const loc = LOCATIONS[locKey];
  if (!svc || !loc) return null;

  const { shortName, displayName, benefit, ideal, recovery, duration } = svc;
  const { city, nearby, neighborhoods, address, note } = loc;
  const otherCity = locKey === 'westfield' ? 'Carmel' : 'Westfield';
  const nearbyStr = nearby.slice(0, 3).join(', ');
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];

  // Use multiple template variants for uniqueness between locations
  const templates = {
    westfield: [
      // Template 1 — standard
      () =>
        `Looking for ${displayName} near ${city}? RELUXE Med Spa offers expert ${shortName} treatments at our ${city}, IN location — ${benefit}. ` +
        `Our ${city} studio is conveniently located ${note}, serving patients from ${nearbyStr}, and surrounding Hamilton County communities. ` +
        `${shortName} is ideal for ${ideal}. Sessions typically last ${duration} with ${recovery}. ` +
        `Schedule your ${shortName} appointment at RELUXE ${city} today and experience the difference that expert providers and a luxury environment make.`,

      // Template 2 — neighborhood focus
      () =>
        `RELUXE Med Spa in ${city}, Indiana is your destination for premium ${displayName} in Hamilton County. ` +
        `Whether you\'re near ${neighborhood} or anywhere in the ${city} area, our expert providers ${benefit} using the latest techniques and technology. ` +
        `Each ${shortName} session runs approximately ${duration}, and most patients enjoy ${recovery}. ` +
        `${shortName} at RELUXE ${city} is perfect for ${ideal}. Book a complimentary consultation at ${address}.`,

      // Template 3 — benefits-first
      () =>
        `${shortName} at RELUXE ${city} helps you ${benefit} — all in a relaxing, elevated med spa environment. ` +
        `Our ${city}, IN location is just minutes from ${nearbyStr} and easy to reach ${note}. ` +
        `Ideal for ${ideal}, each appointment takes about ${duration}. Expect ${recovery}. ` +
        `Discover why patients across central Indiana choose RELUXE for ${displayName} near ${city}.`,
    ],
    carmel: [
      // Template 1 — standard
      () =>
        `Searching for ${displayName} near ${city}? RELUXE Med Spa\'s ${city}, IN studio brings expert ${shortName} treatments to the heart of Hamilton County — ${benefit}. ` +
        `Located in ${note}, we serve patients from ${nearbyStr}, and the greater Indianapolis area. ` +
        `${shortName} is ideal for ${ideal}. Typical appointments last ${duration} with ${recovery}. ` +
        `Experience ${shortName} at RELUXE ${city} — where elevated aesthetics meet expert care.`,

      // Template 2 — lifestyle
      () =>
        `At RELUXE Med Spa ${city}, we specialize in ${displayName} that deliver real, visible results. ` +
        `Our ${city}, Indiana location near ${neighborhood} makes it easy for patients from ${nearbyStr} to access best-in-class ${shortName} treatments. ` +
        `During your ${duration} session, our providers ${benefit} using advanced techniques tailored to your goals. ` +
        `With ${recovery}, ${shortName} fits seamlessly into your schedule. Visit us at ${address}.`,

      // Template 3 — results-driven
      () =>
        `${shortName} at RELUXE ${city} is designed for ${ideal}. Our ${city}, IN providers ${benefit} with precision and artistry. ` +
        `Conveniently located in ${note}, we\'re just minutes from ${nearbyStr} and the greater central Indiana area. ` +
        `Each session lasts approximately ${duration}, and patients appreciate ${recovery}. ` +
        `Ready for ${displayName} near ${city}? Book your free consultation at RELUXE Med Spa today.`,
    ],
  };

  // Pick a template — use slug hash for deterministic selection
  const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variants = templates[locKey];
  const idx = hash % variants.length;
  return variants[idx]();
}

function generateSeoTitle(slug, locKey) {
  const svc = SERVICE_COPY[slug];
  const loc = LOCATIONS[locKey];
  if (!svc || !loc) return null;
  return `${svc.shortName} in ${loc.city}, IN | RELUXE Med Spa`;
}

function generateSeoDescription(slug, locKey) {
  const svc = SERVICE_COPY[slug];
  const loc = LOCATIONS[locKey];
  if (!svc || !loc) return null;
  const nearby = loc.nearby.slice(0, 2).join(' & ');
  return `Expert ${svc.displayName} at RELUXE Med Spa ${loc.city}, IN. ${svc.shortName} for ${svc.ideal}. Serving ${loc.city}, ${nearby} & Hamilton County. Book free consultation.`;
}

// ── Main ──
async function main() {
  console.log('Fetching services from cms_services...');

  const { data: services, error } = await sb
    .from('cms_services')
    .select('id, slug, name')
    .eq('status', 'published')
    .order('slug');

  if (error) {
    console.error('Failed to fetch services:', error.message);
    process.exit(1);
  }

  console.log(`Found ${services.length} services. Generating location copy...`);

  let updated = 0;
  let skipped = 0;

  for (const svc of services) {
    for (const locKey of ['westfield', 'carmel']) {
      const description = generateDescription(svc.slug, locKey);
      const seoTitle = generateSeoTitle(svc.slug, locKey);
      const seoDescription = generateSeoDescription(svc.slug, locKey);

      if (!description) {
        console.warn(`  ⚠ No copy template for ${svc.slug} — skipping`);
        skipped++;
        continue;
      }

      // Check for existing override
      const { data: existing } = await sb
        .from('cms_location_overrides')
        .select('id, description')
        .eq('service_id', svc.id)
        .eq('location_key', locKey)
        .maybeSingle();

      if (existing) {
        // Update existing row
        const { error: updateErr } = await sb
          .from('cms_location_overrides')
          .update({
            description,
            seo_title: seoTitle,
            seo_description: seoDescription,
          })
          .eq('id', existing.id);

        if (updateErr) {
          console.error(`  ✗ ${svc.slug}/${locKey}: ${updateErr.message}`);
        } else {
          updated++;
        }
      } else {
        // Insert new row
        const { error: insertErr } = await sb
          .from('cms_location_overrides')
          .insert({
            service_id: svc.id,
            location_key: locKey,
            available: true,
            description,
            seo_title: seoTitle,
            seo_description: seoDescription,
          });

        if (insertErr) {
          console.error(`  ✗ ${svc.slug}/${locKey}: ${insertErr.message}`);
        } else {
          updated++;
        }
      }
    }
  }

  console.log(`\nDone! Updated ${updated} location overrides. Skipped ${skipped}.`);

  // Verify
  const { count } = await sb
    .from('cms_location_overrides')
    .select('*', { count: 'exact', head: true })
    .not('description', 'is', null);

  console.log(`Total overrides with descriptions: ${count}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
