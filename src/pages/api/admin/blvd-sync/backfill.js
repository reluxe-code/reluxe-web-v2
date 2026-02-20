// src/pages/api/admin/blvd-sync/backfill.js
// Paginated backfill of appointments from Boulevard Admin API.
// POST { cursor?, syncLogId?, locationIndex?, stopBeforeDate? }
// Returns { processed, created, nextCursor, done, syncLogId, locationIndex, oldestSeen }
//
// Improvements:
//   - 500ms delay between API pages to avoid rate limiting
//   - Retry with exponential backoff on transient failures
//   - stopBeforeDate: stop paginating when appointments are older than this
//   - Saves cursor to sync log so it can be resumed after failure
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'
import { LOCATION_IDS } from '@/server/blvd'

export const config = { maxDuration: 60 }

const PAGE_SIZE = 50
const DELAY_MS = 500 // Pause between pages to avoid rate limits
const MAX_RETRIES = 3

// Build URN-format location IDs for the Admin API
const LOCATIONS = Object.entries(LOCATION_IDS).map(([key, uuid]) => ({
  key,
  uuid,
  urn: `urn:blvd:Location:${uuid}`,
}))

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Retry wrapper with exponential backoff
async function queryWithRetry(query, variables) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await adminQuery(query, variables)
    } catch (err) {
      const isTransient =
        err.message?.includes('HTML instead of JSON') ||
        err.message?.includes('non-JSON') ||
        err.message?.includes('ECONNRESET') ||
        err.message?.includes('fetch failed')
      if (!isTransient || attempt === MAX_RETRIES) throw err
      const backoff = Math.min(1000 * Math.pow(2, attempt), 8000)
      console.warn(`[backfill] Retry ${attempt + 1}/${MAX_RETRIES} after ${backoff}ms: ${err.message}`)
      await sleep(backoff)
    }
  }
}

// Auto-detect service slug from service name
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
  query GetAppointments($locationId: ID!, $first: Int!, $after: String) {
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
          notes
          location { id name }
          client {
            id firstName lastName name email mobilePhone
          }
          appointmentServices {
            duration
            price
            service { id name category { name } }
            staff { id firstName lastName displayName }
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { cursor, syncLogId, locationIndex = 0, stopBeforeDate } = req.body
  const db = getServiceClient()

  // Create or resume sync log entry
  let logId = syncLogId
  if (!logId) {
    const { data: logEntry } = await db
      .from('blvd_sync_log')
      .insert({
        sync_type: 'backfill',
        status: 'running',
        metadata: {
          locations: LOCATIONS.map((l) => l.key),
          stopBeforeDate: stopBeforeDate || null,
        },
      })
      .select('id')
      .single()
    logId = logEntry?.id
  }

  let processed = 0
  let created = 0
  let oldestSeen = null

  try {
    const loc = LOCATIONS[locationIndex]
    if (!loc) {
      // All locations done
      if (logId) {
        await db
          .from('blvd_sync_log')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', logId)
      }
      return res.json({ processed: 0, created: 0, done: true, syncLogId: logId, locationIndex })
    }

    // Throttle: wait before hitting the API
    if (cursor) await sleep(DELAY_MS)

    const data = await queryWithRetry(APPOINTMENTS_QUERY, {
      locationId: loc.urn,
      first: PAGE_SIZE,
      after: cursor || null,
    })

    const edges = data.appointments?.edges || []
    const pageInfo = data.appointments?.pageInfo || {}

    // Fetch staff mapping for provider matching
    const { data: staffRows } = await db
      .from('staff')
      .select('id, boulevard_provider_id')
      .not('boulevard_provider_id', 'is', null)
    const staffMap = new Map((staffRows || []).map((s) => [s.boulevard_provider_id, s.id]))

    let reachedStopDate = false

    for (const edge of edges) {
      const node = edge.node
      if (!node?.id) continue

      // Track oldest appointment seen
      if (node.startAt) {
        const startDate = node.startAt.split('T')[0]
        if (!oldestSeen || startDate < oldestSeen) oldestSeen = startDate

        // Check if we've gone past the stop date
        if (stopBeforeDate && startDate < stopBeforeDate) {
          reachedStopDate = true
          // Still process this record, just flag we should stop after this page
        }
      }

      processed++

      // Upsert client
      let clientId = null
      if (node.client?.id) {
        const clientData = {
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
        }

        const { data: upserted } = await db
          .from('blvd_clients')
          .upsert(clientData, { onConflict: 'boulevard_id' })
          .select('id')
          .single()
        clientId = upserted?.id
      }

      // Determine location key
      const locationKey = loc.key

      // Upsert appointment
      const apptData = {
        boulevard_id: node.id,
        client_id: clientId,
        client_boulevard_id: node.client?.id || null,
        location_id: node.location?.id || loc.urn,
        location_key: locationKey,
        status: (node.state || 'unknown').toLowerCase(),
        start_at: node.startAt,
        end_at: node.endAt || null,
        duration_minutes: node.duration || null,
        cancelled_at: node.cancellation?.cancelledAt || null,
        notes: node.notes || null,
        synced_at: new Date().toISOString(),
      }

      const { data: apptRow, error: apptErr } = await db
        .from('blvd_appointments')
        .upsert(apptData, { onConflict: 'boulevard_id' })
        .select('id')
        .single()

      if (apptErr) {
        console.error('Appointment upsert error:', apptErr.message, node.id)
        continue
      }

      created++

      // Upsert appointment services (line items)
      const services = node.appointmentServices || []
      if (services.length > 0 && apptRow?.id) {
        await db.from('blvd_appointment_services').delete().eq('appointment_id', apptRow.id)

        for (const svc of services) {
          const providerBlvdId = svc.staff?.id || null
          const providerStaffId = providerBlvdId ? staffMap.get(providerBlvdId) || null : null
          const categoryName = svc.service?.category?.name || null
          const serviceName = svc.service?.name || 'Unknown'

          await db.from('blvd_appointment_services').insert({
            appointment_id: apptRow.id,
            boulevard_service_id: svc.service?.id || null,
            service_name: serviceName,
            service_category: categoryName,
            service_slug: guessServiceSlug(serviceName, categoryName),
            provider_boulevard_id: providerBlvdId,
            provider_staff_id: providerStaffId,
            price: svc.price ? svc.price / 100 : null, // Boulevard sends cents
            duration_minutes: svc.duration || null,
          })
        }
      }
    }

    // Determine if we're done with this location
    const hasMorePages = pageInfo.hasNextPage && !reachedStopDate
    const nextCursor = hasMorePages ? (pageInfo.endCursor || null) : null

    // If no more pages for this location, move to next location
    const done = !hasMorePages && locationIndex >= LOCATIONS.length - 1
    const nextLocationIndex = hasMorePages ? locationIndex : locationIndex + 1

    // Update sync log — always save cursor for resume
    if (logId) {
      await db
        .from('blvd_sync_log')
        .update({
          status: done ? 'completed' : 'running',
          completed_at: done ? new Date().toISOString() : null,
          records_processed: processed,
          records_created: created,
          cursor: pageInfo.endCursor || null,
          metadata: {
            locations: LOCATIONS.map((l) => l.key),
            stopBeforeDate: stopBeforeDate || null,
            locationIndex: nextLocationIndex,
            oldestSeen,
          },
        })
        .eq('id', logId)
    }

    return res.json({
      processed,
      created,
      nextCursor,
      done,
      syncLogId: logId,
      locationIndex: nextLocationIndex,
      locationName: loc.key,
      pageEdges: edges.length,
      oldestSeen,
      reachedStopDate: reachedStopDate || false,
    })
  } catch (err) {
    console.error('Backfill error:', err)

    if (logId) {
      await db
        .from('blvd_sync_log')
        .update({
          status: 'failed',
          error: err.message,
          completed_at: new Date().toISOString(),
          metadata: {
            locations: LOCATIONS.map((l) => l.key),
            stopBeforeDate: stopBeforeDate || null,
            locationIndex,
            oldestSeen,
          },
        })
        .eq('id', logId)
    }

    return res.status(500).json({ error: err.message, syncLogId: logId, locationIndex })
  }
}
