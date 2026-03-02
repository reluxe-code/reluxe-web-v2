// src/pages/api/admin/social-engine/providers.js
// Lists bookable providers with their services and locations.
import { getServiceClient } from '@/lib/supabase'
import { SERVICE_BOOKING_MAP } from '@/data/serviceBookingMap'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  const { data: staff, error } = await db
    .from('staff')
    .select('slug, name, title, featured_image, boulevard_provider_id, boulevard_service_map, locations')
    .eq('status', 'published')
    .not('boulevard_provider_id', 'is', null)
    .order('name')

  if (error) {
    console.error('[social-engine/providers]', error.message)
    return res.status(500).json({ error: error.message })
  }

  const providers = (staff || [])
    .filter(s => s.boulevard_service_map && Object.keys(s.boulevard_service_map).length > 0)
    .map(s => {
      // Normalize locations to keys
      const locs = (Array.isArray(s.locations) ? s.locations : [])
        .map(l => {
          const slug = (l.slug || l.title || '').toLowerCase()
          if (slug.includes('westfield')) return 'westfield'
          if (slug.includes('carmel')) return 'carmel'
          return null
        })
        .filter(Boolean)

      // Build services with human-readable names
      const services = {}
      for (const [slug, locMap] of Object.entries(s.boulevard_service_map || {})) {
        const mapEntry = SERVICE_BOOKING_MAP[slug]
        services[slug] = {
          name: mapEntry?.name || slug,
          locations: Object.keys(locMap || {}),
        }
      }

      return {
        slug: s.slug,
        name: s.name,
        title: s.title,
        image: s.featured_image,
        boulevardProviderId: s.boulevard_provider_id,
        locations: [...new Set(locs)],
        services,
      }
    })

  res.json(providers)
}

export default withAdminAuth(handler)
