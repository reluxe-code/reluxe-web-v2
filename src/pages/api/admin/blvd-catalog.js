// src/pages/api/admin/blvd-catalog.js
// Search the cached Boulevard service catalog.
// GET ?q=facial&location=westfield
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { q, location } = req.query
  const db = getServiceClient()

  let query = db
    .from('blvd_service_catalog')
    .select('id, name, category_name, location_key, duration_min, price_min')
    .order('category_name')
    .order('name')
    .limit(50)

  if (q && q.trim()) {
    query = query.ilike('name', `%${q.trim()}%`)
  }

  if (location && location !== 'all') {
    query = query.eq('location_key', location)
  }

  const { data, error } = await query

  if (error) {
    console.error('[blvd-catalog]', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.json(data || [])
}
