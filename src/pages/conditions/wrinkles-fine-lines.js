import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function WrinklesFineLinesPage() {
  const baseUrl = 'https://reluxemedspa.com'
  const pageUrl = `${baseUrl}/conditions/wrinkles-fine-lines`

  // Mirror the FAQs you render on the page:
  const faqs = [
    {
      q: 'How long do wrinkle treatments last?',
      a: 'Neurotoxins last 3–4 months, while fillers can last 6–18 months. Skin treatments like SkinPen and Morpheus8 build long-term collagen over time.'
    },
    {
      q: 'Will I look frozen after Botox or Jeuveau?',
      a: 'No—our approach is natural and conservative. You’ll look refreshed, not overdone.'
    },
    {
      q: 'What’s the best option for prevention?',
      a: 'Early use of neurotoxins combined with skincare (SPF + retinol) helps slow wrinkle formation.'
    },
    {
      q: 'Is there downtime?',
      a: 'Most injectable treatments have minimal downtime. Advanced lasers or microneedling may involve a few days of redness.'
    }
  ]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
      { '@type': 'ListItem', position: 3, name: 'Wrinkles & Fine Lines', item: pageUrl }
    ]
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(({ q, a }) => ({
      '@type': 'Question',
      'name': q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': a
      }
    }))
  }

  return (
    <>
      <Head>
        <title>Wrinkles & Fine Lines Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta name="description" content="RELUXE Med Spa offers Botox, Jeuveau, Dysport, Daxxify, fillers, SkinPen, Morpheus8, and laser treatments for wrinkles & fine lines in Carmel & Westfield." />
        <link rel="canonical" href={pageUrl} />
      </Head>

      {/* JSON-LD */}
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Wrinkles & Fine Lines</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Whether it’s forehead lines, crow’s feet, or frown lines, RELUXE Med Spa helps smooth and soften wrinkles with injectables, lasers, and advanced skin treatments. Natural results. No frozen looks.
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
                src="/images/conditions/wrinkles-hero.jpg"
                alt="Wrinkle treatment at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Wrinkles & Fine Lines Appear</h2>
        <p className="mt-4 text-neutral-700">
          Wrinkles are a natural part of aging, caused by repeated facial expressions, sun exposure, loss of collagen, and decreased skin elasticity. Fine lines often show up in the 20s and 30s, while deeper wrinkles become more common with age. 
        </p>
        <p className="mt-4 text-neutral-700">
          The good news: modern aesthetic treatments can smooth, soften, and even prevent wrinkles, keeping your look fresh, natural, and confident.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Wrinkles & Fine Lines</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Neurotoxins"
              copy="Botox®, Jeuveau®, Dysport®, and Daxxify® relax muscles to soften lines while keeping expressions natural."
              image="/images/treatments/tox.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Dermal Fillers"
              copy="Juvederm®, Restylane®, RHA®, and Versa® restore lost volume and smooth deeper wrinkles or folds."
              image="/images/treatments/filler.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Microneedling (SkinPen®)"
              copy="Boosts collagen production, improving skin texture and reducing fine lines over time."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Morpheus8"
              copy="Radiofrequency microneedling that tightens skin, smooths wrinkles, and stimulates collagen."
              image="/images/treatments/morpheus8.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Opus Plasma & ClearLift"
              copy="Fractional skin resurfacing for wrinkles, tone, and texture with minimal downtime."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="HydraFacial® & Glo2Facial™"
              copy="Hydration + exfoliation facials to keep skin smooth, plump, and glowing."
              image="/images/treatments/glo2facial.jpg"
              href="/services/facials"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Wrinkle Treatments
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Wrinkle Treatment FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="How long do wrinkle treatments last?"
            a="Neurotoxins last 3–4 months, while fillers can last 6–18 months. Skin treatments like SkinPen and Morpheus8 build long-term collagen over time."
          />
          <FaqItem
            q="Will I look frozen after Botox or Jeuveau?"
            a="No—our approach is natural and conservative. You’ll look refreshed, not overdone."
          />
          <FaqItem
            q="What’s the best option for prevention?"
            a="Early use of neurotoxins combined with skincare (SPF + retinol) helps slow wrinkle formation."
          />
          <FaqItem
            q="Is there downtime?"
            a="Most injectable treatments have minimal downtime. Advanced lasers or microneedling may involve a few days of redness."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Smooth. Natural. Confident.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          Discover wrinkle treatments at RELUXE Med Spa in Carmel & Westfield.  
          From Botox and fillers to advanced lasers—we’ll create a personalized plan for you.
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
