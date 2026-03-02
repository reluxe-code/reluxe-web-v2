// src/pages/api/admin/referral/backfill-enroll.js
// One-time backfill: create member + referral code for all blvd_clients
// who have a phone number but aren't yet enrolled.
// POST — admin only, run once from admin UI or curl.
import { getServiceClient } from '@/lib/supabase'
import { ensureReferralCode } from '@/lib/referralCodes'
import { hashPhone, hashEmail } from '@/lib/piiHash'
import { withAdminAuth } from '@/lib/adminAuth'

export const config = { maxDuration: 120 }

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  let membersCreated = 0
  let codesCreated = 0
  let skipped = 0
  let errors = 0

  try {
    // 1. Get all blvd_clients with a phone hash
    const { data: allClients, error: clientErr } = await db
      .from('blvd_clients')
      .select('id, boulevard_id, phone_hash_v1, email_hash_v1')
      .not('phone_hash_v1', 'is', null)
      .order('created_at', { ascending: true })

    if (clientErr) throw clientErr
    const clients = allClients || []

    // 2. Get all existing members by blvd_client_id or phone hash
    const { data: existingMembers } = await db
      .from('members')
      .select('id, blvd_client_id, phone_hash_v1')

    const memberByClientId = new Map()
    const memberByPhoneHash = new Map()
    for (const m of (existingMembers || [])) {
      if (m.blvd_client_id) memberByClientId.set(m.blvd_client_id, m)
      if (m.phone_hash_v1) memberByPhoneHash.set(m.phone_hash_v1, m)
    }

    // 3. Process each client
    for (const client of clients) {
      if (!client.phone_hash_v1) { skipped++; continue }

      // Check if member already exists (by blvd_client_id or phone hash)
      let member = memberByClientId.get(client.id) || memberByPhoneHash.get(client.phone_hash_v1)

      if (!member) {
        try {
          const { data: upserted } = await db
            .from('members')
            .insert({
              blvd_client_id: client.id,
              phone_hash_v1: client.phone_hash_v1,
              email_hash_v1: client.email_hash_v1 || null,
            })
            .select('id')
            .single()
          member = upserted
          if (member) membersCreated++
        } catch (e) {
          errors++
          continue
        }
      }

      if (!member?.id) { skipped++; continue }

      // Ensure referral code exists (no first_name needed — code gen can use fallback)
      try {
        const code = await ensureReferralCode(db, member.id, null)
        if (code) codesCreated++ // counts both existing and new
      } catch {
        errors++
      }
    }

    return res.json({
      ok: true,
      totalClients: clients.length,
      membersCreated,
      codesCreated,
      skipped,
      errors,
    })
  } catch (err) {
    console.error('[referral/backfill-enroll]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
