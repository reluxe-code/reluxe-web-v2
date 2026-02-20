// src/data/treatmentBundles.js
// Curated treatment bundles organized by patient concern/goal.
// Each bundle contains items with a slug (maps to boulevardServiceMap)
// and a label (the actual Boulevard service name shown to patients).
import { roleMatches } from '@/lib/provider-roles';

export const TREATMENT_BUNDLES = [
  {
    id: 'relaxing-glow',
    title: 'Relaxing Glow',
    description: 'Unwind with a results-driven facial.',
    items: [
      { slug: 'facials', label: 'Signature Facial' },
      { slug: 'glo2facial', label: 'RELUXE Glo2' },
      { slug: 'hydrafacial', label: 'RELUXE HydraFacial' },
    ],
  },
  {
    id: 'tone-texture',
    title: 'Tone & Texture',
    description: 'Even out and smooth your skin.',
    items: [
      { slug: 'ipl', label: 'IPL Photofacial' },
      { slug: 'microneedling', label: 'SkinPen Microneedling' },
    ],
  },
  {
    id: 'wrinkles-lines',
    title: 'Wrinkles & Lines',
    description: 'Smooth expression lines.',
    items: [
      { slug: 'tox', label: 'Tox' },
    ],
  },
  {
    id: 'facial-balancing',
    title: 'Facial Balancing',
    description: 'Restore volume & symmetry.',
    items: [
      { slug: 'filler', label: 'Dermal Fillers' },
      { slug: 'sculptra', label: 'Sculptra' },
    ],
  },
  {
    id: 'glp1-protocol',
    title: 'GLP-1 Protocol',
    description: 'Address volume changes from weight loss.',
    items: [
      { slug: 'morpheus8', label: 'Morpheus8' },
      { slug: 'filler', label: 'Dermal Fillers' },
    ],
  },
  {
    id: 'wow-factor',
    title: 'The Wow Factor',
    description: 'Maximum transformation.',
    items: [
      { slug: 'morpheus8', label: 'Morpheus8' },
      { slug: 'sculptra', label: 'Sculptra' },
    ],
  },
];

/** Slug titles used as fallback labels and in admin UI */
export const SLUG_TITLES = {
  tox: 'Tox',
  filler: 'Dermal Fillers',
  sculptra: 'Sculptra',
  morpheus8: 'Morpheus8',
  microneedling: 'SkinPen Microneedling',
  ipl: 'IPL Photofacial',
  'laser-hair-removal': 'Laser Hair Removal',
  hydrafacial: 'RELUXE HydraFacial',
  glo2facial: 'RELUXE Glo2',
  facials: 'Signature Facial',
  massage: 'Massage',
};

/**
 * Normalize a bundle: converts legacy `slugs[]` format to `items[{slug,label}]`.
 */
function normalizeBundleItems(bundle) {
  if (bundle.items) return bundle;
  // Legacy: slugs array → convert to items with SLUG_TITLES fallback
  return {
    ...bundle,
    items: (bundle.slugs || []).map((slug) => ({
      slug,
      label: SLUG_TITLES[slug] || slug,
    })),
  };
}

/**
 * Filter bundles to those where the provider has at least one matching item.
 * Returns bundles with an `availableItems` array (only items the provider offers).
 *
 * @param {object} boulevardServiceMap - provider's slug→location map
 * @param {string} locationKey - 'westfield', 'carmel', or 'any'
 * @param {Array} locations - all picker locations
 * @param {Array|null} overrideBundles - per-provider override (null=defaults, []=disabled)
 * @param {Array|null} globalDefaults - DB-sourced global bundles (falls back to TREATMENT_BUNDLES constant)
 * @param {string|null} providerRole - e.g. 'Injectors', 'Aestheticians' — filters bundles by role
 */
export function getBundlesForProvider(boulevardServiceMap, locationKey, locations = [], overrideBundles = null, globalDefaults = null, providerRole = null) {
  // Provider override: [] = disabled, null = use defaults
  if (Array.isArray(overrideBundles) && overrideBundles.length === 0) return [];

  const raw = overrideBundles || globalDefaults || TREATMENT_BUNDLES;
  const bundles = raw.map(normalizeBundleItems);

  // Build sets of services this provider has at the given location.
  const providerSlugs = new Set();
  const providerCatalogIds = new Set();
  for (const [slug, locMap] of Object.entries(boulevardServiceMap)) {
    if (locationKey === 'any') {
      if (locations.every((loc) => locMap?.[loc.key])) {
        providerSlugs.add(slug);
        for (const loc of locations) {
          if (locMap?.[loc.key]) providerCatalogIds.add(locMap[loc.key]);
        }
      }
    } else if (locMap?.[locationKey]) {
      providerSlugs.add(slug);
      providerCatalogIds.add(locMap[locationKey]);
    }
  }

  return bundles
    .map((b) => ({
      ...b,
      availableItems: b.items.filter((item) => {
        // Catalog-picked items are kept; provider/location validation happens downstream.
        // Many consult services are not represented in boulevardServiceMap slugs.
        if (item.catalogId) return true;
        const hasSlug = item.slug && providerSlugs.has(item.slug);
        const hasCatalogId = item.catalogId && providerCatalogIds.has(item.catalogId);
        return hasSlug || hasCatalogId;
      }),
    }))
    .filter((b) => {
      if (b.availableItems.length === 0) return false;
      // Role filtering: if bundle has roles set, provider must match
      if (b.roles?.length > 0 && providerRole) {
        return b.roles.some((r) => roleMatches(providerRole, r));
      }
      return true;
    });
}
