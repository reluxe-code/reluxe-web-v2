import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function RosaceaPage() {
    // Inside RosaceaPage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/rosacea`

    const faqs = [
    { q: 'Can rosacea be cured?', a: 'There’s no permanent cure, but IPL, soothing facials, and targeted skincare can dramatically reduce symptoms.' },
    { q: 'What’s the best treatment for redness?', a: 'IPL is most effective for visible vessels and flushing; facials and skincare maintain results.' },
    { q: 'How many IPL sessions will I need?', a: 'Most patients benefit from 3–5 sessions, with maintenance as needed to control redness.' },
    { q: 'Does diet or lifestyle matter?', a: 'Yes—triggers like alcohol, spicy foods, heat, and stress can flare rosacea. We help identify and manage them.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Rosacea & Redness', item: pageUrl },
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
        <title>Rosacea & Redness Treatment | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers IPL, calming facials, and medical-grade skincare to reduce redness, flushing, and rosacea flare-ups."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/rosacea" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Rosacea & Redness</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Persistent flushing, redness, or visible vessels? RELUXE Med Spa offers customized solutions for rosacea and redness—using IPL, facials, and skincare to calm and restore balance.
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
                src="/images/conditions/rosacea-hero.jpg"
                alt="Rosacea treatment at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">What is Rosacea?</h2>
        <p className="mt-4 text-neutral-700">
          Rosacea is a common skin condition that causes redness, flushing, visible blood vessels, and sometimes breakouts.  
          It often flares with triggers like heat, stress, alcohol, and certain foods. While it can’t be “cured,” it can be managed effectively with the right treatments and skincare.
        </p>
        <p className="mt-4 text-neutral-700">
          RELUXE providers build customized plans to reduce redness, calm irritation, and restore skin confidence.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Rosacea & Redness</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="IPL (Intense Pulsed Light)"
              copy="Targets redness, flushing, and visible vessels to even skin tone."
              image="/images/treatments/ipl.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Calming Facials"
              copy="Soothing treatments like HydraFacial® and Glo2Facial™ designed to reduce irritation and hydrate."
              image="/images/treatments/facial.jpg"
              href="/services/facials"
            />
            <TreatmentCard
              title="Medical-Grade Skincare"
              copy="Products like SkinBetter Alto and Hydrinity reduce inflammation and strengthen the skin barrier."
              image="/images/treatments/skincare.jpg"
              href="/shop"
            />
            <TreatmentCard
              title="Opus Plasma"
              copy="Fractional resurfacing can help reduce chronic redness and improve skin resilience."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="SkinPen® Microneedling"
              copy="Supports healthier skin barrier function and reduces vascular flare-ups."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="Lifestyle & Care Plans"
              copy="RELUXE providers help you identify triggers and build long-term strategies to manage rosacea."
              image="/images/treatments/rosacea.jpg"
              href="/services"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Rosacea Treatment
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Rosacea & Redness FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="Can rosacea be cured?"
            a="There’s no permanent cure, but with proper treatments and skincare, symptoms can be dramatically reduced and controlled."
          />
          <FaqItem
            q="What’s the best treatment for redness?"
            a="IPL is the most effective for visible vessels and flushing, while facials and skincare help maintain results."
          />
          <FaqItem
            q="How many IPL sessions will I need?"
            a="Most patients need 3–5 sessions for best results, with maintenance treatments as needed."
          />
          <FaqItem
            q="Does diet or lifestyle matter?"
            a="Yes—common triggers include alcohol, spicy foods, heat, and stress. Identifying and managing triggers helps long-term control."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Calm. Clear. Confident.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers IPL, facials, and skincare to reduce rosacea and redness.  
          Book your consult today and let us help you regain skin confidence.
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
