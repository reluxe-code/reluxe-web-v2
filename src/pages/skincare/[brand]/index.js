// src/pages/skincare/[brand]/index.js
// Brand hub page — DB-driven, replaces static brand pages

import Link from 'next/link'
import HeaderTwo from '@/components/header/header-2'
import BrandSEO from '@/components/seo/BrandSEO'
import { getServiceClient } from '@/lib/supabase'

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

  // Treatment pairings
  const pairings = products.filter(p => p.post_procedure || p.related_services?.length > 0)

  return (
    <>
      <BrandSEO brand={b} products={products} />
      <HeaderTwo />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(168,85,247,0.28),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] tracking-widest uppercase text-white/60">RELUXE • Skincare</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">{b.name}</h1>
              {b.description && (
                <p className="mt-4 text-neutral-300 text-lg leading-relaxed brand-description">{b.description}</p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                {canBuyOnline && b.affiliate_url && (
                  <a
                    href={b.affiliate_url}
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
                  Build My Routine
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              {b.hero_image ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                  <img src={b.hero_image} alt={`${b.name} products`} className="h-full w-full object-cover" />
                </div>
              ) : b.logo_url ? (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 bg-neutral-800 flex items-center justify-center">
                  <img src={b.logo_url} alt={b.name} className="h-16 object-contain" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Bestsellers */}
        {bestsellers.length > 0 && (
          <section className="brand-products">
            <h2 className="text-2xl font-extrabold tracking-tight">Bestsellers</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bestsellers.map(p => (
                <ProductCard key={p.slug} product={p} brand={b} />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section className={bestsellers.length > 0 ? 'mt-14' : ''}>
          <h2 className="text-2xl font-extrabold tracking-tight">
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
          <section className="mt-14">
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
        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/skincare" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold ring-1 ring-neutral-300 hover:bg-neutral-50">
            ← Skincare Hub
          </Link>
          <a href="/book/consult" className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white bg-neutral-900 hover:bg-black transition">
            Book Skincare Consult
          </a>
        </div>
      </main>
    </>
  )
}

function ProductCard({ product: p, brand: b }) {
  const pType = p.purchase_type || b.purchase_type || 'in_clinic'
  const canBuy = pType === 'affiliate' || pType === 'direct'

  return (
    <Link href={`/skincare/${b.slug}/${p.slug}`} className="group">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        <h4 className="font-bold group-hover:text-violet-600 transition-colors">{p.name}</h4>
        {p.subtitle && <p className="text-sm text-violet-600 mt-0.5">{p.subtitle}</p>}
        {p.short_description && <p className="mt-2 text-neutral-700 text-sm">{p.short_description}</p>}
        <div className="mt-4 flex items-center gap-2">
          {p.is_bestseller && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">
              Bestseller
            </span>
          )}
          {p.is_new && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">
              New
            </span>
          )}
          {canBuy ? (
            <span className="inline-flex items-center text-xs font-semibold text-violet-600">
              Shop Online →
            </span>
          ) : (
            <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700">
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
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-extrabold tracking-tight">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map(it => (
          <li key={it.name}>
            <p className="font-semibold">{it.name}</p>
            <p className="text-neutral-700 text-sm">{it.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
