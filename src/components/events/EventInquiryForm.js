import { useState } from 'react';
import { useAntispam } from '@/lib/antispam';

const EVENT_TYPES = [
  'Wedding',
  'Prom / Formal',
  'Red Carpet / Gala',
  'Bachelorette Party',
  'Graduation',
  'Photoshoot',
  'Holiday / NYE',
  'Pageant / Performance',
  'Corporate / Speaking',
  'Fitness / Competition',
  'Local Indy Event',
  'Other',
];

export default function EventInquiryForm({ defaultEventType = '', className = '' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState(defaultEventType);
  const [when, setWhen] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const { getFields: getAntispam } = useAntispam();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !eventType) return;
    setStatus('sending');

    const message = [
      'Event Inquiry',
      '',
      `Event Type: ${eventType}`,
      `Preferred Date: ${when || 'Not specified'}`,
      phone ? `Phone: ${phone}` : null,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, location: 'Events Page', ...getAntispam() }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setName(''); setEmail(''); setPhone(''); setWhen('');
      if (!defaultEventType) setEventType('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 text-center ${className}`}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">We&apos;ll be in touch!</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Our team will reach out soon to help plan your perfect event experience.
        </p>
      </div>
    );
  }

  const inputCls = 'w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-violet-500/50 transition';

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 ${className}`}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Plan Your Event
      </p>

      {/* Honeypot — invisible to humans, bots auto-fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label htmlFor="ei-website">Website</label>
        <input id="ei-website" name="website" type="text" autoComplete="off" tabIndex={-1} />
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputCls}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
          className={`${inputCls} ${!eventType ? 'text-neutral-500' : ''}`}
        >
          <option value="" disabled>Event type</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="When? (e.g. June 15, 2026)"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-4 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-neutral-900 shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-neutral-800 transition disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : 'Get Started'}
      </button>

      {status === 'error' && (
        <p className="mt-3 text-center text-sm text-red-400">
          Something went wrong. Please try again or call us at 317-763-1142.
        </p>
      )}
    </form>
  );
}
