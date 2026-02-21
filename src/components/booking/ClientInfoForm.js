// src/components/booking/ClientInfoForm.js
// Multi-step checkout: PHONE → VERIFY → (auto-checkout or DETAILS) → confirmation.
// Existing clients: phone verify → instant book. New clients: phone verify → name/email form.
import { useState, useEffect, useRef, useCallback } from 'react';
import { colors, gradients } from '@/components/preview/tokens';
import CodeInput from './CodeInput';
import { formatPhone, stripPhone, toE164, isValidPhone } from '@/lib/phoneUtils';
import { getReferralCode, clearReferralCode } from '@/lib/referral';
import ReferralShareCTA from './ReferralShareCTA';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Countdown Timer ───
function CountdownTimer({ expiresAt, fonts, onExpired }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);
      if (diff === 0 && onExpired) onExpired();
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [expiresAt, onExpired]);

  if (!remaining && remaining !== 0) return null;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const isLow = remaining < 120000;

  return (
    <div className="flex items-center gap-1.5 mb-4">
      <span
        className="rounded-full"
        style={{
          width: 6, height: 6,
          backgroundColor: isLow ? colors.rose : colors.violet,
          animation: isLow ? 'pulse 1s infinite' : 'none',
        }}
      />
      <span style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', fontWeight: 500, color: isLow ? colors.rose : colors.muted }}>
        Reservation holds for {mins}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

// ─── Sub-step constants ───
const SUB_PHONE = 'PHONE';
const SUB_VERIFY = 'VERIFY';
const SUB_CONFIRMING = 'CONFIRMING'; // auto-checkout in progress
const SUB_DETAILS = 'DETAILS';

export default function ClientInfoForm({ cartId, expiresAt, summary, fonts, onSuccess, onExpired, onBack }) {
  const [subStep, setSubStep] = useState(SUB_PHONE);

  // Phone state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(null);
  const [sendingCode, setSendingCode] = useState(false);
  const phoneRef = useRef(null);

  // Verify state
  const [codeId, setCodeId] = useState(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Details state (only for new clients)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const firstRef = useRef(null);

  // Confirmation
  const [confirmation, setConfirmation] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState('');

  // Focus management
  useEffect(() => { if (subStep === SUB_PHONE) phoneRef.current?.focus(); }, [subStep]);
  useEffect(() => { if (subStep === SUB_DETAILS) firstRef.current?.focus(); }, [subStep]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const iv = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(iv);
  }, [resendCooldown]);

  // ─── Checkout helper (used by both auto-checkout and manual submit) ───
  const doCheckout = async ({ firstName, lastName, email, ownershipVerified } = {}) => {
    try {
      const body = { ownershipVerified: ownershipVerified || false };
      if (firstName && lastName && email) {
        body.firstName = firstName;
        body.lastName = lastName;
        body.email = email;
        body.phone = toE164(phone);
      }
      // Pass referral code for attribution
      const refCode = getReferralCode();
      if (refCode) body.referralCode = refCode;

      const res = await fetch(`/api/blvd/cart/${cartId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410) { if (onExpired) onExpired(); return { expired: true }; }
        if (data.needsClientInfo) return { needsClientInfo: true };
        throw new Error(data.error || 'Checkout failed');
      }

      setConfirmEmail(email || data.confirmation?.email || '');
      setConfirmation(data);
      clearReferralCode();
      if (onSuccess) onSuccess(data);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  // ─── Phone Step ───
  const handlePhoneChange = (e) => {
    const digits = stripPhone(e.target.value);
    if (digits.length <= 11) setPhone(formatPhone(digits));
    if (phoneError) setPhoneError(null);
  };

  const handleSendCode = async () => {
    if (!isValidPhone(phone)) { setPhoneError('Enter a valid 10-digit phone number'); return; }
    setSendingCode(true);
    setPhoneError(null);

    try {
      const res = await fetch(`/api/blvd/cart/${cartId}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: toE164(phone) }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.skipVerification) { setSubStep(SUB_DETAILS); return; }
        throw new Error(data.error || 'Failed to send code');
      }

      setCodeId(data.codeId);
      setResendCooldown(30);
      setSubStep(SUB_VERIFY);
    } catch (err) {
      setPhoneError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  // ─── Verify Step ───
  const handleCodeChange = useCallback((val) => { setCode(val); setVerifyError(null); }, []);

  const handleVerify = async () => {
    if (code.length !== 6) { setVerifyError('Enter the 6-digit code'); return; }
    setVerifying(true);
    setVerifyError(null);

    try {
      const res = await fetch(`/api/blvd/cart/${cartId}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeId, code, date: summary?.date, startTime: summary?.startTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // Verification succeeded — try to auto-checkout (existing client)
      setSubStep(SUB_CONFIRMING);

      const result = await doCheckout({ ownershipVerified: true });

      if (result.success || result.expired) return;

      // Boulevard needs more info — fall back to details form
      if (data.client) {
        setForm({
          firstName: data.client.firstName || '',
          lastName: data.client.lastName || '',
          email: data.client.email || '',
        });
      }
      setSubStep(SUB_DETAILS);
      if (result.error && !result.needsClientInfo) {
        setServerError(result.error);
      }
    } catch (err) {
      setVerifyError(err.message);
      setCode('');
      setSubStep(SUB_VERIFY);
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && subStep === SUB_VERIFY && !verifying) handleVerify();
  }, [code, subStep]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setSendingCode(true);
    setVerifyError(null);
    setCode('');

    try {
      const res = await fetch(`/api/blvd/cart/${cartId}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: toE164(phone) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend');
      setCodeId(data.codeId);
      setResendCooldown(30);
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  // ─── Details Step ───
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    const result = await doCheckout({ ...form, phone: toE164(phone) });
    if (!result.success && !result.expired) {
      setServerError(result.error || 'Checkout failed. Please try again.');
    }
    setSubmitting(false);
  };

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  // ─── Shared styles ───
  const inputStyle = (field) => ({
    fontFamily: fonts?.body || 'system-ui',
    fontSize: '0.9375rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: (field === 'phone' ? phoneError : errors[field])
      ? `1.5px solid ${colors.rose}` : `1.5px solid #c4b8ae`,
    backgroundColor: '#fff',
    color: colors.heading,
    outline: 'none',
    width: '100%',
  });

  const primaryBtn = (disabled) => ({
    fontFamily: fonts?.body || 'system-ui',
    fontSize: '0.9375rem',
    fontWeight: 600,
    padding: '0.75rem 2rem',
    background: gradients.primary,
    color: '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  });

  // ─── CONFIRMATION ───
  if (confirmation) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center rounded-full mb-4" style={{ width: 56, height: 56, background: `${colors.violet}12` }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ fontFamily: fonts?.display || 'Georgia', fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>
          You're Booked!
        </h3>
        {confirmEmail && (
          <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.9375rem', color: colors.body, marginBottom: '0.25rem' }}>
            Confirmation sent to <strong>{confirmEmail}</strong>
          </p>
        )}
        {(summary?.serviceName || summary?.staffName) && (
          <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', color: colors.muted }}>
            {summary.serviceName}
            {summary.additionalServiceNames?.length > 0 && <> + {summary.additionalServiceNames.join(' + ')}</>}
            {summary.staffName && ` with ${summary.staffName}`}
          </p>
        )}
        {summary?.duration && (
          <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', color: colors.muted, marginTop: '0.25rem' }}>
            {summary.duration < 60 ? `${summary.duration} min` : `${Math.floor(summary.duration / 60)}h${summary.duration % 60 > 0 ? ` ${summary.duration % 60}m` : ''}`}
            {summary.date && ` · ${new Date(summary.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
            {summary.startTime && ` at ${new Date(summary.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
          </p>
        )}
        <ReferralShareCTA fonts={fonts} variant="light" />
      </div>
    );
  }

  // ─── CONFIRMING (auto-checkout loading) ───
  if (subStep === SUB_CONFIRMING) {
    return (
      <div className="text-center py-8">
        <CountdownTimer expiresAt={expiresAt} fonts={fonts} onExpired={onExpired} />
        <div className="inline-flex items-center justify-center rounded-full mb-4 animate-pulse" style={{ width: 48, height: 48, background: `${colors.violet}12` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>
          Phone verified
        </p>
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', color: colors.muted, marginTop: '0.25rem' }}>
          Confirming your booking...
        </p>
      </div>
    );
  }

  // ─── PHONE ───
  if (subStep === SUB_PHONE) {
    return (
      <div>
        <CountdownTimer expiresAt={expiresAt} fonts={fonts} onExpired={onExpired} />
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>
          Verify your phone number
        </p>
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', color: colors.muted, marginBottom: '0.75rem' }}>
          We'll text you a code to confirm your booking.
        </p>
        <div className="mb-4">
          <input
            ref={phoneRef}
            type="tel"
            placeholder="(555) 555-5555"
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendCode(); } }}
            style={inputStyle('phone')}
          />
          {phoneError && (
            <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{phoneError}</p>
          )}
        </div>
        <div className="flex gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="rounded-full transition-colors duration-200"
              style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem', color: colors.body, backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button onClick={handleSendCode} disabled={sendingCode || !isValidPhone(phone)}
            className="flex-1 rounded-full transition-opacity duration-200" style={primaryBtn(sendingCode || !isValidPhone(phone))}>
            {sendingCode ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      </div>
    );
  }

  // ─── VERIFY ───
  if (subStep === SUB_VERIFY) {
    return (
      <div>
        <CountdownTimer expiresAt={expiresAt} fonts={fonts} onExpired={onExpired} />
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>
          Enter verification code
        </p>
        <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', color: colors.muted, marginBottom: '1rem' }}>
          Sent to {phone}
        </p>
        <div className="mb-4">
          <CodeInput value={code} onChange={handleCodeChange} disabled={verifying} fonts={fonts} />
          {verifyError && (
            <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 8, textAlign: 'center' }}>{verifyError}</p>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => { setSubStep(SUB_PHONE); setCode(''); setVerifyError(null); }}
            style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Change number
          </button>
          <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || sendingCode}
            style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', fontWeight: 500, color: resendCooldown > 0 ? colors.muted : colors.violet, background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer', padding: 0 }}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : sendingCode ? 'Sending...' : 'Resend code'}
          </button>
        </div>
        <button onClick={handleVerify} disabled={verifying || code.length !== 6}
          className="w-full rounded-full transition-opacity duration-200" style={primaryBtn(verifying || code.length !== 6)}>
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    );
  }

  // ─── DETAILS (new clients only) ───
  return (
    <form onSubmit={handleSubmit}>
      <CountdownTimer expiresAt={expiresAt} fonts={fonts} onExpired={onExpired} />

      <div className="flex items-center gap-2 rounded-lg p-2.5 mb-4"
        style={{ backgroundColor: `${colors.violet}06`, border: `1px solid ${colors.violet}15` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.heading }}>{phone}</span>
        <span style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.violet, marginLeft: 'auto' }}>Verified</span>
      </div>

      <p style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.75rem', color: colors.muted, marginBottom: '0.75rem' }}>
        Looks like you're new! Just a few more details.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <input ref={firstRef} type="text" placeholder="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} style={inputStyle('firstName')} />
          {errors.firstName && <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{errors.firstName}</p>}
        </div>
        <div>
          <input type="text" placeholder="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} style={inputStyle('lastName')} />
          {errors.lastName && <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{errors.lastName}</p>}
        </div>
      </div>

      <div className="mb-4">
        <input type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} style={inputStyle('email')} />
        {errors.email && <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.rose, marginTop: 4 }}>{errors.email}</p>}
      </div>

      {serverError && (
        <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: `${colors.rose}08`, border: `1px solid ${colors.rose}20` }}>
          <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.rose }}>{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full rounded-full transition-opacity duration-200" style={primaryBtn(submitting)}>
        {submitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
