// src/pages/api/admin/concierge/send.js
// POST: dispatch approved queue entries via Bird SMS.
// Zero-PHI: decrypts phone from phone_encrypted, NULLs it after send,
// logs phone_hash_v1 to marketing_touches instead of raw phone.
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'
import { isQuietHours } from '@/lib/concierge/antiSpam'
import { withAdminAuth } from '@/lib/adminAuth'
import { decryptPhone, hashPhone } from '@/lib/piiHash'
import { safeError } from '@/lib/logSanitizer'

export const config = { maxDuration: 60 }

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const db = getServiceClient()
  const { ids } = req.body || {}

  try {
    // 1. Load engine config
    const { data: configRow } = await db
      .from('site_config')
      .select('value')
      .eq('key', 'concierge_engine')
      .single()

    const engineConfig = configRow?.value || {}

    // 2. Final quiet hours gate
    if (isQuietHours(engineConfig)) {
      return res.status(400).json({
        error: 'Cannot send during quiet hours. Allowed: 10 AM – 7 PM EST.',
      })
    }

    // 3. Fetch approved entries
    let query = db
      .from('concierge_queue')
      .select('*')
      .eq('status', 'approved')

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids)
    }

    const { data: entries, error: fetchErr } = await query
    if (fetchErr) throw fetchErr

    if (!entries?.length) {
      return res.json({ ok: true, sent: 0, failed: 0, results: [] })
    }

    // 4. Re-check frequency caps before sending (using phone_hash_v1)
    const maxPerWeek = engineConfig.max_touches_per_week || 2
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const phoneHashes = [...new Set(entries.map((e) => e.phone_hash_v1).filter(Boolean))]
    const capCounts = {}

    if (phoneHashes.length) {
      const { data: touchRows } = await db
        .from('marketing_touches')
        .select('phone_hash_v1')
        .in('phone_hash_v1', phoneHashes)
        .gte('sent_at', sevenDaysAgo)

      for (const row of touchRows || []) {
        if (row.phone_hash_v1) {
          capCounts[row.phone_hash_v1] = (capCounts[row.phone_hash_v1] || 0) + 1
        }
      }
    }

    // 5. Send each entry
    const results = []
    let sent = 0
    let failed = 0

    for (const entry of entries) {
      const capKey = entry.phone_hash_v1

      // Re-check frequency cap
      const currentCount = capKey ? (capCounts[capKey] || 0) : 0
      if (capKey && currentCount >= maxPerWeek) {
        await db
          .from('concierge_queue')
          .update({ status: 'flagged', flag_reason: 'CAP_REACHED' })
          .eq('id', entry.id)

        results.push({ id: entry.id, boulevard_id: entry.boulevard_id, status: 'flagged', error: 'CAP_REACHED' })
        failed++
        continue
      }

      // Decrypt phone from encrypted column (fall back to raw phone during migration)
      const sendPhone = (entry.phone_encrypted ? decryptPhone(entry.phone_encrypted) : null) || entry.phone
      if (!sendPhone) {
        await db
          .from('concierge_queue')
          .update({ status: 'flagged', flag_reason: 'NO_PHONE' })
          .eq('id', entry.id)

        results.push({ id: entry.id, boulevard_id: entry.boulevard_id, status: 'failed', error: 'NO_PHONE' })
        failed++
        continue
      }

      // Send via Bird
      const smsResult = await sendSMS(sendPhone, entry.sms_body)

      if (smsResult.ok) {
        // Update queue status + NULL the encrypted phone (transient PII lifecycle complete)
        await db
          .from('concierge_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            phone_encrypted: null,
          })
          .eq('id', entry.id)

        // Log to marketing_touches with phone_hash_v1 (no raw phone)
        const touchPhoneHash = capKey || hashPhone(sendPhone)
        await db.from('marketing_touches').insert({
          client_id: entry.client_id,
          // phone column dropped — hash only
          phone_hash_v1: touchPhoneHash,
          campaign_slug: entry.campaign_slug,
          cohort: entry.cohort,
          variant: entry.variant,
          sms_body: entry.sms_body,
          link_token: entry.link_token,
          status: 'sent',
          bird_message_id: smsResult.messageId || null,
        })

        // Increment running cap count
        if (capKey) capCounts[capKey] = currentCount + 1

        results.push({ id: entry.id, boulevard_id: entry.boulevard_id, status: 'sent' })
        sent++
      } else {
        await db
          .from('concierge_queue')
          .update({ status: 'flagged', flag_reason: 'SEND_FAILED' })
          .eq('id', entry.id)

        results.push({ id: entry.id, boulevard_id: entry.boulevard_id, status: 'failed', error: smsResult.error })
        failed++
      }
    }

    return res.json({ ok: true, sent, failed, results })
  } catch (err) {
    safeError('[concierge/send]', err.message)
    return res.status(500).json({ error: err.message })
  }
}

export default withAdminAuth(handler)
