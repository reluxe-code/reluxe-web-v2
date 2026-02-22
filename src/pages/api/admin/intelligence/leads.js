// src/pages/api/admin/intelligence/leads.js
// Dashboard API: summary stats, campaign breakdown, and paginated lead list.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const {
    source, campaign, status, service,
    days = '30', search,
    page = '1', limit = '50',
  } = req.query

  const db = getServiceClient()
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const pageSize = Math.min(100, parseInt(limit, 10) || 50)
  const offset = (pageNum - 1) * pageSize
  const dayCount = days === 'all' ? null : Math.max(1, parseInt(days, 10) || 30)
  const sinceIso = dayCount ? new Date(Date.now() - dayCount * 86400000).toISOString() : null

  try {
    // ── Summary stats (all leads in time window, paginate past 1000-row limit) ──
    let allLeads = []
    let sumOffset = 0
    const SUM_PAGE = 1000
    while (true) {
      let q = db.from('leads').select('id, status, source, campaign, service_interest, created_at, converted_at, days_to_convert')
      if (sinceIso) q = q.gte('created_at', sinceIso)
      const { data: batch, error: summaryErr } = await q.range(sumOffset, sumOffset + SUM_PAGE - 1)
      if (summaryErr) throw summaryErr
      if (!batch || batch.length === 0) break
      allLeads = allLeads.concat(batch)
      if (batch.length < SUM_PAGE) break
      sumOffset += SUM_PAGE
    }

    const total = allLeads.length
    const byStatus = { new: 0, contacted: 0, booked: 0, converted: 0, lost: 0 }
    const bySource = {}
    const byCampaign = {}
    const byService = {}
    let convertedCount = 0
    let totalDaysToConvert = 0
    let convertedWithDays = 0
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    let thisMonthCount = 0

    for (const lead of allLeads) {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1
      bySource[lead.source] = (bySource[lead.source] || 0) + 1

      if (lead.service_interest) {
        if (!byService[lead.service_interest]) byService[lead.service_interest] = { total: 0, converted: 0 }
        byService[lead.service_interest].total++
        if (lead.status === 'converted') byService[lead.service_interest].converted++
      }

      if (lead.campaign) {
        if (!byCampaign[lead.campaign]) {
          byCampaign[lead.campaign] = { total: 0, booked: 0, converted: 0, service_interest: lead.service_interest }
        }
        byCampaign[lead.campaign].total++
        if (lead.status === 'booked' || lead.status === 'converted') byCampaign[lead.campaign].booked++
        if (lead.status === 'converted') byCampaign[lead.campaign].converted++
      }

      if (lead.status === 'converted') {
        convertedCount++
        if (lead.days_to_convert != null) {
          totalDaysToConvert += lead.days_to_convert
          convertedWithDays++
        }
      }

      if (new Date(lead.created_at) >= thisMonth) thisMonthCount++
    }

    const summary = {
      total,
      by_status: byStatus,
      by_source: Object.entries(bySource)
        .map(([s, count]) => ({ source: s, count }))
        .sort((a, b) => b.count - a.count),
      by_service: Object.entries(byService)
        .map(([s, d]) => ({ service: s, total: d.total, converted: d.converted, rate: d.total > 0 ? ((d.converted / d.total) * 100).toFixed(1) : '0.0' }))
        .sort((a, b) => b.total - a.total),
      conversion_rate: total > 0 ? ((convertedCount / total) * 100).toFixed(1) : '0.0',
      avg_days_to_convert: convertedWithDays > 0 ? Math.round(totalDaysToConvert / convertedWithDays) : null,
      this_month: thisMonthCount,
      converted: convertedCount,
      booked: (byStatus.booked || 0) + convertedCount,
      new_patients: convertedCount,
      booking_rate: total > 0 ? (((byStatus.booked || 0) + convertedCount) / total * 100).toFixed(1) : '0.0',
      new_patient_rate: total > 0 ? (convertedCount / total * 100).toFixed(1) : '0.0',
    }

    // ── Campaign breakdown ──
    const campaign_breakdown = Object.entries(byCampaign)
      .map(([name, data]) => ({
        campaign: name,
        leads: data.total,
        booked: data.booked,
        converted: data.converted,
        booking_rate: data.total > 0 ? ((data.booked / data.total) * 100).toFixed(1) : '0.0',
        new_patient_rate: data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : '0.0',
        service_interest: data.service_interest,
      }))
      .sort((a, b) => b.leads - a.leads)

    // ── Paginated lead list ──
    let query = db.from('leads').select('*', { count: 'exact' })

    if (sinceIso) query = query.gte('created_at', sinceIso)
    if (source) query = query.eq('source', source)
    if (campaign) query = query.eq('campaign', campaign)
    if (status) query = query.eq('status', status)
    if (service) query = query.eq('service_interest', service)
    if (search) {
      const q = `%${search}%`
      query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},campaign.ilike.${q}`)
    }

    query = query.order('created_at', { ascending: false })

    const { data: leadList, count: leadCount, error: listErr } = await query
      .range(offset, offset + pageSize - 1)
    if (listErr) throw listErr

    // Enrich with appointment data for Boulevard-matched leads
    const clientIds = [...new Set((leadList || []).filter(l => l.blvd_client_id).map(l => l.blvd_client_id))]
    const appointmentMap = {}
    if (clientIds.length > 0) {
      const { data: appts } = await db
        .from('blvd_appointments')
        .select('client_id, start_at, created_at, status')
        .in('client_id', clientIds)
        .in('status', ['booked', 'confirmed', 'arrived', 'started', 'completed', 'final'])
        .order('start_at', { ascending: true })
      for (const a of (appts || [])) {
        if (!appointmentMap[a.client_id]) {
          appointmentMap[a.client_id] = { booked_at: a.created_at, appointment_date: a.start_at }
        }
      }
    }

    const leads_data = (leadList || []).map(l => ({
      id: l.id,
      name: [l.first_name, l.last_name].filter(Boolean).join(' ') || 'Unknown',
      first_name: l.first_name,
      last_name: l.last_name,
      email: l.email,
      phone: l.phone,
      source: l.source,
      campaign: l.campaign,
      service_interest: l.service_interest,
      status: l.status,
      notes: l.notes,
      blvd_client_id: l.blvd_client_id,
      days_to_convert: l.days_to_convert,
      converted_at: l.converted_at,
      source_created_at: l.source_created_at,
      created_at: l.created_at,
      days_since: Math.round((Date.now() - new Date(l.created_at)) / 86400000),
      booked_at: appointmentMap[l.blvd_client_id]?.booked_at || null,
      appointment_date: appointmentMap[l.blvd_client_id]?.appointment_date || null,
    }))

    return res.json({
      summary,
      campaign_breakdown,
      leads: {
        data: leads_data,
        total: leadCount || 0,
        page: pageNum,
        page_size: pageSize,
      },
    })
  } catch (err) {
    console.error('[intelligence/leads]', err)
    return res.status(500).json({ error: err.message })
  }
}
