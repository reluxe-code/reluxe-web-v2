import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function ProvidersBlock({ providers, s, fonts }) {
  if (!providers?.length) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Expert Team</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Your {s.name} Providers
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden group"
              style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              {/* Headshot */}
              <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                {p.headshotUrl ? (
                  <img src={p.headshotUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${colors.violet}20, ${colors.fuchsia}12)` }} />
                )}
              </div>
              <div className="p-5">
                <h3 style={{ fontFamily: fonts.display, fontSize: '1.0625rem', fontWeight: 600, color: colors.heading, marginBottom: '0.125rem' }}>{p.name}</h3>
                {p.title && <p style={{ fontFamily: fonts.body, fontSize: '0.8125rem', fontWeight: 500, color: colors.violet, marginBottom: '0.5rem' }}>{p.title}</p>}
                {p.bio && <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: colors.body, lineHeight: 1.5, marginBottom: '0.75rem' }}>{p.bio}</p>}
                {p.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.specialties.map((sp, j) => (
                      <span key={j} className="rounded-full px-2.5 py-1" style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 500, color: colors.heading, backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}>
                        {sp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
