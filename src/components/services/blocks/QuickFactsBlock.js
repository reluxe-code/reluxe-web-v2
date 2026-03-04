import { motion } from 'framer-motion';
import { colors } from '@/components/preview/tokens';

export function QuickFactsBlock({ facts, fonts }) {
  if (!facts?.length) return null;
  return (
    <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.stone}` }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {facts.map((fact, i) => (
            <motion.div
              key={i}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5"
              style={{ backgroundColor: colors.cream, border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <span style={{ fontFamily: fonts.body, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.muted }}>{fact.label}</span>
              <span style={{ fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, color: colors.heading }}>{fact.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
