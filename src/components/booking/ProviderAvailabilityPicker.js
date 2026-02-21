// src/components/booking/ProviderAvailabilityPicker.js
// Inline booking flow with multi-service support:
// service → options → add more? → [addon options] → date → time → checkout
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, gradients, typeScale } from '@/components/preview/tokens';
import DateStrip from './DateStrip';
import TimeGrid from './TimeGrid';
import ClientInfoForm from './ClientInfoForm';
import AddServiceStep from './AddServiceStep';
import GravityBookButton from '@/components/beta/GravityBookButton';
import { getCompatibleAddons, MAX_SERVICES_PER_BOOKING } from '@/data/bookingRules';
import { SLUG_TITLES } from '@/data/treatmentBundles';
import { useBookingAnalytics } from '@/hooks/useBookingAnalytics';

const fetcher = (url) => fetch(url).then((r) => r.json());
const SHOW_MORE_THRESHOLD = 4;

const LOCATION_INFO = {
  westfield: { name: 'RELUXE Westfield', address: '514 E State Road 32, Westfield, IN', phone: '317.763.1142' },
  carmel: { name: 'RELUXE Carmel', address: '10485 N Pennsylvania St, Carmel, IN', phone: '317.763.1142' },
};

function formatTime(startTime) {
  if (!startTime) return '';
  try {
    return new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return startTime; }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function normalizeMoneyValue(v) {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v >= 1000 ? v / 100 : v;
  if (typeof v === 'string') {
    const source = String(v);
    const n = Number(source.replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n)) return null;
    if (source.includes('.')) return n;
    return n >= 1000 ? n / 100 : n;
  }
  if (typeof v === 'object') {
    const raw = v.amount ?? v.value ?? v.cents ?? v.centAmount ?? null;
    if (raw == null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (v.cents != null || v.centAmount != null) return n / 100;
    return n >= 1000 ? n / 100 : n;
  }
  return null;
}

function formatCurrency(n) {
  if (n == null || !Number.isFinite(n)) return null;
  return `$${Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isConsultationLike(name, categoryName) {
  const text = `${name || ''} ${categoryName || ''}`.toLowerCase();
  return /consult/.test(text) || /not sure where to start|get started|reveal/.test(text);
}

function formatPriceRange(price, { name, categoryName } = {}) {
  if (!price) return null;
  const min = normalizeMoneyValue(price.min);
  const max = normalizeMoneyValue(price.max);
  const consultation = isConsultationLike(name, categoryName);
  if (min == null && max == null) return null;
  if ((min ?? 0) === 0 && (max ?? 0) === 0) return consultation ? 'FREE' : 'Varies';
  if (min != null && max != null) {
    if (Math.abs(min - max) < 0.01) return formatCurrency(min);
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  if (min === 0) return consultation ? 'FREE' : 'Varies';
  if (min != null) return `${formatCurrency(min)}+`;
  if (max === 0) return consultation ? 'FREE' : 'Varies';
  return `Up to ${formatCurrency(max)}`;
}

function normalizeServiceId(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const last = raw.includes(':') ? raw.split(':').pop() : raw;
  return String(last || raw).toLowerCase();
}

function idsMatch(a, b) {
  if (!a || !b) return false;
  const aRaw = String(a).trim().toLowerCase();
  const bRaw = String(b).trim().toLowerCase();
  if (aRaw === bRaw) return true;
  const aNorm = normalizeServiceId(a);
  const bNorm = normalizeServiceId(b);
  return !!aNorm && !!bNorm && aNorm === bNorm;
}

function formatOptionPriceDelta(priceDelta) {
  if (priceDelta == null || priceDelta === '') return null;
  const amount = normalizeMoneyValue(priceDelta);
  if (amount == null) return null;
  if (Math.abs(amount) < 0.005) return 'Varies';
  return `${amount > 0 ? '+' : '-'}${formatCurrency(Math.abs(amount))}`;
}

// ─── Options Step (reused for main + addon services) ───
function OptionsStep({ optionGroups, selectedOptions, onToggleOption, onContinue, onSkip, fonts }) {
  if (!optionGroups?.length) return null;

  // Check if all required groups have enough selections
  const hasRequired = optionGroups.some((g) => (g.minLimit || 0) >= 1);
  const allRequiredMet = optionGroups.every((g) => {
    const min = g.minLimit || 0;
    if (min < 1) return true;
    const count = (g.options || []).filter((o) => selectedOptions.some((s) => s.id === o.id)).length;
    return count >= min;
  });

  return (
    <div>
      {optionGroups.map((group) => {
        const isRadio = group.maxLimit === 1;
        const isRequired = (group.minLimit || 0) >= 1;
        return (
          <div key={group.id} className="mb-4 last:mb-0">
            <div className="flex items-baseline justify-between mb-2">
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>
                {group.name}
              </p>
              {group.maxLimit && (
                <span style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: isRequired ? colors.violet : colors.muted }}>
                  {isRadio ? 'choose 1' : `up to ${group.maxLimit}`}
                </span>
              )}
            </div>
            {group.description && (
              <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: colors.muted, marginBottom: '0.5rem' }}>
                {group.description}
              </p>
            )}
            <div className="space-y-2">
              {group.options.map((opt) => {
                const isSelected = selectedOptions.some((o) => o.id === opt.id);
                const optionPriceLabel = formatOptionPriceDelta(opt.priceDelta);
                return (
                  <button
                    key={opt.id}
                    onClick={() => onToggleOption(group, opt)}
                    className="w-full text-left rounded-xl transition-all duration-200 flex items-start gap-3 p-3"
                    style={{
                      border: isSelected ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                      backgroundColor: isSelected ? `${colors.violet}06` : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        width: 18, height: 18,
                        borderRadius: isRadio ? '50%' : 4,
                        border: isSelected ? `2px solid ${colors.violet}` : `1.5px solid ${colors.stone}`,
                        backgroundColor: isSelected ? colors.violet : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, margin: 0 }}>{opt.name}</p>
                      {opt.description && (
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.muted, margin: '0.125rem 0 0', lineHeight: 1.35 }}>{opt.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {optionPriceLabel && (
                        <span style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 600, color: colors.violet }}>{optionPriceLabel}</span>
                      )}
                      {opt.durationDelta > 0 && (
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.625rem', color: colors.muted, margin: '0.125rem 0 0' }}>+{opt.durationDelta} min</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex gap-2 mt-4">
        {!hasRequired && (
          <button onClick={onSkip} className="rounded-full" style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.75rem 1.25rem', color: colors.body, backgroundColor: colors.cream, border: `1px solid ${colors.stone}`, cursor: 'pointer' }}>Skip</button>
        )}
        <button onClick={onContinue} disabled={hasRequired && !allRequiredMet} className="flex-1 rounded-full" style={{ fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: (hasRequired && !allRequiredMet) ? colors.stone : gradients.primary, color: '#fff', border: 'none', cursor: (hasRequired && !allRequiredMet) ? 'not-allowed' : 'pointer', opacity: (hasRequired && !allRequiredMet) ? 0.6 : 1 }}>Continue</button>
      </div>
    </div>
  );
}

// ─── Expanded Service Menu (for "Looking for something else?") ───
function ExpandedServiceMenu({ categories, loading, onSelectCategory, fonts, primary = false }) {
  if (loading) {
    return (
      <div className={`space-y-2 ${primary ? '' : 'mt-3'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl animate-pulse" style={{ height: 48, backgroundColor: colors.stone }} />
        ))}
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.muted, textAlign: 'center', padding: '1rem 0' }}>
        No additional services found.
      </p>
    );
  }

  return (
    <div className={primary ? '' : 'mt-3'}>
      <p style={{ fontFamily: fonts?.body, fontSize: primary ? '0.8125rem' : '0.6875rem', fontWeight: 600, textTransform: primary ? 'none' : 'uppercase', letterSpacing: primary ? 'normal' : '0.08em', color: primary ? colors.heading : colors.muted, marginBottom: '0.5rem' }}>
        {primary ? 'What do you need?' : 'All Services'}
      </p>
      <div className="space-y-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className="w-full text-left rounded-xl transition-all duration-200 p-3 flex items-center justify-between"
            style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, backgroundColor: '#fff', border: `1px solid ${colors.stone}`, cursor: 'pointer' }}
          >
            <span>{cat.name}</span>
            {cat.items.length > 1 && (
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: colors.muted }}>
                {cat.items.length} options
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper: toggle option within a group
function toggleOption(prev, group, option) {
  const isRadio = group.maxLimit === 1;
  const isSelected = prev.some((o) => o.id === option.id);
  if (isRadio) {
    const withoutGroup = prev.filter((o) => !group.options.some((go) => go.id === o.id));
    return isSelected ? withoutGroup : [...withoutGroup, option];
  }
  if (isSelected) return prev.filter((o) => o.id !== option.id);
  if (group.maxLimit) {
    const count = prev.filter((o) => group.options.some((go) => go.id === o.id)).length;
    if (count >= group.maxLimit) return prev;
  }
  return [...prev, option];
}


export default function ProviderAvailabilityPicker(props) {
  if (!props.boulevardProviderId) {
    return <GravityBookButton fontKey={props.fontKey} size="hero" />;
  }
  return <ProviderAvailabilityPickerInner {...props} />;
}

function ProviderAvailabilityPickerInner({
  providerName,
  boulevardProviderId,
  specialties = [],
  locations = [],
  boulevardServiceMap = {},
  fontKey = 'bold',
  fonts,
  initialService,
  initialCategory,
  initialDate,
  initialDateEnd,
  initialLocation,
  treatmentBundles = [],
  locationLocked = false,
  onExitPicker,
}) {
  // ─── State ───
  const [step, setStep] = useState('SPECIALTY');
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties.length === 1 ? specialties[0] : null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedBundleItem, setSelectedBundleItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(
    (initialLocation && locations.some((l) => l.key === initialLocation)) ? initialLocation : (locations[0]?.key || null)
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [reserveError, setReserveError] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [serviceDuration, setServiceDuration] = useState(null);
  const [hasOptions, setHasOptions] = useState(null);
  const [readyToAdvance, setReadyToAdvance] = useState(false);

  // Multi-service state
  const [additionalServices, setAdditionalServices] = useState([]);
  // Each: { slug, title, serviceItemId, selectedOptions: [], optionGroups: [], hasOptions, duration }
  const [addonOptionsIndex, setAddonOptionsIndex] = useState(-1); // which addon is being configured

  // Expanded Boulevard menu ("Looking for something else?")
  const [expandedMenuData, setExpandedMenuData] = useState(null);
  const [expandedMenuLoading, setExpandedMenuLoading] = useState(false);
  const [directServiceItem, setDirectServiceItem] = useState(null); // { id, name, categoryName }
  const [pendingCategory, setPendingCategory] = useState(null); // multi-item category awaiting sub-pick
  const [addonPendingCategory, setAddonPendingCategory] = useState(null); // add-on category awaiting sub-pick

  // When 'any' location, use the first location as a proxy for options/duration queries
  const isAnyLocation = selectedLocation === 'any';
  const effectiveLocation = isAnyLocation ? locations[0]?.key : selectedLocation;

  // ─── Booking analytics ───
  const selectedService = directServiceItem || selectedSpecialty;
  const { trackServiceSelect, trackDateSelect, trackTimeSelect } = useBookingAnalytics({
    flowType: 'provider_picker',
    step,
    isActive: true,
    locationKey: selectedLocation,
    selectedProvider: { name: providerName, boulevardProviderId },
    selectedService: selectedService ? { name: selectedService.name || selectedService.title, id: selectedService.id || selectedService.slug } : null,
    selectedCategory: selectedBundle ? { name: selectedBundle.title } : null,
    selectedBundle: selectedBundle,
    selectedDate,
    selectedTime,
    memberId: null,
  });

  // Resolved service item ID: directServiceItem (from expanded menu) takes priority
  const serviceItemId = directServiceItem?.id
    || (selectedSpecialty && selectedLocation && !isAnyLocation
      ? boulevardServiceMap[selectedSpecialty.slug]?.[selectedLocation]
      : null);

  // For options/duration SWR when 'any', use first location's item ID
  const primaryServiceItemId = directServiceItem?.id
    || (selectedSpecialty && effectiveLocation
      ? boulevardServiceMap[selectedSpecialty.slug]?.[effectiveLocation]
      : null);

  // Re-filter treatment bundles by selected location
  const filteredBundles = useMemo(() => {
    if (!treatmentBundles?.length) return [];
    if (!selectedLocation) return treatmentBundles;
    const menuBookableIds = new Set(
      (expandedMenuData?.categories || [])
        .flatMap((cat) => cat.items || [])
        .map((item) => item.id)
        .filter(Boolean)
    );
    const itemAvailableAt = (item, locKey) => {
      if (item.slug && boulevardServiceMap[item.slug]?.[locKey]) return true;
      if (item.catalogId) {
        // For catalog-picked services, only show if confirmed in provider-filtered Boulevard menu.
        if (menuBookableIds.size === 0) return false;
        return [...menuBookableIds].some((id) => idsMatch(id, item.catalogId));
      }
      return false;
    };
    return treatmentBundles
      .map((b) => ({
        ...b,
        availableItems: (b.availableItems || []).filter((item) => {
          if (isAnyLocation) return locations.every((loc) => itemAvailableAt(item, loc.key));
          return itemAvailableAt(item, selectedLocation);
        }),
      }))
      .filter((b) => b.availableItems.length > 0);
  }, [treatmentBundles, selectedLocation, isAnyLocation, locations, boulevardServiceMap, expandedMenuData]);
  const displayedBundles = useMemo(() => filteredBundles.slice(0, 4), [filteredBundles]);
  const activeBundle = useMemo(() => {
    if (!selectedBundle?.id) return null;
    return filteredBundles.find((b) => b.id === selectedBundle.id) || null;
  }, [selectedBundle, filteredBundles]);

  // Reverse-lookup: find slug for directServiceItem's Boulevard ID
  const directServiceSlug = useMemo(() => {
    if (!directServiceItem?.id) return null;
    const loc = isAnyLocation ? locations[0]?.key : selectedLocation;
    for (const [slug, locMap] of Object.entries(boulevardServiceMap)) {
      if (locMap?.[loc] === directServiceItem.id) return slug;
    }
    return null;
  }, [directServiceItem, selectedLocation, isAnyLocation, locations, boulevardServiceMap]);

  const allProviderSlugs = useMemo(() => {
    if (!selectedLocation) return [];
    if (isAnyLocation) {
      const slugSets = locations.map((loc) =>
        new Set(Object.keys(boulevardServiceMap).filter((slug) => boulevardServiceMap[slug]?.[loc.key]))
      );
      if (slugSets.length === 0) return [];
      return [...slugSets[0]].filter((slug) => slugSets.every((s) => s.has(slug)));
    }
    return Object.keys(boulevardServiceMap).filter((slug) => boulevardServiceMap[slug]?.[selectedLocation]);
  }, [boulevardServiceMap, selectedLocation, isAnyLocation, locations]);

  const serviceMetaById = useMemo(() => {
    const map = new Map();
    for (const cat of expandedMenuData?.categories || []) {
      for (const item of cat.items || []) {
        map.set(item.id, {
          duration: item.duration || null,
          priceLabel: formatPriceRange(item.price, { name: item.name, categoryName: cat.name }),
          categoryName: cat.name || null,
        });
      }
    }
    return map;
  }, [expandedMenuData]);

  const resolveItemId = useCallback((choice, locKey = effectiveLocation) => {
    if (!choice) return null;
    if (choice.catalogId) return choice.catalogId;
    if (choice.id) return choice.id;
    if (choice.slug && locKey) return boulevardServiceMap[choice.slug]?.[locKey] || null;
    return null;
  }, [boulevardServiceMap, effectiveLocation]);

  const metaForChoice = useCallback((choice, locKey = effectiveLocation) => {
    const itemId = resolveItemId(choice, locKey);
    if (!itemId) return { priceLabel: null, durationLabel: null };
    const meta = serviceMetaById.get(itemId);
    const dur = meta?.duration?.max ?? meta?.duration?.min ?? null;
    const fallbackConsultation = isConsultationLike(
      choice?.label || choice?.title || choice?.name,
      choice?.categoryName || meta?.categoryName
    );
    return {
      priceLabel: meta?.priceLabel || (fallbackConsultation ? 'FREE' : null),
      durationLabel: dur ? formatDuration(dur) : null,
    };
  }, [resolveItemId, serviceMetaById, effectiveLocation]);

  // Compatible add-ons based on rules engine (works for both specialty and directServiceItem paths)
  const compatibleAddons = useMemo(() => {
    const addedKeys = new Set(
      additionalServices.map((a) => a.catalogId || a.slug).filter(Boolean)
    );
    if (activeBundle?.availableItems?.length) {
      const hasPrimarySelection = !!(selectedBundleItem || selectedSpecialty || directServiceSlug || directServiceItem);
      if (!hasPrimarySelection) return [];
      const primaryKey = selectedBundleItem?.catalogId || selectedBundleItem?.slug || selectedSpecialty?.slug || directServiceSlug;
      return activeBundle.availableItems
        .filter((item) => {
          const key = item.catalogId || item.slug;
          if (!key) return false;
          if (primaryKey && key === primaryKey) return false;
          if (addedKeys.has(key)) return false;
          return true;
        })
        .map((item) => ({
          slug: item.slug || null,
          catalogId: item.catalogId || null,
          title: item.label || SLUG_TITLES[item.slug] || item.slug || 'Service',
          pitch: null,
        }));
    }

    const effectivePrimarySlug = selectedSpecialty?.slug || directServiceSlug;
    if (!effectivePrimarySlug || allProviderSlugs.length <= 1) return [];
    const addedSlugs = additionalServices.map((a) => a.slug).filter(Boolean);
    const addons = getCompatibleAddons(effectivePrimarySlug, allProviderSlugs, addedSlugs);
    return addons.map((a) => {
      const spec = specialties.find((s) => s.slug === a.slug);
      return { ...a, title: spec?.title || SLUG_TITLES[a.slug] || a.slug };
    });
  }, [selectedSpecialty, directServiceSlug, directServiceItem, allProviderSlugs, additionalServices, specialties, activeBundle, selectedBundleItem]);

  const fallbackAddonCategories = useMemo(() => {
    const categories = expandedMenuData?.categories || [];
    if (!categories.length) return [];
    const chosenPrimaryItemId = serviceItemId || primaryServiceItemId;
    const chosenIds = new Set(
      [
        chosenPrimaryItemId,
        ...additionalServices.map((a) => a.serviceItemId),
      ].filter(Boolean)
    );
    return categories
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((item) => !chosenIds.has(item.id)),
      }))
      .filter((cat) => (cat.items || []).length > 0);
  }, [expandedMenuData, serviceItemId, primaryServiceItemId, additionalServices]);

  const canOfferAdditionalServices = !!selectedLocation && !!boulevardProviderId;
  const showAddServiceStep =
    compatibleAddons.length > 0 ||
    additionalServices.length > 0 ||
    fallbackAddonCategories.length > 0 ||
    canOfferAdditionalServices;

  // ─── Pre-fetch durations for compatible addons ───
  const [addonDurations, setAddonDurations] = useState({});
  const fetchedAddonSlugs = useRef(new Set());

  useEffect(() => {
    if (!effectiveLocation || !boulevardProviderId) return;
    const toFetch = compatibleAddons.filter((addon) => {
      const addonKey = addon.catalogId || addon.slug;
      if (!addonKey || fetchedAddonSlugs.current.has(addonKey)) return false;
      const addonItemId = resolveItemId(addon, effectiveLocation);
      return !!addonItemId;
    });
    if (toFetch.length === 0) return;

    // Mark all as in-flight via ref (not state) to avoid re-renders
    toFetch.forEach((a) => fetchedAddonSlugs.current.add(a.catalogId || a.slug));

    // Fetch durations in parallel (use effectiveLocation for 'any')
    toFetch.forEach((addon) => {
      const addonKey = addon.catalogId || addon.slug;
      const addonItemId = resolveItemId(addon, effectiveLocation);
      fetch(
        `/api/blvd/services/options?locationKey=${effectiveLocation}&serviceItemId=${encodeURIComponent(addonItemId)}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`
      )
        .then((r) => r.json())
        .then((info) => {
          const dur = info.duration?.staffDuration || info.duration?.max || info.duration?.min || 0;
          setAddonDurations((prev) => ({ ...prev, [addonKey]: dur }));
        })
        .catch(() => {});
    });
  }, [compatibleAddons, effectiveLocation, boulevardProviderId, resolveItemId]);

  // Enrich compatible addons with pre-fetched durations
  const enrichedAddons = useMemo(() => {
    return compatibleAddons.map((a) => ({
      ...a,
      duration: addonDurations[a.catalogId || a.slug] || null,
      priceLabel: metaForChoice(a).priceLabel,
    }));
  }, [compatibleAddons, addonDurations, metaForChoice]);

  // ─── Fetch main service options + duration ───
  const optionsServiceItemId = serviceItemId || primaryServiceItemId;
  const { data: serviceInfo, isLoading: optionsLoading, error: optionsError } = useSWR(
    optionsServiceItemId
      ? `/api/blvd/services/options?locationKey=${effectiveLocation}&serviceItemId=${encodeURIComponent(optionsServiceItemId)}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 120000 }
  );

  useEffect(() => {
    if (!serviceInfo) return;
    const dur = serviceInfo.duration?.staffDuration || serviceInfo.duration?.max || serviceInfo.duration?.min || null;
    setServiceDuration(dur);
    const groups = (serviceInfo.optionGroups || []).filter((g) => g.options?.length > 0);
    setHasOptions(groups.length > 0);
  }, [serviceInfo]);

  // Fail-safe: never let options fetch issues block progression from service selection.
  useEffect(() => {
    if (!readyToAdvance || hasOptions !== null) return;
    if (!optionsServiceItemId) {
      setHasOptions(false);
      return;
    }
    if (optionsError) {
      setHasOptions(false);
    }
  }, [readyToAdvance, hasOptions, optionsServiceItemId, optionsError]);

  useEffect(() => {
    if (!readyToAdvance || hasOptions !== null) return;
    if (optionsLoading) return;
    if (!serviceInfo) setHasOptions(false);
  }, [readyToAdvance, hasOptions, optionsLoading, serviceInfo]);

  // ─── Compute dynamic steps ───
  const computedSteps = useMemo(() => {
    const steps = [{ key: 'SPECIALTY', label: 'Service' }];
    if (activeBundle) steps.push({ key: 'BUNDLE_ITEMS', label: activeBundle.title });
    if (pendingCategory) steps.push({ key: 'MENU_ITEM', label: 'Choose' });
    if (addonPendingCategory) steps.push({ key: 'ADDON_MENU_ITEM', label: 'Choose' });
    if (hasOptions) steps.push({ key: 'OPTIONS', label: 'Options' });
    additionalServices.forEach((addon, i) => {
      if (addon.hasOptions) steps.push({ key: `ADDON_OPTIONS_${i}`, label: `${addon.title}` });
    });
    steps.push({ key: 'DATE_TIME', label: 'Date & Time' });
    steps.push({ key: 'CHECKOUT', label: 'Confirm' });
    return steps;
  }, [hasOptions, showAddServiceStep, additionalServices, pendingCategory, addonPendingCategory, activeBundle]);

  const stepIndex = computedSteps.findIndex((s) => s.key === step);

  // ─── Compute total duration ───
  const totalDuration = useMemo(() => {
    let total = serviceDuration || 0;
    total += selectedOptions.reduce((sum, o) => sum + (o.durationDelta || 0), 0);
    for (const addon of additionalServices) {
      total += addon.duration || 0;
      total += (addon.selectedOptions || []).reduce((sum, o) => sum + (o.durationDelta || 0), 0);
    }
    return total || null;
  }, [serviceDuration, selectedOptions, additionalServices]);

  // ─── Additional items for availability queries ───
  const additionalItemsParam = useMemo(() => {
    if (additionalServices.length === 0) return '';
    const items = additionalServices.map((a) => ({ serviceItemId: a.serviceItemId }));
    return `&additionalItems=${encodeURIComponent(JSON.stringify(items))}`;
  }, [additionalServices]);

  // ─── Deep linking from URL params (?service=tox&date=2026-02-23) ───
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current) return;
    if (!initialService && !initialCategory && !initialDate) return;

    // Match ?service= to a specialty slug
    if (initialService) {
      const match = specialties.find((s) => s.slug === initialService);
      if (match) {
        deepLinkHandled.current = true;
        setSelectedSpecialty(match);
        if (locations.length === 1 && !selectedLocation) setSelectedLocation(locations[0].key);
        setReadyToAdvance(true);
      }
    }

    // Match ?category= to a Boulevard category via expanded menu
    if (initialCategory && !initialService) {
      deepLinkHandled.current = true;
      if (locations.length === 1 && !selectedLocation) setSelectedLocation(locations[0].key);
      const loc = locations.length === 1 ? locations[0].key : selectedLocation;
      if (loc && boulevardProviderId) {
        setExpandedMenuLoading(true);

        fetch(`/api/blvd/services/menu?locationKey=${loc}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`)
          .then((r) => r.json())
          .then((data) => {
            setExpandedMenuData(data);
            setExpandedMenuLoading(false);
            const cat = (data.categories || []).find((c) =>
              c.name.toLowerCase().includes(initialCategory.toLowerCase())
            );
            if (cat) {
              // Inline the selection logic to avoid TDZ reference to const handler
              setSelectedDate(null);
              setSelectedTime(null);
              setSelectedOptions([]);
              setAdditionalServices([]);
              setCartData(null);
              setHasOptions(null);
              setServiceDuration(null);
              setSelectedSpecialty(null);
              if (cat.items.length === 1) {
                setDirectServiceItem({ id: cat.items[0].id, name: cat.items[0].name, categoryName: cat.name });
                setPendingCategory(null);
                setReadyToAdvance(true);
              } else {
                setPendingCategory(cat);
                setDirectServiceItem(null);
                setStep('MENU_ITEM');
              }
            }
          })
          .catch(() => setExpandedMenuLoading(false));
      }
    }

    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      deepLinkHandled.current = true;
    }
  }, [initialService, initialCategory, initialDate, specialties, locations, selectedLocation, boulevardProviderId]);

  // ─── Auto-advance from SPECIALTY ───
  // Don't auto-advance when the full Boulevard menu is the primary service list (≤1 mapped specialties, no bundles).
  // In that case the user needs to pick a service from the expanded menu.
  const menuIsPrimaryServiceList = specialties.length <= 1 && filteredBundles.length === 0;
  useEffect(() => {
    if (menuIsPrimaryServiceList) return;
    if (step === 'SPECIALTY' && optionsServiceItemId && specialties.length <= 1 && locations.length <= 1 && hasOptions !== null && !directServiceItem) {
      advanceFromSpecialty();
    }
  }, [step, optionsServiceItemId, specialties.length, locations.length, hasOptions, directServiceItem, menuIsPrimaryServiceList]);

  useEffect(() => {
    if (readyToAdvance && hasOptions !== null) {
      advanceFromSpecialty();
      setReadyToAdvance(false);
    }
  }, [readyToAdvance, hasOptions]);

  function advanceFromSpecialty() {
    if (hasOptions) {
      setStep('OPTIONS');
    } else {
      setStep('DATE_TIME');
    }
  }

  function advanceFromOptions() {
    setStep('DATE_TIME');
  }

  function advanceFromAddService() {
    // Check if any new addon needs options configured
    const unconfiguredIdx = additionalServices.findIndex((a) => a.hasOptions && !a.optionsConfigured);
    if (unconfiguredIdx >= 0) {
      setAddonOptionsIndex(unconfiguredIdx);
      setStep(`ADDON_OPTIONS_${unconfiguredIdx}`);
    } else {
      setStep('DATE_TIME');
    }
  }

  // Navigate to ADD_SERVICE step (optional detour — not in progress bar)
  function goToAddService() {
    setAddServiceReturnStep(step);
    setStep('ADD_SERVICE');
  }

  // ─── Availability SWR ───
  const today = new Date().toISOString().split('T')[0];
  const endHorizon = new Date(Date.now() + 183 * 86400000).toISOString().split('T')[0]; // ~6 months
  const addonSlugsKey = additionalServices.map((a) => a.slug).join(',');

  const isAtOrPastDate = step === 'DATE_TIME' || step === 'CHECKOUT';

  // Build availability URL for a specific location
  const buildDatesUrl = useCallback((locKey) => {
    const itemId = directServiceItem?.id || boulevardServiceMap[selectedSpecialty?.slug]?.[locKey];
    if (!itemId) return null;
    const addonItems = additionalServices.map((a) => {
      const aid = a.directServiceItemId || boulevardServiceMap[a.slug]?.[locKey];
      return aid ? { serviceItemId: aid } : null;
    }).filter(Boolean);
    const addonParam = addonItems.length > 0
      ? `&additionalItems=${encodeURIComponent(JSON.stringify(addonItems))}` : '';
    return `/api/blvd/availability/dates?locationKey=${locKey}&serviceItemId=${encodeURIComponent(itemId)}&staffProviderId=${encodeURIComponent(boulevardProviderId)}&startDate=${today}&endDate=${endHorizon}${addonParam}`;
  }, [directServiceItem, selectedSpecialty, boulevardServiceMap, boulevardProviderId, today, endHorizon, additionalServices]);

  const buildTimesUrl = useCallback((locKey, date) => {
    const itemId = directServiceItem?.id || boulevardServiceMap[selectedSpecialty?.slug]?.[locKey];
    if (!itemId) return null;
    const addonItems = additionalServices.map((a) => {
      const aid = a.directServiceItemId || boulevardServiceMap[a.slug]?.[locKey];
      return aid ? { serviceItemId: aid } : null;
    }).filter(Boolean);
    const addonParam = addonItems.length > 0
      ? `&additionalItems=${encodeURIComponent(JSON.stringify(addonItems))}` : '';
    return `/api/blvd/availability/times?locationKey=${locKey}&serviceItemId=${encodeURIComponent(itemId)}&staffProviderId=${encodeURIComponent(boulevardProviderId)}&date=${date}${addonParam}`;
  }, [directServiceItem, selectedSpecialty, boulevardServiceMap, boulevardProviderId, additionalServices]);

  // Dates: single location or merge both
  const serviceKey = directServiceItem?.id || selectedSpecialty?.slug || '';
  const datesSwrKey = (directServiceItem || selectedSpecialty) && selectedLocation && isAtOrPastDate
    ? `dates:v3:${selectedLocation}:${serviceKey}:${addonSlugsKey}:${today}:${endHorizon}:${boulevardProviderId}`
    : null;
  const { data: datesResult, isLoading: datesLoading } = useSWR(
    datesSwrKey,
    async () => {
      if (isAnyLocation) {
        const results = await Promise.all(
          locations.map((loc) => {
            const url = buildDatesUrl(loc.key);
            return url ? fetch(url).then((r) => r.json()).catch(() => []) : [];
          })
        );
        // Build per-date location map: { '2026-02-23': ['carmel', 'westfield'] }
        const locationMap = {};
        locations.forEach((loc, i) => {
          (results[i] || []).forEach((date) => {
            if (!locationMap[date]) locationMap[date] = [];
            locationMap[date].push(loc.key);
          });
        });
        const allDates = [...new Set(results.flat())].sort();
        return { dates: allDates, locationMap };
      }
      const url = buildDatesUrl(selectedLocation);
      const dates = url ? await fetch(url).then((r) => r.json()) : [];
      return { dates, locationMap: null };
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  // Handle both old cache format (plain array) and new format ({ dates, locationMap })
  const availableDates = Array.isArray(datesResult) ? datesResult : (datesResult?.dates || []);
  const dateLocationMap = Array.isArray(datesResult) ? null : (datesResult?.locationMap || null);

  // ─── Auto-advance date from URL param/date range ───
  const dateDeepLinked = useRef(false);
  useEffect(() => {
    if (dateDeepLinked.current) return;
    if (!initialDate && !initialDateEnd) return;
    if (step === 'DATE_TIME' && availableDates?.length > 0) {
      const startBound = initialDate || null;
      const endBound = initialDateEnd || initialDate || null;
      let chosenDate = null;

      if (initialDate && availableDates.includes(initialDate)) {
        chosenDate = initialDate;
      } else if (startBound && endBound) {
        chosenDate = availableDates.find((d) => d >= startBound && d <= endBound) || null;
      } else if (endBound) {
        chosenDate = availableDates.find((d) => d <= endBound) || null;
      }

      if (chosenDate) {
        dateDeepLinked.current = true;
        setSelectedDate(chosenDate);
      }
    }
  }, [step, availableDates, initialDate, initialDateEnd]);

  // Auto-select first available date so times show immediately
  useEffect(() => {
    if (step === 'DATE_TIME' && !selectedDate && !dateDeepLinked.current && availableDates?.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [step, selectedDate, availableDates]);

  // Times: single location or merge both (tagged with locationKey/Label)
  const timesSwrKey = (directServiceItem || selectedSpecialty) && selectedLocation && selectedDate
    ? `times:${selectedLocation}:${serviceKey}:${addonSlugsKey}:${selectedDate}:${boulevardProviderId}`
    : null;
  const { data: availableTimes, isLoading: timesLoading } = useSWR(
    timesSwrKey,
    async () => {
      if (isAnyLocation) {
        const results = await Promise.all(
          locations.map((loc) => {
            const url = buildTimesUrl(loc.key, selectedDate);
            return url
              ? fetch(url).then((r) => r.json()).then((slots) =>
                  (slots || []).map((s) => ({ ...s, locationKey: loc.key, locationLabel: loc.label }))
                ).catch(() => [])
              : [];
          })
        );
        // Merge and sort by startTime
        return results.flat().sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      }
      const url = buildTimesUrl(selectedLocation, selectedDate);
      return url ? fetch(url).then((r) => r.json()) : [];
    },
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  // ─── Auto-fetch expanded Boulevard menu when location is set + provider qualifies ───
  // Always show full menu when provider has ≤1 specialty (e.g. massage-only providers need to show all massage types)
  const showFullMenu = filteredBundles.length > 0 || specialties.length >= SHOW_MORE_THRESHOLD || specialties.length <= 1;
  const menuFetchedRef = useRef(false);
  useEffect(() => {
    if (step === 'BUNDLE_ITEMS' && selectedBundle && !activeBundle) {
      setStep('SPECIALTY');
      setSelectedBundle(null);
    }
  }, [step, selectedBundle, activeBundle]);

  useEffect(() => {
    const shouldFetchMenu = treatmentBundles.length > 0 || specialties.length >= SHOW_MORE_THRESHOLD || specialties.length <= 1 || step === 'ADD_SERVICE';
    if (!selectedLocation || !boulevardProviderId) return;
    if (!shouldFetchMenu) return;
    if (menuFetchedRef.current || expandedMenuData) return;
    menuFetchedRef.current = true;

    setExpandedMenuLoading(true);
    (async () => {
      try {
        if (isAnyLocation) {
          const results = await Promise.all(
            locations.map((loc) =>
              fetch(`/api/blvd/services/menu?locationKey=${loc.key}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`)
                .then((r) => r.json())
                .catch(() => ({ categories: [] }))
            )
          );
          const mergedMap = new Map();
          for (const result of results) {
            for (const cat of result.categories || []) {
              if (!mergedMap.has(cat.name)) {
                mergedMap.set(cat.name, { ...cat, items: new Map() });
              }
              const merged = mergedMap.get(cat.name);
              for (const item of cat.items || []) {
                if (!merged.items.has(item.name)) merged.items.set(item.name, item);
              }
            }
          }
          setExpandedMenuData({
            categories: [...mergedMap.values()].map((c) => ({ ...c, items: [...c.items.values()] })),
          });
        } else {
          const res = await fetch(
            `/api/blvd/services/menu?locationKey=${effectiveLocation}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`
          );
          setExpandedMenuData(await res.json());
        }
      } catch {
        setExpandedMenuData({ categories: [] });
      } finally {
        setExpandedMenuLoading(false);
      }
    })();
  }, [step, treatmentBundles.length, specialties.length, selectedLocation, boulevardProviderId, isAnyLocation, locations, effectiveLocation, expandedMenuData]);

  // When menu is primary and has exactly one category, auto-select it to show items directly
  const autoSelectedMenuCategory = useRef(false);
  useEffect(() => {
    if (!menuIsPrimaryServiceList || autoSelectedMenuCategory.current) return;
    if (!expandedMenuData?.categories || expandedMenuLoading) return;
    if (expandedMenuData.categories.length === 1 && step === 'SPECIALTY') {
      autoSelectedMenuCategory.current = true;
      const cat = expandedMenuData.categories[0];
      if (cat.items.length === 1) {
        setDirectServiceItem({ id: cat.items[0].id, name: cat.items[0].name, categoryName: cat.name });
        if (selectedLocation) setReadyToAdvance(true);
      } else {
        setPendingCategory(cat);
        setStep('MENU_ITEM');
      }
    }
  }, [menuIsPrimaryServiceList, expandedMenuData, expandedMenuLoading, step, selectedLocation]);

  // ─── Handlers ───
  const handleSelectSpecialty = (spec, { keepBundleContext = false } = {}) => {
    trackServiceSelect({ name: spec?.title || spec?.slug, id: spec?.slug, categoryName: keepBundleContext ? selectedBundle?.title : null });
    setSelectedSpecialty(spec);
    if (!keepBundleContext) {
      setSelectedBundle(null);
      setSelectedBundleItem(null);
    }
    setDirectServiceItem(null);
    setPendingCategory(null);
    setAddonPendingCategory(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setAdditionalServices([]);
    setAddonDurations({});
    fetchedAddonSlugs.current = new Set();
    setCartData(null);
    setHasOptions(null);
    setServiceDuration(null);
    if (selectedLocation) setReadyToAdvance(true);
  };

  const handleSelectLocation = (locKey) => {
    setSelectedLocation(locKey);
    setSelectedBundleItem(null);
    setAddonPendingCategory(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setAdditionalServices([]);
    setAddonDurations({});
    fetchedAddonSlugs.current = new Set();
    setCartData(null);
    setHasOptions(null);
    setServiceDuration(null);
    // Reset expanded menu so it re-fetches for the new location
    setExpandedMenuData(null);
    menuFetchedRef.current = false;
    if (selectedSpecialty) setReadyToAdvance(true);
  };

  // ─── Treatment bundle handlers ───
  const handleSelectBundle = (bundle) => {
    setSelectedSpecialty(null);
    setDirectServiceItem(null);
    setPendingCategory(null);
    setAddonPendingCategory(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setAdditionalServices([]);
    setAddonDurations({});
    fetchedAddonSlugs.current = new Set();
    setCartData(null);
    setHasOptions(null);
    setServiceDuration(null);
    setSelectedBundle(bundle);
    setSelectedBundleItem(null);
    // Always show BUNDLE_ITEMS — even single-slug bundles get a confirmation step
    setStep('BUNDLE_ITEMS');
  };

  const handleSelectBundleItem = (item) => {
    trackServiceSelect({ name: item.label || item.slug, id: item.catalogId || item.slug, categoryName: selectedBundle?.title });
    setSelectedBundleItem(item);
    // Try slug-based path first (supports add-ons via boulevardServiceMap)
    if (item.slug && boulevardServiceMap[item.slug]) {
      const spec = specialties.find((s) => s.slug === item.slug) || { slug: item.slug, title: item.label || SLUG_TITLES[item.slug] || item.slug };
      handleSelectSpecialty(spec, { keepBundleContext: true });
      return;
    }
    // Fallback: use catalogId as direct service item (Boulevard item ID)
    if (item.catalogId) {
      setDirectServiceItem({ id: item.catalogId, name: item.label });
      setPendingCategory(null);
      setReadyToAdvance(true);
      return;
    }
    // Last resort: try slug path anyway
    const spec = specialties.find((s) => s.slug === item.slug) || { slug: item.slug, title: item.label || item.slug };
    handleSelectSpecialty(spec);
  };

  const handleSelectFromExpandedMenu = (category) => {
    trackServiceSelect({ name: category.items?.length === 1 ? category.items[0].name : category.name, id: category.id, categoryName: category.name });
    // Clear existing selections
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setAdditionalServices([]);
    setAddonDurations({});
    fetchedAddonSlugs.current = new Set();
    setCartData(null);
    setHasOptions(null);
    setServiceDuration(null);
    setSelectedSpecialty(null);
    setSelectedBundle(null);
    setSelectedBundleItem(null);
    setAddonPendingCategory(null);

    if (category.items.length === 1) {
      // Single item — select directly
      setDirectServiceItem({ id: category.items[0].id, name: category.items[0].name, categoryName: category.name });
      setPendingCategory(null);
      if (selectedLocation) setReadyToAdvance(true);
    } else {
      // Multi-item — show sub-step
      setPendingCategory(category);
      setDirectServiceItem(null);
      setStep('MENU_ITEM');
    }
  };

  const handleSelectMenuItem = (item) => {
    trackServiceSelect({ name: item.name, id: item.id, categoryName: pendingCategory?.name });
    setDirectServiceItem({ id: item.id, name: item.name, categoryName: pendingCategory?.name || '' });
    setHasOptions(null);
    setServiceDuration(null);
    setPendingCategory(null);
    if (selectedLocation) setReadyToAdvance(true);
  };

  const handleChooseAddonCategory = (category) => {
    if (!category) return;
    if ((category.items || []).length === 1) {
      const item = category.items[0];
      handleAddService({ catalogId: item.id, title: item.name, slug: null });
      return;
    }
    setAddonPendingCategory(category);
    setStep('ADDON_MENU_ITEM');
  };

  const handleSelectAddonMenuItem = (item) => {
    if (!item?.id) return;
    handleAddService({ catalogId: item.id, title: item.name, slug: null });
    setAddonPendingCategory(null);
    setStep('ADD_SERVICE');
  };

  const handleToggleOption = (group, option) => {
    setSelectedOptions((prev) => toggleOption(prev, group, option));
  };

  const handleAddService = async (addon) => {
    const loc = effectiveLocation;
    const addonServiceItemId = addon.catalogId || addon.serviceItemId || boulevardServiceMap[addon.slug]?.[loc];
    if (!addonServiceItemId) return;

    // Fetch options for the addon service
    try {
      const res = await fetch(
        `/api/blvd/services/options?locationKey=${loc}&serviceItemId=${encodeURIComponent(addonServiceItemId)}&staffProviderId=${encodeURIComponent(boulevardProviderId)}`
      );
      const info = await res.json();
      const dur = info.duration?.staffDuration || info.duration?.max || info.duration?.min || 0;
      const groups = (info.optionGroups || []).filter((g) => g.options?.length > 0);

      setAdditionalServices((prev) => [
        ...prev,
        {
          slug: addon.slug,
          catalogId: addon.catalogId || null,
          title: addon.title,
          serviceItemId: addonServiceItemId,
          selectedOptions: [],
          optionGroups: groups,
          hasOptions: groups.length > 0,
          optionsConfigured: groups.length === 0, // no options = already configured
          duration: dur,
        },
      ]);
    } catch {
      // Silently add without options info
      setAdditionalServices((prev) => [
        ...prev,
        {
          slug: addon.slug,
          catalogId: addon.catalogId || null,
          title: addon.title,
          serviceItemId: addonServiceItemId,
          selectedOptions: [],
          optionGroups: [],
          hasOptions: false,
          optionsConfigured: true,
          duration: 0,
        },
      ]);
    }
  };

  const handleRemoveService = (index) => {
    setAdditionalServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddonToggleOption = (addonIdx, group, option) => {
    setAdditionalServices((prev) => prev.map((a, i) => {
      if (i !== addonIdx) return a;
      return { ...a, selectedOptions: toggleOption(a.selectedOptions, group, option) };
    }));
  };

  const handleAddonOptionsComplete = (addonIdx) => {
    setAdditionalServices((prev) => prev.map((a, i) => i === addonIdx ? { ...a, optionsConfigured: true } : a));
    // Find next unconfigured addon
    const nextIdx = additionalServices.findIndex((a, i) => i > addonIdx && a.hasOptions && !a.optionsConfigured);
    if (nextIdx >= 0) {
      setAddonOptionsIndex(nextIdx);
      setStep(`ADDON_OPTIONS_${nextIdx}`);
    } else {
      setStep('DATE_TIME');
    }
  };

  const handleSelectDate = (date) => {
    trackDateSelect(date);
    setSelectedDate(date);
    setSelectedTime(null);
    setCartData(null);
    setReserveError(null);
    // Stay on DATE_TIME — TimeGrid renders below DateStrip
  };

  const handleSelectTime = async (slot) => {
    trackTimeSelect(slot);
    setSelectedTime(slot);
    setReserveError(null);
    setReserving(true);

    // Resolve actual location (from slot when 'any', otherwise from state)
    const actualLocation = slot.locationKey || selectedLocation;
    const actualServiceItemId = directServiceItem?.id || boulevardServiceMap[selectedSpecialty?.slug]?.[actualLocation] || serviceItemId;

    try {
      const body = {
        locationKey: actualLocation,
        serviceItemId: actualServiceItemId,
        staffProviderId: boulevardProviderId,
        date: selectedDate,
        startTime: slot.startTime,
        selectedOptionIds: selectedOptions.map((o) => o.id),
      };

      if (additionalServices.length > 0) {
        body.additionalItems = additionalServices.map((a) => ({
          serviceItemId: boulevardServiceMap[a.slug]?.[actualLocation] || a.serviceItemId,
          selectedOptionIds: (a.selectedOptions || []).map((o) => o.id),
        }));
      }

      const res = await fetch('/api/blvd/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reserve');
      setCartData(data);
      if (data.duration) setServiceDuration(data.duration);
      setStep('CHECKOUT');
    } catch (err) {
      setReserveError(err.message);
      setSelectedTime(null);
    } finally {
      setReserving(false);
    }
  };

  const handleExpired = useCallback(() => {
    setCartData(null);
    setSelectedTime(null);
    setStep('DATE_TIME');
    setReserveError('Your reservation expired. Please select a new time.');
  }, []);

  const handleBookingSuccess = useCallback(() => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'custom_booking_complete',
        provider: providerName,
        specialty: directServiceItem?.name || selectedSpecialty?.slug,
        additionalServices: additionalServices.map((a) => a.slug),
        location: selectedLocation,
      });
    } catch {}
  }, [providerName, selectedSpecialty, selectedLocation, additionalServices]);

  // Track which step we came from when entering ADD_SERVICE (it's not in the progress bar)
  const [addServiceReturnStep, setAddServiceReturnStep] = useState(null);

  const goBack = () => {
    // ADD_SERVICE is not in computedSteps — handle it specially
    if (step === 'ADD_SERVICE') {
      setAddonPendingCategory(null);
      setStep(addServiceReturnStep || 'DATE_TIME');
      return;
    }

    const idx = computedSteps.findIndex((s) => s.key === step);

    // If on first step (or steps that would go to first step) and onExitPicker exists, exit the picker
    if ((idx <= 0 || (idx === 1 && computedSteps[0].key === 'SPECIALTY')) && step === 'SPECIALTY' && onExitPicker) {
      onExitPicker();
      return;
    }
    // Also handle going back from OPTIONS/DATE_TIME when specialty was auto-skipped
    if (idx <= 0 && onExitPicker) {
      onExitPicker();
      return;
    }

    if (idx <= 0) return;
    const prevKey = computedSteps[idx - 1].key;

    // Clean up state when going back
    if (step === 'DATE_TIME') {
      setSelectedDate(null);
      setSelectedTime(null);
      setCartData(null);
      setReserveError(null);
    } else if (step === 'CHECKOUT') {
      setCartData(null);
    } else if (step === 'OPTIONS') {
      setSelectedOptions([]);
      if (directServiceItem) {
        setDirectServiceItem(null);
        setHasOptions(null);
        setServiceDuration(null);
      }
    } else if (step === 'BUNDLE_ITEMS') {
      setSelectedBundle(null);
      setSelectedSpecialty(null);
    } else if (step === 'MENU_ITEM') {
      setPendingCategory(null);
    } else if (step === 'ADDON_MENU_ITEM') {
      setAddonPendingCategory(null);
    } else if (step.startsWith('ADDON_OPTIONS_')) {
      // Mark addon as not configured so user can redo
      const addonIdx = parseInt(step.split('_').pop(), 10);
      setAdditionalServices((prev) => prev.map((a, i) => i === addonIdx ? { ...a, optionsConfigured: false } : a));
    }

    setStep(prevKey);
  };

  const resetToStart = () => {
    setStep('SPECIALTY');
    setSelectedSpecialty(specialties.length === 1 ? specialties[0] : null);
    setSelectedLocation(
      (initialLocation && locations.some((l) => l.key === initialLocation)) ? initialLocation : (locations[0]?.key || null)
    );
    setDirectServiceItem(null);
    setPendingCategory(null);
    setAddonPendingCategory(null);
    setSelectedBundle(null);
    setSelectedBundleItem(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setAdditionalServices([]);
    setCartData(null);
    setReserveError(null);
    setHasOptions(null);
    setServiceDuration(null);
  };

  const firstName = providerName?.split(/\s/)[0] || 'Provider';
  const locInfo = isAnyLocation ? null : (selectedLocation ? LOCATION_INFO[selectedLocation] : null);
  const canGoBack = (stepIndex > 0 || step === 'ADD_SERVICE' || (step === 'SPECIALTY' && onExitPicker)) && (
    !(step === 'SPECIALTY' && !onExitPicker) &&
    !(step === 'OPTIONS' && specialties.length <= 1 && locations.length <= 1 && !onExitPicker) &&
    !(step === 'DATE_TIME' && !hasOptions && specialties.length <= 1 && locations.length <= 1 && !onExitPicker)
  );

  // Build summary
  const summary = cartData?.summary || {
    serviceName: directServiceItem?.name || selectedSpecialty?.title,
    staffName: providerName,
    location: selectedLocation,
    date: selectedDate,
    startTime: selectedTime?.startTime,
    duration: totalDuration,
    additionalServiceNames: additionalServices.map((a) => a.title),
  };

  // ─── Pill style (reusable) ───
  const pillStyle = {
    fontFamily: fonts?.body,
    fontSize: '0.625rem',
    fontWeight: 600,
    color: colors.violet,
    backgroundColor: `${colors.violet}08`,
    border: `1px solid ${colors.violet}20`,
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>
      {/* ─── Header ─── */}
      <div className="px-6 pt-5 pb-3" style={{ borderBottom: `1px solid ${colors.stone}` }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p style={{ fontFamily: fonts?.body, ...typeScale.label, color: colors.violet, margin: 0 }}>
              Book with {firstName}
            </p>
            {locInfo && (
              <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.25rem' }}>
                {locInfo.name} &middot; {locInfo.phone}
              </p>
            )}
          </div>
          {canGoBack && (
            <button onClick={goBack} style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 500, color: colors.violet, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginTop: '0.125rem' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
          )}
        </div>

        {/* Accumulated selections */}
        {step !== 'SPECIALTY' && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(selectedSpecialty || directServiceItem) && (
              <span className="rounded-full px-2.5 py-0.5" style={pillStyle}>
                {directServiceItem?.name || selectedSpecialty?.title}
                {serviceDuration ? ` · ${formatDuration(serviceDuration)}` : ''}
              </span>
            )}
            {additionalServices.map((addon, i) => (
              <span key={i} className="rounded-full px-2.5 py-0.5" style={pillStyle}>
                + {addon.title}
                {addon.duration ? ` · ${formatDuration(addon.duration)}` : ''}
              </span>
            ))}
            {additionalServices.length > 0 && totalDuration && (
              <span className="rounded-full px-2.5 py-0.5" style={{ ...pillStyle, fontWeight: 700 }}>
                Total: {formatDuration(totalDuration)}
              </span>
            )}
            {selectedDate && step === 'CHECKOUT' && (
              <span className="rounded-full px-2.5 py-0.5" style={pillStyle}>{formatDate(selectedDate)}</span>
            )}
            {selectedTime && step === 'CHECKOUT' && (
              <span className="rounded-full px-2.5 py-0.5" style={pillStyle}>{formatTime(selectedTime.startTime)}</span>
            )}
          </div>
        )}

        {/* Step progress bar */}
        <div className="flex gap-1 mt-3">
          {computedSteps.map(({ key, label }, i) => (
            <div key={key} className="flex-1">
              <div className="rounded-full transition-all duration-300" style={{ height: 3, backgroundColor: stepIndex >= i ? colors.violet : colors.stone }} />
              <p style={{ fontFamily: fonts?.body, fontSize: '0.5625rem', fontWeight: stepIndex === i ? 600 : 400, color: stepIndex >= i ? colors.violet : colors.muted, textAlign: 'center', margin: '0.2rem 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step Content ─── */}
      <div className="px-6 py-5">
        <AnimatePresence mode="wait">
          {/* SPECIALTY */}
          {step === 'SPECIALTY' && (
            <motion.div key="specialty" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              {(serviceItemId || primaryServiceItemId) && hasOptions === null && optionsLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="flex gap-2 items-center">
                    <div className="rounded-full animate-pulse" style={{ width: 6, height: 6, backgroundColor: colors.violet }} />
                    <span style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.muted }}>Loading service details...</span>
                  </div>
                </div>
              )}
              {locations.length > 1 && !locationLocked && !((serviceItemId || primaryServiceItemId) && hasOptions === null && optionsLoading) && (
                <div className="mb-4">
                  <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>Choose location</p>
                  <div className="flex gap-2 flex-wrap">
                    {locations.map((loc) => (
                      <button key={loc.key} onClick={() => handleSelectLocation(loc.key)} className="rounded-full transition-all duration-200" style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1.25rem', cursor: 'pointer', backgroundColor: selectedLocation === loc.key ? colors.violet : colors.cream, color: selectedLocation === loc.key ? '#fff' : colors.heading, border: selectedLocation === loc.key ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}` }}>
                        {loc.label}
                      </button>
                    ))}
                    <button onClick={() => handleSelectLocation('any')} className="rounded-full transition-all duration-200" style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1.25rem', cursor: 'pointer', backgroundColor: selectedLocation === 'any' ? colors.violet : colors.cream, color: selectedLocation === 'any' ? '#fff' : colors.heading, border: selectedLocation === 'any' ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}` }}>
                      No Preference
                    </button>
                  </div>
                </div>
              )}
              {!((serviceItemId || primaryServiceItemId) && hasOptions === null && optionsLoading) && (
                <div>
                  {/* Treatment bundles (when available) */}
                  {filteredBundles.length > 0 ? (
                    <>
                      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>
                        What do you need?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {displayedBundles.map((bundle) => (
                          <button
                            key={bundle.id}
                            onClick={() => handleSelectBundle(bundle)}
                            className="rounded-xl text-left transition-all duration-200"
                            style={{
                              fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600,
                              padding: '0.875rem 1rem', cursor: 'pointer',
                              backgroundColor: selectedBundle?.id === bundle.id ? `${colors.violet}10` : colors.cream,
                              color: colors.heading,
                              border: selectedBundle?.id === bundle.id ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}`,
                            }}
                          >
                            <span style={{ display: 'block' }}>{bundle.title}</span>
                            {bundle.description && (
                              <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 400, color: colors.muted, marginTop: '0.125rem', lineHeight: 1.3 }}>
                                {bundle.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {filteredBundles.length > 4 && (
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.muted, marginTop: '0.5rem' }}>
                          Showing top 4 bundles for faster booking.
                        </p>
                      )}
                    </>
                  ) : specialties.length > 1 ? (
                    <>
                      <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>What do you need?</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {specialties.map((spec) => (
                          <button key={spec.slug} onClick={() => handleSelectSpecialty(spec)} className="rounded-xl text-left transition-all duration-200" style={{ fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.875rem 1rem', cursor: 'pointer', backgroundColor: selectedSpecialty?.slug === spec.slug ? `${colors.violet}10` : colors.cream, color: colors.heading, border: selectedSpecialty?.slug === spec.slug ? `1.5px solid ${colors.violet}` : `1px solid ${colors.stone}` }}>
                            {spec.title}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {/* Full Boulevard service menu */}
                  {showFullMenu && selectedLocation && (
                    <ExpandedServiceMenu
                      categories={expandedMenuData?.categories || []}
                      loading={expandedMenuLoading}
                      onSelectCategory={handleSelectFromExpandedMenu}
                      fonts={fonts}
                      primary={menuIsPrimaryServiceList}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* BUNDLE_ITEMS — pick a service from within a treatment bundle */}
          {step === 'BUNDLE_ITEMS' && activeBundle && (
            <motion.div key="bundle-items" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.25rem' }}>
                {activeBundle.title}
              </p>
              {activeBundle.description && (
                <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', color: colors.muted, marginBottom: '0.75rem' }}>
                  {activeBundle.description}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(activeBundle.availableItems || []).map((item, idx) => {
                  const meta = metaForChoice(item);
                  return (
                  <button
                    key={item.catalogId || item.slug || idx}
                    onClick={() => handleSelectBundleItem(item)}
                    className="rounded-xl text-left transition-all duration-200"
                    style={{ fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.875rem 1rem', cursor: 'pointer', backgroundColor: colors.cream, color: colors.heading, border: `1px solid ${colors.stone}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{item.label}</span>
                      {meta.priceLabel && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.violet, whiteSpace: 'nowrap' }}>
                          {meta.priceLabel}
                        </span>
                      )}
                    </div>
                  </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MENU_ITEM — sub-item selection for multi-item Boulevard categories */}
          {step === 'MENU_ITEM' && pendingCategory && (
            <motion.div key="menu-item" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.75rem' }}>
                {pendingCategory.name}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pendingCategory.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMenuItem(item)}
                    className="rounded-xl text-left transition-all duration-200"
                    style={{ fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.875rem 1rem', cursor: 'pointer', backgroundColor: colors.cream, color: colors.heading, border: `1px solid ${colors.stone}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{item.name}</span>
                      {formatPriceRange(item.price, { name: item.name, categoryName: pendingCategory?.name }) && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.violet, whiteSpace: 'nowrap' }}>
                          {formatPriceRange(item.price, { name: item.name, categoryName: pendingCategory?.name })}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ADDON_MENU_ITEM — pick add-on service from chosen category */}
          {step === 'ADDON_MENU_ITEM' && addonPendingCategory && (
            <motion.div key="addon-menu-item" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.75rem' }}>
                Add from {addonPendingCategory.name}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {addonPendingCategory.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAddonMenuItem(item)}
                    className="rounded-xl text-left transition-all duration-200"
                    style={{ fontFamily: fonts?.body, fontSize: '0.875rem', fontWeight: 600, padding: '0.875rem 1rem', cursor: 'pointer', backgroundColor: colors.cream, color: colors.heading, border: `1px solid ${colors.stone}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{item.name}</span>
                      {formatPriceRange(item.price, { name: item.name, categoryName: addonPendingCategory?.name }) && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.violet, whiteSpace: 'nowrap' }}>
                          {formatPriceRange(item.price, { name: item.name, categoryName: addonPendingCategory?.name })}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* OPTIONS (main service) */}
          {step === 'OPTIONS' && (
            <motion.div key="options" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              {optionsLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="rounded-xl animate-pulse" style={{ height: 56, backgroundColor: colors.stone }} />))}</div>
              ) : (
                <OptionsStep
                  optionGroups={(serviceInfo?.optionGroups || []).filter((g) => g.options?.length > 0)}
                  selectedOptions={selectedOptions}
                  onToggleOption={handleToggleOption}
                  onContinue={advanceFromOptions}
                  onSkip={() => { setSelectedOptions([]); advanceFromOptions(); }}
                  fonts={fonts}
                />
              )}
              {showAddServiceStep && (
                <button
                  onClick={goToAddService}
                  style={{
                    fontFamily: fonts?.body,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: colors.violet,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    marginTop: '0.25rem',
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  + Add another service with {firstName}
                </button>
              )}
            </motion.div>
          )}

          {/* ADD_SERVICE */}
          {step === 'ADD_SERVICE' && (
            <motion.div key="add-service" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <AddServiceStep
                providerFirstName={firstName}
                compatibleAddons={enrichedAddons}
                fallbackCategories={fallbackAddonCategories}
                menuLoading={expandedMenuLoading}
                additionalServices={additionalServices}
                maxServices={MAX_SERVICES_PER_BOOKING}
                onAddService={handleAddService}
                onChooseCategory={handleChooseAddonCategory}
                onRemoveService={handleRemoveService}
                onContinue={advanceFromAddService}
                fonts={fonts}
              />
            </motion.div>
          )}

          {/* ADDON_OPTIONS_N */}
          {step.startsWith('ADDON_OPTIONS_') && (() => {
            const idx = parseInt(step.split('_').pop(), 10);
            const addon = additionalServices[idx];
            if (!addon) return null;
            return (
              <motion.div key={step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
                <p style={{ fontFamily: fonts?.body, fontSize: '0.75rem', fontWeight: 500, color: colors.muted, marginBottom: '0.25rem' }}>
                  Options for {addon.title}
                </p>
                <OptionsStep
                  optionGroups={addon.optionGroups}
                  selectedOptions={addon.selectedOptions || []}
                  onToggleOption={(group, option) => handleAddonToggleOption(idx, group, option)}
                  onContinue={() => handleAddonOptionsComplete(idx)}
                  onSkip={() => {
                    setAdditionalServices((prev) => prev.map((a, i) => i === idx ? { ...a, selectedOptions: [], optionsConfigured: true } : a));
                    handleAddonOptionsComplete(idx);
                  }}
                  fonts={fonts}
                />
              </motion.div>
            );
          })()}

          {/* DATE & TIME (combined) */}
          {step === 'DATE_TIME' && (
            <motion.div key="date-time" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              {/* Already-added services + add-more link */}
              {additionalServices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {additionalServices.map((svc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
                      style={{
                        fontFamily: fonts?.body,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: colors.violet,
                        backgroundColor: `${colors.violet}08`,
                        border: `1px solid ${colors.violet}20`,
                      }}
                    >
                      + {svc.title}
                    </span>
                  ))}
                </div>
              )}
              {showAddServiceStep && (
                <button
                  onClick={goToAddService}
                  style={{
                    fontFamily: fonts?.body,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: colors.violet,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: '0.75rem',
                    display: 'block',
                  }}
                >
                  + Add another service with {firstName}
                </button>
              )}
              <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading, marginBottom: '0.5rem' }}>Pick a date</p>
              {datesLoading ? (
                <div className="flex gap-2 overflow-hidden">{Array.from({ length: 7 }).map((_, i) => (<div key={i} className="flex-shrink-0 rounded-xl animate-pulse" style={{ width: 64, height: 72, backgroundColor: colors.stone }} />))}</div>
              ) : availableDates?.length === 0 ? (
                <div className="text-center py-6">
                  <p style={{ fontFamily: fonts?.body, fontSize: '0.875rem', color: colors.muted }}>No availability found.</p>
                  {specialties.length > 1 && (
                    <button onClick={resetToStart} className="mt-3 rounded-full" style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 1.25rem', background: gradients.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>Try another service</button>
                  )}
                </div>
              ) : (
                <DateStrip availableDates={availableDates || []} selectedDate={selectedDate} onSelect={handleSelectDate} fonts={fonts} startDate={today} dateLocationMap={dateLocationMap} locations={locations} />
              )}

              {/* Time slots slide in below when a date is selected */}
              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div
                    key={`times-${selectedDate}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingTop: '1rem' }}>
                      <div className="flex items-baseline justify-between mb-2">
                        <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', fontWeight: 600, color: colors.heading }}>
                          {formatDate(selectedDate)} &mdash; Pick a time
                        </p>
                        {totalDuration && (
                          <span style={{ fontFamily: fonts?.body, fontSize: '0.6875rem', color: colors.muted }}>{formatDuration(totalDuration)}</span>
                        )}
                      </div>
                      {reserveError && (
                        <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: `${colors.rose}08`, border: `1px solid ${colors.rose}20` }}>
                          <p style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.rose }}>{reserveError}</p>
                        </div>
                      )}
                      <TimeGrid times={availableTimes || []} selectedTimeId={selectedTime?.id} onSelect={handleSelectTime} loading={timesLoading || reserving} fonts={fonts} duration={totalDuration} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CHECKOUT */}
          {step === 'CHECKOUT' && cartData && (
            <motion.div key="checkout" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <ClientInfoForm
                cartId={cartData.cartId}
                expiresAt={cartData.expiresAt}
                summary={summary}
                fonts={fonts}
                onSuccess={handleBookingSuccess}
                onExpired={handleExpired}
                onBack={() => { setStep('DATE_TIME'); setCartData(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
