import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const posts = [
  {
    category: 'Injectables',
    title: 'Botox vs. Dysport vs. Daxxify: Which Tox Is Right for You?',
    excerpt: 'A no-BS breakdown of the three most popular neurotoxins — what they do differently, and how to pick.',
    readTime: '5 min read',
    gradient: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}10)`,
  },
  {
    category: 'Skin Health',
    title: 'The Only Skincare Routine You Actually Need',
    excerpt: 'Our lead aesthetician breaks down the essentials — and what you can skip entirely.',
    readTime: '4 min read',
    gradient: `linear-gradient(135deg, ${colors.fuchsia}18, ${colors.rose}10)`,
  },
  {
    category: 'Treatments',
    title: 'Morpheus8: What to Expect Before, During, and After',
    excerpt: 'Real talk about downtime, results, and why everyone is obsessed with this treatment right now.',
    readTime: '6 min read',
    gradient: `linear-gradient(135deg, ${colors.rose}16, ${colors.violet}10)`,
  },
];

export default function EditorialBlog({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
                marginBottom: '1rem',
              }}
            >
              The RELUXE Edit
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: colors.heading,
              }}
            >
              Read Up, Glow Up
            </h2>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 transition-all duration-200"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.violet,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            View All Posts &rarr;
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              className="group cursor-pointer rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${colors.stone}`,
                backgroundColor: '#fff',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Image placeholder */}
              <div
                className="relative"
                style={{
                  height: 220,
                  background: post.gradient,
                  overflow: 'hidden',
                }}
              >
                {/* Grain */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Category badge */}
                <div
                  className="absolute top-4 left-4 rounded-full px-3 py-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: colors.violet,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="transition-colors duration-200"
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: colors.heading,
                    lineHeight: 1.35,
                    marginBottom: '0.75rem',
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: typeScale.caption.size,
                    lineHeight: 1.6,
                    color: colors.body,
                    marginBottom: '1rem',
                  }}
                >
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.75rem',
                      color: colors.muted,
                    }}
                  >
                    {post.readTime}
                  </span>
                  <span
                    className="transition-all duration-200"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: colors.violet,
                    }}
                  >
                    Read &rarr;
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
