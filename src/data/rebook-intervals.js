// src/data/rebook-intervals.js
// Recommended rebooking intervals per service slug (in days).
// Edit these values to change the "Recommended" date suggestion in Quick Rebook.
// If a service isn't listed here, no recommendation is shown.

export const REBOOK_INTERVALS = {
  tox:                  90,   // ~3 months
  filler:               180,  // ~6 months
  sculptra:             120,  // ~4 months
  facials:              28,   // ~4 weeks
  hydrafacial:          28,   // ~4 weeks
  glo2facial:           28,   // ~4 weeks
  morpheus8:            90,   // ~3 months (series of 3, then maintenance)
  microneedling:        42,   // ~6 weeks
  ipl:                  28,   // ~4 weeks (during series)
  'laser-hair-removal': 42,   // ~6 weeks
  massage:              28,   // ~4 weeks
  'co2-resurfacing':    365,  // ~yearly
  'body-contouring':    14,   // ~2 weeks (during series)
}

// Human-readable labels for the intervals
export function formatInterval(days) {
  if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? 's' : ''}`
  if (days >= 28 && days % 7 === 0) return `${Math.round(days / 7)} weeks`
  if (days >= 30) return `~${Math.round(days / 30)} month${days >= 60 ? 's' : ''}`
  return `${days} days`
}
