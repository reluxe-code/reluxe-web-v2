// src/data/revealCategories.js
// Maps user-facing filter chips to Boulevard service slugs.
// Slugs match keys in staff.boulevard_service_map (Supabase).

// Price tiers: 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
export const PRICE_TIERS = [
  { id: 1, label: '$',    description: 'Under $200' },
  { id: 2, label: '$$',   description: '$200–400' },
  { id: 3, label: '$$$',  description: '$400–800' },
  { id: 4, label: '$$$$', description: '$800+' },
]

// Individual categories — used by board API for slug→label + price mapping
export const REVEAL_CATEGORIES = [
  { id: 'tox',         label: 'Tox',                 slug: 'tox',           icon: '\u{1F489}', priceTier: 2 },
  { id: 'massage',     label: 'Massage',             slug: 'massage',       icon: '\u{1F486}', priceTier: 1 },
  { id: 'consult',     label: 'Consult / Game Plan', slug: 'consultations', icon: '\u{1FA7A}', priceTier: 1 },
  { id: 'laserhair',   label: 'Laser Hair Removal',  slug: 'laser-hair-removal', icon: '\u{2728}',  priceTier: 2 },
  { id: 'evolvex',     label: 'EvolveX',             slug: 'evolvex',       icon: '\u{1F525}', priceTier: 3 },
  { id: 'hydrafacial', label: 'HydraFacial',         slug: 'hydrafacial',   icon: '\u{1F4A7}', priceTier: 2 },
  { id: 'glo2',        label: 'Glo2Facial',          slug: 'glo2facial',    icon: '\u{1F31F}', priceTier: 2 },
  { id: 'micropeel',   label: 'MicroPeel / Peel',    slug: 'peels',         icon: '\u{1F9EA}', priceTier: 1 },
  { id: 'ipl',         label: 'IPL',                 slug: 'ipl',           icon: '\u{1F4A1}', priceTier: 3 },
  { id: 'clearlift',   label: 'ClearLift',           slug: 'clearlift',     icon: '\u{26A1}',  priceTier: 3 },
  { id: 'skinpen',     label: 'SkinPen',             slug: 'skinpen',       icon: '\u{1FA61}', priceTier: 3 },
  { id: 'facial',      label: 'Signature Facial',    slug: 'facials',       icon: '\u{1F338}', priceTier: 1 },
  { id: 'morpheus8',   label: 'Morpheus8',           slug: 'morpheus8',     icon: '\u{1F52C}', priceTier: 4 },
]

// Tiered intent bundles — problem-centric language for the filter screen
export const REVEAL_TIERS = [
  {
    id: 'quick_refresh',
    label: 'I Just Need a Little Something',
    subtitle: 'Tox, peels, facials.',
    slugs: ['tox', 'peels', 'facials'],
  },
  {
    id: 'skin_help',
    label: 'My Skin Looks Dull',
    subtitle: 'HydraFacial, Glo2, massage \u2014 the glow treatments.',
    slugs: ['hydrafacial', 'glo2facial', 'massage'],
  },
  {
    id: 'go_bigger',
    label: "I'm Ready to Go Bigger",
    subtitle: 'Morpheus8, laser, EvolveX, SkinPen.',
    slugs: ['morpheus8', 'laserhair', 'evolvex', 'skinpen'],
  },
  {
    id: 'pick_for_me',
    label: "Not Sure \u2014 Just Pick for Me",
    subtitle: "We'll show your best options.",
    slugs: ['tox', 'peels', 'facials', 'hydrafacial', 'glo2facial', 'massage', 'morpheus8', 'laserhair', 'evolvex', 'skinpen', 'consultations'],
  },
]

export const TIME_OPTIONS = [
  { id: 'morning',  label: 'Morning' },
  { id: 'midday',   label: 'Midday' },
  { id: 'after3',   label: 'After 3pm' },
  { id: 'evening',  label: 'Evening' },
]
