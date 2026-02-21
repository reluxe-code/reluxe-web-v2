// src/pages/api/member/referral/invite.js
// Intentional referral: member submits friend's name + phone.
// Creates an 'invited' referral row, optionally sends SMS via Bird.
// GET: list pending invitations
// POST: { firstName, phone, sendSMS?: boolean }
import { createClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/supabase'
import { sendSMS } from '@/lib/bird'

const MAX_PENDING_INVITES = 20
const INVITE_EXPIRY_DAYS = 15

function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function authenticateMember(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return { error: 'Authentication required' }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
  if (authError || !user) return { error: 'Invalid or expired session' }

  const db = getServiceClient()
  const { data: member } = await db
    .from('members')
    .select('id, first_name, last_name, phone, email')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!member) return { error: 'Member not found' }
  return { member, db }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  return res.status(405).json({ error: 'GET or POST only' })
}

async function handleGet(req, res) {
  const auth = await authenticateMember(req)
  if (auth.error) return res.status(401).json({ error: auth.error })
  const { member, db } = auth

  const { data: invites } = await db
    .from('referrals')
    .select('id, referee_first_name, referee_phone, status, invited_at, booked_at, completed_at')
    .eq('referrer_member_id', member.id)
    .eq('status', 'invited')
    .order('invited_at', { ascending: false })

  // Count total pending
  const { count } = await db
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_member_id', member.id)
    .eq('status', 'invited')

  return res.json({
    invites: (invites || []).map(i => ({
      id: i.id,
      name: i.referee_first_name || 'Friend',
      phone: i.referee_phone ? `***-***-${i.referee_phone.slice(-4)}` : null,
      status: i.status,
      invitedAt: i.invited_at,
      expiresAt: i.invited_at
        ? new Date(new Date(i.invited_at).getTime() + INVITE_EXPIRY_DAYS * 86400000).toISOString()
        : null,
    })),
    pendingCount: count || 0,
    maxInvites: MAX_PENDING_INVITES,
    canInvite: (count || 0) < MAX_PENDING_INVITES,
  })
}

async function handlePost(req, res) {
  const auth = await authenticateMember(req)
  if (auth.error) return res.status(401).json({ error: auth.error })
  const { member, db } = auth

  const { firstName, phone, sendSMS: shouldSendSMS } = req.body
  if (!firstName || !phone) {
    return res.status(400).json({ error: 'firstName and phone are required' })
  }

  const normalized = normalizePhone(phone)
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  // Self-referral check
  const memberPhone = (member.phone || '').replace(/\D/g, '').slice(-10)
  const inviteePhone = normalized.replace(/\D/g, '').slice(-10)
  if (memberPhone && inviteePhone && memberPhone === inviteePhone) {
    return res.status(400).json({ error: "You can't refer yourself" })
  }

  // Check pending invite limit
  const { count: pendingCount } = await db
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_member_id', member.id)
    .eq('status', 'invited')

  if (pendingCount >= MAX_PENDING_INVITES) {
    return res.status(400).json({ error: `You have ${MAX_PENDING_INVITES} pending invitations. Wait for some to expire or convert before adding more.` })
  }

  // Check if this phone was already invited by this member
  const { data: existing } = await db
    .from('referrals')
    .select('id')
    .eq('referrer_member_id', member.id)
    .ilike('referee_phone', `%${inviteePhone}`)
    .in('status', ['invited', 'booked', 'completed', 'credited'])
    .limit(1)

  if (existing?.length) {
    return res.status(409).json({ error: "You've already referred this phone number" })
  }

  // Get member's primary referral code
  const { data: codes } = await db
    .from('referral_codes')
    .select('id, code, custom_code')
    .eq('member_id', member.id)
    .order('is_primary', { ascending: false })
    .limit(1)

  const rc = codes?.[0]
  if (!rc) {
    return res.status(400).json({ error: 'No referral code found. Please reload your referrals tab.' })
  }

  const code = rc.custom_code || rc.code
  const referralUrl = `https://reluxemedspa.com/referral/${code}`
  const now = new Date().toISOString()

  // Create invited referral
  const { data: referral, error: insertErr } = await db
    .from('referrals')
    .insert({
      referral_code_id: rc.id,
      referrer_member_id: member.id,
      referee_first_name: firstName.trim(),
      referee_phone: normalized,
      status: 'invited',
      invited_at: now,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[member/referral/invite] insert error:', insertErr.message)
    return res.status(500).json({ error: 'Failed to create invitation' })
  }

  // Log event
  await db.from('referral_events').insert({
    referral_id: referral.id,
    event_type: 'invited',
    metadata: { referee_name: firstName.trim(), send_sms: !!shouldSendSMS },
  })

  // Increment shares count
  await db
    .from('referral_codes')
    .update({ total_shares: (rc.total_shares || 0) + 1 })
    .eq('id', rc.id)
    .catch(() => {})

  // Send SMS if requested
  let smsSent = false
  if (shouldSendSMS) {
    const memberName = member.first_name || 'Your friend'
    const message = `${memberName} thinks you'd love RELUXE Med Spa! Get $25 off your first treatment: ${referralUrl}`
    const result = await sendSMS(normalized, message)
    smsSent = result.ok
  }

  // Build sms: link for manual sending
  const smsBody = encodeURIComponent(
    `${member.first_name || 'Hey'} thinks you'd love RELUXE Med Spa! Get $25 off your first treatment: ${referralUrl}`
  )
  const smsLink = `sms:${normalized}?body=${smsBody}`

  return res.json({
    ok: true,
    referralId: referral.id,
    smsSent,
    smsLink,
    referralUrl,
    expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000).toISOString(),
  })
}
