import { useState } from 'react';
import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const locations = [
  {
    name: 'Westfield',
    address: '514 E State Road 32',
    city: 'Westfield, IN 46074',
    phone: '(317) 763-1142',
    hours: 'Mon\u2013Fri 9am\u20137pm \u00b7 Sat 9am\u20134pm',
    mapUrl: 'https://maps.google.com/?q=514+E+State+Road+32+Westfield+IN+46074',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
  },
  {
    name: 'Carmel',
    address: '10485 N Pennsylvania St',
    city: 'Carmel, IN 46280',
    phone: '(317) 763-1142',
    hours: 'Mon\u2013Fri 9am\u20137pm \u00b7 Sat 9am\u20134pm',
    mapUrl: 'https://maps.google.com/?q=10485+N+Pennsylvania+St+Carmel+IN+46280',
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA)',
  },
];

const contactMethods = [
  { label: 'Call Us', value: '(317) 763-1142', href: 'tel:3177631142', icon: 'phone' },
  { label: 'Email Us', value: 'help@reluxemedspa.com', href: 'mailto:help@reluxemedspa.com', icon: 'mail' },
  { label: 'Text Us', value: '(317) 763-1142', href: 'sms:3177631142', icon: 'message' },
];

export default function BetaContact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', message: '' });
  const [status, setStatus] = useState('idle');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pageUrl: '/beta/contact' }),
      });
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', location: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <BetaLayout title="Contact Us" description="Get in touch with RELUXE Med Spa in Carmel and Westfield, Indiana. Call (317) 763-1142 or send us a message.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Contact Us</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Let&apos;s{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Talk.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', margin: '0 auto' }}>
                  Questions about treatments, booking, or just want to say hey? We&apos;re here for it.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Quick Contact Methods */}
          <section style={{ backgroundColor: colors.ink, paddingBottom: '3rem' }}>
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {contactMethods.map((method, i) => (
                  <motion.a key={method.label} href={method.href} className="rounded-2xl p-6 text-center block transition-colors duration-200 hover:bg-white/[0.06]" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)', textDecoration: 'none' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <div className="flex items-center justify-center rounded-full mx-auto mb-3" style={{ width: 44, height: 44, background: 'rgba(124,58,237,0.15)' }}>
                      {method.icon === 'phone' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                      {method.icon === 'mail' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                      {method.icon === 'message' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                    </div>
                    <p style={{ fontFamily: fonts.body, ...typeScale.label, color: 'rgba(250,248,245,0.4)', marginBottom: '0.25rem' }}>{method.label}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.white }}>{method.value}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form + Locations */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Form */}
                <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Send a Message</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1.5rem' }}>We&apos;d Love to Hear From You</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, display: 'block', marginBottom: '0.25rem' }}>Name</span>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full rounded-xl px-4 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }} />
                      </label>
                      <label className="block">
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, display: 'block', marginBottom: '0.25rem' }}>Email</span>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl px-4 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }} />
                      </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, display: 'block', marginBottom: '0.25rem' }}>Phone</span>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl px-4 py-3 outline-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }} />
                      </label>
                      <label className="block">
                        <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, display: 'block', marginBottom: '0.25rem' }}>Preferred Location</span>
                        <select name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl px-4 py-3 outline-none appearance-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: form.location ? colors.heading : colors.muted }}>
                          <option value="">Choose location</option>
                          <option value="westfield">Westfield</option>
                          <option value="carmel">Carmel</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, display: 'block', marginBottom: '0.25rem' }}>Message</span>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={5} required className="w-full rounded-xl px-4 py-3 outline-none resize-none" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, color: colors.heading }} />
                    </label>
                    <button type="submit" disabled={status === 'sending'} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, padding: '0.875rem 2.5rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}>
                      {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                    {status === 'sent' && <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.violet, fontWeight: 500 }}>Message sent! We&apos;ll get back to you soon.</p>}
                    {status === 'error' && <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.rose, fontWeight: 500 }}>Something went wrong. Please try again or call us directly.</p>}
                  </form>
                </motion.div>

                {/* Locations */}
                <motion.div className="space-y-6" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem' }}>Our Locations</p>
                  {locations.map((loc) => (
                    <div key={loc.name} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.stone}` }}>
                      <div className="p-1">
                        <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: loc.gradient }}>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                          <div className="relative z-10">
                            <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{loc.name}</h3>
                            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{loc.address}<br />{loc.city}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-3" style={{ backgroundColor: '#fff' }}>
                        <div className="flex items-center gap-3">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                          <a href={`tel:${loc.phone.replace(/\D/g, '')}`} style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.heading, fontWeight: 500, textDecoration: 'none' }}>{loc.phone}</a>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{loc.hours}</span>
                        </div>
                        <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.violet, textDecoration: 'none' }}>
                          Get Directions
                          <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Book CTA */}
                  <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                    <p style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>Ready to book?</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginBottom: '1.25rem' }}>Skip the form and schedule your appointment online.</p>
                    <GravityBookButton fontKey={fontKey} size="nav" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

BetaContact.getLayout = (page) => page;
