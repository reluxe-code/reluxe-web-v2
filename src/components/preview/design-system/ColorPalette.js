import { colors, gradients } from '../tokens';

const swatchGroups = [
  {
    label: 'Backgrounds',
    swatches: [
      { name: 'Cream', value: colors.cream, textDark: true },
      { name: 'Stone', value: colors.stone, textDark: true },
      { name: 'Taupe', value: colors.taupe, textDark: true },
      { name: 'Charcoal', value: colors.charcoal, textDark: false },
      { name: 'Ink', value: colors.ink, textDark: false },
    ],
  },
  {
    label: 'Accents',
    swatches: [
      { name: 'Violet', value: colors.violet, textDark: false },
      { name: 'Fuchsia', value: colors.fuchsia, textDark: false },
      { name: 'Rose', value: colors.rose, textDark: false },
    ],
  },
  {
    label: 'Text',
    swatches: [
      { name: 'Heading', value: colors.heading, textDark: false },
      { name: 'Body', value: colors.body, textDark: false },
      { name: 'Muted', value: colors.muted, textDark: false },
    ],
  },
];

export default function ColorPalette() {
  return (
    <div>
      {swatchGroups.map((group) => (
        <div key={group.label} className="mb-12">
          <p
            className="mb-4"
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {group.label}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {group.swatches.map((swatch) => (
              <div key={swatch.name}>
                <div
                  className="w-full aspect-[4/3] rounded-xl shadow-sm"
                  style={{
                    backgroundColor: swatch.value,
                    border: swatch.value === colors.cream ? '1px solid #E0D9CF' : 'none',
                  }}
                />
                <p
                  className="mt-2 text-sm font-medium"
                  style={{ color: colors.heading }}
                >
                  {swatch.name}
                </p>
                <p
                  className="text-xs font-mono"
                  style={{ color: colors.muted }}
                >
                  {swatch.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Gradient swatches */}
      <div className="mb-12">
        <p
          className="mb-4"
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.muted,
          }}
        >
          Gradients
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(gradients).map(([name, value]) => (
            <div key={name}>
              <div
                className="w-full h-24 rounded-xl shadow-sm"
                style={{ background: value }}
              />
              <p
                className="mt-2 text-sm font-medium capitalize"
                style={{ color: colors.heading }}
              >
                {name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
