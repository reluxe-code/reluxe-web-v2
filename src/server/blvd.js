// src/server/blvd.js
import { Blvd } from '@boulevard/blvd-book-sdk'

if (!process.env.BLVD_API_KEY || !process.env.BLVD_BUSINESS_ID) {
  throw new Error('Missing BLVD_API_KEY or BLVD_BUSINESS_ID')
}

export const blvd = new Blvd(
  process.env.BLVD_API_KEY,
  process.env.BLVD_BUSINESS_ID
)

export async function getLocationById(locationId) {
  const business = await blvd.businesses.get()
  const locations = await business.getLocations()
  const id = locationId || process.env.BLVD_DEFAULT_LOCATION_ID
  const loc = locations.find(l => l.id === id)
  if (!loc) throw new Error(`Location not found: ${id}`)
  return loc
}
