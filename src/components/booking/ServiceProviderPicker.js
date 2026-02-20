// src/components/booking/ServiceProviderPicker.js
// For service pages: shows available providers with next booking date.
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { colors, gradients, typeScale } from '@/components/preview/tokens';

const fetcher = (url) => fetch(url).then((r) => r.json());

function ProviderCard({ provider, fonts, index }) {
  const hasAvailability = !!provider.nextAvailableDate;
  const nextDate = hasAvailability
    ? new Date(provider.nextAvailableDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isToday =
    hasAvailability && provider.nextAvailableDate === new Date().toISOString().split('T')[0];
  const isTomorrow =
    hasAvailability &&
    provider.nextAvailableDate ===
      new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <motion.a
      href={`/beta/team/${provider.slug}?service=${provider.serviceSlug || ''}`}
      className="group rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${colors.stone}`,
        textDecoration: 'none',
        display: 'block',
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      {/* Provider image */}
      <div className="relative" style={{ height: 200, backgroundColor: colors.cream }}>
        {provider.image ? (
          <img
            src={provider.image}
            alt={provider.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ width: '100%', height: '100%' }}
          >
            <span
              style={{
                fontFamily: fonts?.display || 'Georgia',
                fontSize: '3rem',
                fontWeight: 700,
                color: colors.stone,
              }}
            >
              {(provider.name || '?')[0]}
            </span>
          </div>
        )}

        {/* Availability badge */}
        {hasAvailability && (
          <div className="absolute bottom-3 left-3">
            <span
              className="rounded-full px-2.5 py-1 inline-flex items-center gap-1"
              style={{
                fontFamily: fonts?.body || 'system-ui',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: isToday
                  ? `${colors.rose}ee`
                  : isTomorrow
                    ? `${colors.violet}ee`
                    : 'rgba(26,26,26,0.8)',
                color: '#fff',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: '#fff',
                  animation: isToday ? 'pulse 2s infinite' : 'none',
                }}
              />
              {isToday ? 'Available today' : isTomorrow ? 'Available tomorrow' : `Next: ${nextDate}`}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3
          style={{
            fontFamily: fonts?.display || 'Georgia',
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: colors.heading,
            marginBottom: '0.25rem',
          }}
        >
          {provider.name}
        </h3>
        {provider.title && (
          <p
            style={{
              fontFamily: fonts?.body || 'system-ui',
              fontSize: '0.8125rem',
              color: colors.muted,
              marginBottom: '0.75rem',
            }}
          >
            {provider.title}
          </p>
        )}
        <span
          className="inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
          style={{
            fontFamily: fonts?.body || 'system-ui',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: colors.violet,
          }}
        >
          Book with {provider.name?.split(/\s/)[0]}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </motion.a>
  );
}

function Skeleton({ fonts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ border: `1px solid ${colors.stone}` }}
        >
          <div style={{ height: 200, backgroundColor: colors.stone }} />
          <div className="p-5">
            <div className="rounded" style={{ height: 18, width: '60%', backgroundColor: colors.stone, marginBottom: 8 }} />
            <div className="rounded" style={{ height: 14, width: '40%', backgroundColor: colors.stone }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServiceProviderPicker({
  serviceSlug,
  locationKey,
  fonts,
  label,
  heading,
}) {
  const { data: providers, isLoading, error } = useSWR(
    serviceSlug && locationKey
      ? `/api/blvd/providers/for-service?serviceSlug=${encodeURIComponent(serviceSlug)}&locationKey=${encodeURIComponent(locationKey)}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 120000 }
  );

  // Don't render section if no data or error
  if (error || (!isLoading && (!providers || providers.length === 0))) return null;

  return (
    <section style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            style={{
              fontFamily: fonts?.body,
              ...typeScale.label,
              color: colors.violet,
              marginBottom: '0.75rem',
            }}
          >
            {label || 'Available Providers'}
          </p>
          <h2
            style={{
              fontFamily: fonts?.display,
              fontSize: typeScale.sectionHeading.size,
              fontWeight: typeScale.sectionHeading.weight,
              lineHeight: typeScale.sectionHeading.lineHeight,
              color: colors.heading,
            }}
          >
            {heading || 'Who Can Help You'}
          </h2>
        </motion.div>

        {isLoading ? (
          <Skeleton fonts={fonts} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p, i) => (
              <ProviderCard
                key={p.slug}
                provider={{ ...p, serviceSlug }}
                fonts={fonts}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
