import { motion } from 'framer-motion';
import { colors, gradients, typeScale } from '@/components/preview/tokens';

export function PricingMatrixBlock({ matrix, s, fonts, onBook }) {
  if (!matrix?.sections?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Transparent Pricing</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading, marginBottom: '0.5rem' }}>
            Simple, Honest Pricing
          </h2>
          {matrix.subtitle && (
            <p style={{ fontFamily: fonts.body, fontSize: typeScale.body.size, color: colors.body }}>{matrix.subtitle}</p>
          )}
        </motion.div>

        <div className="space-y-8">
          {matrix.sections.map((sec, idx) => {
            const rows = Array.isArray(sec.rows) ? sec.rows : [];
            const hasSingle = rows.some((r) => r.single);
            const hasMember = rows.some((r) => r.membership || r.member);

            return (
              <motion.div
                key={idx}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Section header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderBottom: `1px solid ${colors.stone}` }}>
                  <div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, color: colors.heading }}>{sec.title || 'Pricing'}</h3>
                    {sec.note && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body, marginTop: '0.25rem' }}>{sec.note}</p>}
                  </div>
                  {sec.membershipCallout && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5" style={{ background: gradients.primary, fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, color: '#fff' }}>
                      {sec.membershipCallout}
                    </span>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.cream }}>
                        <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'left' }}>Treatment</th>
                        {hasSingle && <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'right' }}>{sec?.headers?.single || 'Price'}</th>}
                        {hasMember && <th style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted, padding: '0.75rem 1.25rem', textAlign: 'right' }}>{sec?.headers?.member || 'Member'}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${colors.stone}` }}>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 600, color: colors.heading }}>{r.label}</span>
                            {r.subLabel && <span style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.75rem', color: colors.muted, marginTop: '0.125rem' }}>{r.subLabel}</span>}
                          </td>
                          {hasSingle && (
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              <span style={{ fontFamily: fonts.body, fontSize: '0.9375rem', fontWeight: 500, color: colors.heading }}>{r.single || '-'}</span>
                              {r.singleNote && <span style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.125rem' }}>{r.singleNote}</span>}
                            </td>
                          )}
                          {hasMember && (
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                                <span style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 600, color: '#15803d' }}>{r.membership || r.member || '-'}</span>
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                {(sec.promo || sec.ctaText) && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5" style={{ borderTop: `1px solid ${colors.stone}`, backgroundColor: colors.cream }}>
                    {sec.promo && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', color: colors.body }}>{sec.promo}</p>}
                    {sec.ctaText && (
                      <button onClick={onBook} className="rounded-full flex-shrink-0" style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.75rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                        {sec.ctaText}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
