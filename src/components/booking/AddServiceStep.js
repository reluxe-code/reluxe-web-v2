// src/components/booking/AddServiceStep.js
// "Add another service?" step with type-to-search for multi-service booking.
import { useState, useMemo } from 'react';
import { colors, gradients } from '@/components/preview/tokens';

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatDuration(mins) {
  if (!mins || mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AddServiceStep({
  providerFirstName,
  compatibleAddons = [],
  fallbackCategories = [],
  menuLoading = false,
  additionalServices = [],
  maxServices,
  onAddService,
  onChooseCategory,
  onRemoveService,
  onContinue,
  fonts,
}) {
  const [query, setQuery] = useState('');
  const canAddMore = additionalServices.length < (maxServices - 1);
  const hasAddons = additionalServices.length > 0;

  // Build a single flat list of all available items (rules-based + fallback categories)
  const allItems = useMemo(() => {
    const items = [];
    const addedKeys = new Set(
      additionalServices.map((s) => s.catalogId || s.serviceItemId || s.slug).filter(Boolean)
    );

    // Rules-based compatible add-ons first (curated)
    compatibleAddons.forEach((addon) => {
      const key = addon.catalogId || addon.serviceItemId || addon.slug;
      if (key && addedKeys.has(key)) return;
      items.push({
        type: 'addon',
        key: key || addon.title,
        title: addon.title,
        duration: addon.duration || null,
        priceLabel: addon.priceLabel || null,
        pitch: addon.pitch || null,
        category: null,
        raw: addon,
      });
      if (key) addedKeys.add(key);
    });

    // Flatten fallback categories
    fallbackCategories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        if (addedKeys.has(item.id)) return;
        items.push({
          type: 'category-item',
          key: item.id,
          title: item.name,
          duration: null,
          priceLabel: null,
          pitch: null,
          category: cat.name,
          raw: item,
        });
        addedKeys.add(item.id);
      });
    });

    return items;
  }, [compatibleAddons, fallbackCategories, additionalServices]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = normalize(query);
    return allItems.filter(
      (item) =>
        normalize(item.title).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.pitch).includes(q)
    );
  }, [allItems, query]);

  // Group: show recommended first, then by category
  const recommended = filtered.filter((i) => i.type === 'addon');
  const byCategory = useMemo(() => {
    const cats = new Map();
    filtered
      .filter((i) => i.type === 'category-item')
      .forEach((item) => {
        const cat = item.category || 'Other';
        if (!cats.has(cat)) cats.set(cat, []);
        cats.get(cat).push(item);
      });
    return cats;
  }, [filtered]);

  const handleClick = (item) => {
    if (item.type === 'addon') {
      onAddService(item.raw);
    } else {
      // Category item — use onChooseCategory to let picker handle sub-selection
      // or directly add if it's a simple item
      onAddService({ catalogId: item.raw.id, title: item.raw.name, slug: null });
    }
    setQuery('');
  };

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

      {/* Search input */}
      {canAddMore && allItems.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            style={{
              fontFamily: fonts?.body,
              fontSize: '0.8125rem',
              width: '100%',
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: `1px solid ${colors.stone}`,
              outline: 'none',
              color: colors.heading,
              backgroundColor: '#fff',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = colors.violet; }}
            onBlur={(e) => { e.target.style.borderColor = colors.stone; }}
          />
        </div>
      )}

      {/* Results */}
      {canAddMore && (
        <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: '1rem' }}>
          {/* Recommended add-ons */}
          {recommended.length > 0 && (
            <div className="mb-3">
              {!query.trim() && (
                <p style={{
                  fontFamily: fonts?.body,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: colors.violet,
                  marginBottom: '0.375rem',
                }}>
                  Recommended
                </p>
              )}
              <div className="space-y-1.5">
                {recommended.map((item) => (
                  <ServiceRow key={item.key} item={item} fonts={fonts} onClick={() => handleClick(item)} />
                ))}
              </div>
            </div>
          )}

          {/* Category groups */}
          {[...byCategory.entries()].map(([catName, items]) => (
            <div key={catName} className="mb-3">
              <p style={{
                fontFamily: fonts?.body,
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.muted,
                marginBottom: '0.375rem',
              }}>
                {catName}
              </p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <ServiceRow key={item.key} item={item} fonts={fonts} onClick={() => handleClick(item)} />
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && !menuLoading && (
            <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: colors.muted, textAlign: 'center', padding: '1rem 0' }}>
              {query.trim() ? 'No matching services found.' : 'No additional services available.'}
            </p>
          )}
        </div>
      )}

      {canAddMore && menuLoading && allItems.length === 0 && (
        <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: colors.muted, marginBottom: '1rem' }}>
          Loading additional services...
        </p>
      )}

      {!canAddMore && (
        <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: colors.muted, marginBottom: '1rem' }}>
          Maximum {maxServices} services per booking reached.
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

function ServiceRow({ item, fonts, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl transition-all duration-200 flex items-center gap-3 p-2.5"
      style={{
        border: `1px solid ${colors.stone}`,
        backgroundColor: '#fff',
        cursor: 'pointer',
      }}
    >
      <span
        className="flex-shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: `${colors.violet}08`,
          border: `1px solid ${colors.violet}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.violet,
          fontSize: '0.875rem',
          fontWeight: 300,
        }}
      >
        +
      </span>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: fonts?.body,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: colors.heading,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </p>
        {item.pitch && (
          <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.muted, margin: '0.125rem 0 0', lineHeight: 1.3 }}>
            {item.pitch}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {item.duration > 0 && (
          <span style={{ fontFamily: fonts?.body, fontSize: '0.625rem', fontWeight: 600, color: colors.violet, opacity: 0.7, whiteSpace: 'nowrap' }}>
            {formatDuration(item.duration)}
          </span>
        )}
        {item.priceLabel && (
          <span style={{ fontFamily: fonts?.body, fontSize: '0.625rem', fontWeight: 700, color: colors.heading, whiteSpace: 'nowrap' }}>
            {item.priceLabel}
          </span>
        )}
      </div>
    </button>
  );
}
