// src/pages/api/admin/concierge/queue.js
// GET: paginated, filterable queue list for the audit table.
import { getServiceClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/adminAuth'
import { safeError } from '@/lib/logSanitizer'

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const {
    status = 'ready',
    cohort,
    campaign,
    search,
    sort = 'priority_asc',
    page = '1',
    limit = '50',
  } = req.query

  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    let query = db
      .from('concierge_queue')
      .select('*', { count: 'exact' })

    // Filters
    if (status) query = query.eq('status', status)
    if (cohort) query = query.eq('cohort', cohort)
    if (campaign) query = query.eq('campaign_slug', campaign)
    if (search) {
      const q = `%${search}%`
      query = query.or(`provider_name.ilike.${q},service_name.ilike.${q}`)
    }

    // Sort
    const sortMap = {
      priority_asc: ['priority', { ascending: true }],
      priority_desc: ['priority', { ascending: false }],
      days_desc: ['days_overdue', { ascending: false }],
      days_asc: ['days_overdue', { ascending: true }],
      created_desc: ['created_at', { ascending: false }],
      created_asc: ['created_at', { ascending: true }],
    }
    const [sortCol, sortOpts] = sortMap[sort] || sortMap.priority_asc
    query = query.order(sortCol, sortOpts)

    const { data, count, error } = await query.range(offset, offset + pageSize - 1)
    if (error) throw error

    // Resolve client names from blvd_clients
    const clientIds = [...new Set((data || []).map((q) => q.client_id).filter(Boolean))]
    let clientLookup = {}
    if (clientIds.length > 0) {
      const { data: clients } = await db
        .from('blvd_clients')
        .select('id, boulevard_id')
        .in('id', clientIds)
      clientLookup = Object.fromEntries((clients || []).map((c) => [c.id, c]))
    }

    const queue = (data || []).map((entry) => {
      const isTest = entry.priority === 0 && !entry.client_id
      const client = clientLookup[entry.client_id]
      return {
        ...entry,
        boulevard_id: client?.boulevard_id || null,
        is_test: isTest,
      }
    })

    return res.json({
      queue,
      total: count || 0,
      page: pageNum,
      page_size: pageSize,
    })
  } catch (err) {
    safeError('[concierge/queue]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
