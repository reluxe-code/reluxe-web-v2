import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale } from '../tokens';

const testimonials = [
  {
    quote: 'The team at RELUXE made me feel so comfortable. My results are incredible — natural and exactly what I wanted.',
    name: 'Sarah M.',
    service: 'Botox',
    location: 'Westfield',
    rating: 5,
  },
  {
    quote: "I've been to several med spas and RELUXE is hands down the best. The attention to detail is unmatched.",
    name: 'Jessica K.',
    service: 'Morpheus8',
    location: 'Westfield',
    rating: 5,
  },
  {
    quote: 'From my first consultation to my latest treatment, every visit has been amazing. I trust them completely with my skin.',
    name: 'Amanda R.',
    service: 'Laser Hair Removal',
    location: 'Carmel',
    rating: 5,
  },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function TestimonialsSection({ fontKey = 'bold' }) {
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
            Don&apos;t Take Our Word for It
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
            Our Patients Said It Best
          </h2>
          <p
            className="max-w-md mx-auto"
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              lineHeight: typeScale.body.lineHeight,
              color: colors.body,
            }}
          >
            500+ five-star reviews. Zero bought. Here&apos;s what the real ones have to say.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="rounded-2xl p-6 lg:p-8 relative"
              style={{
                backgroundColor: colors.cream,
                borderLeft: `3px solid ${colors.violet}`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={colors.violet}>
                    <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7L8 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                className="mb-6"
                style={{
                  fontFamily: fonts.body,
                  fontSize: '1rem',
                  color: colors.body,
                  lineHeight: 1.625,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: colors.stone,
                    color: colors.muted,
                    fontFamily: fonts.body,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.heading, fontFamily: fonts.body }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.muted, fontFamily: fonts.body }}
                  >
                    {t.service} &middot; {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust signal */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.muted }}>
            4.9 stars across 500+ reviews on Google &amp; Trustindex
          </p>
        </motion.div>
      </div>
    </section>
  );
}
