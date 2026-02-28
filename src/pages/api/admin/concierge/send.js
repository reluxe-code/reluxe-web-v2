// src/pages/api/admin/concierge/send.js
// POST: dispatch approved queue entries via Bird SMS.
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'
import { isQuietHours } from '@/lib/concierge/antiSpam'

export const config = { maxDuration: 60 }

export default async function handler(req, res) {
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

    // 4. Re-check frequency caps before sending
    const maxPerWeek = engineConfig.max_touches_per_week || 2
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const phones = [...new Set(entries.map((e) => e.phone))]
    const { data: touchRows } = await db
      .from('marketing_touches')
      .select('phone')
      .in('phone', phones)
      .gte('sent_at', sevenDaysAgo)

    const capCounts = {}
    for (const row of touchRows || []) {
      capCounts[row.phone] = (capCounts[row.phone] || 0) + 1
    }

    // 5. Send each entry
    const results = []
    let sent = 0
    let failed = 0

    for (const entry of entries) {
      // Re-check frequency cap
      const currentCount = capCounts[entry.phone] || 0
      if (currentCount >= maxPerWeek) {
        await db
          .from('concierge_queue')
          .update({ status: 'flagged', flag_reason: 'CAP_REACHED' })
          .eq('id', entry.id)

        results.push({ id: entry.id, phone: entry.phone, status: 'flagged', error: 'CAP_REACHED' })
        failed++
        continue
      }

      // Send via Bird
      const smsResult = await sendSMS(entry.phone, entry.sms_body)

      if (smsResult.ok) {
        // Update queue status
        await db
          .from('concierge_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', entry.id)

        // Log to marketing_touches
        await db.from('marketing_touches').insert({
          client_id: entry.client_id,
          phone: entry.phone,
          campaign_slug: entry.campaign_slug,
          cohort: entry.cohort,
          variant: entry.variant,
          sms_body: entry.sms_body,
          link_token: entry.link_token,
          status: 'sent',
        })

        // Increment our running cap count so subsequent sends in this batch respect it
        capCounts[entry.phone] = currentCount + 1

        results.push({ id: entry.id, phone: entry.phone, status: 'sent' })
        sent++
      } else {
        await db
          .from('concierge_queue')
          .update({ status: 'flagged', flag_reason: 'SEND_FAILED' })
          .eq('id', entry.id)

        results.push({ id: entry.id, phone: entry.phone, status: 'failed', error: smsResult.error })
        failed++
      }
    }

    return res.json({ ok: true, sent, failed, results })
  } catch (err) {
    console.error('[concierge/send]', err)
    return res.status(500).json({ error: err.message })
  }
}
