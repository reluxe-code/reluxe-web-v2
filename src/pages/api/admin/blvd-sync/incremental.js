// src/pages/api/admin/blvd-sync/incremental.js
// Incremental sync — fetches the first 2 pages of appointments per location.
// Called by Vercel Cron every 15 minutes or manually from admin page.
import { adminQuery } from '@/server/blvdAdmin'
import { getServiceClient } from '@/lib/supabase'
import { LOCATION_IDS } from '@/server/blvd'
import { ensureReferralCode } from '@/lib/referralCodes'
import { sendCAPIEvents, buildUserData } from '@/lib/metaCAPI'
import { withAdminAuth } from '@/lib/adminAuth'
import { hashPhone, hashEmail, hashPhonePrefix } from '@/lib/piiHash'

export const config = { maxDuration: 300 }

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

// NOTE: Boulevard's `packages` query returns catalog TEMPLATES, not client purchases.
// Client-level package purchase data must be imported separately (see /api/admin/packages/import).
const PACKAGE_CATALOG_QUERY = `
  query GetPackageCatalog($first: Int!, $after: String) {
    packages(first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
          active
          unitPrice
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
          cancellation { cancelledAt }
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

async function handler(req, res) {
  // Accept both GET (cron) and POST (manual)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'GET or POST only' })
  }

  // Smart scheduling: cron fires every 5 min during business hours.
  // Business hours: 8am–8pm ET (UTC-5). Off-hours: only run every 30 min.
  const isCron = req.method === 'GET'
  if (isCron) {
    const nowET = new Date(Date.now() - 5 * 60 * 60 * 1000) // rough ET offset
    const hour = nowET.getUTCHours()
    const minute = nowET.getUTCMinutes()
    const isBusinessHours = hour >= 8 && hour < 20
    if (!isBusinessHours) {
      // Off-hours: only run at :00 and :30
      if (minute >= 5 && minute < 30 || minute >= 35) {
        return res.json({ skipped: true, reason: 'off-hours', hour, minute })
      }
    }
  }

  const db = getServiceClient()
  const deadline = Date.now() + 270_000 // 270s — return before 300s wall
  const isNearDeadline = () => Date.now() > deadline

  // Clean up stale "running" entries (older than 10 min = timed out)
  await db
    .from('blvd_sync_log')
    .update({ status: 'timeout', completed_at: new Date().toISOString(), error: 'Function timed out' })
    .eq('status', 'running')
    .eq('sync_type', 'incremental')
    .lt('started_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

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

    // Sync newest appointments from each location.
    // Boulevard returns appointments in ascending startAt order, so we jump near
    // the end of the list using a calculated cursor to get the most recent entries.
    for (const loc of LOCATIONS) {
      // Count appointments already synced for this location to estimate cursor offset
      const { count: localCount } = await db
        .from('blvd_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('location_key', loc.key)

      // Jump toward the end: offset = max(0, knownCount - PAGE_SIZE * 4)
      // Buffer of 200 appointments covers ~1 week of bookings per location,
      // then page forward until we run out of data.
      const startOffset = Math.max(0, (localCount || 0) - PAGE_SIZE * 4)
      let cursor = startOffset > 0
        ? Buffer.from(`arrayconnection:${startOffset - 1}`).toString('base64')
        : null

      for (let page = 0; page < 20; page++) {
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
            const clientPhone = node.client.mobilePhone || null
            const clientEmail = node.client.email || null
            const { data: upserted } = await db
              .from('blvd_clients')
              .upsert(
                {
                  boulevard_id: node.client.id,
                  // Hashed PII only — no raw PII persisted
                  phone_hash_v1: hashPhone(clientPhone),
                  email_hash_v1: hashEmail(clientEmail),
                  phone_prefix_hash_v1: hashPhonePrefix(clientPhone),
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

        if (!pageInfo.hasNextPage || isNearDeadline()) break
        cursor = pageInfo.endCursor
      }
      if (isNearDeadline()) break
    }

    // ── Refresh stale appointment statuses ──
    // Appointments that are still booked/confirmed but start_at is in the past
    // should have been completed/cancelled in Boulevard — re-check them.
    let statusRefreshed = 0
    if (!isNearDeadline()) {
      try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

        const { data: staleAppts } = await db
          .from('blvd_appointments')
          .select('id, boulevard_id, client_id, location_key')
          .in('status', ['booked', 'confirmed', 'arrived', 'active'])
          .lt('start_at', twoHoursAgo)
          .order('start_at', { ascending: false })
          .limit(50)

        if (staleAppts?.length) {
          // Batch query Boulevard for current appointment state (10 at a time)
          for (let i = 0; i < staleAppts.length && !isNearDeadline(); i += 10) {
            const batch = staleAppts.slice(i, i + 10)
            const fragments = batch.map((appt, j) =>
              `a${j}: node(id: "${appt.boulevard_id}") { ... on Appointment { id state cancelled cancellation { cancelledAt } appointmentServices { duration price service { id name category { name } } staff { id } } } }`
            )

            try {
              const batchData = await adminQuery(`query { ${fragments.join('\n')} }`)

              for (let j = 0; j < batch.length; j++) {
                const appt = batch[j]
                const node = batchData?.[`a${j}`]
                if (!node?.id) continue

                const newStatus = (node.state || 'unknown').toLowerCase()
                // Only update if status actually changed
                const { data: existing } = await db
                  .from('blvd_appointments')
                  .select('status')
                  .eq('id', appt.id)
                  .single()

                if (existing?.status === newStatus) continue

                await db
                  .from('blvd_appointments')
                  .update({
                    status: newStatus,
                    cancelled_at: node.cancellation?.cancelledAt || null,
                    synced_at: new Date().toISOString(),
                  })
                  .eq('id', appt.id)

                // Re-sync services (prices may finalize on completion)
                const services = node.appointmentServices || []
                if (services.length > 0) {
                  await db.from('blvd_appointment_services').delete().eq('appointment_id', appt.id)

                  for (const svc of services) {
                    const providerBlvdId = svc.staff?.id || null
                    const serviceName = svc.service?.name || 'Unknown'
                    const categoryName = svc.service?.category?.name || null

                    await db.from('blvd_appointment_services').insert({
                      appointment_id: appt.id,
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

                if (appt.client_id) touchedClientIds.add(appt.client_id)
                statusRefreshed++
              }
            } catch (batchErr) {
              console.error('Status refresh batch error (non-fatal):', batchErr.message)
            }
          }
        }
      } catch (refreshErr) {
        console.error('Status refresh error (non-fatal):', refreshErr.message)
      }
    }

    // ── Sync memberships + packages in parallel ──
    let membershipsSynced = 0
    let packagesSynced = 0
    let packageSyncError = null

    const [membershipsResult, packagesResult] = await Promise.allSettled([
      // Memberships
      (async () => {
        let count = 0
        let mCursor = null
        for (let mPage = 0; mPage < 20; mPage++) {
          if (isNearDeadline()) break
          const mData = await adminQuery(MEMBERSHIPS_QUERY, {
            first: 100,
            after: mCursor,
          })
          const mEdges = mData.memberships?.edges || []
          const mPageInfo = mData.memberships?.pageInfo || {}

          for (const edge of mEdges) {
            const m = edge.node
            if (!m?.id) continue

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
              vouchers: m.vouchers || [],
              synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'boulevard_id' })

            count++
          }

          if (!mPageInfo.hasNextPage) break
          mCursor = mPageInfo.endCursor
        }
        return count
      })(),
      // Package catalog
      (async () => {
        let count = 0
        let pCursor = null
        for (let pPage = 0; pPage < 20; pPage++) {
          if (isNearDeadline()) break
          const pData = await adminQuery(PACKAGE_CATALOG_QUERY, {
            first: 100,
            after: pCursor,
          })
          const pEdges = pData.packages?.edges || []
          const pPageInfo = pData.packages?.pageInfo || {}

          for (const edge of pEdges) {
            const p = edge.node
            if (!p?.id) continue

            await db.from('blvd_package_catalog').upsert({
              boulevard_id: p.id,
              name: p.name,
              description: p.description || null,
              active: p.active ?? true,
              unit_price: p.unitPrice || 0,
              vouchers: p.vouchers || [],
              synced_at: new Date().toISOString(),
            }, { onConflict: 'boulevard_id' })

            count++
          }

          if (!pPageInfo.hasNextPage) break
          pCursor = pPageInfo.endCursor
        }
        return count
      })(),
    ])

    if (membershipsResult.status === 'fulfilled') {
      membershipsSynced = membershipsResult.value
    } else {
      console.error('Membership sync error (non-fatal):', membershipsResult.reason?.message)
    }
    if (packagesResult.status === 'fulfilled') {
      packagesSynced = packagesResult.value
    } else {
      console.error('Package catalog sync error (non-fatal):', packagesResult.reason?.message)
      packageSyncError = packagesResult.reason?.message
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
      for (let i = 0; i < clientArray.length && !isNearDeadline(); i += 10) {
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
          .select('id, phone_hash_v1, email_hash_v1')
          .in('id', clientIdArray)
          .not('phone_hash_v1', 'is', null)

        if (clientsForEnroll?.length) {
          // Get existing members by blvd_client_id to skip them
          const { data: existingMembers } = await db
            .from('members')
            .select('blvd_client_id')
            .in('blvd_client_id', clientsForEnroll.map(c => c.id))
          const existingSet = new Set((existingMembers || []).map(m => m.blvd_client_id))

          for (const client of clientsForEnroll) {
            if (existingSet.has(client.id)) continue
            if (!client.phone_hash_v1) continue
            try {
              // Create member row — hashed PII only
              const { data: member } = await db
                .from('members')
                .insert({
                  blvd_client_id: client.id,
                  phone_hash_v1: client.phone_hash_v1,
                  email_hash_v1: client.email_hash_v1 || null,
                })
                .select('id')
                .single()
              if (member) {
                await ensureReferralCode(db, member.id, null)
                referralEnrolled++
              }
            } catch { /* skip individual failures */ }
          }
        }
      } catch (enrollErr) {
        console.error('Referral auto-enroll error (non-fatal):', enrollErr.message)
      }
    }

    // ── Send offline conversions to Meta CAPI ──
    let metaCapiSent = 0
    try {
      const { data: unsentAppts } = await db
        .from('blvd_appointments')
        .select(`
          id, boulevard_id, client_id, status, start_at, location_key,
          blvd_clients!inner(boulevard_id)
        `)
        .eq('status', 'completed')
        .is('meta_capi_sent_at', null)
        .limit(100)

      if (unsentAppts?.length) {
        // Fetch service totals per appointment
        const apptIds = unsentAppts.map(a => a.id)
        const { data: svcRows } = await db
          .from('blvd_appointment_services')
          .select('appointment_id, price, service_name')
          .in('appointment_id', apptIds)

        const svcByAppt = {}
        for (const svc of (svcRows || [])) {
          if (!svcByAppt[svc.appointment_id]) svcByAppt[svc.appointment_id] = []
          svcByAppt[svc.appointment_id].push(svc)
        }

        // Resolve PII from Boulevard API transiently for Meta CAPI (never persisted)
        const blvdIds = [...new Set(unsentAppts.map(a => a.blvd_clients?.boulevard_id).filter(Boolean))]
        const resolvedClients = {}
        for (let i = 0; i < blvdIds.length; i += 10) {
          const batch = blvdIds.slice(i, i + 10)
          const fragments = batch.map((id, j) =>
            `c${j}: node(id: "${id}") { ... on Client { id firstName lastName email mobilePhone } }`
          )
          try {
            const batchData = await adminQuery(`query { ${fragments.join('\n')} }`)
            batch.forEach((id, j) => {
              if (batchData?.[`c${j}`]) resolvedClients[id] = batchData[`c${j}`]
            })
          } catch { /* skip batch on failure */ }
        }

        const capiEvents = []
        const sentApptIds = []
        for (const appt of unsentAppts) {
          const blvdId = appt.blvd_clients?.boulevard_id
          const client = blvdId ? resolvedClients[blvdId] : null
          if (!client?.email && !client?.mobilePhone) continue

          const services = svcByAppt[appt.id] || []
          const totalValue = services.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0)
          const serviceNames = services.map(s => s.service_name).filter(Boolean).join(', ')

          capiEvents.push({
            event_name: 'Schedule',
            event_time: Math.floor(new Date(appt.start_at).getTime() / 1000),
            event_id: `offline_${appt.boulevard_id}`,
            action_source: 'system_generated',
            user_data: buildUserData({
              email: client.email,
              phone: client.mobilePhone,
              firstName: client.firstName,
              lastName: client.lastName,
              externalId: blvdId,
            }),
            custom_data: {
              value: totalValue,
              currency: 'USD',
              content_name: serviceNames || 'Appointment',
              content_type: 'product',
              content_category: appt.location_key || undefined,
            },
          })
          sentApptIds.push(appt.id)
        }

        // Send in batches of 100
        for (let i = 0; i < capiEvents.length; i += 100) {
          const batch = capiEvents.slice(i, i + 100)
          const batchIds = sentApptIds.slice(i, i + 100)
          const result = await sendCAPIEvents(batch)
          if (result.ok) {
            await db
              .from('blvd_appointments')
              .update({ meta_capi_sent_at: new Date().toISOString() })
              .in('id', batchIds)
            metaCapiSent += batchIds.length
          } else {
            console.error('[blvd-sync] Meta CAPI batch failed:', result.error)
          }
        }
      }
    } catch (metaErr) {
      console.error('Meta CAPI sync error (non-fatal):', metaErr.message)
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
          metadata: { locations: LOCATIONS.map((l) => l.key), status_refreshed: statusRefreshed, lifecycle_updated: lifecycleUpdated, memberships_synced: membershipsSynced, packages_synced: packagesSynced, packages_error: packageSyncError || null, credits_updated: creditsUpdated, referral_enrolled: referralEnrolled, meta_capi_sent: metaCapiSent },
        })
        .eq('id', logId)
    }

    return res.json({ ok: true, processed, created, statusRefreshed, lifecycleUpdated, membershipsSynced, packagesSynced, creditsUpdated, referralEnrolled, metaCapiSent })
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

export default withAdminAuth(handler)
