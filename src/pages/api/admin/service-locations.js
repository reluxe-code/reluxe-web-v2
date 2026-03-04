// src/pages/api/admin/service-locations.js
// Admin API for CMS location-specific overrides.

import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const client = getServiceClient()
  const { action } = req.query

  // GET ?action=detail&serviceId=xxx&location=carmel
  if (req.method === 'GET' && action === 'detail') {
    const { serviceId, location } = req.query
    if (!serviceId || !location) {
      return res.status(400).json({ error: 'serviceId and location required' })
    }

    const { data, error } = await client
      .from('cms_location_overrides')
      .select('*')
      .eq('service_id', serviceId)
      .eq('location_key', location)
      .maybeSingle()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  // GET ?action=list&serviceId=xxx — all overrides for a service
  if (req.method === 'GET' && action === 'list') {
    const { serviceId } = req.query
    if (!serviceId) return res.status(400).json({ error: 'serviceId required' })

    const { data, error } = await client
      .from('cms_location_overrides')
      .select('*')
      .eq('service_id', serviceId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body

  // POST ?action=save — create or update a location override
  if (action === 'save') {
    const { service_id, location_key, available, description, differences, faqs, seo_title, seo_description, complementary, alternatives, extra } = body

    if (!service_id || !location_key) {
      return res.status(400).json({ error: 'service_id and location_key required' })
    }

    if (!['westfield', 'carmel'].includes(location_key)) {
      return res.status(400).json({ error: 'location_key must be westfield or carmel' })
    }

    const payload = {
      service_id,
      location_key,
      available: available !== false,
      description: description || null,
      differences: differences || [],
      faqs: faqs || [],
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      complementary: complementary || [],
      alternatives: alternatives || [],
      extra: extra || {},
    }

    const { data, error } = await client
      .from('cms_location_overrides')
      .upsert(payload, { onConflict: 'service_id,location_key' })
      .select('id')
      .single()

    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true, id: data.id })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

export default withAdminAuth(handler)
