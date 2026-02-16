// pages/conditions/weight-loss-laxity-volume-loss.js
import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

const BOOK_URL = '/book/remodel'

// Small helper to render paired "Book" buttons with data-book-loc
function BookButtons({ className = '', size = 'md' }) {
  const baseBtn =
    'rounded-2xl font-semibold text-white shadow-lg transition bg-gradient-to-r from-violet-600 to-black hover:from-violet-500 hover:to-neutral-900'
  const pad = size === 'lg' ? 'px-6 py-3' : 'px-5 py-2.5'
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={BOOK_URL}
        data-book-loc="carmel"
        className={`${baseBtn} ${pad}`}
      >
        Book Carmel
      </a>
      <a
        href={BOOK_URL}
        data-book-loc="westfield"
        className={`${baseBtn} ${pad}`}
      >
        Book Westfield
      </a>
    </div>
  )
}

export default function WeightLossLaxityVolumeLossPage() {
  const baseUrl = 'https://reluxemedspa.com'
  const pageUrl = `${baseUrl}/conditions/weight-loss-laxity-volume-loss`

  // ----- FAQs -----
  const faqs = [
    { q: 'Why do weight loss and GLP-1s change the face?', a: 'Rapid fat reduction can deflate key facial fat pads (midface, temples, under-eye) while collagen and elastin decline. This combination can make skin appear lax and features less defined.' },
    { q: 'What treatments rebuild structure without looking “done”?', a: 'We pair collagen stimulators like Sculptra® with RF microneedling (Morpheus8) and strategic filler placement. The result: gradual, natural lift with immediate balancing where needed.' },
    { q: 'When should I start treatments during my GLP-1 journey?', a: 'We offer three pathways: Start (protect collagen early), Active (support firmness while losing), and Restore (rebuild volume post-loss). A consult helps pick the right phase for you.' },
    { q: 'How many sessions or vials will I need?', a: 'Most plans span 2–4 visits. Typical starting points: 1–3 Morpheus8 sessions, 2–4 vials of Sculptra® over several months, and 1–3 syringes of filler for contour balance.' },
    { q: 'Is there downtime?', a: 'Morpheus8 has 1–3 days of social downtime; Sculptra® and filler have minimal downtime (mild swelling or tenderness). We tailor your plan to events and schedule.' },
    { q: 'Do you offer this in Carmel and Westfield?', a: 'Yes. Our expert injectors and device specialists treat patients at both RELUXE Carmel and RELUXE Westfield with the same protocols and quality standards.' },
  ]

  // ----- Related articles (scroll cards) -----
  // Replace hrefs with your live blog slugs when ready
  const related = [
    {
      title: 'Ozempic Face: What It Is & How to Fix It',
      blurb: 'A clinical, natural approach to preserving your look during GLP-1 weight loss.',
      href: '/blog/ozempic-face-treatment-indiana',
    },
    {
      title: 'Sculptra® vs Filler: Which Builds Collagen?',
      blurb: 'Why biostimulators matter when fat pads change with weight loss.',
      href: '/blog/sculptra-vs-filler-collagen-guide',
    },
    {
      title: 'Morpheus8 for Post-Weight-Loss Skin Tightening',
      blurb: 'RF microneedling to firm, remodel, and refine texture.',
      href: '/blog/morpheus8-after-weight-loss',
    },
    {
      title: 'GLP-1 & Skin Health: A 3-Phase Game Plan',
      blurb: 'Start • Active • Restore — where do you fit today?',
      href: '/blog/glp1-skin-3-phase-plan',
    },
  ]

  // ----- JSON-LD -----
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'What We Treat', item: `${baseUrl}/conditions` },
      { '@type': 'ListItem', position: 3, name: 'Skin Laxity & Volume Loss from Weight Loss', item: pageUrl },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  // Service schema with local SEO emphasis for Carmel & Westfield
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTherapy',
    name: 'Skin Laxity & Volume Loss from Weight Loss Treatment',
    url: pageUrl,
    areaServed: [
      { '@type': 'City', name: 'Carmel' },
      { '@type': 'City', name: 'Westfield' },
      { '@type': 'AdministrativeArea', name: 'Hamilton County' },
      { '@type': 'State', name: 'Indiana' },
    ],
    medicalSpecialty: ['Dermatology', 'CosmeticSurgery'],
    provider: {
      '@type': 'MedicalClinic',
      name: 'RELUXE Med Spa',
      address: [
        { '@type': 'PostalAddress', addressLocality: 'Carmel', addressRegion: 'IN' },
        { '@type': 'PostalAddress', addressLocality: 'Westfield', addressRegion: 'IN' },
      ],
    },
    sameAs: [
      'https://reluxemedspa.com/services/sculptra',
      'https://reluxemedspa.com/services/morpheus8',
      'https://reluxemedspa.com/services/filler',
    ],
  }

  return (
    <>
      <Head>
        <title>Skin Laxity & Volume Loss from Weight Loss (GLP-1) | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="Losing weight with GLP-1s like Ozempic or Mounjaro? RELUXE Med Spa in Carmel & Westfield restores firmness and balanced volume with Sculptra®, Morpheus8, and expert filler."
        />
        <link rel="canonical" href={pageUrl} />
        <meta name="keywords" content="Ozempic face, GLP-1 face, weight loss volume loss, skin laxity after weight loss, Sculptra Carmel, Sculptra Westfield, Morpheus8 Carmel, Morpheus8 Westfield" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, faqLd, serviceLd]} />

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-widest uppercase text-neutral-400">Conditions • What We Treat</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Skin Laxity & Volume Loss from Weight Loss</h1>
            <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
              Weight loss — including GLP-1s like Ozempic®, Wegovy®, and Mounjaro® — can change facial fat pads and skin elasticity. 
              At RELUXE Carmel & Westfield, we restore structure and firmness with Sculptra®, Morpheus8, and precision filler so you keep the glow you earned.
            </p>
            {/* Replaced single Book button with location pair */}
            <BookButtons className="mt-8" size="lg" />
            <a href="/services" className="mt-3 inline-block px-6 py-3 rounded-2xl font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition">
              Explore Treatments
            </a>
            <p className="mt-4 text-sm text-neutral-400">Serving Hamilton County — Carmel & Westfield, Indiana.</p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
              <img
                src="/images/conditions/weight-loss-laxity-hero.jpg"
                alt="Post-weight-loss facial balancing and skin tightening at RELUXE Med Spa"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three-Phase Guidance */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold">Choose Your Phased Plan for Your Weight Loss Journey</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <PhaseCard
            title="Start: Protect & Prime"
            copy="Begin collagen support before visible loss. Sculptra® micro-dosing + skincare and a baseline Morpheus8 session set you up for success."
            list={['1 Morpheus8 session', '1–2 vials Sculptra® (micro-dose)', 'Medical-grade skincare']}
          />
          <PhaseCard
            title="Active: Firm While You Transform"
            copy="As the scale moves, keep skin tight and contours balanced with strategic RF remodeling and targeted filler."
            list={['2 Morpheus8 sessions', '2–3 vials Sculptra®', 'Facial balancing']}
          />
          <PhaseCard
            title="Restore: Rebuild & Refine"
            copy="After significant loss, restore harmony with collagen rebuilding plus artistically placed filler for a natural, refreshed look."
            list={['Morpheus8 or Opus combo', '3–4 vials Sculptra® (series)', '2–3 syringes filler (custom)']}
          />
        </div>
        {/* Replaced single CTA with paired location buttons */}
        <BookButtons className="mt-8" />
      </section>

      {/* Treatments Grid */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Most-Loved Treatments for Post-Weight-Loss Balance</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TreatmentCard
              title="Sculptra® (Biostimulator)"
              copy="Gradually restores collagen for a firmer, lifted look that lasts 18–24 months."
              image="/images/treatments/sculptra.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Morpheus8 RF Microneedling"
              copy="Deep remodeling to tighten skin and improve jawline, cheeks, and under-eye support."
              image="/images/treatments/morpheus8.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="Artistic Filler Balancing"
              copy="Precise contouring for temples, midface, chin, and jawline — natural, never overfilled."
              image="/images/treatments/filler.jpg"
              href="/services/injectables"
            />
            <TreatmentCard
              title="Opus Plasma / ClearLift"
              copy="Texture + tone perfection that complements tightening and volume strategies."
              image="/images/treatments/opus.jpg"
              href="/services/laser"
            />
            <TreatmentCard
              title="SkinPen® Microneedling"
              copy="Supports elasticity and texture as your weight changes; minimal downtime."
              image="/images/treatments/skinpen.jpg"
              href="/services/microneedling"
            />
            <TreatmentCard
              title="REMODEL by RELUXE™ Plan"
              copy="A packaged pathway for Start • Active • Restore — tailored in Carmel or Westfield."
              image="/images/treatments/facial-balance.jpg"
              href="/services"
            />
          </div>
          {/* Replaced single center CTA with paired location buttons */}
          <BookButtons className="mt-10 justify-center" />
        </div>
      </section>

      {/* Scrolling Related Articles */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-extrabold">Learn More About GLP-1 & Your Skin</h3>
          <Link href="/blog" className="text-violet-600 font-semibold">All Articles →</Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max pr-2 snap-x">
            {related.map((a) => (
              <article key={a.title} className="snap-start w-80 shrink-0 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                <h4 className="text-lg font-bold">{a.title}</h4>
                <p className="mt-2 text-neutral-600">{a.blurb}</p>
                <Link href={a.href} className="mt-3 inline-block text-violet-600 font-semibold">Read Article →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Block */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl border p-6">
            <h4 className="text-xl font-bold">RELUXE Med Spa — Carmel, IN</h4>
            <p className="mt-2 text-neutral-700">Skin laxity and volume-loss treatments, close to Clay Terrace and the Arts & Design District.</p>
            {/* Ensure the proper data attribute on the single-location link */}
            <a href={BOOK_URL} data-book-loc="carmel" className="mt-4 inline-block text-violet-600 font-semibold">Book Carmel →</a>
          </div>
          <div className="rounded-3xl border p-6">
            <h4 className="text-xl font-bold">RELUXE Med Spa — Westfield, IN</h4>
            <p className="mt-2 text-neutral-700">Post-weight-loss facial balancing near Grand Park and SR-32. Same protocols, same results.</p>
            {/* Ensure the proper data attribute on the single-location link */}
            <a href={BOOK_URL} data-book-loc="westfield" className="mt-4 inline-block text-violet-600 font-semibold">Book Westfield →</a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-extrabold text-center">FAQs: Weight Loss, GLP-1s & Your Skin</h3>
        <div className="mt-6 divide-y border rounded-3xl bg-white">
          {faqs.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-violet-600 via-fuchsia-500 to-neutral-900 py-16 px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">Lose the weight, keep the glow.</h2>
        <p className="mt-3 text-neutral-200 max-w-2xl mx-auto">
          Carmel & Westfield’s trusted plan for skin laxity and volume loss after weight loss. Start, support, and restore — with RELUXE.
        </p>
        {/* Replaced single Book Now with paired buttons centered */}
        <BookButtons className="mt-8 justify-center" size="lg" />
        <a href="/services" className="mt-3 inline-block px-6 py-3 rounded-2xl font-semibold text-white bg-black/40 ring-1 ring-white/20 hover:bg-black/50 transition">
          Explore Services
        </a>
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

function PhaseCard({ title, copy, list = [] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="mt-2 text-neutral-700">{copy}</p>
      {list.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-neutral-700">
          {list.map((i) => <li key={i}>{i}</li>)}
        </ul>
      )}
    </div>
  )
}