// src/pages/api/blvd/cart/[cartId]/verify-code.js
// Verifies the SMS code, takes ownership, and re-reserves the time slot.
// Boulevard's takeOwnershipByCode clears the reserved time, so we must re-reserve.
import { blvd } from '@/server/blvd'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { cartId } = req.query
  const { codeId, code, date, startTime } = req.body

  if (!cartId || !codeId || !code) {
    return res.status(400).json({ error: 'cartId, codeId, and code are required' })
  }

  try {
    let cart = await blvd.carts.get(cartId)
    cart = await cart.takeOwnershipByCode(codeId, parseInt(code, 10))

    // takeOwnershipByCode clears the reserved time — re-reserve it
    if (date && startTime) {
      const times = await cart.getBookableTimes({ date })
      const match = (times || []).find((t) => t.startTime === startTime)
      if (match) {
        cart = await cart.reserveBookableItems(match)
        console.log('[blvd/verify-code] Re-reserved time slot after ownership')
      } else {
        console.warn('[blvd/verify-code] Could not re-reserve: time slot no longer available')
      }
    }

    const client = cart.clientInformation || null
    return res.json({
      verified: true,
      expiresAt: cart.expiresAt || null,
      client: client
        ? {
            firstName: client.firstName || '',
            lastName: client.lastName || '',
            email: client.email || '',
          }
        : null,
    })
  } catch (err) {
    console.error('[blvd/verify-code]', err.message)
    return res.status(400).json({ error: 'Invalid code. Please try again.' })
  }
}
