import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function GraduationPrepPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Graduation Prep | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="Graduation prep facials and skincare in Carmel & Westfield. Acne solutions, dermaplane, HydraFacial®, and glow treatments for grads."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/graduation-prep" />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold">Graduation Prep</h1>
          <p className="mt-4 text-lg text-neutral-300">Caps, gowns, and cameras—look your best with RELUXE’s acne-friendly, graduation-ready glow plans.</p>
          <div className="mt-6 flex gap-3">
            <a href={BOOK_URL} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-black rounded-2xl font-semibold">Book Grad Glow</a>
            <a href="#timing" className="px-6 py-3 ring-1 ring-white/20 rounded-2xl">See Timing Guide</a>
          </div>
        </div>
      </section>

      {/* Timing */}
      <section id="timing" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">Graduation Glow Timeline</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TimingCard when="4–6 Weeks" items={['Consult & skin review', 'Start acne facials if needed', 'Microneedling for scars (if time allows)']} />
          <TimingCard when="2–3 Weeks" items={['HydraFacial® or Glo2Facial®', 'Dermaplane for smoother skin']} />
          <TimingCard when="1 Week" items={['Signature facial + hydration boost', 'Product guidance for home care']} />
          <TimingCard when="Day Of" items={['Keep it simple—cleanse & moisturize', 'SPF for outdoor ceremonies']} />
        </div>
      </section>

      {/* Services */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Graduation Favorites</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard title="HydraFacial®" copy="Brightens, clears, and hydrates for graduation photos." image="/images/treatments/facials.jpg" href="/book/facials/" />
            <ServiceCard title="Dermaplane" copy="Creates a flawless canvas for makeup & photos." image="/images/treatments/dermaplane.jpg" href="/book/facials/" />
            <ServiceCard title="SkinPen®" copy="For those starting early—smooth acne scars & refine skin." image="/images/treatments/skinpen.jpg" href="/book/microneedling/" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Graduation FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem q="Can you help with acne before graduation?" a="Yes—we’ll create a custom plan with facials and medical-grade skincare for clear skin." />
          <FaqItem q="What’s safe if my graduation is in one week?" a="Stick with no-downtime facials like HydraFacial or dermaplane + hydration." />
          <FaqItem q="Do you prep both high school and college grads?" a="Yes—plans are age-appropriate and tailored for each client." />
        </div>
      </section>

      {showStickyCta && <StickyCTA />}
    </>
  )
}

function TimingCard({ when, items }) {
  return (
    <div className="bg-white border rounded-3xl p-6">
      <h3 className="font-bold">{when}</h3>
      <ul className="list-disc pl-5 mt-2">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    </div>
  )
}
function ServiceCard({ title, copy, image, href }) {
  return (
    <div className="bg-white border rounded-3xl overflow-hidden">
      <img src={image} alt={title} className="w-full aspect-[4/3] object-cover" />
      <div className="p-6">
        <h4 className="font-bold">{title}</h4>
        <p className="mt-2 text-sm">{copy}</p>
        <Link href={href} className="text-violet-600 font-semibold">Book Now →</Link>
      </div>
    </div>
  )
}
function FaqItem({ q, a }) {
  return <details className="px-6 py-4"><summary className="font-semibold">{q}</summary><p className="mt-2">{a}</p></details>
}
function StickyCTA() {
  return (
    <div className="fixed bottom-3 inset-x-0 max-w-md mx-auto bg-neutral-900 text-white px-4 py-3 rounded-2xl flex justify-between md:hidden">
      <span>Book Grad Glow</span>
      <a href={BOOK_URL} className="px-4 py-2 bg-violet-600 rounded-xl">Book</a>
    </div>
  )
}
