// src/components/member/ReferralDashboard.js
// Member drawer tab: referral codes (with phone), share buttons, custom code creation,
// stats, tier progress, recent referrals.
import { useState, useEffect } from 'react'
import { useMember } from '@/context/MemberContext'
import { supabase } from '@/lib/supabase'
import { TIER_INFO } from '@/lib/referralCodes'
import { colors } from '@/components/preview/tokens'

const STATUS_LABELS = {
  invited: { label: 'Invited', color: '#f59e0b' },
  clicked: { label: 'Clicked', color: '#737373' },
  claimed: { label: 'Claimed', color: '#06b6d4' },
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
  const [copied, setCopied] = useState(null) // tracks which code was copied
  const [newCode, setNewCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  // Invite state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteSendSMS, setInviteSendSMS] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [inviteError, setInviteError] = useState(null)
  const [invites, setInvites] = useState(null)

  const fetchData = () => {
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
  }

  useEffect(() => { fetchData() }, [])

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  const logShare = async (channel) => {
    try {
      const session = await getSession()
      if (!session?.access_token) return
      fetch('/api/member/referral/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ channel, context: 'member_dashboard' }),
      }).catch(() => {})
    } catch {}
  }

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
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

  const handleCreateCode = async () => {
    if (!newCode.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const session = await getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/member/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ customCode: newCode.trim() }),
      })
      const result = await res.json()
      if (!res.ok) {
        setCreateError(result.error || 'Failed to create code')
      } else {
        setNewCode('')
        fetchData() // refresh to show new code
      }
    } catch {
      setCreateError('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const fetchInvites = async () => {
    try {
      const session = await getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/member/referral/invite', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (json.invites) setInvites(json)
    } catch {}
  }

  useEffect(() => { fetchInvites() }, [])

  const handleInvite = async () => {
    if (!inviteName.trim() || !invitePhone.trim()) return
    setInviting(true)
    setInviteError(null)
    setInviteResult(null)
    try {
      const session = await getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/member/referral/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ firstName: inviteName.trim(), phone: invitePhone.trim(), sendSMS: inviteSendSMS }),
      })
      const result = await res.json()
      if (!res.ok) {
        setInviteError(result.error || 'Failed to send invitation')
      } else {
        setInviteResult(result)
        setInviteName('')
        setInvitePhone('')
        fetchInvites()
        fetchData()
      }
    } catch {
      setInviteError('Something went wrong')
    } finally {
      setInviting(false)
    }
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
          Share your referral link or phone number. When your friend books and completes their first visit, you both earn credit.
        </p>
      </div>

      {/* Primary referral link + copy */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {data.referralUrl}
        </span>
        <button onClick={() => copyToClipboard(data.referralUrl, 'primary')} style={{
          fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
          padding: '5px 12px', borderRadius: 6,
          background: copied === 'primary' ? '#22c55e' : colors.violet,
          color: '#fff', border: 'none', cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'background 0.2s',
        }}>
          {copied === 'primary' ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Phone number as code */}
      {data.phoneCode && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 8,
        }}>
          <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.35)' }}>
            Your phone number also works:
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(250,248,245,0.5)', flex: 1 }}>
            {data.phoneCode}
          </span>
          <button onClick={() => copyToClipboard(data.phoneCode, 'phone')} style={{
            fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
            padding: '4px 10px', borderRadius: 6,
            background: copied === 'phone' ? '#22c55e' : 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}>
            {copied === 'phone' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* All codes list (if more than 1) */}
      {data.codes?.length > 1 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginBottom: 6 }}>
            Your referral codes:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.codes.map((c) => (
              <button
                key={c.id}
                onClick={() => copyToClipboard(`https://reluxemedspa.com/referral/${c.code}`, c.id)}
                style={{
                  fontFamily: 'monospace', fontSize: '0.6875rem', fontWeight: 600,
                  padding: '4px 10px', borderRadius: 6,
                  background: copied === c.id ? '#22c55e' : 'rgba(124,58,237,0.15)',
                  color: copied === c.id ? '#fff' : '#a78bfa',
                  border: '1px solid rgba(124,58,237,0.2)',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                {copied === c.id ? 'Copied!' : c.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Text', icon: '\uD83D\uDCAC', onClick: handleSMS },
          { label: 'WhatsApp', icon: '\uD83D\uDCF1', onClick: handleWhatsApp },
          { label: 'Copy Link', icon: '\uD83D\uDD17', onClick: () => copyToClipboard(data.referralUrl, 'share') },
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

      {/* Refer a Friend */}
      <div style={{
        padding: '14px', borderRadius: 12,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
        marginBottom: 16,
      }}>
        <button
          onClick={() => { setShowInvite(!showInvite); setInviteResult(null); setInviteError(null) }}
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
            color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          }}
        >
          <span style={{ fontSize: '1rem' }}>+</span> Refer a Friend
          <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', fontWeight: 400 }}>
            {invites ? `${invites.pendingCount}/${invites.maxInvites} pending` : ''}
          </span>
        </button>

        {showInvite && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', marginBottom: 10 }}>
              Enter your friend&apos;s name and phone. We&apos;ll track them automatically — if they book within 15 days, you get credit.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Friend's name"
                style={{
                  flex: 1, fontFamily: fonts.body, fontSize: '0.75rem',
                  padding: '8px 12px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.white, outline: 'none',
                }}
              />
              <input
                type="tel"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                placeholder="Phone number"
                style={{
                  flex: 1, fontFamily: fonts.body, fontSize: '0.75rem',
                  padding: '8px 12px', borderRadius: 6,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.white, outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <label style={{
                fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={inviteSendSMS}
                  onChange={(e) => setInviteSendSMS(e.target.checked)}
                  style={{ accentColor: '#7C3AED' }}
                />
                Have RELUXE send them a text
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteName.trim() || !invitePhone.trim()}
                style={{
                  fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                  padding: '8px 16px', borderRadius: 6,
                  background: colors.violet, color: '#fff',
                  border: 'none', cursor: inviting ? 'wait' : 'pointer',
                  opacity: inviting || !inviteName.trim() || !invitePhone.trim() ? 0.5 : 1,
                }}
              >
                {inviting ? 'Sending...' : inviteSendSMS ? 'Send Invite' : 'Add Referral'}
              </button>
            </div>

            {inviteError && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: '#ef4444', marginTop: 8 }}>
                {inviteError}
              </p>
            )}

            {inviteResult && (
              <div style={{
                marginTop: 10, padding: '10px 12px', borderRadius: 8,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: '#22c55e', fontWeight: 600 }}>
                  {inviteResult.smsSent ? 'Invitation sent!' : 'Referral added!'}
                </p>
                {!inviteResult.smsSent && inviteResult.smsLink && (
                  <a
                    href={inviteResult.smsLink}
                    style={{
                      fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                      display: 'inline-block', marginTop: 6, padding: '5px 12px', borderRadius: 6,
                      background: '#3b82f6', color: '#fff', textDecoration: 'none',
                    }}
                  >
                    Send Text Myself
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending invitations */}
        {invites?.invites?.length > 0 && (
          <div style={{ marginTop: showInvite ? 12 : 10 }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.625rem', color: 'rgba(250,248,245,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending Invitations
            </p>
            {invites.invites.map((inv) => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.6)' }}>
                  {inv.name} {inv.phone ? `(${inv.phone})` : ''}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.25)' }}>
                  expires {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create custom code */}
      {data.canAddCode && (
        <div style={{
          padding: '12px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 24,
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', marginBottom: 8 }}>
            Create a custom code ({data.codes?.length || 1}/5 used)
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newCode}
              onChange={(e) => { setNewCode(e.target.value.toUpperCase()); setCreateError(null) }}
              placeholder="e.g. RELUXE-VIP"
              maxLength={20}
              style={{
                flex: 1, fontFamily: 'monospace', fontSize: '0.75rem',
                padding: '8px 12px', borderRadius: 6,
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: colors.white, outline: 'none',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCode() }}
            />
            <button
              onClick={handleCreateCode}
              disabled={creating || !newCode.trim()}
              style={{
                fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                padding: '8px 16px', borderRadius: 6,
                background: colors.violet, color: '#fff',
                border: 'none', cursor: creating ? 'wait' : 'pointer',
                opacity: creating || !newCode.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {creating ? '...' : 'Create'}
            </button>
          </div>
          {createError && (
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: '#ef4444', marginTop: 6 }}>
              {createError}
            </p>
          )}
        </div>
      )}

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
