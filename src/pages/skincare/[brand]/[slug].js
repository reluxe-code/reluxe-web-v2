// src/pages/skincare/[brand]/[slug].js
// Product detail page — DB-driven with full SEO

import Link from 'next/link'
import { useState } from 'react'
import BetaLayout from '@/components/beta/BetaLayout'
import GravityBookButton from '@/components/beta/GravityBookButton'
import ProductSEO from '@/components/seo/ProductSEO'
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens'
import { getServiceClient } from '@/lib/supabase'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

export async function getStaticPaths() {
  const db = getServiceClient()
  const { data } = await db
    .from('products')
    .select('slug, brands!inner(slug)')
    .eq('active', true)
  return {
    paths: (data || []).map(p => ({
      params: { brand: p.brands.slug, slug: p.slug },
    })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const db = getServiceClient()

  const { data: product } = await db
    .from('products')
    .select('*, brands(*)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!product || product.brands?.slug !== params.brand) {
    return { notFound: true }
  }

  // Related products from same brand
  const { data: related } = await db
    .from('products')
    .select('slug, name, short_description, image_url, price, purchase_url, purchase_type, is_bestseller')
    .eq('brand_id', product.brand_id)
    .eq('active', true)
    .neq('id', product.id)
    .order('sort_order')
    .limit(6)

  const { brands: brandData, ...productData } = product

  return {
    props: {
      product: productData,
      brand: brandData,
      related: related || [],
    },
    revalidate: 60,
  }
}

export default function ProductDetailPage({ product, brand, related }) {
  const p = product
  const b = brand
  const purchaseType = p.purchase_type || b.purchase_type || 'in_clinic'
  const canBuyOnline = purchaseType === 'affiliate' || purchaseType === 'direct'
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <>
      <ProductSEO product={p} brand={b} />
      <BetaLayout title={`${p.name} — ${b.name}`} description={p.short_description || p.description?.slice(0, 160)}>

        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
          <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '1.5rem', fontSize: '0.75rem', color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
              <Link href="/skincare" style={{ color: 'inherit', textDecoration: 'none' }}>Skincare</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <Link href={`/skincare/${b.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{b.name}</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: 'rgba(250,248,245,0.6)' }}>{p.name}</span>
            </nav>

            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                {p.image_url ? (
                  <div style={{ position: 'relative', aspectRatio: '1', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', backgroundColor: '#fff' }}>
                    <img src={p.image_url} alt={p.name} style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '2rem' }} />
                  </div>
                ) : (
                  <div style={{ aspectRatio: '1', width: '100%', borderRadius: '1.5rem', backgroundColor: colors.charcoal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: colors.muted, fontSize: '0.875rem', fontFamily: fonts.body }}>No image</span>
                  </div>
                )}
              </div>
              <div className="lg:col-span-7 order-1 lg:order-2">
                <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>{b.name}</p>
                <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginTop: '0.5rem' }}>
                  {p.name}
                </h1>
                {p.subtitle && (
                  <p style={{ marginTop: '0.5rem', fontSize: '1.125rem', fontWeight: 500, fontFamily: fonts.body, background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {p.subtitle}
                  </p>
                )}
                {p.price && (
                  <p style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 700, color: colors.white, fontFamily: fonts.body }}>
                    ${Number(p.price).toFixed(2)}
                  </p>
                )}
                <p className="product-description" style={{ fontFamily: fonts.body, fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', marginTop: '1rem', maxWidth: '36rem' }}>
                  {p.short_description || p.description?.slice(0, 200)}
                </p>

                {/* Badges */}
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {p.is_bestseller && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                      padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body,
                      backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)',
                    }}>
                      Bestseller
                    </span>
                  )}
                  {p.is_new && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                      padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body,
                      backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
                    }}>
                      New
                    </span>
                  )}
                  {!canBuyOnline && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                      padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: fonts.body,
                      backgroundColor: 'rgba(250,248,245,0.08)', color: 'rgba(250,248,245,0.6)',
                    }}>
                      In-Clinic Only
                    </span>
                  )}
                </div>

                {/* CTAs */}
                <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {canBuyOnline && p.purchase_url && (
                    <a
                      href={p.purchase_url}
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
            </div>
          </div>
        </section>

        {/* Colorescience Anniversary Sale Banner */}
        {b.slug === 'colorescience' && (
          <div style={{ padding: '1rem 1rem', background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)' }}>
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
              <div className="flex-1">
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#CF7155', fontFamily: fonts.body }}>Limited Time &middot; March 5&ndash;22</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.125rem', color: '#CF7155', fontStyle: 'italic', fontFamily: fonts.display }}>Anniversary Sale: 20% Off Sitewide + Free Shipping</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

            {/* Full description */}
            {p.description && (
              <section>
                <h2 style={{ fontFamily: fonts.display, ...typeScale.sectionHeading, color: colors.heading }}>About {p.name}</h2>
                <div className="product-description" style={{ marginTop: '1rem', color: colors.body, fontFamily: fonts.body, lineHeight: 1.625, whiteSpace: 'pre-line' }}>
                  {p.description}
                </div>
              </section>
            )}

            {/* Key Ingredients */}
            {p.key_ingredients?.length > 0 && (
              <section>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>Key Ingredients</h2>
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {p.key_ingredients.map(ing => (
                    <span key={ing} style={{
                      display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                      padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: fonts.body,
                      background: gradients.subtle, color: colors.violet, border: '1px solid rgba(124,58,237,0.15)',
                    }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* How to Use */}
            {p.how_to_use && (
              <section>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>How to Use</h2>
                <p className="product-how-to-use" style={{ marginTop: '1rem', color: colors.body, fontFamily: fonts.body, lineHeight: 1.625 }}>{p.how_to_use}</p>
              </section>
            )}

            {/* Pro Tip */}
            {p.pro_tip && (
              <div style={{
                borderRadius: '1rem', padding: '1.5rem',
                background: gradients.subtle, border: '1px solid rgba(124,58,237,0.15)',
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body, color: colors.violet, marginBottom: '0.25rem' }}>Pro Tip from Our Clinicians</p>
                <p style={{ color: colors.body, fontFamily: fonts.body, lineHeight: 1.625 }}>{p.pro_tip}</p>
              </div>
            )}

            {/* Skin Types & Concerns */}
            {(p.skin_types?.length > 0 || p.concerns?.length > 0) && (
              <section className="grid gap-8 md:grid-cols-2">
                {p.skin_types?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>Best For Skin Types</h3>
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {p.skin_types.map(t => (
                        <span key={t} style={{
                          display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                          padding: '0.375rem 0.75rem', fontSize: '0.875rem', fontFamily: fonts.body,
                          backgroundColor: colors.stone, color: colors.body, textTransform: 'capitalize',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {p.concerns?.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.heading }}>Targets</h3>
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {p.concerns.map(c => (
                        <span key={c} style={{
                          display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                          padding: '0.375rem 0.75rem', fontSize: '0.875rem', fontFamily: fonts.body,
                          backgroundColor: colors.stone, color: colors.body, textTransform: 'capitalize',
                        }}>
                          {c.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Staff Picks */}
            {p.staff_picks && Object.keys(p.staff_picks).length > 0 && (
              <section>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>Staff Pick</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {Object.entries(p.staff_picks).map(([location, reason]) => (
                    <div key={location} style={{
                      borderRadius: '1rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
                      padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body, color: colors.violet, textTransform: 'capitalize' }}>{location} Team</p>
                      <p style={{ marginTop: '0.25rem', color: colors.body, fontFamily: fonts.body }}>{reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Treatment Pairings */}
            {p.related_services?.length > 0 && (
              <section>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>Pairs Well With</h2>
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {p.related_services.map(slug => (
                    <Link
                      key={slug}
                      href={`/services/${slug}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                        padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: fonts.body,
                        backgroundColor: colors.stone, color: colors.body, textTransform: 'capitalize',
                        textDecoration: 'none',
                      }}
                    >
                      {slug.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {p.faq?.length > 0 && (
              <section className="product-faq">
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>Frequently Asked Questions</h2>
                <div style={{ marginTop: '1rem', borderRadius: '1rem', border: `1px solid ${colors.stone}`, overflow: 'hidden' }}>
                  {p.faq.map((item, i) => (
                    <div key={i} style={{ borderTop: i > 0 ? `1px solid ${colors.stone}` : 'none' }}>
                      <button
                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem 1.25rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: fonts.body, color: colors.heading }}>{item.q}</span>
                        <svg
                          style={{ width: '1rem', height: '1rem', color: colors.muted, transition: 'transform 0.2s', transform: faqOpen === i ? 'rotate(180deg)' : 'none', flexShrink: 0, marginLeft: '0.5rem' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {faqOpen === i && (
                        <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body, lineHeight: 1.625 }}>{item.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Products */}
            {related.length > 0 && (
              <section>
                <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.subhead.size, fontWeight: 700, color: colors.heading }}>More from {b.name}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map(r => {
                    const rType = r.purchase_type || b.purchase_type || 'in_clinic'
                    const rCanBuy = rType === 'affiliate' || rType === 'direct'
                    return (
                      <Link key={r.slug} href={`/skincare/${b.slug}/${r.slug}`} className="group" style={{ textDecoration: 'none' }}>
                        <div style={{
                          borderRadius: '1.5rem', border: `1px solid ${colors.stone}`, backgroundColor: '#fff',
                          padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'box-shadow 0.3s',
                        }}
                        className="hover:shadow-md"
                        >
                          <h4 style={{ fontFamily: fonts.display, fontWeight: 700, color: colors.heading }} className="group-hover:text-violet-600 transition-colors">{r.name}</h4>
                          {r.short_description && <p style={{ marginTop: '0.5rem', color: colors.body, fontSize: '0.875rem', fontFamily: fonts.body }}>{r.short_description}</p>}
                          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {r.is_bestseller && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', borderRadius: '9999px',
                                padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, fontFamily: fonts.body,
                                backgroundColor: 'rgba(245,158,11,0.1)', color: '#b45309',
                              }}>
                                Bestseller
                              </span>
                            )}
                            {rCanBuy ? (
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
                  })}
                </div>
              </section>
            )}

            {/* Back nav */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem' }}>
              <Link
                href={`/skincare/${b.slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '9999px', padding: '0.5rem 1rem',
                  fontFamily: fonts.body, fontWeight: 600,
                  border: `1px solid ${colors.taupe}`, color: colors.heading, textDecoration: 'none',
                }}
              >
                &larr; {b.name}
              </Link>
              <Link
                href="/skincare"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '9999px', padding: '0.5rem 1rem',
                  fontFamily: fonts.body, fontWeight: 600,
                  border: `1px solid ${colors.taupe}`, color: colors.heading, textDecoration: 'none',
                }}
              >
                All Brands
              </Link>
              <GravityBookButton fontKey={FONT_KEY} size="hero" />
            </div>
          </div>
        </main>
      </BetaLayout>
    </>
  )
}

ProductDetailPage.getLayout = (page) => page
