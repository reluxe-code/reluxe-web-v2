// pages/skincare/index.js
// Skincare hub — DB-driven with ISR
import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { getServiceClient } from '@/lib/supabase'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export async function getStaticProps() {
  const db = getServiceClient()

  const { data: brands } = await db
    .from('brands')
    .select('slug, name, tagline, logo_url, hero_image, affiliate_url, purchase_type')
    .eq('active', true)
    .order('sort_order')

  // Top products by sales_rank
  const { data: topProducts } = await db
    .from('products')
    .select('slug, name, short_description, purchase_url, purchase_type, is_bestseller, brand_id, brands!inner(slug, name, purchase_type, affiliate_url)')
    .eq('active', true)
    .eq('is_bestseller', true)
    .order('sales_rank')
    .limit(6)

  // Staff picks — products that have staff_picks data
  const { data: pickProducts } = await db
    .from('products')
    .select('name, staff_picks, brands!inner(name)')
    .eq('active', true)
    .not('staff_picks', 'is', null)

  // Build staff picks by location
  const staffPicks = { westfield: [], carmel: [] }
  for (const p of (pickProducts || [])) {
    if (p.staff_picks?.westfield && staffPicks.westfield.length < 3) {
      staffPicks.westfield.push({ name: p.name, brand: p.brands.name, reason: p.staff_picks.westfield })
    }
    if (p.staff_picks?.carmel && staffPicks.carmel.length < 3) {
      staffPicks.carmel.push({ name: p.name, brand: p.brands.name, reason: p.staff_picks.carmel })
    }
  }

  return {
    props: {
      brands: brands || [],
      topProducts: (topProducts || []).map(p => {
        const { brands, ...rest } = p
        return {
          ...rest,
          brandSlug: brands.slug,
          brandName: brands.name,
          brandPurchaseType: brands.purchase_type,
          brandAffiliateUrl: brands.affiliate_url,
        }
      }),
      staffPicks,
    },
    revalidate: 60,
  }
}

export default function SkincareHub({ brands, topProducts, staffPicks }) {
  return (
    <BetaLayout
      title="Medical-Grade Skincare in Carmel & Westfield, IN"
      description="RELUXE Med Spa offers medical-grade skincare in Carmel & Westfield: personalized routines for acne, melasma, rosacea, anti-aging, and texture. Shop skinbetter science & Colorescience online."
      canonical="https://reluxemedspa.com/skincare"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem' }}>
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                RELUXE &middot; Skincare
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                Medical-Grade{' '}
                <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Skincare.
                </span>
              </h1>
              <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                Great skin is a strategy. Our providers pair your goals with proven lines &mdash; skinbetter science, Colorescience, SkinCeuticals, Hydrinity, and Universkin &mdash; to reinforce in-clinic results.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <GravityBookButton fontKey={FONT_KEY} size="hero" />
                <Link
                  href="#brands"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9999px', padding: '0.75rem 1.5rem',
                    fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem',
                    color: 'rgba(250,248,245,0.8)',
                    border: '1px solid rgba(250,248,245,0.12)',
                    textDecoration: 'none',
                  }}
                >
                  Explore Brands
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                <img src="/images/brands/hero.jpg" alt="Medical-grade skincare at RELUXE" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorescience Anniversary Sale */}
      <section style={{ padding: '2rem 1rem', background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
          <div className="flex-1">
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#CF7155', fontFamily: fonts.body }}>Limited Time &middot; March 5&ndash;22</p>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, color: '#CF7155', fontStyle: 'italic', fontFamily: fonts.display, marginTop: '0.25rem' }}>Colorescience Anniversary Sale</h3>
            <p style={{ marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body }}>20% off sitewide &mdash; no exclusions. Free shipping on all orders. Free gifts at $125+ and $250+.</p>
          </div>
          <a
            href="https://colorescience.com/reluxe-med-spa"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '9999px', padding: '0.75rem 2rem',
              fontFamily: fonts.body, fontWeight: 600,
              color: '#fff', whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #CF7155, #B85A40)',
              textDecoration: 'none',
            }}
          >
            Shop the Sale &rarr;
          </a>
        </div>
      </section>

      {/* What we treat */}
      <section id="treat" style={{ padding: '4rem 1.5rem', maxWidth: '80rem', margin: '0 auto' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
            What We Treat with Skincare
          </h2>
          <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Daily routines that protect your investment and amplify results.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TreatCard title="Acne & Breakouts" copy="Reduce congestion, balance oil, and calm inflammation with evidence-based actives." />
          <TreatCard title="Pigmentation & Melasma" copy="Brighten and even tone with pigment modulators and daily mineral UV defense." />
          <TreatCard title="Redness & Rosacea" copy="Calm reactivity and reinforce the barrier for everyday comfort." />
          <TreatCard title="Aging & Fine Lines" copy="Retinoids, antioxidants, peptides, and growth factors — layered intelligently." />
          <TreatCard title="Texture & Pores" copy="Strategic exfoliation + barrier support to smooth and refine." />
          <TreatCard title="Post-Procedure Recovery" copy="Recovery-focused hydration that speeds healing after lasers or microneedling." />
        </div>
      </section>

      {/* Top Bestsellers */}
      {topProducts.length > 0 && (
        <section style={{ padding: '4rem 0', backgroundColor: colors.cream }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
              <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
                Top Skincare Bestsellers
              </h3>
              <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Updated by our Carmel & Westfield teams based on outcomes and re-purchases.</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topProducts.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our lines */}
      <section id="brands" style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              Professional Skincare Lines
            </h3>
            <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>Curated for results, compatibility, and elegance.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map(b => {
              const canBuy = b.purchase_type === 'affiliate' || b.purchase_type === 'direct'
              const ctas = []
              if (canBuy && b.affiliate_url) {
                ctas.push({ label: 'Buy Online', href: b.affiliate_url, primary: true })
              }
              ctas.push({ label: 'Learn More', href: `/skincare/${b.slug}`, primary: !canBuy })
              return (
                <BrandCard key={b.slug} slug={b.slug} logo={b.logo_url} heroImage={b.hero_image} title={b.name} copy={b.tagline} ctas={ctas} />
              )
            })}
          </div>
        </div>
      </section>

      {/* Staff Picks */}
      {(staffPicks.westfield.length > 0 || staffPicks.carmel.length > 0) && (
        <section style={{ padding: '4rem 0', backgroundColor: colors.cream }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
            <div className="grid gap-8 md:grid-cols-2">
              {staffPicks.westfield.length > 0 && <StaffColumn title="Staff Picks — Westfield" items={staffPicks.westfield} />}
              {staffPicks.carmel.length > 0 && <StaffColumn title="Staff Picks — Carmel" items={staffPicks.carmel} />}
            </div>
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
          </div>
        </section>
      )}
    </BetaLayout>
  )
}

SkincareHub.getLayout = (page) => page

// --- Components ---
function TreatCard({ title, copy }) {
  return (
    <div style={{
      borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
      padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <p style={{ marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body, lineHeight: 1.6 }}>{copy}</p>
    </div>
  )
}

function ProductCard({ product: p }) {
  const pType = p.purchase_type || p.brandPurchaseType || 'in_clinic'
  const canBuy = pType === 'affiliate' || pType === 'direct'
  const buyUrl = p.purchase_url || p.brandAffiliateUrl

  return (
    <div style={{
      borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
      padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <Link href={`/skincare/${p.brandSlug}/${p.slug}`} style={{ textDecoration: 'none' }}>
        <h4 style={{ fontFamily: fonts.display, fontWeight: 700, color: colors.heading }}>{p.name}</h4>
      </Link>
      <p style={{ fontSize: '0.875rem', color: colors.muted, fontFamily: fonts.body }}>{p.brandName}</p>
      {p.short_description && <p style={{ marginTop: '0.5rem', color: colors.body, fontFamily: fonts.body }}>{p.short_description}</p>}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {canBuy && buyUrl ? (
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '9999px', padding: '0.5rem 1rem',
              fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
              color: '#fff', background: gradients.primary, textDecoration: 'none',
            }}
          >
            Buy Online
          </a>
        ) : (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            borderRadius: '9999px', padding: '0.25rem 0.75rem',
            fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body,
            backgroundColor: colors.stone, color: colors.body,
          }}>
            In-Clinic Only
          </span>
        )}
        <Link href={`/skincare/${p.brandSlug}/${p.slug}`} style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body, color: colors.violet, textDecoration: 'none' }}>
          Details &rarr;
        </Link>
      </div>
    </div>
  )
}

const BRAND_HERO_IMAGES = {
  'skinbetter-science': '/images/brands/skinbetter-hero.png',
  skinbetter: '/images/brands/skinbetter-hero.png',
  colorescience: '/images/brands/colorscience-hero.png',
  skinceuticals: '/images/brands/skinceuticals-hero.jpg',
  hydrinity: '/images/brands/hydrinity-hero.jpg',
  universkin: '/images/brands/universkin-hero.jpg',
}

function BrandCard({ slug, logo, heroImage, title, copy, ctas = [] }) {
  const heroBg = heroImage || BRAND_HERO_IMAGES[slug] || null
  return (
    <div style={{
      overflow: 'hidden', borderRadius: '1.5rem', border: `1px solid ${colors.stone}`,
      backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.3s',
    }}
    className="group hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
    >
      <div style={{ position: 'relative', aspectRatio: '4/2', width: '100%', overflow: 'hidden', backgroundColor: colors.stone }}>
        {heroBg ? (
          <>
            <img src={heroBg} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {logo && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <img src={logo} alt={`${title} logo`} style={{ height: '2.5rem', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {logo && <img src={logo} alt={title} style={{ height: '2.5rem', objectFit: 'contain' }} />}
          </div>
        )}
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
        <p style={{ marginTop: '0.75rem', color: colors.body, fontFamily: fonts.body }}>{copy}</p>
        <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ctas.map((c, i) =>
            c.href ? (
              <a
                key={i}
                href={c.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '9999px', padding: '0.5rem 1rem',
                  fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
                  color: c.primary ? '#fff' : colors.heading,
                  background: c.primary ? gradients.primary : 'transparent',
                  border: c.primary ? 'none' : `1px solid ${colors.taupe}`,
                  textDecoration: 'none',
                }}
              >
                {c.label}
              </a>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

function StaffColumn({ title, items }) {
  return (
    <div style={{
      borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
      padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <h4 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>{title}</h4>
      <ul style={{ marginTop: '0.75rem', listStyle: 'none', padding: 0 }}>
        {items.map((it) => (
          <li key={it.name} style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>
              {it.name} <span style={{ color: colors.muted, fontWeight: 400 }}>&bull; {it.brand}</span>
            </p>
            <p style={{ color: colors.body, fontSize: '0.875rem', fontFamily: fonts.body }}>{it.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
