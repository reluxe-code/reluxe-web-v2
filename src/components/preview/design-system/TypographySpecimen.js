import { fontPairings, typeScale, colors } from '../tokens';

const sampleText = {
  hero: 'Luxury Aesthetics, Redefined',
  section: 'Treatments Designed for You',
  subhead: 'Expert providers. Premium results. Two locations.',
  body: 'At RELUXE, we believe luxury is personal. Our board-certified providers combine artistry with advanced techniques to deliver results that look natural, feel effortless, and reflect the best version of you.',
  caption: 'Botox \u00b7 Dysport \u00b7 Filler \u00b7 Morpheus8 \u00b7 Laser Hair Removal',
  label: 'Featured Service',
};

function Specimen({ pairing, fontKey }) {
  const fonts = fontPairings[fontKey];

  return (
    <div
      className="rounded-2xl p-8 lg:p-10"
      style={{ backgroundColor: colors.cream, border: `1px solid ${colors.taupe}` }}
    >
      {/* Pairing name badge */}
      <div
        className="inline-block rounded-full px-4 py-1.5 mb-8"
        style={{
          background: colors.ink,
          color: colors.white,
          fontFamily: fonts.body,
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {fonts.name}
      </div>

      {/* Font names */}
      <p
        className="mb-6"
        style={{
          fontFamily: fonts.body,
          fontSize: '0.8125rem',
          color: colors.muted,
          lineHeight: 1.6,
        }}
      >
        Display: <strong>{fontKey === 'bold' ? 'Playfair Display' : fontKey === 'dramatic' ? 'Bodoni Moda' : 'Space Grotesk'}</strong>
        <br />
        Body: <strong>{fontKey === 'bold' ? 'Outfit' : fontKey === 'dramatic' ? 'Manrope' : 'Plus Jakarta Sans'}</strong>
      </p>

      {/* Hero */}
      <p
        style={{
          fontFamily: fonts.display,
          fontSize: typeScale.hero.size,
          fontWeight: typeScale.hero.weight,
          lineHeight: typeScale.hero.lineHeight,
          color: colors.heading,
          marginBottom: '1.5rem',
        }}
      >
        {sampleText.hero}
      </p>

      {/* Section heading */}
      <p
        style={{
          fontFamily: fonts.display,
          fontSize: typeScale.sectionHeading.size,
          fontWeight: typeScale.sectionHeading.weight,
          lineHeight: typeScale.sectionHeading.lineHeight,
          color: colors.heading,
          marginBottom: '1rem',
        }}
      >
        {sampleText.section}
      </p>

      {/* Subhead */}
      <p
        style={{
          fontFamily: fonts.body,
          fontSize: typeScale.subhead.size,
          fontWeight: typeScale.subhead.weight,
          lineHeight: typeScale.subhead.lineHeight,
          color: colors.body,
          marginBottom: '1rem',
        }}
      >
        {sampleText.subhead}
      </p>

      {/* Body */}
      <p
        style={{
          fontFamily: fonts.body,
          fontSize: typeScale.body.size,
          fontWeight: typeScale.body.weight,
          lineHeight: typeScale.body.lineHeight,
          color: colors.body,
          marginBottom: '1rem',
        }}
      >
        {sampleText.body}
      </p>

      {/* Caption */}
      <p
        style={{
          fontFamily: fonts.body,
          fontSize: typeScale.caption.size,
          fontWeight: typeScale.caption.weight,
          lineHeight: typeScale.caption.lineHeight,
          color: colors.muted,
          marginBottom: '1rem',
        }}
      >
        {sampleText.caption}
      </p>

      {/* Label */}
      <p
        style={{
          fontFamily: fonts.body,
          fontSize: typeScale.label.size,
          fontWeight: typeScale.label.weight,
          lineHeight: typeScale.label.lineHeight,
          letterSpacing: typeScale.label.letterSpacing,
          textTransform: typeScale.label.textTransform,
          color: colors.violet,
        }}
      >
        {sampleText.label}
      </p>
    </div>
  );
}

export default function TypographySpecimen() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.keys(fontPairings).map((key) => (
        <Specimen key={key} fontKey={key} pairing={fontPairings[key]} />
      ))}
    </div>
  );
}
