import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { colors, fontPairings, typeScale, gradients } from '../tokens';

const treatments = [
  {
    name: 'Botox',
    brand: 'Allergan',
    onset: '5–7 days',
    duration: '3–4 months',
    bestFor: 'Fine lines, crow\'s feet, forehead',
    units: '20–60 units typical',
    price: 'From $12/unit',
    popularity: 'Most popular worldwide',
  },
  {
    name: 'Dysport',
    brand: 'Galderma',
    onset: '2–3 days',
    duration: '3–5 months',
    bestFor: 'Larger areas, natural movement',
    units: '50–120 units typical',
    price: 'From $4/unit',
    popularity: 'Fastest-acting option',
  },
  {
    name: 'Daxxify',
    brand: 'Revance',
    onset: '3–5 days',
    duration: '6–9 months',
    bestFor: 'Longest lasting results',
    units: '40–100 units typical',
    price: 'From $12/unit',
    popularity: 'Newest & longest lasting',
  },
];

const rows = [
  { label: 'Brand', key: 'brand' },
  { label: 'Kicks In', key: 'onset' },
  { label: 'Lasts', key: 'duration' },
  { label: 'Best For', key: 'bestFor' },
  { label: 'Typical Dose', key: 'units' },
  { label: 'Starting At', key: 'price' },
  { label: 'Known For', key: 'popularity' },
];

export default function ComparisonTable({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];
  const [highlighted, setHighlighted] = useState(null);

  return (
    <section style={{ backgroundColor: colors.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-24 lg:py-32 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              ...typeScale.label,
              color: colors.violet,
              marginBottom: '1rem',
            }}
          >
            Tox Breakdown
          </p>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.white,
              marginBottom: '1rem',
            }}
          >
            Botox vs. Dysport vs. Daxxify
          </h2>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.body.size,
              color: 'rgba(250,248,245,0.5)',
              maxWidth: '32rem',
              margin: '0 auto',
            }}
          >
            All three are FDA-approved neurotoxins that smooth wrinkles. Here&rsquo;s how they actually differ.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(250,248,245,0.08)',
            backgroundColor: 'rgba(250,248,245,0.02)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header row — treatment names */}
          <div
            className="grid items-end px-4 sm:px-6 py-5"
            style={{
              gridTemplateColumns: '140px repeat(3, 1fr)',
              borderBottom: '1px solid rgba(250,248,245,0.08)',
            }}
          >
            <span
              style={{
                fontFamily: fonts.body,
                ...typeScale.label,
                color: 'rgba(250,248,245,0.3)',
              }}
            />
            {treatments.map((t, i) => (
              <div
                key={t.name}
                className="text-center cursor-pointer px-2"
                onMouseEnter={() => setHighlighted(i)}
                onMouseLeave={() => setHighlighted(null)}
              >
                <p
                  className="transition-all duration-200"
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                    fontWeight: 700,
                    color: highlighted === i || highlighted === null ? colors.white : 'rgba(250,248,245,0.25)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: '0.6875rem',
                    color: 'rgba(250,248,245,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {t.brand}
                </p>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {rows.slice(1).map((row, i) => (
            <motion.div
              key={row.key}
              className="grid items-center px-4 sm:px-6 py-4"
              style={{
                gridTemplateColumns: '140px repeat(3, 1fr)',
                borderBottom: i < rows.length - 2 ? '1px solid rgba(250,248,245,0.04)' : 'none',
              }}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: typeScale.caption.size,
                  fontWeight: 600,
                  color: 'rgba(250,248,245,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {row.label}
              </span>
              {treatments.map((t, ti) => (
                <div
                  key={t.name}
                  className="text-center px-2 transition-opacity duration-200"
                  style={{
                    opacity: highlighted === ti || highlighted === null ? 1 : 0.35,
                  }}
                >
                  <span
                    style={{
                      fontFamily: row.key === 'price' ? fonts.display : fonts.body,
                      fontSize: row.key === 'price' ? '1rem' : typeScale.caption.size,
                      fontWeight: row.key === 'price' || row.key === 'duration' ? 600 : 400,
                      color: row.key === 'price'
                        ? colors.violet
                        : row.key === 'duration'
                          ? colors.white
                          : 'rgba(250,248,245,0.7)',
                      lineHeight: 1.4,
                    }}
                  >
                    {t[row.key]}
                  </span>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: typeScale.caption.size,
              color: 'rgba(250,248,245,0.35)',
              marginBottom: '1rem',
            }}
          >
            Not sure which is right for you? Your provider will help you decide.
          </p>
          <button
            className="rounded-full transition-all duration-200"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.75rem 2rem',
              background: gradients.primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Book a Free Consult
          </button>
        </motion.div>
      </div>
    </section>
  );
}
