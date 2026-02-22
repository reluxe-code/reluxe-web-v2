// src/pages/api/admin/referral/backfill-enroll.js
// One-time backfill: create member + referral code for all blvd_clients
// who have a phone number but aren't yet enrolled.
// POST — admin only, run once from admin UI or curl.
import { getServiceClient } from '@/lib/supabase'
import { ensureReferralCode } from '@/lib/referralCodes'

export const config = { maxDuration: 120 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  let membersCreated = 0
  let codesCreated = 0
  let skipped = 0
  let errors = 0

  try {
    // 1. Get all blvd_clients with a phone number
    const { data: allClients, error: clientErr } = await db
      .from('blvd_clients')
      .select('id, first_name, last_name, email, phone')
      .not('phone', 'is', null)
      .order('created_at', { ascending: true })

    if (clientErr) throw clientErr
    const clients = allClients || []

    // 2. Get all existing members by blvd_client_id
    const { data: existingMembers } = await db
      .from('members')
      .select('id, blvd_client_id, first_name, phone')

    const memberByClientId = new Map()
    const memberByPhone = new Map()
    for (const m of (existingMembers || [])) {
      if (m.blvd_client_id) memberByClientId.set(m.blvd_client_id, m)
      if (m.phone) memberByPhone.set(m.phone.replace(/\D/g, '').slice(-10), m)
    }

    // 3. Process each client
    for (const client of clients) {
      if (!client.phone) { skipped++; continue }

      const digits = client.phone.replace(/\D/g, '').slice(-10)
      if (digits.length < 7) { skipped++; continue }

      // Check if member already exists (by blvd_client_id or phone)
      let member = memberByClientId.get(client.id) || memberByPhone.get(digits)

      if (!member) {
        // Normalize phone for storage
        const normalizedPhone = digits.length === 10 ? `+1${digits}` : `+${digits}`
        try {
          const { data: upserted } = await db
            .from('members')
            .upsert({
              phone: normalizedPhone,
              blvd_client_id: client.id,
              first_name: client.first_name || null,
              last_name: client.last_name || null,
              email: client.email || null,
            }, { onConflict: 'phone' })
            .select('id, first_name')
            .single()
          member = upserted
          if (member) membersCreated++
        } catch (e) {
          errors++
          continue
        }
      }

      if (!member?.id) { skipped++; continue }

      // Ensure referral code exists
      try {
        const code = await ensureReferralCode(db, member.id, member.first_name || client.first_name)
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
