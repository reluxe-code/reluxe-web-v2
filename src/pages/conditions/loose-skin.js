import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function LooseSkinPage() {
    // Inside LooseSkinPage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/loose-skin`

    const faqs = [
    { q: 'What’s the best treatment for sagging skin?', a: 'Morpheus8 and EvolveX are our most powerful options; Opus and ClearLift complement by resurfacing and stimulating collagen.' },
    { q: 'How many sessions will I need?', a: 'You may see improvement after 1 session, but 3–4 sessions spaced weeks apart provide the most noticeable results.' },
    { q: 'How long do results last?', a: 'Collagen-stimulating treatments can last 1–2 years with periodic maintenance.' },
    { q: 'Is it painful?', a: 'Treatments are well tolerated with numbing; you may feel heat or tingling with minimal downtime.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Loose or Sagging Skin', item: pageUrl },
    ],
    }

    const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }})),
    }

  return (
    <>
      <Head>
        <title>Loose or Sagging Skin Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers Morpheus8, EvolveX, Opus Plasma, and advanced facials for tightening and lifting loose or sagging skin."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/loose-skin" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Loose or Sagging Skin</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Skin laxity happens to everyone with age. At RELUXE, we restore firmness with Morpheus8, EvolveX, Opus Plasma, and advanced facials—tightening and lifting without surgery.
            </p>
            <div className="mt-8 flex gap-3">
              <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
                Book a Consult
              </a>
              <a href="/services" className="px-6 py-3 rounded-2xl font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">
                Explore Services
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
              <img
                src="/images/conditions/sagging-skin-hero.jpg"
                alt="Skin tightening with Morpheus8 at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Skin Starts to Sag</h2>
        <p className="mt-4 text-neutral-700">
          With age, our bodies produce less collagen and elastin. The skin loses firmness, resulting in sagging around the jawline, neck, eyelids, and midface.  
          Genetics, sun exposure, and weight loss can accelerate this process.
        </p>
        <p className="mt-4 text-neutral-700">
          Non-surgical treatments now make it possible to lift, tighten, and stimulate collagen—without invasive surgery or long downtime.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Loose or Sagging Skin</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Morpheus8"
              copy="Radiofrequency microneedling that tightens skin and stimulates deep collagen remodeling."
              image="/images/treatments/morpheus8.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="EvolveX"
              copy="RF energy plus muscle stimulation firms skin and improves contour, especially on jawline and body."
              image="/images/treatments/evolvex.jpg"
              href="/services/body"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional plasma resurfacing smooths wrinkles, lifts laxity, and improves texture."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="ClearLift"
              copy="Gentle laser technology to stimulate collagen and tighten skin with no downtime."
              image="/images/treatments/clearlift.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="SkinPen® Microneedling"
              copy="Boosts collagen naturally to improve elasticity and reduce early signs of laxity."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Comprehensive Plans"
              copy="RELUXE providers design custom plans blending injectables, energy devices, and skincare for full-face results."
              image="/images/treatments/facial-balance.jpg"
              href="/services"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Skin Tightening
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Loose Skin FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="What’s the best treatment for sagging skin?"
            a="Morpheus8 and EvolveX are our most powerful options. Opus and ClearLift complement by resurfacing and stimulating collagen."
          />
          <FaqItem
            q="How many sessions will I need?"
            a="Most patients see improvement after 1 session, but 3–4 sessions spaced weeks apart achieve the most noticeable, lasting results."
          />
          <FaqItem
            q="How long do results last?"
            a="Collagen-stimulating treatments can last 1–2 years, with maintenance to keep skin firm as you age."
          />
          <FaqItem
            q="Is it painful?"
            a="Treatments are well tolerated with numbing. You may feel heat or tingling, but downtime is typically minimal."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Tighter. Firmer. Younger.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers the latest skin tightening technologies for loose or sagging skin.  
          Book a consult today and lift your confidence.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-white/20 ring-1 ring-white/30 hover:bg-white/30 transition">
            Book Now
          </a>
          <a href="/services" className="px-6 py-3 rounded-2xl font-semibold text-white bg-black/40 ring-1 ring-white/20 hover:bg-black/50 transition">
            Explore Services
          </a>
        </div>
      </section>
    </>
  )
}

// --- Components ---
function TreatmentCard({ title, copy, image, href }) {
  return (
    <div className="group rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="mt-2 text-neutral-600">{copy}</p>
        <Link href={href} className="text-violet-600 font-semibold">Learn More →</Link>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  return (
    <details className="px-6 py-4">
      <summary className="cursor-pointer font-semibold">{q}</summary>
      <p className="mt-2 text-neutral-700">{a}</p>
    </details>
  )
}
