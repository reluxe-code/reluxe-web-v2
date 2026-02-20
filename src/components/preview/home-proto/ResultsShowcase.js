import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

const results = [
  {
    treatment: 'Botox',
    area: 'Forehead & Glabella',
    provider: 'Sarah M., NP',
    description: 'Smooth, natural movement with zero frozen look. This is what precision tox placement looks like.',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
  },
  {
    treatment: 'Lip Filler',
    area: 'Lips — 1 syringe Juvederm',
    provider: 'Dr. Patel',
    description: 'Full, balanced, and perfectly proportioned. Subtle enough that people can\'t tell — they just know something looks amazing.',
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA)',
  },
  {
    treatment: 'Morpheus8',
    area: 'Full Face — 3 sessions',
    provider: 'Jamie K., PA',
    description: 'Texture, pores, fine lines — all dramatically improved. Skin that looks 5 years younger without a single incision.',
    gradient: 'linear-gradient(135deg, #E11D73, #C026D3)',
  },
  {
    treatment: 'Laser Hair Removal',
    area: 'Full Legs — 6 sessions',
    provider: 'Taylor R., LE',
    description: 'Silky smooth, permanently. No more razor bumps, ingrowns, or last-minute shaves before vacation.',
    gradient: 'linear-gradient(135deg, #5B21B6, #1E1B4B)',
  },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export default function ResultsShowcase({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="mb-4"
            style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet }}
          >
            Real Results
          </p>
          <h2
            className="mb-4"
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
            }}
          >
            See the Difference
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              lineHeight: typeScale.body.lineHeight,
              color: colors.body,
            }}
          >
            Real patients. Real providers. Real results — no filters, no BS.
          </p>
        </motion.div>

        {/* Results grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {results.map((item) => (
            <motion.div
              key={item.treatment}
              variants={staggerItem}
              className="group rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              {/* Before / After placeholders */}
              <div className="grid grid-cols-2 gap-0">
                {['Before', 'After'].map((label) => (
                  <div
                    key={label}
                    className="relative overflow-hidden"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: label === 'Before'
                          ? 'linear-gradient(135deg, #E0D9CF, #D4CCC0)'
                          : item.gradient,
                        opacity: label === 'Before' ? 1 : 0.85,
                      }}
                    />
                    {/* Grain */}
                    <div
                      className="absolute inset-0 opacity-[0.06]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        backgroundSize: '128px 128px',
                      }}
                    />
                    {/* Label badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-block rounded-full px-3 py-1"
                        style={{
                          backgroundColor: label === 'Before'
                            ? 'rgba(0,0,0,0.12)'
                            : 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          fontFamily: fonts.body,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: label === 'Before'
                            ? 'rgba(0,0,0,0.5)'
                            : 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {/* Placeholder icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          opacity: 0.15,
                          color: label === 'Before' ? colors.heading : '#fff',
                        }}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: colors.heading,
                        lineHeight: 1.2,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {item.treatment}
                    </h3>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.8125rem',
                        color: colors.muted,
                      }}
                    >
                      {item.area}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-3 py-1"
                    style={{
                      background: gradients.subtle,
                      fontFamily: fonts.body,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: colors.violet,
                    }}
                  >
                    {item.provider}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    color: colors.body,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            className="inline-flex items-center gap-2 rounded-full transition-all duration-200 hover:gap-3"
            style={{
              background: 'transparent',
              color: colors.violet,
              padding: '0.875rem 2rem',
              fontSize: '0.9375rem',
              fontFamily: fonts.body,
              fontWeight: 600,
              border: `1.5px solid ${colors.violet}`,
              cursor: 'pointer',
            }}
          >
            See More Results
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9H14M14 9L10 5M14 9L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
