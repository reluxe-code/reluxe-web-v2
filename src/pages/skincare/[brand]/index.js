// src/pages/skincare/[brand]/index.js
// Brand hub page — DB-driven, replaces static brand pages

import Link from 'next/link'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import BrandSEO from '@/components/seo/BrandSEO'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { getServiceClient } from '@/lib/supabase'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export async function getStaticPaths() {
  const db = getServiceClient()
  const { data } = await db.from('brands').select('slug').eq('active', true)
  return {
    paths: (data || []).map(b => ({ params: { brand: b.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const db = getServiceClient()

  const { data: brand } = await db
    .from('brands')
    .select('*')
    .eq('slug', params.brand)
    .eq('active', true)
    .single()

  if (!brand) return { notFound: true }

  const { data: products } = await db
    .from('products')
    .select('slug, name, subtitle, short_description, image_url, price, purchase_url, purchase_type, is_bestseller, is_new, staff_picks, post_procedure, related_services, category')
    .eq('brand_id', brand.id)
    .eq('active', true)
    .order('sort_order')

  return {
    props: { brand, products: products || [] },
    revalidate: 60,
  }
}

export default function BrandHubPage({ brand, products }) {
  const b = brand
  const purchaseType = b.purchase_type
  const canBuyOnline = purchaseType === 'affiliate' || purchaseType === 'direct'
  const bestsellers = products.filter(p => p.is_bestseller)
  const allProducts = products

  // Collect staff picks by location
  const staffPicks = { westfield: [], carmel: [] }
  for (const p of products) {
    if (p.staff_picks?.westfield) staffPicks.westfield.push({ name: p.name, reason: p.staff_picks.westfield })
    if (p.staff_picks?.carmel) staffPicks.carmel.push({ name: p.name, reason: p.staff_picks.carmel })
  }

  return (
    <>
      <BrandSEO brand={b} products={products} />
      <BetaLayout title={b.name} description={b.description || b.tagline}>

        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
          <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
                  RELUXE &middot; Skincare
                </p>
                <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
                  {b.name}
                </h1>
                {b.description && (
                  <p className="brand-description" style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', marginTop: '1.5rem' }}>
                    {b.description}
                  </p>
                )}
                <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {canBuyOnline && b.affiliate_url && (
                    <a
                      href={b.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '9999px', padding: '0.75rem 1.5rem',
                        fontFamily: fonts.body, fontWeight: 600, fontSize: '0.9375rem',
                        color: '#fff', background: gradients.primary, textDecoration: 'none',
                      }}
                    >
                      Buy Online
                    </a>
                  )}
                  <GravityBookButton fontKey={FONT_KEY} size="hero" />
                </div>
              </div>
              <div className="lg:col-span-5">
                {b.hero_image ? (
                  <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <img src={b.hero_image} alt={`${b.name} products`} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  </div>
                ) : b.logo_url ? (
                  <div style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', backgroundColor: colors.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={b.logo_url} alt={b.name} style={{ height: '4rem', objectFit: 'contain' }} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Colorescience Anniversary Sale Banner */}
        {b.slug === 'colorescience' && (
          <div style={{ padding: '1.25rem 1rem', background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)' }}>
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
              <div className="flex-1">
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#CF7155', fontFamily: fonts.body }}>Limited Time &middot; March 5&ndash;22</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.125rem', color: '#CF7155', fontStyle: 'italic', fontFamily: fonts.display }}>Anniversary Sale: 20% Off Sitewide + Free Shipping</p>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body }}>No exclusions. Free gifts at $125+ and $250+.</p>
              </div>
              <a
                href="https://colorescience.com/reluxe-med-spa"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '9999px', padding: '0.625rem 1.5rem',
                  fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body,
                  color: '#fff', whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #CF7155, #B85A40)',
                  textDecoration: 'none',
                }}
              >
                Shop the Sale &rarr;
              </a>
            </div>
          </div>
        )}

        <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
          {/* Bestsellers */}
          {bestsellers.length > 0 && (
            <section>
              <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>Bestsellers</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bestsellers.map(p => (
                  <ProductCard key={p.slug} product={p} brand={b} />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          <section style={{ marginTop: bestsellers.length > 0 ? '3.5rem' : 0 }}>
            <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>
              {bestsellers.length > 0 ? `All ${b.name} Products` : `Top ${b.name} Products`}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allProducts.map(p => (
                <ProductCard key={p.slug} product={p} brand={b} />
              ))}
            </div>
          </section>

          {/* Staff Picks */}
          {(staffPicks.westfield.length > 0 || staffPicks.carmel.length > 0) && (
            <section style={{ marginTop: '3.5rem' }}>
              <div className="grid gap-8 md:grid-cols-2">
                {staffPicks.westfield.length > 0 && (
                  <StaffColumn title="Staff Picks — Westfield" items={staffPicks.westfield} />
                )}
                {staffPicks.carmel.length > 0 && (
                  <StaffColumn title="Staff Picks — Carmel" items={staffPicks.carmel} />
                )}
              </div>
            </section>
          )}

          {/* Back nav */}
          <div style={{ marginTop: '3.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link
              href="/skincare"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '9999px', padding: '0.5rem 1rem',
                fontFamily: fonts.body, fontWeight: 600,
                border: `1px solid ${colors.taupe}`, color: colors.heading, textDecoration: 'none',
              }}
            >
              &larr; Skincare Hub
            </Link>
            <GravityBookButton fontKey={FONT_KEY} size="hero" />
          </div>
        </main>
      </BetaLayout>
    </>
  )
}

BrandHubPage.getLayout = (page) => page

function ProductCard({ product: p, brand: b }) {
  const pType = p.purchase_type || b.purchase_type || 'in_clinic'
  const canBuy = pType === 'affiliate' || pType === 'direct'

  return (
    <Link href={`/skincare/${b.slug}/${p.slug}`} className="group" style={{ textDecoration: 'none' }}>
      <div style={{
        borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
        padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.3s',
      }}
      className="hover:shadow-md"
      >
        <h4 style={{ fontFamily: fonts.display, fontWeight: 700, color: colors.heading }} className="group-hover:text-violet-600 transition-colors">{p.name}</h4>
        {p.subtitle && <p style={{ fontSize: '0.875rem', color: colors.violet, marginTop: '0.125rem', fontFamily: fonts.body }}>{p.subtitle}</p>}
        {p.short_description && <p style={{ marginTop: '0.5rem', color: colors.body, fontSize: '0.875rem', fontFamily: fonts.body }}>{p.short_description}</p>}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {p.is_bestseller && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
              padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, fontFamily: fonts.body,
              backgroundColor: 'rgba(245,158,11,0.1)', color: '#b45309',
            }}>
              Bestseller
            </span>
          )}
          {p.is_new && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
              padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, fontFamily: fonts.body,
              backgroundColor: 'rgba(16,185,129,0.1)', color: '#047857',
            }}>
              New
            </span>
          )}
          {canBuy ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body, color: colors.violet }}>
              Shop Online &rarr;
            </span>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
              padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body,
              backgroundColor: colors.stone, color: colors.body,
            }}>
              In-Clinic Only
            </span>
          )}
        </div>
      </div>
    </Link>
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
        {items.map(it => (
          <li key={it.name} style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading }}>{it.name}</p>
            <p style={{ color: colors.body, fontSize: '0.875rem', fontFamily: fonts.body }}>{it.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
