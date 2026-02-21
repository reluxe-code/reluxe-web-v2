// src/components/member/ReferralDashboard.js
// Member drawer tab: referral code, share buttons, stats, tier progress, recent referrals.
import { useState, useEffect } from 'react'
import { useMember } from '@/context/MemberContext'
import { supabase } from '@/lib/supabase'
import { TIER_INFO } from '@/lib/referralCodes'
import { colors } from '@/components/preview/tokens'

const STATUS_LABELS = {
  clicked: { label: 'Clicked', color: '#737373' },
  booked: { label: 'Booked', color: '#3b82f6' },
  completed: { label: 'Completed', color: '#22c55e' },
  credited: { label: 'Credited', color: '#8b5cf6' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  expired: { label: 'Expired', color: '#737373' },
}

export default function ReferralDashboard({ fonts }) {
  const { member } = useMember()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setLoading(false); return }
      fetch('/api/member/referral', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => { if (d.code) setData(d) })
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [])

  const logShare = async (channel) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      fetch('/api/member/referral/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ channel, context: 'member_dashboard' }),
      }).catch(() => {})
    } catch {}
  }

  const handleCopy = async () => {
    if (!data?.referralUrl) return
    try {
      await navigator.clipboard.writeText(data.referralUrl)
    } catch {
      const input = document.createElement('input')
      input.value = data.referralUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    logShare('copy_link')
  }

  const handleSMS = () => {
    const text = `I love RELUXE! Book your first treatment and we both get $25. ${data.referralUrl}`
    window.open(`sms:?&body=${encodeURIComponent(text)}`, '_self')
    logShare('sms')
  }

  const handleWhatsApp = () => {
    const text = `I love RELUXE! Book your first treatment and we both get $25. ${data.referralUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    logShare('whatsapp')
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.3)' }}>Loading referral data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.3)' }}>Unable to load referral data. Please try again.</p>
      </div>
    )
  }

  const tier = TIER_INFO[data.tier] || TIER_INFO.member
  const nextTier = tier.next ? TIER_INFO[tier.next] : null
  const progress = nextTier ? (data.stats.total_completed / nextTier.threshold) * 100 : 100
  const remaining = nextTier ? nextTier.threshold - data.stats.total_completed : 0

  return (
    <div>
      {/* Headline */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, marginBottom: 4 }}>
          Give $25, Get $25
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)' }}>
          Share your referral link. When your friend books and completes their first visit, you both earn credit.
        </p>
      </div>

      {/* Referral link + copy */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 16,
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {data.referralUrl}
        </span>
        <button onClick={handleCopy} style={{
          fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
          padding: '5px 12px', borderRadius: 6,
          background: copied ? '#22c55e' : colors.violet,
          color: '#fff', border: 'none', cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'background 0.2s',
        }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'Text', icon: '💬', onClick: handleSMS },
          { label: 'WhatsApp', icon: '📱', onClick: handleWhatsApp },
          { label: 'Copy Link', icon: '🔗', onClick: handleCopy },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.onClick} style={{
            fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500,
            padding: '8px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: colors.white, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'background 0.15s',
          }}>
            <span>{btn.icon}</span> {btn.label}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        marginBottom: 24,
      }}>
        {[
          { label: 'Shares', value: data.stats.total_shares },
          { label: 'Booked', value: data.stats.total_signups },
          { label: 'Completed', value: data.stats.total_completed },
          { label: 'Earned', value: `$${data.stats.total_earned}` },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '12px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.white }}>
              {s.value}
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 500, color: 'rgba(250,248,245,0.35)', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tier + progress */}
      <div style={{
        padding: '16px', borderRadius: 12,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 99,
              background: tier.color === 'emerald' ? '#d1fae5' : tier.color === 'violet' ? '#ede9fe' : tier.color === 'amber' ? '#fef3c7' : '#e5e5e5',
              color: tier.color === 'emerald' ? '#065f46' : tier.color === 'violet' ? '#5b21b6' : tier.color === 'amber' ? '#92400e' : '#525252',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {data.tierLabel}
            </span>
            <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)' }}>
              ${tier.reward}/referral
            </span>
          </div>
        </div>

        {nextTier && (
          <>
            <div style={{
              height: 6, borderRadius: 3,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #7C3AED, #C026D3)',
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)',
              marginTop: 6,
            }}>
              {remaining} more referral{remaining !== 1 ? 's' : ''} to reach <strong style={{ color: '#a78bfa' }}>{nextTier.label}</strong> (${nextTier.reward}/referral)
            </p>
          </>
        )}

        {!nextTier && (
          <p style={{
            fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)',
          }}>
            You've reached the highest tier. Thank you for being an amazing advocate!
          </p>
        )}
      </div>

      {/* Recent referrals */}
      {data.recentReferrals?.length > 0 && (
        <div>
          <h4 style={{ fontFamily: fonts.display, fontSize: '0.875rem', fontWeight: 600, color: colors.white, marginBottom: 12 }}>
            Recent Referrals
          </h4>
          {data.recentReferrals.map((ref) => {
            const status = STATUS_LABELS[ref.status] || STATUS_LABELS.clicked
            const date = ref.clicked_at ? new Date(ref.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            return (
              <div key={ref.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.white }}>
                    {ref.referee_phone
                      ? `***-***-${ref.referee_phone.slice(-4)}`
                      : ref.referee_email
                        ? ref.referee_email.replace(/(.{2}).*(@.*)/, '$1***$2')
                        : 'Anonymous click'}
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginLeft: 8 }}>
                    {date}
                  </span>
                </div>
                <span style={{
                  fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 600,
                  padding: '2px 8px', borderRadius: 99,
                  background: `${status.color}20`, color: status.color,
                }}>
                  {status.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {(!data.recentReferrals || data.recentReferrals.length === 0) && (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.3)' }}>
            No referrals yet. Share your link to get started!
          </p>
        </div>
      )}
    </div>
  )
}
