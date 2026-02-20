import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const plans = [
  {
    key: '100',
    title: 'VIP $100 Membership',
    price: '$100',
    priceDisplay: '$100 / month',
    voucherLabel: '1 voucher per month (choose 1 service)',
    voucherIncludes: ['60-minute Massage', 'Signature Facial', '10 units Choice Tox', 'Lip Flip'],
    href: '/buy/essential',
    bestFor: 'Perfect if you want consistent self-care + flexible savings each month.',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
  },
  {
    key: '200',
    title: 'VIP $200 Membership',
    price: '$200',
    priceDisplay: '$200 / month',
    voucherLabel: '1 voucher per month (choose 1 service)',
    voucherIncludes: ['Glo2Facial', 'Hydrafacial', 'Facial + Massage', '120-minute Massage', '20 units Choice Tox'],
    href: '/buy/elite',
    bestFor: 'Best for bigger monthly value \u2014 premium facials, longer massage, or more tox units.',
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA)',
  },
];

const additionalBenefits = [
  { title: '10% off', desc: 'Single Services' },
  { title: '10% off', desc: 'Packages' },
  { title: '15% off', desc: 'All Products' },
  { title: 'Member Pricing', desc: 'Per-unit Tox' },
  { title: 'FREE', desc: 'Monthly Sauna' },
  { title: '$50 off', desc: 'All Filler' },
];

const faqs = [
  { q: 'Is there a commitment?', a: 'We recommend a 12-month commitment for best results and best value, but you can cancel anytime with 30 days notice.' },
  { q: 'Do vouchers expire?', a: 'Vouchers never expire while your membership is active. If you cancel, you have 90 days to use any unused vouchers.' },
  { q: 'Can I share my voucher?', a: 'Yes \u2014 vouchers can be shared with a family member.' },
  { q: 'How does tox work with membership?', a: 'You always get the best (member) per-unit pricing on tox. You can also use your monthly vouchers for "Choice Tox" units. Many clients bank those vouchers and apply them toward their quarterly tox appointment.' },
  { q: 'Are the benefits different between $100 and $200?', a: 'No \u2014 both memberships include the same VIP benefits and discounts. The only difference is what your monthly voucher can be used for.' },
];

const quickValues = [
  { title: 'Choose your service', body: 'Each month you receive 1 voucher for your choice of included services.' },
  { title: 'Best pricing always', body: 'VIP members get member pricing on tox + exclusive discounts on services and products.' },
  { title: 'Bank it when life gets busy', body: 'Vouchers never expire with an active membership (and you have 90 days after canceling).' },
];

export default function BetaMemberships() {
  const [openFaq, setOpenFaq] = useState(-1);

  return (
    <BetaLayout title="VIP Memberships" description="RELUXE Med Spa memberships in Carmel & Westfield. Choose a $100 or $200 VIP membership, get a monthly voucher, and unlock member-only pricing.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '60%', height: '160%', background: `linear-gradient(180deg, ${colors.violet}15, ${colors.fuchsia}08, transparent)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>VIP Membership</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Your Glow-Up,{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>On Autopilot.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '32rem', margin: '0 auto 2rem' }}>
                  Pick your monthly voucher. Unlock VIP discounts. Always get your best pricing on tox.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Bank vouchers', 'Best tox pricing', 'VIP discounts', 'Westfield + Carmel'].map((chip) => (
                    <span key={chip} className="rounded-full px-4 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.7)', background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)' }}>{chip}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Quick Value Strip */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickValues.map((v, i) => (
                  <motion.div key={v.title} className="rounded-2xl p-6 lg:p-8" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <div className="flex items-center justify-center rounded-xl mb-4" style={{ width: 44, height: 44, background: `${colors.violet}10` }}>
                      <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 700, color: colors.violet }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{v.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body }}>{v.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Plans */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.75rem' }}>Pick Your Membership</h2>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>Same VIP benefits for both &mdash; your voucher options are what change.</p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {plans.map((plan, i) => (
                  <motion.div key={plan.key} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <div style={{ height: '3px', background: plan.gradient }} />
                    <div className="p-8 lg:p-10">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading }}>{plan.title}</h3>
                          <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.body, marginTop: '0.25rem' }}>{plan.bestFor}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 700, color: colors.heading }}>{plan.price}<span style={{ fontSize: '1rem', fontWeight: 500, color: colors.muted }}>/mo</span></p>
                        </div>
                      </div>

                      <div className="rounded-xl p-5" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>{plan.voucherLabel}</p>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, marginBottom: '1rem' }}>Vouchers can be shared and banked for later use.</p>
                        <ul className="space-y-2">
                          {plan.voucherIncludes.map((item) => (
                            <li key={item} className="flex items-center gap-2.5">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill={`${colors.violet}15`}/><path d="M5 8l2 2 4-4" stroke={colors.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: colors.heading }}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <a href={plan.href} className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', background: gradients.primary, color: '#fff', textDecoration: 'none', display: 'inline-block' }}>Start Membership</a>
                        <a href="#faq" className="rounded-full" style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, padding: '0.875rem 2rem', backgroundColor: '#fff', color: colors.heading, border: `1px solid ${colors.stone}`, textDecoration: 'none', display: 'inline-block' }}>Read FAQs</a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Additional Benefits */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Included With Both</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>VIP Benefits</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {additionalBenefits.map((b, i) => (
                  <motion.div key={b.title + b.desc} className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                    <p style={{ fontFamily: fonts.display, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: colors.heading, marginBottom: '0.25rem' }}>{b.title}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.desc}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-center mt-6" style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted }}>*Discounts apply to eligible services/products. Cannot be combined with other offers unless explicitly stated.</p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24" style={{ backgroundColor: colors.cream }}>
            <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Common Questions</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Membership FAQs</h2>
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
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Join VIP?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Start today and enjoy member pricing, VIP perks, and a monthly voucher.</p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Questions? Call <a href="tel:3177631142" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>(317) 763-1142</a></p>
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

BetaMemberships.getLayout = (page) => page;
