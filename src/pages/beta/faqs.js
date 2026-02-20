import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import faqData from '@/data/faqs';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const categories = Object.keys(faqData);

export default function BetaFaqs() {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [openFaq, setOpenFaq] = useState(0);

  const currentFaqs = faqData[activeTab] || [];

  return (
    <BetaLayout title="Frequently Asked Questions" description="Find answers to common questions about treatments, booking, memberships, and more at RELUXE Med Spa.">
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section style={{ backgroundColor: colors.ink }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>FAQs</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Got Questions?{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>We Got You.</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '28rem', margin: '0 auto' }}>
                  Everything you need to know about treatments, booking, pricing, and more.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Tab navigation */}
          <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}`, position: 'sticky', top: 0, zIndex: 30 }}>
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveTab(cat); setOpenFaq(0); }}
                    className="rounded-full shrink-0 transition-colors duration-200"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.5rem 1.25rem',
                      background: activeTab === cat ? gradients.primary : 'transparent',
                      color: activeTab === cat ? '#fff' : colors.body,
                      border: activeTab === cat ? 'none' : `1px solid ${colors.stone}`,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Content */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontFamily: fonts.display, fontSize: '1.5rem', fontWeight: 700, color: colors.heading, marginBottom: '1.5rem' }}>{activeTab}</h2>
                  <div className="border-t" style={{ borderColor: colors.stone }}>
                    {currentFaqs.map((faq, i) => (
                      <div key={i} className="border-b" style={{ borderColor: colors.stone }}>
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
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Quick links */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Still Have Questions?</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>We&apos;re Here to Help</h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Book a Consult', body: 'Our providers will answer your specific questions and build a custom plan.', href: null, cta: 'book' },
                  { title: 'Call Us', body: '(317) 763-1142 \u2014 we\u2019re available Mon\u2013Fri 9am\u20137pm, Sat 9am\u20134pm.', href: 'tel:3177631142', cta: 'Call Now' },
                  { title: 'Send a Message', body: 'Fill out our contact form and we\u2019ll get back to you within 24 hours.', href: '/beta/contact', cta: 'Contact Us' },
                ].map((card, i) => (
                  <motion.div key={card.title} className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading, marginBottom: '0.5rem' }}>{card.title}</h3>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.6, color: colors.body, marginBottom: '1.25rem' }}>{card.body}</p>
                    {card.cta === 'book' ? (
                      <GravityBookButton fontKey={fontKey} size="nav" />
                    ) : (
                      <a href={card.href} className="rounded-full inline-block" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', color: colors.violet, border: `1.5px solid ${colors.violet}`, textDecoration: 'none' }}>{card.cta}</a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Get Started?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation &mdash; no pressure, just expert advice.</p>
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

BetaFaqs.getLayout = (page) => page;
