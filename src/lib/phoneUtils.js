// src/lib/phoneUtils.js
// Phone number formatting + validation for the booking flow.

/**
 * Strip everything except digits from a phone string.
 */
export function stripPhone(value) {
  return (value || '').replace(/\D/g, '');
}

/**
 * Format a digit string as a US phone: (317) 763-1142
 * Handles partial input for live formatting in an input field.
 */
export function formatPhone(value) {
  const digits = stripPhone(value);
  // Remove leading 1 if 11 digits
  const d = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits;

  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

/**
 * Convert to E.164 format for the Boulevard API: +13177631142
 */
export function toE164(value) {
  const digits = stripPhone(value);
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

/**
 * Validate that a phone number has exactly 10 US digits (or 11 with leading 1).
 */
export function isValidPhone(value) {
  const digits = stripPhone(value);
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}
