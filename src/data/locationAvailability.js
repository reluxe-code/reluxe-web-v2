// src/data/locationAvailability.js
const availability = {
  // slug -> set of city keys that offer it
  // example:
  // botox: new Set(['westfield', 'carmel']),
  // hydrafacial: new Set(['westfield']),
};

export function isServiceAvailableAtCity({ slug, cityKey }) {
  const s = String(slug || '').toLowerCase();
  const cities = availability[s];
  if (!cities) return true; // default to available everywhere unless specified
  return cities.has(cityKey);
}
