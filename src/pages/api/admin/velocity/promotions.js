// Admin API: Velocity promotions CRUD
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { active } = req.query
    let query = db.from('velocity_promotions').select('*').order('created_at', { ascending: false })
    if (active === 'true') query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ promotions: data || [] })
  }

  if (req.method === 'POST') {
    const { name, description, amount_cents, trigger_type, expiry_days, one_per_member, max_claims, starts_at, ends_at } = req.body
    if (!name || !amount_cents || !trigger_type) {
      return res.status(400).json({ error: 'name, amount_cents, and trigger_type required' })
    }

    const { data, error } = await db.from('velocity_promotions').insert({
      name,
      description: description || null,
      amount_cents,
      trigger_type,
      expiry_days: expiry_days || 90,
      one_per_member: one_per_member !== false,
      max_claims: max_claims || null,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, promotion: data })
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { error } = await db.from('velocity_promotions').update(updates).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
