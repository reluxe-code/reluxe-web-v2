// src/server/blvd.js
// Book SDK client for customer-facing booking flows.
import { Blvd, PlatformTarget } from '@boulevard/blvd-book-sdk'

// Same API key works for both Book SDK (client) and Admin API.
// Admin API additionally requires the secret — see blvdAdmin.js.
const API_KEY = process.env.BLVD_ADMIN_API_KEY
const BUSINESS_ID = process.env.BLVD_BUSINESS_ID

if (!API_KEY) throw new Error('Missing env var: BLVD_ADMIN_API_KEY')
if (!BUSINESS_ID) throw new Error('Missing env var: BLVD_BUSINESS_ID')

export const blvd = new Blvd(API_KEY, BUSINESS_ID, PlatformTarget.Live)

// Location UUIDs — the SDK returns URN-format IDs (urn:blvd:Location:uuid)
// so we match by checking if the SDK ID contains our UUID.
export const LOCATION_IDS = {
  westfield: process.env.BLVD_LOCATION_ID_WESTFIELD || 'cf34bcaa-6702-46c6-9f5f-43be8943cc58',
  carmel: process.env.BLVD_LOCATION_ID_CARMEL || '3ce18260-2e1f-4beb-8fcf-341bc85a682c',
}

export async function getLocationById(locationId) {
  const business = await blvd.businesses.get()
  const locations = await business.getLocations()
  const id = locationId || process.env.BLVD_DEFAULT_LOCATION_ID
  // SDK returns URN-format IDs like urn:blvd:Location:uuid — match flexibly
  const loc = locations.find((l) => l.id === id || l.id === `urn:blvd:Location:${id}` || l.id?.includes(id))
  if (!loc) throw new Error(`Location not found: ${id}`)
  return loc
}

/**
 * Create a cart at a location, find a specific bookable item,
 * optionally lock to a specific staff member and options, and add it.
 * Returns { cart, item, staffVariant } for further operations.
 *
 * @param {string} locationKey - e.g. 'westfield', 'carmel'
 * @param {string} serviceItemId - Boulevard service item ID
 * @param {string} [staffProviderId] - Boulevard staff ID
 * @param {string[]} [selectedOptionIds] - IDs of selected options from option groups
 */
export async function createCartWithItem(locationKey, serviceItemId, staffProviderId, selectedOptionIds) {
  const locationId = LOCATION_IDS[locationKey]
  if (!locationId) throw new Error(`Unknown location: ${locationKey}`)

  const location = await getLocationById(locationId)
  let cart = await blvd.carts.create(location)

  const categories = await cart.getAvailableCategories()
  const allItems = categories.flatMap((c) => c.availableItems || [])

  // SDK may return URN or plain IDs — match flexibly
  const item = allItems.find((i) => i.id === serviceItemId || i.id?.includes(serviceItemId) || serviceItemId?.includes(i.id))
  if (!item) throw new Error(`Service item not found: ${serviceItemId}`)

  let staffVariant = undefined
  if (staffProviderId) {
    const staffVariants = await item.getStaffVariants()
    staffVariant = staffVariants.find((v) =>
      v.staff?.id === staffProviderId ||
      v.staff?.id?.includes(staffProviderId) ||
      staffProviderId?.includes(v.staff?.id)
    )
  }

  // Resolve selected options from their IDs
  let selectedOptions = undefined
  if (selectedOptionIds?.length) {
    const optionGroups = await item.getOptionGroups()
    const allOptions = optionGroups.flatMap((g) => g.options || [])
    selectedOptions = selectedOptionIds
      .map((id) => allOptions.find((o) => o.id === id || o.id?.includes(id) || id?.includes(o.id)))
      .filter(Boolean)
  }

  const opts = {}
  if (staffVariant) opts.staffVariant = staffVariant
  if (selectedOptions?.length) opts.options = selectedOptions
  cart = await cart.addBookableItem(item, opts)

  return { cart, item, staffVariant }
}

// Flexible ID match helper
function matchId(sdkId, targetId) {
  return sdkId === targetId || sdkId?.includes(targetId) || targetId?.includes(sdkId)
}

/**
 * Create a cart with MULTIPLE bookable items for the same provider.
 * Used when the client selects additional services (multi-service booking).
 *
 * @param {string} locationKey
 * @param {Array<{ serviceItemId: string, selectedOptionIds?: string[] }>} items
 * @param {string} [staffProviderId]
 * @returns {{ cart, items: Array<{ item, staffVariant }> }}
 */
export async function createCartWithItems(locationKey, items, staffProviderId) {
  const locationId = LOCATION_IDS[locationKey]
  if (!locationId) throw new Error(`Unknown location: ${locationKey}`)

  const location = await getLocationById(locationId)
  let cart = await blvd.carts.create(location)

  // Fetch available items ONCE for all services
  const categories = await cart.getAvailableCategories()
  const allAvailable = categories.flatMap((c) => c.availableItems || [])

  const results = []

  for (const { serviceItemId, selectedOptionIds } of items) {
    const item = allAvailable.find((i) => matchId(i.id, serviceItemId))
    if (!item) throw new Error(`Service item not found: ${serviceItemId}`)

    let staffVariant = undefined
    if (staffProviderId) {
      const staffVariants = await item.getStaffVariants()
      staffVariant = staffVariants.find((v) => matchId(v.staff?.id, staffProviderId))
    }

    let selectedOptions = undefined
    if (selectedOptionIds?.length) {
      const optionGroups = await item.getOptionGroups()
      const allOptions = optionGroups.flatMap((g) => g.options || [])
      selectedOptions = selectedOptionIds
        .map((id) => allOptions.find((o) => matchId(o.id, id)))
        .filter(Boolean)
    }

    const opts = {}
    if (staffVariant) opts.staffVariant = staffVariant
    if (selectedOptions?.length) opts.options = selectedOptions

    // Each addBookableItem returns an updated cart reference
    cart = await cart.addBookableItem(item, opts)
    results.push({ item, staffVariant })
  }

  return { cart, items: results }
}
