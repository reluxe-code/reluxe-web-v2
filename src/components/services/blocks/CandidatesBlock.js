import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function CandidatesBlock({ candidates, fonts }) {
  if (!candidates?.good?.length && !candidates?.notIdeal?.length) return null;
  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Is It Right for You?</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Good Candidates
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.good?.length > 0 && (
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: '#166534', marginBottom: '1rem' }}>Great For</h3>
              <div className="flex flex-wrap gap-2">
                {candidates.good.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5" style={{ backgroundColor: '#dcfce7', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: '#15803d' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          {candidates.notIdeal?.length > 0 && (
            <motion.div className="rounded-2xl p-6" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: '#92400e', marginBottom: '1rem' }}>Not Ideal If</h3>
              <div className="flex flex-wrap gap-2">
                {candidates.notIdeal.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5" style={{ backgroundColor: '#fef3c7', fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: '#92400e' }}>
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
