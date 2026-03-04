import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function PrepAftercareBlock({ prepAftercare, fonts }) {
  if (!prepAftercare?.prep?.points?.length && !prepAftercare?.after?.points?.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Your Guide</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Prep &amp; Aftercare
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[prepAftercare.prep, prepAftercare.after].filter(Boolean).map((col, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.heading, marginBottom: '1rem' }}>{col.title}</h3>
              <ul className="space-y-2.5">
                {col.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" fill={idx === 0 ? `${colors.violet}15` : '#dcfce7'} />
                      <path d="M5 8L7 10L11 6" stroke={idx === 0 ? colors.violet : '#15803d'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
