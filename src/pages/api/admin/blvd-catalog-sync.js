// src/pages/api/admin/blvd-catalog-sync.js
// Syncs the full Boulevard service catalog into Supabase for admin search.
import { blvd, LOCATION_IDS, getLocationById } from '@/server/blvd'
import { getServiceClient } from '@/lib/supabase'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  const results = { synced: 0, locations: {} }

  try {
    for (const [locationKey, locationId] of Object.entries(LOCATION_IDS)) {
      const location = await getLocationById(locationId)
      const cart = await blvd.carts.create(location)
      const categories = await cart.getAvailableCategories()

      const rows = []
      for (const category of categories) {
        for (const item of category.availableItems || []) {
          rows.push({
            id: item.id,
            name: item.name,
            category_name: category.name,
            location_key: locationKey,
            description: item.description || null,
            duration_min: item.listDurationRange?.min ?? null,
            duration_max: item.listDurationRange?.max ?? null,
            price_min: item.listPriceRange?.min ?? null,
            price_max: item.listPriceRange?.max ?? null,
            synced_at: new Date().toISOString(),
          })
        }
      }

      if (rows.length > 0) {
        const { error } = await db
          .from('blvd_service_catalog')
          .upsert(rows, { onConflict: 'id' })

        if (error) throw new Error(`Upsert error (${locationKey}): ${error.message}`)
      }

      results.locations[locationKey] = rows.length
      results.synced += rows.length
    }

    res.json({ ok: true, ...results })
  } catch (err) {
    console.error('[blvd-catalog-sync]', err.message)
    res.status(500).json({ error: err.message })
  }
}
