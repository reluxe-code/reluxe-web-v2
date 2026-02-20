// src/pages/api/admin/intelligence/rebooking.js
// Rebooking gaps — clients who completed recently but have no future appointment.
import { getServiceClient } from '@/lib/supabase'

async function fetchAllRows(buildQuery, chunkSize = 1000, maxRows = 100000) {
  const rows = []
  for (let offset = 0; offset < maxRows; offset += chunkSize) {
    const { data, error } = await buildQuery().range(offset, offset + chunkSize - 1)
    if (error) throw error
    const page = data || []
    rows.push(...page)
    if (page.length < chunkSize) break
  }
  return rows
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { timeframe, search, page = '1', limit = '50' } = req.query
  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize

  try {
    // 1. Summary counts by timeframe
    const allSegments = await fetchAllRows(() =>
      db
        .from('client_segments')
        .select('client_id, segment_detail, days_value')
        .eq('segment_name', 'no_rebook')
    )

    const segments = allSegments || []
    const summary = {
      total: segments.length,
      within_48h: segments.filter((s) => s.segment_detail === '48h').length,
      within_7d: segments.filter((s) => s.segment_detail === '7d').length,
      within_14d: segments.filter((s) => s.segment_detail === '14d').length,
      over_14d: segments.filter((s) => s.segment_detail === '14d+').length,
    }

    // 2. Get client IDs for the selected timeframe
    let clientIds = segments.map((s) => s.client_id)
    if (timeframe && timeframe !== 'all') {
      clientIds = segments.filter((s) => s.segment_detail === timeframe).map((s) => s.client_id)
    }

    if (clientIds.length === 0) {
      return res.json({
        summary,
        patients: { data: [], total: 0, page: pageNum, page_size: pageSize },
      })
    }

    // 3. Fetch client details with pagination
    // Build a map of days_value for each client from segments
    const daysMap = Object.fromEntries(segments.map((s) => [s.client_id, { days: s.days_value, detail: s.segment_detail }]))

    let query = db
      .from('blvd_clients')
      .select('id, name, first_name, last_name, email, phone', { count: 'exact' })
      .in('id', clientIds)

    if (search) {
      const q = `%${search}%`
      query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q},first_name.ilike.${q},last_name.ilike.${q}`)
    }

    query = query.order('name', { ascending: true })

    const { data: clients, count, error: clientErr } = await query
      .range(offset, offset + pageSize - 1)

    if (clientErr) throw clientErr

    // 4. Get last appointment info for these clients
    const pageClientIds = (clients || []).map((c) => c.id)
    let lastApptMap = {}
    if (pageClientIds.length > 0) {
      const { data: apptRows } = await db
        .from('blvd_appointments')
        .select('client_id, start_at, location_key')
        .in('client_id', pageClientIds)
        .in('status', ['completed', 'final'])
        .order('start_at', { ascending: false })

      // Take the most recent per client
      for (const a of apptRows || []) {
        if (!lastApptMap[a.client_id]) {
          lastApptMap[a.client_id] = { last_visit: a.start_at, location: a.location_key }
        }
      }
    }

    // 5. Get last service for context
    let lastServiceMap = {}
    if (pageClientIds.length > 0) {
      const { data: svcRows } = await db
        .from('blvd_appointment_services')
        .select(`
          service_name,
          service_slug,
          blvd_appointments!inner (
            client_id,
            start_at,
            status
          )
        `)
        .in('blvd_appointments.client_id', pageClientIds)
        .in('blvd_appointments.status', ['completed', 'final'])
        .order('blvd_appointments(start_at)', { ascending: false })

      for (const s of svcRows || []) {
        const cid = s.blvd_appointments?.client_id
        if (cid && !lastServiceMap[cid]) {
          lastServiceMap[cid] = { service_name: s.service_name, service_slug: s.service_slug }
        }
      }
    }

    const patient_list = (clients || []).map((c) => ({
      client_id: c.id,
      name: c.name || [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: c.email,
      phone: c.phone,
      days_since: daysMap[c.id]?.days ?? null,
      timeframe: daysMap[c.id]?.detail || null,
      last_visit: lastApptMap[c.id]?.last_visit || null,
      location: lastApptMap[c.id]?.location || null,
      last_service: lastServiceMap[c.id]?.service_name || null,
      last_service_slug: lastServiceMap[c.id]?.service_slug || null,
    }))

    return res.json({
      summary,
      patients: {
        data: patient_list,
        total: count || 0,
        page: pageNum,
        page_size: pageSize,
      },
    })
  } catch (err) {
    console.error('[intelligence/rebooking]', err)
    return res.status(500).json({ error: err.message })
  }
}
