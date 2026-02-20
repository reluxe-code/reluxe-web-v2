// src/pages/api/admin/blvd-sync/incremental.js
// Incremental sync — fetches the first 2 pages of appointments per location.
// Called by Vercel Cron every 15 minutes or manually from admin page.
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'
import { LOCATION_IDS } from '@/server/blvd'

export const config = { maxDuration: 60 }

const PAGE_SIZE = 50

// Build URN-format location IDs for the Admin API
const LOCATIONS = Object.entries(LOCATION_IDS).map(([key, uuid]) => ({
  key,
  urn: `urn:blvd:Location:${uuid}`,
}))

function guessServiceSlug(name, category) {
  const n = (name || '').toLowerCase()
  const text = `${category || ''} ${name || ''}`.toLowerCase()
  // Check service name first (more specific) to avoid category mismatches
  // e.g. "Dermal Filler" in category "Tox + Fillers" should be filler, not tox
  if (/filler|juv[eé]derm|restylane|\brha\b|versa|voluma|vollure|volbella|dissolving/.test(n)) return 'filler'
  if (/sculptra/.test(n)) return 'filler'
  if (/\bprp\b|hair restoration/.test(n)) return 'prp'
  // Now check combined text for everything else
  if (/botox|dysport|jeuveau|daxxify|xeomin|neurotoxin|\btox\b|lip\s*flip/.test(text)) return 'tox'
  if (/filler|juv[eé]derm|restylane|\brha\b|versa|voluma|vollure|volbella|sculptra/.test(text)) return 'filler'
  if (/hydrafacial/.test(text)) return 'facials'
  if (/glo2facial/.test(text)) return 'facials'
  if (/facial|dermaplaning|chemical peel|microderm|dermaplane|biorepeel|\bpeel\b/.test(text)) return 'facials'
  if (/massage|gua sha/.test(text)) return 'massage'
  if (/morpheus|rf micro/.test(text)) return 'morpheus8'
  if (/laser hair|lhr/.test(text)) return 'laser-hair-removal'
  if (/coolsculpt|body contour/.test(text)) return 'coolsculpting'
  if (/\bprp\b|hair restoration/.test(text)) return 'prp'
  if (/\biv\b|iv-|vitamin.*drip|infusion|\bnad\b|b12 shot/.test(text)) return 'iv-therapy'
  if (/skinvive/.test(text)) return 'skinvive'
  if (/kybella/.test(text)) return 'kybella'
  if (/micro\s?needling|skin\s?pen/.test(text)) return 'microneedling'
  if (/ipl|bbl|photofacial|clearlift|clearskin|vascupen|opus/.test(text)) return 'ipl'
  if (/salt.*booth|sauna/.test(text)) return 'salt-sauna'
  return null
}

const APPOINTMENTS_QUERY = `
  query GetRecentAppointments($locationId: ID!, $first: Int!, $after: String) {
    appointments(locationId: $locationId, first: $first, after: $after) {
      edges {
        node {
          id
          state
          startAt
          endAt
          duration
          createdAt
          cancelled
          cancellation { cancelledAt notes reason }
          location { id }
          client {
            id firstName lastName name email mobilePhone
          }
          appointmentServices {
            duration
            price
            service { id name category { name } }
            staff { id }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export default async function handler(req, res) {
  // Accept both GET (cron) and POST (manual)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'GET or POST only' })
  }

  // Smart scheduling: cron fires every 15 min, but off-hours we only run ~every 2h.
  // Business hours: 8am–8pm ET (UTC-5). Off-hours: skip 7 of 8 invocations.
  const isCron = req.method === 'GET'
  if (isCron) {
    const nowET = new Date(Date.now() - 5 * 60 * 60 * 1000) // rough ET offset
    const hour = nowET.getUTCHours()
    const minute = nowET.getUTCMinutes()
    const isBusinessHours = hour >= 8 && hour < 20
    if (!isBusinessHours) {
      // Off-hours: only run at the top of even hours (0, 2, 4, ...)
      if (hour % 2 !== 0 || minute >= 15) {
        return res.json({ skipped: true, reason: 'off-hours', hour, minute })
      }
    }
  }

  const db = getServiceClient()

  // Create sync log
  const { data: logEntry } = await db
    .from('blvd_sync_log')
    .insert({
      sync_type: 'incremental',
      status: 'running',
      metadata: { locations: LOCATIONS.map((l) => l.key) },
    })
    .select('id')
    .single()
  const logId = logEntry?.id

  let processed = 0
  let created = 0
  const touchedClientIds = new Set()

  try {
    // Fetch staff mapping once
    const { data: staffRows } = await db
      .from('staff')
      .select('id, boulevard_provider_id')
      .not('boulevard_provider_id', 'is', null)
    const staffMap = new Map((staffRows || []).map((s) => [s.boulevard_provider_id, s.id]))

    // Sync first 2 pages from each location (most recent appointments)
    for (const loc of LOCATIONS) {
      let cursor = null
      for (let page = 0; page < 2; page++) {
        const data = await adminQuery(APPOINTMENTS_QUERY, {
          locationId: loc.urn,
          first: PAGE_SIZE,
          after: cursor,
        })

        const edges = data.appointments?.edges || []
        const pageInfo = data.appointments?.pageInfo || {}

        for (const edge of edges) {
          const node = edge.node
          if (!node?.id) continue
          processed++

          // Upsert client
          let clientId = null
          if (node.client?.id) {
            const { data: upserted } = await db
              .from('blvd_clients')
              .upsert(
                {
                  boulevard_id: node.client.id,
                  first_name: node.client.firstName || null,
                  last_name: node.client.lastName || null,
                  name:
                    node.client.name ||
                    [node.client.firstName, node.client.lastName].filter(Boolean).join(' ') ||
                    null,
                  email: node.client.email || null,
                  phone: node.client.mobilePhone || null,
                  synced_at: new Date().toISOString(),
                },
                { onConflict: 'boulevard_id' }
              )
              .select('id')
              .single()
            clientId = upserted?.id
            if (clientId) touchedClientIds.add(clientId)
          }

          // Upsert appointment
          const { data: apptRow } = await db
            .from('blvd_appointments')
            .upsert(
              {
                boulevard_id: node.id,
                client_id: clientId,
                client_boulevard_id: node.client?.id || null,
                location_id: node.location?.id || loc.urn,
                location_key: loc.key,
                status: (node.state || 'unknown').toLowerCase(),
                start_at: node.startAt,
                end_at: node.endAt || null,
                duration_minutes: node.duration || null,
                cancelled_at: node.cancellation?.cancelledAt || null,
                synced_at: new Date().toISOString(),
              },
              { onConflict: 'boulevard_id' }
            )
            .select('id')
            .single()

          created++

          // Upsert services
          const services = node.appointmentServices || []
          if (services.length > 0 && apptRow?.id) {
            await db.from('blvd_appointment_services').delete().eq('appointment_id', apptRow.id)

            for (const svc of services) {
              const providerBlvdId = svc.staff?.id || null
              const serviceName = svc.service?.name || 'Unknown'
              const categoryName = svc.service?.category?.name || null

              await db.from('blvd_appointment_services').insert({
                appointment_id: apptRow.id,
                boulevard_service_id: svc.service?.id || null,
                service_name: serviceName,
                service_category: categoryName,
                service_slug: guessServiceSlug(serviceName, categoryName),
                provider_boulevard_id: providerBlvdId,
                provider_staff_id: providerBlvdId ? staffMap.get(providerBlvdId) || null : null,
                price: svc.price ? svc.price / 100 : null,
                duration_minutes: svc.duration || null,
              })
            }
          }
        }

        if (!pageInfo.hasNextPage) break
        cursor = pageInfo.endCursor
      }
    }

    // Recompute client lifecycle fields for all touched clients
    let lifecycleUpdated = 0
    if (touchedClientIds.size > 0) {
      const clientIdArray = Array.from(touchedClientIds)
      // Process in batches of 50 to stay within query limits
      for (let i = 0; i < clientIdArray.length; i += 50) {
        const batch = clientIdArray.slice(i, i + 50)
        const { data: lifecycleRows } = await db.rpc('compute_client_lifecycle', {
          client_ids: batch,
        })
        lifecycleUpdated += lifecycleRows?.length || batch.length
      }
    }

    // Update sync log
    if (logId) {
      await db
        .from('blvd_sync_log')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: processed,
          records_created: created,
          metadata: { locations: LOCATIONS.map((l) => l.key), lifecycle_updated: lifecycleUpdated },
        })
        .eq('id', logId)
    }

    return res.json({ ok: true, processed, created, lifecycleUpdated })
  } catch (err) {
    console.error('Incremental sync error:', err)

    if (logId) {
      await db
        .from('blvd_sync_log')
        .update({ status: 'failed', error: err.message, completed_at: new Date().toISOString() })
        .eq('id', logId)
    }

    return res.status(500).json({ error: err.message })
  }
}
