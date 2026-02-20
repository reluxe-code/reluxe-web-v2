import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

export default function CTASection({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: gradients.primary,
      }}
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 lg:py-28 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="mb-6"
            style={{
              fontFamily: fonts.display,
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              color: '#fff',
            }}
          >
            Ready to Level Up?
          </h2>

          <p
            className="mb-10 max-w-md mx-auto"
            style={{
              fontFamily: fonts.body,
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            First visit? Start with a free consultation. Returning? You already know the drill — let&apos;s go.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="inline-flex items-center justify-center rounded-full font-medium transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]"
              style={{
                background: '#fff',
                color: colors.ink,
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                fontFamily: fonts.body,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Book Now
            </button>
            <button
              className="inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 hover:bg-white/20"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                fontFamily: fonts.body,
                fontWeight: 500,
                border: '1.5px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              Browse Treatments
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
