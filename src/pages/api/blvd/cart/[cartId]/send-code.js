// src/pages/api/blvd/cart/[cartId]/send-code.js
// Sends an SMS verification code via Boulevard's cart ownership flow.
import { blvd } from '@/server/blvd'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { cartId } = req.query
  const { phone } = req.body

  if (!cartId || !phone) {
    return res.status(400).json({ error: 'cartId and phone are required' })
  }

  try {
    const cart = await blvd.carts.get(cartId)
    const codeId = await cart.sendOwnershipCodeBySms(phone)
    return res.json({ codeId })
  } catch (err) {
    console.error('[blvd/send-code] Error:', err.message, err.stack)
    console.error('[blvd/send-code] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)))

    // Return the actual error so we can debug, plus skipVerification flag
    // so the client can still proceed to the details form.
    return res.status(422).json({
      error: err.message || 'Could not send verification code.',
      detail: err.message,
      skipVerification: true,
    })
  }
}
