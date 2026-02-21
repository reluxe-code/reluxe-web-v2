// src/components/beta/HeroIdentityCard.js
// Hero right side: state machine for member identity.
// States: ANONYMOUS → OTP_SENT → INTERESTS (new) or DASHBOARD (returning)
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, gradients } from '@/components/preview/tokens'
import { useMember } from '@/context/MemberContext'
import { supabase } from '@/lib/supabase'
import { formatPhone, isValidPhone } from '@/lib/phoneUtils'
import CodeInput from '@/components/booking/CodeInput'

const INTEREST_OPTIONS = [
  { key: 'tox', label: 'Tox', desc: 'Botox, Dysport & more' },
  { key: 'fillers', label: 'Fillers', desc: 'Lips, cheeks, jawline' },
  { key: 'skin', label: 'Skin', desc: 'Facials, peels, lasers' },
  { key: 'body', label: 'Body', desc: 'Contouring & sculpting' },
  { key: 'wellness', label: 'Wellness', desc: 'Massage & recovery' },
]

const cardBase = {
  borderRadius: '1.5rem',
  background: 'rgba(26,26,26,0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(124,58,237,0.2)',
  padding: 'clamp(1.5rem, 3vw, 2.5rem)',
  minHeight: 420,
  display: 'flex',
  flexDirection: 'column',
}

const fadeVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

// ─── LTV Badge ───
function LtvBadge({ bucket, fonts }) {
  const labels = { vip: 'VIP', high: 'Preferred', medium: 'Member', low: 'Member' }
  const bg = bucket === 'vip' ? gradients.primary : bucket === 'high' ? `${colors.violet}30` : 'rgba(250,248,245,0.08)'
  const color = bucket === 'vip' ? '#fff' : colors.violet
  return (
    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color, background: bg, padding: '0.25rem 0.75rem', borderRadius: 999 }}>
      {labels[bucket] || 'Member'}
    </span>
  )
}

// ─── ANONYMOUS State ───
function AnonymousCard({ fonts, onSendOtp }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidPhone(phone)) { setError('Enter a valid 10-digit phone number'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/member/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send code')
      onSendOtp(phone)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ flex: 1 }}>
        {/* Icon */}
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${colors.violet}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: colors.white, marginBottom: 8 }}>
          Recognize Me
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.55)', lineHeight: 1.6, marginBottom: 24 }}>
          Enter your phone to see your beauty journey, rebook in one tap, and unlock your personalized experience.
        </p>

        <label style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(250,248,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
          Phone Number
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(317) 555-1234"
          style={{
            fontFamily: fonts.body, fontSize: '1.0625rem', fontWeight: 500,
            width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem',
            border: `1.5px solid ${error ? colors.rose : 'rgba(250,248,245,0.12)'}`,
            backgroundColor: 'rgba(250,248,245,0.04)', color: colors.white,
            outline: 'none', caretColor: colors.violet,
          }}
        />
        {error && (
          <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.rose, marginTop: 6 }}>{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
          width: '100%', padding: '0.875rem', borderRadius: 999,
          background: gradients.primary, color: '#fff', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          marginTop: 20, transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'Sending code...' : 'Recognize Me →'}
      </button>

      <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)', textAlign: 'center', marginTop: 12 }}>
        First time? We'll get you set up in 30 seconds.
      </p>
    </form>
  )
}

// ─── OTP_SENT State ───
function OtpCard({ phone, fonts, onVerified, onChangeNumber }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resendCooldown, setResendCooldown] = useState(30)
  const submitted = useRef(false)

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !submitted.current) {
      submitted.current = true
      handleVerify(code)
    }
  }, [code])

  const handleVerify = async (verifyCode) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/member/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')

      // Set the session on the browser Supabase client
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      onVerified(data)
    } catch (err) {
      setError(err.message)
      setCode('')
      submitted.current = false
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendCooldown(30)
    setError(null)
    try {
      await fetch('/api/member/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
    } catch {
      setError('Failed to resend code')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
      <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 700, color: colors.white, marginBottom: 8, textAlign: 'center' }}>
        Enter your code
      </h3>
      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)', textAlign: 'center', marginBottom: 32 }}>
        Sent to <span style={{ color: colors.white, fontWeight: 500 }}>{formatPhone(phone)}</span>
      </p>

      <div style={{ marginBottom: 24 }}>
        <CodeInput
          value={code}
          onChange={(v) => { setCode(v); submitted.current = false }}
          disabled={loading}
          fonts={fonts}
        />
      </div>

      {error && (
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.rose, textAlign: 'center', marginBottom: 16 }}>{error}</p>
      )}

      {loading && (
        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: 'rgba(250,248,245,0.5)', textAlign: 'center', marginBottom: 16 }}>Verifying...</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
        <button onClick={onChangeNumber} style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.45)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          Change number
        </button>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: resendCooldown > 0 ? 'rgba(250,248,245,0.25)' : colors.violet, background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer' }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}

// ─── INTERESTS State ───
function InterestsCard({ fonts, onSaved }) {
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  const toggle = (key) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const handleSave = async () => {
    if (selected.length === 0) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/member/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ interests: selected }),
      })
      onSaved(selected)
    } catch (e) {
      console.error('Failed to save interests:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 700, color: colors.white, marginBottom: 6 }}>
        Welcome to RELUXE
      </h3>
      <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(250,248,245,0.5)', lineHeight: 1.5, marginBottom: 24 }}>
        What are you interested in? We'll personalize your experience.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'auto' }}>
        {INTEREST_OPTIONS.map((opt) => {
          const isOn = selected.includes(opt.key)
          return (
            <button
              key={opt.key}
              onClick={() => toggle(opt.key)}
              style={{
                fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                padding: '0.625rem 1.25rem', borderRadius: 999,
                background: isOn ? gradients.primary : 'rgba(250,248,245,0.06)',
                color: isOn ? '#fff' : 'rgba(250,248,245,0.6)',
                border: isOn ? 'none' : '1px solid rgba(250,248,245,0.1)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)', marginTop: 16, marginBottom: 12 }}>
        Pick at least one. You can always update later.
      </p>

      <button
        onClick={handleSave}
        disabled={selected.length === 0 || loading}
        style={{
          fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
          width: '100%', padding: '0.875rem', borderRadius: 999,
          background: selected.length > 0 ? gradients.primary : 'rgba(250,248,245,0.06)',
          color: selected.length > 0 ? '#fff' : 'rgba(250,248,245,0.3)',
          border: 'none', cursor: selected.length > 0 ? 'pointer' : 'default',
          transition: 'all 0.3s',
        }}
      >
        {loading ? 'Saving...' : 'Save & Continue →'}
      </button>
    </div>
  )
}

// ─── DASHBOARD State ───
function DashboardCard({ fonts, member, profile }) {
  const { signOut, openDrawer, openBookingModal } = useMember()
  const stats = profile?.stats
  const lastService = profile?.lastService
  const upcoming = profile?.upcomingAppointment
  const hasHistory = !!stats && stats.total_visits > 0

  const firstName = member?.first_name || 'there'
  const ltvBucket = stats?.ltv_bucket || 'low'

  const handleRebook = () => {
    const loc = member?.preferred_location || lastService?.location_key || 'westfield'
    openBookingModal(loc)
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const clickable = { cursor: 'pointer', transition: 'border-color 0.2s' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', fontWeight: 700, color: colors.white, marginBottom: 4 }}>
            Hey, {firstName}
          </h3>
          {hasHistory && <LtvBadge bucket={ltvBucket} fonts={fonts} />}
        </div>
        <button
          onClick={() => openDrawer('account')}
          title="My Account"
          style={{ width: 48, height: 48, borderRadius: '50%', background: gradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0, border: 'none', cursor: 'pointer' }}
        >
          {firstName[0]?.toUpperCase() || '?'}
        </button>
      </div>

      {/* Stats row */}
      {hasHistory && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button onClick={() => openDrawer('visits')} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)', textAlign: 'left', ...clickable }}>
            <p style={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700, color: colors.white }}>{stats.total_visits}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>Visits</p>
          </button>
          <button onClick={() => openDrawer('account')} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)', textAlign: 'left', ...clickable }}>
            <p style={{ fontFamily: fonts.display, fontSize: '1.375rem', fontWeight: 700, color: colors.white }}>{stats.total_treatments || stats.total_visits}</p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', fontWeight: 500 }}>Treatments</p>
          </button>
        </div>
      )}

      {/* Last treatment + rebook */}
      {lastService && (
        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)', marginBottom: 12 }}>
          <button onClick={() => openDrawer('visits')} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 10 }}>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 8 }}>Last Treatment</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {lastService.provider?.image && (
                <img src={lastService.provider.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>{lastService.name}</p>
                <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>
                  {lastService.provider?.name ? `w/ ${lastService.provider.name}` : ''}{lastService.date ? ` · ${formatDate(lastService.date)}` : ''}
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={handleRebook}
            style={{
              fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
              width: '100%', padding: '0.625rem', borderRadius: 999,
              background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer',
            }}
          >
            Rebook This →
          </button>
        </div>
      )}

      {/* Upcoming appointment */}
      {upcoming && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: `${colors.violet}10`, border: `1px solid ${colors.violet}20`, marginBottom: 12 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.violet, marginBottom: 4 }}>Next Appointment</p>
          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.white }}>
            {upcoming.service} — {formatDate(upcoming.date)}
          </p>
          {upcoming.provider && (
            <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.45)' }}>w/ {upcoming.provider}</p>
          )}
        </div>
      )}

      {/* New member (no history) — interests + book CTA */}
      {!hasHistory && member?.interests?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.35)', marginBottom: 8 }}>Your Interests</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.interests.map((i) => (
              <span key={i} style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, padding: '0.375rem 0.75rem', borderRadius: 999, background: `${colors.violet}15`, color: colors.violet, textTransform: 'capitalize' }}>{i}</span>
            ))}
          </div>
        </div>
      )}

      {!hasHistory && (
        <button
          onClick={() => { if (typeof window !== 'undefined') window.location.href = '/start' }}
          style={{
            fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600,
            width: '100%', padding: '0.875rem', borderRadius: 999,
            background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer',
            marginTop: hasHistory ? 0 : 'auto',
          }}
        >
          Book Your First Visit →
        </button>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(250,248,245,0.3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16, textAlign: 'center', textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        Sign out
      </button>
    </div>
  )
}

// ─── Main Component ───
export default function HeroIdentityCard({ fonts }) {
  const { member, profile, isLoading, isAuthenticated, refreshProfile } = useMember()
  const [step, setStep] = useState('ANONYMOUS')  // ANONYMOUS | OTP_SENT | INTERESTS | DASHBOARD
  const [phone, setPhone] = useState('')

  // Determine the correct step based on member state
  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated && member) {
      // Returning client with history → dashboard
      // New client without interests → interests
      const hasInterests = member.interests && member.interests.length > 0
      const isReturning = !!member.blvd_client_id
      if (isReturning || hasInterests) {
        setStep('DASHBOARD')
      } else {
        setStep('INTERESTS')
      }
    } else {
      setStep('ANONYMOUS')
    }
  }, [isLoading, isAuthenticated, member])

  const handleOtpSent = (phoneNumber) => {
    setPhone(phoneNumber)
    setStep('OTP_SENT')
  }

  const handleVerified = (data) => {
    // MemberContext will pick up the SIGNED_IN event and fetch profile
    // But we can fast-path the UI transition
    if (data.isReturning) {
      setStep('DASHBOARD')
    } else {
      const hasInterests = data.member?.interests?.length > 0
      setStep(hasInterests ? 'DASHBOARD' : 'INTERESTS')
    }
    // Ensure context is refreshed
    refreshProfile()
  }

  const handleInterestsSaved = (interests) => {
    setStep('DASHBOARD')
    refreshProfile()
  }

  if (isLoading) {
    return (
      <div style={{ ...cardBase, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${colors.violet}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={cardBase}>
      <AnimatePresence mode="wait">
        {step === 'ANONYMOUS' && (
          <motion.div key="anonymous" {...fadeVariants} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <AnonymousCard fonts={fonts} onSendOtp={handleOtpSent} />
          </motion.div>
        )}
        {step === 'OTP_SENT' && (
          <motion.div key="otp" {...fadeVariants} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <OtpCard phone={phone} fonts={fonts} onVerified={handleVerified} onChangeNumber={() => setStep('ANONYMOUS')} />
          </motion.div>
        )}
        {step === 'INTERESTS' && (
          <motion.div key="interests" {...fadeVariants} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <InterestsCard fonts={fonts} onSaved={handleInterestsSaved} />
          </motion.div>
        )}
        {step === 'DASHBOARD' && (
          <motion.div key="dashboard" {...fadeVariants} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <DashboardCard fonts={fonts} member={member} profile={profile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
