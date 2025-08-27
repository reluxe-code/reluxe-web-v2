import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function SunDamagePage() {
    // Inside SunDamagePage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/sun-damage`

    const faqs = [
    { q: 'What’s the best treatment for sun spots?', a: 'IPL is highly effective for targeting sun spots and pigmentation, often paired with medical-grade skincare for maintenance.' },
    { q: 'How many sessions will I need?', a: 'Most patients need 3–5 IPL or Opus sessions spaced weeks apart for best results.' },
    { q: 'Will the spots come back?', a: 'Without sun protection, pigmentation can return. Daily SPF and periodic maintenance help keep skin clear.' },
    { q: 'Is there downtime?', a: 'IPL and ClearLift have minimal downtime; Opus or stronger peels may involve a few days of redness and flaking.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Sun Damage & Pigmentation', item: pageUrl },
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
        <title>Sun Damage & Pigmentation Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers IPL, Opus Plasma, chemical peels, and medical-grade skincare to treat sun damage, dark spots, and pigmentation."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/sun-damage" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Sun Damage & Pigmentation</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Dark spots, uneven skin tone, or visible sun damage? RELUXE Med Spa offers advanced treatments like IPL, laser resurfacing, and chemical peels to restore brighter, clearer skin.
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
                src="/images/conditions/sun-damage-hero.jpg"
                alt="Sun damage treatment at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Sun Damage & Pigmentation Happen</h2>
        <p className="mt-4 text-neutral-700">
          UV exposure, hormones, and aging can all cause pigmentation issues. These often appear as dark spots, freckles, melasma, or an overall uneven skin tone. 
        </p>
        <p className="mt-4 text-neutral-700">
          While sunscreen is the best prevention, once damage appears, professional treatments are needed to restore clarity and brightness to the skin.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Sun Damage & Pigmentation</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="IPL Photofacial"
              copy="Targets sun spots, redness, and pigmentation by using pulses of light to restore even tone."
              image="/images/treatments/ipl.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional skin resurfacing to smooth texture, fade discoloration, and rejuvenate skin tone."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="ClearLift"
              copy="Gentle laser that helps lift pigment and brighten skin with minimal downtime."
              image="/images/treatments/clearlift.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Chemical Peels"
              copy="Exfoliates damaged surface cells, helping fade dark spots and improve radiance."
              image="/images/treatments/peel.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Microneedling (SkinPen®)"
              copy="Stimulates collagen and helps fade post-inflammatory pigmentation from acne or sun."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Medical-Grade Skincare"
              copy="SkinBetter Science, SkinCeuticals, and Hydrinity formulas to prevent and treat pigmentation at home."
              image="/images/treatments/skincare.jpg"
              href="/shop"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Pigmentation Treatment
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Sun Damage & Pigmentation FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="What’s the best treatment for sun spots?"
            a="IPL is one of the most effective options for targeting sun spots and pigmentation, often combined with skincare for maintenance."
          />
          <FaqItem
            q="How many sessions will I need?"
            a="Most patients need 3–5 sessions of IPL or Opus spaced a few weeks apart for best results."
          />
          <FaqItem
            q="Will the spots come back?"
            a="Without sun protection, pigmentation can return. We recommend daily SPF and follow-up treatments as needed."
          />
          <FaqItem
            q="Is there downtime?"
            a="IPL and ClearLift have minimal downtime, while Opus or chemical peels may involve a few days of redness and flaking."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Bright. Clear. Confident.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers advanced treatments for sun damage, dark spots, and pigmentation.  
          Let us design a personalized plan to restore your glow.
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
