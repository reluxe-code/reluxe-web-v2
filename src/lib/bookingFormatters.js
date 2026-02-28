// src/lib/bookingFormatters.js
// Shared formatting utilities for all booking flows.
// Single source of truth — used by BookingFlowModal, ProviderAvailabilityPicker,
// RebookModal, and StartBookingFlow.

/**
 * Format a time string for display. Handles ISO timestamps and bare HH:MM:SS.
 */
export function formatTime(startTime) {
  if (!startTime) return ''
  const d = new Date(String(startTime).includes('T') ? startTime : `2026-01-01T${startTime}`)
  if (isNaN(d.getTime())) return String(startTime)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Format a date string as short display: "Thu, Mar 5"
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
  catch { return dateStr }
}

/**
 * Format a date string as long display: "Thursday, March 5"
 */
export function formatDateLong(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }
  catch { return dateStr }
}

/**
 * Format a date string as compact display: "Mar 5"
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return dateStr }
}

/**
 * Format a duration in minutes: "45 min", "1h 30m", "2h"
 */
export function formatDuration(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Relative time label: "today", "yesterday", "3d ago"
 */
export function daysAgo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${diff}d ago`
}

/**
 * Normalize a Boulevard money value from various formats to a plain number.
 * Handles: number, string ("$45.00"), object ({ amount, cents, centAmount }).
 */
export function normalizeMoneyValue(v) {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return v >= 1000 ? v / 100 : v
  if (typeof v === 'string') {
    const source = String(v)
    const n = Number(source.replace(/[^\d.-]/g, ''))
    if (!Number.isFinite(n)) return null
    if (source.includes('.')) return n
    return n >= 1000 ? n / 100 : n
  }
  if (typeof v === 'object') {
    const raw = v.amount ?? v.value ?? v.cents ?? v.centAmount ?? null
    if (raw == null) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    if (v.cents != null || v.centAmount != null) return n / 100
    return n >= 1000 ? n / 100 : n
  }
  return null
}

/**
 * Format a number as currency: "$45", "$1,200"
 */
export function formatCurrency(n) {
  if (n == null || !Number.isFinite(n)) return null
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format an option's price delta for display: "+$25", "-$10", or "Varies".
 */
export function formatOptionPriceDelta(priceDelta) {
  if (priceDelta == null || priceDelta === '') return null
  const amount = normalizeMoneyValue(priceDelta)
  if (amount == null) return null
  if (Math.abs(amount) < 0.005) return 'Varies'
  return `${amount > 0 ? '+' : '-'}${formatCurrency(Math.abs(amount))}`
}

/**
 * Check if a service is consultation-like (free or "get started" type).
 */
export function isConsultationLike(name, categoryName) {
  const text = `${name || ''} ${categoryName || ''}`.toLowerCase()
  return /consult/.test(text) || /not sure where to start|get started|reveal/.test(text)
}

/**
 * Format a Boulevard price range for display.
 * Handles various price object shapes from Boulevard API.
 */
export function formatPriceRange(price, name, categoryName) {
  if (!price) return isConsultationLike(name, categoryName) ? 'FREE' : null
  const min = normalizeMoneyValue(price.min ?? price.minPrice ?? price.minimum ?? price)
  const max = normalizeMoneyValue(price.max ?? price.maxPrice ?? price.maximum ?? price)
  const consultation = isConsultationLike(name, categoryName)
  if (min == null && max == null) return consultation ? 'FREE' : null
  if ((min ?? 0) === 0 && (max ?? 0) === 0) return consultation ? 'FREE' : 'Varies'
  if (min != null && max != null) {
    if (Math.abs(min - max) < 0.01) return formatCurrency(min)
    return `${formatCurrency(min)}–${formatCurrency(max)}`
  }
  if (min === 0) return consultation ? 'FREE' : 'Varies'
  if (min != null) return `${formatCurrency(min)}+`
  if (max === 0) return consultation ? 'FREE' : 'Varies'
  return `Up to ${formatCurrency(max)}`
}

/**
 * Toggle an option selection respecting group constraints (radio vs multi-select).
 */
export function toggleOption(prev, group, option) {
  const isRadio = group.maxLimit === 1
  const isSelected = prev.some(o => o.id === option.id)
  if (isRadio) {
    const withoutGroup = prev.filter(o => !group.options.some(go => go.id === o.id))
    return isSelected ? withoutGroup : [...withoutGroup, option]
  }
  if (isSelected) return prev.filter(o => o.id !== option.id)
  if (group.maxLimit) {
    const count = prev.filter(o => group.options.some(go => go.id === o.id)).length
    if (count >= group.maxLimit) return prev
  }
  return [...prev, option]
}

/**
 * Find a menu item's ID by name (case-insensitive).
 */
export function findMenuItemId(menuData, name) {
  if (!menuData?.categories || !name) return null
  const lower = name.toLowerCase()
  for (const cat of menuData.categories) {
    for (const item of cat.items || []) {
      if ((item.name || '').toLowerCase() === lower) return item.id
    }
  }
  return null
}

/**
 * Find a full menu item by name (case-insensitive).
 */
export function findMenuItem(menuData, name) {
  if (!menuData?.categories || !name) return null
  const lower = name.toLowerCase()
  for (const cat of menuData.categories) {
    for (const item of cat.items || []) {
      if ((item.name || '').toLowerCase() === lower) return item
    }
  }
  return null
}

/**
 * Find a service item ID at a specific location by name matching across menus.
 */
export function findServiceIdAtLocation(service, targetMenuData) {
  if (!service?.name || !targetMenuData?.categories) return null
  const nameLower = service.name.toLowerCase()
  for (const cat of targetMenuData.categories) {
    const match = (cat.items || []).find(i => i.name?.toLowerCase() === nameLower)
    if (match) return match.id
  }
  return null
}
