// src/pages/api/referral/click.js
// Record a referral click — creates a referrals row with status 'clicked'.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { code, deviceId, url } = req.body
  if (!code) return res.status(400).json({ error: 'code required' })

  const db = getServiceClient()

  // Look up the referral code
  const { data: rc } = await db
    .from('referral_codes')
    .select('id, member_id')
    .or(`code.eq.${code},custom_code.eq.${code}`)
    .single()

  if (!rc) return res.status(404).json({ error: 'Invalid referral code' })

  // Check for existing click from same device in last 24h (dedup)
  if (deviceId) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await db
      .from('referrals')
      .select('id')
      .eq('referral_code_id', rc.id)
      .eq('referee_device_id', deviceId)
      .gte('clicked_at', cutoff)
      .limit(1)

    if (existing?.length) {
      return res.json({ ok: true, referralId: existing[0].id, deduplicated: true })
    }
  }

  // Rate limit: max 20 pending referrals per referrer
  const { count } = await db
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_member_id', rc.member_id)
    .in('status', ['clicked', 'booked'])

  if (count >= 20) {
    return res.status(429).json({ error: 'Referrer has too many pending referrals' })
  }

  // Velocity check: 50+ clicks in last hour on this code
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: hourlyClicks } = await db
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referral_code_id', rc.id)
    .gte('clicked_at', hourAgo)

  const fraudFlags = []
  if (hourlyClicks >= 50) fraudFlags.push('velocity_alert')

  // Create the referral
  const { data: referral, error } = await db
    .from('referrals')
    .insert({
      referral_code_id: rc.id,
      referrer_member_id: rc.member_id,
      referee_device_id: deviceId || null,
      landing_url: url || null,
      status: 'clicked',
      fraud_flags: fraudFlags.length > 0 ? fraudFlags : [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('[referral/click]', error.message)
    return res.status(500).json({ error: 'Failed to record click' })
  }

  // Increment click count
  await db.rpc('increment_referral_clicks', { code_id: rc.id }).catch(() => {
    // Fallback if RPC not set up: just update directly
    db.from('referral_codes')
      .update({ total_clicks: (count || 0) + 1 })
      .eq('id', rc.id)
      .then(() => {})
  })

  // Log event
  await db.from('referral_events').insert({
    referral_id: referral.id,
    event_type: 'click',
    metadata: { url, device_id: deviceId, fraud_flags: fraudFlags },
  })

  return res.json({ ok: true, referralId: referral.id })
}
