import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function TestimonialsBlock({ testimonials, s, fonts }) {
  const withText = (testimonials || []).filter(t => (t.quote || t.text || '').replace(/<[^>]*>/g, '').trim().length > 0);
  if (!withText.length) return null;

  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Reviews</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            What Our Patients Say
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {withText.slice(0, 6).map((t, i) => {
            const rawName = t.author_name || t.author || 'Patient';
            const name = rawName.includes(' ') ? rawName.split(' ')[0] + ' ' + rawName.split(' ').pop()[0] + '.' : rawName;
            const text = t.quote || t.text || '';
            const rating = t.rating || 5;

            return (
              <motion.div
                key={i}
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(rating)].map((_, j) => (
                    <span key={j} style={{ color: colors.violet, fontSize: '0.875rem' }}>&#9733;</span>
                  ))}
                </div>
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                  &ldquo;{text.length > 200 ? text.slice(0, 200) + '...' : text}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.stone}` }}>
                  <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${colors.violet}10` }}>
                    <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: colors.violet }}>{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>{name}</p>
                    {(t.service || t.location) && (
                      <p style={{ fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted }}>{t.service}{t.location ? ` \u2022 ${t.location}` : ''}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
