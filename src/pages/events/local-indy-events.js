import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function LocalIndyEventsPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Zoobilation, Rev & Indy Event Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Indy’s biggest nights deserve perfect prep. RELUXE helps Carmel & Westfield clients get camera-ready for Zoobilation, Rev, and other high-profile events."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/local-indy-events" />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold">Zoobilation, Rev & Indy Event Prep</h1>
          <p className="mt-4 text-neutral-300 text-lg">Indy’s premier events deserve a glow plan. We account for long hours, summer heat, and plenty of photos.</p>
          <div className="mt-6 flex gap-3">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-black font-semibold">Book Indy Prep</a>
            <a href="#timing" className="px-6 py-3 rounded-2xl ring-1 ring-white/20">See Timing Guide</a>
          </div>
        </div>
      </section>

      {/* Timing Guide */}
      <section id="timing" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">Event Timing Guide</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="4–6 Weeks" items={['Tox session timed for event', 'Laser hair removal touch-ups', 'Microneedling for texture']} />
          <TimingCard when="2–3 Weeks" items={['HydraFacial®/Glo2Facial®', 'Body contour (EvolveX)', 'Gentle peel']} />
          <TimingCard when="5–7 Days" items={['Signature glow facial', 'Dermaplane', 'SPF-focused prep']} />
          <TimingCard when="Day Of" items={['Hydrate & rest', 'SPF + mineral touch-up', 'No new products']} />
        </div>
      </section>

      {/* Services */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Popular Indy Event Services</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="Glow Facials" copy="HydraFacial® + Glo2Facial® to fight humidity and long nights." image="/images/treatments/glo2facial.jpg" href="/book/glo2facial/" />
            <ServiceCard title="Injectables" copy="Botox®, Jeuveau®, Dysport®, Daxxify® to refine expressions." image="/images/treatments/tox.jpg" href="/book/tox/" />
            <ServiceCard title="Body Contouring" copy="EvolveX tones & tightens for form-fitting outfits." image="/images/treatments/evolvex.jpg" href="/book/body/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Indy Event FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem q="How do you prep for hot outdoor events?" a="We focus on hydration, SPF, and non-irritating treatments that hold up under heat and humidity." />
          <FaqItem q="What’s the go-to facial before Zoobilation?" a="HydraFacial or Glo2Facial within 1 week is our top pick for radiant, no-downtime results." />
          <FaqItem q="Can groups book together for Rev?" a="Yes—ask us about group facial or tox sessions for friends attending big Indy events together." />
        </div>
      </section>

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
      <span>Book Indy Glow</span>
      <a href={BOOK_URL} className="px-4 py-2 bg-violet-600 rounded-xl">Book</a>
    </div>
  )
}
