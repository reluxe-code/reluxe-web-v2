// src/pages/blog/index.js
import Link from 'next/link';
import Image from 'next/image';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, fontPairings, typeScale } from '@/components/preview/tokens';
import { getServiceClient } from '@/lib/supabase';

const FONT_KEY = 'bold';
const fonts = fontPairings[FONT_KEY];

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function BlogIndex({ posts = [], categories = [] }) {
  const list = Array.isArray(posts) ? posts : [];
  const cats = Array.isArray(categories) ? categories : [];

  return (
    <BetaLayout
      title="Med Spa Blog | Skincare Tips & Injectable Guides"
      description="Expert guides on Botox, facials, laser treatments, and skincare from RELUXE Med Spa. Tips and advice from our providers in Westfield and Carmel, Indiana."
      canonical="https://reluxemedspa.com/blog"
    >
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: colors.ink, color: colors.white }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.28), transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <p style={{ ...typeScale.label, color: 'rgba(250,248,245,0.4)', fontFamily: fonts.body }}>
            RELUXE &middot; Blog
          </p>
          <h1 style={{ fontFamily: fonts.display, fontSize: typeScale.hero.size, fontWeight: typeScale.hero.weight, lineHeight: typeScale.hero.lineHeight, color: colors.white, marginTop: '0.75rem' }}>
            The{' '}
            <span style={{ background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RELUXE Blog.
            </span>
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(250,248,245,0.5)', maxWidth: '32rem', margin: '1.5rem auto 0' }}>
            {list.length > 0 ? `${list.length} expert posts` : 'Expert skincare tips & guides'} from our providers in Westfield & Carmel.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {list.length === 0 && <p style={{ fontFamily: fonts.body, color: colors.muted }}>No posts yet.</p>}

        <ul className="grid md:grid-cols-2 gap-8" style={{ listStyle: 'none', padding: 0 }}>
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/blog/${p.slug}`}
                className="group"
                style={{ display: 'block', borderRadius: '1.5rem', overflow: 'hidden', border: `1px solid ${colors.stone}`, textDecoration: 'none', transition: 'box-shadow 0.3s' }}
              >
                {p.featured_image && (
                  <div style={{ position: 'relative', width: '100%', height: '12rem' }}>
                    <Image
                      src={p.featured_image}
                      alt={p.title || 'Blog post'}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '1.25rem', color: colors.heading }}>{p.title || 'Untitled'}</h3>
                  {p.excerpt && (
                    <p className="line-clamp-2" style={{ fontSize: '0.875rem', color: colors.body, fontFamily: fonts.body, marginTop: '0.25rem' }}>{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <p style={{ fontSize: '0.75rem', color: colors.muted, fontFamily: fonts.body, marginTop: '0.5rem' }}>
                      {new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {cats.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h4 style={{ fontFamily: fonts.body, fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>Categories</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {cats.map((c) => (
                <span key={c.id} style={{
                  padding: '0.25rem 0.75rem', borderRadius: '9999px',
                  border: `1px solid ${colors.stone}`, fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body,
                }}>
                  {c.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </BetaLayout>
  );
}

BlogIndex.getLayout = (page) => page;

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
