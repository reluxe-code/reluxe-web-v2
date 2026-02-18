// src/data/locations.js
export const LOCATIONS = [
  {
    key: 'westfield',
    city: 'Westfield',
    state: 'IN',
    label: 'Westfield, IN',
    slugPrefix: '/services', // keep URLs like /services/[slug]/westfield
    existsNote: 'Off US-32 near Birdies',
    address: '514 E State Road 32, Westfield, IN 46074',
    phone: '(317) 763-1142',
    mapUrl: 'https://maps.google.com/?q=RELUXE+Med+Spa+Westfield',
    parking: 'Free lot parking onsite.',
    neighborhoods: ['Grand Park', 'Bridgewater', 'Chatham Hills', 'Downtown Westfield'],
    landmarks: ['Grand Park', 'Birdies', 'Monon Trail'],
    hoursNote: 'Open late select evenings.',
    hoh: false, // House of Health — Carmel only
  },
  {
    key: 'carmel',
    city: 'Carmel',
    state: 'IN',
    label: 'Carmel, IN',
    slugPrefix: '/services',
    existsNote: 'South Carmel, North Indy off of US-31 & 106th Street exit',
    address: '10485 N Pennsylvania St, Carmel, IN 46280',
    phone: '(317) 763-1142',
    mapUrl: 'https://maps.google.com/?q=RELUXE+Med+Spa+Carmel',
    parking: 'Free lot parking available.',
    neighborhoods: ['Arts & Design District', 'Midtown', 'Downtown Carmel', 'Home Place'],
    landmarks: ['Monon Trail', 'Carmel City Center', 'Jackson Grant'],
    hoursNote: 'Convenient daytime appointments available including some 8AM appointments.',
    hoh: true, // House of Health available here
  },
];

export const LOCATION_KEYS = LOCATIONS.map(l => l.key);
export const getLocation = (key) => LOCATIONS.find(l => l.key === key);
