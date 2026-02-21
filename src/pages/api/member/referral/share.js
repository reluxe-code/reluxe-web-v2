// src/pages/api/member/referral/share.js
// POST: Log a share event for analytics.
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  const { channel, context } = req.body
  if (!channel) return res.status(400).json({ error: 'channel required' })

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired session' })

  const db = getServiceClient()

  const { data: member } = await db
    .from('members')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })

  const { data: rc } = await db
    .from('referral_codes')
    .select('id, total_shares')
    .eq('member_id', member.id)
    .maybeSingle()

  if (!rc) return res.status(404).json({ error: 'No referral code found' })

  // Insert share record
  await db.from('referral_shares').insert({
    referral_code_id: rc.id,
    member_id: member.id,
    channel,
    context: context || null,
  })

  // Increment total_shares
  await db
    .from('referral_codes')
    .update({ total_shares: (rc.total_shares || 0) + 1 })
    .eq('id', rc.id)

  return res.json({ ok: true })
}
