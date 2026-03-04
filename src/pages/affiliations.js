// pages/affiliations.js
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]
const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export default function AffiliationsPage() {
  const updated = 'August 26, 2025'

  const categories = [
    {
      title: 'Injectables & Fillers',
      desc: 'We partner with the world\u2019s most trusted pharmaceutical companies for neurotoxins and dermal fillers.',
      brands: [
        { name: 'Allergan', products: 'Botox\u00AE, Juvederm\u00AE' },
        { name: 'Galderma', products: 'Restylane\u00AE, Dysport\u00AE, Sculptra\u00AE' },
        { name: 'Evolus', products: 'Jeuveau\u00AE' },
        { name: 'Revance', products: 'Daxxify\u00AE, RHA\u00AE Collection' },
        { name: 'Revanesse', products: 'Versa\u00AE' },
      ],
    },
    {
      title: 'Devices & Lasers',
      desc: 'Our advanced platforms deliver industry-leading results in skin tightening, body contouring, and resurfacing.',
      brands: [
        { name: 'InMode', products: 'EvolveX, Morpheus8, Triton\u00AE, Solaria CO\u2082' },
        { name: 'Alma', products: 'Harmony XL Pro, Opus Plasma\u00AE' },
        { name: 'SkinPen', products: 'Microneedling \u2014 FDA-cleared device' },
      ],
    },
    {
      title: 'Professional Skincare',
      desc: 'We carry medical-grade skincare lines proven through science, research, and clinical results.',
      brands: [
        { name: 'Skinbetter Science', products: 'Award-winning anti-aging skincare' },
        { name: 'Colorescience', products: 'Mineral sunscreens & corrective skincare' },
        { name: 'SkinCeuticals', products: 'Antioxidants, corrective serums, peels' },
        { name: 'Universkin', products: 'Customizable prescriptive skincare' },
        { name: 'Hydrinity', products: 'Hydration-focused repair & recovery formulas' },
      ],
    },
  ]

  return (
    <BetaLayout
      title="Professional Affiliations"
      description="RELUXE Med Spa proudly partners with trusted medical and skincare brands including Allergan, Galderma, Evolus, InMode, Alma, Skinbetter Science, and more."
      canonical="https://www.reluxemedspa.com/affiliations"
    >
      {/* Hero */}
      <header
        style={{
          backgroundColor: colors.ink,
          backgroundImage: `${grain}, radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.15), transparent 60%)`,
          borderBottom: `1px solid ${colors.stone}`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.hero.size,
              fontWeight: typeScale.hero.weight,
              lineHeight: typeScale.hero.lineHeight,
              color: colors.white,
            }}
          >
            Professional{' '}
            <span
              style={{
                background: gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Affiliations
            </span>
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: '1.125rem', color: 'rgba(250,248,245,0.7)', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '1rem' }}>
            At RELUXE Med Spa, we only use trusted products, devices, and skincare lines from
            globally recognized brands. Our affiliations ensure patients receive the safest,
            most effective, and clinically proven treatments available.
          </p>
          <div style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted, marginTop: '0.75rem' }}>
            <strong>Last Updated:</strong> {updated}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {categories.map((cat) => (
          <section key={cat.title}>
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              {cat.title}
            </h2>
            <p style={{ fontFamily: fonts.body, color: colors.body, marginTop: '0.5rem' }}>{cat.desc}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.brands.map((brand) => (
                <div
                  key={brand.name}
                  className="rounded-2xl bg-white shadow-sm p-6 hover:shadow-md transition"
                  style={{ border: `1px solid ${colors.stone}` }}
                >
                  <div className="h-12 flex items-center justify-center mb-4" style={{ borderBottom: `1px solid ${colors.stone}`, color: colors.muted }}>
                    <span style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600 }}>{brand.name}</span>
                  </div>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body }}>{brand.products}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </BetaLayout>
  )
}

AffiliationsPage.getLayout = (page) => page
