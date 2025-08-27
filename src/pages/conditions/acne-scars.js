import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function AcneScarsPage() {
    // Inside AcneScarsPage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/acne-scars`

    const faqs = [
    { q: 'What’s the best treatment for acne scars?', a: 'It depends on scar type. SkinPen microneedling and fractional lasers like Opus or ClearLift are highly effective for texture improvement.' },
    { q: 'Do facials really help with acne?', a: 'Yes. HydraFacial and Glo2Facial clear pores and reduce congestion, and pair well with medical treatments for best results.' },
    { q: 'How many sessions will I need?', a: 'Most patients see visible improvement in 3–6 treatments as collagen builds and discoloration fades.' },
    { q: 'Is there downtime?', a: 'Microneedling or laser can cause short-term redness. Most facials and light peels have minimal downtime.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Acne & Acne Scars', item: pageUrl },
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
        <title>Acne & Acne Scar Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers advanced acne and acne scar treatments including SkinPen microneedling, facials, chemical peels, IPL, and laser resurfacing."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/acne-scars" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Acne & Acne Scars</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Breakouts and scars can be frustrating, but they’re also treatable. At RELUXE Med Spa, we combine facials, medical-grade skincare, and advanced devices like SkinPen® and lasers to clear, smooth, and restore your skin.
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
                src="/images/conditions/acne-hero.jpg"
                alt="Acne scar treatment at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Understanding Acne & Scarring</h2>
        <p className="mt-4 text-neutral-700">
          Acne can be caused by clogged pores, bacteria, hormones, and inflammation. When breakouts damage skin, scars can form, leaving uneven texture and pigmentation. 
        </p>
        <p className="mt-4 text-neutral-700">
          The right treatment plan can reduce active acne, fade discoloration, and smooth scars, giving you clearer, healthier-looking skin.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Acne & Acne Scars</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="SkinPen® Microneedling"
              copy="Creates micro-injuries that stimulate collagen, smoothing acne scars and improving overall texture."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Chemical Peels"
              copy="Targets acne, reduces discoloration, and helps skin regenerate for a clearer, brighter look."
              image="/images/treatments/peel.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="IPL (Intense Pulsed Light)"
              copy="Fades post-acne redness and hyperpigmentation, evening out skin tone."
              image="/images/treatments/ipl.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Opus Plasma & ClearLift"
              copy="Fractional laser resurfacing for deeper acne scars and skin texture concerns."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Customized Facials"
              copy="HydraFacial®, Glo2Facial™, and acne facials designed to clear pores and prevent breakouts."
              image="/images/treatments/facial.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Medical-Grade Skincare"
              copy="Products from Skinbetter, SkinCeuticals, and Hydrinity help maintain results and control acne long-term."
              image="/images/treatments/skincare.jpg"
              href="/shop"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Acne Treatment
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Acne & Scar Treatment FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="What’s the best treatment for acne scars?"
            a="It depends on the type of scarring. SkinPen microneedling and fractional lasers like Opus or ClearLift are highly effective for texture improvement."
          />
          <FaqItem
            q="Do facials really help with acne?"
            a="Yes. Facials like HydraFacial and Glo2Facial clear pores, reduce congestion, and support skin health. They’re often combined with medical treatments for best results."
          />
          <FaqItem
            q="How many sessions will I need?"
            a="Most patients see visible improvement in 3–6 treatments. Results build as collagen develops and discoloration fades."
          />
          <FaqItem
            q="Is there downtime?"
            a="Mild redness after microneedling or laser is normal. Most facials and peels have little to no downtime."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Clear, Smooth, Confident Skin</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield specializes in acne and acne scar treatments with real results.  
          Book your consult today and start your journey to healthier skin.
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
