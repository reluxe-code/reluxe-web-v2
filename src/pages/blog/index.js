// src/pages/blog/index.js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/layout';
import HeaderTwo from '@/components/header/header-2';
import { getServiceClient } from '@/lib/supabase';

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

      <HeaderTwo title="RELUXE Blog" subtitle={list.length > 0 ? `${list.length} posts` : 'Expert skincare tips & guides'} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {list.length === 0 && <p>No posts yet.</p>}

        <ul className="grid md:grid-cols-2 gap-8">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/blog/${p.slug}`}
                className="block rounded-xl ring-1 ring-black/10 hover:bg-neutral-50 overflow-hidden"
              >
                {p.featured_image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={p.featured_image}
                      alt={p.title || 'Blog post'}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-xl">{p.title || 'Untitled'}</h3>
                  {p.excerpt && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <p className="text-xs text-neutral-400 mt-2">
                      {new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
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
  const sb = getServiceClient();

  const [{ data: posts }, { data: categories }] = await Promise.all([
    sb
      .from('blog_posts')
      .select('id, slug, title, excerpt, featured_image, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50),
    sb
      .from('categories')
      .select('id, name, slug')
      .order('name'),
  ]);

  return {
    props: {
      posts: posts || [],
      categories: categories || [],
    },
  };
}
