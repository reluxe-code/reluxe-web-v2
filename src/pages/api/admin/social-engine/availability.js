// src/pages/api/admin/social-engine/availability.js
// Fetches open time slots for a provider+location+service+date.
import { getServiceClient } from '@/lib/supabase'
import { createCartWithItem } from '@/server/blvd'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { providerSlug, locationKey, serviceSlug, date, debug } = req.query

  if (!providerSlug || !locationKey || !serviceSlug || !date) {
    return res.status(400).json({ error: 'providerSlug, locationKey, serviceSlug, and date are required' })
  }

  const db = getServiceClient()

  // Look up provider
  const { data: provider, error: pErr } = await db
    .from('staff')
    .select('boulevard_provider_id, boulevard_service_map')
    .eq('slug', providerSlug)
    .eq('status', 'published')
    .single()

  if (pErr || !provider) {
    return res.status(404).json({ error: 'Provider not found', slug: providerSlug })
  }

  const serviceItemId = provider.boulevard_service_map?.[serviceSlug]?.[locationKey]
  if (!serviceItemId) {
    // Return all mapped services for debugging
    const mapped = Object.entries(provider.boulevard_service_map || {}).map(([svc, locs]) => ({
      service: svc,
      locations: Object.keys(locs || {}),
    }))
    return res.status(404).json({
      error: `Provider does not offer ${serviceSlug} at ${locationKey}`,
      mapped,
    })
  }

  console.log(`[social-engine/availability] ${providerSlug} | ${serviceSlug} @ ${locationKey} | serviceItemId=${serviceItemId} | blvdProviderId=${provider.boulevard_provider_id}`)

  try {
    const result = await createCartWithItem(locationKey, serviceItemId, provider.boulevard_provider_id)

    if (result.staffMismatch) {
      // Log the mismatch details for debugging
      console.warn(
        `[social-engine/availability] STAFF MISMATCH: provider=${providerSlug}, ` +
        `blvdProviderId=${provider.boulevard_provider_id}, ` +
        `serviceItemId=${serviceItemId}, location=${locationKey}`
      )

      // Try to get the actual staff variants for diagnosis
      let variantInfo = []
      try {
        if (result.item) {
          const variants = await result.item.getStaffVariants()
          variantInfo = (variants || []).map(v => ({
            staffId: v.staff?.id,
            staffName: v.staff?.displayName || v.staff?.name || 'unknown',
          }))
          console.warn(
            `[social-engine/availability] Available staff variants:`,
            JSON.stringify(variantInfo)
          )
        }
      } catch {}

      return res.json({
        date,
        slots: [],
        reason: 'staff_mismatch',
        detail: `Provider's Boulevard ID (${provider.boulevard_provider_id}) not found in staff variants for this service.`,
        variants: debug ? variantInfo : undefined,
      })
    }

    if (!result.cart) {
      return res.json({ date, slots: [], reason: 'no_cart' })
    }

    const times = await result.cart.getBookableTimes({ date })

    const slots = (times || []).map(t => {
      const raw = t.startTime || ''
      const d = new Date(raw)
      const label = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      })

      return {
        id: t.id || `${date}T${raw}`,
        startTime: raw,
        label,
      }
    })

    console.log(`[social-engine/availability] ${providerSlug} → ${slots.length} slots for ${date}`)
    res.json({ date, slots })
  } catch (err) {
    console.error('[social-engine/availability]', err.message)
    res.status(503).json({ error: 'Failed to fetch availability', detail: err.message })
  }
}
