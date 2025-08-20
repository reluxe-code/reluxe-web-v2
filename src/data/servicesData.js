// src/data/servicesData.js
export const services = [
  { name: 'Jeuveau', price: '$12/unit' },
  { name: 'Dysport', price: '$4.50/unit' },
  { name: 'Juvederm or RHA Fillers', price: '$650‑800 / syringe' },
  { name: 'Sculptra', price: '$800 / vial' },
  // ... more injectables
];
export const facials = [
  { name: 'Signature Facial', price: '$150' },
  { name: 'Hydrafacial', price: 'Express $195 • RELUXE $275 • Platinum $325' },
  { name: 'GLO2Facial', price: 'Express $175 • RELUXE $250 • Platinum $325' },
  // ... peels, etc.
];
export const lasers = [
  { name: 'OPUS Plasma', price: '$600 / 1 • $1500 / 3' },
  { name: 'Morpheus8', price: '$900 / 1 • $2400 / 3 • $4200 / 6' },
  { name: 'Laser Hair Removal (Unlimited 24m)', price: '$2400' },
  // ...
];

export const memberships = [
  {
    tier: 'Renew Standard VIP',
    monthly: '$100/mo',
    yearly: '$1000/yr',
    benefits: [
      '1 Standard Service Credit',
      '1 Booth Session Credit',
      '10% off services & packages',
      '$10/unit Botox/Jeuveau, $4/unit Dysport',
      '$50 off filler & Sculptra syringes',
    ],
  },
  {
    tier: 'Renew Premium VIP (most popular)',
    monthly: '$200/mo',
    yearly: '$2000/yr',
    benefits: [
      '1 Premium Service Credit',
      'Booth Session Credit',
      '15% off products',
      '50 units Jeuveau/Botox or equivalent premium services',
      // ...
    ],
  },
];

export const packages = [
  { name: '12 Hydrafacials or GLO2Facials', price: '$2400 (sharable credits)' },
  { name: '12 Massage or Facial', price: '$980 (sharable)' },
  { name: 'Bride Package', price: '3 / 6 / 9 / 12 mo — $1000 / 1800 / 2500 / 3100' },
  {
    name: 'Unlimited Laser Hair Removal',
    price: '$2400 for 24-month unlimited sessions',
    details: [
      'Any 2 standard areas + up to 2 x‑small areas per session',
      'Best value for long-term hair removal',
    ],
  },
];
