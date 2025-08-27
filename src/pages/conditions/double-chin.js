import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function DoubleChinPage() {
    // Inside DoubleChinPage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/double-chin`

    const faqs = [
    { q: 'Is double chin treatment permanent?', a: 'Kybella destroys fat cells permanently. EvolveX/Morpheus8 contour and tighten with periodic maintenance as needed.' },
    { q: 'How many sessions will I need?', a: 'Most patients need 3–6 EvolveX sessions or 2–4 Morpheus8 sessions. Kybella often requires 2–3 treatments.' },
    { q: 'Does it hurt?', a: 'Treatments are well tolerated. Expect warmth with EvolveX and temporary swelling/tenderness with Kybella.' },
    { q: 'Can I combine treatments?', a: 'Yes—fat reduction, skin tightening, and jawline filler balancing often deliver the best natural results.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Double Chin / Submental Fullness', item: pageUrl },
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
        <title>Double Chin & Submental Fullness | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield treats double chin and submental fullness with EvolveX, fillers, and contouring treatments for a defined jawline."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/double-chin" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Double Chin / Submental Fullness</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              A double chin or fullness under the jaw can make your face look less defined—no matter your weight.  
              At RELUXE, we use advanced technology and injectable techniques to sculpt, contour, and restore balance to your profile.
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
                src="/images/conditions/double-chin-hero.jpg"
                alt="Double chin treatment at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Submental Fullness Happens</h2>
        <p className="mt-4 text-neutral-700">
          A “double chin” isn’t always related to weight—it can be genetic, age-related, or due to skin laxity.  
          Fat deposits beneath the chin can create fullness that hides jawline definition and balance.
        </p>
        <p className="mt-4 text-neutral-700">
          The good news: modern med spa treatments can slim, tighten, and contour the area for a sharper, more youthful profile.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Double Chin / Submental Fullness</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="EvolveX"
              copy="Radiofrequency and EMS technology that reduces fat and tightens skin for jawline definition."
              image="/images/treatments/evolvex.jpg"
              href="/services/body"
            />
            <TreatmentCard
              title="Jawline Filler"
              copy="Strategically placed filler sharpens and balances the jawline, enhancing profile harmony."
              image="/images/treatments/jawline.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Morpheus8"
              copy="Tightens skin and improves laxity under the chin and jawline for a lifted look."
              image="/images/treatments/morpheus8.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional resurfacing can improve skin tightness and reduce mild laxity under the chin."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Comprehensive Balancing"
              copy="Often, treating cheeks, chin, or midface improves overall proportions and reduces the appearance of fullness."
              image="/images/treatments/balancing.jpg"
              href="/services/injectables"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Double Chin Treatment
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Double Chin FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="Is double chin treatment permanent?"
            a="Kybella destroys fat cells permanently, while EvolveX and Morpheus8 offer lasting contouring with maintenance as needed."
          />
          <FaqItem
            q="How many sessions will I need?"
            a="Most patients need 3–6 EvolveX sessions or 2–4 Morpheus8 sessions for optimal results. Kybella often requires 2–3 treatments."
          />
          <FaqItem
            q="Does it hurt?"
            a="Treatments are well tolerated. EvolveX feels like warming with muscle contractions, while Kybella involves mild swelling and tenderness that resolves in days."
          />
          <FaqItem
            q="Can I combine treatments?"
            a="Yes—combining fat reduction, skin tightening, and filler contouring often provides the best and most natural results."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Defined. Balanced. Confident.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers advanced treatments to reduce double chin fullness and sculpt the jawline.  
          Book your consult today to discover your best profile.
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
