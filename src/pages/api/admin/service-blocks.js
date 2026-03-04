// src/pages/api/admin/service-blocks.js
// Admin API for CMS service block CRUD and reordering.

import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET ?action=list&serviceId=xxx
  if (req.method === 'GET' && action === 'list') {
    const { serviceId } = req.query
    if (!serviceId) return res.status(400).json({ error: 'Missing serviceId' })

    const { data, error } = await client
      .from('cms_service_blocks')
      .select('*')
      .eq('service_id', serviceId)
      .order('sort_order', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  // GET ?action=defaults — fetch default library blocks (service_id IS NULL)
  if (req.method === 'GET' && action === 'defaults') {
    const { data, error } = await client
      .from('cms_service_blocks')
      .select('*')
      .is('service_id', null)
      .order('sort_order', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // POST ?action=save — create or update a block
  if (action === 'save') {
    const { id, service_id, block_type, content, variant, enabled, sort_order } = body

    if (!service_id || !block_type) {
      return res.status(400).json({ error: 'service_id and block_type are required' })
    }

    const payload = {
      service_id,
      block_type,
      content: content || {},
      variant: variant || null,
      enabled: enabled !== false,
      sort_order: sort_order ?? 0,
    }

    if (id) {
      const { error } = await client.from('cms_service_blocks').update(payload).eq('id', id)
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true, id })
    } else {
      const { data, error } = await client.from('cms_service_blocks').insert(payload).select('id').single()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true, id: data.id })
    }
  }

  // POST ?action=delete
  if (action === 'delete') {
    const { id } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await client.from('cms_service_blocks').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // POST ?action=reorder — batch update sort_order
  if (action === 'reorder') {
    const { items } = body
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array of {id, sort_order}' })

    for (const item of items) {
      if (!item.id) continue
      const { error } = await client
        .from('cms_service_blocks')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
      if (error) {
        return res.status(400).json({ error: `Failed to reorder block ${item.id}: ${error.message}` })
      }
    }

    return res.status(200).json({ ok: true })
  }

  // POST ?action=toggle — toggle enabled state
  if (action === 'toggle') {
    const { id, enabled } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await client
      .from('cms_service_blocks')
      .update({ enabled: !!enabled })
      .eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

export default withAdminAuth(handler)
