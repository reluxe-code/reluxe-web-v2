import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, typeScale } from '@/components/preview/tokens'
import GiftCardPurchaseFlow from '@/components/beta/GiftCardPurchaseFlow'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

const exampleGifts = [
  { name: 'Ultimate RELUXE Day', desc: 'The full luxury experience — facial, massage, and more', price: 500 },
  { name: 'Premium Facial Package', desc: 'HydraFacial or Glo2Facial with add-ons', price: 250 },
  { name: 'Tox & Glow Package', desc: 'Botox or Dysport paired with a glow facial', price: 200 },
  { name: 'Signature Facial', desc: 'A relaxing, results-driven facial treatment', price: 150 },
  { name: 'Relaxation Massage', desc: 'Unwind with a full-body therapeutic massage', price: 125 },
  { name: 'Glo2Facial Experience', desc: 'Our signature oxygenating facial treatment', price: 100 },
]

const occasions = [
  { key: 'valentines', label: "Valentine's Day", icon: '💝', desc: 'Show them you care with the gift of self-care' },
  { key: 'mothers_day', label: "Mother's Day", icon: '🌸', desc: 'Because she deserves to feel pampered' },
  { key: 'birthday', label: 'Birthday', icon: '🎂', desc: 'The birthday gift they actually want' },
  { key: 'thank_you', label: 'Thank You', icon: '🙏', desc: 'Say thanks in the most luxurious way' },
  { key: 'anniversary', label: 'Anniversary', icon: '✨', desc: 'Celebrate with a shared wellness experience' },
  { key: 'just_because', label: 'Just Because', icon: '💜', desc: 'No occasion needed — just pure thoughtfulness' },
]

const faqs = [
  { q: 'How long are gift cards valid?', a: 'RELUXE gift cards are valid for 5 years from the date of purchase. That\'s plenty of time to find the perfect treatment.' },
  { q: 'How does the recipient redeem it?', a: 'The recipient receives an email with a unique gift card code. They can present this code at either RELUXE location when booking or checking out for any service.' },
  { q: 'Can they choose any treatment?', a: 'Absolutely. Gift cards can be used toward any service at either RELUXE Med Spa location — facials, tox, fillers, massage, body contouring, and more.' },
  { q: 'What if the recipient doesn\'t have a RELUXE account?', a: 'No problem! They can create an account when they\'re ready to book. The gift card code works whether or not they have an existing account.' },
  { q: 'Can gift cards be combined with memberships or rewards?', a: 'Yes! Gift card balances are separate from membership benefits and RELUXE Rewards. They can be used together for maximum value.' },
  { q: 'Can I get a refund on a gift card?', a: 'Unused gift cards can be refunded within 30 days of purchase. Please contact us at hello@reluxemedspa.com for assistance.' },
]

export default function BetaGiftCards() {
  const [openFaq, setOpenFaq] = useState(-1)
  const purchaseRef = useRef(null)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const flowRef = useRef(null)

  const scrollToPurchase = useCallback((amountCents) => {
    if (amountCents) setSelectedAmount(amountCents)
    purchaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <BetaLayout title="Med Spa Gift Cards — Botox, Facials & Treatments" description="Give the gift of luxury med spa treatments. RELUXE gift cards for Botox, facials, fillers & more. Valid 5 years at both Westfield & Carmel locations. $25–$2,000." canonical="https://reluxemedspa.com/gift-cards">
      {({ fontKey, fonts }) => (
        <>
          {/* ─── Hero ─── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '50%', height: '140%', background: `linear-gradient(200deg, ${colors.violet}18, ${colors.fuchsia}08, transparent)`, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '40%', height: '120%', background: `linear-gradient(30deg, ${colors.rose}08, transparent)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>RELUXE Gift Cards</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Give the Gift of{' '}
                  <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RELUXE</span>
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.55)', maxWidth: '32rem', margin: '0 auto 1.5rem' }}>
                  Luxurious treatments they&rsquo;ll actually love. Delivered instantly by email. Redeemable at both Indiana locations.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Instant delivery', 'Valid 5 years', 'Any treatment', 'Two locations'].map((chip) => (
                    <span key={chip} className="rounded-full px-4 py-1.5" style={{ fontFamily: fonts.body, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(250,248,245,0.7)', background: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.08)' }}>{chip}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ─── Purchase Flow ─── */}
          <section ref={purchaseRef} className="scroll-mt-20" style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
              <div className="rounded-2xl p-6 sm:p-8 lg:p-10" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <GiftCardPurchaseFlow ref={flowRef} fonts={fonts} initialAmount={selectedAmount} />
              </div>
            </div>
          </section>

          {/* ─── Example Gifts ─── */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Gift Ideas</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                  Not Sure How Much?
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, maxWidth: '28rem', margin: '0.75rem auto 0' }}>
                  Here are some popular gift amounts to help you choose
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {exampleGifts.map((gift, i) => (
                  <motion.button
                    key={gift.name}
                    type="button"
                    onClick={() => scrollToPurchase(gift.price * 100)}
                    className="text-left rounded-2xl p-5 lg:p-6"
                    style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, cursor: 'pointer', transition: 'all 0.2s' }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <p style={{ fontFamily: fonts.display, fontSize: '1.75rem', fontWeight: 700, color: colors.heading, margin: 0 }}>${gift.price}</p>
                      <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet, background: `${colors.violet}10`, padding: '4px 10px', borderRadius: 999 }}>
                        Select
                      </span>
                    </div>
                    <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 600, color: colors.heading, marginBottom: 4 }}>{gift.name}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, lineHeight: 1.5, margin: 0 }}>{gift.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Occasions ─── */}
          <section style={{ backgroundColor: colors.cream }}>
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Perfect For Every Occasion</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
                  When to Give RELUXE
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                {occasions.map((occ, i) => (
                  <motion.div
                    key={occ.key}
                    className="rounded-2xl p-5 text-center"
                    style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{occ.icon}</div>
                    <p style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.heading, marginBottom: 4 }}>{occ.label}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted, lineHeight: 1.5, margin: 0 }}>{occ.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── FAQ ─── */}
          <section id="faq" className="scroll-mt-24" style={{ backgroundColor: '#fff' }}>
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '1rem' }}>Common Questions</p>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>Gift Card FAQs</h2>
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

          {/* ─── Bottom CTA ─── */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>The Perfect Gift, Every Time</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                Give the gift of confidence, relaxation, and self-care.
              </p>
              <button
                type="button"
                onClick={() => scrollToPurchase(0)}
                style={{
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: colors.heading,
                  background: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '1rem 2.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                Buy a Gift Card
              </button>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}

BetaGiftCards.getLayout = (page) => page
