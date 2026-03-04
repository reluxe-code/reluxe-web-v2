// src/pages/api/announcements/active.js
// GET — returns currently active announcements for the frontend modal
// Public endpoint — only returns active + date-valid announcements

import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  try {
    const db = getServiceClient()
    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await db
      .from('announcements')
      .select('id, slug, title, body, cta_label, cta_url, dismiss_label, style, image_url, trigger, delay_ms, frequency_days, include_routes, exclude_routes, priority')
      .eq('active', true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('priority', { ascending: false })
      .limit(5)

    if (error) throw error

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.json({ announcements: data || [] })
  } catch (err) {
    console.error('[announcements/active]', err.message)
    return res.json({ announcements: [] })
  }
}
