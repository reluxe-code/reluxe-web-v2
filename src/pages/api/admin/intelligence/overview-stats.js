// src/pages/api/admin/intelligence/overview-stats.js
// Returns quick summary counts for the Intelligence Overview landing page.
// Uses service_role client to bypass RLS.
import { withAdminAuth } from '@/lib/adminAuth'
import { getServiceClient } from '@/lib/supabase'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  const [clients, appts, toxAppts] = await Promise.all([
    db.from('blvd_clients').select('id', { count: 'exact', head: true }),
    db.from('blvd_appointments').select('id', { count: 'exact', head: true }).in('status', ['completed', 'final']),
    db.from('blvd_appointment_services').select('id', { count: 'exact', head: true }).eq('service_slug', 'tox'),
  ])

  return res.json({
    clients: clients.count || 0,
    completedAppts: appts.count || 0,
    toxServices: toxAppts.count || 0,
  })
}

export default withAdminAuth(handler)
