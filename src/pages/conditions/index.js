import Head from 'next/head'
import Link from 'next/link'
import HeaderTwo from '../../components/header/header-2'
import SeoJsonLd from '../../components/SeoJsonLd'

export default function ConditionsPage() {
  const baseUrl = 'https://reluxemedspa.com'
  const conditions = [
    {
      slug: 'wrinkles-fine-lines',
      title: 'Wrinkles & Fine Lines',
      copy: 'Smooth forehead lines, crow’s feet, and frown lines with injectables, microneedling, and skin resurfacing.',
      image: '/images/conditions/wrinkles-hero.jpg',
    },
    {
      slug: 'weight-loss-laxity-volume-loss',
      title: 'Skin Laxity & Volume Loss from Weight Loss',
      copy: 'Restore firmness and balanced volume after weight loss (GLP-1 included) with Sculptra®, Morpheus8, and precision filler in Carmel & Westfield.',
      image: '/images/conditions/weight-loss-laxity-hero.jpg',
    },
    {
      slug: 'volume-loss',
      title: 'Volume Loss & Facial Balancing',
      copy: 'Restore youthful contours with filler, Sculptra, and advanced balancing techniques.',
      image: '/images/conditions/volume-loss-hero.jpg',
    },
    {
      slug: 'acne-scars',
      title: 'Acne & Acne Scars',
      copy: 'Clear breakouts and refine texture with SkinPen®, facials, peels, and laser treatments.',
      image: '/images/conditions/acne-hero.jpg',
    },
    {
      slug: 'sun-damage',
      title: 'Sun Damage & Pigmentation',
      copy: 'Brighten uneven skin tone with IPL, chemical peels, and medical-grade skincare.',
      image: '/images/conditions/sun-damage-hero.jpg',
    },
    {
      slug: 'skin-texture',
      title: 'Uneven Skin Tone & Texture',
      copy: 'HydraFacial®, Glo2Facial™, and microneedling help restore smooth, radiant skin.',
      image: '/images/conditions/skin-texture-hero.jpg',
    },
    {
      slug: 'under-eye',
      title: 'Under-Eye Hollows & Dark Circles',
      copy: 'Tear trough filler, PRF, and targeted eye care reduce hollowness and tired appearance.',
      image: '/images/conditions/dark-eyes-hero.jpg',
    },
    {
      slug: 'double-chin',
      title: 'Double Chin / Submental Fullness',
      copy: 'Define your jawline with EvolveX, filler balancing, and fat-reduction treatments.',
      image: '/images/conditions/double-chin-hero.jpg',
    },
    {
      slug: 'loose-skin',
      title: 'Loose or Sagging Skin',
      copy: 'Morpheus8, Opus, and EvolveX tighten and lift for firmer, smoother results.',
      image: '/images/conditions/sagging-skin-hero.jpg',
    },
    {
      slug: 'unwanted-hair',
      title: 'Unwanted Hair',
      copy: 'Smooth, lasting results with laser hair removal in Carmel & Westfield.',
      image: '/images/conditions/lhr-hero.jpg',
    },
    {
      slug: 'rosacea',
      title: 'Rosacea & Redness',
      copy: 'Calm redness and irritation with IPL and customized skincare regimens.',
      image: '/images/conditions/rosacea-hero.jpg',
    },
  ]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'What We Treat',
        item: `${baseUrl}/conditions`
      }
    ]
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'What We Treat at RELUXE Med Spa',
    'itemListElement': conditions.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${baseUrl}/conditions/${c.slug}`,
      name: c.title
    }))
  }

  return (
    <>
      <Head>
        <title>What We Treat | Conditions We Treat | RELUXE Med Spa Carmel & Westfield</title>
        <meta
          name="description"
          content="RELUXE Med Spa treats wrinkles, fine lines, acne scars, sun damage, sagging skin, and more in Carmel & Westfield. Explore what we treat and the treatments that work."
        />
        <link rel="canonical" href="https://reluxemedspa.com/conditions" />
      </Head>
      <SeoJsonLd data={[breadcrumbLd, itemListLd]} />

      <HeaderTwo />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-neutral-400">RELUXE • Conditions</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">What We Treat</h1>
          <p className="mt-4 text-lg text-neutral-300 max-w-3xl mx-auto">
            Patients come to RELUXE with concerns like wrinkles, acne scars, sun damage, and more.  
            Our Carmel & Westfield teams create treatment plans that deliver natural results you’ll love.
          </p>
        </div>
      </section>

      {/* Conditions Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((c) => (
            <Link
              key={c.slug}
              href={`/conditions/${c.slug}`}
              className="group rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="mt-2 text-neutral-600">{c.copy}</p>
                <p className="mt-3 text-violet-600 font-semibold">Explore Treatments →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
