// src/data/serviceBookingMap.js
// Maps site service slugs to Boulevard booking targets.
// type: 'service' → has a specific Boulevard service ID, skip to OPTIONS
// type: 'category' → matches a Boulevard category name, skip to CATEGORY_ITEMS
//
// Boulevard service IDs come from BoulevardScripts.js bookingMap paths.
// Category names must fuzzy-match what Boulevard API returns in /services/menu.

export const SERVICE_BOOKING_MAP = {
  // ── Injectables ──
  tox:               { type: 'service', blvdId: 's_f57a8a20-d32d-4e1a-bb78-5f366dc73cf1', name: 'Tox' },
  filler:            { type: 'service', blvdId: 's_3fd6eb78-f596-486f-a2b0-179e33b424f7', name: 'Dermal Fillers' },
  'facial-balancing': { type: 'service', blvdId: 's_0b53c178-1c07-4620-bf6e-505c5f76a24a', name: 'Facial Balancing Consultation' },
  sculptra:          { type: 'service', blvdId: 's_40baf4e1-3e0a-4737-8608-518e169e7b8e', name: 'Sculptra' },

  // ── Facials ──
  facials:           { type: 'category', match: 'signature facials', name: 'Signature Facials' },
  glo2facial:        { type: 'category', match: 'glo2facial', name: 'Glo2Facial' },
  hydrafacial:       { type: 'category', match: 'hydrafacial', name: 'HydraFacial' },
  peels:             { type: 'category', match: 'signature facials', name: 'Peels & Facials' },
  skinpen:           { type: 'service', blvdId: 's_9be00f2c-f0c5-4333-abbc-3fb955562838', name: 'SkinPen Microneedling' },
  'skin-iq':         { type: 'category', match: 'skin iq', name: 'Skin IQ' },

  // ── Lasers ──
  lasers:            { type: 'category', match: 'laser treatments', name: 'Laser Treatments' },
  ipl:               { type: 'service', blvdId: 's_8f5b3d81-58f0-400e-93dd-c83b0ca60e41', name: 'IPL Photofacial' },
  clearlift:         { type: 'service', blvdId: 's_ef2b57db-69d7-49ee-89e9-27475ea1001e', name: 'ClearLift' },
  clearskin:         { type: 'service', blvdId: 's_0df5eeda-be41-4f67-94d8-1e21a7dacba0', name: 'ClearSkin' },
  vascupen:          { type: 'service', blvdId: 's_3b9e9259-c659-400d-ac22-d8cd7db3676b', name: 'VascuPen' },
  'laser-hair-removal': { type: 'service', blvdId: 's_20eba50f-1d8b-434b-bb64-b8fd8bca016e', name: 'Laser Hair Removal' },

  // ── Wow Results ──
  morpheus8:         { type: 'service', blvdId: 's_f7e2d350-427f-4292-97aa-eb74fc86d228', name: 'Morpheus8' },
  co2:               { type: 'category', match: 'laser treatments', name: 'CO₂ Laser' },
  opus:              { type: 'service', blvdId: 's_35e8d13c-516c-4a84-a4b6-2fd81e065d23', name: 'Opus Plasma' },

  // ── Massage & Body ──
  massage:           { type: 'category', match: 'massage', name: 'Massage' },
  'salt-sauna':      { type: 'category', match: 'sauna', name: 'IR Sauna & Salt Booth' },
  evolvex:           { type: 'service', blvdId: 's_f132103a-ff13-465c-8e26-6ee2370cb909', name: 'EvolveX Body Contouring' },

  // ── Consultations ──
  consult:           { type: 'category', match: 'not sure where to start', name: 'Not Sure Where to Start' },
  'tox-consult':     { type: 'service', blvdId: 's_2f718b9d-27b3-48a6-8877-f29e45ed37d4', name: 'Consultation for Botox, Dysport, Jeuveau, Daxxify' },
  'getting-started': { type: 'service', blvdId: 's_0b53c178-1c07-4620-bf6e-505c5f76a24a', name: 'GET STARTED by RELUXE' },
  refine:            { type: 'service', blvdId: 's_f776cf0e-0e44-4a3f-bcad-8e0125d004a0', name: 'REFINE by RELUXE' },
  remodel:           { type: 'service', blvdId: 's_38732a5c-cb23-49e0-abb0-b4efa3985e95', name: 'REMODEL by RELUXE' },
}

// Maps a service slug to the right consultation slug for "Free Consult" buttons.
// Services not listed here fall back to generic 'consult' (Not Sure Where to Start).
export const SERVICE_CONSULT_MAP = {
  tox: 'tox-consult',
  botox: 'tox-consult',
  dysport: 'tox-consult',
  jeuveau: 'tox-consult',
  daxxify: 'tox-consult',
  filler: 'facial-balancing',
  rha: 'facial-balancing',
  sculptra: 'facial-balancing',
  'facial-balancing': 'facial-balancing',
}
