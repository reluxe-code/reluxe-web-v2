import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function FAQBlock({ faq, s, fonts }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!faq?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>FAQ</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Common Questions About {s.name}
          </h2>
        </motion.div>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <motion.div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <button
                className="w-full text-left p-5 flex items-center justify-between gap-4"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{item.q}</span>
                <motion.svg
                  width="20" height="20" viewBox="0 0 20 20" fill="none"
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M5 8L10 13L15 8" stroke={colors.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-5 pb-5">
                      <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6 }}>{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
