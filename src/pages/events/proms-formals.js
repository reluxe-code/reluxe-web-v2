import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function PromsFormalsPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Prom & Formal Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Prom and formal prep in Carmel & Westfield. Gentle facials, dermaplane, acne management, and glow treatments timed for the big night."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/proms-formals" />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 text-white">
              <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Prom & Formals</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Prom & Formal Prep in Carmel & Westfield
              </h1>
              <p className="mt-4 text-neutral-300 text-lg leading-relaxed">
                Look flawless for prom, homecoming, or your next formal. Our providers create safe, age-appropriate glow
                plans that work with your skin type and event date.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK_URL} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black">
                  Book Prom Glow
                </a>
                <a href="#timing" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15">
                  See Timing Guide
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-white/10">
                <img src="/images/events/prom.jpg" alt="Prom facial prep Carmel Westfield" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-center">Prom & Formal Timing Guide</h2>
        <p className="mt-3 text-neutral-600 text-center">Simple steps for clear, glowing skin that photographs beautifully.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="4–6 Weeks Before" items={['Consult & skin check', 'Begin gentle facials', 'Start acne plan if needed']} />
          <TimingCard when="2–3 Weeks Before" items={['HydraFacial® or Glo2Facial®', 'Dermaplane for smooth makeup', 'Gentle peel if skin tolerates']} />
          <TimingCard when="1 Week Before" items={['Signature facial + hydration boost', 'Hydrinity serums for radiance']} />
          <TimingCard when="Day Of" items={['Gentle cleanse + hydrate', 'No new products', 'Optional ice roller for de-puff']} />
        </div>
      </section>

      {/* Popular Services */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Popular Prom Services</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="HydraFacial®" copy="Hydration, clarity, and a glow that lasts through prom night." image="/images/treatments/hydrafacial.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane" copy="Removes peach fuzz and smooths texture for makeup perfection." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen® Microneedling" copy="Great for acne scars and texture—plan 4+ weeks ahead." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-extrabold text-center">Prom & Formal FAQs</h3>
        <div className="mt-8 divide-y divide-neutral-200 border border-neutral-200 rounded-3xl bg-white">
          <FaqItem q="How far out should I plan prom facials?" a="We recommend starting 4–6 weeks out for best results. HydraFacial or Glo2 can be done closer to the date." />
          <FaqItem q="Can you help with acne before prom?" a="Yes—our providers can create a treatment plan with facials, products, and light treatments to calm breakouts." />
          <FaqItem q="What’s safe the week of prom?" a="Stick with gentle facials, dermaplane, hydration boosts. Avoid anything with downtime or peeling skin." />
        </div>
      </section>

      {/* Sticky CTA */}
      {showStickyCta && (
        <div className="fixed bottom-3 inset-x-0 mx-auto w-full max-w-md bg-neutral-900/95 rounded-2xl px-3 py-3 md:hidden flex items-center justify-between text-white">
          <span className="font-semibold">Book Prom Glow</span>
          <a href={BOOK_URL} className="rounded-xl px-4 py-2 bg-violet-600">Book</a>
        </div>
      )}
    </>
  )
}

// --- Components ---
function TimingCard({ when, items }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-6">
      <h3 className="text-xl font-bold">{when}</h3>
      <ul className="mt-3 list-disc pl-5 text-neutral-700 space-y-1">
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  )
}

function ServiceCard({ title, copy, image, href }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <img src={image} alt={title} className="w-full aspect-[4/3] object-cover" />
      <div className="p-6">
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="mt-2 text-sm text-neutral-700">{copy}</p>
        <Link href={href} className="mt-3 inline-block text-violet-600 font-semibold">Book Now →</Link>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="group">
      <summary className="cursor-pointer px-6 py-4 font-semibold flex justify-between items-center">
        {q}
        <span className="text-neutral-400">+</span>
      </summary>
      <div className="px-6 pb-4 text-neutral-700">{a}</div>
    </details>
  )
}
