import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const perks = [
  { icon: '💰', title: 'Save Up to 20%', detail: 'On every single treatment' },
  { icon: '🎂', title: 'Birthday Freebie', detail: 'Annual complimentary treatment' },
  { icon: '📅', title: 'Priority Booking', detail: 'First access to appointments' },
  { icon: '🎉', title: 'Member Events', detail: 'Exclusive launches & parties' },
];

export default function MembershipCTA({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.stone }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Card visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Membership card */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                aspectRatio: '16/10',
                background: gradients.dark,
              }}
            >
              {/* Gradient accent arc */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -80,
                  right: -40,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${colors.violet}25, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Grain */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
                  pointerEvents: 'none',
                }}
              />

              {/* Card content */}
              <div className="relative p-8 lg:p-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        ...typeScale.label,
                        color: colors.violet,
                        marginBottom: '0.25rem',
                      }}
                    >
                      Luxe Membership
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: colors.white,
                      }}
                    >
                      RELUXE
                    </p>
                  </div>
                  <div
                    className="rounded-full px-4 py-2"
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.body,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.violet,
                      }}
                    >
                      VIP
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                        fontWeight: 700,
                        color: colors.white,
                        lineHeight: 1,
                      }}
                    >
                      $99
                    </span>
                    <span
                      style={{
                        fontFamily: fonts.body,
                        fontSize: typeScale.body.size,
                        color: 'rgba(250,248,245,0.4)',
                      }}
                    >
                      /month
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: fonts.body,
                      fontSize: typeScale.caption.size,
                      color: 'rgba(250,248,245,0.35)',
                    }}
                  >
                    Cancel anytime. No contracts.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: colors.violet,
                marginBottom: '1rem',
              }}
            >
              Members Only
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: typeScale.sectionHeading.size,
                fontWeight: typeScale.sectionHeading.weight,
                lineHeight: typeScale.sectionHeading.lineHeight,
                color: colors.heading,
                marginBottom: '1rem',
              }}
            >
              The VIP Treatment — Every Visit
            </h2>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                lineHeight: typeScale.body.lineHeight,
                color: colors.body,
                marginBottom: '2rem',
                maxWidth: '28rem',
              }}
            >
              Join Luxe Membership and save on every treatment, get exclusive perks,
              and never miss out on the good stuff.
            </p>

            {/* Perks grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                >
                  <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: 2 }}>
                    {perk.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: colors.heading,
                        marginBottom: '0.125rem',
                      }}
                    >
                      {perk.title}
                    </p>
                    <p
                      style={{
                        fontFamily: fonts.body,
                        fontSize: typeScale.caption.size,
                        color: colors.muted,
                      }}
                    >
                      {perk.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

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
              Become a Member &rarr;
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
