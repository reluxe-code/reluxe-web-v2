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
import { fireCAPIEvent, buildUserData } from '@/lib/metaCAPI'
import { getServiceClient } from '@/lib/supabase'
import { createRateLimiter, getClientIp, applyRateLimit } from '@/lib/rateLimit'
import { hashPhone, hashEmail } from '@/lib/piiHash'

const limiter = createRateLimiter('checkout', 5, 60_000) // 5/min per IP

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (applyRateLimit(req, res, limiter, getClientIp(req))) return

  const { cartId } = req.query
  const { firstName, lastName, email, phone, ownershipVerified, referralCode, locationKey, bookingSessionId, allowDuplicate } = req.body
  const hasClientInfo = firstName && lastName && email

  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' })
  }
  if (!hasClientInfo && !ownershipVerified) {
    return res.status(400).json({ error: 'Client info or ownership verification required' })
  }

  // --- Duplicate booking check (uses blvd_appointments for real status) ---
  if (!allowDuplicate && (phone || email)) {
    try {
      const db = getServiceClient()

      // Find matching client(s) by phone or email
      const clientConditions = []
      if (phone) {
        const digits = phone.replace(/\D/g, '').slice(-10)
        if (digits.length === 10) clientConditions.push(`phone.like.%${digits}`)
      }
      if (email) clientConditions.push(`email.ilike.${email.toLowerCase()}`)

      if (clientConditions.length) {
        const { data: clients } = await db
          .from('blvd_clients')
          .select('id')
          .or(clientConditions.join(','))
          .limit(10)

        if (clients?.length) {
          const clientIds = clients.map((c) => c.id)
          let apptQuery = db
            .from('blvd_appointments')
            .select('boulevard_id, location_key, start_at, status, blvd_appointment_services(service_name)')
            .in('client_id', clientIds)
            .not('status', 'in', '(cancelled,no_show)')
            .gte('start_at', new Date().toISOString())
            .order('start_at', { ascending: true })
            .limit(3)

          if (locationKey) apptQuery = apptQuery.eq('location_key', locationKey)

          const { data: upcomingAppts } = await apptQuery

          if (upcomingAppts?.length) {
            return res.status(409).json({
              error: 'You already have an upcoming appointment.',
              existingBookings: upcomingAppts.map((a) => ({
                service: a.blvd_appointment_services?.[0]?.service_name || 'Service',
                provider: null,
                location: a.location_key || null,
                completedAt: a.start_at,
              })),
              message: 'It looks like you already have an upcoming appointment. If this is a different one, you can confirm to proceed.',
              allowDuplicateFlag: true,
            })
          }
        }
      }
    } catch (dupeErr) {
      // Non-blocking: if the check fails, allow checkout to proceed
      console.warn('[blvd/checkout] Duplicate check failed:', dupeErr.message)
    }
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

    // Require client info to be present on the cart before checkout
    const finalClient = cart.clientInformation
    if (!finalClient?.firstName || !finalClient?.email) {
      return res.status(400).json({ error: 'Client information is required to complete checkout.' })
    }

    // Try normal SDK checkout first
    let result
    try {
      result = await cart.checkout()
    } catch (sdkErr) {
      const msg = sdkErr.message || ''
      // Only allow Admin API fallback for specific safe scenarios
      // (e.g. free services where no payment method is needed)
      const isSafeToFallback = msg.includes('payment') && !cart.summary?.paymentMethodRequired
      if (!isSafeToFallback) {
        console.error('[blvd/checkout] SDK checkout failed (no safe fallback):', msg)
        throw sdkErr
      }
      console.log('[blvd/checkout] SDK checkout failed (payment not required, using Admin fallback):', msg)
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
      console.log('[blvd/checkout] Admin API checkout succeeded (safe fallback)')
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
        source: 'checkout',
      }).catch((err) => console.warn('[checkout] Bird sync failed:', err.message))
    }

    // Fire-and-forget: Meta CAPI Schedule event (deduped with browser via event_id)
    fireCAPIEvent({
      eventName: 'Schedule',
      eventId: req.body.event_id || undefined,
      eventSourceUrl: req.headers.referer || 'https://reluxemedspa.com',
      actionSource: 'website',
      userData: buildUserData({
        email: email || ci.email,
        phone: contactPhone,
        firstName: firstName || ci.firstName,
        lastName: lastName || ci.lastName,
        fbp: req.cookies?._fbp || req.body._fbp,
        fbc: req.cookies?._fbc || req.body._fbc,
        clientIp: getClientIp(req),
        userAgent: req.headers['user-agent'],
      }),
      customData: {
        content_name: req.body.serviceName || 'Appointment',
        content_type: 'product',
        currency: 'USD',
      },
    })

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
