import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function SkinTexturePage() {
    // Inside SkinTexturePage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/skin-texture`

    const faqs = [
    { q: 'What’s the fastest way to improve skin texture?', a: 'HydraFacial or Glo2Facial give instant glow. For long-term change, SkinPen microneedling or Opus build collagen and refine texture.' },
    { q: 'How many treatments will I need?', a: 'Facials can be monthly. Microneedling and Opus typically need a series of 3–4 sessions for noticeable, lasting results.' },
    { q: 'Can skincare help uneven tone?', a: 'Yes. Retinol, vitamin C, and brightening agents maintain results and improve tone between visits.' },
    { q: 'Is there downtime?', a: 'Facials have no downtime. Microneedling causes mild redness for 1–2 days; Opus involves 3–5 days of healing.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Uneven Skin Tone & Texture', item: pageUrl },
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
        <title>Uneven Skin Tone & Texture Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers HydraFacial, Glo2Facial, SkinPen microneedling, chemical peels, and laser treatments for uneven skin tone and texture."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/skin-texture" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Uneven Skin Tone & Texture</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Dullness, roughness, enlarged pores, or blotchy skin? RELUXE Med Spa specializes in treatments like HydraFacial®, Glo2Facial™, SkinPen®, and resurfacing lasers to smooth and brighten your complexion.
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
                src="/images/conditions/skin-texture-hero.jpg"
                alt="Uneven skin tone treatment at RELUXE"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">What Causes Uneven Tone & Texture?</h2>
        <p className="mt-4 text-neutral-700">
          Uneven tone and texture can come from many factors: sun exposure, aging, acne, clogged pores, or lack of consistent exfoliation. Skin may look dull, rough, blotchy, or unevenly pigmented.
        </p>
        <p className="mt-4 text-neutral-700">
          At RELUXE, we design treatment plans that resurface, rehydrate, and renew your skin—revealing a smoother, more radiant complexion.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Tone & Texture</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="HydraFacial®"
              copy="Deep cleansing, exfoliation, hydration, and antioxidant infusion—an all-in-one reset for smoother skin."
              image="/images/treatments/hydrafacial.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Glo2Facial™"
              copy="Exfoliates and oxygenates skin at the same time, leaving a fresh, balanced glow."
              image="/images/treatments/glo2facial.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Microneedling (SkinPen®)"
              copy="Stimulates collagen, reduces pore size, and refines skin texture long term."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional resurfacing laser for more dramatic smoothing of fine lines and rough patches."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Chemical Peels"
              copy="Customizable exfoliation to brighten skin, reduce discoloration, and refine texture."
              image="/images/treatments/peel.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Medical-Grade Skincare"
              copy="Daily care with SkinBetter, SkinCeuticals, and Hydrinity maintains smoother tone between visits."
              image="/images/treatments/skincare.jpg"
              href="/shop"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Skin Renewal
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Tone & Texture FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="What’s the fastest way to improve skin texture?"
            a="HydraFacial or Glo2Facial give instant results. For long-term change, SkinPen microneedling or Opus resurfacing build collagen and refine skin."
          />
          <FaqItem
            q="How many treatments will I need?"
            a="Facials can be monthly maintenance. Microneedling and Opus usually require a series of 3–4 sessions for best results."
          />
          <FaqItem
            q="Can skincare help uneven tone?"
            a="Yes. Medical-grade products with retinol, vitamin C, and brightening agents maintain results and improve tone at home."
          />
          <FaqItem
            q="Is there downtime?"
            a="Facials have no downtime. Microneedling may cause mild redness for 1–2 days, while Opus involves 3–5 days of healing."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Smooth. Bright. Renewed.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers advanced treatments for uneven skin tone and texture.  
          Book your consult today and reveal your best skin yet.
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
