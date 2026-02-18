// src/pages/blog/[slug].js
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/layout/layout';
import HeaderTwo from '@/components/header/header-2';
import { getServiceClient } from '@/lib/supabase';

function FancyTitle({ raw = '' }) {
  const words = String(raw).split(/\s+/).filter(Boolean);
  return (
    <h1 className="flex flex-wrap justify-center text-center font-black leading-tight text-4xl sm:text-5xl lg:text-6xl mb-4">
      <span className="mr-2">RE[</span>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={`inline-block mr-2 ${i < words.length - 1 ? 'after:content-["."]' : ''}`}
        >
          {w}
        </span>
      ))}
      <span>]</span>
    </h1>
  );
}

export default function PostPage({ post, publishedDate }) {
  if (!post) return <Layout><p className="p-8">Post not found.</p></Layout>;

  const plainTitle = post.title || '';
  const plainExcerpt = (post.excerpt || '').replace(/<[^>]+>/g, '').trim();
  const seoTitle = `${plainTitle} | RELUXE Med Spa Blog`;
  const pageUrl = `https://reluxemedspa.com/blog/${post.slug}`;
  const seoImage = post.featured_image || 'https://reluxemedspa.com/images/blog/blog-hero.jpg';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: plainTitle,
    description: plainExcerpt,
    image: seoImage,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://reluxemedspa.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RELUXE Med Spa',
      url: 'https://reluxemedspa.com',
      logo: { '@type': 'ImageObject', url: 'https://reluxemedspa.com/images/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  };

  return (
    <Layout>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={plainExcerpt} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={plainExcerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={plainExcerpt} />
        <meta name="twitter:image" content={seoImage} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </Head>

      <HeaderTwo
        title={<FancyTitle raw={plainTitle} />}
        subtitle={publishedDate}
        image={post.featured_image || '/images/blog/blog-hero.jpg'}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.featured_image ? (
          <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.featured_image}
              alt={plainTitle || 'Post image'}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : null}

        <article
          className="prose prose-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const sb = getServiceClient();
  const { data: posts } = await sb
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  const paths = (posts || [])
    .filter((p) => p?.slug)
    .map((p) => ({ params: { slug: p.slug } }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const sb = getServiceClient();
  const { data: posts } = await sb
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .limit(1);

  const post = posts?.[0] || null;
  if (!post) return { notFound: true };

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return { props: { post, publishedDate } };
}
