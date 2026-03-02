// src/pages/api/admin/cogs/mapping.js
// GET: list all service COGS mappings
// PUT: upsert { service_name, cogs_cents, notes? }
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'

async function handler(req, res) {
  const db = getServiceClient()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('service_cogs')
      .select('id, service_name, cogs_cents, notes, updated_at')
      .order('service_name')

    if (error) {
      console.error('[cogs/mapping] GET error:', error.message)
      return res.status(500).json({ error: 'Failed to load COGS mapping' })
    }

    return res.json({ rows: data || [] })
  }

  if (req.method === 'PUT') {
    const { service_name, cogs_cents, notes } = req.body
    if (!service_name || typeof cogs_cents !== 'number') {
      return res.status(400).json({ error: 'Provide service_name and cogs_cents (number)' })
    }

    const { error } = await db
      .from('service_cogs')
      .upsert({
        service_name,
        cogs_cents: Math.round(cogs_cents),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'service_name' })

    if (error) {
      console.error('[cogs/mapping] PUT error:', error.message)
      return res.status(500).json({ error: 'Failed to save COGS mapping' })
    }

    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'GET or PUT only' })
}

export default withAdminAuth(handler)
