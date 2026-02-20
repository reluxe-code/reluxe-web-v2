// src/pages/api/blvd/cart/[cartId]/checkout.js
// Updates client info on a reserved cart and completes checkout.
// After phone verification (takeOwnershipByCode), Boulevard links the client
// but clientInformation still needs to be explicitly set for checkout.
import { blvd } from '@/server/blvd'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { cartId } = req.query
  const { firstName, lastName, email, phone, ownershipVerified } = req.body
  const hasClientInfo = firstName && lastName && email

  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' })
  }
  if (!hasClientInfo && !ownershipVerified) {
    return res.status(400).json({ error: 'Client info or ownership verification required' })
  }

  try {
    let cart = await blvd.carts.get(cartId)

    // Log cart state for debugging
    const existingClient = cart.clientInformation
    console.log('[blvd/checkout] Cart state:', {
      cartId,
      ownershipVerified,
      hasClientInfo,
      existingClientInfo: existingClient ? {
        firstName: existingClient.firstName,
        lastName: existingClient.lastName,
        email: existingClient.email,
      } : null,
    })

    if (hasClientInfo) {
      // Explicit client info provided (new client or manual entry)
      cart = await cart.update({
        clientInformation: {
          firstName,
          lastName,
          email,
          phoneNumber: phone || undefined,
        },
      })
    } else if (ownershipVerified && existingClient?.firstName && existingClient?.email) {
      // Ownership set clientInformation — we're good
      console.log('[blvd/checkout] Using existing client info from ownership')
    } else if (ownershipVerified) {
      // Ownership was taken but no client info on cart — need it from user
      console.log('[blvd/checkout] Ownership verified but no client info on cart')
      return res.status(422).json({
        error: 'Please provide your details to complete the booking.',
        needsClientInfo: true,
      })
    }

    const result = await cart.checkout()
    const appointment = result.appointments?.[0]
    const ci = cart.clientInformation || {}

    res.json({
      success: true,
      appointmentId: appointment?.appointmentId || null,
      clientId: appointment?.clientId || null,
      confirmation: {
        firstName: firstName || ci.firstName || '',
        lastName: lastName || ci.lastName || '',
        email: email || ci.email || '',
      },
    })
  } catch (err) {
    console.error('[blvd/cart/checkout] FULL ERROR:', err.message)
    console.error('[blvd/cart/checkout] Stack:', err.stack)

    if (err.message?.includes('expired') || err.message?.includes('Expired')) {
      return res.status(410).json({ error: 'Reservation expired. Please select a new time.' })
    }
    // Return the actual error so we can debug
    res.status(500).json({ error: err.message || 'Checkout failed. Please try again.' })
  }
}
