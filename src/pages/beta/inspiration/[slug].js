import { motion } from 'framer-motion';
import BetaLayout from '@/components/beta/BetaLayout';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import { articles } from '@/data/articles';
import GravityBookButton from '@/components/beta/GravityBookButton';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function ArticleBody({ blocks, fonts, fontKey }) {
  return blocks.map((block, i) => {
    if (block.type === 'h2') {
      return (
        <h2
          key={i}
          style={{
            fontFamily: fonts.display,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: colors.heading,
            lineHeight: 1.3,
            marginTop: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {block.text}
        </h2>
      );
    }
    if (block.type === 'cta') {
      return (
        <div key={i} className="my-10 text-center">
          <div
            className="rounded-2xl p-8 inline-block"
            style={{
              background: gradients.subtle,
              border: `1px solid ${colors.stone}`,
            }}
          >
            <p
              style={{
                fontFamily: fonts.display,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: colors.heading,
                marginBottom: '1rem',
              }}
            >
              {block.text}
            </p>
            <GravityBookButton fontKey={fontKey} size="hero" />
          </div>
        </div>
      );
    }
    // Default: paragraph
    return (
      <p
        key={i}
        style={{
          fontFamily: fonts.body,
          fontSize: '1.0625rem',
          lineHeight: 1.75,
          color: colors.body,
          marginBottom: '1.25rem',
        }}
      >
        {block.text}
      </p>
    );
  });
}

export default function ArticlePage({ article, relatedArticles }) {
  if (!article) return null;

  return (
    <BetaLayout
      title={article.title}
      description={article.excerpt}
    >
      {({ fontKey, fonts }) => (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden" style={{ background: article.gradient }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div
              className="max-w-4xl mx-auto px-6 relative"
              style={{ paddingTop: 'clamp(8rem, 14vw, 12rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}
            >
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <a
                  href="/beta/inspiration"
                  className="inline-flex items-center gap-1.5 mb-6 transition-colors duration-200"
                  style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Back to Inspiration
                </a>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="rounded-full px-3 py-1"
                    style={{ background: 'rgba(255,255,255,0.15)', fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    {article.category}
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {article.readTime}
                  </span>
                </div>
                <h1
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#fff',
                    marginBottom: '1rem',
                    maxWidth: '38rem',
                  }}
                >
                  {article.title}
                </h1>
                <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '32rem' }}>
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff' }}>R</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{article.author}</p>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)' }}>{article.date}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Article Body */}
          <section style={{ backgroundColor: '#fff' }}>
            <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <ArticleBody blocks={article.body} fonts={fonts} fontKey={fontKey} />
              </motion.div>
            </div>
          </section>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section style={{ backgroundColor: colors.cream }}>
              <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
                <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Keep Reading</p>
                  <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, color: colors.heading }}>More Articles</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((post, i) => (
                    <motion.a
                      key={post.slug}
                      href={`/beta/inspiration/${post.slug}`}
                      className="group rounded-2xl overflow-hidden"
                      style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}`, textDecoration: 'none' }}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      whileHover={{ y: -4 }}
                    >
                      <div style={{ height: 120, background: post.gradient, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
                      </div>
                      <div className="p-5">
                        <h3 style={{ fontFamily: fonts.display, fontSize: '1rem', fontWeight: 700, color: colors.heading, marginBottom: '0.375rem', lineHeight: 1.3 }}>{post.title}</h3>
                        <span className="inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.violet }}>
                          Read more
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <section style={{ background: gradients.primary, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
            <div className="max-w-3xl mx-auto px-6 py-20 text-center relative">
              <h2 style={{ fontFamily: fonts.display, fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Ready to Get Started?</h2>
              <p style={{ fontFamily: fonts.body, fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Book a free consultation and let our experts build your custom plan.</p>
              <div className="flex justify-center">
                <GravityBookButton fontKey={fontKey} size="hero" />
              </div>
            </div>
          </section>
        </>
      )}
    </BetaLayout>
  );
}

export async function getStaticPaths() {
  const paths = articles.map((a) => ({ params: { slug: a.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return { notFound: true };

  const relatedArticles = articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map(({ slug, title, gradient }) => ({ slug, title, gradient }));

  return { props: { article, relatedArticles } };
}

ArticlePage.getLayout = (page) => page;
