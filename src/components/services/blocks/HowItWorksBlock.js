import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function HowItWorksBlock({ steps, fonts }) {
  if (!steps?.length) return null;
  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: grain, pointerEvents: 'none' }} />
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>The Process</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.white }}>
            How It Works
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="inline-flex items-center justify-center rounded-full mb-4" style={{ width: 48, height: 48, background: `${colors.violet}20`, fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 700, color: colors.violet }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ fontFamily: fonts.display, fontSize: '1.125rem', fontWeight: 600, color: colors.white, marginBottom: '0.5rem' }}>
                {step.title || `Step ${i + 1}`}
              </h3>
              {step.body && (
                <p style={{ fontFamily: fonts.body, fontSize: typeScale.caption.size, color: 'rgba(250,248,245,0.5)', lineHeight: 1.6 }}>
                  {step.body}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
