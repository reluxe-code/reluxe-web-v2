import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

export default function AboutSection({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: colors.stone }}
    >
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text — 7 columns */}
          <motion.div
            className="lg:col-span-7 order-2 lg:order-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="mb-4"
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
              }}
            >
              Not Your Average Med Spa
            </p>

            <h2
              className="mb-6"
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: colors.heading,
              }}
            >
              We Don&apos;t Do{' '}
              <span style={{ fontStyle: 'italic' }}>Subtle</span>
              <br />
              (Unless You Want Us To)
            </h2>

            <p
              className="mb-5 max-w-xl"
              style={{
                fontFamily: fonts.body,
                fontSize: '1.0625rem',
                fontWeight: 400,
                lineHeight: 1.7,
                color: colors.body,
              }}
            >
              RELUXE was built for people who want real results — not a participation
              trophy. Our providers are obsessed with precision, artistry, and making
              sure you walk out feeling like the most confident version of yourself.
            </p>

            <p
              className="mb-5 max-w-xl"
              style={{
                fontFamily: fonts.body,
                fontSize: '1.0625rem',
                fontWeight: 400,
                lineHeight: 1.7,
                color: colors.body,
              }}
            >
              Whether it&apos;s a full facial balancing, your monthly tox refresh, or
              a laser treatment that actually delivers — we bring the expertise, the
              technology, and honestly, the vibe.
            </p>

            {/* Punchy stat line */}
            <div
              className="flex flex-wrap gap-8 mb-8 py-6"
              style={{ borderTop: `1px solid ${colors.taupe}`, borderBottom: `1px solid ${colors.taupe}` }}
            >
              {[
                { num: '12+', label: 'Expert Providers' },
                { num: '2', label: 'Locations' },
                { num: '500+', label: '5-Star Reviews' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontFamily: fonts.display,
                      fontSize: '2rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: colors.heading,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {stat.num}
                  </p>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: colors.muted,
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                className="inline-flex items-center justify-center rounded-full font-medium transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.2)]"
                style={{
                  background: gradients.primary,
                  color: '#fff',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Meet the Team
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 hover:bg-lux-ink/5"
                style={{
                  background: 'transparent',
                  color: colors.heading,
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontFamily: fonts.body,
                  fontWeight: 500,
                  border: `1.5px solid ${colors.taupe}`,
                  cursor: 'pointer',
                }}
              >
                The RELUXE Way
              </button>
            </div>
          </motion.div>

          {/* Image — 5 columns */}
          <motion.div
            className="lg:col-span-5 order-1 lg:order-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.charcoal,
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              }}
            >
              {/* Placeholder with gradient — swap for team/facility photo */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(160deg, ${colors.charcoal}, #5B21B6 50%, ${colors.ink})`,
                }}
              >
                <div className="text-center px-6">
                  <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: 'rgba(250,248,245,0.5)' }}>
                    Team / Treatment Photo
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: '0.75rem', color: 'rgba(250,248,245,0.3)', marginTop: '0.25rem' }}>
                    4:5 ratio
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
