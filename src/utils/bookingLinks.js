// src/utils/bookingLinks.js
// Pure helpers: caller passes `isAvailable` so there’s no dependency on locationAvailability.

export function getBookLinkForCity({ service, cityKey, isAvailable }) {
  const byLoc = service?.bookingLinkByLocation || {};
  const defaultLink = service?.bookingLink || `/book/${service?.slug || ''}`;

  let link = byLoc[cityKey] || defaultLink;

  // If Carmel doesn’t offer it, fall back to Westfield’s booking link (or default)
  if (cityKey === 'carmel' && isAvailable === false) {
    link = byLoc['westfield'] || defaultLink;
  }
  return link;
}

export function getConsultLinkForCity({ service, cityKey, isAvailable }) {
  const byLoc = service?.consultLinkByLocation || {};
  const defaultConsult = service?.consultLink || '/book/consult';

  let link = byLoc[cityKey] || defaultConsult;

  if (cityKey === 'carmel' && isAvailable === false) {
    link = byLoc['westfield'] || defaultConsult;
  }
  return link;
}
