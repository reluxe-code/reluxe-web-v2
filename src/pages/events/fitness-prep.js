import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function FitnessPrepPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Fitness & Competition Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Fitness competition and photoshoot prep in Carmel & Westfield. EvolveX body contouring, laser hair removal, and skin-finish plans that showcase your hard work."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/fitness-prep" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Fitness & Competition</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Showcase Your Hard Work</h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                Dial in muscle tone, smooth skin, and a clean finish for stage, photos, or race day. Built around your
                training blocks and peak week.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">Book Fitness Plan</a>
                <a href="#timing" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15">Timing Guide</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                <img src="/images/treatments/fitness.jpg" alt="Fitness competition prep Carmel Westfield" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-neutral-200">Images represent service categories available at RELUXE.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Local SEO */}
          <div className="mt-6 text-sm text-neutral-400">
            Serving <strong>Carmel</strong>, <strong>Westfield</strong>, Zionsville, and North Indianapolis.
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Competition Timing Guide</h2>
          <p className="mt-3 text-neutral-600">Integrates with your training, nutrition, and peak week—no surprises.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard
            when="8–12 Weeks Out"
            items={[
              'EvolveX series for tone & tightening (1–2x/week schedules)',
              'Plan laser hair removal areas (bikini, legs, arms, back)',
              'Start SkinPen® or light laser for texture if needed',
            ]}
          />
          <TimingCard
            when="4–6 Weeks Out"
            items={[
              'Adjust EvolveX focus to stubborn zones',
              'HydraFacial® or Glo2Facial® to refine clarity',
              'Finalize product routine—no major changes later',
            ]}
          />
          <TimingCard
            when="1–2 Weeks Out"
            items={[
              'Dermaplane + gentle polish for smooth, even skin',
              'Hydrinity hydration so skin looks healthy under stage tan',
              'Massage for recovery (avoid deep work right before)',
            ]}
          />
          <TimingCard
            when="Peak Week / Final Days"
            items={[
              'Keep skincare simple—avoid actives/new products',
              'Hydration + rest; pack a simple touch-up kit',
              'Coordinate with tan/makeup guidelines for your federation',
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
            Start My Fitness Plan
          </a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Competition-Focused Services</h2>
            <p className="mt-3 text-neutral-600">Show definition, smooth the surface, and feel confident in every pose.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="EvolveX Body Contouring" subtitle="Tone & tighten" copy="Target abs, glutes, thighs, or arms with a series that complements training." image="/images/treatments/body.jpg" href="/book/body/" />
            <ServiceCard title="Laser Hair Removal" subtitle="Stage-ready finish" copy="Plan areas in advance for clean lines and low-maintenance grooming." image="/images/men/lhr.jpg" href="/book/lhr/" />
            <ServiceCard title="HydraFacial® / Glo2Facial®" subtitle="Clarity under lights" copy="Reduce dullness and enhance clarity so definition reads cleanly." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane + Polish" subtitle="Smooth canvas" copy="Even, soft texture that pairs well with tan and stage makeup." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen® Microneedling" subtitle="Texture & scars" copy="If you have runway, refine texture and scars before the big day." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
            <ServiceCard title="Massage Therapy" subtitle="Recovery & reset" copy="Support mobility and decrease stress as you peak." image="/images/treatments/massage.jpg" href="/book/massage/" />
          </div>

          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
              Book Competition Services
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Fitness Prep FAQs</h4>
        <div className="mt-8 divide-y divide-neutral-200 rounded-3xl border border-neutral-200 bg-white">
          <FaqItem q="How do treatments fit with my training schedule?" a="We’ll coordinate around heavy training blocks and deload weeks, keeping recovery in mind." />
          <FaqItem q="When should I stop trying new products?" a="At least 2–3 weeks before your event—stick with a simple, proven routine." />
          <FaqItem q="Can I do laser hair removal close to show day?" a="We’ll plan sessions well ahead; avoid last-minute treatments that could irritate skin before tan." />
        </div>

        <div className="mt-8 text-center">
          <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
            Book a Carmel/Westfield Consult
          </a>
        </div>
      </section>

      {/* Sticky CTA */}
      {showStickyCta && (
        <div className="fixed inset-x-0 bottom-3 z-50 mx-auto w-full max-w-md rounded-2xl bg-neutral-900/95 px-3 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Book Fitness Prep</p>
              <p className="text-[11px] text-neutral-400">Carmel & Westfield</p>
            </div>
            <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
              Book
            </a>
          </div>
        </div>
      )}
    </>
  )
}

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="p-6">
        <h3 className="text-xl font-bold tracking-tight">{when}</h3>
        <ul className="mt-3 list-disc pl-6 space-y-1 text-neutral-700">
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  )
}
function ServiceCard({ title, subtitle, copy, image, href }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-bold tracking-tight">{title}</h4>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <p className="mt-3 text-neutral-700">{copy}</p>
        <div className="mt-5 flex items-center justify-between">
          <a href={href} className="text-violet-700 hover:text-violet-600 font-semibold">Book Now →</a>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 ring-1 ring-violet-200" />
        </div>
      </div>
    </div>
  )
}
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)} className="group">
      <summary className="cursor-pointer list-none px-6 py-4 font-semibold flex items-center justify-between">
        <span>{q}</span>
        <svg className={`h-5 w-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
      </summary>
      <div className="px-6 pb-5 text-neutral-700">{a}</div>
    </details>
  )
}
