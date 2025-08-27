import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function UnderEyePage() {
    // Inside UnderEyePage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/under-eye`

    const faqs = [
    { q: 'Is under-eye filler safe?', a: 'Yes—when performed by trained injectors. RELUXE prioritizes safety and natural tear trough results.' },
    { q: 'How long does filler last under the eyes?', a: 'Typically 9–18 months depending on product and individual metabolism.' },
    { q: 'Will filler make me look puffy?', a: 'We use conservative dosing to restore volume without puffiness or overfilling.' },
    { q: 'What’s the best option if I don’t want filler?', a: 'PRF, microneedling, and Opus resurfacing are excellent non-filler options for tone and texture.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Under-Eye Hollows & Dark Circles', item: pageUrl },
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
        <title>Under-Eye Hollows & Dark Circles | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield treats under-eye hollows and dark circles with tear trough filler, PRF, and advanced skincare for refreshed, natural results."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/under-eye" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Under-Eye Hollows & Dark Circles</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Tired of looking tired? Hollows and dark circles under the eyes are a common concern—but they’re also highly treatable.  
              RELUXE Med Spa uses fillers, PRF, and advanced skincare to brighten, smooth, and refresh your look.
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
                src="/images/conditions/dark-eyes-hero.jpg"
                alt="Under-eye filler and PRF at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Hollows & Dark Circles Happen</h2>
        <p className="mt-4 text-neutral-700">
          Genetics, aging, volume loss, and skin thinning all contribute to under-eye hollows and dark shadows.  
          Even with plenty of sleep, the area may still look tired or sunken.
        </p>
        <p className="mt-4 text-neutral-700">
          With modern injectables and regenerative treatments, we can restore volume, improve skin quality, and reduce discoloration for a refreshed look.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Under-Eye Hollows & Dark Circles</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Morpheus8 Undereye"
              copy="Tighten delicate skin around the eyes, smooth fine lines, and reduce crepiness while inducing collagen"
              image="/images/treatments/morpheus8.jpg"
              href="/services/m8"
            />
            <TreatmentCard
              title="PRP (Platelet-Rich Plasma)"
              copy="Uses your body’s own growth factors to improve skin thickness, circulation, and pigmentation."
              image="/images/treatments/prp.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="SkinPen® Microneedling"
              copy="Boosts collagen and strengthens under-eye skin, improving fine lines and texture."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional resurfacing to smooth crepey skin and brighten under-eye tone."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Medical-Grade Skincare"
              copy="SkinBetter EyeMax, Hydrinity, and brightening formulas support long-term results."
              image="/images/treatments/skincare.jpg"
              href="/shop"
            />
            <TreatmentCard
              title="Comprehensive Balancing"
              copy="Often, treating the cheeks and midface with filler helps lift shadows and improve eye area harmony."
              image="/images/treatments/balancing.jpg"
              href="/services/injectables"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Under-Eye Treatment
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Under-Eye Treatment FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="Is under-eye filler safe?"
            a="Yes—when performed by trained injectors. RELUXE providers are highly experienced with tear trough treatments, prioritizing safety and natural results."
          />
          <FaqItem
            q="How long does filler last under the eyes?"
            a="Typically 9–18 months, depending on the product used and your metabolism."
          />
          <FaqItem
            q="Will filler make me look puffy?"
            a="Our approach is conservative. We use just enough to restore volume without overfilling or creating puffiness."
          />
          <FaqItem
            q="What’s the best option if I don’t want filler?"
            a="PRF, microneedling, and Opus resurfacing are great non-filler options that improve skin and reduce dark circles naturally."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Bright. Rested. Refreshed.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield specializes in treating under-eye hollows and dark circles with safe, natural techniques.  
          Book a consult today and wake up your look.
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
