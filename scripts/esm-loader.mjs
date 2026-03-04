// scripts/esm-loader.mjs
// Custom ESM loader that resolves:
// 1. Relative imports without .js extension (e.g., './servicesDefault' → './servicesDefault.js')
// 2. @/ path alias to src/ (e.g., '@/data/locations' → '<root>/src/data/locations.js')
//
// Usage: node --import ./scripts/register-loader.mjs scripts/seed-service-cms.mjs

import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve as pathResolve, dirname } from 'node:path';

const ROOT = pathResolve(dirname(fileURLToPath(import.meta.url)), '..');

export function resolve(specifier, context, nextResolve) {
  // Handle @/ alias → src/
  if (specifier.startsWith('@/')) {
    const bare = specifier.slice(2);
    // Try with .js extension first, then as-is
    for (const ext of ['.js', '.mjs', '/index.js', '']) {
      const full = pathResolve(ROOT, 'src', bare + ext);
      if (existsSync(full)) {
        return { url: 'file://' + full, shortCircuit: true };
      }
    }
    // Fall through if not found
    const fallback = pathResolve(ROOT, 'src', bare + '.js');
    return { url: 'file://' + fallback, shortCircuit: true };
  }

  // Handle relative imports missing .js extension
  if (specifier.startsWith('.') && !specifier.match(/\.\w+$/)) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : '';
    const parentDir = dirname(parentPath);
    // Try .js extension
    const withJs = pathResolve(parentDir, specifier + '.js');
    if (existsSync(withJs)) {
      return { url: 'file://' + withJs, shortCircuit: true };
    }
    // Try /index.js
    const withIndex = pathResolve(parentDir, specifier, 'index.js');
    if (existsSync(withIndex)) {
      return { url: 'file://' + withIndex, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
