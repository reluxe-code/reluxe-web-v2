// src/components/booking/DateStrip.js
// Horizontal scrollable strip of date buttons for booking flow.
// When dateLocationMap is provided (No Preference mode), shows location
// indicators (C/W) under each available date.
import { useRef, useEffect } from 'react';
import { colors } from '@/components/preview/tokens';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Short labels + colors for location dots
const LOC_STYLE = {
  carmel: { label: 'C', color: colors.violet },
  westfield: { label: 'W', color: '#d97706' }, // amber-600
};

function generateDateRange(startDate, days = 14) {
  const dates = [];
  const start = new Date(startDate + 'T12:00:00');
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function DateStrip({ availableDates = [], selectedDate, onSelect, fonts, startDate, dateLocationMap, locations = [] }) {
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];
  const start = startDate || today;
  const allDates = generateDateRange(start, 14);
  const availableSet = new Set(availableDates);

  // Scroll selected date into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  return (
    <>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
        {allDates.map((dateStr) => {
          const d = new Date(dateStr + 'T12:00:00');
          const dayName = DAY_NAMES[d.getDay()];
          const dateNum = d.getDate();
          const month = MONTH_NAMES[d.getMonth()];
          const isAvailable = availableSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === today;
          const dateLocs = dateLocationMap?.[dateStr] || null;

          return (
            <button
              key={dateStr}
              ref={isSelected ? selectedRef : null}
              onClick={() => isAvailable && onSelect(dateStr)}
              disabled={!isAvailable}
              className="flex-shrink-0 flex flex-col items-center rounded-xl transition-all duration-200"
              style={{
                width: 64,
                padding: '10px 0 6px',
                cursor: isAvailable ? 'pointer' : 'default',
                opacity: isAvailable ? 1 : 0.3,
                backgroundColor: isSelected ? colors.violet : isAvailable ? 'rgba(124,58,237,0.06)' : 'transparent',
                border: isSelected
                  ? `2px solid ${colors.violet}`
                  : isToday && isAvailable
                    ? `2px solid ${colors.violet}40`
                    : '2px solid transparent',
              }}
            >
              <span
                style={{
                  fontFamily: fonts?.body || 'system-ui',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: isSelected ? '#fff' : colors.muted,
                  textTransform: 'uppercase',
                }}
              >
                {dayName}
              </span>
              <span
                style={{
                  fontFamily: fonts?.body || 'system-ui',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: isSelected ? '#fff' : colors.heading,
                  lineHeight: 1.2,
                }}
              >
                {dateNum}
              </span>
              <span
                style={{
                  fontFamily: fonts?.body || 'system-ui',
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: isSelected ? 'rgba(255,255,255,0.7)' : colors.muted,
                }}
              >
                {month}
              </span>
              {/* Location indicator dots or plain dot */}
              {isAvailable && dateLocs ? (
                <span className="flex gap-0.5 mt-1 items-center justify-center">
                  {dateLocs.map((locKey) => {
                    const s = LOC_STYLE[locKey] || { label: locKey[0].toUpperCase(), color: colors.violet };
                    return (
                      <span
                        key={locKey}
                        style={{
                          fontSize: '0.5rem',
                          fontWeight: 700,
                          fontFamily: fonts?.body || 'system-ui',
                          lineHeight: 1,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : `${s.color}18`,
                          color: isSelected ? '#fff' : s.color,
                        }}
                      >
                        {s.label}
                      </span>
                    );
                  })}
                </span>
              ) : isAvailable && !isSelected ? (
                <span
                  className="rounded-full mt-1"
                  style={{
                    width: 4,
                    height: 4,
                    backgroundColor: colors.violet,
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {/* Legend when location map is active */}
      {dateLocationMap && locations.length > 1 && (
        <div className="flex gap-3 mt-2 justify-center">
          {locations.map((loc) => {
            const s = LOC_STYLE[loc.key] || { label: loc.key[0].toUpperCase(), color: colors.violet };
            return (
              <span key={loc.key} className="flex items-center gap-1" style={{ fontSize: '0.625rem', fontFamily: fonts?.body || 'system-ui', color: colors.muted }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color, display: 'inline-block' }} />
                {loc.label}
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}
