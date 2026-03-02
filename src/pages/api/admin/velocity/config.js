// Admin API: Velocity config GET/PUT
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { data: configs } = await db.from('velocity_config').select('*').order('location_key', { ascending: true, nullsFirst: true })
    const { data: multipliers } = await db.from('velocity_service_multipliers').select('*').order('created_at', { ascending: false })
    return res.json({ configs: configs || [], multipliers: multipliers || [] })
  }

  if (req.method === 'PUT') {
    const { location_key, earn_rate, expiry_days, excluded_service_slugs, is_active } = req.body
    const updates = { updated_at: new Date().toISOString() }
    if (earn_rate !== undefined) updates.earn_rate = earn_rate
    if (expiry_days !== undefined) updates.expiry_days = expiry_days
    if (excluded_service_slugs !== undefined) updates.excluded_service_slugs = excluded_service_slugs
    if (is_active !== undefined) {
      updates.is_active = is_active
      if (!is_active) updates.paused_at = new Date().toISOString()
      else updates.paused_at = null
    }

    const query = db.from('velocity_config').update(updates)
    if (location_key) query.eq('location_key', location_key)
    else query.is('location_key', null)

    const { error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
