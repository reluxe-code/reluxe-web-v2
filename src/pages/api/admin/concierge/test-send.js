// src/pages/api/admin/concierge/test-send.js
// POST: send a test SMS to a specified phone number using a queue entry's SMS body.
// Does NOT log to marketing_touches or update queue status.
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { queue_id, phone } = req.body || {}

  if (!queue_id || !phone) {
    return res.status(400).json({ error: 'queue_id and phone are required' })
  }

  // Normalize phone to E.164 format
  const digits = phone.replace(/\D/g, '')
  const cleanPhone = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : digits.startsWith('+') ? digits : `+${digits}`
  if (cleanPhone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  const db = getServiceClient()

  try {
    const { data: entry, error: fetchErr } = await db
      .from('concierge_queue')
      .select('sms_body, campaign_slug, variant, cohort')
      .eq('id', queue_id)
      .single()

    if (fetchErr || !entry) {
      return res.status(404).json({ error: 'Queue entry not found' })
    }

    const result = await sendSMS(cleanPhone, entry.sms_body)

    if (result.ok) {
      return res.json({
        ok: true,
        message: `Test SMS sent to ${cleanPhone}`,
        campaign: entry.campaign_slug,
        variant: entry.variant,
      })
    } else {
      return res.status(500).json({ error: `SMS send failed: ${result.error}` })
    }
  } catch (err) {
    console.error('[concierge/test-send]', err)
    return res.status(500).json({ error: err.message })
  }
}
