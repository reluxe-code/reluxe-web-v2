// src/pages/services/collections/[slug].js
// Public category landing page — renders a service category with its services.
// Supports both functional (BLVD sync) and creative (marketing) categories.

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';

export async function getStaticPaths() {
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('service_categories')
      .select('slug')
      .eq('active', true);
    const paths = (data || []).map((c) => ({ params: { slug: c.slug } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug || '';
  if (!slug) return { notFound: true };

  try {
    const sb = getServiceClient();

    // Fetch category
    const { data: category, error: catErr } = await sb
      .from('service_categories')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (catErr || !category) return { notFound: true };

    // Fetch services in this category
    const { data: junctions } = await sb
      .from('cms_service_categories')
      .select(`
        sort_order,
        cms_services (
          id, slug, name, tagline, hero_image, status
        )
      `)
      .eq('category_id', category.id)
      .order('sort_order', { ascending: true });

    const services = (junctions || [])
      .map((j) => j.cms_services)
      .filter((s) => s && s.status === 'published');

    return {
      props: { category, services },
      revalidate: 3600,
    };
  } catch {
    return { notFound: true };
  }
}

export default function CollectionPage({ category, services }) {
  const seoTitle = category.seo_title || `${category.name} | RELUXE Med Spa`;
  const seoDesc = category.seo_description || category.description || `Explore ${category.name} services at RELUXE Med Spa in Westfield & Carmel, IN.`;
  const canonical = `https://reluxemedspa.com/services/collections/${category.slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category.name,
        description: seoDesc,
        url: canonical,
        isPartOf: { '@type': 'WebSite', name: 'RELUXE Med Spa', url: 'https://reluxemedspa.com' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reluxemedspa.com' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://reluxemedspa.com/services' },
          { '@type': 'ListItem', position: 3, name: category.name, item: canonical },
        ],
      },
      {
        '@type': 'ItemList',
        numberOfItems: services.length,
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          url: `https://reluxemedspa.com/services/${s.slug}`,
        })),
      },
    ],
  };

  const isCreative = category.type === 'creative';

  return (
    <BetaLayout
      title={seoTitle}
      description={seoDesc}
      canonical={canonical}
      structuredData={structuredData}
    >
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section
            className="relative"
            style={{
              backgroundColor: colors.ink,
              paddingTop: 80,
              paddingBottom: 48,
              backgroundImage: category.hero_image ? `url(${category.hero_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {category.hero_image && (
              <div className="absolute inset-0 bg-black/60" />
            )}
            <div className="max-w-5xl mx-auto px-6 relative">
              {/* Breadcrumb */}
              <a
                href="/services"
                className="inline-flex items-center gap-1.5 mb-3 transition-colors"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'rgba(250,248,245,0.45)',
                  textDecoration: 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                All Services
              </a>

              {isCreative && (
                <span
                  className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                >
                  Curated Collection
                </span>
              )}

              <h1
                style={{
                  fontFamily: fonts.display,
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: colors.white,
                  marginBottom: '1rem',
                }}
              >
                {category.name}
              </h1>

              {category.description && (
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '1.0625rem',
                    lineHeight: 1.7,
                    color: 'rgba(250,248,245,0.6)',
                    maxWidth: '40rem',
                  }}
                >
                  {category.description}
                </p>
              )}
            </div>
          </section>

          {/* Service Grid */}
          <section style={{ backgroundColor: '#faf8f5', padding: '3rem 0 4rem' }}>
            <div className="max-w-6xl mx-auto px-6">
              <h2
                style={{
                  fontFamily: fonts.display,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: colors.ink,
                  marginBottom: '2rem',
                }}
              >
                {services.length} {services.length === 1 ? 'Service' : 'Services'}
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <Link
                    key={svc.id}
                    href={`/services/${svc.slug}`}
                    className="group block bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    {svc.hero_image ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={svc.hero_image}
                          alt={svc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-48 flex items-center justify-center"
                        style={{ background: gradients.primary }}
                      >
                        <span
                          style={{
                            fontFamily: fonts.display,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)',
                          }}
                        >
                          {svc.name}
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      <h3
                        style={{
                          fontFamily: fonts.display,
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: colors.ink,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {svc.name}
                      </h3>
                      {svc.tagline && (
                        <p
                          style={{
                            fontFamily: fonts.body,
                            fontSize: '0.875rem',
                            color: 'rgba(0,0,0,0.55)',
                            lineHeight: 1.5,
                          }}
                        >
                          {svc.tagline}
                        </p>
                      )}
                      <span
                        className="inline-block mt-3"
                        style={{
                          fontFamily: fonts.body,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: colors.violet,
                        }}
                      >
                        Learn more &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {services.length === 0 && (
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '1rem',
                    color: 'rgba(0,0,0,0.45)',
                    textAlign: 'center',
                    padding: '3rem 0',
                  }}
                >
                  No services in this collection yet.
                </p>
              )}
            </div>
          </section>

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary }}>
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
              <h2
                style={{
                  fontFamily: fonts.display,
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '1rem',
                }}
              >
                Ready to get started?
              </h2>
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '2rem',
                }}
              >
                Book a free consultation with one of our expert providers.
              </p>
              <Link
                href="/book/consult"
                className="inline-block rounded-full"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  padding: '0.875rem 2.25rem',
                  backgroundColor: '#fff',
                  color: colors.ink,
                  textDecoration: 'none',
                }}
              >
                Curate My Plan
              </Link>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

CollectionPage.getLayout = (page) => page;
