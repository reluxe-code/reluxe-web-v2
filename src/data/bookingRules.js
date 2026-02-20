// src/data/bookingRules.js
// Booking combination rules for multi-service appointments.
// Edit this file to control which services can be booked together.

/**
 * COMBINABLE_GROUPS
 * Services within the same group CAN be booked together in one visit.
 * A service can appear in multiple groups.
 */
export const COMBINABLE_GROUPS = {
  injectables: {
    services: ['tox', 'filler', 'sculptra'],
    label: 'Injectable Combo',
  },
  'facial-plus': {
    services: ['facials', 'glo2facial', 'hydrafacial', 'peels', 'ipl'],
    label: 'Facial Enhancement',
  },
  rejuvenation: {
    services: ['microneedling', 'ipl', 'peels'],
    label: 'Rejuvenation Combo',
  },
};

/**
 * EXCLUSIONS
 * Services that CANNOT be combined in the same visit.
 * Takes priority over COMBINABLE_GROUPS.
 * `reason` is shown to the client. `minDaysBetween` is informational.
 */
export const EXCLUSIONS = [
  {
    services: ['tox', 'glo2facial'],
    reason: 'Tox needs at least 2 weeks before a facial treatment.',
    minDaysBetween: 14,
  },
  {
    services: ['tox', 'hydrafacial'],
    reason: 'Tox needs at least 2 weeks before a facial treatment.',
    minDaysBetween: 14,
  },
  {
    services: ['microneedling', 'peels'],
    reason: 'Skin needs time to heal between microneedling and peels.',
    minDaysBetween: 28,
  },
  {
    services: ['laser-hair-removal', 'ipl'],
    reason: 'Both use light energy on skin. Do not combine same-day.',
    minDaysBetween: 7,
  },
];

/**
 * SUGGESTED_ADDONS
 * Per-service upsell suggestions shown at the top of "Add another service?"
 * `pitch` is the copy shown to the client.
 */
export const SUGGESTED_ADDONS = {
  tox: [
    { slug: 'filler', pitch: 'Add filler for a complete refresh' },
    { slug: 'sculptra', pitch: 'Pair with Sculptra for long-term volume' },
  ],
  filler: [
    { slug: 'tox', pitch: 'Add tox to complement your filler results' },
    { slug: 'sculptra', pitch: 'Layer Sculptra for deeper volume correction' },
  ],
  sculptra: [
    { slug: 'tox', pitch: 'Add tox for fine lines while Sculptra builds collagen' },
    { slug: 'filler', pitch: 'Add filler for immediate volume' },
  ],
  facials: [
    { slug: 'peels', pitch: 'Boost your facial with a peel add-on' },
  ],
  hydrafacial: [
    { slug: 'ipl', pitch: 'Add IPL for an even-tone glow-up' },
  ],
  microneedling: [
    { slug: 'ipl', pitch: 'Add IPL for enhanced skin rejuvenation' },
  ],
};

/** Maximum number of services that can be combined in one booking. */
export const MAX_SERVICES_PER_BOOKING = 3;


// ─── Helper Functions ───

/**
 * Check if two service slugs can be combined.
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canCombine(slugA, slugB) {
  for (const exc of EXCLUSIONS) {
    if (exc.services.includes(slugA) && exc.services.includes(slugB)) {
      return { allowed: false, reason: exc.reason, minDaysBetween: exc.minDaysBetween };
    }
  }
  for (const group of Object.values(COMBINABLE_GROUPS)) {
    if (group.services.includes(slugA) && group.services.includes(slugB)) {
      return { allowed: true };
    }
  }
  return { allowed: false, reason: 'These services cannot be combined in one appointment.' };
}

/**
 * Check if a new service can be added to an existing set of selected services.
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canAddToCart(existingSlugs, newSlug) {
  if (existingSlugs.length >= MAX_SERVICES_PER_BOOKING) {
    return { allowed: false, reason: `Maximum ${MAX_SERVICES_PER_BOOKING} services per booking.` };
  }
  for (const existing of existingSlugs) {
    const check = canCombine(existing, newSlug);
    if (!check.allowed) return check;
  }
  return { allowed: true };
}

/**
 * Get list of compatible add-on slugs for a primary service,
 * filtered to only services the provider actually offers.
 * Suggested add-ons are sorted first.
 *
 * @param {string} primarySlug
 * @param {string[]} allProviderSlugs - all slugs this provider offers
 * @param {string[]} [alreadySelectedSlugs] - slugs already in the cart
 * @returns {Array<{ slug: string, pitch?: string }>}
 */
export function getCompatibleAddons(primarySlug, allProviderSlugs, alreadySelectedSlugs = []) {
  const compatibleSlugs = new Set();

  // Find all groups the primary service belongs to
  for (const group of Object.values(COMBINABLE_GROUPS)) {
    if (group.services.includes(primarySlug)) {
      for (const s of group.services) {
        if (s !== primarySlug) compatibleSlugs.add(s);
      }
    }
  }

  // Remove excluded combinations (check against primary AND all already-selected)
  const allSelected = [primarySlug, ...alreadySelectedSlugs];
  for (const exc of EXCLUSIONS) {
    for (const sel of allSelected) {
      if (exc.services.includes(sel)) {
        for (const s of exc.services) {
          if (s !== sel) compatibleSlugs.delete(s);
        }
      }
    }
  }

  // Filter to services this provider offers & not already selected
  const available = [...compatibleSlugs].filter(
    (s) => allProviderSlugs.includes(s) && !alreadySelectedSlugs.includes(s)
  );

  // Build result with pitch text for suggested ones
  const suggested = SUGGESTED_ADDONS[primarySlug] || [];
  const suggestedMap = Object.fromEntries(suggested.map((s) => [s.slug, s.pitch]));

  // Sort: suggested first (in order), then alphabetical
  const suggestedSlugs = suggested.map((s) => s.slug);
  available.sort((a, b) => {
    const aIdx = suggestedSlugs.indexOf(a);
    const bIdx = suggestedSlugs.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  return available.map((slug) => ({
    slug,
    pitch: suggestedMap[slug] || null,
  }));
}
