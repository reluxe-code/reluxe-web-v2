// src/pages/blog/index.js
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/layout';
import HeaderTwo from '@/components/header/header-2';

export default function BlogIndex({ posts = [], categories = [] }) {
  const list = Array.isArray(posts) ? posts : [];
  const cats = Array.isArray(categories) ? categories : [];

  return (
    <Layout>
      <Head>
        <title>Med Spa Blog | Skincare Tips & Injectable Guides | RELUXE Westfield & Carmel</title>
        <meta name="description" content="Expert guides on Botox, facials, laser treatments, and skincare from RELUXE Med Spa. Tips and advice from our providers in Westfield and Carmel, Indiana." />
        <link rel="canonical" href="https://reluxemedspa.com/blog" />
        <meta property="og:title" content="Med Spa Blog | RELUXE Med Spa" />
        <meta property="og:description" content="Expert guides on Botox, facials, laser treatments, and skincare from RELUXE Med Spa." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/blog" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Med Spa Blog | RELUXE Med Spa" />
        <meta name="twitter:description" content="Skincare tips and injectable guides from our providers in Westfield & Carmel, IN." />
      </Head>

      <HeaderTwo title="RELUXE Blog" subtitle={`${list.length} posts`} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {list.length === 0 && <p>No posts yet.</p>}

        <ul className="grid md:grid-cols-2 gap-8">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/blog/${p.slug}`}
                className="block p-4 rounded-xl ring-1 ring-black/10 hover:bg-neutral-50"
              >
                <h3
                  className="font-semibold text-xl"
                  dangerouslySetInnerHTML={{ __html: p?.title?.rendered || 'Untitled' }}
                />
                <p
                  className="text-sm text-neutral-600"
                  dangerouslySetInnerHTML={{
                    __html: (p?.excerpt?.rendered || '').replace(/<[^>]+>/g, ''),
                  }}
                />
              </Link>
            </li>
          ))}
        </ul>

        {cats.length > 0 && (
          <section className="mt-12">
            <h4 className="font-semibold mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <span key={c.id} className="px-3 py-1 rounded-full ring-1 ring-black/10">
                  {c.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const WP_API =
    process.env.WP_API_ENDPOINT ||
    process.env.WP_API ||
    'https://wordpress-74434-5742908.cloudwaysapps.com/cms/wp-json/wp/v2';

  const safeJson = async (url, fallback = []) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      const data = await res.json();
      return Array.isArray(data) ? data : fallback;
    } catch {
      return fallback;
    }
  };

  // keep it simple for export; no ISR, just arrays or []
  const posts = await safeJson(
    `${WP_API}/posts?per_page=12&_fields=id,slug,title,excerpt,date`
  );
  const categories = await safeJson(
    `${WP_API}/categories?per_page=100&_fields=id,name,slug,count`
  );

  return { props: { posts, categories } };
}
