import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, fontPairings } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { useMember } from '@/context/MemberContext';
import { supabase } from '@/lib/supabase';
import { formatPhone, isValidPhone } from '@/lib/phoneUtils';

const navLinks = [
  { label: 'Services', href: '/beta/services' },
  { label: 'Team', href: '/beta/team' },
  { label: 'Westfield', href: '/beta/locations/westfield' },
  { label: 'Carmel', href: '/beta/locations/carmel' },
  { label: 'Inspiration', href: '/beta/inspiration' },
  { label: 'Contact', href: '/beta/contact' },
];

// ─── Compact dark-themed code input ───
function MiniCodeInput({ value = '', onChange, disabled, fonts }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');
  const focusAt = useCallback((i) => setTimeout(() => refs.current[i]?.focus(), 0), []);

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={d}
          onChange={e => {
            const char = e.target.value.replace(/\D/g, '').slice(-1);
            const next = [...digits]; next[i] = char;
            onChange(next.join(''));
            if (char && i < 5) focusAt(i + 1);
          }}
          onKeyDown={e => { if (e.key === 'Backspace' && !value[i] && i > 0) focusAt(i - 1) }}
          onPaste={i === 0 ? e => {
            e.preventDefault();
            const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
            if (pasted) { onChange(pasted); focusAt(Math.min(pasted.length, 5)) }
          } : undefined}
          disabled={disabled}
          style={{
            fontFamily: fonts?.body, fontSize: '1rem', fontWeight: 700,
            width: 36, height: 40, borderRadius: '0.5rem', textAlign: 'center',
            border: d ? `1.5px solid ${colors.violet}` : '1.5px solid rgba(250,248,245,0.15)',
            backgroundColor: 'rgba(250,248,245,0.06)', color: colors.white,
            outline: 'none', caretColor: colors.violet,
          }}
        />
      ))}
    </div>
  );
}

// ─── Nav Login Popover ───
function NavLoginPopover({ fonts, onClose, inline }) {
  const { refreshProfile } = useMember();
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const submitted = useRef(false);
  const popoverRef = useRef(null);

  // Click outside to close (desktop only)
  useEffect(() => {
    if (inline) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [inline, onClose]);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-submit OTP
  useEffect(() => {
    if (code.length === 6 && !submitted.current) {
      submitted.current = true;
      verifyOtp(code);
    }
  }, [code]);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!isValidPhone(phone)) { setError('Enter a valid 10-digit number'); return }
    setError(null); setLoading(true);
    try {
      const res = await fetch('/api/member/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setStep('otp'); setResendCooldown(30);
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  };

  const verifyOtp = async (verifyCode) => {
    setError(null); setLoading(true);
    try {
      const res = await fetch('/api/member/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      refreshProfile();
      // Track conversion + identify contact in Bird
      if (window.reluxeTrack) {
        window.reluxeTrack('member_signup', { method: 'otp', is_returning: !!data.isReturning });
      }
      if (typeof window.Bird !== 'undefined' && window.Bird.contact) {
        try { window.Bird.contact.identify({ strategy: 'Visitor', identifier: { key: 'phonenumber', value: phone } }) } catch (e) {}
      }
      onClose();
    } catch (err) {
      setError(err.message); setCode(''); submitted.current = false;
    } finally { setLoading(false) }
  };

  const wrapperStyle = inline ? {
    padding: '16px 0 0',
  } : {
    position: 'absolute', top: '100%', right: 0, marginTop: 8,
    width: 280, padding: 20, borderRadius: '1rem',
    backgroundColor: 'rgba(26,26,26,0.96)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(250,248,245,0.1)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  };

  return (
    <div ref={popoverRef} style={wrapperStyle}>
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.form
            key="phone"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={sendOtp}
          >
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, marginBottom: 4 }}>
              Sign in
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)', marginBottom: 12 }}>
              Enter your phone to access your account
            </p>
            <input
              type="tel" inputMode="numeric" autoFocus
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="(317) 555-1234"
              style={{
                fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500,
                width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                border: `1.5px solid ${error ? colors.rose : 'rgba(250,248,245,0.12)'}`,
                backgroundColor: 'rgba(250,248,245,0.04)', color: colors.white,
                outline: 'none', caretColor: colors.violet, boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{error}</p>}
            <button
              type="submit" disabled={loading}
              style={{
                fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                width: '100%', padding: '0.5rem', borderRadius: 999, marginTop: 10,
                background: gradients.primary, color: '#fff', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.white, marginBottom: 4, textAlign: 'center' }}>
              Enter your code
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)', marginBottom: 12, textAlign: 'center' }}>
              Sent to <span style={{ color: colors.white }}>{formatPhone(phone)}</span>
            </p>
            <MiniCodeInput value={code} onChange={v => { setCode(v); submitted.current = false }} disabled={loading} fonts={fonts} />
            {error && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 6, textAlign: 'center' }}>{error}</p>}
            {loading && <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.45)', marginTop: 6, textAlign: 'center' }}>Verifying...</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
              <button onClick={() => { setStep('phone'); setCode(''); setError(null); submitted.current = false }} style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(250,248,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Change
              </button>
              <button
                onClick={() => { setResendCooldown(30); setError(null); fetch('/api/member/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }).catch(() => setError('Resend failed')) }}
                disabled={resendCooldown > 0}
                style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: resendCooldown > 0 ? 'rgba(250,248,245,0.2)' : colors.violet, background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer' }}
              >
                {resendCooldown > 0 ? `Resend ${resendCooldown}s` : 'Resend'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BetaNavBar({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const { member, isAuthenticated, openDrawer } = useMember();

  // Close login popover when user authenticates
  useEffect(() => {
    if (isAuthenticated) { setLoginOpen(false); setMobileLoginOpen(false) }
  }, [isAuthenticated]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(26,26,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(250,248,245,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="/beta" className="relative z-50">
          <img
            src="/images/logo/logo.png"
            alt="RELUXE Med Spa"
            style={{ height: 40, width: 'auto' }}
          />
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative group">
                <a
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white inline-flex items-center gap-1"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'rgba(250,248,245,0.65)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200"
                >
                  <div className="rounded-xl overflow-hidden py-2 px-1" style={{ backgroundColor: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(250,248,245,0.08)', minWidth: 160 }}>
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-white/5"
                        style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(250,248,245,0.7)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors duration-200 hover:text-white"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(250,248,245,0.65)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <GravityBookButton fontKey={fontKey} size="nav" />
          {isAuthenticated && member ? (
            <button
              onClick={() => openDrawer('account')}
              title={member.first_name || 'My Account'}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: gradients.primary, color: '#fff',
                fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {(member.first_name || '?')[0].toUpperCase()}
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLoginOpen(v => !v)}
                title="Sign in"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: `1.5px solid ${loginOpen ? 'rgba(250,248,245,0.6)' : 'rgba(250,248,245,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,248,245,0.6)'}
                onMouseLeave={e => { if (!loginOpen) e.currentTarget.style.borderColor = 'rgba(250,248,245,0.3)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {loginOpen && (
                <NavLoginPopover fonts={fonts} onClose={() => setLoginOpen(false)} />
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden relative z-50 p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="flex flex-col gap-[5px]">
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                transform: mobileOpen ? 'rotate(45deg) translate(2px, 5px)' : 'none',
              }}
            />
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-[1.5px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.white,
                transform: mobileOpen ? 'rotate(-45deg) translate(2px, -5px)' : 'none',
              }}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden flex flex-col items-center justify-center gap-6"
            style={{ backgroundColor: 'rgba(26,26,26,0.96)', backdropFilter: 'blur(24px)' }}
          >
            {navLinks.map((link, i) => (
              <div key={link.label} className="text-center">
                <motion.a
                  href={link.children ? undefined : link.href}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={link.children ? undefined : () => setMobileOpen(false)}
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    color: colors.white,
                    textDecoration: 'none',
                    cursor: link.children ? 'default' : 'pointer',
                  }}
                >
                  {link.children ? 'Locations' : link.label}
                </motion.a>
                {link.children && (
                  <div className="flex justify-center gap-6 mt-2">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 500, color: colors.violet, textDecoration: 'none' }}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex flex-col items-center gap-4"
            >
              <GravityBookButton fontKey={fontKey} size="hero" />
              {isAuthenticated && member ? (
                <button
                  onClick={() => { setMobileOpen(false); openDrawer('account') }}
                  style={{
                    fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500,
                    color: 'rgba(250,248,245,0.5)', background: 'none', border: 'none',
                    cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  My Account
                </button>
              ) : (
                mobileLoginOpen ? (
                  <div style={{ width: 280 }}>
                    <NavLoginPopover fonts={fonts} onClose={() => { setMobileLoginOpen(false); setMobileOpen(false) }} inline />
                  </div>
                ) : (
                  <button
                    onClick={() => setMobileLoginOpen(true)}
                    style={{
                      fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500,
                      color: 'rgba(250,248,245,0.5)', textDecoration: 'underline',
                      textUnderlineOffset: '3px', background: 'none', border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Sign in
                  </button>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
