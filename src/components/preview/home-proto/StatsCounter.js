import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

// Replaced spinning numbers with a bold editorial "pull quote" section
// More magazine feel, less SaaS template

export default function StatsCounter({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Gradient accent top */}
      <div style={{ height: 3, background: gradients.primary }} />

      {/* Large ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '-10%',
          width: '50%',
          height: '80%',
          background: `radial-gradient(ellipse, ${colors.violet}08, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left — Big editorial statement */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
                marginBottom: '1.5rem',
              }}
            >
              The RELUXE Standard
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: colors.white,
                marginBottom: '1.5rem',
              }}
            >
              We don&rsquo;t cut corners.{' '}
              <span
                style={{
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                We set the bar.
              </span>
            </h2>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                lineHeight: 1.7,
                color: 'rgba(250,248,245,0.5)',
                maxWidth: '32rem',
              }}
            >
              Every provider is hand-picked. Every product is premium.
              Every treatment plan is built around you — not a sales quota.
              This is what happens when a med spa actually gives a damn.
            </p>
          </motion.div>

          {/* Right — Stacked metric cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[
              { number: '12+', label: 'Expert Providers', detail: 'Board-certified & specialized' },
              { number: '500+', label: '5-Star Reviews', detail: 'Google & Trustindex' },
              { number: '15k+', label: 'Treatments Done', detail: 'And counting weekly' },
              { number: '2', label: 'Locations', detail: 'Westfield & Carmel' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: 'rgba(250,248,245,0.04)',
                  border: '1px solid rgba(250,248,245,0.06)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                    background: gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.number}
                </p>
                <p
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: colors.white,
                    marginBottom: '0.125rem',
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.75rem',
                    color: 'rgba(250,248,245,0.35)',
                  }}
                >
                  {stat.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
