import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/layout/layout';
import HeaderTwo from '@/components/header/header-2';

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

export default function PostPage({ post, featuredUrl, publishedDate }) {
  if (!post) return <Layout><p className="p-8">Post not found.</p></Layout>;

  const plainExcerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();
  const plainTitle = (post.title?.rendered || '').replace(/<[^>]+>/g, '');
  const seoTitle = `${plainTitle} | RELUXE Med Spa Blog`;
  const pageUrl = `https://reluxemedspa.com/blog/${post.slug}`;
  const seoImage = featuredUrl || 'https://reluxemedspa.com/images/blog/blog-hero.jpg';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: plainTitle,
    description: plainExcerpt,
    image: seoImage,
    datePublished: post.date,
    dateModified: post.modified || post.date,
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
        title={<FancyTitle raw={post.title?.rendered || ''} />}
        subtitle={publishedDate}
        image={featuredUrl || '/images/blog/blog-hero.jpg'}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {featuredUrl ? (
          <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={featuredUrl}
              alt={post.title?.rendered || 'Post image'}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : null}

        <article
          className="prose prose-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content?.rendered || '' }}
        />
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const WP_API = process.env.WP_API;
  if (!WP_API) {
    console.warn('WP_API env not set — skipping /blog export');
    return { paths: [], fallback: false }; // required for static export
  }
  try {
    const paths = [];
    let page = 1;
    while (true) {
      const res = await fetch(`${WP_API}/posts?_fields=slug&per_page=100&page=${page}`);
      if (!res.ok) break;
      const chunk = await res.json();
      if (!Array.isArray(chunk) || chunk.length === 0) break;
      for (const p of chunk) if (p?.slug) paths.push({ params: { slug: p.slug } });
      page += 1;
    }
    return { paths, fallback: false }; // no fallback allowed with output:'export'
  } catch (e) {
    console.warn('Failed to fetch slugs for /blog:', e);
    return { paths: [], fallback: false };
  }
}

export async function getStaticProps({ params }) {
  const WP_API = process.env.WP_API;
  if (!WP_API) return { notFound: true };

  try {
    const postRes = await fetch(
      `${WP_API}/posts?slug=${encodeURIComponent(params.slug)}&_embed`
    );
    if (!postRes.ok) return { notFound: true };
    const data = await postRes.json();
    const post = Array.isArray(data) ? data[0] : null;
    if (!post) return { notFound: true };

    const featuredUrl =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    const publishedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // no ISR when exporting statically
    return { props: { post, featuredUrl, publishedDate } };
  } catch (e) {
    console.warn('Failed to build /blog page:', e);
    return { notFound: true };
  }
}
