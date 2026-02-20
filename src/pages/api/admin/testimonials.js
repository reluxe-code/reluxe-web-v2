// src/pages/api/admin/testimonials.js
// Admin API for testimonial CRUD operations.
// Uses service role client to bypass RLS.

import { getServiceClient } from '@/lib/supabase'

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
}

export default async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET /api/admin/testimonials?action=list
  if (req.method === 'GET' && action === 'list') {
    const { data, error } = await client
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // POST ?action=save — create or update a testimonial
  if (action === 'save') {
    const payload = { ...body }
    if (payload.provider) payload.staff_name = payload.provider
    const isNew = !payload.id

    if (isNew) {
      delete payload.id
      const { error } = await client.from('testimonials').insert(payload)
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true })
    } else {
      const id = payload.id
      delete payload.id
      delete payload.created_at
      const { error } = await client.from('testimonials').update(payload).eq('id', id)
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }
  }

  // POST ?action=delete
  if (action === 'delete') {
    const { id } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await client.from('testimonials').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // POST ?action=import — bulk import rows
  if (action === 'import') {
    const { rows } = body
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided' })
    }

    let imported = 0
    let duplicates = 0
    let errors = 0

    for (const row of rows) {
      // Check for duplicate by author_name + quote
      const { data: existing } = await client
        .from('testimonials')
        .select('id')
        .eq('author_name', row.author_name)
        .eq('quote', row.quote)
        .limit(1)

      if (existing && existing.length > 0) {
        duplicates++
        continue
      }

      const { error } = await client.from('testimonials').insert({
        ...row,
        staff_name: row.provider || '',
      })
      if (error) {
        console.error('Import row error:', error.message, row.author_name)
        errors++
      } else {
        imported++
      }
    }

    const noComment = rows.filter(r => !r.recommendable).length
    return res.status(200).json({ imported, duplicates, errors, noComment })
  }

  // POST ?action=toggle-provider — activate/deactivate a provider
  if (action === 'toggle-provider') {
    const { name, activate } = body
    if (!name) return res.status(400).json({ error: 'Missing provider name' })

    if (activate) {
      // Reactivate: set recommendable=true for reviews with comments and rating >= 4
      const { error } = await client
        .from('testimonials')
        .update({ recommendable: true })
        .or(`provider.eq.${name},staff_name.eq.${name}`)
        .gte('rating', 4)
        .neq('quote', '')
      if (error) return res.status(400).json({ error: error.message })
    } else {
      // Deactivate all
      const { error } = await client
        .from('testimonials')
        .update({ recommendable: false })
        .or(`provider.eq.${name},staff_name.eq.${name}`)
      if (error) return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ ok: true })
  }

  // POST ?action=bulk-update — update a field on multiple rows
  if (action === 'bulk-update') {
    const { ids, field, value } = body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' })
    const allowed = ['location', 'provider', 'service', 'recommendable', 'featured', 'status']
    if (!allowed.includes(field)) return res.status(400).json({ error: `Field "${field}" not allowed for bulk update` })

    const { error } = await client
      .from('testimonials')
      .update({ [field]: value })
      .in('id', ids)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true, updated: ids.length })
  }

  // POST ?action=bulk-delete — delete multiple rows
  if (action === 'bulk-delete') {
    const { ids } = body
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' })

    const { error } = await client
      .from('testimonials')
      .delete()
      .in('id', ids)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true, deleted: ids.length })
  }

  return res.status(400).json({ error: 'Unknown action' })
}
