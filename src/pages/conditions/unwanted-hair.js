import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function UnwantedHairPage() {
    // Inside UnwantedHairPage()
    const baseUrl = 'https://reluxemedspa.com'
    const pageUrl = `${baseUrl}/conditions/unwanted-hair`

    const faqs = [
    { q: 'How many sessions will I need?', a: 'Most patients need 6–8 sessions spaced a few weeks apart for optimal reduction.' },
    { q: 'Is it permanent?', a: 'Laser hair removal delivers long-term reduction; many see permanent results with occasional maintenance.' },
    { q: 'Does it hurt?', a: 'It feels like quick snaps of a rubber band and is generally well tolerated.' },
    { q: 'Can all skin tones be treated?', a: 'Yes—RELUXE uses advanced laser systems designed to safely treat a wide range of skin tones.' },
    ]

    const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
        { '@type': 'ListItem', position: 3, name: 'Unwanted Hair', item: pageUrl },
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
        <title>Unwanted Hair Removal | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers advanced laser hair removal for smooth, lasting results. Treat areas like underarms, legs, back, chest, face, and more."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/unwanted-hair" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />


      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Unwanted Hair</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Shaving, waxing, and ingrown hairs don’t have to be part of your routine.  
              At RELUXE, our advanced laser hair removal delivers smooth, long-lasting results for all skin types.
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
                src="/images/conditions/lhr-hero.jpg"
                alt="Laser hair removal at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Choose Laser Hair Removal?</h2>
        <p className="mt-4 text-neutral-700">
          Traditional methods like shaving and waxing are temporary, time-consuming, and often cause irritation or ingrown hairs.  
          Laser hair removal offers a long-term solution by targeting follicles to prevent regrowth, leaving skin smooth and hair-free.
        </p>
        <p className="mt-4 text-neutral-700">
          At RELUXE, we use the latest laser technologies—safe for all skin tones—to permanently reduce unwanted hair on virtually any area of the body.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Popular Areas We Treat</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Underarms"
              copy="Quick, effective, and one of the most popular areas for both women and men."
              image="/images/treatments/underarms.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Legs"
              copy="Ditch the razor—full legs or partial areas treated with long-lasting results."
              image="/images/treatments/legs.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Back & Chest"
              copy="Smooth, clean results for men who want to reduce or remove back and chest hair."
              image="/images/treatments/back.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Bikini & Brazilian"
              copy="Customizable treatments for your comfort and preference—no more waxing pain."
              image="/images/treatments/bikini.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Face & Neck"
              copy="Safely reduce unwanted facial or neck hair while avoiding irritation from shaving."
              image="/images/treatments/face.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Arms & Hands"
              copy="Soft, smooth results for full arms, forearms, or small spots like hands and fingers."
              image="/images/treatments/arms.jpg"
              href="/services/laser"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Laser Hair Removal
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Laser Hair Removal FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="How many sessions will I need?"
            a="Most patients need 6–8 sessions spaced a few weeks apart for optimal, lasting results."
          />
          <FaqItem
            q="Is it permanent?"
            a="Laser hair removal provides long-term reduction. Many see permanent results, though occasional maintenance may be needed."
          />
          <FaqItem
            q="Does it hurt?"
            a="Most describe it as quick snaps of a rubber band. It’s well tolerated and much less painful than waxing."
          />
          <FaqItem
            q="Can all skin tones be treated?"
            a="Yes—RELUXE uses advanced laser systems designed for safe, effective treatments across a wide range of skin tones."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Smooth. Confident. Carefree.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield offers expert laser hair removal for men and women.  
          Book your consult today and say goodbye to razors and waxing.
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
