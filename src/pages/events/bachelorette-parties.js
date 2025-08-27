import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeaderTwo from '../../components/header/header-2'

const BOOK_URL = '/book/'

export default function BachelorettePartiesPage() {
  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Head>
        <title>Bachelorette Parties | Carmel & Westfield | RELUXE Med Spa</title>
        <meta
          name="description"
          content="RELUXE hosts bachelorette party spa packages in Carmel & Westfield. Group facials, tox parties, glow sessions, and private events."
        />
        <link rel="canonical" href="https://reluxemedspa.com/events/bachelorette-parties" />
      </Head>
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold">Bachelorette Party Packages</h1>
          <p className="mt-4 text-neutral-300 text-lg">Celebrate in style with private spa experiences. Perfect for bridesmaids, friends, and unforgettable nights.</p>
          <div className="mt-6 flex gap-3">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-black font-semibold">Book a Party</a>
            <a href="#options" className="px-6 py-3 rounded-2xl ring-1 ring-white/20">See Options</a>
          </div>
        </div>
      </section>

      {/* Options */}
      <section id="options" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center">Party Options</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard title="Group Facials" copy="Signature facials, Glo2, or HydraFacials for the whole group." image="/images/treatments/hydrafacial.jpg" href="/book/facials/" />
          <ServiceCard title="Tox Parties" copy="Botox®, Jeuveau®, Dysport® mini sessions in a fun, private setting." image="/images/treatments/tox.jpg" href="/book/tox/" />
          <ServiceCard title="Massage Add-ons" copy="Relax before the big night with group massage packages." image="/images/treatments/massage.jpg" href="/book/massage/" />
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Bachelorette Party FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem q="Can you host private parties?" a="Yes—we host private events at both Carmel and Westfield with customized services." />
          <FaqItem q="Do you offer group discounts?" a="Yes, group bundles and packages are available for parties." />
          <FaqItem q="What’s the most popular option?" a="Glow facials + tox mini-sessions are our most requested party combo." />
        </div>
      </section>

      {showStickyCta && <StickyCTA />}
    </>
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
      <span>Book Party Glow</span>
      <a href={BOOK_URL} className="px-4 py-2 bg-violet-600 rounded-xl">Book</a>
    </div>
  )
}
