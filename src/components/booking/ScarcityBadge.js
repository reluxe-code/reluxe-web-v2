// src/components/booking/ScarcityBadge.js
// Shows real-time availability counts as urgency signals.
// Variants: 'inline' (compact text), 'sidebar' (Today / This Week / Next Week), 'dot' (pulse dot)
import useSWR from 'swr';
import { colors } from '@/components/preview/tokens';

const fetcher = (url) => fetch(url).then((r) => r.json());

const SERVICE_LABELS = {
  tox: 'Tox',
  filler: 'Filler',
  facials: 'Facial',
  massage: 'Massage',
};

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DotIndicator({ count, hasAvail }) {
  const available = typeof count === 'number' ? count > 0 : hasAvail;
  const scarce = typeof count === 'number' ? count > 0 && count <= 2 : false;
  const color = !available ? colors.muted : scarce ? colors.rose : colors.violet;
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: 8,
        height: 8,
        backgroundColor: color,
        animation: scarce ? 'pulse 2s infinite' : 'none',
      }}
    />
  );
}

/** Formats date strings as day abbreviations: "Mon · Wed · Fri" */
function formatDayNames(dateStrings) {
  if (!dateStrings?.length) return null;
  const days = dateStrings.map((d) => {
    const dt = new Date(d + 'T12:00:00');
    return { idx: dt.getDay(), abbr: DAY_ABBR[dt.getDay()] };
  });
  // Check for "Every day" (all 7 days)
  if (days.length >= 7) return 'Every day';
  // Check for Mon–Fri (weekdays only)
  const idxSet = new Set(days.map((d) => d.idx));
  if (days.length === 5 && !idxSet.has(0) && !idxSet.has(6)) return 'Mon–Fri';
  return days.map((d) => d.abbr).join(' · ');
}

function SectionHeader({ label, fonts }) {
  return (
    <p
      style={{
        fontFamily: fonts?.body || 'system-ui',
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: colors.muted,
        marginBottom: '0.375rem',
      }}
    >
      {label}
    </p>
  );
}

function TodayRow({ label, count, fonts }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="flex items-center gap-1.5"
        style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', color: colors.body }}
      >
        <DotIndicator count={count} />
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts?.body || 'system-ui',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: count === 0 ? colors.muted : count <= 2 ? colors.rose : colors.heading,
        }}
      >
        {count === 0 ? 'Full' : count}
      </span>
    </div>
  );
}

function WeekRow({ label, dates, fonts }) {
  const dayStr = formatDayNames(dates);
  const hasAvail = dates?.length > 0;
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className="flex items-center gap-1.5 flex-shrink-0"
        style={{ fontFamily: fonts?.body || 'system-ui', fontSize: '0.8125rem', color: colors.body }}
      >
        <DotIndicator hasAvail={hasAvail} />
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts?.body || 'system-ui',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: hasAvail ? colors.heading : colors.muted,
          textAlign: 'right',
        }}
      >
        {hasAvail ? dayStr : '—'}
      </span>
    </div>
  );
}

export default function ScarcityBadge({
  locationKey,
  staffProviderId,
  variant = 'inline',
  fonts,
  services,
}) {
  const params = new URLSearchParams({ locationKey });
  if (staffProviderId) params.set('staffProviderId', staffProviderId);

  const { data, error } = useSWR(
    locationKey ? `/api/blvd/availability/summary?${params}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 120000, refreshInterval: 300000 }
  );

  // Don't render anything while loading or on error
  if (!data || error) return null;
  const todayTotal = data.today?.total || 0;
  if (todayTotal === 0 && variant !== 'sidebar') return null;

  // Inline variant: "3 openings today"
  if (variant === 'inline') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{
          fontFamily: fonts?.body || 'system-ui',
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: todayTotal <= 3 ? colors.rose : colors.violet,
          backgroundColor: todayTotal <= 3 ? `${colors.rose}08` : `${colors.violet}08`,
          border: `1px solid ${todayTotal <= 3 ? colors.rose : colors.violet}15`,
        }}
      >
        <DotIndicator count={todayTotal} />
        {todayTotal} opening{todayTotal !== 1 ? 's' : ''} today
      </span>
    );
  }

  // Dot variant: just a pulse dot with title
  if (variant === 'dot') {
    return (
      <span
        className="inline-flex items-center gap-1"
        title={`${todayTotal} opening${todayTotal !== 1 ? 's' : ''} today`}
      >
        <DotIndicator count={todayTotal} />
      </span>
    );
  }

  // Sidebar variant: Today / This Week / Next Week
  if (variant === 'sidebar') {
    const serviceKeys = services || Object.keys(SERVICE_LABELS);

    // Today rows (slot counts)
    const todayRows = serviceKeys
      .filter((s) => data.today?.[s] !== undefined)
      .map((s) => ({ slug: s, label: SERVICE_LABELS[s] || s, count: data.today[s] || 0 }));

    // This week rows (available dates)
    const thisWeekRows = serviceKeys
      .filter((s) => data.thisWeek?.[s] !== undefined)
      .map((s) => ({ slug: s, label: SERVICE_LABELS[s] || s, dates: data.thisWeek[s] || [] }));

    // Next week rows (available dates)
    const nextWeekRows = serviceKeys
      .filter((s) => data.nextWeek?.[s] !== undefined)
      .map((s) => ({ slug: s, label: SERVICE_LABELS[s] || s, dates: data.nextWeek[s] || [] }));

    const hasAnyData = todayRows.length > 0 || thisWeekRows.length > 0 || nextWeekRows.length > 0;
    if (!hasAnyData) return null;

    return (
      <div className="space-y-3">
        {todayRows.length > 0 && (
          <div>
            <SectionHeader label="Today" fonts={fonts} />
            <div className="space-y-1.5">
              {todayRows.map((r) => (
                <TodayRow key={r.slug} label={r.label} count={r.count} fonts={fonts} />
              ))}
            </div>
          </div>
        )}
        {thisWeekRows.length > 0 && (
          <div>
            <SectionHeader label="This Week" fonts={fonts} />
            <div className="space-y-1.5">
              {thisWeekRows.map((r) => (
                <WeekRow key={r.slug} label={r.label} dates={r.dates} fonts={fonts} />
              ))}
            </div>
          </div>
        )}
        {nextWeekRows.length > 0 && (
          <div>
            <SectionHeader label="Next Week" fonts={fonts} />
            <div className="space-y-1.5">
              {nextWeekRows.map((r) => (
                <WeekRow key={r.slug} label={r.label} dates={r.dates} fonts={fonts} />
              ))}
            </div>
          </div>
        )}
        {data.updatedAt && (
          <p
            style={{
              fontFamily: fonts?.body || 'system-ui',
              fontSize: '0.625rem',
              color: colors.muted,
            }}
          >
            Updated {new Date(data.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>
    );
  }

  return null;
}
