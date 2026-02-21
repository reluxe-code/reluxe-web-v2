// src/components/booking/ReferralShareCTA.js
// Post-booking share prompt: "Give $25, Get $25"
// Renders inside both BookingFlowModal and ProviderAvailabilityPicker confirmations.
import { useState, useEffect } from 'react'
import { useMember } from '@/context/MemberContext'
import { supabase } from '@/lib/supabase'

export default function ReferralShareCTA({ fonts, variant = 'dark' }) {
  const { member, isAuthenticated } = useMember()
  const [referralData, setReferralData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setLoading(false); return }
      fetch('/api/member/referral', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.code) setReferralData(data)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [isAuthenticated])

  const referralUrl = referralData?.referralUrl
  const isDark = variant === 'dark'
  const textColor = isDark ? '#faf8f5' : '#1a1a1a'
  const mutedColor = isDark ? 'rgba(250,248,245,0.5)' : '#737373'
  const cardBg = isDark ? 'rgba(139,92,246,0.08)' : '#f5f3ff'
  const borderColor = isDark ? 'rgba(139,92,246,0.2)' : '#e9e5ff'

  const handleCopyLink = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      logShare('copy_link')
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = referralUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      logShare('copy_link')
    }
  }

  const handleSMS = () => {
    const text = `I love RELUXE! Book your first treatment and we both get $25. ${referralUrl}`
    window.open(`sms:?&body=${encodeURIComponent(text)}`, '_self')
    logShare('sms')
  }

  const handleWhatsApp = () => {
    const text = `I love RELUXE! Book your first treatment and we both get $25. ${referralUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    logShare('whatsapp')
  }

  const logShare = async (channel) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      fetch('/api/member/referral/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ channel, context: 'post_booking' }),
      }).catch(() => {})
    } catch {}
  }

  // Non-authenticated user: lighter CTA
  if (!isAuthenticated) {
    return (
      <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: cardBg, border: `1px solid ${borderColor}`, textAlign: 'center' }}>
        <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: mutedColor }}>
          Create your RELUXE account to earn <strong style={{ color: textColor }}>$25</strong> for every friend you refer.
        </p>
      </div>
    )
  }

  if (loading || !referralData) return null

  return (
    <div style={{ marginTop: 24, padding: '20px', borderRadius: 12, background: cardBg, border: `1px solid ${borderColor}` }}>
      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: fonts?.display, fontSize: '1rem', fontWeight: 700, color: textColor, marginBottom: 4 }}>
          Share the RELUXE love
        </p>
        <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: mutedColor }}>
          Give <strong style={{ color: '#8b5cf6' }}>$25</strong> to a friend, get <strong style={{ color: '#8b5cf6' }}>$25</strong> for yourself
        </p>
      </div>

      {/* Referral link */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
        border: `1px solid ${borderColor}`,
        borderRadius: 8, padding: '8px 12px', marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.75rem', color: mutedColor,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {referralUrl}
        </span>
        <button
          onClick={handleCopyLink}
          style={{
            fontFamily: fonts?.body, fontSize: '0.6875rem', fontWeight: 600,
            padding: '4px 10px', borderRadius: 6,
            background: copied ? '#22c55e' : '#8b5cf6',
            color: '#fff', border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <ShareButton label="Text" icon="💬" onClick={handleSMS} fonts={fonts} isDark={isDark} />
        <ShareButton label="WhatsApp" icon="📱" onClick={handleWhatsApp} fonts={fonts} isDark={isDark} />
        <ShareButton label="Copy Link" icon="🔗" onClick={handleCopyLink} fonts={fonts} isDark={isDark} />
      </div>

      {/* Tier badge */}
      {referralData.tier !== 'member' && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span style={{
            fontFamily: fonts?.body, fontSize: '0.625rem', fontWeight: 600,
            padding: '2px 8px', borderRadius: 99,
            background: referralData.tierColor === 'emerald' ? '#d1fae5' : referralData.tierColor === 'violet' ? '#ede9fe' : '#fef3c7',
            color: referralData.tierColor === 'emerald' ? '#065f46' : referralData.tierColor === 'violet' ? '#5b21b6' : '#92400e',
          }}>
            {referralData.tierLabel}
          </span>
          <span style={{ fontFamily: fonts?.body, fontSize: '0.625rem', color: mutedColor, marginLeft: 6 }}>
            {referralData.stats.total_completed} referral{referralData.stats.total_completed !== 1 ? 's' : ''} · ${referralData.stats.total_earned} earned
          </span>
        </div>
      )}
    </div>
  )
}

function ShareButton({ label, icon, onClick, fonts, isDark }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: fonts?.body, fontSize: '0.6875rem', fontWeight: 500,
        padding: '8px 14px', borderRadius: 8,
        background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e5e5'}`,
        color: isDark ? '#faf8f5' : '#1a1a1a',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.target.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5' }}
      onMouseLeave={(e) => { e.target.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#fff' }}
    >
      <span>{icon}</span> {label}
    </button>
  )
}
