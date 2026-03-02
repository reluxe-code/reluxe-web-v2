// /api/admin/gift-cards/promotions
// CRUD for gift card promotions
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { data } = await db
      .from('gift_card_promotions')
      .select('*')
      .order('sort_order', { ascending: true })
    return res.json({ promotions: data || [] })
  }

  if (req.method === 'POST') {
    const {
      name, description, badge_text, promo_code,
      min_purchase_cents, max_purchase_cents,
      promo_type, promo_value_cents, promo_percentage,
      bonus_service_name, bonus_recipient,
      starts_at, ends_at, max_claims, sort_order,
    } = req.body

    if (!name || !promo_type) {
      return res.status(400).json({ error: 'Name and promo type are required' })
    }

    const { data, error } = await db.from('gift_card_promotions').insert({
      name,
      description: description || null,
      badge_text: badge_text || null,
      promo_code: promo_code?.trim()?.toUpperCase() || null,
      min_purchase_cents: min_purchase_cents || 0,
      max_purchase_cents: max_purchase_cents || null,
      promo_type,
      promo_value_cents: promo_value_cents || null,
      promo_percentage: promo_percentage || null,
      bonus_service_name: bonus_service_name || null,
      bonus_recipient: bonus_recipient || 'recipient',
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      max_claims: max_claims || null,
      sort_order: sort_order || 0,
    }).select('*').single()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true, promotion: data })
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'ID required' })

    // Normalize promo_code
    if (updates.promo_code !== undefined) {
      updates.promo_code = updates.promo_code?.trim()?.toUpperCase() || null
    }

    updates.updated_at = new Date().toISOString()

    const { error } = await db.from('gift_card_promotions').update(updates).eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || req.query
    if (!id) return res.status(400).json({ error: 'ID required' })

    const { error } = await db.from('gift_card_promotions').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
