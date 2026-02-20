// src/data/locationAvailability.js
// Centralized location–service availability data.

/** Services NOT offered at the Carmel location (Westfield has everything). */
export const NOT_IN_CARMEL = new Set([
  'hydrafacial',
  'evolvex',
  'vascupen',
  'clearskin',
  'co2',
  'salt-sauna',
  'massage',
  'opus',
  'skin-iq',
]);

/**
 * When a service isn't available at Carmel, suggest these alternatives.
 * Keys = unavailable slug, values = array of { slug, label } suggestions.
 */
export const CARMEL_ALTERNATIVES = {
  hydrafacial: [
    { slug: 'glo2facial', label: 'Glo2Facial' },
    { slug: 'facials', label: 'Signature Facials' },
  ],
  evolvex: [
    { slug: 'morpheus8', label: 'Morpheus8 Body' },
  ],
  vascupen: [
    { slug: 'ipl', label: 'IPL Photofacial' },
  ],
  clearskin: [
    { slug: 'facials', label: 'Facials' },
    { slug: 'peels', label: 'Chemical Peels' },
  ],
  co2: [
    { slug: 'morpheus8', label: 'Morpheus8' },
  ],
  opus: [
    { slug: 'morpheus8', label: 'Morpheus8' },
  ],
  'salt-sauna': [],
  massage: [],
  'skin-iq': [],
};

/** Check if a service slug is offered at a given location key. */
export function isAvailableAtLocation(serviceSlug, locationKey) {
  if (locationKey === 'westfield') return true;
  if (locationKey === 'carmel') return !NOT_IN_CARMEL.has(serviceSlug);
  return true;
}

/** Backwards-compatible wrapper used by /services/[slug].js */
export function isServiceAvailableAtCity({ slug, cityKey }) {
  return isAvailableAtLocation(String(slug || '').toLowerCase(), cityKey);
}

/** Get the slug from a /services/[slug] href. */
export function slugFromHref(href) {
  return String(href || '')
    .replace(/^\/services\//, '')
    .split('/')[0]
    .split('?')[0];
}
