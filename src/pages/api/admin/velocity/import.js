// Admin API: Import historical loyalty data from Boulevard CSV
import { getServiceClient } from '@/lib/supabase'
import { getCurrentBalance, updateBalanceCache, pushCreditToBlvd } from '@/lib/velocity'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = getServiceClient()
  const { csvData, dryRun = true, expiryDays = 90, pushActive = false } = req.body

  if (!csvData) return res.status(400).json({ error: 'csvData required (CSV string)' })

  try {
    // Parse CSV
    const lines = csvData.trim().split('\n')
    const header = lines[0]
    if (!header.includes('Client ID') || !header.includes('Points Balance')) {
      return res.status(400).json({ error: 'Invalid CSV format. Expected columns: Client ID, Client Name, ..., Points Balance, Points Value' })
    }

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols.length < 7) continue
      const clientId = cols[0].trim()
      const clientName = cols[1].trim()
      const enrollLocationId = cols[2].trim()
      const pointsBalance = parseInt(cols[5].trim()) || 0
      const lastUpdated = cols[7]?.trim()
      if (pointsBalance <= 0) continue
      rows.push({ clientId, clientName, enrollLocationId, pointsBalance, lastUpdated })
    }

    // Determine "active" cutoff (visited in last 90 days)
    const activeCutoff = new Date(Date.now() - 90 * 86400000).toISOString()

    const results = {
      total: rows.length,
      matched: 0,
      unmatched: 0,
      skippedExisting: 0,
      imported: 0,
      pushed: 0,
      totalCents: 0,
      pushedCents: 0,
      unmatchedClients: [],
      details: [],
    }

    for (const row of rows) {
      const urn = `urn:blvd:Client:${row.clientId}`

      // Find in our DB
      const { data: blvdClient } = await db
        .from('blvd_clients')
        .select('id, boulevard_id, last_visit_at')
        .eq('boulevard_id', urn)
        .maybeSingle()

      if (!blvdClient) {
        results.unmatched++
        results.unmatchedClients.push({ clientId: row.clientId, name: row.clientName })
        continue
      }

      // Resolve to member
      const { data: member } = await db
        .from('members')
        .select('id')
        .eq('blvd_client_id', blvdClient.id)
        .maybeSingle()

      if (!member) {
        // Try phone match
        const { data: clientPhone } = await db
          .from('blvd_clients')
          .select('phone')
          .eq('id', blvdClient.id)
          .maybeSingle()

        if (clientPhone?.phone) {
          const digits = clientPhone.phone.replace(/\D/g, '').slice(-10)
          const { data: phoneMember } = await db
            .from('members')
            .select('id')
            .like('phone', `%${digits}`)
            .maybeSingle()

          if (!phoneMember) {
            results.unmatched++
            results.unmatchedClients.push({ clientId: row.clientId, name: row.clientName, reason: 'no_member' })
            continue
          }
          // Use phone-matched member
          var memberId = phoneMember.id
        } else {
          results.unmatched++
          results.unmatchedClients.push({ clientId: row.clientId, name: row.clientName, reason: 'no_member' })
          continue
        }
      } else {
        var memberId = member.id
      }

      results.matched++

      // Check if already imported
      const { data: existing } = await db
        .from('velocity_ledger')
        .select('id')
        .eq('member_id', memberId)
        .eq('event_type', 'import')
        .limit(1)

      if (existing?.length) {
        results.skippedExisting++
        continue
      }

      // 1 point = 1 cent
      const amountCents = row.pointsBalance
      results.totalCents += amountCents

      // Determine if active
      const isActive = blvdClient.last_visit_at && blvdClient.last_visit_at >= activeCutoff

      // Determine location_key from enroll location
      const locationKey = row.enrollLocationId === '3ce18260-2e1f-4beb-8fcf-341bc85a682c' ? 'carmel' : 'westfield'

      const detail = {
        clientId: row.clientId,
        name: row.clientName,
        points: row.pointsBalance,
        cents: amountCents,
        memberId,
        isActive,
        locationKey,
      }
      results.details.push(detail)

      if (dryRun) continue

      // Insert ledger entry
      const currentBalance = await getCurrentBalance(db, memberId)
      const expiresAt = new Date(Date.now() + expiryDays * 86400000).toISOString()

      const { data: ledgerEntry } = await db.from('velocity_ledger').insert({
        member_id: memberId,
        blvd_client_id: blvdClient.id,
        event_type: 'import',
        amount_cents: amountCents,
        balance_after_cents: currentBalance + amountCents,
        location_key: locationKey,
        expires_at: expiresAt,
        admin_note: `Imported from BLVD loyalty CSV - ${row.pointsBalance} points (${row.clientName})`,
        blvd_pushed: false,
      }).select('id').single()

      // Push to BLVD if active and pushActive flag is set
      if (pushActive && isActive) {
        try {
          await pushCreditToBlvd(
            blvdClient.boulevard_id,
            amountCents,
            `RELUXE Rewards - your loyalty points are now account credit!`,
            locationKey
          )
          await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', ledgerEntry.id)
          results.pushed++
          results.pushedCents += amountCents
        } catch (pushErr) {
          console.error(`[velocity/import] Push failed for ${row.clientName}:`, pushErr.message)
        }
      }

      await updateBalanceCache(db, memberId)
      results.imported++
    }

    // Limit details in response to first 50 for non-dry-run
    if (!dryRun && results.details.length > 50) {
      results.details = results.details.slice(0, 50)
      results.detailsTruncated = true
    }
    // Limit unmatched to 50
    if (results.unmatchedClients.length > 50) {
      results.unmatchedClients = results.unmatchedClients.slice(0, 50)
      results.unmatchedTruncated = true
    }

    return res.json({ ok: true, dryRun, ...results })
  } catch (err) {
    console.error('[velocity/import]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
