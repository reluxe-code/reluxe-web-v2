import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

export default function SplitHeroAlt({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section
      className="relative min-h-screen flex items-center"
      style={{ backgroundColor: colors.ink }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-24 lg:py-0">
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
                marginBottom: '1.5rem',
              }}
            >
              Westfield & Carmel, Indiana
            </p>

            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 700,
                lineHeight: 1.05,
                color: colors.white,
                marginBottom: '1.5rem',
              }}
            >
              Your Skin.{' '}
              <span
                style={{
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Elevated.
              </span>
            </h1>

            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                lineHeight: 1.7,
                color: 'rgba(250,248,245,0.6)',
                maxWidth: '28rem',
                marginBottom: '2.5rem',
              }}
            >
              Premium aesthetics without the pretension. Expert providers, luxury spaces,
              and treatments that actually deliver. Welcome to RELUXE.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                className="rounded-full transition-all duration-200"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  padding: '0.875rem 2.25rem',
                  background: gradients.primary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Book Now
              </button>
              <button
                className="rounded-full transition-all duration-200"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  padding: '0.875rem 2.25rem',
                  background: 'transparent',
                  color: 'rgba(250,248,245,0.7)',
                  border: '1.5px solid rgba(250,248,245,0.2)',
                  cursor: 'pointer',
                }}
              >
                Explore Services
              </button>
            </div>

            {/* Mini trust strip */}
            <div className="flex flex-wrap gap-6 mt-12">
              {['500+ 5-Star Reviews', 'Board-Certified', 'Allergan Diamond'].map((badge) => (
                <span
                  key={badge}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'rgba(250,248,245,0.35)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — Image placeholder */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                aspectRatio: '4/5',
                background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}15, ${colors.rose}10)`,
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

              {/* Image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-center"
                  style={{ color: 'rgba(250,248,245,0.15)' }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    Hero Image
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="absolute bottom-6 left-6 right-6 rounded-2xl p-5"
                style={{
                  background: 'rgba(26,26,26,0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(250,248,245,0.08)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'rgba(124,58,237,0.2)',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>⭐</span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: colors.white,
                      }}
                    >
                      4.9 out of 5
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.75rem',
                        color: 'rgba(250,248,245,0.5)',
                      }}
                    >
                      Based on 500+ verified reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
