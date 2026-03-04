// pages/landing/bf-botox.js
// Black Friday Botox Deal — Buy 2 Areas, Get 1 Free (up to 64 units)

import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const BOOK_URL = '/book/tox'
const DEALS_URL = '/book/bf25-botox/'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function BotoxBlackFridayPage() {
  return (
    <BetaLayout
      title="Black Friday Botox Deal — Buy 2 Areas, Get 1 Free"
      description="Limited-time Black Friday Botox deal at RELUXE: Buy 2 areas, get 1 free for the look of 3 areas (up to 64 units) for $616. Book in November or buy up to 4 for 2026."
      canonical="https://reluxemedspa.com/landing/bf-botox"
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
              Black Friday Botox: Buy 2 Areas, Get 1 Free
            </h1>
            <p className="mt-3 text-base sm:text-lg leading-relaxed" style={{ fontFamily: fonts.body, color: '#D4D4D4' }}>
              Our most popular Botox&reg; deal of the year. Get the <strong>look of 3 areas</strong> for the price of 2 —
              forehead lines, frown lines (11s), and crow&rsquo;s feet — for just <strong>$616</strong> (up to 64 units).
              Best time to lock in smooth, natural results.
            </p>
            <ul className="mt-3 space-y-2" style={{ color: '#D4D4D4' }}>
              <LI>Buy 2 tox areas, get the 3rd area free — up to 64 units of Botox for $616.</LI>
              <LI>Must be used in a <strong>single appointment</strong> so we can dose correctly and see your true result.</LI>
              <LI>Perfect for forehead lines, 11s, and crow&rsquo;s feet — the classic &ldquo;Botox look of 3.&rdquo;</LI>
              <LI>Limited-time Black Friday / Cyber Monday pricing — <strong>best Botox deal of the year.</strong></LI>
            </ul>

            {/* CTAs */}
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
              <CTA href={BOOK_URL} primary>
                Book in November &bull; Pay at Your Visit
              </CTA>
              <CTA href={DEALS_URL}>
                Not Due Yet? Buy Now &amp; Use Through 2026
              </CTA>
              <CTA href={BOOK_URL} dataAttr="westfield">
                Book Westfield
              </CTA>
              <CTA href={BOOK_URL} dataAttr="carmel">
                Book Carmel
              </CTA>
            </div>

            <div className="mt-2 text-[11px]" style={{ color: colors.muted, fontFamily: fonts.body }}>
              Use by booking in November/early December, or <strong>buy up to 4 packages</strong> now to use at future
              visits through 2026.
            </div>
          </div>
        </div>
      </section>

      {/* How the deal works / Why 1 appointment */}
      <section className="relative py-12 sm:py-14" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-6">
            <Card title="How This Black Friday Botox Deal Works">
              <ul className="space-y-2" style={{ color: colors.body }}>
                <Bullet>Buy the look of 3 tox areas (forehead, 11s, crow&rsquo;s feet) for the price of 2.</Bullet>
                <Bullet>Up to 64 units of Botox are included for $616.</Bullet>
                <Bullet>Book in November and pay at your visit—no pre-payment required if you&rsquo;re due now.</Bullet>
                <Bullet>Not due yet? Lock in pricing by purchasing up to 4 packages to use through 2026.</Bullet>
              </ul>
            </Card>
          </div>
          <div className="lg:col-span-6">
            <Card title="Why All Units Are Used in One Appointment">
              <ul className="space-y-2" style={{ color: colors.body }}>
                <Bullet>
                  Using all units in a single visit lets your injector give you the <strong>right dose for your face</strong>,
                  instead of under-treating to stretch units.
                </Bullet>
                <Bullet>
                  You see how your muscles respond at a <strong>full, appropriate dose</strong>, which helps us fine-tune
                  future visits.
                </Bullet>
                <Bullet>
                  Keeps your result <strong>even and smooth</strong> across all three areas instead of patchy or staggered.
                </Bullet>
              </ul>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Botox &bull; Book or Buy Now
          </CTA>
          <p className="mt-2 text-xs" style={{ color: colors.muted, fontFamily: fonts.body }}>
            Good for Botox at either RELUXE location. Limited quantities; once Black Friday pricing is gone, it&rsquo;s gone.
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
            Simple visit. Full-tox result across your three most expressive areas.
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:gap-6 sm:grid-cols-3">
          <StepCard
            step="Day 0"
            title="Consult + Treatment"
            copy="We map your forehead, 11s, and crow's feet and use your Black Friday package in one visit (~30 minutes)."
          />
          <StepCard
            step="Days 2–7"
            title="Lines Soften"
            copy="Muscles relax, lines smooth, and makeup sits more evenly on the skin."
          />
          <StepCard
            step="Week 2+"
            title="Peak Result"
            copy="Enjoy a refreshed, smoothed look for ~3–4 months. Then decide if you want to use another locked-in deal."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Book Your Black Friday Botox Spot
          </CTA>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <h3
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
          style={{ color: colors.heading, fontFamily: fonts.display }}
        >
          Black Friday Botox Deal — FAQ
        </h3>
        <div className="mt-7 divide-y rounded-3xl bg-white" style={{ border: `1px solid ${colors.stone}`, divideColor: colors.stone }}>
          <FaqItem
            q="Do I have to pre-pay to get the deal?"
            a="If you're due now, you can simply book in November, mention the Black Friday Botox deal, and pay at your visit. If you're not due yet, you can pre-purchase up to 4 packages now to use through 2026."
          />
          <FaqItem
            q="Why do all units have to be used in one appointment?"
            a="Because Botox dosing is customized to your anatomy, using all units in one visit lets us treat you properly instead of stretching units between visits. You get a more accurate result and we can fine-tune future dosing from there."
          />
          <FaqItem
            q="Which areas are included?"
            a={'This special is designed for the classic \u201clook of 3\u201d: forehead lines, frown lines (11s), and crow\u2019s feet. Your injector will confirm that this is appropriate based on your goals and anatomy.'}
          />
          <FaqItem
            q="Can I share this deal with someone else?"
            a="No — each package is for a single patient. That helps us keep dosing safe, consistent, and tied to your chart."
          />
          <FaqItem
            q="How many can I buy?"
            a="You may purchase up to 4 packages per person at this Black Friday price. They can be used at future visits through 2026."
          />
          <FaqItem
            q="Is this really the best Botox pricing of the year?"
            a="Yes. Our Black Friday / Cyber Monday tox specials are the best pricing we offer all year and are only available for a limited time or while quantities last."
          />
        </div>
        <div className="mt-8 text-center">
          <CTA href={BOOK_URL} primary>
            Claim Black Friday Botox &bull; Book or Buy Now
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
                Your Three Core Botox Areas, One Black Friday Price
              </h4>
              <p className="mt-3 max-w-2xl mx-auto" style={{ color: '#D4D4D4', fontFamily: fonts.body }}>
                Smooth forehead lines, 11s, and crow&rsquo;s feet with our best Botox deal of the year. Book in November or
                buy now to use through 2026.
              </p>
              <div className="mt-6 sm:mt-8">
                <CTA href={BOOK_URL} primary>
                  Claim the Buy 2, Get 1 Free Botox Deal
                </CTA>
                <p className="mt-2 text-[11px]" style={{ color: colors.muted, fontFamily: fonts.body }}>
                  Limited-time Black Friday / Cyber Monday offer. Pricing and availability will not last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BetaLayout>
  )
}

BotoxBlackFridayPage.getLayout = (page) => page

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
