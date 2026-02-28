// src/lib/emailUtils.js
// Email validation and normalization for member auth.

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}
