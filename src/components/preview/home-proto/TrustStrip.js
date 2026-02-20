import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const brands = [
  'Allergan',
  'Galderma',
  'Merz',
  'Revance',
  'Evolus',
  'SkinBetter Science',
  'InMode',
  'Candela',
];

const certifications = [
  {
    label: 'Board-Certified',
    detail: 'Medical Director',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9,12 11,14 15,10" />
      </svg>
    ),
  },
  {
    label: '500+ Reviews',
    detail: '4.9 Star Average',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    label: 'Top Provider',
    detail: 'Allergan Diamond',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M2 9h20" />
        <path d="M10 9l2-6 2 6" />
        <path d="M6 3l4 6" />
        <path d="M18 3l-4 6" />
      </svg>
    ),
  },
  {
    label: 'Est. 2018',
    detail: 'Trusted Since Day One',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
];

export default function TrustStrip({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.ink }}>
      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16">
        {/* Certification badges */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.label}
              className="flex items-center gap-4 rounded-xl px-5 py-4"
              style={{
                backgroundColor: 'rgba(250,248,245,0.04)',
                border: '1px solid rgba(250,248,245,0.06)',
              }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(124,58,237,0.12)',
                  color: colors.violet,
                }}
              >
                {cert.icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: colors.white,
                    marginBottom: '0.125rem',
                    lineHeight: 1.2,
                  }}
                >
                  {cert.label}
                </p>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.75rem',
                    color: 'rgba(250,248,245,0.4)',
                  }}
                >
                  {cert.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(250,248,245,0.08), transparent)',
            marginBottom: '2rem',
          }}
        />

        {/* Partner logos — animated ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p
            className="text-center mb-6"
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: 'rgba(250,248,245,0.25)',
            }}
          >
            Trusted Partners & Products
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div
              className="absolute left-0 top-0 bottom-0 z-10"
              style={{
                width: 60,
                background: `linear-gradient(to right, ${colors.ink}, transparent)`,
                pointerEvents: 'none',
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 z-10"
              style={{
                width: 60,
                background: `linear-gradient(to left, ${colors.ink}, transparent)`,
                pointerEvents: 'none',
              }}
            />
            <motion.div
              className="flex items-center gap-12 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 20,
                  ease: 'linear',
                },
              }}
            >
              {[...brands, ...brands].map((brand, i) => (
                <span
                  key={`${brand}-${i}`}
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'rgba(250,248,245,0.22)',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {brand}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
