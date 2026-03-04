// pages/landing/jeuveau-intro.js
// Jeuveau Intro Offer — 50 Units for $360 (Evolus-subsidized trial)

import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function JeuveauIntroPage() {
  return (
    <BetaLayout
      title="Jeuveau® Intro Offer — 50 Units for $360"
      description="Try Jeuveau® like Botox®: 50 units for $360 with our Evolus-subsidized intro offer. Soft, natural results. Book and select First-time Jeuveau Intro Offer."
      canonical="https://reluxemedspa.com/landing/jeuveau-intro"
    >
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18), transparent 60%)`,
        }}
      >
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1rem' }}>
          <div style={{ maxWidth: '48rem' }}>
            <p style={{
              fontFamily: fonts.body,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: colors.muted,
            }}>
              RELUXE &middot; Westfield &amp; Carmel
            </p>
            <h1 style={{
              marginTop: '0.75rem',
              fontFamily: fonts.display,
              fontSize: typeScale.hero.size,
              fontWeight: typeScale.hero.weight,
              lineHeight: typeScale.hero.lineHeight,
              color: colors.white,
            }}>
              Try Jeuveau® for{' '}
              <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                $360 — 50 Units
              </span>
            </h1>
            <p style={{
              marginTop: '1rem',
              fontFamily: fonts.body,
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'rgba(250,248,245,0.7)',
            }}>
              Curious how Jeuveau compares to Botox? This <strong>introductory offer</strong> lets you try our most natural-looking tox with <strong>little risk</strong>.
              Same treatment class as Botox® — soft, smooth results while keeping your expressions.
            </p>
            <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <LI>50 units for just <strong>$360</strong> (limited first-time offer)</LI>
              <LI>Targets forehead lines, frown lines (11s), &amp; crow's feet</LI>
              <LI>Performed by RELUXE's expert injectors</LI>
            </ul>

            <div style={{ marginTop: '1.5rem' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>

            <div style={{
              marginTop: '0.75rem',
              fontFamily: fonts.body,
              fontSize: '0.6875rem',
              color: colors.muted,
            }}>
              At booking, choose <strong>"First-time Jeuveau Intro Offer"</strong> to receive this pricing.
            </div>
          </div>
        </div>
      </section>

      {/* What It Is vs Botox */}
      <section style={{ backgroundColor: colors.cream, padding: '3.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 28rem), 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
            <Card title="What is Jeuveau? (Like Botox®)">
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Bullet>Jeuveau is a neuromodulator — same treatment class as Botox®.</Bullet>
                <Bullet>Relaxes tiny facial muscles that crease the skin, softening lines.</Bullet>
                <Bullet>Designed for a <strong>soft, natural look</strong> — movement with fewer lines.</Bullet>
              </ul>
            </Card>
            <Card title="Why Try It with This Intro Offer?">
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Bullet><strong>Evolus subsidizes</strong> your first visit so you can try Jeuveau with low risk.</Bullet>
                <Bullet>Great for forehead lines, 11s, and crow's feet — new or returning patients.</Bullet>
                <Bullet>RELUXE injectors use anatomy-aware, light-touch dosing.</Bullet>
              </ul>
            </Card>
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
            <p style={{
              marginTop: '0.75rem',
              fontFamily: fonts.body,
              fontSize: '0.75rem',
              color: colors.muted,
            }}>
              Choose <strong>"First-time Jeuveau Intro Offer"</strong> after you tap Book.
            </p>
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
          }}>
            Before &amp; After
          </h2>
          <p style={{
            marginTop: '0.75rem',
            fontFamily: fonts.body,
            color: colors.body,
          }}>
            Real RELUXE patients. Soft, smooth foreheads — expression intact.
          </p>
        </div>
        <div style={{
          marginTop: '1.75rem',
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
        }}>
          <BA src="/images/results/tox/injector.hannah - 25.png" />
          <BA src="/images/results/tox/injector.krista - 01.png" />
          <BA src="/images/results/tox/injector.hannah - 27.png" />
        </div>
      </section>

      {/* What to Expect */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
          }}>
            What to Expect
          </h3>
          <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
            Simple visit. Natural result.
          </p>
        </div>
        <div style={{
          marginTop: '1.75rem',
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
        }}>
          <StepCard step="Day 0" title="Quick Visit" copy="Full Consultation + treatment in ~30 minutes. Minimal downtime.!" />
          <StepCard step="Days 2–7" title="Lines Soften" copy="Forehead, 11s, crow's feet relax while expressions stay you." />
          <StepCard step="Week 2+" title="Full Result" copy="Enjoy a smooth, refreshed look for ~3+ months." />
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '3.5rem 1rem' }}>
        <h4 style={{
          fontFamily: fonts.display,
          fontSize: typeScale.sectionHeading.size,
          fontWeight: typeScale.sectionHeading.weight,
          lineHeight: typeScale.sectionHeading.lineHeight,
          color: colors.heading,
          textAlign: 'center',
        }}>
          Jeuveau Intro FAQ
        </h4>
        <div style={{
          marginTop: '1.75rem',
          borderRadius: '1.5rem',
          border: `1px solid ${colors.stone}`,
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}>
          <FaqItem
            q="Is Jeuveau the same as Botox?"
            a="They're in the same treatment class (neuromodulators). Both relax tiny muscles that create lines. Many patients choose Jeuveau for a soft, natural look without heaviness."
          />
          <FaqItem
            q="Who qualifies for the $360 intro?"
            a={'New Jeuveau patients using our Evolus-subsidized offer. At booking, select \u201CFirst-time Jeuveau Intro Offer\u201D to apply it.'}
          />
          <FaqItem
            q="How many units do I need?"
            a="Everyone's anatomy is different. This intro provides 50 units; your injector will map dosing for your goals. Additional units can be discussed if appropriate."
          />
          <FaqItem
            q="How long does it last?"
            a="Most patients enjoy results ~3–4 months. Consistent maintenance helps results look even and last smoothly over time."
          />
          <FaqItem
            q="Will I look frozen?"
            a="No. RELUXE injectors use light-touch, anatomy-aware dosing for movement with fewer lines—natural, not stiff."
          />
          <FaqItem
            q="How do I redeem the offer?"
            a={'Tap Book and choose \u201CFirst-time Jeuveau Intro Offer.\u201D We\u2019ll confirm eligibility at your visit.'}
          />
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ overflow: 'hidden' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1rem' }}>
          <div style={{
            borderRadius: '1.5rem',
            background: gradients.primary,
            padding: '1px',
          }}>
            <div style={{
              borderRadius: '1.5rem',
              backgroundColor: colors.ink,
              padding: '3rem 2rem',
              textAlign: 'center',
            }}>
              <h5 style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: colors.white,
              }}>
                Your Face, Just Smoother
              </h5>
              <p style={{
                marginTop: '0.75rem',
                fontFamily: fonts.body,
                color: 'rgba(250,248,245,0.6)',
                maxWidth: '40rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                A low-risk way to try Jeuveau with RELUXE's expert injectors. One simple step to book.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
              <p style={{
                marginTop: '0.75rem',
                fontFamily: fonts.body,
                fontSize: '0.6875rem',
                color: colors.muted,
              }}>
                Choose <strong>"First-time Jeuveau Intro Offer"</strong> after you tap Book.
              </p>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

JeuveauIntroPage.getLayout = (page) => page

/* ---------- Components ---------- */
function Card({ title, children }) {
  return (
    <div style={{
      borderRadius: '1.5rem',
      border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <h3 style={{
        fontFamily: fonts.display,
        fontSize: typeScale.subhead.size,
        fontWeight: typeScale.subhead.weight,
        lineHeight: typeScale.subhead.lineHeight,
        color: colors.heading,
      }}>
        {title}
      </h3>
      <div style={{ marginTop: '1rem' }}>{children}</div>
    </div>
  )
}
function Bullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}
function LI({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, color: 'rgba(250,248,245,0.7)' }}>
      <span style={{ marginTop: '0.5rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}
function StepCard({ step, title, copy }) {
  return (
    <div style={{
      borderRadius: '1.5rem',
      border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          height: '2.5rem',
          minWidth: '5.5rem',
          padding: '0 0.75rem',
          borderRadius: '0.75rem',
          background: gradients.primary,
          color: '#fff',
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
        }}>
          {step}
        </div>
        <h6 style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1rem',
          color: colors.heading,
        }}>
          {title}
        </h6>
      </div>
      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{copy}</p>
    </div>
  )
}
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group" style={{ borderBottom: `1px solid ${colors.stone}` }}>
      <summary style={{
        cursor: 'pointer',
        listStyle: 'none',
        padding: '1rem 1.5rem',
        fontFamily: fonts.body,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: colors.heading,
      }}>
        <span style={{ fontSize: '0.9375rem' }}>{q}</span>
        <svg style={{ height: '1.25rem', width: '1.25rem', color: colors.muted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body, fontSize: '0.9375rem' }}>{a}</div>
    </details>
  )
}
function BA({ src }) {
  return (
    <div style={{
      overflow: 'hidden',
      borderRadius: '1rem',
      border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <img
        src={src}
        alt="Jeuveau before and after"
        style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
