// src/pages/api/member/rebook.js
// Quick rebook: creates cart, reserves time, checks out in one call.
// Requires authenticated member. Uses client info from members table
// instead of SMS verification.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { createCartWithItem } from '@/server/blvd'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const { serviceSlug, locationKey, providerStaffId, date, startTime } = req.body
  if (!serviceSlug || !locationKey || !providerStaffId || !date || !startTime) {
    return res.status(400).json({ error: 'serviceSlug, locationKey, providerStaffId, date, and startTime are required' })
  }

  // Authenticate
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired session' })

  const db = getServiceClient()

  // Get member info
  const { data: member } = await db
    .from('members')
    .select('id, phone, first_name, last_name, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })
  if (!member.first_name || !member.email) {
    return res.status(422).json({ error: 'Please update your profile with name and email before rebooking.' })
  }

  // Get provider's Boulevard IDs
  const { data: staff } = await db
    .from('staff')
    .select('boulevard_provider_id, boulevard_service_map')
    .eq('id', providerStaffId)
    .maybeSingle()

  if (!staff?.boulevard_provider_id) {
    return res.status(400).json({ error: 'Provider not available for online booking' })
  }

  // Resolve service item ID
  const serviceMap = staff.boulevard_service_map || {}
  const serviceItemId = serviceMap[serviceSlug]?.[locationKey]
  if (!serviceItemId) {
    return res.status(400).json({ error: `Service "${serviceSlug}" not available at this location for this provider` })
  }

  try {
    // 1. Create cart + add service
    const { cart: cartWithItem, item } = await createCartWithItem(
      locationKey,
      serviceItemId,
      staff.boulevard_provider_id
    )

    // Verify the resolved service matches expectations
    const actualServiceName = item?.name || null
    console.log(`[member/rebook] slug=${serviceSlug} → itemId=${serviceItemId} → Boulevard name="${actualServiceName}"`)

    // 2. Get available times for this date
    const times = await cartWithItem.getBookableTimes({ date })
    const match = (times || []).find(t => t.startTime === startTime)
    if (!match) {
      return res.status(409).json({ error: 'That time slot is no longer available. Please pick another.' })
    }

    // 3. Reserve the time slot
    let cart = await cartWithItem.reserveBookableItems(match)

    // 4. Set client info (no SMS needed — member is already authenticated)
    cart = await cart.update({
      clientInformation: {
        firstName: member.first_name,
        lastName: member.last_name || '',
        email: member.email,
        phoneNumber: member.phone,
      },
    })

    // 5. Checkout
    const result = await cart.checkout()
    const appointment = result.appointments?.[0]

    res.json({
      success: true,
      appointmentId: appointment?.appointmentId || null,
      confirmation: {
        service: serviceSlug,
        serviceName: actualServiceName,
        location: locationKey,
        date,
        startTime,
        firstName: member.first_name,
      },
    })
  } catch (err) {
    console.error('[member/rebook]', err.message)

    if (err.message?.includes('expired') || err.message?.includes('Expired')) {
      return res.status(410).json({ error: 'Reservation expired. Please try again.' })
    }
    res.status(500).json({ error: err.message || 'Booking failed. Please try again.' })
  }
}
