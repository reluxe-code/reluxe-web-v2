// src/components/booking/TimeGrid.js
// Grid of time slot pills for booking flow.
// Optionally shows time ranges (e.g. "1:00 - 1:30 PM") when duration is provided.
import { colors } from '@/components/preview/tokens';

function formatTime(isoOrTime) {
  try {
    const str = String(isoOrTime);
    const d = str.includes('T') ? new Date(str) : new Date(`2026-01-01T${str}`);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return isoOrTime;
  }
}

function formatTimeRange(startIso, durationMinutes) {
  try {
    const str = String(startIso);
    const start = str.includes('T') ? new Date(str) : new Date(`2026-01-01T${str}`);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startStr} – ${endStr}`;
  } catch {
    return formatTime(startIso);
  }
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg animate-pulse"
          style={{ height: 42, backgroundColor: colors.stone }}
        />
      ))}
    </div>
  );
}

export default function TimeGrid({ times = [], selectedTimeId, onSelect, loading, fonts, duration }) {
  if (loading) return <Skeleton />;

  if (!times.length) {
    return (
      <div className="text-center py-6">
        <p
          style={{
            fontFamily: fonts?.body || 'system-ui',
            fontSize: '0.875rem',
            color: colors.muted,
          }}
        >
          No times available for this date. Try another day.
        </p>
      </div>
    );
  }

  const showRange = duration && duration > 0;
  const cols = showRange ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div className={`grid ${cols} gap-2`}>
      {times.map((slot) => {
        const isSelected = selectedTimeId === slot.id;
        return (
          <button
            key={slot.locationKey ? `${slot.id}-${slot.locationKey}` : slot.id}
            onClick={() => onSelect(slot)}
            className="rounded-lg transition-all duration-200"
            style={{
              padding: slot.locationLabel ? '8px 8px 6px' : '10px 8px',
              fontFamily: fonts?.body || 'system-ui',
              fontSize: showRange ? '0.75rem' : '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: isSelected ? `2px solid ${colors.violet}` : `1px solid ${colors.stone}`,
              backgroundColor: isSelected ? colors.violet : '#fff',
              color: isSelected ? '#fff' : colors.heading,
              whiteSpace: 'nowrap',
            }}
          >
            {showRange ? formatTimeRange(slot.startTime, duration) : formatTime(slot.startTime)}
            {slot.locationLabel && (
              <span style={{ display: 'block', fontSize: '0.5625rem', fontWeight: 500, opacity: 0.7, marginTop: 1 }}>
                {slot.locationLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
