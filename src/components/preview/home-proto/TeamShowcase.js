import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const team = [
  { name: 'Shannon', role: 'Owner & Lead Injector', quote: 'Your face, your rules. I just make it happen.', initials: 'S', height: 420, offset: 40 },
  { name: 'Dr. Kim', role: 'Medical Director', quote: 'Safety first. Stunning results second.', initials: 'K', height: 480, offset: 0 },
  { name: 'Alexis', role: 'Injector', quote: 'Lips are my love language.', initials: 'A', height: 400, offset: 60 },
  { name: 'Hannah', role: 'Aesthetician', quote: 'Clear skin isn\'t luck — it\'s a plan.', initials: 'H', height: 450, offset: 20 },
  { name: 'Carlee', role: 'Laser Specialist', quote: 'Smooth skin, zero razors. You\'re welcome.', initials: 'C', height: 430, offset: 50 },
  { name: 'Anna', role: 'Injector', quote: 'Natural results that make people wonder.', initials: 'AN', height: 460, offset: 10 },
  { name: 'Jane', role: 'Aesthetician', quote: 'Every facial is a mini vacation.', initials: 'J', height: 410, offset: 45 },
  { name: 'Taylor', role: 'Patient Coordinator', quote: 'I find you the perfect appointment. Every time.', initials: 'T', height: 390, offset: 70 },
];

function ProviderCutout({ member, fonts, index, scrollProgress }) {
  // Each person rises up at a slightly different rate
  const yOffset = useTransform(
    scrollProgress,
    [0, 0.3, 0.7, 1],
    [200 + member.offset, member.offset * 0.3, 0, 0]
  );
  const opacity = useTransform(
    scrollProgress,
    [0, 0.15 + index * 0.04, 0.3 + index * 0.04, 1],
    [0, 0, 1, 1]
  );
  const bubbleOpacity = useTransform(
    scrollProgress,
    [0, 0.35 + index * 0.05, 0.5 + index * 0.05, 1],
    [0, 0, 1, 1]
  );
  const bubbleScale = useTransform(
    scrollProgress,
    [0, 0.35 + index * 0.05, 0.5 + index * 0.05, 1],
    [0.7, 0.7, 1, 1]
  );

  const gradientColors = [
    `linear-gradient(180deg, ${colors.violet}30, ${colors.violet}08)`,
    `linear-gradient(180deg, ${colors.fuchsia}25, ${colors.fuchsia}06)`,
    `linear-gradient(180deg, ${colors.rose}22, ${colors.rose}05)`,
    `linear-gradient(180deg, ${colors.violet}20, ${colors.fuchsia}08)`,
  ];

  // Alternate bubble position left/right
  const bubbleSide = index % 2 === 0 ? 'right' : 'left';

  return (
    <motion.div
      className="relative flex flex-col items-center"
      style={{
        y: yOffset,
        opacity,
        zIndex: team.length - Math.abs(index - Math.floor(team.length / 2)),
      }}
    >
      {/* Speech bubble */}
      <motion.div
        className="absolute rounded-2xl px-4 py-3"
        style={{
          opacity: bubbleOpacity,
          scale: bubbleScale,
          [bubbleSide]: '-10px',
          top: -16,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          maxWidth: 180,
          zIndex: 20,
          transformOrigin: bubbleSide === 'right' ? 'bottom left' : 'bottom right',
        }}
      >
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: colors.heading,
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{member.quote}&rdquo;
        </p>
        {/* Bubble tail */}
        <div
          className="absolute"
          style={{
            bottom: -7,
            [bubbleSide === 'right' ? 'left' : 'right']: 24,
            width: 14,
            height: 14,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderTop: 'none',
            borderLeft: bubbleSide === 'right' ? 'none' : undefined,
            borderRight: bubbleSide === 'left' ? 'none' : undefined,
            transform: 'rotate(45deg)',
            clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
          }}
        />
      </motion.div>

      {/* Provider silhouette / cutout placeholder */}
      <div
        className="relative rounded-t-3xl overflow-hidden"
        style={{
          width: 'clamp(100px, 12vw, 160px)',
          height: member.height,
          background: gradientColors[index % 4],
          borderBottom: 'none',
        }}
      >
        {/* Grain */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }}
        />

        {/* Silhouette placeholder — head & shoulders shape */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          {/* Head */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `rgba(250,248,245,0.12)`,
              marginBottom: 4,
              flexShrink: 0,
            }}
          />
          {/* Shoulders */}
          <div
            style={{
              width: '85%',
              height: 80,
              borderRadius: '50% 50% 0 0',
              background: `rgba(250,248,245,0.08)`,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Bottom fade to bg */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 60,
            background: `linear-gradient(to top, ${colors.cream}, transparent)`,
          }}
        />
      </div>

      {/* Name & role */}
      <div className="text-center mt-3">
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: colors.heading,
          }}
        >
          {member.name}
        </p>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: '0.6875rem',
            color: colors.violet,
            fontWeight: 500,
          }}
        >
          {member.role}
        </p>
      </div>
    </motion.div>
  );
}

export default function TeamShowcase({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: colors.cream,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-24 lg:pt-32 pb-8">
        <motion.div
          className="text-center mb-8"
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
            Meet the Team
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
              marginBottom: '0.75rem',
            }}
          >
            The People Behind the Glow
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: colors.body,
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            12+ expert providers across two locations — here are some of the faces you&rsquo;ll see.
          </p>
        </motion.div>

        {/* Provider cutouts — staggered heights, rising from bottom */}
        <div
          className="flex items-end justify-center gap-3 sm:gap-4 lg:gap-6"
          style={{ minHeight: 520, paddingTop: 60 }}
        >
          {team.map((member, i) => (
            <ProviderCutout
              key={member.name}
              member={member}
              fonts={fonts}
              index={i}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="text-center mt-8 pb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            className="rounded-full transition-all duration-200"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.violet,
              border: `1.5px solid ${colors.violet}`,
              padding: '0.625rem 1.75rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            Meet All Providers &rarr;
          </button>
        </motion.div>
      </div>
    </section>
  );
}
