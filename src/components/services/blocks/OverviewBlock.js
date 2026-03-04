import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function OverviewBlock({ s, fonts }) {
  if (!s.overview?.p1 && !s.overview?.p2 && !s.whyReluxe?.length) return null;
  const why = Array.isArray(s.whyReluxe) ? s.whyReluxe.slice(0, 6) : [];

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Overview text */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>About This Treatment</p>
              <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '1.5rem' }}>
                {s.name}
              </h2>
              {s.overview?.p1 && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: 1.7, color: colors.body, marginBottom: '1rem' }}>
                  {s.overview.p1}
                </p>
              )}
              {s.overview?.p2 && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, lineHeight: 1.7, color: colors.body }}>
                  {s.overview.p2}
                </p>
              )}
            </motion.div>
          </div>

          {/* Why RELUXE sidebar */}
          {why.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="rounded-2xl p-6" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.5rem' }}>Why Choose</p>
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.heading, marginBottom: '1rem' }}>RELUXE</h3>
                <div className="space-y-4">
                  {why.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: `${colors.violet}15`, marginTop: 2 }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <div>
                        <p style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{item.title}</p>
                        {item.body && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, lineHeight: 1.5, marginTop: '0.125rem' }}>{item.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
