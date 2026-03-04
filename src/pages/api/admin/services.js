// src/pages/api/admin/services.js
// Admin API for CMS service CRUD operations.

import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET ?action=list
  if (req.method === 'GET' && action === 'list') {
    const { data: services, error } = await client
      .from('cms_services')
      .select(`
        id, slug, name, tagline, hero_image, status, indexable, sort_order,
        created_at, updated_at,
        cms_service_categories (
          category_id,
          sort_order,
          service_categories ( id, name, slug, type )
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })

    // Flatten categories for easier consumption
    const mapped = (services || []).map((s) => ({
      ...s,
      categories: (s.cms_service_categories || []).map((j) => j.service_categories).filter(Boolean),
    }))

    return res.status(200).json({ data: mapped })
  }

  // GET ?action=detail&id=xxx
  if (req.method === 'GET' && action === 'detail') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing id' })

    const [svcRes, blocksRes, catsRes, locsRes] = await Promise.all([
      client.from('cms_services').select('*').eq('id', id).single(),
      client.from('cms_service_blocks').select('*').eq('service_id', id).order('sort_order'),
      client.from('cms_service_categories').select('category_id').eq('service_id', id),
      client.from('cms_location_overrides').select('*').eq('service_id', id),
    ])

    if (svcRes.error) return res.status(404).json({ error: 'Service not found' })

    return res.status(200).json({
      service: svcRes.data,
      blocks: blocksRes.data || [],
      categoryIds: (catsRes.data || []).map((r) => r.category_id),
      locationOverrides: locsRes.data || [],
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // POST ?action=save — create or update
  if (action === 'save') {
    const { id, slug, name, tagline, hero_image, booking_slug, consult_slug, seo, status, indexable, sort_order, categoryIds } = body

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' })
    }

    const payload = {
      slug,
      name,
      tagline: tagline || null,
      hero_image: hero_image || null,
      booking_slug: booking_slug || null,
      consult_slug: consult_slug || null,
      seo: seo || {},
      status: status || 'draft',
      indexable: indexable !== false,
      sort_order: sort_order || 0,
    }

    let serviceId = id

    if (id) {
      // Update
      const { error } = await client.from('cms_services').update(payload).eq('id', id)
      if (error) return res.status(400).json({ error: error.message })
    } else {
      // Insert
      const { data, error } = await client.from('cms_services').insert(payload).select('id').single()
      if (error) return res.status(400).json({ error: error.message })
      serviceId = data.id
    }

    // Sync category assignments if provided
    if (Array.isArray(categoryIds)) {
      // Delete existing assignments
      await client.from('cms_service_categories').delete().eq('service_id', serviceId)
      // Insert new
      if (categoryIds.length > 0) {
        const rows = categoryIds.map((catId, i) => ({
          service_id: serviceId,
          category_id: catId,
          sort_order: i * 10,
        }))
        await client.from('cms_service_categories').insert(rows)
      }
    }

    return res.status(200).json({ ok: true, id: serviceId })
  }

  // POST ?action=delete
  if (action === 'delete') {
    const { id } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await client.from('cms_services').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // POST ?action=duplicate
  if (action === 'duplicate') {
    const { id } = body
    if (!id) return res.status(400).json({ error: 'Missing id' })

    // Fetch original
    const { data: orig, error: fetchErr } = await client.from('cms_services').select('*').eq('id', id).single()
    if (fetchErr) return res.status(404).json({ error: 'Service not found' })

    // Create copy
    const newSlug = `${orig.slug}-copy-${Date.now().toString(36)}`
    const { data: newSvc, error: insertErr } = await client.from('cms_services').insert({
      slug: newSlug,
      name: `${orig.name} (Copy)`,
      tagline: orig.tagline,
      hero_image: orig.hero_image,
      booking_slug: orig.booking_slug,
      consult_slug: orig.consult_slug,
      seo: orig.seo,
      status: 'draft',
      indexable: orig.indexable,
      sort_order: orig.sort_order + 1,
    }).select('id').single()

    if (insertErr) return res.status(400).json({ error: insertErr.message })

    // Copy blocks
    const { data: blocks } = await client.from('cms_service_blocks').select('*').eq('service_id', id)
    if (blocks?.length) {
      const copied = blocks.map(({ id: _id, service_id: _sid, created_at, updated_at, ...rest }) => ({
        ...rest,
        service_id: newSvc.id,
      }))
      await client.from('cms_service_blocks').insert(copied)
    }

    // Copy category assignments
    const { data: cats } = await client.from('cms_service_categories').select('*').eq('service_id', id)
    if (cats?.length) {
      const copiedCats = cats.map(({ id: _id, service_id: _sid, ...rest }) => ({
        ...rest,
        service_id: newSvc.id,
      }))
      await client.from('cms_service_categories').insert(copiedCats)
    }

    // Copy location overrides
    const { data: locs } = await client.from('cms_location_overrides').select('*').eq('service_id', id)
    if (locs?.length) {
      const copiedLocs = locs.map(({ id: _id, service_id: _sid, created_at, updated_at, ...rest }) => ({
        ...rest,
        service_id: newSvc.id,
      }))
      await client.from('cms_location_overrides').insert(copiedLocs)
    }

    return res.status(200).json({ ok: true, id: newSvc.id, slug: newSlug })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

export default withAdminAuth(handler)
