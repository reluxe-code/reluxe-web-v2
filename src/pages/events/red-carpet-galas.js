import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function RedCarpetGalasPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Red Carpet & Gala Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Carmel & Westfield gala and red carpet prep. Injectables, facials, dermaplane, and lasers timed perfectly for black-tie events."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/red-carpet-galas" />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold">Red Carpet & Gala Prep</h1>
          <p className="mt-4 text-neutral-300 text-lg">Step into the spotlight with flawless skin and confidence. Perfect for galas, charity balls, and black-tie events.</p>
          <div className="mt-6 flex gap-3">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-black font-semibold">Book Gala Glow</a>
            <a href="#timing" className="px-6 py-3 rounded-2xl ring-1 ring-white/20">See Timing Guide</a>
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">Gala Timing Guide</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="6–8 Weeks" items={['Plan tox & filler for subtle refinement', 'Series of facials for clarity']} />
          <TimingCard when="3–4 Weeks" items={['Laser/IPL or Opus resurfacing', 'Body contour touch-ups']} />
          <TimingCard when="1–2 Weeks" items={['HydraFacial or Glo2Facial', 'Dermaplane + light peel']} />
          <TimingCard when="2–3 Days" items={['Hydration boost', 'Massage for relaxation']} />
        </div>
      </section>

      {/* Services */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Popular Gala Services</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="Injectables" copy="Smooth fine lines and refresh expressions with Botox®, Jeuveau®, Dysport®, Daxxify®." image="/images/treatments/tox.jpg" href="/book/tox/" />
            <ServiceCard title="Laser Refinement" copy="Opus Plasma® and ClearLift even tone & texture before your big night." image="/images/treatments/ipl.jpg" href="/book/laser/" />
            <ServiceCard title="Glow Facials" copy="HydraFacial® and Glo2Facial® deliver hydration and radiance that photographs beautifully." image="/images/treatments/glo2facial.jpg" href="/book/glo2facial/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Gala Prep FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem q="How far out should I do filler?" a="We recommend 6–8 weeks before so everything looks settled and natural." />
          <FaqItem q="What’s the best week-of treatment?" a="HydraFacial or Glo2Facial + dermaplane is a no-downtime way to maximize glow." />
          <FaqItem q="Can you prep couples for a gala?" a="Yes—we create joint timelines for partners attending the same event." />
        </div>
      </section>

      {/* Sticky CTA */}
      {showStickyCta && <StickyCTA />}
    </>
  )
}

function TimingCard({ when, items }) {
  return (
    <div className="rounded-3xl border bg-white p-6">
      <h3 className="font-bold">{when}</h3>
      <ul className="list-disc pl-5 mt-2 text-sm text-neutral-700">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  )
}
function ServiceCard({ title, copy, image, href }) {
  return (
    <div className="rounded-3xl border bg-white overflow-hidden">
      <img src={image} alt={title} className="w-full aspect-[4/3] object-cover" />
      <div className="p-6">
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm mt-2">{copy}</p>
        <Link href={href} className="text-violet-600 font-semibold">Book Now →</Link>
      </div>
    </div>
  )
}
function FaqItem({ q, a }) {
  return <details className="px-6 py-4"><summary className="font-semibold">{q}</summary><p className="mt-2 text-neutral-700">{a}</p></details>
}
function StickyCTA() {
  return (
    <div className="fixed bottom-3 inset-x-0 mx-auto max-w-md bg-neutral-900 text-white px-4 py-3 rounded-2xl flex justify-between md:hidden">
      <span>Book Gala Glow</span>
      <a href={BOOK_URL} className="px-4 py-2 bg-violet-600 rounded-xl">Book</a>
    </div>
  )
}
