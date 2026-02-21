// src/pages/referral/[code].js
// Public referral landing page — dark RELUXE aesthetic.
// Validates code SSR, fires click tracking on mount, sets attribution cookie.
import { useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { LOCATIONS } from '@/data/locations'
import { setReferralCode } from '@/lib/referral'
import BetaNavBar from '@/components/beta/BetaNavBar'
import BetaFooter from '@/components/beta/BetaFooter'
import { LocationProvider } from '@/context/LocationContext'
import { MemberProvider } from '@/context/MemberContext'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

function getDeviceId() {
  if (typeof window === 'undefined') return null
  try {
    let id = localStorage.getItem('reluxe_device_id')
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('reluxe_device_id', id)
    }
    return id
  } catch { return null }
}

export async function getServerSideProps({ params, req }) {
  const { code } = params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`

  try {
    const resp = await fetch(`${siteUrl}/api/referral/${encodeURIComponent(code)}`)
    const data = await resp.json()
    if (!data.valid) {
      return { redirect: { destination: '/beta/locations/westfield', permanent: false } }
    }
    return { props: { code: data.code, referrerName: data.referrerFirstName, tier: data.tier } }
  } catch {
    return { redirect: { destination: '/beta/locations/westfield', permanent: false } }
  }
}

const STEPS = [
  { num: '1', title: 'Book', desc: 'Choose a treatment at either RELUXE location and book online.', icon: '📅' },
  { num: '2', title: 'Visit', desc: 'Enjoy your first appointment with world-class providers.', icon: '✨' },
  { num: '3', title: 'Earn', desc: 'You both receive $25 in RELUXE credit after your visit.', icon: '🎁' },
]

export default function ReferralLandingPage({ code, referrerName, tier }) {
  const router = useRouter()
  const clickFired = useRef(false)

  useEffect(() => {
    // Set attribution cookie
    setReferralCode(code)

    // Fire click tracking once
    if (clickFired.current) return
    clickFired.current = true

    const deviceId = getDeviceId()
    fetch('/api/referral/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId, url: window.location.href }),
    }).catch(() => {})
  }, [code])

  const handleBookNow = (locationKey) => {
    router.push(`/beta/locations/${locationKey}`)
  }

  const pageTitle = `${referrerName} thinks you'll love RELUXE — Get $25`
  const pageDesc = `${referrerName} invited you to RELUXE Med Spa. Book your first treatment and you both get $25 in credit.`

  return (
    <>
      <Head>
        <title>{pageTitle} — RELUXE Med Spa</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
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
              padding: 'clamp(5rem, 12vw, 8rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 8vw, 5rem)',
              background: colors.ink, textAlign: 'center',
            }}>
              {/* Gradient orb */}
              <div style={{
                position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '120%', height: '60%',
                background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              {/* Grain */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: grain, backgroundRepeat: 'repeat',
                pointerEvents: 'none', opacity: 0.5,
              }} />

              <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 99,
                  background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
                  marginBottom: 24,
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Invited by {referrerName}
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
                  Get $25 Off
                </h1>

                <p style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.subhead.size,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: colors.white,
                  marginBottom: 8,
                }}>
                  Your first treatment at RELUXE Med Spa
                </p>

                <p style={{
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  color: 'rgba(250,248,245,0.5)',
                  lineHeight: 1.6,
                  maxWidth: 480,
                  margin: '0 auto',
                }}>
                  {referrerName} loves their experience at RELUXE and wants you to try it too. Book your first visit and you'll both receive <strong style={{ color: '#a78bfa' }}>$25 in credit</strong>.
                </p>
              </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.charcoal,
              position: 'relative',
            }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  lineHeight: typeScale.sectionHeading.lineHeight,
                  color: colors.white,
                  textAlign: 'center',
                  marginBottom: 48,
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
                      padding: '32px 24px',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontSize: '2rem', marginBottom: 16, lineHeight: 1,
                      }}>
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
                        fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)',
                        lineHeight: 1.5,
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── CHOOSE YOUR LOCATION ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.ink,
              position: 'relative',
            }}>
              {/* Gradient accent */}
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)',
              }} />

              <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <h2 style={{
                  fontFamily: fonts.display,
                  fontSize: typeScale.sectionHeading.size,
                  fontWeight: typeScale.sectionHeading.weight,
                  lineHeight: typeScale.sectionHeading.lineHeight,
                  color: colors.white,
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                  Choose Your Location
                </h2>
                <p style={{
                  fontFamily: fonts.body, fontSize: '1rem',
                  color: 'rgba(250,248,245,0.5)', textAlign: 'center',
                  marginBottom: 40,
                }}>
                  Two locations, same elevated experience.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 20,
                }}>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.key}
                      onClick={() => handleBookNow(loc.key)}
                      style={{
                        padding: '32px 28px',
                        borderRadius: 16,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <div style={{
                        fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 700,
                        color: '#a78bfa', letterSpacing: '0.12em', textTransform: 'uppercase',
                        marginBottom: 8,
                      }}>
                        RELUXE
                      </div>
                      <h3 style={{
                        fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 600,
                        color: colors.white, marginBottom: 8,
                      }}>
                        {loc.city}, {loc.state}
                      </h3>
                      <p style={{
                        fontFamily: fonts.body, fontSize: '0.8125rem',
                        color: 'rgba(250,248,245,0.4)', lineHeight: 1.5,
                        marginBottom: 16,
                      }}>
                        {loc.address}
                      </p>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 20px', borderRadius: 99,
                        background: gradients.primary,
                        fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                        color: '#fff',
                      }}>
                        Book Now
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── VALUE PROPS ─── */}
            <section style={{
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.25rem, 4vw, 3rem)',
              background: colors.charcoal,
            }}>
              <div style={{
                maxWidth: 700, margin: '0 auto',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 24,
              }}>
                {[
                  { title: 'Expert Providers', desc: 'Board-certified professionals with advanced aesthetic training.' },
                  { title: 'Premium Products', desc: 'Only top-tier medical-grade products and technologies.' },
                  { title: 'Real Results', desc: 'Transparent before & afters from real RELUXE patients.' },
                ].map((v) => (
                  <div key={v.title} style={{ textAlign: 'center', padding: '20px 16px' }}>
                    <h3 style={{
                      fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600,
                      color: colors.white, marginBottom: 8,
                    }}>
                      {v.title}
                    </h3>
                    <p style={{
                      fontFamily: fonts.body, fontSize: '0.8125rem',
                      color: 'rgba(250,248,245,0.45)', lineHeight: 1.5,
                    }}>
                      {v.desc}
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
                $25 referral credit is applied as RELUXE store credit after your first completed appointment.
                Credit has no cash value and cannot be combined with other promotions.
                One referral reward per new client.
              </p>
            </section>

            <BetaFooter fontKey={FONT_KEY} />
          </div>
        </MemberProvider>
      </LocationProvider>
    </>
  )
}
