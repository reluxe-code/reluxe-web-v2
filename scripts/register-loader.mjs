// scripts/register-loader.mjs
// Registers the custom ESM loader before any imports run.
// Usage: node --import ./scripts/register-loader.mjs scripts/seed-service-cms.mjs

import { register } from 'node:module';

register('./esm-loader.mjs', import.meta.url);
