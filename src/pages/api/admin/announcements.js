// src/pages/api/admin/announcements.js
// Admin CRUD for announcement popups
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()
  const { action } = req.query

  // GET — list all announcements
  if (req.method === 'GET') {
    const { data, error } = await db
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ announcements: data || [] })
  }

  // POST — create, update, delete, toggle
  if (req.method === 'POST') {
    if (action === 'save') {
      const row = req.body
      const isUpdate = !!row.id

      // Sanitize: empty strings → null for date columns
      if (!row.start_date) row.start_date = null
      if (!row.end_date) row.end_date = null

      // Ensure slug is set
      if (!row.slug) {
        row.slug = (row.title || 'announcement')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 60)
          + '-' + Date.now().toString(36)
      }

      row.updated_at = new Date().toISOString()

      if (isUpdate) {
        const { id, created_at, ...updates } = row
        const { data, error } = await db
          .from('announcements')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) return res.status(500).json({ error: error.message })
        return res.json({ announcement: data })
      } else {
        const { id, ...insert } = row
        const { data, error } = await db
          .from('announcements')
          .insert(insert)
          .select()
          .single()

        if (error) return res.status(500).json({ error: error.message })
        return res.json({ announcement: data })
      }
    }

    if (action === 'delete') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'id required' })

      const { error } = await db.from('announcements').delete().eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ ok: true })
    }

    if (action === 'toggle') {
      const { id, active } = req.body
      if (!id) return res.status(400).json({ error: 'id required' })

      const { data, error } = await db
        .from('announcements')
        .update({ active: !!active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) return res.status(500).json({ error: error.message })
      return res.json({ announcement: data })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
