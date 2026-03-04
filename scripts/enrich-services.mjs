#!/usr/bin/env node
// scripts/enrich-services.mjs
// Enriches sparse service data files with comprehensive, best-in-class content
// using the Anthropic API, then writes directly to static files + CMS database.
//
// Usage:
//   node --import ./scripts/register-loader.mjs scripts/enrich-services.mjs [slug...]
//   node --import ./scripts/register-loader.mjs scripts/enrich-services.mjs          # all sparse
//   node --import ./scripts/register-loader.mjs scripts/enrich-services.mjs facials   # just one
//   node --import ./scripts/register-loader.mjs scripts/enrich-services.mjs --dry-run # preview only

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing Supabase credentials'); process.exit(1); }

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const slugFilter = args.filter(a => !a.startsWith('--'));

// ── Service context for AI prompt ──
const RELUXE_CONTEXT = `
You are writing service page content for RELUXE Med Spa, a luxury medical spa in Indiana with locations in Westfield and Carmel. RELUXE is known for expert, honest care with a "you, just refreshed" philosophy — never overfilled, never frozen.

Key facts about RELUXE:
- Locations: Westfield (full-service flagship) and Carmel, Indiana
- Staff: NP-led with RN injectors, licensed estheticians, and massage therapists
- Differentiators: Free consultations, VIP Membership (10-15% savings), Cherry financing, 2-week follow-ups, medical-grade products
- Services include: Tox (Botox, Dysport, Jeuveau, Daxxify), Dermal Fillers (Juvederm, RHA, Restylane, Versa), Morpheus8, CO2 Laser, Opus Plasma, IPL, ClearLift, ClearSkin, SkinPen, HydraFacial, Glo2Facial, Signature Facials, Chemical Peels, EvolveX, Massage, IR Sauna & Salt Booth, Laser Hair Removal, PRP, Sculptra, VascuPen, Facial Balancing, SkinIQ Analysis
- Brands we carry: SkinBetter Science, SkinCeuticals, Colorescience, EltaMD, Hydrinity, Alastin, Universkin

Writing rules:
- Be SPECIFIC and clinical — mention real ingredient names, technologies, mechanisms of action
- Write for an educated patient who is researching options (not dumbed down, not overly medical)
- Include practical details (session times, number of sessions, what to expect)
- Mention Indiana/Westfield/Carmel naturally for local SEO
- Use "helps", "may", "designed to" — no medical claims
- Sound confident and knowledgeable, not salesy
- Reference how services pair with other RELUXE treatments
- Include information that answers real patient questions (cost expectations, pain level, downtime, results timeline)
`.trim();

// ── Which services are sparse (FAQ-only) ──
const SPARSE_SERVICES = new Set([
  'juvederm', 'restylane', 'rha', 'versa', 'sculptra', 'dissolving', 'facial-balancing', 'prp',
  'facials', 'glo2facial', 'hydrafacial', 'peels', 'micropeels', 'skinpen', 'skiniq', 'skin-iq',
  'co2', 'opus', 'ipl', 'clearlift', 'clearskin', 'vascupen', 'laserhair', 'evolvex',
  'massage', 'saltsauna', 'men', 'reveal', 'consultations', 'injectables',
]);

// Morpheus8 is partially complete — needs overview, whyReluxe, pricingMatrix, prepAftercare
const PARTIAL_SERVICES = new Set(['morpheus8']);

// ── Service-specific pricing knowledge (from actual RELUXE pricing) ──
const PRICING_HINTS = {
  juvederm: 'Voluma/Volux $800/syringe ($750 members), Vollure/Volbella $750 ($700 members), half syringe $500 ($450 members)',
  restylane: 'Restylane products $750/syringe ($700 members) — Lyft for cheeks, Contour for natural cheek, Defyne for jawline, Kysse for lips',
  rha: 'RHA 1-4 all $650/syringe ($600 members) — designed for dynamic movement areas',
  versa: 'Revanesse Versa $650/syringe ($600 members) — great value option for lips and lines',
  sculptra: 'Sculptra is a collagen stimulator (poly-L-lactic acid), not HA filler. Pricing typically per vial, requires 2-3 sessions. Ask for exact pricing at consult.',
  dissolving: 'Hyaluronidase dissolving treatment to remove/correct HA fillers. Pricing varies by amount needed.',
  'facial-balancing': 'Comprehensive filler treatment plan. Uses multiple syringes strategically. Free consultation to design the plan. Multi-syringe discount: $100 off 2+ syringes.',
  prp: 'PRP (platelet-rich plasma) drawn from your own blood. Can be combined with microneedling or injected. Pricing per session.',
  facials: 'Signature Facial ~60 min. Teen Facial available. VIP Members save 10-15%. Includes dermaplaning.',
  glo2facial: 'Glo2Facial oxygenation treatment. Available at both locations. VIP member pricing available.',
  hydrafacial: 'HydraFacial available at Westfield only. Multiple tiers (Signature, Deluxe, Platinum). VIP member pricing.',
  peels: 'Chemical peels range from light to deep. Multiple peel options available. Often combined with facial treatments.',
  micropeels: 'MicroPeels are lighter, maintenance-level peels. Great for monthly maintenance. Affordable entry point.',
  skinpen: 'SkinPen microneedling ~$400-500/session, packages of 3 available. Add PRP for enhanced results.',
  skiniq: 'SkinIQ analysis is complimentary for members. Builds a data-driven treatment plan. Uses Visia-style imaging.',
  co2: 'CO2 fractional laser — premium resurfacing. Single session $1,500-2,500+ depending on area. Significant results. Westfield only.',
  opus: 'Opus Plasma fractional — less downtime than CO2, still dramatic. Pricing per session. Westfield only.',
  ipl: 'IPL Photofacial for sun damage, redness, pigmentation. $300-500/session, packages of 3-5 recommended.',
  clearlift: 'ClearLift non-ablative laser — zero downtime. Great for maintenance. $300-400/session.',
  clearskin: 'ClearSkin laser for active acne + marks. Westfield only. $250-400/session.',
  vascupen: 'VascuPen for broken capillaries and spider veins. Targeted treatment. Westfield only.',
  laserhair: 'Laser hair removal priced per area. Small areas from $100, large areas $300+. Series of 6-10 sessions.',
  evolvex: 'EvolveX body contouring — Tite (skin tightening), Tone (muscle stimulation), Transform (combined). Series of 6-8. Westfield only.',
  massage: 'Therapeutic massage. Multiple modalities. 60/90 min sessions. Westfield only. VIP member pricing.',
  saltsauna: 'Infrared sauna + salt booth combo. Wellness add-on. Westfield only. Great complement to other treatments.',
  men: 'All RELUXE services welcome men. Most popular: tox, skin treatments, laser hair removal, body contouring.',
  reveal: 'Reveal is our quiz-based treatment finder. Not a service itself — it matches you to the right treatment.',
  consultations: 'Free consultations for all services. No obligation. Meet your provider, get a customized plan.',
  injectables: 'Category page covering all injectables: tox + fillers. Pricing varies by product.',
  morpheus8: 'Morpheus8 RF microneedling. $900-1000/session, series of 3 for $2,400-3,000. Face, neck, body areas.',
};

// ── Generate content for a single service ──
async function generateServiceContent(slug, existingService) {
  const pricingHint = PRICING_HINTS[slug] || 'Ask for specific pricing during consultation.';
  const existingFaqs = existingService.faq || [];
  const existingName = existingService.name || slug;
  const existingTagline = existingService.tagline || '';

  const isSparse = SPARSE_SERVICES.has(slug);
  const isPartial = PARTIAL_SERVICES.has(slug);

  // For sparse services (FAQ-only), always generate ALL fields since defaults are generic
  let fieldsNeeded = [];
  if (isSparse) {
    fieldsNeeded = ['overview', 'whyReluxe', 'quickFacts', 'benefits', 'howItWorks', 'candidates', 'pricingMatrix', 'prepAftercare', 'flexEverything'];
  } else {
    if (!existingService.overview?.p1 || isPartial) fieldsNeeded.push('overview');
    if (!existingService.whyReluxe?.length || isPartial) fieldsNeeded.push('whyReluxe');
    if (!existingService.quickFacts?.length) fieldsNeeded.push('quickFacts');
    if (!existingService.benefits?.length) fieldsNeeded.push('benefits');
    if (!existingService.howItWorks?.length) fieldsNeeded.push('howItWorks');
    if (!existingService.candidates?.good?.length || !existingService.candidates?.notIdeal?.length) fieldsNeeded.push('candidates');
    if (!existingService.pricingMatrix?.sections?.length) fieldsNeeded.push('pricingMatrix');
    if (!existingService.prepAftercare?.prep?.points?.length || isPartial) fieldsNeeded.push('prepAftercare');
    if (!existingService.flexEverything?.items?.length) fieldsNeeded.push('flexEverything');
  }

  if (fieldsNeeded.length === 0) {
    console.log(`  [${slug}] Already complete, skipping`);
    return null;
  }

  const prompt = `Generate comprehensive, best-in-class service page content for "${existingName}" (slug: "${slug}") at RELUXE Med Spa.

Service name: ${existingName}
Current tagline: ${existingTagline || 'needs one'}
Pricing info: ${pricingHint}

Existing FAQ topics (DO NOT duplicate these): ${existingFaqs.map(f => f.q).join('; ')}

I need you to generate ONLY these missing fields: ${fieldsNeeded.join(', ')}

Output ONLY valid JSON (no markdown, no code fences) with these fields:

{
  ${fieldsNeeded.includes('overview') ? `"overview": {
    "p1": "2-4 sentences. Clinical, informative description of what this treatment is, how it works at a high level, what it treats, and what the experience is like. Be specific about technology/ingredients/mechanisms. This should be the most informative paragraph on the page — something a patient could read and feel educated.",
    "p2": "2-3 sentences. The RELUXE-specific experience — what makes getting this treatment HERE different. Mention the consultation process, provider expertise, follow-up care, and comfort measures. Make it feel personal and trustworthy."
  },` : ''}
  ${fieldsNeeded.includes('whyReluxe') ? `"whyReluxe": [
    { "title": "Short title (3-5 words)", "body": "1-2 sentences explaining this differentiator specifically for this service" },
    { "title": "...", "body": "..." },
    { "title": "...", "body": "..." }
  ],` : ''}
  ${fieldsNeeded.includes('quickFacts') ? `"quickFacts": [
    { "iconKey": "clock", "label": "Treatment Time", "value": "e.g. 30 min" },
    { "iconKey": "sparkles", "label": "Downtime", "value": "e.g. None" },
    { "iconKey": "user", "label": "Results Seen", "value": "e.g. 7-14 days" },
    { "iconKey": "fire", "label": "Duration", "value": "e.g. 3+ months" }
  ],` : ''}
  ${fieldsNeeded.includes('benefits') ? `"benefits": [
    "Benefit 1 (specific, not generic)",
    "Benefit 2",
    "Benefit 3",
    "Benefit 4",
    "Benefit 5"
  ],` : ''}
  ${fieldsNeeded.includes('howItWorks') ? `"howItWorks": [
    { "title": "Step 1 title (2-4 words)", "body": "1-2 sentences describing this step. Be specific to this treatment." },
    { "title": "Step 2 title", "body": "..." },
    { "title": "Step 3 title", "body": "..." }
  ],` : ''}
  ${fieldsNeeded.includes('candidates') ? `"candidates": {
    "good": ["Area/concern 1", "Area/concern 2", "Area/concern 3", "Area/concern 4", "Area/concern 5"],
    "notIdeal": ["Contraindication 1", "Contraindication 2", "Contraindication 3"]
  },` : ''}
  ${fieldsNeeded.includes('pricingMatrix') ? `"pricingMatrix": {
    "subtitle": "One sentence framing the pricing approach for this service",
    "sections": [
      {
        "title": "Section title (e.g. 'Juvéderm Pricing')",
        "note": "Optional context about pricing (1-2 sentences)",
        "membershipCallout": "Short callout about member savings (optional)",
        "rows": [
          {
            "label": "Treatment/product name",
            "subLabel": "What it's for (1 line)",
            "single": "Price (e.g. '$750')",
            "membership": "Member price if applicable (e.g. '$700')"
          }
        ],
        "promo": "Optional promo text or savings callout",
        "ctaText": "Book button text (e.g. 'Book Consultation')"
      }
    ]
  },` : ''}
  ${fieldsNeeded.includes('prepAftercare') ? `"prepAftercare": {
    "prep": {
      "title": "Before your visit",
      "points": ["Specific prep instruction 1", "Instruction 2", "Instruction 3", "Instruction 4"]
    },
    "after": {
      "title": "After your visit",
      "points": ["Specific aftercare instruction 1", "Instruction 2", "Instruction 3", "Instruction 4", "Instruction 5"]
    }
  },` : ''}
  ${fieldsNeeded.includes('flexEverything') ? `"flexEverything": {
    "intro": "One sentence introducing expert tips for this treatment",
    "items": [
      { "heading": "Tip title (2-4 words)", "body": "1-2 sentences with specific, actionable advice" },
      { "heading": "...", "body": "..." },
      { "heading": "...", "body": "..." },
      { "heading": "...", "body": "..." }
    ]
  },` : ''}
  "seo": {
    "title": "Service Name in Westfield & Carmel, IN | RELUXE Med Spa (under 60 chars)",
    "description": "Under 160 chars. Include service name, key benefit, and location."
  },
  "tagline": "One compelling sentence (under 60 chars) that captures the essence of this treatment"
}

IMPORTANT:
- Be SPECIFIC to this exact service — no generic filler content
- Use real clinical details, mechanisms, ingredients, technology names
- Reference real pricing from the hints I provided
- For pricingMatrix, use ONLY real pricing data I gave you — if I didn't give specifics, use "Starting at $X" or "Consult for pricing"
- Make every word count — patients read this to make decisions
- Include Indiana/local references naturally in overview and SEO
- Every field should provide unique value — don't repeat information across fields`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
    system: RELUXE_CONTEXT,
  });

  const text = response.content[0].text.trim();
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

// Maps file slugs to the key used in getDefaultService()
const FILE_TO_DEFAULT_KEY = {
  'facial-balancing': 'facialbalancing',
  laserhair: 'laser-hair-removal',
};

// Maps service slug (from DB) to filename (some services have mismatched slug vs filename)
const SLUG_TO_FILENAME = {
  'skin-iq': 'skiniq',
  'laser-hair-removal': 'laserhair',
  'salt-sauna': 'saltsauna',
};

// ── Write enriched content to static file ──
function writeStaticFile(slug, enriched, existingService) {
  const fileSlug = SLUG_TO_FILENAME[slug] || slug;
  const filePath = resolve(root, `src/data/services/${fileSlug}.js`);
  const defaultKey = FILE_TO_DEFAULT_KEY[fileSlug] || fileSlug;

  // Build the file content
  let code = `// src/data/services/${fileSlug}.js\nimport { getDefaultService } from '../servicesDefault';\nconst s = getDefaultService('${defaultKey}');\n\n`;

  // Variants & blockPriorities (standard for enriched services)
  code += `s.variants = {
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
};\n\n`;

  code += `s.blockPriorities = {
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
};\n\n`;

  // Tagline
  const tagline = enriched.tagline || existingService.tagline || '';
  if (tagline) {
    code += `s.tagline = ${JSON.stringify(tagline)};\n\n`;
  }

  // SEO
  if (enriched.seo) {
    code += `s.seo = ${JSON.stringify(enriched.seo, null, 2)};\n\n`;
  }

  // Quick Facts
  if (enriched.quickFacts) {
    code += `s.quickFacts = ${JSON.stringify(enriched.quickFacts, null, 2)};\n\n`;
  }

  // Benefits
  if (enriched.benefits) {
    code += `s.benefits = ${JSON.stringify(enriched.benefits, null, 2)};\n\n`;
  }

  // Overview
  if (enriched.overview) {
    code += `s.overview = ${JSON.stringify(enriched.overview, null, 2)};\n\n`;
  }

  // Why RELUXE
  if (enriched.whyReluxe) {
    code += `s.whyReluxe = ${JSON.stringify(enriched.whyReluxe, null, 2)};\n\n`;
  }

  // How It Works
  if (enriched.howItWorks) {
    code += `s.howItWorks = ${JSON.stringify(enriched.howItWorks, null, 2)};\n\n`;
  }

  // Candidates
  if (enriched.candidates) {
    code += `s.candidates = ${JSON.stringify(enriched.candidates, null, 2)};\n\n`;
  }

  // Pricing Matrix
  if (enriched.pricingMatrix) {
    code += `s.pricingMatrix = ${JSON.stringify(enriched.pricingMatrix, null, 2)};\n\n`;
  }

  // Prep & Aftercare
  if (enriched.prepAftercare) {
    code += `s.prepAftercare = ${JSON.stringify(enriched.prepAftercare, null, 2)};\n\n`;
  }

  // Flex Everything
  if (enriched.flexEverything) {
    code += `s.flexEverything = ${JSON.stringify(enriched.flexEverything, null, 2)};\n\n`;
  }

  // Keep existing FAQs (they're already good)
  if (existingService.faq?.length) {
    code += `s.faq = ${JSON.stringify(existingService.faq, null, 2)};\n\n`;
  }

  // Keep existing resultsGallery, testimonials, providers if they exist
  if (existingService.resultsGallery?.length) {
    code += `s.resultsGallery = ${JSON.stringify(existingService.resultsGallery, null, 2)};\n\n`;
  }

  code += `export default s;\n`;

  if (!DRY_RUN) {
    writeFileSync(filePath, code, 'utf8');
  }
  return code;
}

// ── Seed enriched content to CMS database ──
async function seedToCms(slug, enrichedService) {
  // Find the CMS service ID
  const { data: svc } = await sb
    .from('cms_services')
    .select('id')
    .eq('slug', slug)
    .single();

  if (!svc) {
    console.log(`  [${slug}] No CMS record found, skipping DB seed`);
    return;
  }

  const serviceId = svc.id;

  // Build blocks from enriched data
  const blocks = [];
  let order = 0;
  function add(type, content, variant) {
    if (!content) return;
    blocks.push({ service_id: serviceId, block_type: type, content, variant: variant || null, enabled: true, sort_order: order });
    order += 10;
  }

  if (enrichedService.tagline) {
    add('hero', { tagline: enrichedService.tagline }, 'split');
  }
  if (enrichedService.quickFacts) {
    add('quick_facts', { facts: enrichedService.quickFacts }, 'pills');
  }
  if (enrichedService.overview || enrichedService.whyReluxe) {
    add('overview', {
      p1: enrichedService.overview?.p1 || '',
      p2: enrichedService.overview?.p2 || '',
      whyReluxe: enrichedService.whyReluxe || [],
    }, null);
  }
  if (enrichedService.benefits) {
    add('benefits', { items: enrichedService.benefits }, 'compare');
  }
  if (enrichedService.howItWorks) {
    add('how_it_works', { steps: enrichedService.howItWorks }, 'steps');
  }
  if (enrichedService.candidates) {
    add('candidates', enrichedService.candidates, 'badges');
  }
  if (enrichedService.pricingMatrix) {
    add('pricing_matrix', enrichedService.pricingMatrix, 'tiers');
  }
  if (enrichedService.faq?.length) {
    add('faq', { items: enrichedService.faq }, 'top5');
  }
  if (enrichedService.prepAftercare) {
    add('prep_aftercare', enrichedService.prepAftercare, 'cards');
  }
  if (enrichedService.flexEverything) {
    add('flex_everything', enrichedService.flexEverything, 'tips');
  }
  if (enrichedService.resultsGallery?.length) {
    add('results_gallery', { images: enrichedService.resultsGallery }, 'compare');
  }

  if (blocks.length === 0) return;

  // Delete existing blocks for this service, then insert new ones
  const { error: delErr } = await sb
    .from('cms_service_blocks')
    .delete()
    .eq('service_id', serviceId);

  if (delErr) {
    console.error(`  [${slug}] Error deleting old blocks:`, delErr.message);
    return;
  }

  const { error: insErr } = await sb
    .from('cms_service_blocks')
    .insert(blocks);

  if (insErr) {
    console.error(`  [${slug}] Error inserting blocks:`, insErr.message);
    return;
  }

  // Update SEO on the service record
  if (enrichedService.seo) {
    await sb
      .from('cms_services')
      .update({
        seo: enrichedService.seo,
        tagline: enrichedService.tagline || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);
  }

  console.log(`  [${slug}] Seeded ${blocks.length} blocks to CMS`);
}

// ── Main ──
async function main() {
  console.log(`\nRELUXE Service Enrichment Script${DRY_RUN ? ' (DRY RUN)' : ''}\n${'─'.repeat(50)}\n`);

  // Load service registry
  const { getServicesList } = await import(resolve(root, 'src/data/servicesList.js'));
  const allServices = await getServicesList();

  // Determine which services to process
  let toProcess = [];
  for (const svc of allServices) {
    if (!svc?.slug) continue;
    const slug = svc.slug;

    if (slugFilter.length > 0 && !slugFilter.includes(slug)) continue;
    if (slugFilter.length === 0 && !SPARSE_SERVICES.has(slug) && !PARTIAL_SERVICES.has(slug)) continue;

    // Load the actual service file
    let serviceData = svc;
    try {
      const mod = await import(resolve(root, `src/data/services/${slug}.js`));
      serviceData = mod.default || svc;
    } catch {}

    toProcess.push({ slug, data: serviceData });
  }

  console.log(`Processing ${toProcess.length} services:\n  ${toProcess.map(s => s.slug).join(', ')}\n`);

  let completed = 0;
  let errors = 0;

  for (const { slug, data } of toProcess) {
    console.log(`\n[${completed + 1}/${toProcess.length}] Enriching "${data.name || slug}"...`);

    try {
      const enriched = await generateServiceContent(slug, data);

      if (!enriched) {
        completed++;
        continue;
      }

      // Merge enriched data with existing
      const merged = { ...data };
      if (enriched.tagline) merged.tagline = enriched.tagline;
      if (enriched.seo) merged.seo = enriched.seo;
      if (enriched.overview) merged.overview = enriched.overview;
      if (enriched.whyReluxe) merged.whyReluxe = enriched.whyReluxe;
      if (enriched.quickFacts) merged.quickFacts = enriched.quickFacts;
      if (enriched.benefits) merged.benefits = enriched.benefits;
      if (enriched.howItWorks) merged.howItWorks = enriched.howItWorks;
      if (enriched.candidates) merged.candidates = enriched.candidates;
      if (enriched.pricingMatrix) merged.pricingMatrix = enriched.pricingMatrix;
      if (enriched.prepAftercare) merged.prepAftercare = enriched.prepAftercare;
      if (enriched.flexEverything) merged.flexEverything = enriched.flexEverything;

      // Write static file
      const fileCode = writeStaticFile(slug, merged, data);
      console.log(`  ✓ Static file ${DRY_RUN ? 'would be ' : ''}written`);

      // Seed to CMS
      if (!DRY_RUN) {
        await seedToCms(slug, merged);
      } else {
        console.log(`  ✓ Would seed to CMS`);
      }

      completed++;
      console.log(`  ✓ Done (${completed}/${toProcess.length})`);

      // Small delay to avoid API rate limits
      if (completed < toProcess.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      errors++;
      completed++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Complete: ${completed - errors} enriched, ${errors} errors`);
  if (DRY_RUN) console.log('(Dry run — no files were modified)');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
