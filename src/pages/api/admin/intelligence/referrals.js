// src/pages/api/admin/intelligence/referrals.js
// Admin API: referral program summary, funnel, top referrers, channel breakdown, referral list.
import { getServiceClient } from '@/lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' })

  const db = getServiceClient()
  const { days = '30', page = '1', limit = '50' } = req.query
  const cutoff = new Date(Date.now() - Number(days) * 86400000).toISOString()
  const pageNum = Math.max(1, parseInt(page))
  const pageSize = Math.min(100, Math.max(10, parseInt(limit)))
  const offset = (pageNum - 1) * pageSize

  try {
    // ── Summary stats ──
    const { data: allCodes } = await db
      .from('referral_codes')
      .select('id, code, tier, total_shares, total_clicks, total_signups, total_completed, total_earned, member_id')

    const totalReferrers = allCodes?.length || 0
    const activeReferrers = allCodes?.filter(c => c.total_shares > 0 || c.total_clicks > 0).length || 0
    const totalEarned = allCodes?.reduce((sum, c) => sum + Number(c.total_earned || 0), 0) || 0
    const totalCompleted = allCodes?.reduce((sum, c) => sum + (c.total_completed || 0), 0) || 0

    // ── Referrals in period ──
    const { data: periodReferrals } = await db
      .from('referrals')
      .select('id, status, referral_code_id, share_channel, is_self_referral, referee_phone, referee_email, clicked_at, booked_at, completed_at, credited_at, referrer_reward_amount, location_key, fraud_flags')
      .gte('created_at', cutoff)

    const periodTotal = periodReferrals?.length || 0
    const periodByStatus = {}
    periodReferrals?.forEach(r => {
      periodByStatus[r.status] = (periodByStatus[r.status] || 0) + 1
    })

    // Funnel
    const funnel = {
      clicked: periodTotal,
      booked: (periodByStatus.booked || 0) + (periodByStatus.completed || 0) + (periodByStatus.credited || 0),
      completed: (periodByStatus.completed || 0) + (periodByStatus.credited || 0),
      credited: periodByStatus.credited || 0,
      cancelled: periodByStatus.cancelled || 0,
      expired: periodByStatus.expired || 0,
    }

    const conversionRate = funnel.clicked > 0
      ? ((funnel.credited / funnel.clicked) * 100).toFixed(1)
      : '0.0'

    const creditsIssued = periodReferrals
      ?.filter(r => r.status === 'credited')
      .reduce((sum, r) => sum + Number(r.referrer_reward_amount || 25), 0) || 0

    // Self-referral count
    const selfReferrals = periodReferrals?.filter(r => r.is_self_referral).length || 0

    // Fraud flagged
    const fraudFlagged = periodReferrals?.filter(r => {
      const flags = r.fraud_flags
      return Array.isArray(flags) && flags.length > 0
    }).length || 0

    // ── Channel breakdown ──
    const { data: shares } = await db
      .from('referral_shares')
      .select('channel')
      .gte('created_at', cutoff)

    const channelCounts = {}
    shares?.forEach(s => {
      channelCounts[s.channel] = (channelCounts[s.channel] || 0) + 1
    })
    const channelBreakdown = Object.entries(channelCounts)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)

    // ── Top referrers ──
    const topReferrers = (allCodes || [])
      .filter(c => c.total_completed > 0 || c.total_clicks > 5)
      .sort((a, b) => b.total_completed - a.total_completed || Number(b.total_earned) - Number(a.total_earned))
      .slice(0, 20)

    // Get member names for top referrers
    const memberIds = topReferrers.map(c => c.member_id)
    const { data: members } = memberIds.length
      ? await db.from('members').select('id, first_name, last_name, email').in('id', memberIds)
      : { data: [] }

    const memberMap = {}
    members?.forEach(m => { memberMap[m.id] = m })

    const topReferrersFormatted = topReferrers.map(c => {
      const m = memberMap[c.member_id]
      return {
        code: c.code,
        name: m ? `${m.first_name || ''} ${m.last_name || ''}`.trim() : 'Unknown',
        email: m?.email || '',
        tier: c.tier,
        shares: c.total_shares,
        clicks: c.total_clicks,
        booked: c.total_signups,
        completed: c.total_completed,
        earned: Number(c.total_earned),
      }
    })

    // ── Pending credits (booked but not yet credited) ──
    const { data: pending } = await db
      .from('referrals')
      .select('id, referral_code_id, referee_phone, referee_email, appointment_blvd_id, booked_at, location_key')
      .eq('status', 'booked')
      .eq('referrer_credit_issued', false)
      .order('booked_at', { ascending: false })
      .limit(25)

    // ── Paginated referral list ──
    const { data: referralList, count: totalCount } = await db
      .from('referrals')
      .select('id, status, referee_phone, referee_email, share_channel, referrer_reward_amount, is_self_referral, fraud_flags, location_key, clicked_at, booked_at, completed_at, credited_at, referral_code_id', { count: 'exact' })
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Resolve referral codes for the list
    const codeIds = [...new Set((referralList || []).map(r => r.referral_code_id).filter(Boolean))]
    const { data: codeRows } = codeIds.length
      ? await db.from('referral_codes').select('id, code').in('id', codeIds)
      : { data: [] }
    const codeMap = {}
    codeRows?.forEach(c => { codeMap[c.id] = c.code })

    const referralsFormatted = (referralList || []).map(r => ({
      id: r.id,
      code: codeMap[r.referral_code_id] || '?',
      status: r.status,
      referee: r.referee_phone
        ? `***-***-${r.referee_phone.slice(-4)}`
        : r.referee_email || 'Anonymous',
      channel: r.share_channel || '-',
      reward: r.referrer_reward_amount || 25,
      selfReferral: r.is_self_referral,
      fraudFlags: r.fraud_flags || [],
      location: r.location_key || '-',
      clickedAt: r.clicked_at,
      bookedAt: r.booked_at,
      completedAt: r.completed_at,
      creditedAt: r.credited_at,
    }))

    return res.json({
      summary: {
        totalReferrers,
        activeReferrers,
        totalEarned,
        totalCompleted,
        periodTotal,
        conversionRate,
        creditsIssued,
        selfReferrals,
        fraudFlagged,
      },
      funnel,
      channelBreakdown,
      topReferrers: topReferrersFormatted,
      pendingCredits: pending || [],
      referrals: referralsFormatted,
      pagination: {
        page: pageNum,
        pageSize,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize),
      },
    })
  } catch (err) {
    console.error('[admin/intelligence/referrals]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
