import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '@/components/preview/tokens';
import BookingChoiceCard from '@/components/booking/BookingChoiceCard';
import ProviderAvailabilityPicker from '@/components/booking/ProviderAvailabilityPicker';
import { categorizeProvider, roleMatches } from '@/lib/provider-roles';
import { getBundlesForProvider, TREATMENT_BUNDLES } from '@/data/treatmentBundles';
import { normalizeToken, providerLocationKeys, matchesLocation } from '@/lib/start-booking';
import { getWeightedProviders, selectProviderByWeight } from '@/lib/provider-routing';

const FIRST_AVAILABLE_SLUG = '__first_available__';

const SPECIALTY_MAP = [
  { key: /tox|botox|jeuveau|xeomin|dysport/i, title: 'Tox', slug: 'tox' },
  { key: /filler|lip|facial balanc/i, title: 'Dermal Fillers', slug: 'filler' },
  { key: /sculptra/i, title: 'Sculptra', slug: 'sculptra' },
  { key: /morpheus/i, title: 'Morpheus8', slug: 'morpheus8' },
  { key: /skinpen|microneed/i, title: 'Microneedling', slug: 'microneedling' },
  { key: /ipl|photofacial/i, title: 'IPL Photofacial', slug: 'ipl' },
  { key: /laser hair/i, title: 'Laser Hair Removal', slug: 'laser-hair-removal' },
  { key: /co2|co₂|resurfac/i, title: 'CO₂ Resurfacing', slug: 'co2-resurfacing' },
  { key: /body contour|evolvex/i, title: 'Body Contouring', slug: 'body-contouring' },
  { key: /hydrafacial/i, title: 'HydraFacial', slug: 'hydrafacial' },
  { key: /glo2/i, title: 'Glo2Facial', slug: 'glo2facial' },
  { key: /facial|peel/i, title: 'Facials & Peels', slug: 'facials' },
  { key: /massage|deep tissue|thai|stretch|hot stone|cupping|swedish|relaxation|prenatal/i, title: 'Massage', slug: 'massage' },
];

// "Facials" is a parent category — providers with it may also do Glo2Facial & HydraFacial,
// but only if they have the corresponding boulevardServiceMap entry or explicit specialty.
const FACIALS_IMPLIES = ['glo2facial', 'hydrafacial'];

function specialtyToServices(specialties = [], boulevardServiceMap = null) {
  const seen = new Set();
  const items = [];
  specialties.forEach((sObj) => {
    const name = (sObj?.specialty || '').trim();
    if (!name) return;
    const match = SPECIALTY_MAP.find((m) => m.key.test(name));
    if (match && !seen.has(match.slug)) {
      seen.add(match.slug);
      items.push(match);
    }
  });
  // Expand: "Facials" specialty implies Glo2Facial & HydraFacial — but only if the
  // provider has the service mapped in Boulevard (avoids phantom matches)
  if (seen.has('facials') && boulevardServiceMap) {
    FACIALS_IMPLIES.forEach((slug) => {
      if (!seen.has(slug) && Object.keys(boulevardServiceMap[slug] || {}).length > 0) {
        const entry = SPECIALTY_MAP.find((m) => m.slug === slug);
        if (entry) { seen.add(slug); items.push(entry); }
      }
    });
  }
  return items;
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
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isConsultationLike(name = '') {
  const text = String(name || '').toLowerCase();
  return /consult|not sure where to start|get started|reveal/.test(text);
}

function formatPriceRange(price, name = '') {
  if (!price) return isConsultationLike(name) ? 'FREE' : 'Varies';
  const min = normalizeMoneyValue(price.min ?? price.minPrice ?? price.minimum ?? price);
  const max = normalizeMoneyValue(price.max ?? price.maxPrice ?? price.maximum ?? price);
  const consultation = isConsultationLike(name);
  if (min == null && max == null) return consultation ? 'FREE' : 'Varies';
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

function normalizeName(v) {
  return normalizeToken(v).replace(/[^a-z0-9]/g, '');
}

function findProviderByToken(providers, token) {
  if (!token) return null;
  const t = normalizeName(token);
  if (!t) return null;
  return (
    providers.find((p) => normalizeName(p?.slug) === t) ||
    providers.find((p) => normalizeName(p?.name || p?.title) === t) ||
    providers.find((p) => normalizeName((p?.name || p?.title || '').split(/\s+/)[0]) === t) ||
    null
  );
}

const LOCATION_LABELS = { westfield: 'Westfield', carmel: 'Carmel' };

function providerSubtitle(p) {
  const role = p?.staffFields?.staffTitle || p?.staffFields?.stafftitle || p?.staffFields?.role || 'Provider';
  const locs = providerLocationKeys(p);
  if (!locs.length) return role;
  const locText = locs.map((k) => LOCATION_LABELS[k] || k).join(' & ');
  return `${role} · ${locText}`;
}

function resolveSlug(item) {
  if (item?.slug) return item.slug;
  const label = item?.label || '';
  const match = SPECIALTY_MAP.find((m) => m.key.test(label));
  return match?.slug || null;
}

// Detect role hint from labels like "... w/ Aesthetician" or "... w/ Nurse Injector"
function resolveRole(item) {
  const label = (item?.label || '').toLowerCase();
  if (/aesthetician|esthetician/.test(label)) return 'Aestheticians';
  if (/injector|nurse practitioner/.test(label)) return 'Injectors';
  if (/massage|lmt/.test(label)) return 'Massage Therapists';
  return null;
}

function findServiceByToken(categories, token) {
  if (!token) return null;
  const t = normalizeName(token);
  if (!t) return null;
  return (
    categories.find((svc) => normalizeName(svc.slug) === t) ||
    categories.find((svc) => normalizeName(svc.title) === t) ||
    null
  );
}

// ─── Breadcrumb pills ───
function SelectionBreadcrumbs({ items, fonts, onClear }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onClear(item.key)}
          className="rounded-full px-3 py-1 flex items-center gap-1.5 transition-all duration-200"
          style={{
            fontFamily: fonts?.body,
            fontSize: '0.7rem',
            fontWeight: 600,
            color: colors.violet,
            backgroundColor: `${colors.violet}08`,
            border: `1px solid ${colors.violet}20`,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '0.6rem', color: colors.muted, fontWeight: 400 }}>{item.label}:</span>
          <span>{item.value}</span>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ProviderAvailabilityPickerHandoff({
  activeProvider,
  activeProviderServices,
  activeProviderBundles,
  selectedLocation,
  prefill,
  activeInitialService,
  activeInitialCategory,
  fontKey,
  fonts,
  locationLocked,
  onExitPicker,
}) {
  const providerLocs = providerLocationKeys(activeProvider);
  const providerLocationOptions = useMemo(() => {
    // Don't include 'any' here — ProviderAvailabilityPicker renders its own "No Preference" button
    return providerLocs.map((k) => ({ key: k, label: LOCATION_LABELS[k] || k }));
  }, [providerLocs]);

  const resolvedInitialLocation = useMemo(() => {
    if (selectedLocation && selectedLocation !== 'any') return selectedLocation;
    if (prefill?.locationKey) return prefill.locationKey;
    if (providerLocs.length === 1) return providerLocs[0];
    return 'any';
  }, [selectedLocation, prefill?.locationKey, providerLocs]);

  return (
    <ProviderAvailabilityPicker
      providerName={activeProvider.name || activeProvider.title}
      boulevardProviderId={activeProvider.boulevardProviderId}
      specialties={activeProviderServices}
      locations={providerLocationOptions}
      boulevardServiceMap={activeProvider.boulevardServiceMap || {}}
      fontKey={fontKey}
      fonts={fonts}
      treatmentBundles={activeProviderBundles}
      initialService={activeInitialService || undefined}
      initialDate={prefill?.date || undefined}
      initialDateEnd={prefill?.dateEnd || undefined}
      initialCategory={activeInitialCategory || undefined}
      initialLocation={resolvedInitialLocation}
      locationLocked={locationLocked}
      onExitPicker={onExitPicker}
    />
  );
}

export const START_PATH_CHOICES = [
  { id: 'concern', label: 'I have a concern that I need help with', sub: "We'll guide you" },
  { id: 'provider', label: 'I have a provider I want to see', sub: "Let's get you booked" },
  { id: 'not-sure', label: "I don't know where to start", sub: "That's why we're here" },
  { id: 'all-options', label: 'I want to see all the options', sub: 'Show all categories first' },
];

export default function StartBookingFlow({
  providers = [],
  globalBundles,
  routingConfig = null,
  locationOptions = [],
  prefill = {},
  fonts,
  fontKey,
  fixedPath = null,
  title = null,
  subtitle = null,
  showPathSelector = true,
}) {
  const flowRef = useRef(null);
  const [entryPath, setEntryPath] = useState(fixedPath || null);
  const [selectedLocation, setSelectedLocation] = useState(prefill?.locationKey || null);
  const [concernBundleId, setConcernBundleId] = useState(null);
  const [concernShowAllCategories, setConcernShowAllCategories] = useState(false);
  const [concernService, setConcernService] = useState(null);
  const [concernProviderSlug, setConcernProviderSlug] = useState(null);
  const [providerChoiceSlug, setProviderChoiceSlug] = useState(null);
  const [startChoice, setStartChoice] = useState(null);
  const [startProviderSlug, setStartProviderSlug] = useState(null);
  const [allOptionsService, setAllOptionsService] = useState(null);
  const [allOptionsProviderSlug, setAllOptionsProviderSlug] = useState(null);
  const [resolvedFirstAvailable, setResolvedFirstAvailable] = useState(null);

  // ─── Bundles ───
  const normalizedBundles = useMemo(() => {
    const source = Array.isArray(globalBundles) && globalBundles.length > 0 ? globalBundles : TREATMENT_BUNDLES;
    return source.map((b) => ({
      ...b,
      items: b.items || (b.slugs || []).map((slugItem) => ({ slug: slugItem, label: slugItem })),
    }));
  }, [globalBundles]);

  const getStartedBundle = useMemo(
    () => normalizedBundles.find((b) => /not-sure|get-started|start/i.test(`${b.id} ${b.title}`)) || null,
    [normalizedBundles]
  );

  // ─── Provider + service enrichment (unfiltered base) ───
  const providersWithServices = useMemo(
    () =>
      providers.map((p) => {
        const serviceList = specialtyToServices(p?.staffFields?.specialties || [], p?.boulevardServiceMap || null);
        return { provider: p, serviceList, serviceSlugs: new Set(serviceList.map((s) => s.slug)) };
      }),
    [providers]
  );

  // ─── Location detection ───
  const availableLocations = useMemo(() => {
    const locationSet = new Set();
    providers.forEach((p) => providerLocationKeys(p).forEach((k) => locationSet.add(k)));
    return [...locationSet].map((k) => ({ key: k, label: LOCATION_LABELS[k] || k }));
  }, [providers]);

  const showLocationStep = availableLocations.length > 1;
  const locationResolved = !showLocationStep || selectedLocation != null;

  // ─── Location-filtered providers ───
  const locationFilteredProviders = useMemo(() => {
    if (!selectedLocation || selectedLocation === 'any') return providers;
    return providers.filter((p) => matchesLocation(p, selectedLocation));
  }, [providers, selectedLocation]);

  const locationFilteredPWS = useMemo(() => {
    if (!selectedLocation || selectedLocation === 'any') return providersWithServices;
    return providersWithServices.filter(({ provider }) => matchesLocation(provider, selectedLocation));
  }, [providersWithServices, selectedLocation]);

  // ─── Location-filtered categories ───
  const filteredCategoryChoices = useMemo(() => {
    const map = new Map();
    locationFilteredPWS.forEach(({ serviceList }) => {
      serviceList.forEach((svc) => {
        if (!map.has(svc.slug)) map.set(svc.slug, svc);
      });
    });
    return [...map.values()];
  }, [locationFilteredPWS]);

  // ─── Location-filtered provider-for-service lookup ───
  const filteredProvidersForService = useMemo(
    () => (serviceSlug) => {
      if (!serviceSlug) return locationFilteredProviders;
      return locationFilteredPWS
        .filter(({ serviceSlugs }) => serviceSlugs.has(serviceSlug))
        .map(({ provider }) => provider);
    },
    [locationFilteredProviders, locationFilteredPWS]
  );

  // Slug + role-aware filtering for bundle items (handles "w/ Aesthetician" etc.)
  const filteredProvidersForItem = useMemo(
    () => (item) => {
      const slug = resolveSlug(item);
      const bySlug = filteredProvidersForService(slug);
      const role = resolveRole(item) || item?.bundleRole || null;
      if (!role) return bySlug;
      return bySlug.filter((p) => roleMatches(categorizeProvider(p), role));
    },
    [filteredProvidersForService]
  );

  // Keep old unfiltered version for deep-link resolution (needs all providers)
  const allCategoryChoices = useMemo(() => {
    const map = new Map();
    providersWithServices.forEach(({ serviceList }) => {
      serviceList.forEach((svc) => {
        if (!map.has(svc.slug)) map.set(svc.slug, svc);
      });
    });
    return [...map.values()];
  }, [providersWithServices]);

  const concernBundle = useMemo(
    () => normalizedBundles.find((b) => b.id === concernBundleId) || null,
    [normalizedBundles, concernBundleId]
  );

  const concernProviders = useMemo(
    () => concernService ? filteredProvidersForItem(concernService) : locationFilteredProviders,
    [filteredProvidersForItem, concernService, locationFilteredProviders]
  );

  const startChoices = useMemo(() => {
    const bundleRole = getStartedBundle?.roles?.[0] || null;
    const fromBundle = (getStartedBundle?.items || []).map((it, idx) => ({
      id: `${resolveSlug(it) || it.catalogId || 'consult'}-${idx}`,
      label: it.label || 'Consultation',
      slug: resolveSlug(it),
      bundleRole,
    }));
    if (fromBundle.length > 0) return fromBundle;
    return [{ id: 'consult-default', label: 'Consultation', slug: null }];
  }, [getStartedBundle]);

  // ─── Active provider (resolves across all paths) ───
  const rawProviderSlug =
    (entryPath === 'concern' && concernProviderSlug) ||
    (entryPath === 'provider' && providerChoiceSlug) ||
    (entryPath === 'not-sure' && startProviderSlug) ||
    (entryPath === 'all-options' && allOptionsProviderSlug) ||
    null;

  const isFirstAvailable = rawProviderSlug === FIRST_AVAILABLE_SLUG;

  // Determine eligible providers for the current path (used for weighted selection)
  const firstAvailableEligible = useMemo(() => {
    if (!isFirstAvailable) return [];
    if (entryPath === 'concern') return concernProviders;
    if (entryPath === 'all-options') return filteredProvidersForService(allOptionsService?.slug);
    if (entryPath === 'not-sure') return filteredProvidersForItem(startChoice);
    return [];
  }, [isFirstAvailable, entryPath, concernProviders, filteredProvidersForService, allOptionsService, filteredProvidersForItem, startChoice]);

  // Determine service slug for routing context
  const firstAvailableServiceSlug = isFirstAvailable
    ? (entryPath === 'concern' && concernService?.slug) ||
      (entryPath === 'all-options' && allOptionsService?.slug) ||
      (entryPath === 'not-sure' && startChoice?.slug) ||
      null
    : null;

  // Auto-resolve "First Available" to a weighted provider
  useEffect(() => {
    if (!isFirstAvailable || firstAvailableEligible.length === 0) {
      if (isFirstAvailable) setResolvedFirstAvailable(null);
      return;
    }
    const weighted = getWeightedProviders(firstAvailableEligible, routingConfig, {
      serviceSlug: firstAvailableServiceSlug,
      locationKey: selectedLocation,
    });
    const picked = selectProviderByWeight(weighted);
    setResolvedFirstAvailable(picked);
  }, [isFirstAvailable, firstAvailableEligible, routingConfig, firstAvailableServiceSlug, selectedLocation]);

  const effectiveSlug = isFirstAvailable ? resolvedFirstAvailable?.slug : rawProviderSlug;
  const activeProvider = providers.find((p) => p.slug === effectiveSlug) || null;

  // Re-roll handler for "Try another provider"
  const handleReRoll = useCallback(() => {
    if (firstAvailableEligible.length <= 1) return;
    const weighted = getWeightedProviders(firstAvailableEligible, routingConfig, {
      serviceSlug: firstAvailableServiceSlug,
      locationKey: selectedLocation,
    });
    const picked = selectProviderByWeight(weighted, resolvedFirstAvailable?.slug);
    setResolvedFirstAvailable(picked);
  }, [firstAvailableEligible, routingConfig, firstAvailableServiceSlug, selectedLocation, resolvedFirstAvailable]);

  const activeProviderServices = activeProvider
    ? specialtyToServices(activeProvider?.staffFields?.specialties || [], activeProvider?.boulevardServiceMap || null)
    : [];

  const activeProviderBundles = activeProvider
    ? getBundlesForProvider(
        activeProvider.boulevardServiceMap || {},
        null,
        locationOptions,
        activeProvider.treatmentBundles ?? null,
        globalBundles ?? null,
        categorizeProvider(activeProvider)
      )
    : [];

  const activeInitialService =
    (entryPath === 'concern' && (concernService?.slug || null)) ||
    (entryPath === 'not-sure' && (startChoice?.slug || null)) ||
    (entryPath === 'all-options' && (allOptionsService?.slug || null)) ||
    (prefill?.service || null);

  const activeInitialCategory =
    (entryPath === 'not-sure' ? 'consult' : null) ||
    prefill?.serviceCategory ||
    null;

  // ─── Cascade clearing: invalidate downstream selections when location changes ───
  useEffect(() => {
    if (!entryPath) return;
    const validSlugs = new Set(filteredCategoryChoices.map((s) => s.slug));

    if (entryPath === 'concern') {
      if (concernService && concernService.slug && !validSlugs.has(concernService.slug)) {
        setConcernService(null);
        setConcernProviderSlug(null);
      } else if (concernProviderSlug && concernProviderSlug !== FIRST_AVAILABLE_SLUG && !locationFilteredProviders.find((p) => p.slug === concernProviderSlug)) {
        setConcernProviderSlug(null);
      }
    }
    if (entryPath === 'provider') {
      if (providerChoiceSlug && !locationFilteredProviders.find((p) => p.slug === providerChoiceSlug)) {
        setProviderChoiceSlug(null);
      }
    }
    if (entryPath === 'all-options') {
      if (allOptionsService && !validSlugs.has(allOptionsService.slug)) {
        setAllOptionsService(null);
        setAllOptionsProviderSlug(null);
      } else if (allOptionsProviderSlug && allOptionsProviderSlug !== FIRST_AVAILABLE_SLUG && !locationFilteredProviders.find((p) => p.slug === allOptionsProviderSlug)) {
        setAllOptionsProviderSlug(null);
      }
    }
    if (entryPath === 'not-sure') {
      if (startProviderSlug && startProviderSlug !== FIRST_AVAILABLE_SLUG && !locationFilteredProviders.find((p) => p.slug === startProviderSlug)) {
        setStartProviderSlug(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  // ─── Prefill effects ───
  useEffect(() => {
    if (!fixedPath) return;
    setEntryPath(fixedPath);
  }, [fixedPath]);

  useEffect(() => {
    if (!entryPath || !providers.length) return;
    const p = findProviderByToken(providers, prefill.provider);
    if (entryPath === 'provider' && p && !providerChoiceSlug) setProviderChoiceSlug(p.slug);
    if (entryPath === 'concern' && p && concernService && !concernProviderSlug) setConcernProviderSlug(p.slug);
    if (entryPath === 'not-sure' && p && startChoice && !startProviderSlug) setStartProviderSlug(p.slug);
    if (entryPath === 'all-options' && p && allOptionsService && !allOptionsProviderSlug) setAllOptionsProviderSlug(p.slug);
  }, [
    entryPath, providers, prefill.provider,
    concernService, startChoice, allOptionsService,
    providerChoiceSlug, concernProviderSlug, startProviderSlug, allOptionsProviderSlug,
  ]);

  useEffect(() => {
    if (!entryPath || !allCategoryChoices.length) return;
    const svc = findServiceByToken(allCategoryChoices, prefill.service || prefill.serviceCategory);
    if (!svc) return;
    if (entryPath === 'all-options' && !allOptionsService) setAllOptionsService(svc);
    if (entryPath === 'concern' && !concernService && !concernBundleId) {
      setConcernShowAllCategories(true);
      setConcernService(svc);
    }
  }, [
    entryPath, allCategoryChoices, prefill.service, prefill.serviceCategory,
    allOptionsService, concernService, concernBundleId,
  ]);

  useEffect(() => {
    if (entryPath !== 'not-sure' || startChoice || !startChoices.length) return;
    setStartChoice(startChoices[0]);
  }, [entryPath, startChoice, startChoices]);

  // ─── Breadcrumb items ───
  const breadcrumbItems = useMemo(() => {
    const items = [];
    if (selectedLocation && showLocationStep && entryPath !== 'provider') {
      items.push({
        key: 'location',
        label: 'Location',
        value: selectedLocation === 'any' ? 'All Locations' : (LOCATION_LABELS[selectedLocation] || selectedLocation),
      });
    }
    if (entryPath === 'concern') {
      if (concernBundle) items.push({ key: 'bundle', label: 'Bundle', value: concernBundle.title });
      if (concernShowAllCategories && !concernBundle) items.push({ key: 'allCategories', label: 'Browse', value: 'All Categories' });
      if (concernService) items.push({ key: 'service', label: 'Service', value: concernService.label });
    }
    if (entryPath === 'provider' && providerChoiceSlug) {
      const p = providers.find((pr) => pr.slug === providerChoiceSlug);
      items.push({ key: 'provider', label: 'Provider', value: p?.name || providerChoiceSlug });
    }
    if (entryPath === 'all-options') {
      if (allOptionsService) items.push({ key: 'service', label: 'Service', value: allOptionsService.title });
      if (allOptionsProviderSlug) {
        const p = providers.find((pr) => pr.slug === allOptionsProviderSlug);
        items.push({ key: 'provider', label: 'Provider', value: p?.name || allOptionsProviderSlug });
      }
    }
    if (entryPath === 'not-sure') {
      if (startChoice) items.push({ key: 'service', label: 'Service', value: startChoice.label });
      if (startProviderSlug) {
        const p = providers.find((pr) => pr.slug === startProviderSlug);
        items.push({ key: 'provider', label: 'Provider', value: p?.name || startProviderSlug });
      }
    }
    return items;
  }, [
    selectedLocation, showLocationStep, entryPath, providers,
    concernBundle, concernShowAllCategories, concernService,
    providerChoiceSlug, allOptionsService, allOptionsProviderSlug,
    startChoice, startProviderSlug,
  ]);

  // ─── Breadcrumb clear handler ───
  const handleBreadcrumbClear = useCallback((key) => {
    const order = ['location', 'bundle', 'allCategories', 'service', 'provider'];
    const idx = order.indexOf(key);

    if (idx <= order.indexOf('location')) setSelectedLocation(null);

    if (entryPath === 'concern') {
      if (idx <= order.indexOf('bundle')) { setConcernBundleId(null); setConcernShowAllCategories(false); }
      if (idx <= order.indexOf('service')) setConcernService(null);
      if (idx <= order.indexOf('provider')) setConcernProviderSlug(null);
    }
    if (entryPath === 'provider') {
      if (idx <= order.indexOf('provider')) setProviderChoiceSlug(null);
    }
    if (entryPath === 'all-options') {
      if (idx <= order.indexOf('service')) setAllOptionsService(null);
      if (idx <= order.indexOf('provider')) setAllOptionsProviderSlug(null);
    }
    if (entryPath === 'not-sure') {
      if (idx <= order.indexOf('service')) setStartChoice(null);
      if (idx <= order.indexOf('provider')) setStartProviderSlug(null);
    }
  }, [entryPath]);

  // ─── Back button handler ───
  const handleBack = useCallback(() => {
    if (entryPath === 'concern') {
      if (concernProviderSlug) { setConcernProviderSlug(null); return; }
      if (concernService) { setConcernService(null); return; }
      if (concernShowAllCategories) { setConcernShowAllCategories(false); return; }
      if (concernBundleId) { setConcernBundleId(null); setConcernShowAllCategories(false); return; }
      if (selectedLocation && showLocationStep) { setSelectedLocation(null); return; }
      if (showPathSelector && !fixedPath) { setEntryPath(null); return; }
      return;
    }
    if (entryPath === 'provider') {
      if (providerChoiceSlug) { setProviderChoiceSlug(null); return; }
      if (showPathSelector && !fixedPath) { setEntryPath(null); return; }
      return;
    }
    if (entryPath === 'all-options') {
      if (allOptionsProviderSlug) { setAllOptionsProviderSlug(null); return; }
      if (allOptionsService) { setAllOptionsService(null); return; }
      if (selectedLocation && showLocationStep) { setSelectedLocation(null); return; }
      if (showPathSelector && !fixedPath) { setEntryPath(null); return; }
      return;
    }
    if (entryPath === 'not-sure') {
      if (startProviderSlug) { setStartProviderSlug(null); return; }
      if (startChoice) { setStartChoice(null); return; }
      if (selectedLocation && showLocationStep) { setSelectedLocation(null); return; }
      if (showPathSelector && !fixedPath) { setEntryPath(null); return; }
      return;
    }
  }, [
    entryPath, fixedPath, showPathSelector, showLocationStep, selectedLocation,
    concernBundleId, concernShowAllCategories, concernService, concernProviderSlug,
    providerChoiceSlug, allOptionsService, allOptionsProviderSlug, startChoice, startProviderSlug,
  ]);

  const canGoBack = useMemo(() => {
    if (!entryPath || activeProvider) return false;
    if (selectedLocation && showLocationStep) return true;
    if (showPathSelector && !fixedPath) return true;
    if (entryPath === 'concern' && (concernBundleId || concernShowAllCategories || concernService)) return true;
    if (entryPath === 'provider' && providerChoiceSlug) return true;
    if (entryPath === 'all-options' && (allOptionsService || allOptionsProviderSlug)) return true;
    if (entryPath === 'not-sure' && (startChoice || startProviderSlug)) return true;
    return false;
  }, [
    entryPath, activeProvider, fixedPath, showPathSelector, showLocationStep, selectedLocation,
    concernBundleId, concernShowAllCategories, concernService,
    providerChoiceSlug, allOptionsService, allOptionsProviderSlug, startChoice, startProviderSlug,
  ]);

  const showWhiteDropIn = Boolean(entryPath);

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-4">
          {title ? (
            <h2
              style={{
                fontFamily: fonts?.display,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                color: colors.white,
                marginBottom: '0.5rem',
              }}
            >
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p style={{ fontFamily: fonts?.body, fontSize: '0.98rem', color: 'rgba(250,248,245,0.65)' }}>{subtitle}</p>
          ) : null}
        </div>
      )}

      {showPathSelector ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
          {START_PATH_CHOICES.map((choice) => (
            <BookingChoiceCard
              key={choice.id}
              title={choice.label}
              subtitle={choice.sub}
              theme="dark"
              selected={entryPath === choice.id}
              fonts={fonts}
              onClick={() => {
                setEntryPath(choice.id);
                setSelectedLocation(null);
                setConcernBundleId(null);
                setConcernShowAllCategories(false);
                setConcernService(null);
                setConcernProviderSlug(null);
                setProviderChoiceSlug(null);
                setStartChoice(null);
                setStartProviderSlug(null);
                setAllOptionsService(null);
                setAllOptionsProviderSlug(null);
                requestAnimationFrame(() => {
                  flowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
            />
          ))}
        </div>
      ) : null}

      {showWhiteDropIn ? (
        <div ref={flowRef} className="rounded-2xl p-4 lg:p-5" style={{ backgroundColor: '#fff', border: `1px solid ${colors.stone}` }}>
          {/* ─── Back button + breadcrumbs ─── */}
          {!activeProvider && (canGoBack || breadcrumbItems.length > 0) && (
            <div className="mb-3">
              {canGoBack && (
                <button
                  onClick={handleBack}
                  style={{
                    fontFamily: fonts?.body,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: colors.violet,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0 0 0.5rem',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </button>
              )}
              <SelectionBreadcrumbs items={breadcrumbItems} fonts={fonts} onClear={handleBreadcrumbClear} />
            </div>
          )}

          {/* ─── Location step (first in every path except provider — picker handles location there) ─── */}
          {!activeProvider && showLocationStep && !selectedLocation && entryPath !== 'provider' && (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Which location works for you?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableLocations.map((loc) => (
                  <BookingChoiceCard
                    key={`location-${loc.key}`}
                    onClick={() => setSelectedLocation(loc.key)}
                    title={loc.label}
                    fonts={fonts}
                  />
                ))}
                <BookingChoiceCard
                  key="location-any"
                  onClick={() => setSelectedLocation('any')}
                  title="No Preference"
                  subtitle="Show providers at all locations"
                  fonts={fonts}
                />
              </div>
            </>
          )}

          {/* ─── CONCERN PATH ─── */}
          {!activeProvider && locationResolved && entryPath === 'concern' && !concernBundle && !concernService && !concernShowAllCategories && (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Start with a treatment bundle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {normalizedBundles.slice(0, 8).map((bundle) => (
                  <BookingChoiceCard
                    key={`concern-bundle-${bundle.id}`}
                    onClick={() => {
                      setConcernBundleId(bundle.id);
                      setConcernShowAllCategories(false);
                      setConcernService(null);
                      setConcernProviderSlug(null);
                    }}
                    title={bundle.title}
                    subtitle={bundle.description || ''}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          )}

          {!activeProvider && locationResolved && entryPath === 'concern' && concernBundle && !concernService && !concernShowAllCategories ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose a service in {concernBundle.title}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(concernBundle.items || [])
                  .filter((item) => filteredProvidersForItem({ ...item, bundleRole: concernBundle?.roles?.[0] || null }).length > 0)
                  .map((item, idx) => (
                  <BookingChoiceCard
                    key={`concern-item-${item.slug || idx}`}
                    onClick={() => {
                      setConcernService({ slug: resolveSlug(item), label: item.label || 'Service', bundleRole: concernBundle?.roles?.[0] || null });
                      setConcernShowAllCategories(false);
                      setConcernProviderSlug(null);
                    }}
                    title={item.label || 'Service'}
                    priceLabel={formatPriceRange(item.price, item.label)}
                    fonts={fonts}
                  />
                ))}
                <BookingChoiceCard
                  key="concern-something-else"
                  onClick={() => {
                    setConcernService(null);
                    setConcernShowAllCategories(true);
                    setConcernProviderSlug(null);
                  }}
                  title="Something else"
                  subtitle="Show all service categories"
                  fonts={fonts}
                />
              </div>
            </>
          ) : null}

          {!activeProvider && locationResolved && entryPath === 'concern' && concernShowAllCategories && !concernService ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose a category.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCategoryChoices.map((svc) => (
                  <BookingChoiceCard
                    key={`concern-category-${svc.slug}`}
                    onClick={() => {
                      setConcernService({ slug: svc.slug, label: svc.title });
                      setConcernShowAllCategories(false);
                      setConcernProviderSlug(null);
                    }}
                    title={svc.title}
                    priceLabel={formatPriceRange(null, svc.title)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {!activeProvider && locationResolved && entryPath === 'concern' && concernService && !concernProviderSlug ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose your provider to continue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concernProviders.length > 1 && (
                  <BookingChoiceCard
                    key="concern-first-available"
                    onClick={() => setConcernProviderSlug(FIRST_AVAILABLE_SLUG)}
                    title="First Available"
                    subtitle="We'll find the best match for you"
                    fonts={fonts}
                  />
                )}
                {concernProviders.map((p) => (
                  <BookingChoiceCard
                    key={`concern-provider-${p.slug}`}
                    onClick={() => setConcernProviderSlug(p.slug)}
                    title={p.name || p.title}
                    subtitle={providerSubtitle(p)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* ─── PROVIDER PATH ─── */}
          {!activeProvider && entryPath === 'provider' && !providerChoiceSlug ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose your provider to continue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locationFilteredProviders.map((p) => (
                  <BookingChoiceCard
                    key={`provider-choice-${p.slug}`}
                    onClick={() => setProviderChoiceSlug(p.slug)}
                    title={p.name || p.title}
                    subtitle={providerSubtitle(p)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* ─── ALL-OPTIONS PATH ─── */}
          {!activeProvider && locationResolved && entryPath === 'all-options' && !allOptionsService ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose a category to begin.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCategoryChoices.map((svc) => (
                  <BookingChoiceCard
                    key={`all-options-category-${svc.slug}`}
                    onClick={() => {
                      setAllOptionsService(svc);
                      setAllOptionsProviderSlug(null);
                    }}
                    title={svc.title}
                    priceLabel={formatPriceRange(null, svc.title)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {!activeProvider && locationResolved && entryPath === 'all-options' && allOptionsService && !allOptionsProviderSlug ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose your provider for {allOptionsService.title}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProvidersForService(allOptionsService.slug).length > 1 && (
                  <BookingChoiceCard
                    key="all-options-first-available"
                    onClick={() => setAllOptionsProviderSlug(FIRST_AVAILABLE_SLUG)}
                    title="First Available"
                    subtitle="We'll find the best match for you"
                    fonts={fonts}
                  />
                )}
                {filteredProvidersForService(allOptionsService.slug).map((p) => (
                  <BookingChoiceCard
                    key={`all-options-provider-${p.slug}`}
                    onClick={() => setAllOptionsProviderSlug(p.slug)}
                    title={p.name || p.title}
                    subtitle={providerSubtitle(p)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* ─── NOT-SURE PATH ─── */}
          {!activeProvider && locationResolved && entryPath === 'not-sure' && !startChoice ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Start with the Get Started bundle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {startChoices
                  .filter((choice) => filteredProvidersForItem(choice).length > 0)
                  .map((choice) => (
                  <BookingChoiceCard
                    key={`start-choice-${choice.id}`}
                    onClick={() => {
                      setStartChoice(choice);
                      setStartProviderSlug(null);
                    }}
                    title={choice.label}
                    priceLabel={isConsultationLike(choice.label) ? 'FREE' : 'Varies'}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {!activeProvider && locationResolved && entryPath === 'not-sure' && startChoice && !startProviderSlug ? (
            <>
              <p style={{ fontFamily: fonts?.body, fontSize: '0.85rem', color: colors.muted, marginBottom: '0.7rem' }}>
                Choose your provider to continue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProvidersForItem(startChoice).length > 1 && (
                  <BookingChoiceCard
                    key="start-first-available"
                    onClick={() => setStartProviderSlug(FIRST_AVAILABLE_SLUG)}
                    title="First Available"
                    subtitle="We'll find the best match for you"
                    fonts={fonts}
                  />
                )}
                {filteredProvidersForItem(startChoice).map((p) => (
                  <BookingChoiceCard
                    key={`start-provider-${p.slug}`}
                    onClick={() => setStartProviderSlug(p.slug)}
                    title={p.name || p.title}
                    subtitle={providerSubtitle(p)}
                    fonts={fonts}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* ─── "First Available" banner with re-roll ─── */}
          {isFirstAvailable && activeProvider ? (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3"
              style={{
                backgroundColor: `${colors.violet}08`,
                border: `1px solid ${colors.violet}20`,
              }}
            >
              <span style={{ fontFamily: fonts?.body, fontSize: '0.8125rem', color: colors.muted }}>
                You&apos;ll be seeing <strong style={{ color: colors.heading }}>{activeProvider.name?.split(/\s/)[0]}</strong>
              </span>
              {firstAvailableEligible.length > 1 && (
                <button
                  onClick={handleReRoll}
                  style={{
                    fontFamily: fonts?.body,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: colors.violet,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ↻ Try another
                </button>
              )}
            </div>
          ) : null}

          {/* ─── Handoff to ProviderAvailabilityPicker ─── */}
          {activeProvider ? (
            <ProviderAvailabilityPickerHandoff
              activeProvider={activeProvider}
              activeProviderServices={activeProviderServices}
              activeProviderBundles={activeProviderBundles}
              selectedLocation={selectedLocation}
              prefill={prefill}
              activeInitialService={activeInitialService}
              activeInitialCategory={activeInitialCategory}
              fontKey={fontKey}
              fonts={fonts}
              locationLocked={!!selectedLocation && selectedLocation !== 'any'}
              onExitPicker={() => {
                if (entryPath === 'concern') setConcernProviderSlug(null);
                else if (entryPath === 'all-options') setAllOptionsProviderSlug(null);
                else if (entryPath === 'not-sure') setStartProviderSlug(null);
                else if (entryPath === 'provider') setProviderChoiceSlug(null);
                if (isFirstAvailable) setResolvedFirstAvailable(null);
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
