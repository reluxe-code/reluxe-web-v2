// Member API: Claim a promotional credit (app_download, first_login)
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { getCurrentBalance, updateBalanceCache, pushCreditToBlvd, formatCents } from '@/lib/velocity'
import { rateLimiters, applyRateLimit } from '@/lib/rateLimit'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })
  if (applyRateLimit(req, res, rateLimiters.tight, user.id)) return

  const db = getServiceClient()
  const { trigger } = req.body

  if (!trigger || !['app_download', 'first_login'].includes(trigger)) {
    return res.status(400).json({ error: 'Invalid trigger. Must be app_download or first_login' })
  }

  const { data: member } = await db
    .from('members')
    .select('id, blvd_client_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return res.status(404).json({ error: 'Member not found' })

  // Find active promotion for this trigger
  const now = new Date().toISOString()
  const { data: promo } = await db
    .from('velocity_promotions')
    .select('*')
    .eq('trigger_type', trigger)
    .eq('is_active', true)
    .lte('starts_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!promo) return res.json({ ok: false, error: 'No active promotion for this trigger' })
  if (promo.ends_at && promo.ends_at < now) return res.json({ ok: false, error: 'Promotion has ended' })
  if (promo.max_claims && promo.total_claimed >= promo.max_claims) return res.json({ ok: false, error: 'Promotion is fully claimed' })

  // Check if already claimed
  const { data: existingClaim } = await db
    .from('velocity_promotion_claims')
    .select('id')
    .eq('promotion_id', promo.id)
    .eq('member_id', member.id)
    .maybeSingle()

  if (existingClaim) return res.json({ ok: false, error: 'Already claimed', alreadyClaimed: true })

  // Grant the credit
  const currentBalance = await getCurrentBalance(db, member.id)
  const expiresAt = new Date(Date.now() + promo.expiry_days * 86400000).toISOString()

  const { data: ledgerEntry } = await db.from('velocity_ledger').insert({
    member_id: member.id,
    blvd_client_id: member.blvd_client_id,
    event_type: 'promo',
    promotion_id: promo.id,
    amount_cents: promo.amount_cents,
    balance_after_cents: currentBalance + promo.amount_cents,
    expires_at: expiresAt,
    admin_note: `Claimed: ${promo.name}`,
    blvd_pushed: false,
  }).select('id').single()

  // Record claim
  await db.from('velocity_promotion_claims').insert({
    promotion_id: promo.id,
    member_id: member.id,
    ledger_entry_id: ledgerEntry.id,
  })

  // Increment total_claimed
  await db.from('velocity_promotions').update({ total_claimed: promo.total_claimed + 1 }).eq('id', promo.id)

  // Push to BLVD
  if (member.blvd_client_id) {
    const { data: blvdClient } = await db.from('blvd_clients').select('boulevard_id').eq('id', member.blvd_client_id).maybeSingle()
    if (blvdClient?.boulevard_id) {
      try {
        await pushCreditToBlvd(blvdClient.boulevard_id, promo.amount_cents, `RELUXE Rewards - ${promo.description || promo.name}`, 'westfield')
        await db.from('velocity_ledger').update({ blvd_pushed: true }).eq('id', ledgerEntry.id)
      } catch (err) {
        console.error(`[velocity/claim] Push failed for member ${member.id}:`, err.message)
      }
    }
  }

  await updateBalanceCache(db, member.id)

  return res.json({
    ok: true,
    amount_cents: promo.amount_cents,
    formatted: formatCents(promo.amount_cents),
    message: promo.description || `You earned ${formatCents(promo.amount_cents)} in RELUXE Rewards!`,
    expires_at: expiresAt,
  })
}
