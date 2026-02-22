// src/pages/api/admin/blvd-sync/incremental.js
// Incremental sync — fetches the first 2 pages of appointments per location.
// Called by Vercel Cron every 15 minutes or manually from admin page.
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'
import { LOCATION_IDS } from '@/server/blvd'
import { ensureReferralCode } from '@/lib/referralCodes'

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
  if (/sculptra/.test(n)) return 'sculptra'
  if (/\bprp\b|hair restoration/.test(n)) return 'prp'
  // Now check combined text for everything else
  if (/botox|dysport|jeuveau|daxxify|xeomin|neurotoxin|\btox\b|lip\s*flip/.test(text)) return 'tox'
  if (/sculptra/.test(text)) return 'sculptra'
  if (/filler|juv[eé]derm|restylane|\brha\b|versa|voluma|vollure|volbella/.test(text)) return 'filler'
  if (/hydrafacial/.test(text)) return 'hydrafacial'
  if (/glo2facial/.test(text)) return 'glo2facial'
  if (/facial|dermaplaning|chemical peel|microderm|dermaplane|biorepeel|\bpeel\b/.test(text)) return 'facials'
  if (/massage|gua sha/.test(text)) return 'massage'
  if (/morpheus|rf micro/.test(text)) return 'morpheus8'
  if (/laser hair|lhr/.test(text)) return 'laser-hair-removal'
  if (/coolsculpt|body contour/.test(text)) return 'body-contouring'
  if (/\bprp\b|hair restoration/.test(text)) return 'prp'
  if (/\biv\b|iv-|vitamin.*drip|infusion|\bnad\b|b12 shot/.test(text)) return 'iv-therapy'
  if (/skinvive/.test(text)) return 'skinvive'
  if (/kybella/.test(text)) return 'kybella'
  if (/micro\s?needling|skin\s?pen/.test(text)) return 'microneedling'
  if (/ipl|bbl|photofacial|clearlift|clearskin|vascupen|opus/.test(text)) return 'ipl'
  if (/salt.*booth|sauna/.test(text)) return 'salt-sauna'
  return null
}

// Location URN → our key mapping
const LOCATION_URN_MAP = {}
for (const [key, uuid] of Object.entries(LOCATION_IDS)) {
  LOCATION_URN_MAP[`urn:blvd:Location:${uuid}`] = key
}

const MEMBERSHIPS_QUERY = `
  query GetMemberships($first: Int!, $after: String) {
    memberships(first: $first, after: $after) {
      edges {
        node {
          id
          name
          status
          startOn
          endOn
          cancelOn
          nextChargeDate
          unpauseOn
          interval
          unitPrice
          termNumber
          clientId
          locationId
          vouchers {
            quantity
            services { id name }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

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

    // ── Sync memberships (paginate all, upsert) ──
    let membershipsSynced = 0
    try {
      let mCursor = null
      for (let mPage = 0; mPage < 20; mPage++) {
        const mData = await adminQuery(MEMBERSHIPS_QUERY, {
          first: 100,
          after: mCursor,
        })
        const mEdges = mData.memberships?.edges || []
        const mPageInfo = mData.memberships?.pageInfo || {}

        for (const edge of mEdges) {
          const m = edge.node
          if (!m?.id) continue

          // Resolve client internal ID
          let mClientId = null
          if (m.clientId) {
            const { data: clientRow } = await db
              .from('blvd_clients')
              .select('id')
              .eq('boulevard_id', m.clientId)
              .maybeSingle()
            mClientId = clientRow?.id || null
          }

          await db.from('blvd_memberships').upsert({
            boulevard_id: m.id,
            client_id: mClientId,
            client_boulevard_id: m.clientId,
            name: m.name,
            status: m.status,
            start_on: m.startOn,
            end_on: m.endOn || null,
            cancel_on: m.cancelOn || null,
            next_charge_date: m.nextChargeDate || null,
            unpause_on: m.unpauseOn || null,
            interval: m.interval || null,
            unit_price: m.unitPrice || 0,
            term_number: m.termNumber || 1,
            location_boulevard_id: m.locationId || null,
            location_key: LOCATION_URN_MAP[m.locationId] || null,
            vouchers: JSON.stringify(m.vouchers || []),
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'boulevard_id' })

          membershipsSynced++
        }

        if (!mPageInfo.hasNextPage) break
        mCursor = mPageInfo.endCursor
      }
    } catch (mErr) {
      console.error('Membership sync error (non-fatal):', mErr.message)
    }

    // ── Sync account credit for clients with memberships or recent activity ──
    let creditsUpdated = 0
    try {
      // Get all unique client boulevard IDs that have memberships or were touched
      const clientBlvdIds = new Set()
      // Add membership clients
      const { data: membershipClients } = await db
        .from('blvd_memberships')
        .select('client_boulevard_id')
        .eq('status', 'ACTIVE')
      for (const mc of (membershipClients || [])) {
        if (mc.client_boulevard_id) clientBlvdIds.add(mc.client_boulevard_id)
      }
      // Add touched clients from appointments
      if (touchedClientIds.size > 0) {
        const { data: touchedBlvd } = await db
          .from('blvd_clients')
          .select('boulevard_id')
          .in('id', Array.from(touchedClientIds))
        for (const t of (touchedBlvd || [])) {
          if (t.boulevard_id) clientBlvdIds.add(t.boulevard_id)
        }
      }

      // Batch query Boulevard for account balances (10 at a time)
      const clientArray = Array.from(clientBlvdIds)
      for (let i = 0; i < clientArray.length; i += 10) {
        const batch = clientArray.slice(i, i + 10)
        const balanceQuery = `query { ${batch.map((id, idx) =>
          `c${idx}: node(id: "${id}") { ... on Client { id currentAccountBalance } }`
        ).join('\n')} }`

        try {
          const balanceData = await adminQuery(balanceQuery)
          for (let j = 0; j < batch.length; j++) {
            const result = balanceData[`c${j}`]
            if (result?.id) {
              await db.from('blvd_clients')
                .update({
                  account_credit: result.currentAccountBalance || 0,
                  account_credit_updated_at: new Date().toISOString(),
                })
                .eq('boulevard_id', result.id)
              creditsUpdated++
            }
          }
        } catch (bErr) {
          console.error(`Credit batch error (non-fatal):`, bErr.message)
        }
      }
    } catch (cErr) {
      console.error('Credit sync error (non-fatal):', cErr.message)
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

    // ── Auto-enroll touched clients into referral program ──
    let referralEnrolled = 0
    if (touchedClientIds.size > 0) {
      try {
        const clientIdArray = Array.from(touchedClientIds)
        // Find clients that don't have a linked member yet
        const { data: clientsForEnroll } = await db
          .from('blvd_clients')
          .select('id, first_name, last_name, email, phone')
          .in('id', clientIdArray)
          .not('phone', 'is', null)

        if (clientsForEnroll?.length) {
          // Get existing members by blvd_client_id to skip them
          const { data: existingMembers } = await db
            .from('members')
            .select('blvd_client_id')
            .in('blvd_client_id', clientsForEnroll.map(c => c.id))
          const existingSet = new Set((existingMembers || []).map(m => m.blvd_client_id))

          for (const client of clientsForEnroll) {
            if (existingSet.has(client.id)) continue
            if (!client.phone) continue
            try {
              // Create member row
              const { data: member } = await db
                .from('members')
                .upsert({
                  phone: client.phone,
                  blvd_client_id: client.id,
                  first_name: client.first_name || null,
                  last_name: client.last_name || null,
                  email: client.email || null,
                }, { onConflict: 'phone' })
                .select('id, first_name')
                .single()
              if (member) {
                await ensureReferralCode(db, member.id, member.first_name)
                referralEnrolled++
              }
            } catch { /* skip individual failures */ }
          }
        }
      } catch (enrollErr) {
        console.error('Referral auto-enroll error (non-fatal):', enrollErr.message)
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
          metadata: { locations: LOCATIONS.map((l) => l.key), lifecycle_updated: lifecycleUpdated, memberships_synced: membershipsSynced, credits_updated: creditsUpdated, referral_enrolled: referralEnrolled },
        })
        .eq('id', logId)
    }

    return res.json({ ok: true, processed, created, lifecycleUpdated, membershipsSynced, creditsUpdated, referralEnrolled })
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
