import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'
const HOH_CONTACT = '#services-hoh' // replace with House of Health URL when ready

export default function HouseOfHealthPage() {
  return (
    <>
      <Head>
        <title>RELUXE × House of Health | Whole-Self Aesthetics & Wellness in Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa partners with House of Health to deliver whole-self care—skin, body, energy, and confidence. Integrative wellness meets modern aesthetics."
        />
        <meta property="og:title" content="RELUXE × House of Health" />
        <meta
          property="og:description"
          content="A collaborative approach to skin and wellness. Treat the outside and the inside—for results that last."
        />
        <link rel="canonical" href="https://reluxemedspa.com/partners/house-of-health" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-18 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE Partnerships</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                RELUXE × House of Health
              </h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed max-w-2xl">
                Beauty is better with balance. Together with <span className="font-semibold">House of Health</span>, we
                pair modern aesthetics with integrative wellness—addressing skin, stress, energy, hormones, and
                recovery—so results look great and last.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BOOK_URL}
                  className="group inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
                >
                  Book with RELUXE
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/>
                  </svg>
                </a>
                <a
                  href={HOH_CONTACT}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
                >
                  Explore House of Health
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-400">
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Whole-self care</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Integrative wellness</span>
                <span className="px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10">Provider-led plans</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img
                  src="/images/partners/house-of-health-hero.jpg"
                  alt="RELUXE × House of Health partnership"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Aesthetics + wellness, thoughtfully combined.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We’re Partnering */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Why This Collaboration Works</h2>
          <p className="mt-4 text-neutral-700">
            Skin tells a story—from stress and sleep to nutrition and hormones. Our partnership blends RELUXE’s
            precision aesthetics with House of Health’s integrative approach for results that look natural and feel
            sustainable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Pillar title="Inside + Outside">
            We treat the canvas and the chemistry—combining skin treatments with lifestyle-driven wellness plans.
          </Pillar>
          <Pillar title="Personalized Plans">
            Collaborative consults lead to step-by-step roadmaps tailored to your goals, schedule, and budget.
          </Pillar>
          <Pillar title="Sustainable Results">
            When the root causes are addressed, your glow lasts longer—and maintenance gets easier.
          </Pillar>
        </div>
      </section>

      {/* Services: RELUXE + House of Health */}
      <section id="services" className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl font-extrabold tracking-tight">What We Do—Together</h3>
            <p className="mt-3 text-neutral-600">Pair best-in-class skin treatments with integrative wellness support.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* RELUXE side */}
            <ServiceCard
              title="Injectables"
              subtitle="Botox® • Dysport® • Daxxify® • Fillers"
              copy="Subtle, balanced enhancements for lines, lips, cheeks, and jawline."
              image="/images/partners/reluxe-injectables.jpg"
              href="/services/injectables"
            />
            <ServiceCard
              title="Advanced Skin"
              subtitle="Morpheus8 • Opus Plasma • ClearLift • SkinPen®"
              copy="Tighten, resurface, and refine tone and texture for lasting skin health."
              image="/images/partners/reluxe-skin.jpg"
              href="/services/laser"
            />
            <ServiceCard
              title="Facials & LHR"
              subtitle="HydraFacial® • Glo2Facial™ • Laser Hair Removal"
              copy="Monthly maintenance for clarity, glow, and smooth confidence."
              image="/images/partners/reluxe-facials.jpg"
              href="/services"
            />

            {/* House of Health side (keep generic—update as needed) */}
            <ServiceCard
              id="services-hoh"
              title="Nutrition & Coaching"
              subtitle="Habits • Metabolism • Gut Support"
              copy="Personalized guidance to fuel skin health, energy, and recovery."
              image="/images/partners/hoh-nutrition.jpg"
              href={HOH_CONTACT}
            />
            <ServiceCard
              title="Functional Testing"
              subtitle="Targeted Labs • Data-Driven Care"
              copy="Identify imbalances that impact skin, stress, sleep, and mood."
              image="/images/partners/hoh-labs.jpg"
              href={HOH_CONTACT}
            />
            <ServiceCard
              title="Recovery & Balance"
              subtitle="Stress • Sleep • Movement"
              copy="Simple, sustainable routines that help your results last longer."
              image="/images/partners/hoh-recovery.jpg"
              href={HOH_CONTACT}
            />
          </div>

          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book a RELUXE Consult
            </a>
          </div>
        </div>
      </section>

      {/* Signature Collab Programs */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">Signature Programs</h3>
          <p className="mt-3 text-neutral-600">Curated pathways that blend skin + wellness for noticeable, lasting change.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CollabCard
            title="Total Glow"
            copy="HydraFacial or Glo2Facial + tailored skincare; paired with nutrition and hydration strategy."
            bullets={['Monthly facials', 'At-home protocol', 'Energy & hydration focus']}
          />
          <CollabCard
            title="Skin & Wellness Reset"
            copy="Opus or Morpheus8 series with recovery, sleep, and stress coaching for collagen-friendly habits."
            bullets={['3–4 treatment series', 'Recovery roadmap', 'Sustainable maintenance']}
          />
          <CollabCard
            title="Acne: Inside-Out"
            copy="Clarity facials + medical-grade skincare supported by nutrition and habit coaching."
            bullets={['Pore & oil control', 'Trigger mapping', 'Long-term skin plan']}
          />
        </div>

        <div className="mt-10 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
            Start My Plan
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="text-3xl font-extrabold tracking-tight text-center">How It Works</h3>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Step num="01" title="Consults">
              Meet with RELUXE and House of Health—together we map goals, timelines, and budgets.
            </Step>
            <Step num="02" title="Plan">
              We combine treatments and wellness supports into a step-by-step schedule.
            </Step>
            <Step num="03" title="Treat">
              Precision services at RELUXE + practical wellness guidance you can actually follow.
            </Step>
            <Step num="04" title="Maintain">
              Simple check-ins, smart skincare, and sustainable habits keep results going.
            </Step>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Partnership FAQs</h4>
        <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem
            q="Can I book combined appointments?"
            a="Yes—start with a RELUXE consult and we’ll coordinate an aligned plan with House of Health. Some visits are same-day; others are sequenced for best outcomes."
          />
          <FaqItem
            q="Do I need lab work?"
            a="Not always. Functional testing is optional and considered when it may clarify root causes impacting skin, energy, or recovery."
          />
          <FaqItem
            q="Is this medical care?"
            a="RELUXE provides aesthetic services. House of Health provides wellness services. We collaborate to support your goals, and will refer to medical care when appropriate."
          />
          <FaqItem
            q="How does billing work?"
            a="Services are billed by each provider separately. We outline costs up front and help you sequence appointments efficiently."
          />
        </div>
        <div className="mt-8 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
            Book a RELUXE Consult
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 p-[1px]">
            <div className="rounded-3xl bg-neutral-950 px-8 py-12 text-center">
              <h5 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Whole-Self Care. Real-World Results.
              </h5>
              <p className="mt-3 text-neutral-300 max-w-2xl mx-auto">
                When aesthetics and wellness align, you feel it—in your skin, your energy, your confidence. Let’s build
                your plan together.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition">
                  Book with RELUXE
                </a>
                <a href={HOH_CONTACT} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-black/60 ring-1 ring-white/10 hover:bg-black/70 transition">
                  Explore House of Health
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* --- Components --- */
function Pillar({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <p className="mt-2 text-neutral-700">{children}</p>
    </div>
  )
}

function ServiceCard({ title, subtitle, copy, image, href, id }) {
  return (
    <div id={id} className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold tracking-tight">{title}</h4>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <p className="mt-3 text-neutral-700">{copy}</p>
        <div className="mt-5 flex items-center justify-between">
          <Link href={href} className="text-violet-700 hover:text-violet-600 font-semibold">Learn More →</Link>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 ring-1 ring-violet-200" />
        </div>
      </div>
    </div>
  )
}

function CollabCard({ title, copy, bullets = [] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
      {bullets.length > 0 && (
        <ul className="mt-4 space-y-2 text-neutral-700">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-violet-600" /> {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Step({ num, title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/15 to-fuchsia-500/15 ring-1 ring-violet-200 text-sm font-bold">{num}</span>
        <h5 className="text-base font-extrabold">{title}</h5>
      </div>
      <p className="mt-3 text-neutral-700">{children}</p>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-6 py-4 font-semibold flex items-center justify-between">
        <span>{q}</span>
        <svg className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/>
        </svg>
      </summary>
      <div className="px-6 pb-5 text-neutral-700">{a}</div>
    </details>
  )
}
