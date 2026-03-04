// src/pages/guide/first-visit.js
// First-visit guide — targets "what to expect at med spa" queries
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, typeScale } from '@/components/preview/tokens'
import GravityBookButton from '@/components/beta/GravityBookButton'
import GoogleReviewBadge from '@/components/GoogleReviewBadge'

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`
const baseUrl = 'https://reluxemedspa.com'
const pageUrl = `${baseUrl}/guide/first-visit`

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55, delay }}>
      {children}
    </motion.div>
  )
}

const STEPS = [
  {
    number: '01',
    title: 'Book Your Free Consultation',
    content: 'Book online at reluxemedspa.com/book, call (317) 763-1142, or text us. All first-time consultations are free and no-pressure. Select either our Westfield or Carmel location. Same-day appointments are frequently available.',
  },
  {
    number: '02',
    title: 'Arrive & Check In',
    content: 'Plan to arrive 5–10 minutes early. You\'ll fill out a brief intake form (medical history, goals, areas of concern). Our space is designed to feel like a luxury retreat, not a doctor\'s office. Park in our free lot right outside the door.',
  },
  {
    number: '03',
    title: 'Meet Your Provider',
    content: 'Your provider is a licensed nurse injector or aesthetician — not a sales rep. They\'ll sit down with you, listen to your goals, assess your face/skin, and explain your options in plain language. This is a conversation, not a pitch. Ask anything.',
  },
  {
    number: '04',
    title: 'Get Your Personalized Plan',
    content: 'Your provider recommends treatments based on your anatomy, concerns, and budget. You\'ll get exact pricing before anything happens — no hidden fees, no surprises. They\'ll explain what they recommend, what can wait, and what they wouldn\'t do.',
  },
  {
    number: '05',
    title: 'Treat (If You\'re Ready)',
    content: 'Many patients choose to treat the same day as their consultation. If you\'re ready, your provider can start immediately. If you want to think about it, there\'s zero pressure to proceed — your consultation notes stay on file for whenever you\'re ready.',
  },
  {
    number: '06',
    title: 'Aftercare & Follow-Up',
    content: 'You\'ll receive clear aftercare instructions and can reach your provider with questions anytime. Most treatments include a complimentary follow-up at 2 weeks to assess results and make any adjustments.',
  },
]

const WHAT_TO_KNOW = [
  { title: 'Consultations are always free', detail: 'No commitment, no pressure, no consultation fee. Come learn, ask questions, and get a plan.' },
  { title: 'Bring a clean face', detail: 'Skip heavy makeup on the treatment area if you think you\'ll want to treat same-day. But don\'t stress — we can help you remove it.' },
  { title: 'Avoid blood thinners', detail: 'If you\'re considering injectables (Botox or fillers), avoid aspirin, ibuprofen, fish oil, and alcohol for 24–48 hours before to minimize bruising.' },
  { title: 'You won\'t be pressured', detail: 'Our providers recommend what you need, tell you what you don\'t, and respect your timeline and budget. Period.' },
  { title: 'Results are gradual', detail: 'Botox takes 3–7 days to kick in. Fillers settle over 2 weeks. Most treatments look their best 2–4 weeks later.' },
  { title: 'Photos are private', detail: 'We take before/after photos for your chart (so we can track progress). They\'re never shared without your explicit written consent.' },
]

const FAQS = [
  { q: 'What should I wear to a med spa appointment?', a: 'Wear whatever you\'re comfortable in. For facials or body treatments, we provide gowns/towels. For injectables (Botox, fillers), come as you are — most patients go right back to their day afterward.' },
  { q: 'Will my first appointment hurt?', a: 'If you have a consultation only, there\'s nothing physical at all. If you choose to treat, most procedures are very manageable. Botox feels like small pinches (2–3/10). Fillers use topical numbing (3–4/10). Facials are relaxing and painless.' },
  { q: 'How long is a first appointment?', a: 'A consultation takes about 20–30 minutes. If you treat the same day, add the treatment time: Botox (15 minutes), fillers (30–45 minutes), facials (60 minutes). Most people are done within an hour total.' },
  { q: 'Can I bring someone with me?', a: 'Absolutely — friends, partners, or family are welcome. Many first-timers bring a friend for moral support. We also do a lot of "Botox dates" where friends treat together.' },
  { q: 'Do I need a referral from my doctor?', a: 'No referral needed. Our Medical Director oversees all treatment plans, and our providers are licensed professionals who can evaluate and treat you directly.' },
  { q: 'What if I don\'t know what I want?', a: 'That\'s exactly what the consultation is for. Most first-timers come in with a vague concern ("I look tired" or "I want to try Botox") and leave with a clear, personalized plan. Your provider guides the entire process.' },
  { q: 'Is it awkward? I\'ve never done anything like this.', a: 'Not at all. A huge percentage of our patients are first-timers. Our team is warm, non-judgmental, and experienced at making people feel comfortable. There are no dumb questions.' },
  { q: 'What are your most popular first-time treatments?', a: 'Botox (wrinkle prevention/smoothing), lip filler, and HydraFacial are the most popular first-time treatments. All three are quick, comfortable, and have minimal downtime.' },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Your First Visit', item: pageUrl },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'Your First Med Spa Visit at RELUXE',
      description: 'What to expect during your first visit to RELUXE Med Spa in Carmel or Westfield, Indiana.',
      step: STEPS.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.content,
      })),
    },
  ],
}

export default function FirstVisitGuide() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <BetaLayout
      title="Your First Visit"
      rawTitle="Your First Med Spa Visit: What to Expect | RELUXE Med Spa Indiana"
      description="First time at a med spa? Here's exactly what to expect at RELUXE Med Spa in Carmel & Westfield, Indiana — from booking to treatment to aftercare. Free consultations, no pressure."
      canonical={pageUrl}
      structuredData={structuredData}
    >
      {({ fonts }) => (
        <>
          {/* ── Hero ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '160%', background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`, pointerEvents: 'none' }} />
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  First-Time Guide
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, lineHeight: 1.08, color: colors.white, marginBottom: '1rem' }}>
                  Your First Med Spa Visit
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.65, color: 'rgba(250,248,245,0.6)', maxWidth: '36rem', margin: '0 auto 2rem' }}>
                  Never been to a med spa before? Here&rsquo;s exactly what happens at RELUXE — step by step, no surprises. Free consultations, transparent pricing, zero pressure.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <GravityBookButton label="Book Free Consult" fonts={fonts} />
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ fontFamily: fonts.body, color: 'rgba(250,248,245,0.8)', border: '1px solid rgba(250,248,245,0.15)', textDecoration: 'none' }}
                  >
                    Browse Treatments
                  </Link>
                </div>
                <div className="mt-6">
                  <GoogleReviewBadge variant="inline" fonts={fonts} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── Step-by-Step ── */}
          <section className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.fuchsia, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Step by Step
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '2.5rem' }}>
                  What Happens at Your First Visit
                </h2>
              </FadeIn>

              <div className="space-y-6">
                {STEPS.map((step, i) => (
                  <FadeIn key={i} delay={i * 0.06}>
                    <div className="flex gap-5 rounded-2xl p-6" style={{ background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.07)' }}>
                      <div style={{ fontFamily: fonts.display, fontSize: '2rem', fontWeight: 800, color: colors.violet, opacity: 0.4, lineHeight: 1, flexShrink: 0 }}>
                        {step.number}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.white, marginBottom: '0.5rem' }}>
                          {step.title}
                        </h3>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.65, color: 'rgba(250,248,245,0.55)' }}>
                          {step.content}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* ── What to Know ── */}
          <section className="relative" style={{ backgroundColor: colors.ink, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.4, pointerEvents: 'none' }} />
            <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Good to Know
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '2.5rem' }}>
                  Before You Come In
                </h2>
              </FadeIn>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {WHAT_TO_KNOW.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.04}>
                    <div className="rounded-xl p-5 h-full" style={{ background: 'rgba(250,248,245,0.03)', border: '1px solid rgba(250,248,245,0.07)' }}>
                      <h3 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.white, marginBottom: '0.375rem' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)' }}>
                        {item.detail}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.2}>
                <div className="text-center mt-12">
                  <GravityBookButton label="Book Your First Visit" fonts={fonts} />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── FAQs ── */}
          <section className="relative" style={{ backgroundColor: '#0d0d14', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.3, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative">
              <FadeIn>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  FAQs
                </p>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, color: colors.white, marginBottom: '2rem' }}>
                  First-Time Questions
                </h2>
              </FadeIn>

              <div>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="w-full flex items-start justify-between gap-4 py-5 text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontFamily: fonts.body, fontSize: '1rem', fontWeight: 600, color: colors.cream, lineHeight: 1.4 }}>{faq.q}</span>
                      <span style={{ color: colors.violet, fontSize: '1.25rem', lineHeight: 1, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, marginTop: 2 }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div className="pb-5" style={{ marginTop: -4 }}>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(250,248,245,0.6)' }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="relative" style={{ background: `linear-gradient(135deg, ${colors.violet}, ${colors.fuchsia})`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.6, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 relative text-center">
              <FadeIn>
                <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                  Ready to See What the Hype Is About?
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '28rem', margin: '0 auto 2rem' }}>
                  Book a free consultation at RELUXE Med Spa in Carmel or Westfield. No pressure, no commitment — just expert advice and a personalized plan.
                </p>
                <GravityBookButton label="Book Free Consult" fonts={fonts} />
              </FadeIn>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  )
}
