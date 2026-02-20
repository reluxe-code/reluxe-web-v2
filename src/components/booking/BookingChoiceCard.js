import { colors } from '@/components/preview/tokens';

export default function BookingChoiceCard({
  title,
  subtitle,
  priceLabel,
  onClick,
  selected = false,
  theme = 'light',
  fonts,
}) {
  const dark = theme === 'dark';
  const cardStyle = dark
    ? {
        border: selected ? `1.5px solid ${colors.violet}` : '1px solid rgba(250,248,245,0.15)',
        backgroundColor: selected ? 'rgba(124,58,237,0.15)' : 'rgba(250,248,245,0.03)',
      }
    : {
        border: selected ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}`,
        backgroundColor: colors.cream,
      };

  return (
    <button
      onClick={onClick}
      className="rounded-xl p-4 text-left transition-all duration-200"
      style={{ ...cardStyle, cursor: 'pointer' }}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          style={{
            fontFamily: fonts?.display,
            fontSize: '1.05rem',
            fontWeight: 600,
            margin: 0,
            color: dark ? colors.white : colors.heading,
          }}
        >
          {title}
        </p>
        {priceLabel ? (
          <span
            style={{
              fontFamily: fonts?.body,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: colors.violet,
              whiteSpace: 'nowrap',
            }}
          >
            {priceLabel}
          </span>
        ) : null}
      </div>
      {subtitle ? (
        <p
          style={{
            fontFamily: fonts?.body,
            fontSize: '0.75rem',
            marginTop: '0.25rem',
            color: dark ? 'rgba(250,248,245,0.55)' : colors.muted,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </button>
  );
}
