// src/pages/api/admin/intelligence/customer-detail.js
// Full customer profile with referral data for the admin drawer.
// GET ?client_id=<uuid>
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const { client_id } = req.query
  if (!client_id) return res.status(400).json({ error: 'client_id required' })

  const db = getServiceClient()

  try {
    // 1. Client summary from materialized view
    const { data: summary, error: summaryErr } = await db
      .from('client_visit_summary')
      .select('*')
      .eq('client_id', client_id)
      .single()

    if (summaryErr) throw summaryErr

    const client = {
      client_id: summary.client_id,
      name: summary.name || [summary.first_name, summary.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: summary.email,
      phone: summary.phone,
      ltv_bucket: summary.ltv_bucket,
      total_visits: summary.total_visits,
      total_spend: Math.round(Number(summary.total_spend || 0)),
      first_visit: summary.first_visit,
      last_visit: summary.last_visit,
      days_since_last_visit: summary.days_since_last_visit,
    }

    // 2. Find linked member by phone or email
    const conditions = []
    const clientPhone = (summary.phone || '').replace(/\D/g, '').slice(-10)
    if (clientPhone) conditions.push(`phone.ilike.%${clientPhone}`)
    if (summary.email) conditions.push(`email.ilike.${summary.email}`)

    let member = null
    if (conditions.length) {
      const { data: memberRow } = await db
        .from('members')
        .select('id, first_name, last_name, phone, email, auth_user_id, created_at')
        .or(conditions.join(','))
        .limit(1)
        .maybeSingle()
      member = memberRow
    }

    // 3. Referral codes (if member exists)
    let referralCodes = []
    let outboundReferrals = []
    let stats = { total_referred: 0, total_completed: 0, total_earned: 0, tier: null, conversion_rate: '0.0' }

    if (member) {
      const { data: codes } = await db
        .from('referral_codes')
        .select('id, code, custom_code, tier, is_primary, total_shares, total_clicks, total_signups, total_completed, total_earned, created_at')
        .eq('member_id', member.id)
        .order('created_at', { ascending: true })

      referralCodes = (codes || []).map(c => ({
        id: c.id,
        code: c.custom_code || c.code,
        rawCode: c.code,
        tier: c.tier,
        isPrimary: !!c.is_primary,
        shares: c.total_shares,
        clicks: c.total_clicks,
        signups: c.total_signups,
        completed: c.total_completed,
        earned: Number(c.total_earned || 0),
        createdAt: c.created_at,
      }))

      // Aggregated stats
      const totalCompleted = referralCodes.reduce((s, c) => s + c.completed, 0)
      const totalEarned = referralCodes.reduce((s, c) => s + c.earned, 0)
      const totalClicks = referralCodes.reduce((s, c) => s + c.clicks, 0)
      const primaryCode = referralCodes.find(c => c.isPrimary) || referralCodes[0]

      stats = {
        total_referred: totalClicks,
        total_completed: totalCompleted,
        total_earned: totalEarned,
        tier: primaryCode?.tier || 'member',
        conversion_rate: totalClicks > 0 ? ((totalCompleted / totalClicks) * 100).toFixed(1) : '0.0',
      }

      // 4. Outbound referrals — people this customer referred
      const { data: outbound } = await db
        .from('referrals')
        .select('id, status, referee_phone, referee_email, location_key, clicked_at, booked_at, completed_at, credited_at, referrer_reward_amount, is_self_referral, fraud_flags')
        .eq('referrer_member_id', member.id)
        .neq('status', 'fraud_rejected')
        .order('created_at', { ascending: false })
        .limit(50)

      outboundReferrals = (outbound || []).map(r => ({
        id: r.id,
        status: r.status,
        referee: r.referee_phone
          ? `***-***-${r.referee_phone.slice(-4)}`
          : r.referee_email || 'Anonymous',
        location: r.location_key || '-',
        clickedAt: r.clicked_at,
        bookedAt: r.booked_at,
        completedAt: r.completed_at,
        creditedAt: r.credited_at,
        reward: Number(r.referrer_reward_amount || 25),
        selfReferral: r.is_self_referral,
        fraudFlags: r.fraud_flags || [],
      }))
    }

    // 5. Inbound referrals — who referred THIS customer
    let inboundReferrals = []
    const inboundConditions = []
    if (clientPhone) inboundConditions.push(`referee_phone.ilike.%${clientPhone}`)
    if (summary.email) inboundConditions.push(`referee_email.ilike.${summary.email}`)

    if (inboundConditions.length) {
      const { data: inbound } = await db
        .from('referrals')
        .select('id, status, referral_code_id, referrer_member_id, booked_at, completed_at, credited_at, referee_reward_amount')
        .or(inboundConditions.join(','))
        .order('created_at', { ascending: false })
        .limit(20)

      if (inbound?.length) {
        // Resolve referrer names
        const referrerIds = [...new Set(inbound.map(r => r.referrer_member_id).filter(Boolean))]
        const { data: referrers } = referrerIds.length
          ? await db.from('members').select('id, first_name, last_name').in('id', referrerIds)
          : { data: [] }
        const referrerMap = {}
        for (const m of (referrers || [])) {
          referrerMap[m.id] = `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown'
        }

        inboundReferrals = inbound.map(r => ({
          id: r.id,
          status: r.status,
          referrerName: referrerMap[r.referrer_member_id] || 'Unknown',
          bookedAt: r.booked_at,
          completedAt: r.completed_at,
          creditedAt: r.credited_at,
          reward: Number(r.referee_reward_amount || 25),
        }))
      }
    }

    return res.json({
      client,
      member: member ? {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        phone: member.phone,
        email: member.email,
        hasAuth: !!member.auth_user_id,
        createdAt: member.created_at,
      } : null,
      referralCodes,
      outboundReferrals,
      inboundReferrals,
      stats,
    })
  } catch (err) {
    console.error('[admin/intelligence/customer-detail]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
