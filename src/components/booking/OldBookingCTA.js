import { colors, fontPairings } from '@/components/preview/tokens';
import { trackAuditEvent } from '@/hooks/useAuditTracker';

const LOCATIONS = {
  carmel: '3ce18260-2e1f-4beb-8fcf-341bc85a682c',
  westfield: 'cf34bcaa-6702-46c6-9f5f-43be8943cc58',
};

function openBlvdDrawer(locationKey) {
  if (typeof window !== 'undefined' && window.blvd?.openBookingWidget) {
    window.blvd.openBookingWidget({
      urlParams: { locationId: LOCATIONS[locationKey] },
    });
  }
  trackAuditEvent('booking_fallback', `Fallback CTA: ${locationKey}`, { location: locationKey, source: 'page_footer' });
  if (typeof window !== 'undefined' && window.reluxeTrack) {
    window.reluxeTrack('fallback_booking_click', { location: locationKey });
  }
}

export default function OldBookingCTA({ fontKey = 'bold' }) {
  const fonts = fontPairings[fontKey];

  return (
    <section style={{ backgroundColor: colors.cream, borderTop: `1px solid ${colors.stone}` }}>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-3 text-center">
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(124,58,237,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <p
          style={{
            fontFamily: fonts.display,
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: colors.heading,
            margin: 0,
          }}
        >
          Having trouble booking?
        </p>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: '0.8125rem',
            color: colors.muted,
            margin: 0,
            maxWidth: 400,
            lineHeight: 1.5,
          }}
        >
          Our classic booking is always available as a backup.
        </p>

        <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
          <button
            onClick={() => openBlvdDrawer('westfield')}
            className="rounded-full transition-colors duration-200 hover:bg-[#7C3AED] hover:text-white hover:border-transparent"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '0.55rem 1.25rem',
              color: colors.violet,
              border: `1.5px solid ${colors.violet}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Book Westfield
          </button>
          <button
            onClick={() => openBlvdDrawer('carmel')}
            className="rounded-full transition-colors duration-200 hover:bg-[#7C3AED] hover:text-white hover:border-transparent"
            style={{
              fontFamily: fonts.body,
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '0.55rem 1.25rem',
              color: colors.violet,
              border: `1.5px solid ${colors.violet}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Book Carmel
          </button>
        </div>
      </div>
    </section>
  );
}
