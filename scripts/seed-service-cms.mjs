#!/usr/bin/env node
// scripts/seed-service-cms.mjs
// Parses existing service JS files and populates CMS tables in Supabase.
// Run: node --import ./scripts/register-loader.mjs scripts/seed-service-cms.mjs
//
// Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local

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
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local may not exist; env vars may be set externally
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Category definitions (from serviceGridData.js) ──
const TAB_SLUGS = {
  Injectables:   ['tox', 'filler', 'facial-balancing'],
  Facials:       ['facials', 'glo2facial', 'hydrafacial', 'peels', 'skinpen', 'skin-iq'],
  Lasers:        ['lasers', 'ipl', 'clearlift', 'clearskin', 'vascupen', 'laser-hair-removal'],
  'Wow Results': ['morpheus8', 'co2', 'opus', 'sculptra'],
  Massage:       ['massage', 'salt-sauna', 'evolvex'],
};

const TAB_TO_SLUG = {
  Injectables:   'injectables',
  Facials:       'facials-category',
  Lasers:        'lasers-category',
  'Wow Results': 'wow-results',
  Massage:       'massage-body',
};

// ── Services NOT in Carmel ──
const NOT_IN_CARMEL = new Set([
  'hydrafacial', 'evolvex', 'vascupen', 'clearskin',
  'co2', 'salt-sauna', 'massage', 'opus', 'skin-iq',
]);

const CARMEL_ALTERNATIVES = {
  hydrafacial: [{ slug: 'glo2facial', label: 'Glo2Facial' }, { slug: 'facials', label: 'Signature Facials' }],
  evolvex: [{ slug: 'morpheus8', label: 'Morpheus8 Body' }],
  vascupen: [{ slug: 'ipl', label: 'IPL Photofacial' }],
  clearskin: [{ slug: 'facials', label: 'Facials' }, { slug: 'peels', label: 'Chemical Peels' }],
  co2: [{ slug: 'morpheus8', label: 'Morpheus8' }],
  opus: [{ slug: 'morpheus8', label: 'Morpheus8' }],
  'salt-sauna': [{ slug: 'glo2facial', label: 'Glo2Facial' }, { slug: 'facials', label: 'Signature Facials' }],
  massage: [{ slug: 'facials', label: 'Facials' }],
  'skin-iq': [{ slug: 'facials', label: 'Facials' }, { slug: 'peels', label: 'Chemical Peels' }],
};

// ── Booking map ──
const SERVICE_BOOKING_MAP = {
  tox: 'tox', filler: 'filler', 'facial-balancing': 'facial-balancing',
  sculptra: 'sculptra', facials: 'facials', glo2facial: 'glo2facial',
  hydrafacial: 'hydrafacial', peels: 'peels', skinpen: 'skinpen',
  'skin-iq': 'skin-iq', lasers: 'lasers', ipl: 'ipl', clearlift: 'clearlift',
  clearskin: 'clearskin', vascupen: 'vascupen', 'laser-hair-removal': 'laser-hair-removal',
  morpheus8: 'morpheus8', co2: 'co2', opus: 'opus', massage: 'massage',
  'salt-sauna': 'salt-sauna', evolvex: 'evolvex',
};

const SERVICE_CONSULT_MAP = {
  tox: 'tox-consult', botox: 'tox-consult', dysport: 'tox-consult',
  jeuveau: 'tox-consult', daxxify: 'tox-consult',
  filler: 'facial-balancing', rha: 'facial-balancing',
  sculptra: 'facial-balancing', 'facial-balancing': 'facial-balancing',
};

// ── Block extraction helpers ──
// Maps service object keys to block_type + content extractor
function extractBlocks(svc) {
  const blocks = [];
  let order = 0;

  function add(type, content, variant) {
    if (!content || (Array.isArray(content) && content.length === 0)) return;
    if (typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length === 0) return;
    blocks.push({
      block_type: type,
      content,
      variant: variant || null,
      enabled: true,
      sort_order: order,
    });
    order += 10;
  }

  const v = svc.variants || {};
  const bp = svc.blockPriorities || {};

  // Extract blocks in priority order if available, otherwise default order
  const blockDefs = [
    { key: 'hero', type: 'hero', extract: () => ({ tagline: svc.tagline || '' }), variant: v.hero },
    { key: 'quickFacts', type: 'quick_facts', extract: () => svc.quickFacts?.length ? { facts: svc.quickFacts } : null, variant: v.quickFacts },
    { key: 'overviewWhy', type: 'overview', extract: () => {
      if (!svc.overview?.p1 && !svc.whyReluxe?.length) return null;
      return { p1: svc.overview?.p1 || '', p2: svc.overview?.p2 || '', whyReluxe: svc.whyReluxe || [] };
    }, variant: v.overview },
    { key: 'benefits', type: 'benefits', extract: () => svc.benefits?.length ? { items: svc.benefits } : null, variant: v.benefits },
    { key: 'resultsGallery', type: 'results_gallery', extract: () => svc.resultsGallery?.length ? { images: svc.resultsGallery } : null, variant: v.beforeAfter },
    { key: 'howItWorks', type: 'how_it_works', extract: () => svc.howItWorks?.length ? { steps: svc.howItWorks } : null, variant: v.howItWorks },
    { key: 'candidates', type: 'candidates', extract: () => {
      if (!svc.candidates?.good?.length && !svc.candidates?.notIdeal?.length) return null;
      return { good: svc.candidates?.good || [], notIdeal: svc.candidates?.notIdeal || [] };
    }, variant: v.candidates },
    { key: 'pricingMatrix', type: 'pricing_matrix', extract: () => svc.pricingMatrix?.sections?.length ? svc.pricingMatrix : null, variant: v.pricing },
    { key: 'comparison', type: 'comparison', extract: () => svc.comparison?.columns?.length ? svc.comparison : null, variant: v.comparison },
    { key: 'faq', type: 'faq', extract: () => svc.faq?.length ? { items: svc.faq } : null, variant: v.faq },
    { key: 'testimonials', type: 'testimonials', extract: () => svc.testimonials?.length ? { source: 'manual', items: svc.testimonials } : null, variant: v.testimonials },
    { key: 'providerSpotlight', type: 'providers', extract: () => svc.providers?.length ? { items: svc.providers } : null, variant: v.providers },
    { key: 'prepAftercare', type: 'prep_aftercare', extract: () => {
      if (!svc.prepAftercare?.prep && !svc.prepAftercare?.after) return null;
      return svc.prepAftercare;
    }, variant: v.prepAftercare },
    { key: 'flexEverything', type: 'flex_everything', extract: () => {
      if (!svc.flexEverything?.items?.length) return null;
      return svc.flexEverything;
    }, variant: v.flexEverything },
  ];

  // Sort by blockPriorities if available
  const sorted = [...blockDefs].sort((a, b) => {
    const pa = bp[a.key] ?? 999;
    const pb = bp[b.key] ?? 999;
    return pa - pb;
  });

  for (const def of sorted) {
    const content = def.extract();
    if (content) {
      add(def.type, content, def.variant);
    }
  }

  return blocks;
}

// ── Main ──
async function main() {
  console.log('Starting CMS seed...\n');

  // 1. Seed categories
  console.log('1. Seeding service categories...');
  const categoryIds = {};
  for (const [tabName, slugs] of Object.entries(TAB_SLUGS)) {
    const catSlug = TAB_TO_SLUG[tabName];
    const { data, error } = await sb
      .from('service_categories')
      .upsert({
        name: tabName,
        slug: catSlug,
        type: 'functional',
        sort_order: Object.keys(TAB_SLUGS).indexOf(tabName) * 10,
        active: true,
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (error) {
      console.error(`  Error creating category ${tabName}:`, error.message);
      continue;
    }
    categoryIds[tabName] = data.id;
    console.log(`  Created category: ${tabName} (${catSlug}) → ${data.id}`);
  }

  // 2. Load all service files dynamically
  console.log('\n2. Loading service files...');

  // Import the registry to get all services
  const { getServicesList } = await import(resolve(root, 'src/data/servicesList.js'));
  const allServices = await getServicesList();
  console.log(`  Loaded ${allServices.length} services from registry`);

  // Also try loading per-slug files for richer data
  const serviceFiles = {};
  for (const svc of allServices) {
    if (!svc?.slug) continue;
    try {
      const mod = await import(resolve(root, `src/data/services/${svc.slug}.js`));
      serviceFiles[svc.slug] = mod.default || svc;
    } catch {
      // No per-slug file, use registry version
      serviceFiles[svc.slug] = svc;
    }
  }

  // 3. Seed services
  console.log('\n3. Seeding services...');
  const serviceIds = {};
  let serviceCount = 0;

  for (const [slug, svc] of Object.entries(serviceFiles)) {
    const bookingSlug = SERVICE_BOOKING_MAP[slug] || null;
    const consultSlug = SERVICE_CONSULT_MAP[slug] || null;

    const { data, error } = await sb
      .from('cms_services')
      .upsert({
        slug: svc.slug || slug,
        name: svc.name || slug,
        tagline: svc.tagline || null,
        hero_image: svc.heroImage || null,
        booking_slug: bookingSlug,
        consult_slug: consultSlug,
        seo: svc.seo || {},
        status: 'published',
        indexable: svc.indexable !== false,
        sort_order: serviceCount * 10,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Error creating service ${slug}:`, error.message);
      continue;
    }

    serviceIds[slug] = data.id;
    serviceCount++;
    console.log(`  [${serviceCount}] ${svc.name || slug} (${slug}) → ${data.id}`);
  }

  // 4. Seed blocks
  console.log('\n4. Seeding content blocks...');
  let blockCount = 0;

  for (const [slug, svc] of Object.entries(serviceFiles)) {
    const serviceId = serviceIds[slug];
    if (!serviceId) continue;

    // Delete existing blocks for this service (idempotent re-run)
    await sb.from('cms_service_blocks').delete().eq('service_id', serviceId);

    const blocks = extractBlocks(svc);
    for (const block of blocks) {
      const { error } = await sb.from('cms_service_blocks').insert({
        service_id: serviceId,
        block_type: block.block_type,
        content: block.content,
        variant: block.variant,
        enabled: block.enabled,
        sort_order: block.sort_order,
      });
      if (error) {
        console.error(`  Error creating block ${block.block_type} for ${slug}:`, error.message);
      } else {
        blockCount++;
      }
    }
  }
  console.log(`  Created ${blockCount} blocks across ${serviceCount} services`);

  // 5. Seed category assignments
  console.log('\n5. Assigning services to categories...');
  let assignCount = 0;

  // Build reverse lookup: slug → tab name
  const slugToTab = {};
  for (const [tab, slugs] of Object.entries(TAB_SLUGS)) {
    for (const s of slugs) {
      slugToTab[s] = tab;
    }
  }

  for (const [slug, serviceId] of Object.entries(serviceIds)) {
    const tabName = slugToTab[slug];
    if (!tabName || !categoryIds[tabName]) continue;

    const { error } = await sb.from('cms_service_categories').upsert({
      service_id: serviceId,
      category_id: categoryIds[tabName],
      sort_order: TAB_SLUGS[tabName].indexOf(slug) * 10,
    }, { onConflict: 'service_id,category_id' });

    if (error) {
      console.error(`  Error assigning ${slug} to ${tabName}:`, error.message);
    } else {
      assignCount++;
    }
  }
  console.log(`  Created ${assignCount} category assignments`);

  // 6. Seed location overrides
  console.log('\n6. Seeding location overrides...');
  let locCount = 0;

  for (const slug of Object.keys(serviceIds)) {
    const serviceId = serviceIds[slug];
    const isInCarmel = !NOT_IN_CARMEL.has(slug);

    // Westfield override (always available)
    const { error: wErr } = await sb.from('cms_location_overrides').upsert({
      service_id: serviceId,
      location_key: 'westfield',
      available: true,
      alternatives: [],
    }, { onConflict: 'service_id,location_key' });
    if (!wErr) locCount++;

    // Carmel override
    const { error: cErr } = await sb.from('cms_location_overrides').upsert({
      service_id: serviceId,
      location_key: 'carmel',
      available: isInCarmel,
      alternatives: CARMEL_ALTERNATIVES[slug] || [],
    }, { onConflict: 'service_id,location_key' });
    if (!cErr) locCount++;
  }
  console.log(`  Created ${locCount} location overrides`);

  // 7. Seed default library blocks (service_id = NULL)
  console.log('\n7. Seeding default library blocks...');
  await sb.from('cms_service_blocks').delete().is('service_id', null);

  const defaultBlocks = [
    { block_type: 'how_it_works', content: { steps: [
      { title: 'Consultation', body: 'We review your goals, history, and design a personalized plan.' },
      { title: 'Treatment', body: 'Quick, precise session performed by our experts.' },
      { title: 'Aftercare', body: 'Simple steps for best results. We check in with you.' },
    ]}, sort_order: 50 },
    { block_type: 'candidates', content: {
      good: ['Healthy adults with realistic goals', 'Prefer minimal downtime'],
      notIdeal: ['Active infection at treatment site'],
    }, sort_order: 60 },
    { block_type: 'prep_aftercare', content: {
      prep: { title: 'Before your visit', points: ['Arrive with clean skin', 'Avoid alcohol 24 hrs prior', 'Pause retinoids 48 hrs prior'] },
      after: { title: 'After your visit', points: ['SPF daily', 'Avoid intense heat 24 hrs', 'Follow your custom care sheet'] },
    }, sort_order: 130 },
    { block_type: 'faq', content: { items: [
      { q: 'Does it hurt?', a: 'Most patients describe mild, brief discomfort. We can use numbing when appropriate.' },
      { q: 'When will I see results?', a: 'Some results are immediate; full effect often appears by 1-2 weeks depending on service.' },
    ]}, sort_order: 85 },
  ];

  for (const block of defaultBlocks) {
    const { error } = await sb.from('cms_service_blocks').insert({
      service_id: null,
      block_type: block.block_type,
      content: block.content,
      enabled: true,
      sort_order: block.sort_order,
    });
    if (error) console.error(`  Error creating default ${block.block_type}:`, error.message);
  }
  console.log(`  Created ${defaultBlocks.length} default library blocks`);

  // ── Validation ──
  console.log('\n── Validation ──');
  const { count: svcCount } = await sb.from('cms_services').select('*', { count: 'exact', head: true });
  const { count: blkCount } = await sb.from('cms_service_blocks').select('*', { count: 'exact', head: true });
  const { count: catCount } = await sb.from('service_categories').select('*', { count: 'exact', head: true });
  const { count: jctCount } = await sb.from('cms_service_categories').select('*', { count: 'exact', head: true });
  const { count: locOvCount } = await sb.from('cms_location_overrides').select('*', { count: 'exact', head: true });

  console.log(`  Services:           ${svcCount}`);
  console.log(`  Blocks:             ${blkCount}`);
  console.log(`  Categories:         ${catCount}`);
  console.log(`  Category joins:     ${jctCount}`);
  console.log(`  Location overrides: ${locOvCount}`);

  console.log('\nSeed complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
