// src/pages/blog/[slug].js
import Image from 'next/image';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function PostPage({ post, publishedDate }) {
  if (!post) {
    return (
      <BetaLayout title="Post Not Found">
        <p style={{ padding: '2rem', fontFamily: fonts.body, color: colors.muted }}>Post not found.</p>
      </BetaLayout>
    );
  }

  const plainTitle = post.title || '';
  const plainExcerpt = (post.excerpt || '').replace(/<[^>]+>/g, '').trim();
  const pageUrl = `https://reluxemedspa.com/blog/${post.slug}`;
  const seoImage = 'https://reluxemedspa.com/images/og/new-default-1200x630.png';

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
    <BetaLayout
      title={plainTitle}
      description={plainExcerpt}
      canonical={pageUrl}
      ogType="article"
      structuredData={articleSchema}
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
          <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
            RELUXE &middot; Blog
          </p>
          <h1 style={{ fontFamily: fonts.display, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, color: colors.white, marginTop: '0.75rem', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto' }}>
            {plainTitle}
          </h1>
          {publishedDate && (
            <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.4)', marginTop: '1rem' }}>
              {publishedDate}
            </p>
          )}
        </div>
      </section>

      <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {post.featured_image ? (
          <div style={{ position: 'relative', width: '100%', height: '16rem', marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
          style={{ fontFamily: fonts.body }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
      </main>
    </BetaLayout>
  );
}

PostPage.getLayout = (page) => page;

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
