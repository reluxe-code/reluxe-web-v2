// Admin API: Velocity service multipliers CRUD
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { active } = req.query
    let query = db.from('velocity_service_multipliers').select('*').order('created_at', { ascending: false })
    if (active === 'true') query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ multipliers: data || [] })
  }

  if (req.method === 'POST') {
    const { service_slug, multiplier, label, starts_at, ends_at, location_key } = req.body
    if (!service_slug || !multiplier) return res.status(400).json({ error: 'service_slug and multiplier required' })

    const { data, error } = await db.from('velocity_service_multipliers').insert({
      service_slug,
      multiplier,
      label: label || null,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      location_key: location_key || null,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, multiplier: data })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query
    if (!id) return res.status(400).json({ error: 'id required' })
    const { error } = await db.from('velocity_service_multipliers').update({ is_active: false }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
