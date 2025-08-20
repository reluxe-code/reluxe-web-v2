// src/data/servicePricing.js
// Short, patient-friendly descriptions for preview + pricing pages.

export const servicesData = [
  {
    name: 'Botox',
    slug: 'botox',
    price: 14,                // base price per unit
    memberPrice: 10,          // membership price per unit
    unit: 'unit',
    description: 'Neuromodulator to soften frown lines, forehead lines, and crow’s feet for a smoother, rested look.'
  },
  {
    name: 'Jeuveau',
    slug: 'jeuveau',
    price: 12,
    memberPrice: 9,
    unit: 'unit',
    description: 'A fast-acting neuromodulator similar to Botox, great for softening dynamic lines with a natural finish.'
  },
  {
    name: 'Dysport',
    slug: 'dysport',
    price: 4.5,
    memberPrice: 4,
    unit: 'unit',
    description: 'A fast-acting neuromodulator similar to Botox, great for softening dynamic lines with a natural finish.'
  },
  {
    name: 'SkinPen Microneedling (Series of 4)',
    slug: 'skinpen-microneedling',
    price: 1400,
    note: '4 sessions',
    description: 'FDA-cleared microneedling that stimulates collagen to improve texture, tone, acne scars, and fine lines.'
  },
  {
    name: 'Morpheus8 (Series of 3)',
    slug: 'morpheus8',
    price: 3000,
    note: '3 sessions',
    description: 'Radiofrequency microneedling for skin tightening and contouring with minimal downtime.'
  },
  {
    name: 'Truly Unlimited Laser Hair Removal (12 months)',
    slug: 'laser-hair-removal-unlimited',
    price: 2400,
    description: 'Twelve months of unlimited laser hair removal treatments—smooth skin made simple.'
  },
  {
    name: 'Massage',
    slug: 'massage',
    price: 125,
    memberPrice: 100,
    unit: 'session',
    description: '60-minute therapeutic massage to reduce tension, improve circulation, and reset body & mind.'
  },
  {
    name: 'Dermal Filler',
    slug: 'dermal-filler',
    unit: 'syringe',
    description: 'Hyaluronic-acid fillers to restore volume, enhance lips, and refine contours with natural-looking results.'
  },
  {
    name: 'Sculptra',
    slug: 'sculptra',
    price: 800,
    unit: 'syringe',
    description: 'A collagen-stimulating injectable (PLLA) that gradually restores facial volume and skin firmness.'
  }
]

// (optional exports if you later add bundles/memberships)
export const packagesData = []
export const membershipsData = []
