// src/pages/api/admin/social-engine/campaigns.js
// GET: list campaigns with filters. PATCH: update campaign status.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { status, page = '1', limit = '20' } = req.query
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10)

    let query = db
      .from('social_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit, 10) - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) {
      console.error('[social-engine/campaigns]', error.message)
      return res.status(500).json({ error: error.message })
    }

    return res.json({
      campaigns: data || [],
      total: count || 0,
      page: parseInt(page, 10),
      page_size: parseInt(limit, 10),
    })
  }

  if (req.method === 'PATCH') {
    const { id, status, stats } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })

    const updates = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (stats) updates.stats = stats

    const { data, error } = await db
      .from('social_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[social-engine/campaigns]', error.message)
      return res.status(500).json({ error: error.message })
    }

    return res.json({ ok: true, campaign: data })
  }

  res.status(405).json({ error: 'GET or PATCH only' })
}

export default withAdminAuth(handler)
