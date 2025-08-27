import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/'

export default function VolumeLossPage() {
    // Inside VolumeLossPage()
        const baseUrl = 'https://reluxemedspa.com'
        const pageUrl = `${baseUrl}/conditions/volume-loss`

        const faqs = [
        { q: 'How do I know if I need facial balancing?', a: 'If you notice hollow cheeks, thinning lips, or less jawline definition, a balancing plan can restore harmony and youthfulness.' },
        { q: 'Will I look overfilled?', a: 'No. RELUXE providers specialize in natural, proportional results—enhancing, not exaggerating.' },
        { q: 'How long do results last?', a: 'Fillers typically last 6–18 months, while Sculptra’s collagen stimulation can last 2+ years.' },
        { q: 'Can I combine treatments?', a: 'Yes. We often combine filler with skin tightening (e.g., Morpheus8) for comprehensive rejuvenation.' },
        ]

        const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
            { '@type': 'ListItem', position: 3, name: 'Volume Loss & Facial Balancing', item: pageUrl },
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
        <title>Volume Loss & Facial Balancing | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa in Carmel & Westfield offers dermal fillers, Sculptra, and facial balancing for cheeks, lips, jawline, and temples. Restore youthful volume with natural results."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions/volume-loss" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd]} />

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Volume Loss & Facial Balancing</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Cheeks feel flat? Jawline less defined? Lips thinner? These are signs of natural facial volume loss.  
              At RELUXE Med Spa, we use fillers, Sculptra®, and balancing techniques to restore harmony and youthfulness—without looking “done.”
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
                src="/images/conditions/volume-loss-hero.jpg"
                alt="Facial balancing and filler treatment at RELUXE"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About the Condition */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Why Facial Volume Loss Happens</h2>
        <p className="mt-4 text-neutral-700">
          As we age, we lose fat, bone, and collagen in the face. This leads to hollow cheeks, thinning lips, deeper folds, and less defined jawlines.  
          Weight loss and genetics can accelerate these changes, making the face appear tired or aged.
        </p>
        <p className="mt-4 text-neutral-700">
          Facial balancing restores harmony by strategically placing volume where it’s been lost—lifting, contouring, and refreshing your look while keeping it natural.
        </p>
      </section>

      {/* Treatments */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Treatments for Volume Loss & Balancing</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Dermal Fillers"
              copy="Juvederm®, Restylane®, RHA®, and Versa® restore fullness in cheeks, lips, jawline, and temples."
              image="/images/treatments/filler.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Sculptra®"
              copy="A collagen stimulator that gradually restores volume and skin thickness for natural, lasting results."
              image="/images/treatments/sculptra.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Lip Filler"
              copy="Enhance lip shape and volume while maintaining balance with surrounding features."
              image="/images/treatments/lips.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Jawline Contouring"
              copy="Filler can sharpen, lift, and define the jawline and chin for improved facial proportions."
              image="/images/treatments/jawline.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Upper Face Filler"
              copy="Adds structure and support where hollowing occurs, subtly lifting brows and midface."
              image="/images/treatments/upper.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Advanced Tech"
              copy="Morpheus8 and EvolveX complement injectables by tightening skin and enhancing contour."
              image="/images/treatments/morpheus8.jpg"
              href="/services/laser"
            />
          </div>
          <div className="mt-10 text-center">
            <a href={BOOK_URL} className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg hover:from-violet-500 hover:to-neutral-900 transition">
              Book Facial Balancing
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">Volume Loss & Balancing FAQs</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          <FaqItem
            q="How do I know if I need facial balancing?"
            a="If you’ve noticed hollow cheeks, a tired appearance, thinning lips, or less jawline definition, you may benefit from a balancing plan."
          />
          <FaqItem
            q="Will I look overfilled?"
            a="No—RELUXE providers specialize in natural, proportional results. We enhance, not exaggerate."
          />
          <FaqItem
            q="How long do results last?"
            a="Fillers typically last 6–18 months depending on the product and area. Sculptra stimulates collagen for up to 2+ years."
          />
          <FaqItem
            q="Can I combine treatments?"
            a="Yes. Facial balancing often blends filler with skin tightening devices like Morpheus8 for comprehensive rejuvenation."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Balanced. Youthful. Natural.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          RELUXE Med Spa in Carmel & Westfield specializes in facial balancing with fillers, Sculptra, and advanced devices.  
          Let us create a custom plan to restore harmony and confidence.
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
