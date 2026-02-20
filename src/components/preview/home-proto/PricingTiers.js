import { motion } from 'framer-motion';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const tiers = [
  {
    name: 'First Timer',
    price: null,
    priceLabel: 'Free Consult',
    description: 'Not sure where to start? We\'ll build you a custom plan — no commitment.',
    features: [
      'Personalized assessment',
      'Custom treatment plan',
      'Transparent pricing',
      'No pressure, ever',
    ],
    cta: 'Book Free Consult',
    highlighted: false,
  },
  {
    name: 'Luxe Member',
    price: '$99',
    priceLabel: '/month',
    description: 'Our most popular option. Save on every visit and get VIP access.',
    features: [
      'Up to 20% off all treatments',
      'Monthly B12 or Lip Hydration',
      'Priority booking',
      'Exclusive member events',
      'Birthday treatment on us',
      'Product discounts',
    ],
    cta: 'Start Membership',
    highlighted: true,
  },
  {
    name: 'À La Carte',
    price: null,
    priceLabel: 'Pay per visit',
    description: 'Come when you want, get what you want. Simple transparent pricing.',
    features: [
      'Full service menu access',
      'Flexible scheduling',
      'Package discounts available',
      'Loyalty points on every visit',
    ],
    cta: 'View Pricing',
    highlighted: false,
  },
];

export default function PricingTiers({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.stone }}>
      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
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
            Simple Pricing
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
            Pick Your Path
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: colors.body,
              maxWidth: '30rem',
              margin: '0 auto',
            }}
          >
            Whether you're a first-timer or a regular, there's a way in that fits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className="relative rounded-3xl overflow-hidden"
              style={{
                backgroundColor: tier.highlighted ? colors.ink : '#fff',
                border: tier.highlighted ? 'none' : `1px solid ${colors.taupe}`,
                padding: tier.highlighted ? 0 : undefined,
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Highlighted card: gradient top bar */}
              {tier.highlighted && (
                <div style={{ height: 4, background: gradients.primary }} />
              )}

              <div style={{ padding: '2rem' }}>
                {/* Badge for highlighted */}
                {tier.highlighted && (
                  <span
                    className="inline-block rounded-full mb-4"
                    style={{
                      fontFamily: fonts.body,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '0.375rem 1rem',
                      background: 'rgba(124,58,237,0.2)',
                      color: colors.violet,
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <h3
                  style={{
                    fontFamily: fonts.display,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: tier.highlighted ? colors.white : colors.heading,
                    marginBottom: '0.5rem',
                  }}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  {tier.price ? (
                    <>
                      <span
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 'clamp(2rem, 4vw, 3rem)',
                          fontWeight: 700,
                          color: tier.highlighted ? colors.white : colors.heading,
                          lineHeight: 1,
                        }}
                      >
                        {tier.price}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: typeScale.body.size,
                          color: tier.highlighted ? 'rgba(250,248,245,0.5)' : colors.muted,
                        }}
                      >
                        {tier.priceLabel}
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontFamily: fonts.display,
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: tier.highlighted ? colors.white : colors.violet,
                        lineHeight: 1.2,
                      }}
                    >
                      {tier.priceLabel}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: typeScale.body.size,
                    lineHeight: typeScale.body.lineHeight,
                    color: tier.highlighted ? 'rgba(250,248,245,0.65)' : colors.body,
                    marginBottom: '1.5rem',
                  }}
                >
                  {tier.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        style={{
                          color: colors.violet,
                          fontSize: '0.875rem',
                          lineHeight: '1.625rem',
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.body,
                          fontSize: typeScale.body.size,
                          color: tier.highlighted ? 'rgba(250,248,245,0.8)' : colors.body,
                          lineHeight: typeScale.body.lineHeight,
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="w-full rounded-full text-center transition-all duration-200"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    padding: '0.875rem 2rem',
                    background: tier.highlighted ? gradients.primary : 'transparent',
                    color: tier.highlighted ? '#fff' : colors.violet,
                    border: tier.highlighted ? 'none' : `1.5px solid ${colors.violet}`,
                    cursor: 'pointer',
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
