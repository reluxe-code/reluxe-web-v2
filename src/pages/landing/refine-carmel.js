// pages/landing/refine-carmel.js
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function RefineCarmelPage() {
  return (
    <BetaLayout
      title="REFINE Carmel | Complimentary, Personalized Consultation"
      description="REFINE is RELUXE Carmel's signature complimentary consultation with our highly skilled nurse injectors. Get a tailored plan and the option for same-day treatment."
      canonical="https://reluxemedspa.com/landing/refine-carmel"
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
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <p style={{
                fontFamily: fonts.body,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: colors.muted,
              }}>
                RELUXE &middot; Carmel
              </p>
              <h1 style={{
                marginTop: '0.75rem',
                fontFamily: fonts.display,
                fontSize: typeScale.hero.size,
                fontWeight: typeScale.hero.weight,
                lineHeight: typeScale.hero.lineHeight,
                color: colors.white,
              }}>
                REFINE:{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Your Personalized Consultation
                </span>
              </h1>
              <p style={{
                marginTop: '1rem',
                fontFamily: fonts.body,
                fontSize: '1.125rem',
                lineHeight: 1.7,
                color: 'rgba(250,248,245,0.7)',
              }}>
                With our highly skilled nurse injectors. REFINE is our signature <strong>complimentary</strong> consultation designed to help you feel confident,
                supported, and empowered to make the right choices for your skin and appearance.
              </p>
              <p style={{
                marginTop: '0.75rem',
                fontFamily: fonts.body,
                color: 'rgba(250,248,245,0.6)',
              }}>
                Whether you're new to treatments or ready for a refresh, we take the time to understand your goals, facial anatomy, and lifestyle — then create a
                custom plan just for you.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <TrustBadges />
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['No pressure. No gimmicks.', 'Honest education', 'Nearly 200 5-star reviews'].map((t) => (
                  <span key={t} style={{
                    fontFamily: fonts.body,
                    fontSize: '0.75rem',
                    color: colors.muted,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(250,248,245,0.04)',
                    border: '1px solid rgba(250,248,245,0.08)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{
                position: 'relative',
                aspectRatio: '4/5',
                width: '100%',
                overflow: 'hidden',
                borderRadius: '1.5rem',
                border: '1px solid rgba(250,248,245,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}>
                <img src="/images/landing/refine-carmel-hero.png" alt="REFINE consultation at RELUXE Carmel" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                }}>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.7)' }}>Complimentary, personalized consults led by nurse injectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: typeScale.sectionHeading.size,
            fontWeight: typeScale.sectionHeading.weight,
            lineHeight: typeScale.sectionHeading.lineHeight,
            color: colors.heading,
          }}>
            What's Included
          </h2>
          <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
            Everything you need to feel informed and confident — without pressure.
          </p>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
          <IncludedCard title="Expert Consultation" copy="Meet 1:1 with an experienced nurse injector for a thorough assessment and goal-setting." icon="💬" />
          <IncludedCard title="Personalized Treatment Plan" copy="A strategy tailored to your priorities, timeline, and budget — no one-size-fits-all." icon="🧭" />
          <IncludedCard title="Option for Same-Day Service" copy="If it makes sense for your plan, you can refine your look right away." icon="⚡" />
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Treatment Areas */}
      <section style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
            }}>
              Common Concerns We Address
            </h3>
            <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
              Your plan may include injectables, skin treatments, or lasers — always customized to you.
            </p>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
            <AreaCard title="Undereyes & Dark Circles" items={["Filler","PRP","SkinPen Microneedling"]} />
            <AreaCard title="Wrinkles & Fine Lines" items={["Jeuveau®","Botox®","Dysport®","Daxxify®"]} />
            <AreaCard title="Sagging / Loose Skin" items={["Morpheus8","Sculptra","CO₂ Laser"]} />
            <AreaCard title="Volume Loss & Balancing" items={["Dermal Filler","Sculptra"]} />
            <AreaCard title="Skin Texture & Resurfacing" items={["CO₂ Laser","Morpheus8","SkinPen"]} />
            <AreaCard title="Personalized Skincare" items={["Medical-grade routines","Maintenance plan"]} />
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* Why RELUXE */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div style={{ order: 2 }}>
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
                color: colors.heading,
              }}>
                Why RELUXE?
              </h3>
              <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
                At RELUXE, your journey isn't about chasing trends or counting units — it's about natural, confident results that match who you are.
              </p>
              <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Bullet>No pressure. No gimmicks.</Bullet>
                <Bullet>Honest education and recommendations.</Bullet>
                <Bullet>Nearly 200 5-star reviews from women just like you.</Bullet>
              </ul>
              <div style={{ marginTop: '1.5rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
            </div>
          </div>
          <div style={{ order: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <img src="/images/landing/balancing.png" alt="Consult with nurse injector" style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%' }} />
            <img src="/images/landing/filler.png" alt="Personalized treatment planning" style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%' }} />
            <img src="/images/landing/m8 copy.png" alt="Morpheus8 treatment" style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%' }} />
            <img src="/images/landing/tox.png" alt="SkinPen microneedling" style={{ borderRadius: '1rem', border: `1px solid ${colors.stone}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%' }} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: colors.cream, padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
            }}>
              How REFINE Works
            </h3>
            <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>
              Simple, supportive, and tailored to you.
            </p>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))' }}>
            <StepCard step="1" title="Book" copy="Choose a time that works for you at our Carmel location." />
            <StepCard step="2" title="Consult" copy="Meet with a nurse injector for an anatomy-aware assessment and plan." />
            <StepCard step="3" title="Refine" copy="Begin your plan — same-day service available when appropriate." />
          </div>
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" style={{ maxWidth: '64rem', margin: '0 auto', padding: '4rem 1rem' }}>
        <h4 style={{
          fontFamily: fonts.display,
          fontSize: typeScale.sectionHeading.size,
          fontWeight: typeScale.sectionHeading.weight,
          lineHeight: typeScale.sectionHeading.lineHeight,
          color: colors.heading,
          textAlign: 'center',
        }}>
          REFINE FAQs
        </h4>
        <div style={{
          marginTop: '2rem',
          borderRadius: '1.5rem',
          border: `1px solid ${colors.stone}`,
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}>
          <FaqItem q="Is REFINE really complimentary?" a="Yes. Your consultation is free and low-pressure — our goal is to educate and guide, not sell." />
          <FaqItem q="Can I get treated the same day?" a="Often, yes. If your plan and schedule allow, we can begin treatment during your visit." />
          <FaqItem q="Do I have to decide everything at once?" a="Not at all. We'll prioritize what matters most and map steps across a timeline and budget that work for you." />
          <FaqItem q="Who will I meet with?" a="A highly trained nurse injector who will assess your goals and anatomy and build a plan with you." />
          <FaqItem q="Is this only at Carmel?" a="REFINE for this page is specific to our Carmel location. Bookings here route to Carmel providers." />
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <GravityBookButton fontKey={FONT_KEY} size="hero" />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ overflow: 'hidden' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1rem' }}>
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
                REFINE: Education First. Results Always.
              </h5>
              <p style={{
                marginTop: '0.75rem',
                fontFamily: fonts.body,
                color: 'rgba(250,248,245,0.6)',
                maxWidth: '40rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Get the care, strategy, and results you deserve — crafted around your goals, timeline, and lifestyle.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

RefineCarmelPage.getLayout = (page) => page

/* ---------- Components ---------- */
function IncludedCard({ title, copy, icon }) {
  return (
    <div style={{
      borderRadius: '1.5rem',
      border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          height: '2.5rem',
          width: '2.5rem',
          borderRadius: '0.75rem',
          background: gradients.subtle,
          border: `1px solid ${colors.stone}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.125rem',
        }}>
          {icon}
        </div>
        <h4 style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1.125rem',
          color: colors.heading,
        }}>
          {title}
        </h4>
      </div>
      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>{copy}</p>
    </div>
  )
}

function AreaCard({ title, items = [] }) {
  return (
    <div style={{
      borderRadius: '1.5rem',
      border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <h5 style={{
        fontFamily: fonts.display,
        fontWeight: 700,
        fontSize: '1.125rem',
        color: colors.heading,
      }}>
        {title}
      </h5>
      <ul style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {items.map((it, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
            <span style={{ marginTop: '0.375rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
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
          height: '2.25rem',
          width: '2.25rem',
          borderRadius: '0.75rem',
          background: gradients.primary,
          color: '#fff',
          fontFamily: fonts.body,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
      <p style={{ marginTop: '0.75rem', fontFamily: fonts.body, color: colors.body }}>{copy}</p>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontFamily: fonts.body, color: colors.body }}>
      <span style={{ marginTop: '0.375rem', height: '0.5rem', width: '0.5rem', borderRadius: '9999px', background: colors.violet, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} style={{ borderBottom: `1px solid ${colors.stone}` }}>
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
        <span>{q}</span>
        <svg style={{ height: '1.25rem', width: '1.25rem', color: colors.muted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', fontFamily: fonts.body, color: colors.body }}>{a}</div>
    </details>
  )
}

function TrustBadges() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      borderRadius: '9999px',
      background: 'rgba(250,248,245,0.04)',
      border: '1px solid rgba(250,248,245,0.1)',
      padding: '0.5rem 0.75rem',
    }}>
      <div style={{ display: 'flex' }}>
        <img src="/images/avatars/a1.jpg" style={{ height: '1.5rem', width: '1.5rem', borderRadius: '9999px', border: '2px solid rgba(0,0,0,0.3)', marginRight: '-0.5rem' }} alt="reviewer" />
        <img src="/images/avatars/a2.jpg" style={{ height: '1.5rem', width: '1.5rem', borderRadius: '9999px', border: '2px solid rgba(0,0,0,0.3)', marginRight: '-0.5rem' }} alt="reviewer" />
        <img src="/images/avatars/a3.jpg" style={{ height: '1.5rem', width: '1.5rem', borderRadius: '9999px', border: '2px solid rgba(0,0,0,0.3)' }} alt="reviewer" />
      </div>
      <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.85)' }}><strong>~200</strong> 5-star reviews</span>
    </div>
  )
}
