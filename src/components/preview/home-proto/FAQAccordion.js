import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { colors, fontPairings, typeScale } from '../tokens';

const faqs = [
  {
    q: 'What should I expect at my first visit?',
    a: 'Your first appointment starts with a one-on-one consultation with your provider. We\'ll discuss your goals, review your options, and build a personalized plan — no pressure, no hard sell. Most first-time treatments can happen the same day if you\'re ready.',
  },
  {
    q: 'How do I know which treatment is right for me?',
    a: 'That\'s what your consult is for. Our providers are experts at matching your goals with the right treatments. Whether you want subtle refinement or a full glow-up, we\'ll walk you through every option with transparent pricing.',
  },
  {
    q: 'Does it hurt? What\'s the downtime?',
    a: 'Most treatments involve minimal discomfort — we use numbing cream and other comfort measures. Downtime varies: Botox and fillers have virtually zero downtime, while treatments like Morpheus8 may need 2–3 days of mild redness. We\'ll cover all of this before you commit.',
  },
  {
    q: 'How much does treatment cost?',
    a: 'Pricing depends on the treatment and your custom plan. Botox starts at $12/unit, fillers start at $650/syringe, and our Luxe Membership saves you up to 20% on everything. We\'ll always give you exact pricing before any work is done.',
  },
  {
    q: 'Do you offer financing?',
    a: 'Yes! We offer flexible financing through CareCredit and Cherry, with plans starting at 0% APR. Our patient coordinators can help you find a payment option that works for your budget.',
  },
  {
    q: 'What makes RELUXE different from other med spas?',
    a: 'We\'re not a volume mill. Every provider is rigorously trained, our Medical Director oversees every treatment plan, and we use only premium, FDA-approved products. Plus our two luxury locations are designed so you actually enjoy being here.',
  },
];

function AccordionItem({ faq, isOpen, onToggle, fonts, index }) {
  return (
    <motion.div
      className="border-b"
      style={{ borderColor: colors.stone }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <button
        className="w-full text-left py-6 flex items-center justify-between gap-4 transition-colors duration-200"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: isOpen ? colors.violet : colors.heading,
            transition: 'color 0.2s',
          }}
        >
          {faq.q}
        </span>
        <motion.span
          style={{
            fontSize: '1.25rem',
            color: colors.muted,
            flexShrink: 0,
            display: 'block',
            width: 24,
            height: 24,
            lineHeight: '24px',
            textAlign: 'center',
          }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              className="pb-6"
              style={{
                fontFamily: fonts.body,
                fontSize: typeScale.body.size,
                lineHeight: typeScale.body.lineHeight,
                color: colors.body,
                maxWidth: '48rem',
                paddingRight: '2rem',
              }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQAccordion({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32">
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
            Common Questions
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
            }}
          >
            Got Questions? We Got You.
          </h2>
        </motion.div>

        <div className="border-t" style={{ borderColor: colors.stone }}>
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              fonts={fonts}
              index={i}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: colors.muted,
              marginBottom: '1rem',
            }}
          >
            Still have questions?
          </p>
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
            Contact Us &rarr;
          </button>
        </motion.div>
      </div>
    </section>
  );
}
