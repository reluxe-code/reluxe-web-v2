// src/pages/api/admin/intelligence/tox-patient.js
// Fetch a single patient's tox appointment history for the detail drawer.
// GET ?client_id=uuid
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { client_id } = req.query
  if (!client_id) return res.status(400).json({ error: 'client_id required' })

  const db = getServiceClient()

  try {
    // 1. Get the client's tox summary
    const { data: summary, error: sumErr } = await db
      .from('client_tox_summary')
      .select('*')
      .eq('client_id', client_id)
      .single()

    if (sumErr) throw sumErr

    // 2. Get all tox appointments with their services
    const { data: apptRows, error: apptErr } = await db
      .from('blvd_appointment_services')
      .select(`
        service_name,
        price,
        provider_staff_id,
        appointment_id,
        blvd_appointments!inner (
          id,
          client_id,
          start_at,
          status,
          location_key
        )
      `)
      .eq('service_slug', 'tox')
      .eq('blvd_appointments.client_id', client_id)
      .in('blvd_appointments.status', ['completed', 'final'])
      .order('blvd_appointments(start_at)', { ascending: false })

    if (apptErr) throw apptErr

    // 3. Group services by appointment
    const TOX_BRANDS = ['botox', 'dysport', 'jeuveau', 'daxxify', 'xeomin']
    const apptMap = {}
    for (const row of apptRows || []) {
      const appt = row.blvd_appointments
      const aid = appt.id
      if (!apptMap[aid]) {
        apptMap[aid] = {
          appointment_id: aid,
          date: appt.start_at,
          location: appt.location_key,
          services: [],
          total_revenue: 0,
          tox_type: null,
          is_follow_up: false,
        }
      }
      const lower = (row.service_name || '').toLowerCase()
      const brandCount = TOX_BRANDS.filter((b) => lower.includes(b)).length
      const isContainer = brandCount >= 2
      const isFollowUp = lower.includes('post injection') || (lower.includes('follow') && lower.includes('up'))

      apptMap[aid].services.push({
        name: row.service_name,
        price: Number(row.price || 0),
        is_container: isContainer,
        is_follow_up: isFollowUp,
      })
      apptMap[aid].total_revenue += Number(row.price || 0)

      if (isFollowUp) apptMap[aid].is_follow_up = true

      // Determine tox type from add-on (non-container, non-follow-up)
      if (!isContainer && !isFollowUp && !apptMap[aid].tox_type) {
        const PRE_SWITCH_CUTOFF = '2024-06-01'
        if (appt.start_at < PRE_SWITCH_CUTOFF) {
          apptMap[aid].tox_type = 'Jeuveau'
        } else if (lower.includes('botox')) {
          apptMap[aid].tox_type = 'Botox'
        } else if (lower.includes('dysport')) {
          apptMap[aid].tox_type = 'Dysport'
        } else if (lower.includes('jeuveau')) {
          apptMap[aid].tox_type = 'Jeuveau'
        } else if (lower.includes('daxxify')) {
          apptMap[aid].tox_type = 'Daxxify'
        } else if (lower.includes('xeomin')) {
          apptMap[aid].tox_type = 'Xeomin'
        }
      }
    }

    const appointments = Object.values(apptMap).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )

    // 4. Resolve provider name
    let providerName = null
    if (summary.last_provider_staff_id) {
      const { data: staff } = await db
        .from('staff')
        .select('name')
        .eq('id', summary.last_provider_staff_id)
        .single()
      providerName = staff?.name || null
    }

    return res.json({
      client: {
        client_id: summary.client_id,
        name: summary.name || [summary.first_name, summary.last_name].filter(Boolean).join(' ') || 'Unknown',
        email: summary.email,
        phone: summary.phone,
        tox_visits: summary.tox_visits,
        total_tox_spend: Number(summary.total_tox_spend || 0),
        primary_tox_type: summary.primary_tox_type,
        last_tox_type: summary.last_tox_type,
        tox_switching: summary.tox_switching,
        tox_segment: summary.tox_segment,
        days_since_last_tox: summary.days_since_last_tox,
        avg_interval_days: summary.avg_tox_interval_days,
        first_tox_visit: summary.first_tox_visit,
        last_tox_visit: summary.last_tox_visit,
        provider_name: providerName,
        location: summary.last_location_key,
      },
      appointments,
    })
  } catch (err) {
    console.error('[intelligence/tox-patient]', err)
    return res.status(500).json({ error: err.message })
  }
}
