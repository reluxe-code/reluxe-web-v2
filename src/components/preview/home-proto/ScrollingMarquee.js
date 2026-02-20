import { motion } from 'framer-motion';
import { colors, fontPairings, gradients } from '../tokens';

const phrases = [
  'Botox & Tox',
  'Dermal Fillers',
  'Morpheus8',
  'Laser Hair Removal',
  'Chemical Peels',
  'Luxury Facials',
  'Skin Tightening',
  'Body Contouring',
  'Lip Augmentation',
  'Microneedling',
];

function MarqueeRow({ reverse = false, fonts, speed = 30, variant = 'filled' }) {
  const items = [...phrases, ...phrases];

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex items-center whitespace-nowrap"
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {items.map((phrase, i) => (
          <span key={i} className="flex items-center">
            <span
              style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                padding: '0 1.5rem',
                ...(variant === 'filled'
                  ? {
                      color: i % 2 === 0 ? colors.heading : colors.taupe,
                    }
                  : {
                      color: 'transparent',
                      WebkitTextStroke: i % 2 === 0 ? `2px ${colors.heading}` : `1.5px ${colors.taupe}`,
                    }),
                whiteSpace: 'nowrap',
              }}
            >
              {phrase}
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i % 3 === 0 ? gradients.primary : colors.stone,
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollingMarquee({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section
      style={{
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10"
        style={{
          width: 80,
          background: 'linear-gradient(to right, #fff, transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10"
        style={{
          width: 80,
          background: 'linear-gradient(to left, #fff, transparent)',
          pointerEvents: 'none',
        }}
      />

      <div className="py-12 lg:py-16 space-y-4">
        <MarqueeRow fonts={fonts} speed={45} variant="filled" />
        <MarqueeRow fonts={fonts} speed={38} reverse variant="outline" />
      </div>
    </section>
  );
}
