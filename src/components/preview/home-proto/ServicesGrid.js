import { motion } from 'framer-motion';
import { colors, gradients, fontPairings, typeScale } from '../tokens';

const featuredServices = [
  {
    name: 'Botox & Tox',
    tagline: 'Your wrinkles don\u2019t stand a chance.',
    href: '/services/tox',
    startingAt: '$10/unit',
    size: 'large',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
  },
  {
    name: 'Dermal Fillers',
    tagline: 'Cheeks. Lips. Jawline. Yes, all of it.',
    href: '/services/filler',
    startingAt: '$650',
    size: 'standard',
    gradient: 'linear-gradient(135deg, #C026D3, #9333EA)',
  },
  {
    name: 'Morpheus8',
    tagline: 'Skin tightening that actually works.',
    href: '/services/morpheus8',
    startingAt: '$800',
    size: 'standard',
    gradient: 'linear-gradient(135deg, #E11D73, #C026D3)',
  },
  {
    name: 'Laser Hair Removal',
    tagline: 'Razor? Don\u2019t know her.',
    href: '/services/laser-hair-removal',
    startingAt: '$75/session',
    size: 'standard',
    gradient: 'linear-gradient(135deg, #5B21B6, #1E1B4B)',
  },
  {
    name: 'Lasers & Skin',
    tagline: 'IPL, ClearLift, CO\u2082 \u2014 pick your weapon.',
    href: '/services/lasers',
    size: 'standard',
    gradient: 'linear-gradient(135deg, #9333EA, #7C3AED)',
  },
  {
    name: 'Facials & Peels',
    tagline: 'Because great skin isn\u2019t luck. It\u2019s us.',
    href: '/services/facials',
    startingAt: '$99',
    size: 'large',
    gradient: 'linear-gradient(135deg, #1A1A1A, #2A2A2A)',
  },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function ServicesGrid({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        {/* Section header */}
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
            What We Do Best
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
            Pick Your Power Move
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
            Every treatment is tailored to you — your skin, your goals, your timeline.
            No cookie-cutter plans.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {featuredServices.map((service) => (
            <motion.div
              key={service.name}
              variants={staggerItem}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                service.size === 'large' ? 'lg:col-span-2' : ''
              }`}
              style={{ minHeight: service.size === 'large' ? '280px' : '260px' }}
            >
              {/* Background gradient — swap for treatment photos later */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{ background: service.gradient }}
              />

              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: '128px 128px',
                }}
              />

              {/* Bottom gradient for text readability */}
              <div
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                  opacity: 0.5,
                }}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6 lg:p-8">
                {/* Top — price badge */}
                <div className="flex justify-end">
                  {service.startingAt && (
                    <span
                      className="inline-block rounded-full px-3 py-1"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        fontFamily: fonts.body,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      From {service.startingAt}
                    </span>
                  )}
                </div>

                {/* Bottom — title + tagline + arrow */}
                <div>
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: fonts.display,
                      fontSize: service.size === 'large' ? 'clamp(1.5rem, 3vw, 2.25rem)' : '1.375rem',
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.1,
                    }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="mb-3"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.9375rem',
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.5,
                    }}
                  >
                    {service.tagline}
                  </p>

                  <span
                    className="inline-flex items-center gap-2 transition-all duration-200 group-hover:gap-3"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    Explore
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <path
                        d="M4 9H14M14 9L10 5M14 9L10 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
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
            View All Treatments
          </button>
        </motion.div>
      </div>
    </section>
  );
}
