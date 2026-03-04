import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function ComparisonBlock({ comparison, fonts }) {
  if (!comparison?.columns?.length || !comparison?.rows?.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Compare Options</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Which One Is Right for You?
          </h2>
        </motion.div>
        <motion.div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${colors.stone}` }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: colors.cream }}>
                  <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'left' }} />
                  {comparison.columns.map((col, i) => (
                    <th key={i} style={{ fontFamily: fonts.display, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading, padding: '0.75rem 1rem', textAlign: 'center' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${colors.stone}` }}>
                    <td style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading, padding: '0.875rem 1.25rem' }}>{row.label}</td>
                    {row.options.map((opt, j) => (
                      <td key={j} style={{ fontFamily: fonts.body, fontSize: '0.875rem', color: colors.body, padding: '0.875rem 1rem', textAlign: 'center' }}>{opt.value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
