import { colors, gradients, fontPairings } from '../tokens';

const bodyFont = fontPairings.bold.body;

const sizes = {
  sm: { padding: '0.5rem 1.25rem', fontSize: '0.875rem' },
  md: { padding: '0.75rem 2rem', fontSize: '1rem' },
  lg: { padding: '1rem 2.5rem', fontSize: '1.125rem' },
};

function PrimaryButton({ size = 'md', children }) {
  const s = sizes[size];
  return (
    <button
      className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: gradients.primary,
        color: '#fff',
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: bodyFont,
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ size = 'md', children }) {
  const s = sizes[size];
  return (
    <button
      className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:bg-lux-violet/10"
      style={{
        background: 'transparent',
        color: colors.violet,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: bodyFont,
        fontWeight: 500,
        border: `1.5px solid ${colors.violet}`,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ size = 'md', children }) {
  const s = sizes[size];
  return (
    <button
      className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:bg-lux-ink/5"
      style={{
        background: 'transparent',
        color: colors.heading,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: bodyFont,
        fontWeight: 500,
        border: `1.5px solid ${colors.taupe}`,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function ButtonShowcase() {
  return (
    <div className="space-y-12">
      {/* On light background */}
      <div className="rounded-2xl p-8 lg:p-10" style={{ backgroundColor: colors.cream, border: `1px solid ${colors.taupe}` }}>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.muted, fontFamily: bodyFont }}>
          On Light Background
        </p>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm" style={{ color: colors.muted, fontFamily: bodyFont }}>Primary — Gradient Fill</p>
            <div className="flex flex-wrap items-center gap-4">
              <PrimaryButton size="sm">Book Now</PrimaryButton>
              <PrimaryButton size="md">Book Now</PrimaryButton>
              <PrimaryButton size="lg">Book Now</PrimaryButton>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm" style={{ color: colors.muted, fontFamily: bodyFont }}>Secondary — Outline</p>
            <div className="flex flex-wrap items-center gap-4">
              <SecondaryButton size="sm">Explore Treatments</SecondaryButton>
              <SecondaryButton size="md">Explore Treatments</SecondaryButton>
              <SecondaryButton size="lg">Explore Treatments</SecondaryButton>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm" style={{ color: colors.muted, fontFamily: bodyFont }}>Ghost — Neutral Outline</p>
            <div className="flex flex-wrap items-center gap-4">
              <GhostButton size="sm">Learn More</GhostButton>
              <GhostButton size="md">Learn More</GhostButton>
              <GhostButton size="lg">Learn More</GhostButton>
            </div>
          </div>
        </div>
      </div>

      {/* On dark background */}
      <div className="rounded-2xl p-8 lg:p-10" style={{ backgroundColor: colors.ink }}>
        <p className="mb-6" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,248,245,0.5)', fontFamily: bodyFont }}>
          On Dark Background
        </p>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton size="md">Book Now</PrimaryButton>
            <button
              className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'transparent',
                color: colors.white,
                padding: sizes.md.padding,
                fontSize: sizes.md.fontSize,
                fontFamily: bodyFont,
                fontWeight: 500,
                border: `1.5px solid rgba(250,248,245,0.3)`,
                cursor: 'pointer',
              }}
            >
              Explore Treatments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
