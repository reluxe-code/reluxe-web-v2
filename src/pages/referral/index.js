// src/pages/referral/index.js
// Customer-facing referral program marketing page.
// Explains the program, shows member's code if authenticated, or prompts login.
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { LOCATIONS } from '@/data/locations'
import BetaNavBar from '@/components/beta/BetaNavBar'
import BetaFooter from '@/components/beta/BetaFooter'
import { LocationProvider } from '@/context/LocationContext'
import { MemberProvider, useMember } from '@/context/MemberContext'
import MemberDrawerPortal from '@/components/beta/MemberDrawerPortal'
import { supabase } from '@/lib/supabase'
import { formatPhone, isValidPhone } from '@/lib/phoneUtils'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const STEPS = [
  { num: '1', title: 'Share Your Code', desc: 'Share your unique referral link, custom code, or phone number with friends and family.', icon: '\uD83D\uDCE4' },
  { num: '2', title: 'They Book & Visit', desc: 'Your friend books their first treatment at either RELUXE location and enjoys their visit.', icon: '\u2728' },
  { num: '3', title: 'You Both Earn $25', desc: 'Your friend gets $25 credit at booking. You get $25 after their appointment is complete.', icon: '\uD83C\uDF81' },
]

const TIERS = [
  { name: 'Member', threshold: '0 referrals', reward: '$25/referral', color: '#737373', bg: '#e5e5e5' },
  { name: 'Advocate', threshold: '3 referrals', reward: '$30/referral + $50 bonus', color: '#065f46', bg: '#d1fae5' },
  { name: 'Ambassador', threshold: '10 referrals', reward: '$35/referral', color: '#5b21b6', bg: '#ede9fe' },
  { name: 'VIP Ambassador', threshold: '25 referrals', reward: '$50/referral', color: '#92400e', bg: '#fef3c7' },
]

function MemberReferralSection() {
  const { isAuthenticated, openDrawer, member } = useMember()
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Invite state
  const [showInvite, setShowInvite] = useState(true)
  const [inviteName, setInviteName] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [messageText, setMessageText] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)
  const [inviteError, setInviteError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return
      fetch('/api/member/referral', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then(d => { if (d.code) setData(d) })
        .catch(() => {})
    })
  }, [isAuthenticated])

  // Set default message when data loads
  useEffect(() => {
    if (data) {
      const name = member?.first_name || 'I'
      setMessageText(`${name === 'I' ? 'I' : name} think${name === 'I' ? '' : 's'} you'd love RELUXE Med Spa! Get $25 off your first treatment.`)
    }
  }, [data, member])

  const handleCopy = async () => {
    if (!data?.referralUrl) return
    try { await navigator.clipboard.writeText(data.referralUrl) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = async (sendViaReluxe) => {
    if (!inviteName.trim() || !invitePhone.trim()) return
    if (!isValidPhone(invitePhone)) {
      setInviteError('Enter a valid 10-digit phone number')
      return
    }
    setInviting(true)
    setInviteError(null)
    setInviteResult(null)

    if (!sendViaReluxe) {
      // Open native SMS with custom message
      const fullMessage = `${messageText}\n${data.referralUrl}`
      const digits = invitePhone.replace(/\D/g, '')
      const smsPhone = digits.length === 10 ? `+1${digits}` : digits.length === 11 ? `+${digits}` : digits
      window.open(`sms:${smsPhone}?body=${encodeURIComponent(fullMessage)}`, '_self')
      setInviting(false)
      // Still register the invite server-side
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          fetch('/api/member/referral/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ firstName: inviteName.trim(), phone: invitePhone.trim(), sendSMS: false }),
          }).catch(() => {})
        }
      } catch {}
      setInviteResult({ manual: true })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/member/referral/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ firstName: inviteName.trim(), phone: invitePhone.trim(), sendSMS: true, message: messageText }),
      })
      const result = await res.json()
      if (!res.ok) {
        setInviteError(result.error || 'Failed to send')
      } else {
        setInviteResult(result)
        setInviteName('')
        setInvitePhone('')
      }
    } catch {
      setInviteError('Something went wrong')
    } finally {
      setInviting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.white, marginBottom: 16 }}>
          Sign in to get your referral code and start earning.
        </p>
        <button
          onClick={() => openDrawer('referrals')}
          style={{
            fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
            padding: '14px 32px', borderRadius: 99,
            background: gradients.primary, color: '#fff',
            border: 'none', cursor: 'pointer',
          }}
        >
          Sign In / Create Account
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.4)' }}>Loading your referral code...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 20px' }}>
      {/* Referral link */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.4)', marginBottom: 12 }}>
          Your referral link
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 12, padding: '12px 20px', maxWidth: '100%',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.875rem', color: 'rgba(250,248,245,0.6)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {data.referralUrl}
          </span>
          <button onClick={handleCopy} style={{
            fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600,
            padding: '6px 16px', borderRadius: 8,
            background: copied ? '#22c55e' : colors.violet,
            color: '#fff', border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {data.phoneCode && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)', marginTop: 12 }}>
            Friends can also use your phone number <strong style={{ color: 'rgba(250,248,245,0.5)' }}>{data.phoneCode}</strong> as a referral code.
          </p>
        )}

        {data.codes?.length > 1 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.3)', marginBottom: 6 }}>
              All your codes: {data.codes.map(c => c.code).join(' · ')}
            </p>
          </div>
        )}

        <button
          onClick={() => openDrawer('referrals')}
          style={{
            fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
            padding: '10px 24px', borderRadius: 99, marginTop: 20,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: colors.white, cursor: 'pointer',
          }}
        >
          Manage Referrals & Create Custom Codes
        </button>
      </div>

      {/* ─── Refer a Friend Directly ─── */}
      <div style={{
        marginTop: 24, padding: '20px', borderRadius: 14,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
      }}>
        <p style={{
          fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
          color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0,
        }}>
          Refer a Friend Directly
        </p>

        <div style={{ marginTop: 12 }}>
            <p style={{
              fontFamily: fonts.body, fontSize: '0.8125rem',
              color: 'rgba(250,248,245,0.45)', lineHeight: 1.5, marginBottom: 14,
            }}>
              Add your friend&apos;s name and phone. If they book within 15 days, you both get credit.
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Friend's name"
                style={{
                  flex: 1, fontFamily: fonts.body, fontSize: '0.875rem',
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.white, outline: 'none',
                }}
              />
              <input
                type="tel"
                inputMode="numeric"
                value={invitePhone}
                onChange={(e) => setInvitePhone(formatPhone(e.target.value))}
                placeholder="(317) 555-1234"
                style={{
                  flex: 1, fontFamily: fonts.body, fontSize: '0.875rem',
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.white, outline: 'none',
                }}
              />
            </div>

            {/* Message preview */}
            <div style={{ marginBottom: 14 }}>
              <p style={{
                fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600,
                color: 'rgba(250,248,245,0.35)', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 6,
              }}>
                Preview message
              </p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                style={{
                  width: '100%', fontFamily: fonts.body, fontSize: '0.8125rem',
                  padding: '10px 14px', borderRadius: 8, resize: 'vertical',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
                  color: colors.white, outline: 'none', lineHeight: 1.5,
                }}
              />
              <p style={{
                fontFamily: 'monospace', fontSize: '0.6875rem',
                color: 'rgba(124,58,237,0.5)', marginTop: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {data.referralUrl} — added automatically
              </p>
            </div>

            {/* Send buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleInvite(false)}
                disabled={inviting || !inviteName.trim() || !invitePhone.trim()}
                style={{
                  fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                  padding: '10px 20px', borderRadius: 99, flex: 1, minWidth: 140,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: colors.white, cursor: 'pointer',
                  opacity: !inviteName.trim() || !invitePhone.trim() ? 0.4 : 1,
                }}
              >
                Send It Myself
              </button>
              <button
                onClick={() => handleInvite(true)}
                disabled={inviting || !inviteName.trim() || !invitePhone.trim()}
                style={{
                  fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                  padding: '10px 20px', borderRadius: 99, flex: 1, minWidth: 140,
                  background: inviting ? 'rgba(124,58,237,0.5)' : gradients.primary,
                  color: '#fff', border: 'none', cursor: inviting ? 'wait' : 'pointer',
                  opacity: !inviteName.trim() || !invitePhone.trim() ? 0.4 : 1,
                }}
              >
                {inviting ? 'Sending...' : 'Have RELUXE Send It'}
              </button>
            </div>

            {inviteError && (
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: '#ef4444', marginTop: 10 }}>
                {inviteError}
              </p>
            )}

            {inviteResult && (
              <div style={{
                marginTop: 12, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: '#22c55e', fontWeight: 600 }}>
                  {inviteResult.manual ? 'Referral tracked!' : inviteResult.smsSent ? 'Invitation sent!' : 'Referral added!'}
                </p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', marginTop: 4 }}>
                  {inviteResult.manual
                    ? 'Your native messaging app should have opened with the message.'
                    : inviteResult.smsSent
                      ? 'We sent your friend a text with your referral link.'
                      : 'Your friend has been added. Share the link with them directly.'}
                </p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}

export default function ReferralMarketingPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Referral Program — Give $25, Get $25 | RELUXE Med Spa</title>
        <meta name="description" content="Share RELUXE with friends and earn $25 in credit for every referral. Your friend gets $25 too. Use your link, custom code, or phone number." />
        <meta property="og:title" content="RELUXE Referral Program — Give $25, Get $25" />
        <meta property="og:description" content="Share RELUXE with friends. You both earn $25 in credit. It's that simple." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="stylesheet" href={fonts.googleUrl} />
      </Head>

      <LocationProvider>
        <MemberProvider>
          <div style={{ backgroundColor: colors.ink }}>
            <BetaNavBar fontKey={FONT_KEY} />

            {/* ─── HERO ─── */}
            <section style={{
              position: 'relative', overflow: 'hidden',
              padding: 'clamp(5rem, 12vw, 8rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 8vw, 4rem)',
              background: colors.ink, textAlign: 'center',
            }}>
              <div style={{
                position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '120%', height: '60%',
                background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: grain, backgroundRepeat: 'repeat',
                pointerEvents: 'none', opacity: 0.5,
              }} />

              <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 99,
                  background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                  marginBottom: 24,
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Referral Program
                  </span>
                </div>

                <h1 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.hero.size,
                  fontWeight: typeScale.hero.weight,
                  lineHeight: typeScale.hero.lineHeight,
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 16,
                }}>
                  Give $25, Get $25
                </h1>

                <p style={{
                  fontFamily: fonts.body, fontSize: '1.125rem',
                  color: 'rgba(250,248,245,0.6)', lineHeight: 1.6,
                  maxWidth: 540, margin: '0 auto',
                }}>
                  Love your RELUXE experience? Share it with friends and you'll <strong style={{ color: colors.white }}>both earn $25 in credit</strong>. Use your referral link, a custom code, or just your phone number.
                </p>
              </div>
            </section>

            {/* ─── MEMBER CODE SECTION ─── */}
            <section style={{
              padding: '0 clamp(1.25rem, 4vw, 3rem)',
              background: colors.ink,
            }}>
              <div style={{
                maxWidth: 640, margin: '0 auto',
                borderRadius: 16,
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
              }}>
                <MemberReferralSection />
              </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section style={{
              padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.charcoal,
            }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  color: colors.white, textAlign: 'center', marginBottom: 48,
                }}>
                  How It Works
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 24,
                }}>
                  {STEPS.map((step) => (
                    <div key={step.num} style={{
                      padding: '32px 24px', borderRadius: 16,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: 16, lineHeight: 1 }}>
                        {step.icon}
                      </div>
                      <div style={{
                        fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700,
                        color: '#a78bfa', letterSpacing: '0.12em', textTransform: 'uppercase',
                        marginBottom: 8,
                      }}>
                        Step {step.num}
                      </div>
                      <h3 style={{
                        fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600,
                        color: colors.white, marginBottom: 8,
                      }}>
                        {step.title}
                      </h3>
                      <p style={{
                        fontFamily: fonts.body, fontSize: '0.875rem',
                        color: 'rgba(250,248,245,0.5)', lineHeight: 1.5,
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── 3 WAYS TO SHARE ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.ink,
            }}>
              <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  color: colors.white, marginBottom: 40,
                }}>
                  3 Ways to Refer
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 20,
                }}>
                  {[
                    { title: 'Share Your Link', desc: 'Send your unique referral URL via text, email, or social media.', icon: '\uD83D\uDD17' },
                    { title: 'Custom Code', desc: 'Create up to 5 personalized codes like SARAH-VIP or RELUXE-FAM.', icon: '\uD83C\uDFF7\uFE0F' },
                    { title: 'Phone Number', desc: 'Just tell friends to use your phone number when they book.', icon: '\uD83D\uDCF1' },
                  ].map((w) => (
                    <div key={w.title} style={{
                      padding: '28px 20px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{w.icon}</div>
                      <h3 style={{
                        fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600,
                        color: colors.white, marginBottom: 6,
                      }}>
                        {w.title}
                      </h3>
                      <p style={{
                        fontFamily: fonts.body, fontSize: '0.8125rem',
                        color: 'rgba(250,248,245,0.4)', lineHeight: 1.5,
                      }}>
                        {w.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── TIER SYSTEM ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.charcoal,
            }}>
              <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  color: colors.white, textAlign: 'center', marginBottom: 12,
                }}>
                  Earn More as You Refer
                </h2>
                <p style={{
                  fontFamily: fonts.body, fontSize: '1rem',
                  color: 'rgba(250,248,245,0.5)', textAlign: 'center', marginBottom: 40,
                }}>
                  The more friends you refer, the more you earn per referral.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {TIERS.map((t) => (
                    <div key={t.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontFamily: fonts.body, fontSize: '0.625rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: 99,
                          background: t.bg, color: t.color,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          {t.name}
                        </span>
                        <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.35)' }}>
                          {t.threshold}
                        </span>
                      </div>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
                        {t.reward}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── FAQ ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.ink,
            }}>
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  color: colors.white, textAlign: 'center', marginBottom: 40,
                }}>
                  Questions?
                </h2>

                {[
                  { q: 'How does my friend get their $25?', a: '$25 in RELUXE store credit is applied to their account as soon as they book using your referral code. It automatically applies at their appointment.' },
                  { q: 'When do I get my $25?', a: 'Your $25 credit is issued after your friend completes their first appointment. Credits are processed automatically.' },
                  { q: 'Can my friend use my phone number instead of a code?', a: 'Yes! Your friend can use your phone number as a referral code when they book. It works just like a custom code.' },
                  { q: 'Is there a limit to how many people I can refer?', a: 'No limit! And the more you refer, the more you earn per referral through our tier system.' },
                  { q: 'Do credits expire?', a: 'No. RELUXE store credits have no expiration date and no minimum spend.' },
                ].map((faq) => (
                  <div key={faq.q} style={{
                    padding: '20px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <h3 style={{
                      fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600,
                      color: colors.white, marginBottom: 8,
                    }}>
                      {faq.q}
                    </h3>
                    <p style={{
                      fontFamily: fonts.body, fontSize: '0.875rem',
                      color: 'rgba(250,248,245,0.45)', lineHeight: 1.6,
                    }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── FINE PRINT ─── */}
            <section style={{
              padding: '24px clamp(1.25rem, 4vw, 3rem)',
              background: colors.ink,
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
              <p style={{
                fontFamily: fonts.body, fontSize: '0.6875rem',
                color: 'rgba(250,248,245,0.25)', textAlign: 'center',
                maxWidth: 600, margin: '0 auto', lineHeight: 1.5,
              }}>
                Referral credits are issued as RELUXE store credit with no cash value.
                Referee credit applied at booking; referrer credit issued after referee's first completed appointment.
                One referral reward per new client. Cannot be combined with other promotions.
                RELUXE reserves the right to modify or discontinue the referral program at any time.
              </p>
            </section>

            <BetaFooter fontKey={FONT_KEY} />
            <MemberDrawerPortal fonts={fonts} />
          </div>
        </MemberProvider>
      </LocationProvider>
    </>
  )
}
