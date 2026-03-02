// src/pages/api/admin/blvd-sync/entities.js
// Paginated entity browser for the Boulevard Sync admin page.
// Uses service_role client to bypass RLS.
import { withAdminAuth } from '@/lib/adminAuth'
import { getServiceClient } from '@/lib/supabase'

const PAGE_SIZE = 25

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { tab = 'clients', page = '1', search = '', status, location } = req.query
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const from = (pageNum - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query, countQuery

  switch (tab) {
    case 'clients': {
      query = db.from('blvd_clients')
        .select('id, boulevard_id, total_spend, visit_count, last_visit_at, account_credit, synced_at')
        .order('synced_at', { ascending: false })
        .range(from, to)
      countQuery = db.from('blvd_clients').select('id', { count: 'exact', head: true })
      if (search) {
        query = query.ilike('boulevard_id', `%${search}%`)
        countQuery = countQuery.ilike('boulevard_id', `%${search}%`)
      }
      break
    }
    case 'appointments': {
      query = db.from('blvd_appointments')
        .select('id, start_at, status, location_key, cancelled_at, synced_at, blvd_clients(boulevard_id)')
        .order('start_at', { ascending: false })
        .range(from, to)
      countQuery = db.from('blvd_appointments').select('id', { count: 'exact', head: true })
      if (status) {
        query = query.eq('status', status)
        countQuery = countQuery.eq('status', status)
      }
      if (location) {
        query = query.eq('location_key', location)
        countQuery = countQuery.eq('location_key', location)
      }
      break
    }
    case 'memberships': {
      query = db.from('blvd_memberships')
        .select('id, name, status, start_on, unit_price, location_key, vouchers, synced_at, blvd_clients(boulevard_id)')
        .order('synced_at', { ascending: false })
        .range(from, to)
      countQuery = db.from('blvd_memberships').select('id', { count: 'exact', head: true })
      if (status) {
        query = query.eq('status', status)
        countQuery = countQuery.eq('status', status)
      }
      break
    }
    case 'packages': {
      query = db.from('blvd_packages')
        .select('id, name, status, purchased_at, expires_at, location_key, vouchers, synced_at, blvd_clients(boulevard_id)')
        .order('synced_at', { ascending: false })
        .range(from, to)
      countQuery = db.from('blvd_packages').select('id', { count: 'exact', head: true })
      if (status) {
        query = query.eq('status', status)
        countQuery = countQuery.eq('status', status)
      }
      break
    }
    default:
      return res.status(400).json({ error: 'Invalid tab' })
  }

  const [{ data }, { count }] = await Promise.all([query, countQuery])
  return res.json({ data: data || [], count: count || 0 })
}

export default withAdminAuth(handler)
