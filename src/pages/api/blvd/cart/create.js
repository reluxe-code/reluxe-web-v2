// src/pages/api/blvd/cart/create.js
// Creates a cart, adds service(s) with a specific provider + options, finds the
// matching time slot, and reserves it — all on the SAME cart instance.
// Supports single or multi-service bookings.
import { createCartWithItem, createCartWithItems } from '@/server/blvd'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { locationKey, serviceItemId, staffProviderId, date, startTime, selectedOptionIds, additionalItems } = req.body

  if (!locationKey || !serviceItemId || !date || !startTime) {
    return res.status(400).json({ error: 'locationKey, serviceItemId, date, and startTime are required' })
  }

  try {
    let cart, primaryItem, primaryStaffVariant, allItemResults

    if (additionalItems?.length > 0) {
      // Multi-service path
      const items = [
        { serviceItemId, selectedOptionIds },
        ...additionalItems,
      ]
      const result = await createCartWithItems(locationKey, items, staffProviderId)
      cart = result.cart
      primaryItem = result.items[0]?.item
      primaryStaffVariant = result.items[0]?.staffVariant
      allItemResults = result.items
    } else {
      // Single-service path
      const result = await createCartWithItem(locationKey, serviceItemId, staffProviderId, selectedOptionIds)
      cart = result.cart
      primaryItem = result.item
      primaryStaffVariant = result.staffVariant
      allItemResults = [{ item: result.item, staffVariant: result.staffVariant }]
    }

    // Get bookable times for this date on THIS cart
    // With multiple items, Boulevard returns only slots where ALL items fit
    const times = await cart.getBookableTimes({ date })

    const match = (times || []).find(t => t.startTime === startTime)
    if (!match) {
      return res.status(409).json({ error: 'That time slot is no longer available. Please pick another.' })
    }

    const reserved = await cart.reserveBookableItems(match)

    // Compute total duration across all items
    const totalDuration = allItemResults.reduce((sum, r) => {
      return sum + (r.staffVariant?.duration || r.item?.listDurationRange?.max || 0)
    }, 0)

    res.json({
      cartId: reserved.id,
      expiresAt: reserved.expiresAt || null,
      duration: totalDuration || null,
      summary: {
        location: locationKey,
        serviceName: primaryItem?.name || 'Service',
        staffName: primaryStaffVariant?.staff?.name || null,
        additionalServiceNames: allItemResults.slice(1).map(r => r.item?.name).filter(Boolean),
        date,
        startTime,
        duration: totalDuration || null,
      },
    })
  } catch (err) {
    console.error('[blvd/cart/create]', err.message)
    res.status(500).json({ error: 'Failed to reserve. Please try again.' })
  }
}
