import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { useMember } from '@/context/MemberContext';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const steps = [
  {
    num: '01',
    title: 'Earn on every visit',
    body: 'You earn $1 in RELUXE Rewards for every $100 you spend on treatments and products. It adds up fast.',
  },
  {
    num: '02',
    title: 'Use it like cash',
    body: 'Your rewards are added as account credit and applied automatically at your next checkout. No codes, no hassle.',
  },
  {
    num: '03',
    title: 'Stay booked, stay protected',
    body: 'Rewards expire 90 days after they\'re earned \u2014 but as long as you have a visit on the books, the clock is paused.',
  },
];

const perks = [
  { title: '1%', desc: 'Back on Everything', detail: 'Treatments + products' },
  { title: '90', desc: 'Day Expiry Window', detail: 'Paused with an active booking' },
  { title: '$0', desc: 'To Join', detail: 'Automatic for all clients' },
];

const faqs = [
  { q: 'How do I earn rewards?', a: 'You earn $1 for every $100 you spend on treatments and retail products at either RELUXE location. Rewards are calculated automatically after your appointment is completed.' },
  { q: 'How do I use my rewards?', a: 'Your rewards are applied as account credit at checkout \u2014 automatically. No codes to enter, nothing to remember. If you have a balance, it\'s used first.' },
  { q: 'Do my rewards expire?', a: 'Yes, rewards expire 90 days after they\'re earned. But here\'s the key: as long as you have an upcoming visit booked, the expiration clock is paused. Book ahead and your rewards stay safe.' },
  { q: 'Do I need to sign up?', a: 'Nope. If you\'re a RELUXE client, you\'re already enrolled. Your rewards are tracked automatically.' },
  { q: 'Can I see my balance?', a: 'Yes! Sign in on our website with your phone number and your rewards balance will appear on your dashboard. You can also see a full history of what you\'ve earned.' },
  { q: 'Do membership vouchers earn rewards?', a: 'Rewards are earned on new-money purchases only. Services paid for with a membership voucher don\'t earn additional rewards, but any service you pay for out-of-pocket does.' },
];

function RewardsStatus({ fonts }) {
  const { profile, isAuthenticated, openDrawer } = useMember();
  const velocity = profile?.velocity;

  if (!isAuthenticated || !velocity) return null;

  const nextExpiry = velocity.nextExpiryAt ? new Date(velocity.nextExpiryAt) : null;
  const daysUntilExpiry = nextExpiry ? Math.max(0, Math.ceil((nextExpiry - Date.now()) / 86400000)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      onClick={() => openDrawer('rewards')}
      style={{ cursor: 'pointer', maxWidth: '28rem', margin: '2rem auto 0', padding: '1.25rem 1.5rem', borderRadius: '1rem', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(250,248,245,0.45)' }}>Your Rewards Balance</p>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="rgba(250,248,245,0.4)" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </div>
      <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.violet }}>{velocity.formatted}</p>
      {velocity.isFrozen && (
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#22c55e', marginTop: 6 }}>Protected \u2014 you have an upcoming visit</p>
      )}
      {!velocity.isFrozen && nextExpiry && velocity.nextExpiryFormatted && daysUntilExpiry <= 30 && (
        <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: '#f59e0b', marginTop: 6 }}>{velocity.nextExpiryFormatted} expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} \u2014 book to protect</p>
      )}
    </motion.div>
  );
}

export default function BetaRewards() {
  const [openFaq, setOpenFaq] = useState(-1);

  return (
    <BetaLayout title="RELUXE Rewards" description="Earn $1 for every $100 you spend on treatments and products. Rewards are applied automatically at checkout. Book ahead to keep them from expiring.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '60%', height: '160%', background: `linear-gradient(180deg, ${colors.violet}15, ${colors.fuchsia}08, transparent)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>RELUXE Rewards</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Your Loyalty,{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rewarded.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '32rem', margin: '0 auto 2rem' }}>
                  Earn on every visit. Use it like cash. Keep it safe by staying booked.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Earn 1% back', 'Auto-applied at checkout', '90-day window', 'Book to freeze'].map((chip) => (
                    <span key={chip} className="rounded-full px-4 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.7)', background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)' }}>{chip}</span>
                  ))}
                </div>
              </motion.div>

              {/* Inline rewards status for authenticated members */}
              <RewardsStatus fonts={fonts} />
            </div>
          </section>

          {/* How It Works */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <motion.div key={step.num} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <div className="flex items-center justify-center rounded-xl mb-4" style={{ width: 44, height: 44, background: `${colors.violet}10` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700, color: colors.violet }}>{step.num}</span>
                    </div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{step.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{step.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Numbers */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>The Details</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Simple, Straightforward Rewards</h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {perks.map((perk, i) => (
                  <motion.div key={perk.title + perk.desc} className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                    <p style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>{perk.title}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>{perk.desc}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>{perk.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Freeze Explainer */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.stone}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '3px', background: gradients.primary }} />
                  <div className="p-8 lg:p-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 48, height: 48, background: 'rgba(34,197,94,0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </div>
                      <div>
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>The Freeze Rule</h3>
                        <p style={{ fontFamily: fonts.body, fontSize: '1rem', lineHeight: 1.7, color: colors.body }}>
                          We don't want you to lose rewards just because life got busy. As long as you have an upcoming appointment on the calendar, your 90-day expiration timer is <strong>paused</strong>. It only ticks when you're not booked.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>Booked</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>Timer paused. Rewards safe.</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Not booked</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>90-day countdown active.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24" style={{ backgroundColor: colors.cream }}>
            <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Common Questions</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Rewards FAQs</h2>
              </motion.div>
              <div className="border-t" style={{ borderColor: colors.stone }}>
                {faqs.map((faq, i) => (
                  <motion.div key={i} className="border-b" style={{ borderColor: colors.stone }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                    <button className="w-full text-left py-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                      <span style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: openFaq === i ? colors.violet : colors.heading, transition: 'color 0.2s' }}>{faq.q}</span>
                      <motion.span style={{ fontSize: '1.25rem', color: colors.muted, flexShrink: 0, display: 'block', width: 24, height: 24, lineHeight: '24px', textAlign: 'center' }} animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                          <p className="pb-6" style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: typeScale.body.lineHeight, color: colors.body, maxWidth: '48rem', paddingRight: '2rem' }}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Start Earning Today</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Every visit earns rewards. Every booking protects them.</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Already a client? <a href="/beta" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>Sign in to check your balance</a></p>
              <div className="flex justify-center">
                <GravityBookButton fontKey={fontKey} size="hero" />
              </div>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

BetaRewards.getLayout = (page) => page;
