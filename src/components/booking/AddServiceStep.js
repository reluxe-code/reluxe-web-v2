// src/components/booking/AddServiceStep.js
// "Add another service?" step for multi-service booking.
import { colors, gradients } from '@/components/preview/tokens';

export default function AddServiceStep({
  providerFirstName,
  compatibleAddons = [],
  additionalServices = [],
  maxServices,
  onAddService,
  onRemoveService,
  onContinue,
  fonts,
}) {
  const canAddMore = additionalServices.length < (maxServices - 1); // -1 for primary
  const hasAddons = additionalServices.length > 0;

  return (
    <div>
      <p
        style={{
          fontFamily: fonts?.body,
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: colors.heading,
          marginBottom: '0.5rem',
        }}
      >
        Add another service with {providerFirstName}?
      </p>

      {/* Already-added services */}
      {hasAddons && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {additionalServices.map((svc, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                fontFamily: fonts?.body,
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: colors.violet,
                backgroundColor: `${colors.violet}08`,
                border: `1px solid ${colors.violet}20`,
              }}
            >
              {svc.title}
              {svc.duration ? ` · ${svc.duration} min` : ''}
              <button
                onClick={() => onRemoveService(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  fontSize: '0.875rem',
                }}
                aria-label={`Remove ${svc.title}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available add-ons */}
      {canAddMore && compatibleAddons.length > 0 && (
        <div className="space-y-2 mb-4">
          {compatibleAddons.map((addon) => {
            const alreadyAdded = additionalServices.some((s) => s.slug === addon.slug);
            if (alreadyAdded) return null;

            return (
              <button
                key={addon.slug}
                onClick={() => onAddService(addon)}
                className="w-full text-left rounded-xl transition-all duration-200 flex items-center gap-3 p-3"
                style={{
                  border: `1px solid ${colors.stone}`,
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="flex-shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: `${colors.violet}08`,
                    border: `1px solid ${colors.violet}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.violet,
                    fontSize: '1rem',
                    fontWeight: 300,
                  }}
                >
                  +
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p
                      style={{
                        fontFamily: fonts?.body,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: colors.heading,
                        margin: 0,
                      }}
                    >
                      {addon.title}
                    </p>
                    {addon.duration > 0 && (
                      <span
                        style={{
                          fontFamily: fonts?.body,
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: colors.violet,
                          opacity: 0.7,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {addon.duration < 60
                          ? `${addon.duration} min`
                          : `${Math.floor(addon.duration / 60)}h${addon.duration % 60 > 0 ? ` ${addon.duration % 60}m` : ''}`}
                      </span>
                    )}
                    {addon.priceLabel && (
                      <span
                        style={{
                          fontFamily: fonts?.body,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: colors.heading,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {addon.priceLabel}
                      </span>
                    )}
                  </div>
                  {addon.pitch && (
                    <p
                      style={{
                        fontFamily: fonts?.body,
                        fontSize: '0.6875rem',
                        color: colors.muted,
                        margin: '0.125rem 0 0',
                        lineHeight: 1.35,
                      }}
                    >
                      {addon.pitch}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Max reached message */}
      {!canAddMore && (
        <p
          style={{
            fontFamily: fonts?.body,
            fontSize: '0.75rem',
            color: colors.muted,
            marginBottom: '1rem',
          }}
        >
          Maximum {maxServices} services per booking reached.
        </p>
      )}

      {/* No compatible addons available */}
      {canAddMore && compatibleAddons.length === 0 && !hasAddons && (
        <p
          style={{
            fontFamily: fonts?.body,
            fontSize: '0.75rem',
            color: colors.muted,
            marginBottom: '1rem',
          }}
        >
          No additional services available to combine.
        </p>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full rounded-full transition-opacity duration-200"
        style={{
          fontFamily: fonts?.body,
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '0.75rem 2rem',
          background: gradients.primary,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {hasAddons ? 'Continue' : 'Skip — just this service'}
      </button>
    </div>
  );
}
