// src/pages/deals.jsx
import Head from 'next/head';
import useSWR from 'swr';
import HeaderTwo from '@/components/header/header-2';
import { getDealsSSR, getDealsClient } from '@/lib/deals';
import DealsGrid from '@/components/deals/DealsGrid';

const SITE = 'https://reluxemedspa.com';
const title = 'Monthly Promotions | RELUXE Med Spa';
const description =
  'Current promotions and monthly specials at RELUXE Med Spa—limited-time offers on injectables, skin, laser, and more.';

export default function DealsPage({ initial }) {
  const { data } = useSWR('deals', () => getDealsClient(), {
    fallbackData: initial,
    revalidateOnFocus: false,
  });

  // in src/pages/deals.jsx, inside DealsPage()
if (process.env.NODE_ENV !== 'production' && (data?.length ?? 0) > 0) {
  // eslint-disable-next-line no-console
  console.log('[deals] sample item', data[0]);
}


  // JSON-LD ItemList for promos (SEO)
  const itemList = (data || []).map((d, i) => {
    const name =
      d?.acf?.headline ||
      d?.acf?.title ||
      d?.title?.rendered?.replace(/<[^>]+>/g, '') ||
      'Promotion';
    const url =
      d?.acf?.cta_url || `${SITE}/deals#deal-${d?.id ?? i}`;
    const price = d?.acf?.price || undefined;

    return {
      '@type': 'ListItem',
      position: i + 1,
      url,
      item: {
        '@type': 'Offer',
        name,
        url,
        price: price ?? undefined,
        availability: 'https://schema.org/InStoreOnly',
        priceCurrency: 'USD',
      },
    };
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Canonical / OG / Twitter */}
        <link rel="canonical" href={`${SITE}/deals`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/deals`} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        {/* ItemList of offers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: itemList,
            }),
          }}
        />
      </Head>

      <HeaderTwo />

      {/* Hero */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wider">
            <span>🔥</span>
            <span className="uppercase">Monthly Specials</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            Promotions
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-300">
            Fresh specials curated by our team. These are limited-time—book while they’re hot.
          </p>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <DealsGrid deals={data || []} />
      </main>
    </>
  );
}

// Revalidate every ~10 minutes
export async function getStaticProps() {
  const initial = await getDealsSSR().catch(() => []);
  return { props: { initial }, revalidate: 600 };
}
