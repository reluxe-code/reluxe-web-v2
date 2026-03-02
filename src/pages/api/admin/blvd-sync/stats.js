// src/pages/api/admin/blvd-sync/stats.js
// Returns dashboard counts, date range, and recent sync logs for the Boulevard Sync page.
// Uses service_role client to bypass RLS.
import { withAdminAuth } from '@/lib/adminAuth'
import { getServiceClient } from '@/lib/supabase'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()

  const [appts, clients, services, memberships, packages, earliest, latest, logs] =
    await Promise.all([
      db.from('blvd_appointments').select('id', { count: 'exact', head: true }),
      db.from('blvd_clients').select('id', { count: 'exact', head: true }),
      db.from('blvd_appointment_services').select('id', { count: 'exact', head: true }),
      db.from('blvd_memberships').select('id', { count: 'exact', head: true }),
      db.from('blvd_packages').select('id', { count: 'exact', head: true }),
      db.from('blvd_appointments').select('start_at').order('start_at', { ascending: true }).limit(1).single(),
      db.from('blvd_appointments').select('start_at').order('start_at', { ascending: false }).limit(1).single(),
      db.from('blvd_sync_log').select('*').order('started_at', { ascending: false }).limit(20),
    ])

  return res.json({
    stats: {
      appointments: appts.count || 0,
      clients: clients.count || 0,
      services: services.count || 0,
      memberships: memberships.count || 0,
      packages: packages.count || 0,
    },
    dateRange: {
      earliest: earliest.data?.start_at || null,
      latest: latest.data?.start_at || null,
    },
    syncLogs: logs.data || [],
  })
}

export default withAdminAuth(handler)
