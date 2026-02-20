import { colors, fontPairings } from '../tokens';

const fonts = fontPairings.bold;

const sections = [
  {
    name: 'White',
    bg: '#FFFFFF',
    textColor: colors.heading,
    bodyColor: colors.body,
    mutedColor: colors.muted,
    borderColor: `${colors.taupe}40`,
  },
  {
    name: 'Cream',
    bg: colors.cream,
    textColor: colors.heading,
    bodyColor: colors.body,
    mutedColor: colors.muted,
    borderColor: `${colors.taupe}60`,
  },
  {
    name: 'Stone',
    bg: colors.stone,
    textColor: colors.heading,
    bodyColor: colors.body,
    mutedColor: colors.muted,
    borderColor: `${colors.taupe}80`,
  },
  {
    name: 'Dark (Charcoal)',
    bg: colors.charcoal,
    textColor: colors.white,
    bodyColor: 'rgba(250,248,245,0.7)',
    mutedColor: 'rgba(250,248,245,0.4)',
    borderColor: 'rgba(250,248,245,0.1)',
  },
  {
    name: 'Dark (Ink)',
    bg: colors.ink,
    textColor: colors.white,
    bodyColor: 'rgba(250,248,245,0.7)',
    mutedColor: 'rgba(250,248,245,0.4)',
    borderColor: 'rgba(250,248,245,0.1)',
  },
];

export default function SectionBackgrounds() {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.name}
          className="rounded-2xl px-8 lg:px-12 py-12 lg:py-16"
          style={{ backgroundColor: section.bg, border: `1px solid ${section.borderColor}` }}
        >
          <p
            className="mb-2"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: section.mutedColor,
            }}
          >
            {section.name} Background
          </p>
          <h3
            className="mb-3"
            style={{
              fontFamily: fonts.display,
              fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
              fontWeight: 500,
              lineHeight: 1.2,
              color: section.textColor,
            }}
          >
            Section Heading Example
          </h3>
          <p
            className="max-w-2xl"
            style={{
              fontFamily: fonts.body,
              fontSize: '1rem',
              lineHeight: 1.625,
              color: section.bodyColor,
            }}
          >
            This is how body text looks on this background. The contrast should be
            comfortable to read while maintaining the warm, luxurious tone of the
            overall design system.
          </p>
        </div>
      ))}
    </div>
  );
}
