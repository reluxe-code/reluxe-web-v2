# RELUXE v2 — Full-Stack Audit Report

**Date:** 2026-02-18
**Auditor:** Senior Full-Stack Audit (Claude)
**Scope:** Entire `/Users/kyle/RELUXE/web/v2` codebase

---

## Executive Summary

RELUXE v2 is a mature Next.js 13.5 medical spa website using Pages Router with React 18.2, TypeScript (loosely configured), Tailwind CSS, Apollo/GraphQL for WordPress CMS, and Boulevard SDK for bookings. The codebase is functional and well-organized by feature, but has accumulated significant technical debt across security, consistency, and maintainability dimensions.

**Overall Health Score: 6.2 / 10**

| Category | Score | Status |
|----------|-------|--------|
| Security | 4/10 | Needs immediate attention |
| Code Quality | 6/10 | Functional but inconsistent |
| Performance | 7/10 | Good patterns, some gaps |
| Accessibility | 6/10 | Partial implementation |
| Type Safety | 2/10 | Effectively disabled |
| Architecture | 6/10 | Hybrid routing adds complexity |
| SEO | 8/10 | Strong implementation |
| Consistency | 5/10 | Multiple conflicting patterns |

---

## CRITICAL Issues (Fix Immediately)

### 1. Production Secrets Exposed in `.env.local`

**Risk:** If `.env.local` is committed to git, all production credentials are compromised.

**Affected secrets:**
- `BLVD_API_KEY` — booking system access
- `RECAPTCHA_SECRET_KEY` — form protection bypass
- `AIRTABLE_TOKEN` — full CRM data access
- `SMTP_PASS` — email spoofing capability
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — billing abuse

**Action:**
1. Verify `.env.local` is in `.gitignore` (currently it may NOT be)
2. Check git history for committed secrets: `git log --all --full-history -- .env.local`
3. If found: rotate ALL tokens immediately
4. Add `.env.local` and `.env*.local` to `.gitignore`
5. Use `vercel env` for production secrets

### 2. Three Conflicting ESLint Configs

**Files:**
- `.eslintrc` (Airbnb-based, old format)
- `.eslintrc.json` (next/core-web-vitals, another format)
- `eslint.config.mjs` (flat config, modern format)

**Impact:** Unpredictable linting behavior. Rules may conflict or be silently ignored.

**Action:** Pick ONE config format. Recommended: keep `eslint.config.mjs` (flat config), delete the other two.

---

## HIGH Priority Issues

### 3. HTML Injection in Quiz Email Templates

**Vulnerable files:**
- `src/pages/api/spf-quiz.js` — No HTML escaping in email body
- `src/pages/api/skinbetter-quiz.js` — No HTML escaping in email body

**Safe file (has escaping):**
- `src/pages/api/contact.js` — Uses `escapeHtml()` properly
- `src/pages/api/quiz-service-results.js` — Uses `escHtml()` properly

**Action:** Extract the `escapeHtml()` helper to a shared utility (`src/utils/escapeHtml.js`) and apply it in all email-rendering API routes.

### 4. Duplicated Email Logic Across 4 API Routes

**Files with near-identical email setup:**
- `src/pages/api/contact.js`
- `src/pages/api/spf-quiz.js`
- `src/pages/api/skinbetter-quiz.js`
- `src/pages/api/quiz-service-results.js`

Each duplicates: Nodemailer transporter creation, SMTP env var extraction, HTML email formatting, error handling.

**Action:** Create `src/lib/email.js` with:
```js
export function createTransporter() { /* shared SMTP setup */ }
export function sendEmail({ to, subject, html, text }) { /* shared send */ }
```

### 5. Duplicate Analytics Libraries

**Two GA event systems coexist:**
- `src/lib/analytics.js` — `gaEvent({ action, category, label, value })`
- `src/lib/ga.js` — `gaEvent(name, params = {})`

Different signatures, used inconsistently across components.

**Action:** Consolidate into a single `src/lib/analytics.js` with one API. Grep all usages and migrate.

### 6. TypeScript Effectively Disabled

**`tsconfig.json`:**
```json
{ "strict": false }
```

Combined with 99% `.js` files and `prop-types` for runtime checks, there is zero compile-time type safety.

**Action (phased):**
1. **Phase 1:** Enable `"strict": true` in tsconfig, fix errors in existing `.ts`/`.tsx` files
2. **Phase 2:** Convert shared utilities (`lib/`, `utils/`, `hooks/`) to `.ts`
3. **Phase 3:** Convert components as they're touched
4. **Phase 4:** Convert pages incrementally

### 7. Hardcoded WordPress URL

**Files:**
- `src/lib/apollo.js` — `uri: 'https://wordpress-74434-5742908.cloudwaysapps.com/cms/graphql'`
- `src/lib/deals.js` — `const WP_BASE = 'https://wordpress-74434-5742908.cloudwaysapps.com/cms'`

**Action:** Move to `WP_API_ENDPOINT` env var (already defined in `.env.local` but not used in these files).

---

## MEDIUM Priority Issues

### 8. Mixed Routing Architecture

**Current state:**
- 95% Pages Router (`src/pages/`)
- 1 App Router page (`app/bachelor/page.tsx`)

**Impact:** Two different data-fetching paradigms, metadata approaches, and component models in one project. Increases cognitive overhead and build complexity.

**Action:** Decide on a migration path:
- **Option A:** Stay on Pages Router, move bachelor page back
- **Option B:** Plan incremental migration to App Router (recommended for new pages only)

### 9. Oversized Files

| File | Lines | Issue |
|------|-------|-------|
| `src/pages/_app.js` | 617 | GA, Meta Pixel, BLVD init, location modal all inline |
| `src/pages/services/[slug].js` | 1000+ | Entire service detail page in one file |
| `src/components/pricing/FindMyAreaSelector.js` | 515 | Complex booking logic + UI combined |

**Action:** Extract into focused modules:
- `_app.js` → separate `AnalyticsProvider`, `BookingProvider`, `LocationProvider`
- `[slug].js` → extract section components
- `FindMyAreaSelector.js` → separate calculator logic from UI

### 10. Inconsistent Error Handling in API Routes

**Patterns found:**
- `contact.js` — Zod validation + structured JSON errors (good)
- `blvd/providers/profile.js` — Returns `200` with `null` on failure
- `blvd/providers/services.js` — Returns `200` with `[]` on failure
- `log-404.js` — No input validation at all

**Action:** Standardize on consistent error response format:
```js
// Success
{ ok: true, data: { ... } }
// Error
{ ok: false, error: 'message', details: { ... } }
```

### 11. Four Icon Libraries

**Currently using:**
1. `@fortawesome/react-fontawesome` + 3 FA packages
2. `@heroicons/react`
3. `react-icons`
4. `lucide-react` (in bachelor page)

**Impact:** Bundle size bloat, visual inconsistency.

**Action:** Standardize on 1-2 libraries. Recommended: Heroicons (Tailwind ecosystem) + Lucide (modern, tree-shakeable). Phase out FontAwesome and react-icons.

### 12. Raw `<img>` Tags Instead of `next/image`

**Files with raw `<img>`:**
- `src/components/gallery/ResultsCarouselSingle.js`
- `src/components/team/StaffCard.js`
- Various other components

**Impact:** No automatic optimization, format conversion, or lazy loading via Next.js.

**Action:** Replace with `<Image>` from `next/image` where possible. Note: `unoptimized: true` in config means Next.js won't optimize — consider enabling optimization if using Vercel.

### 13. Accessibility Gaps

**Missing:**
- Form labels not properly associated in some cases (placeholder-only)
- `<div role="link">` instead of `<a>` in `LocationsBlock.js`
- Generic fallback alt text: `'Before & After'`
- No skip-to-content link
- Color contrast concerns with `text-white/70` on dark backgrounds

**Action:** Add `eslint-plugin-jsx-a11y` to ESLint config and fix violations.

### 14. Missing `React.memo` on List Item Components

**Components rendered in lists without memoization:**
- `DealCard.js`
- `StaffCard.js`
- `ContactForm.js`

**Action:** Wrap reusable card components in `React.memo()` and use `useCallback` for event handlers passed as props.

### 15. No Input Validation on `log-404` Endpoint

**File:** `src/pages/api/log-404.js`
```js
const { path, referrer, ua, ts } = req.body || {}
```
Accepts arbitrary data with no validation.

**Action:** Add Zod schema validation matching the contact.js pattern.

---

## LOW Priority Issues

### 16. Naming Convention Inconsistency
- Components: mix of `kebab-case` (`header-2.js`) and `PascalCase` (`StaffCard.js`)
- **Action:** Standardize on `PascalCase` for components

### 17. Tailwind Config Cleanup
- Explicit `mode: 'jit'` unnecessary in Tailwind 3+
- Raw hex colors (`#f7c46c`, `#969696`) used instead of design tokens
- **Action:** Remove `mode: 'jit'`, add all custom colors to `tailwind.config.js`

### 18. Missing Shared Utilities
- No HTTP client abstraction (fetch repeated everywhere)
- No date/number formatting helpers
- No string truncation utils
- **Action:** Create as needed when refactoring

### 19. `next-transpile-modules` Dependency
- Unnecessary in Next.js 13.1+ (built-in `transpilePackages` in `next.config.js`)
- **Action:** Remove package, use native config option

### 20. Outdated Core Dependencies

| Package | Current | Latest Stable |
|---------|---------|---------------|
| Next.js | 13.5.11 | 15.x |
| React | 18.2.0 | 19.x |
| Tailwind | 3.2.4 | 4.x |
| ESLint | 8.57.0 | 9.x |

**Action:** Not urgent but plan for incremental upgrades. Next.js 14→15 migration is the most impactful.

---

## Architecture Recommendations

### Short-Term (Next Sprint)
1. Fix security issues (#1, #3, #15)
2. Consolidate ESLint configs (#2)
3. Extract shared email utility (#4)
4. Consolidate analytics (#5)
5. Move hardcoded URLs to env vars (#7)

### Medium-Term (Next Month)
6. Break up oversized files (#9)
7. Standardize error handling (#10)
8. Consolidate icon libraries (#11)
9. Add accessibility linting (#13)
10. Enable TypeScript strict mode (#6 Phase 1-2)

### Long-Term (Next Quarter)
11. Incremental TypeScript migration (#6 Phase 3-4)
12. Consider App Router migration for new pages (#8)
13. Upgrade Next.js to 15.x (#20)
14. Enable Next.js image optimization (#12)
15. Component library standardization

---

## Files Analyzed

**Configuration:** 12 files
**Pages:** 117 files across 28 directories
**Components:** 85+ files across 23 directories
**Libraries/Utils:** 14 files
**API Routes:** 8 endpoints
**Hooks/Context:** 2 files
**Server:** 1 file

**Total files reviewed:** ~240+
