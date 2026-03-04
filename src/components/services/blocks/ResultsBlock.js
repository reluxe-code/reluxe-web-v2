import { motion } from 'framer-motion';
import { colors, typeScale } from '@/components/preview/tokens';

export function ResultsBlock({ results, s, fonts }) {
  if (!results?.length) return null;
  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontFamily: fonts.body, ...typeScale.label, color: colors.violet, marginBottom: '0.75rem' }}>Real Results</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: typeScale.sectionHeading.size, fontWeight: typeScale.sectionHeading.weight, lineHeight: typeScale.sectionHeading.lineHeight, color: colors.heading }}>
            Before &amp; After
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.slice(0, 6).map((img, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ aspectRatio: '1', position: 'relative', border: `1px solid ${colors.stone}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <img src={img.src} alt={img.alt || `Result ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
