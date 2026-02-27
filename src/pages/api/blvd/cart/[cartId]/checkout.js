// src/pages/api/blvd/cart/[cartId]/checkout.js
// Updates client info on a reserved cart and completes checkout.
// After phone verification (takeOwnershipByCode), Boulevard links the client
// but clientInformation still needs to be explicitly set for checkout.
//
// If the client-facing SDK checkout fails (e.g. payment method required),
// we fall back to the Admin API's checkoutCart mutation which bypasses
// client payment requirements.
import { blvd } from '@/server/blvd'
import { adminQuery } from '@/server/blvdAdmin'
import { upsertBirdContact } from '@/lib/birdContacts'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { cartId } = req.query
  const { firstName, lastName, email, phone, ownershipVerified, referralCode, locationKey, bookingSessionId } = req.body
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
      paymentMethodRequired: cart.summary?.paymentMethodRequired,
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
      // Ownership was taken but no client info on cart — skip to Admin API checkout
      console.log('[blvd/checkout] Ownership verified but no client info on cart — using Admin API')
    }

    // Try normal SDK checkout first, fall back to Admin API
    let result
    try {
      result = await cart.checkout()
    } catch (sdkErr) {
      console.log('[blvd/checkout] SDK checkout failed:', sdkErr.message, '— falling back to Admin API')
      // Fall back to Admin API checkout — bypasses payment/client info requirements
      const adminResult = await adminQuery(
        `mutation CheckoutCart($input: CheckoutCartInput!) {
          checkoutCart(input: $input) {
            cart { id completedAt }
            appointments { appointmentId clientId forCartOwner }
          }
        }`,
        { input: { id: cartId } }
      )
      result = adminResult.checkoutCart
      console.log('[blvd/checkout] Admin API checkout succeeded')
    }

    const appointment = result.appointments?.[0]
    const ci = cart.clientInformation || {}

    // Attribute referral if code present (fire-and-forget)
    const refCode = referralCode || req.cookies?.reluxe_ref
    if (refCode && appointment?.clientId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`
      fetch(`${siteUrl}/api/referral/attribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: refCode,
          phone: phone || ci.phoneNumber || null,
          email: email || ci.email || null,
          appointmentId: appointment.appointmentId,
          clientId: appointment.clientId,
          locationKey: locationKey || null,
          bookingSessionId: bookingSessionId || null,
        }),
      }).catch((e) => console.warn('[checkout] referral attribution failed:', e.message))
    }

    // Fire-and-forget: upsert booking contact to Bird
    const contactPhone = phone || ci.phoneNumber
    if (contactPhone) {
      upsertBirdContact({
        phone: contactPhone,
        email: (email || ci.email || '').toLowerCase() || undefined,
        firstName: firstName || ci.firstName || undefined,
        lastName: lastName || ci.lastName || undefined,
      }).catch((err) => console.warn('[checkout] Bird sync failed:', err.message))
    }

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
