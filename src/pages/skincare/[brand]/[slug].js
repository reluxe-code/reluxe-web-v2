// src/pages/skincare/[brand]/[slug].js
// Product detail page — DB-driven with full SEO

import Link from 'next/link'
import { useState } from 'react'
import HeaderTwo from '@/components/header/header-2'
import ProductSEO from '@/components/seo/ProductSEO'
import { getServiceClient } from '@/lib/supabase'

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
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-xs text-white/50">
            <Link href="/skincare" className="hover:text-white/80">Skincare</Link>
            <span className="mx-2">/</span>
            <Link href={`/skincare/${b.slug}`} className="hover:text-white/80">{b.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{p.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              {p.image_url ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl bg-white">
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-8" />
                </div>
              ) : (
                <div className="aspect-square w-full rounded-3xl bg-neutral-800 flex items-center justify-center">
                  <span className="text-neutral-500 text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <p className="text-[11px] tracking-widest uppercase text-white/60">{b.name}</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{p.name}</h1>
              {p.subtitle && <p className="mt-2 text-lg text-violet-300 font-medium">{p.subtitle}</p>}
              {p.price && (
                <p className="mt-3 text-2xl font-bold text-white">${Number(p.price).toFixed(2)}</p>
              )}
              <p className="mt-4 text-neutral-300 leading-relaxed product-description">
                {p.short_description || p.description?.slice(0, 200)}
              </p>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.is_bestseller && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30">
                    Bestseller
                  </span>
                )}
                {p.is_new && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                    New
                  </span>
                )}
                {!canBuyOnline && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white/10 text-white/70">
                    In-Clinic Only
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                {canBuyOnline && p.purchase_url && (
                  <a
                    href={p.purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-black shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-neutral-900 transition"
                  >
                    Buy Online
                  </a>
                )}
                <a
                  href="/book/consult"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-white/90 ring-1 ring-white/15 hover:ring-white/30 transition"
                >
                  {canBuyOnline ? 'Build My Routine' : 'Book Skin Consult'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorescience Anniversary Sale Banner */}
      {b.slug === 'colorescience' && (
        <div className="py-4 px-4" style={{ background: 'linear-gradient(135deg, #FDF6F0 0%, #FFF5EE 50%, #FDF6F0 100%)' }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#CF7155' }}>Limited Time &middot; March 5–22</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: '#CF7155', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>Anniversary Sale: 20% Off Sitewide + Free Shipping</p>
            </div>
            <a
              href="https://colorescience.com/reluxe-med-spa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white whitespace-nowrap hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #CF7155, #B85A40)' }}>
              Shop the Sale &rarr;
            </a>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Full description */}
        {p.description && (
          <section>
            <h2 className="text-2xl font-extrabold tracking-tight">About {p.name}</h2>
            <div className="mt-4 text-neutral-700 leading-relaxed whitespace-pre-line product-description">
              {p.description}
            </div>
          </section>
        )}

        {/* Key Ingredients */}
        {p.key_ingredients?.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold tracking-tight">Key Ingredients</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.key_ingredients.map(ing => (
                <span key={ing} className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                  {ing}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* How to Use */}
        {p.how_to_use && (
          <section>
            <h2 className="text-xl font-extrabold tracking-tight">How to Use</h2>
            <p className="mt-4 text-neutral-700 leading-relaxed product-how-to-use">{p.how_to_use}</p>
          </section>
        )}

        {/* Pro Tip */}
        {p.pro_tip && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <p className="text-sm font-semibold text-violet-700 mb-1">Pro Tip from Our Clinicians</p>
            <p className="text-neutral-700">{p.pro_tip}</p>
          </div>
        )}

        {/* Skin Types & Concerns */}
        {(p.skin_types?.length > 0 || p.concerns?.length > 0) && (
          <section className="grid gap-8 md:grid-cols-2">
            {p.skin_types?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold">Best For Skin Types</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.skin_types.map(t => (
                    <span key={t} className="inline-flex items-center rounded-xl px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 capitalize">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {p.concerns?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold">Targets</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.concerns.map(c => (
                    <span key={c} className="inline-flex items-center rounded-xl px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 capitalize">
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
            <h2 className="text-xl font-extrabold tracking-tight">Staff Pick</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {Object.entries(p.staff_picks).map(([location, reason]) => (
                <div key={location} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-violet-600 capitalize">{location} Team</p>
                  <p className="mt-1 text-neutral-700">{reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Treatment Pairings */}
        {p.related_services?.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold tracking-tight">Pairs Well With</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.related_services.map(slug => (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition capitalize"
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
            <h2 className="text-xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <div className="mt-4 divide-y rounded-2xl border">
              {p.faq.map((item, i) => (
                <div key={i}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-neutral-800">{item.q}</span>
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {faqOpen === i && (
                    <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold tracking-tight">More from {b.name}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(r => {
                const rType = r.purchase_type || b.purchase_type || 'in_clinic'
                const rCanBuy = rType === 'affiliate' || rType === 'direct'
                return (
                  <Link key={r.slug} href={`/skincare/${b.slug}/${r.slug}`} className="group">
                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                      <h4 className="font-bold group-hover:text-violet-600 transition-colors">{r.name}</h4>
                      {r.short_description && <p className="mt-2 text-neutral-700 text-sm">{r.short_description}</p>}
                      <div className="mt-4 flex items-center gap-2">
                        {r.is_bestseller && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">
                            Bestseller
                          </span>
                        )}
                        {rCanBuy ? (
                          <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold text-violet-600">
                            Shop Online →
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-600">
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
        <div className="flex flex-wrap gap-3 pt-4">
          <Link href={`/skincare/${b.slug}`} className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">
            ← {b.name}
          </Link>
          <Link href="/skincare" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">
            All Brands
          </Link>
          <a href="/book/consult" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-neutral-900 hover:bg-black transition">
            Book Skincare Consult
          </a>
        </div>
      </main>
    </>
  )
}
