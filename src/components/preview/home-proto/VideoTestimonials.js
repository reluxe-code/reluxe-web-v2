import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const testimonials = [
  {
    name: 'Ashley M.',
    treatment: 'Botox + Fillers',
    location: 'Westfield',
    quote: 'Honestly the best experience I\'ve ever had at a med spa. My injector was so thorough and the results are incredible.',
    thumbnail: `linear-gradient(135deg, ${colors.violet}25, ${colors.fuchsia}15)`,
  },
  {
    name: 'Rachel K.',
    treatment: 'Morpheus8',
    location: 'Carmel',
    quote: 'I was nervous about RF microneedling but the team made me feel so comfortable. My skin has never looked this good.',
    thumbnail: `linear-gradient(135deg, ${colors.fuchsia}22, ${colors.rose}15)`,
  },
  {
    name: 'Megan T.',
    treatment: 'Laser Hair Removal',
    location: 'Westfield',
    quote: 'Six sessions in and I\'m basically hair-free. Wish I\'d started sooner. The Candela laser is no joke.',
    thumbnail: `linear-gradient(135deg, ${colors.rose}20, ${colors.violet}15)`,
  },
];

export default function VideoTestimonials({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: 200,
          background: `radial-gradient(ellipse, ${colors.violet}10, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.violet,
              marginBottom: '1rem',
            }}
          >
            Real Stories
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
              marginBottom: '1rem',
            }}
          >
            Hear It from Them
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: 'rgba(250,248,245,0.5)',
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            Real patients sharing real results. No scripts, no filters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{
                border: '1px solid rgba(250,248,245,0.06)',
                backgroundColor: 'rgba(250,248,245,0.03)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Video thumbnail placeholder */}
              <div
                className="relative"
                style={{
                  height: 240,
                  background: t.thumbnail,
                  overflow: 'hidden',
                }}
              >
                {/* Grain */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 64,
                      height: 64,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                    }}
                    whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.25)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="#fff"
                      style={{ marginLeft: 3 }}
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </motion.div>
                </div>

                {/* Duration badge */}
                <div
                  className="absolute bottom-3 right-3 rounded-md px-2 py-1"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    1:30
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p
                  className="mb-4"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: typeScale.caption.size,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    color: 'rgba(250,248,245,0.65)',
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: colors.white,
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.75rem',
                        color: 'rgba(250,248,245,0.4)',
                      }}
                    >
                      {t.treatment} · {t.location}
                    </p>
                  </div>
                  {/* Star rating */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <span
                        key={j}
                        style={{ color: colors.violet, fontSize: '0.75rem' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
