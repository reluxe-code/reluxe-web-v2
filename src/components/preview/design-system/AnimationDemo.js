import { motion } from 'framer-motion';
import { colors, fontPairings } from '../tokens';

const fonts = fontPairings.bold;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function AnimationDemo() {
  return (
    <div className="space-y-16">
      {/* Fade Up — Single Element */}
      <div>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Fade Up — Single Element (scroll to trigger)
        </p>
        <motion.div
          className="rounded-2xl p-8 lg:p-12"
          style={{ backgroundColor: colors.cream, border: `1px solid ${colors.taupe}40` }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h3
            style={{
              fontFamily: fonts.display,
              fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
              fontWeight: 500,
              color: colors.heading,
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            This fades up into view
          </h3>
          <p style={{ fontFamily: fonts.body, fontSize: '1rem', color: colors.body, lineHeight: 1.625 }}>
            300ms ease-out. Subtle 24px translate. Triggers once when element enters viewport.
            This is the primary animation pattern for section reveals.
          </p>
        </motion.div>
      </div>

      {/* Staggered Grid Reveal */}
      <div>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Staggered Grid Reveal (scroll to trigger)
        </p>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {['Botox', 'Filler', 'Morpheus8', 'Laser', 'Facials', 'SkinPen', 'IPL', 'PRP'].map((item) => (
            <motion.div
              key={item}
              variants={staggerItem}
              className="rounded-xl p-6 text-center"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.taupe}40` }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}15)` }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.violet }} />
              </div>
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: colors.heading }}>
                {item}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Hover Lift */}
      <div>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Hover Interactions (hover over cards)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Scale + Shadow', 'Border Accent', 'Background Shift'].map((style, i) => (
            <motion.div
              key={style}
              className="rounded-2xl p-6 cursor-pointer"
              style={{
                backgroundColor: '#fff',
                border: `1px solid ${colors.taupe}40`,
              }}
              whileHover={
                i === 0
                  ? { y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.12)' }
                  : i === 1
                  ? { borderColor: colors.violet }
                  : { backgroundColor: colors.cream }
              }
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 500, color: colors.heading, marginBottom: '0.25rem' }}>
                {style}
              </p>
              <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.muted }}>
                Hover to see effect
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timing Reference */}
      <div
        className="rounded-2xl p-8"
        style={{ backgroundColor: colors.stone, border: `1px solid ${colors.taupe}60` }}
      >
        <p className="mb-3" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: fonts.body }}>
          Animation Timing Reference
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: fonts.body }}>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: colors.heading }}>Scroll Reveals</p>
            <p className="text-sm" style={{ color: colors.body }}>500-600ms, ease [0.25, 0.1, 0.25, 1]</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: colors.heading }}>Hover States</p>
            <p className="text-sm" style={{ color: colors.body }}>200ms, ease-out</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: colors.heading }}>Stagger Delay</p>
            <p className="text-sm" style={{ color: colors.body }}>80ms between children</p>
          </div>
        </div>
      </div>
    </div>
  );
}
