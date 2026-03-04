// src/pages/api/admin/service-categories.js
// Admin API for CMS service category management.

import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET ?action=list
  if (req.method === 'GET' && action === 'list') {
    const { data, error } = await client
      .from('service_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // POST ?action=save — create or update
  if (action === 'save') {
    const { id, name, slug, type, hero_image, description, seo_title, seo_description, parent_id, sort_order, active } = body

    if (!name || !slug || !type) {
      return res.status(400).json({ error: 'Name, slug, and type are required' })
    }

    if (!['functional', 'creative'].includes(type)) {
      return res.status(400).json({ error: 'Type must be functional or creative' })
    }

    const payload = {
      name,
      slug,
      type,
      hero_image: hero_image || null,
      description: description || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      parent_id: parent_id || null,
      sort_order: sort_order ?? 0,
      active: active !== false,
    }

    if (id) {
      const { error } = await client.from('service_categories').update(payload).eq('id', id)
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true, id })
    } else {
      const { data, error } = await client.from('service_categories').insert(payload).select('id').single()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true, id: data.id })
    }
  }

  // POST ?action=delete
  if (action === 'delete') {
    const { id } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await client.from('service_categories').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

export default withAdminAuth(handler)
