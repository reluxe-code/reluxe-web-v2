import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

export default function VideoHero({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: colors.ink }}
    >
      {/* Background video — slight blur + desaturate to push it back */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(2px) saturate(0.6) brightness(0.7)' }}
      >
        <source src="/videos/test-vid.mp4" type="video/mp4" />
      </video>

      {/* Tinted overlay — brand color wash + darkness */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(26,26,26,0.5) 0%, rgba(26,26,26,0.3) 40%, rgba(26,26,26,0.6) 100%),
            linear-gradient(135deg, rgba(124,58,237,0.15) 0%, transparent 50%, rgba(192,38,211,0.1) 100%)
          `,
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Label — just fades in, no movement */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontFamily: fonts.body,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(250,248,245,0.5)',
            marginBottom: '1.5rem',
          }}
        >
          Westfield &middot; Carmel
        </motion.p>

        {/* Hero headline — fade only, no translate */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
          style={{
            fontFamily: fonts.display,
            fontSize: typeScale.hero.size,
            fontWeight: typeScale.hero.weight,
            lineHeight: typeScale.hero.lineHeight,
            color: colors.white,
            marginBottom: '1.5rem',
          }}
        >
          Big Results.{' '}
          <span
            style={{
              background: gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Bold Moves.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: fonts.body,
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'rgba(250,248,245,0.7)',
            marginBottom: '2.5rem',
            maxWidth: '550px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Luxury med spa. Transformative treatments. Providers who actually give a damn about your results.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            className="inline-flex items-center justify-center rounded-full font-medium transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
            style={{
              background: gradients.primary,
              color: '#fff',
              padding: '0.875rem 2.5rem',
              fontSize: '1rem',
              fontFamily: fonts.body,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Book Your Visit
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 hover:bg-white/10"
            style={{
              background: 'transparent',
              color: colors.white,
              padding: '0.875rem 2.5rem',
              fontSize: '1rem',
              fontFamily: fonts.body,
              fontWeight: 500,
              border: '1.5px solid rgba(250,248,245,0.25)',
              cursor: 'pointer',
            }}
          >
            See What We Do
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator — subtle, just opacity pulse */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ delay: 2, duration: 3, repeat: Infinity }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(250,248,245,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8l4 4 4-4" />
        </svg>
      </motion.div>
    </section>
  );
}
