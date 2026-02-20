import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { id, locations } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id is required' })
  if (!Array.isArray(locations)) return res.status(400).json({ error: 'locations array is required' })

  try {
    const db = getServiceClient()
    const normalized = locations
      .map((loc) => ({
        slug: String(loc?.slug || '').toLowerCase(),
        title: String(loc?.title || ''),
      }))
      .filter((loc) => loc.slug === 'westfield' || loc.slug === 'carmel')

    const { data, error } = await db
      .from('staff')
      .update({ locations: normalized, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, locations')
      .single()

    if (error) throw error
    return res.json({ ok: true, staff: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

