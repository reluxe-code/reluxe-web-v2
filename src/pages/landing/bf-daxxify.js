// pages/landing/bf-daxxify.js
// Black Friday Daxxify Deal — Buy 2 Areas, Get 1 Free (up to 120 units)

import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-daxxify/'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function DaxxifyBlackFridayPage() {
  return (
    <BetaLayout
      title="Black Friday Daxxify — Buy 2 Areas, Get 1 Free"
      description="Black Friday Daxxify deal at RELUXE: Buy 2 areas, get 1 free (up to 120 units) for $560. Book in November or buy up to 4 to use through 2026."
      canonical="https://reluxemedspa.com/landing/bf-daxxify"
    >
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: colors.ink }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[320px] py-7 md:py-8">
          <div className="max-w-3xl" style={{ color: colors.white }}>
            <p className="text-[11px] sm:text-xs tracking-widest uppercase" style={{ color: colors.muted, fontFamily: fonts.body }}>
              RELUXE &bull; Carmel &amp; Westfield
            </p>
            <h1
              className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: fonts.display }}
            >
              Black Friday Daxxify: Buy 2 Areas, Get 1 Free
            </h1>
            <p className="mt-3 text-base sm:text-lg leading-relaxed" style={{ fontFamily: fonts.body, color: '#D4D4D4' }}>
              Curious about Daxxify&trade; and its longer-lasting potential? This limited Black Friday offer gives you the{' '}
              <strong>look of 3 areas for the price of 2</strong> — forehead, 11s, and crow&rsquo;s feet — for just{' '}
              <strong>$560</strong> (up to 120 units).
            </p>
            <ul className="mt-3 space-y-2" style={{ color: '#D4D4D4' }}>
              <LI>Buy 2 Daxxify areas, get the 3rd free — up to 120 units for $560.</LI>
              <LI>Ideal for forehead lines, frown lines (11s), and crow&rsquo;s feet in one full-dose visit.</LI>
              <LI>
                All units are used in <strong>one appointment</strong> so you can see how Daxxify performs at the right
                dose for your muscles.
              </LI>
              <LI>
                Book in November and pay at your visit, or <strong>buy up to 4 packages now</strong> to use through
                2026.
              </LI>
              <LI>Our best Daxxify pricing of the year. Once the Black Friday window closes, this deal is gone.</LI>
            </ul>

            {/* CTAs */}
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book in November &bull; Pay at Your Visit
              </CTA>
              <CTA href={DEALS_URL}>
                Not Due Yet? Buy Up to 4 for 2026
              </CTA>
              <CTA href={BOOK_URL} dataAttr="westfield">
                Book Westfield
              </CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">
                Book Carmel
              </CTA>
            </div>

            <div className="mt-2 text-[11px]" style={{ color: colors.muted, fontFamily: fonts.body }}>
              Mention the <strong>&ldquo;Black Friday Daxxify Buy 2, Get 1 Free&rdquo;</strong> deal in your booking notes. Limited
              supply and appointment spots.
            </div>
          </div>
        </div>
      </section>

      {/* How it works / Why 1 appointment */}
      <section className="relative py-12 sm:py-14" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="Your Daxxify Black Friday Deal">
              <ul className="space-y-2" style={{ color: colors.body }}>
                <Bullet>Look of 3 areas with Daxxify (forehead, 11s, crow&rsquo;s feet) for the price of 2.</Bullet>
                <Bullet>Up to 120 units for $560.</Bullet>
                <Bullet>
                  Book in November for treatment now or pre-purchase up to 4 packages to use later through 2026.
                </Bullet>
                <Bullet>Available at both RELUXE locations with Daxxify-trained injectors.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why All Units Are Used in One Visit">
              <ul className="space-y-2" style={{ color: colors.body }}>
                <Bullet>
                  Daxxify dosing is tailored to your anatomy. A full, single-visit treatment tells us how your muscles
                  actually respond.
                </Bullet>
                <Bullet>
                  Splitting units between visits makes it hard to judge effect and can lead to under-treating key areas.
                </Bullet>
                <Bullet>
                  Treating all 3 areas at once creates a <strong>harmonized, refreshed look</strong> instead of chasing
                  lines one spot at a time.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Daxxify &bull; Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs" style={{ color: colors.muted, fontFamily: fonts.body }}>
            Limited-time pricing only for Black Friday / Cyber Monday. Once it&rsquo;s gone, Daxxify returns to standard
            rates.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: colors.heading, fontFamily: fonts.display }}
          >
            What to Expect
          </h2>
          <p className="mt-3" style={{ color: colors.body, fontFamily: fonts.body }}>
            A Daxxify visit that feels like RELUXE — with extra-good Black Friday pricing.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult & Daxxify Treatment"
            copy="We review your history, map forehead, 11s, and crow's feet, and treat with your Black Friday Daxxify package."
          />
          <StepCard
            step="Days 2–7"
            title="Lines Begin to Soften"
            copy="You'll notice expression lines softening and makeup sitting more smoothly as Daxxify takes effect."
          />
          <StepCard
            step="Weeks Ahead"
            title="Enjoy Your Result"
            copy="Daxxify can offer longer-lasting results for many patients compared to traditional tox. You and your injector can decide when to schedule your next visit."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Daxxify Black Friday Spot
          </CTA>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
          style={{ color: colors.heading, fontFamily: fonts.display }}
        >
          Black Friday Daxxify Deal — FAQ
        </h3>
        <div className="mt-7 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}` }}>
          <FaqItem
            q="What is Daxxify?"
            a="Daxxify is a neuromodulator in the same treatment family as Botox, Jeuveau, Dysport, and others. Many patients choose it for its potential to last longer than traditional tox options. Your injector will review if it's a good fit for you."
          />
          <FaqItem
            q="Do I have to pay now to get the deal?"
            a="If you're ready now, you can simply book in November and pay at your visit. If you want to lock in Black Friday pricing for future visits, you can pre-purchase up to 4 Daxxify packages now to use through 2026."
          />
          <FaqItem
            q="Why do I need to use all units at once?"
            a="We want you to see how Daxxify performs at the right dose for your muscles. Splitting units between visits usually means under-treating each area and doesn't give us a clear picture for future planning."
          />
          <FaqItem
            q="Which areas are best for this deal?"
            a="This Black Friday package is designed for forehead lines, frown lines (11s), and crow's feet treated in the same appointment. Your injector will confirm the plan for your face."
          />
          <FaqItem
            q="How many Daxxify packages can I buy?"
            a="You may buy up to 4 Black Friday Daxxify packages per person to use through 2026, while supplies last."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Daxxify &bull; Book or Buy Now
          </CTA>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative rounded-3xl p-[1px]" style={{ background: gradients.primary }}>
            <div className="rounded-3xl px-6 sm:px-8 py-10 sm:py-12 text-center" style={{ backgroundColor: colors.ink }}>
              <h4
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{ color: colors.white, fontFamily: fonts.display }}
              >
                Your Daxxify Moment, Black Friday Pricing
              </h4>
              <p className="mt-3 max-w-2xl mx-auto" style={{ color: '#D4D4D4', fontFamily: fonts.body }}>
                Experience Daxxify across your 3 key tox areas with our best pricing of the year. Book in November or
                lock in packages for 2026.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Daxxify Buy 2, Get 1 Free Deal
                </CTA>
                <p className="mt-2 text-[11px]" style={{ color: colors.muted, fontFamily: fonts.body }}>
                  Limited Black Friday / Cyber Monday offer. Once it&rsquo;s over, Daxxify returns to regular pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

DaxxifyBlackFridayPage.getLayout = (page) => page

/* ---------- Shared Components ---------- */
function CTA({ href, children, primary, dataAttr }) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 font-semibold min-h-[48px] touch-manipulation transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
  const cls = primary
    ? `${base} text-white w-full sm:w-auto shadow-lg group`
    : `${base} text-white/90 w-full sm:w-auto ring-1 ring-white/20 hover:bg-white/10 group`
  const style = primary
    ? { background: gradients.primary, borderRadius: '9999px', fontFamily: fonts.body }
    : { borderRadius: '9999px', fontFamily: fonts.body }
  return (
    <a href={href} data-book-loc={dataAttr} className={cls} style={style} rel="noopener">
      {children}
      {primary && <Arrow />}
    </a>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: colors.heading, fontFamily: fonts.display }}>{title}</h3>
      <div className="mt-3 sm:mt-4" style={{ fontFamily: fonts.body }}>{children}</div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2" style={{ fontFamily: fonts.body }}>
      <span className="mt-2 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.violet }} />
      <span>{children}</span>
    </li>
  )
}

function LI({ children }) {
  return (
    <li className="flex items-start gap-2" style={{ fontFamily: fonts.body }}>
      <span className="mt-2 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.violet, opacity: 0.6 }} />
      <span>{children}</span>
    </li>
  )
}

function StepCard({ step, title, copy }) {
  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm" style={{ border: `1px solid ${colors.stone}` }}>
      <div className="flex items-center gap-3">
        <div
          className="h-10 min-w-[86px] px-3 rounded-xl text-white font-bold text-[11px] sm:text-xs tracking-tight flex items-center justify-center whitespace-nowrap"
          style={{ background: gradients.primary, fontFamily: fonts.body }}
        >
          {step}
        </div>
        <h6 className="text-sm sm:text-base font-extrabold tracking-tight" style={{ color: colors.heading, fontFamily: fonts.display }}>{title}</h6>
      </div>
      <p className="mt-3 text-sm sm:text-base" style={{ color: colors.body, fontFamily: fonts.body }}>{copy}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 font-semibold flex items-center justify-between" style={{ fontFamily: fonts.body }}>
        <span className="text-sm sm:text-base" style={{ color: colors.heading }}>{q}</span>
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: colors.muted }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <div className="px-4 sm:px-6 pb-5 text-sm sm:text-base" style={{ color: colors.body, fontFamily: fonts.body }}>{a}</div>
    </details>
  )
}

function Arrow() {
  return (
    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  )
}
