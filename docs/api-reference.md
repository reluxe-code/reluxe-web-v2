# RELUXE Internal API Reference

> Auto-maintained reference for all `/api/*` endpoints. Use this as context for the mobile app, integrations, and future projects.
>
> **Base URL (production):** `https://reluxemedspa.com`
> **Base URL (beta):** `https://beta.reluxemedspa.com`

---

## Table of Contents

- [Member Routes](#member-routes) — Auth, profile, rebooking
- [Boulevard Booking Routes](#boulevard-booking-routes) — Services, availability, cart, checkout
- [Public Routes](#public-routes) — Contact, Instagram, quizzes
- [Admin Routes](#admin-routes) — Intelligence, sync, staff management

---

## Member Routes

### `POST /api/member/send-otp`

Sends SMS OTP for phone-based member login via Supabase Auth.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | US phone number (e.g. `+12125551234`) |

**Response:**
```json
{ "success": true }
```

**Error codes:** `429` if rate limited (too many OTP requests).

---

### `POST /api/member/verify-otp`

Verifies OTP, links member to Boulevard client record, upserts member row.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | Same phone used in `send-otp` |
| `code` | string | Yes | 6-digit OTP code |

**Response:**
```json
{
  "session": { "access_token": "...", "refresh_token": "..." },
  "member": { "id": "...", "phone": "...", "first_name": "..." },
  "isReturning": true,
  "blvdClient": { "id": "...", "firstName": "...", "lastName": "..." }
}
```

---

### `GET /api/member/profile`

**This is the primary member profile/dashboard endpoint.** Returns full member data: stats, visit history, providers, recommendations.

> **Mobile app note:** Use this path (`/api/member/profile`), NOT `/api/blvd/member/profile`.

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <access_token>` |

**Response:**
```json
{
  "member": { "id", "phone", "first_name", "last_name", "email", "interests", "boulevard_client_id" },
  "stats": { "total_visits", "total_spend", "months_as_member", "avg_spend_per_visit" },
  "lastService": { "name", "date", "provider", "location" },
  "upcomingAppointment": { "date", "services", "provider", "location" },
  "primaryProvider": { "name", "slug", "image", "visit_count" },
  "visits": [{ "date", "services", "provider", "location", "total" }],
  "toxStatus": { "last_date", "days_since", "next_due", "brand", "is_overdue" },
  "providers": [{ "name", "slug", "image", "visit_count", "last_visit" }],
  "serviceCategories": { "tox": count, "filler": count, ... },
  "recommendations": [{ "slug", "name", "reason" }],
  "locationSplit": { "westfield": count, "carmel": count },
  "products": [{ "name", "sku", "last_purchased", "purchase_count" }]
}
```

**Timeout:** 15s

---

### `POST /api/member/interests`

Saves interest tags for an authenticated member.

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <access_token>` |

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `interests` | string[] | Yes | Array of interest slugs: `tox`, `fillers`, `skin`, `body`, `wellness` |

**Response:**
```json
{ "success": true, "interests": ["tox", "fillers"] }
```

---

### `POST /api/member/rebook`

Quick rebook for authenticated members — skips SMS verification, uses stored member info.

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <access_token>` |

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceSlug` | string | Yes | Service slug to rebook |
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `providerStaffId` | string | Yes | Staff row ID for the provider |
| `date` | string | Yes | ISO date (e.g. `2026-02-25`) |
| `startTime` | string | Yes | ISO datetime of the time slot |

**Response:**
```json
{
  "success": true,
  "appointmentId": "...",
  "confirmation": { "service", "provider", "date", "time", "location" }
}
```

**Timeout:** 30s

---

## Boulevard Booking Routes

### Services & Catalog

#### `GET /api/blvd/services/menu`

Returns the full service menu for a location, optionally filtered by provider.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `staffProviderId` | string | No | Filter to services this provider offers |

**Response:**
```json
{
  "categories": [
    {
      "id": "...",
      "name": "Tox",
      "items": [
        { "id": "blvd-item-id", "name": "Botox", "description": "...", "duration": 30, "price": { "min": 0, "max": 0, "currency": "USD" } }
      ]
    }
  ]
}
```

**Cache:** 10 min. **Timeout:** 30s.

---

#### `GET /api/blvd/services/options`

Returns option groups (add-ons, area choices) for a specific service.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `serviceItemId` | string | Yes | Boulevard service item ID |
| `staffProviderId` | string | No | Filter by provider |

**Response:**
```json
{
  "serviceName": "Botox",
  "description": "...",
  "duration": 30,
  "price": { "min": 0, "max": 0 },
  "optionGroups": [
    {
      "id": "...",
      "name": "Treatment Area",
      "minLimit": 1,
      "maxLimit": 3,
      "options": [{ "id": "...", "name": "Forehead", "priceDelta": 0, "durationDelta": 0 }]
    }
  ]
}
```

---

#### `GET /api/blvd/bundles`

Returns treatment bundles from `site_config` table.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `featured` | string | No | `"true"` to return only featured bundles |

**Response:**
```json
[
  {
    "id": "bundle-1",
    "name": "Glow Package",
    "description": "...",
    "sort_order": 1,
    "featured": true,
    "items": [{ "slug": "botox", "label": "Botox" }, { "slug": "hydrafacial", "label": "HydraFacial" }]
  }
]
```

**Cache:** 5 min.

---

### Providers

#### `GET /api/blvd/providers/at-location`

Returns all bookable providers at a location. Lightweight — no Boulevard API calls.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |

**Response:**
```json
[
  {
    "staffId": "uuid",
    "slug": "krista",
    "name": "Krista",
    "title": "Nurse Injector",
    "image": "https://...",
    "role": "injector",
    "boulevardProviderId": "blvd-id",
    "boulevardServiceMap": { "botox": { "westfield": "blvd-item-id" } },
    "specialties": ["tox", "fillers"]
  }
]
```

**Cache:** 5 min. Filters: published status, has `boulevard_provider_id`, has services mapped at the location.

---

#### `GET /api/blvd/providers/for-service`

Returns providers who can perform a specific service, sorted by next available date.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceSlug` | string | Yes | Service slug |
| `locationKey` | string | Yes | `westfield` or `carmel` |

**Response:**
```json
[
  {
    "slug": "krista",
    "name": "Krista",
    "title": "Nurse Injector",
    "image": "https://...",
    "boulevardProviderId": "blvd-id",
    "serviceItemId": "blvd-item-id",
    "nextAvailableDate": "2026-02-25"
  }
]
```

**Cache:** 5 min. Hits Boulevard for availability checks.

---

#### `GET /api/blvd/providers/[providerId]/profile`

Fetches provider profile directly from Boulevard SDK.

**Response:**
```json
{ "id": "blvd-id", "name": "Krista", "title": "Nurse Injector", "photoUrl": "https://..." }
```

---

#### `GET /api/blvd/providers/[providerId]/services`

Lists services a provider offers at a location.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | string | Yes | Boulevard location ID |

**Response:**
```json
[{ "id": "...", "name": "Botox", "durationMinutes": 30, "price": 0 }]
```

---

#### `GET /api/blvd/providers/[providerId]/availability`

Gets bookable time slots for a provider on a specific date range.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | string | Yes | Boulevard location ID |
| `start` | string | Yes | ISO datetime |
| `end` | string | Yes | ISO datetime |
| `serviceId` | string | Yes | Boulevard service ID |

**Response:**
```json
[{ "id": "slot-id", "start": "2026-02-25T10:00:00-05:00" }]
```

---

### Availability

#### `GET /api/blvd/availability/dates`

Returns available booking dates for a service + optional provider + location.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `serviceItemId` | string | Yes | Boulevard service item ID |
| `staffProviderId` | string | No | Boulevard provider ID |
| `startDate` | string | No | ISO date (defaults to today) |
| `endDate` | string | No | ISO date (defaults to +30 days) |
| `additionalItems` | string | No | JSON array of additional service item IDs (multi-service) |

**Response:**
```json
["2026-02-25", "2026-02-26", "2026-02-28"]
```

**Cache:** 2 min.

---

#### `GET /api/blvd/availability/times`

Returns available time slots for a specific date.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `serviceItemId` | string | Yes | Boulevard service item ID |
| `date` | string | Yes | ISO date |
| `staffProviderId` | string | No | Boulevard provider ID |
| `additionalItems` | string | No | JSON array of additional service item IDs |

**Response:**
```json
[{ "id": "slot-id", "startTime": "2026-02-25T10:00:00-05:00" }]
```

**Cache:** 1 min.

---

#### `GET /api/blvd/availability/summary`

Returns scarcity/urgency data — slot counts and available dates for the current week.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `staffProviderId` | string | No | Boulevard provider ID |

**Response:**
```json
{
  "today": { "tox": 3, "filler": 2, "facial": 5, "massage": 1, "total": 11 },
  "thisWeek": { "tox": ["2026-02-25", "2026-02-26"], "_dates": ["..."] },
  "nextWeek": { "tox": ["2026-03-02"], "_dates": ["..."] },
  "updatedAt": "2026-02-25T10:00:00Z"
}
```

**Cache:** 5 min.

---

### Cart & Checkout

#### `POST /api/blvd/cart/create`

Creates a cart, adds service(s), and reserves a time slot in one call.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locationKey` | string | Yes | `westfield` or `carmel` |
| `serviceItemId` | string | Yes | Primary service Boulevard ID |
| `staffProviderId` | string | No | Preferred provider Boulevard ID |
| `date` | string | Yes | ISO date |
| `startTime` | string | Yes | ISO datetime of selected time slot |
| `selectedOptionIds` | string[] | No | Selected option IDs from option groups |
| `additionalItems` | object[] | No | `[{ serviceItemId, staffProviderId?, selectedOptionIds? }]` |

**Response:**
```json
{
  "cartId": "blvd-cart-id",
  "expiresAt": "2026-02-25T10:15:00Z",
  "duration": 30,
  "summary": { "services": ["Botox"], "total": "$0" }
}
```

---

#### `POST /api/blvd/cart/[cartId]/send-code`

Sends SMS verification code to take cart ownership.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | Phone number for SMS |

**Response:**
```json
{ "codeId": "..." }
```

May return `{ "error": "...", "skipVerification": true }` if verification isn't needed.

---

#### `POST /api/blvd/cart/[cartId]/verify-code`

Verifies SMS code and takes cart ownership. Re-reserves time slot.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `codeId` | string | Yes | From `send-code` response |
| `code` | string | Yes | 6-digit verification code |
| `date` | string | Yes | ISO date (for re-reservation) |
| `startTime` | string | Yes | ISO datetime (for re-reservation) |

**Response:**
```json
{
  "verified": true,
  "expiresAt": "2026-02-25T10:15:00Z",
  "client": { "firstName": "...", "lastName": "...", "email": "..." }
}
```

---

#### `POST /api/blvd/cart/[cartId]/checkout`

Sets client info and completes checkout.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes* | *Not needed if `ownershipVerified` |
| `lastName` | string | Yes* | *Not needed if `ownershipVerified` |
| `email` | string | Yes* | *Not needed if `ownershipVerified` |
| `phone` | string | No | Optional phone |
| `ownershipVerified` | boolean | No | If true, uses client from verification step |

**Response:**
```json
{
  "success": true,
  "appointmentId": "...",
  "clientId": "...",
  "confirmation": { "service", "provider", "date", "time", "location" }
}
```

---

## Public Routes

### `POST /api/contact`

Saves contact form submission to Airtable and sends email notification.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string | Yes | Email address |
| `message` | string | Yes | Message (min 10 chars) |
| `phone` | string | No | Phone number |
| `location` | string | No | Preferred location |

**Response:**
```json
{ "success": true }
```

---

### `GET /api/instagram`

Fetches latest 8 posts from @reluxemedspa Instagram.

**Response:**
```json
{
  "posts": [
    { "id": "...", "caption": "...", "media_url": "https://...", "permalink": "https://...", "timestamp": "..." }
  ]
}
```

**Cache:** 1 hour.

---

### `POST /api/spf-quiz`

Sends SPF product quiz results email.

| Field | Type | Required |
|-------|------|----------|
| `eventType` | string | Yes |
| `sessionId` | string | Yes |
| `persona` | string | Yes |
| `answers` | object | Yes |
| `recommendations` | array | Yes |
| `user` | object | No |
| `consent` | object | No |

---

### `POST /api/skinbetter-quiz`

Sends Skinbetter quiz completion email.

| Field | Type | Required |
|-------|------|----------|
| `eventType` | string | Yes |
| `toEmail` | string | No |
| `sessionId` | string | Yes |
| `persona` | string | Yes |
| `answers` | object | Yes |
| `recommendations` | array | Yes |

---

### `POST /api/quiz-service-results`

Service quiz with full UTM/attribution capture.

| Field | Type | Required |
|-------|------|----------|
| `eventType` | string | Yes |
| `persona` | string | Yes |
| `answers` | object | Yes |
| `recommendations` | array | Yes |
| `attribution` | object | No |
| `startedAt` | string | No |
| `durationSeconds` | number | No |
| `coupon` | string | No |

---

### `POST /api/log-404`

Logs client-side 404 errors. Returns `204 No Content`.

| Field | Type | Required |
|-------|------|----------|
| `path` | string | Yes |
| `referrer` | string | No |
| `ua` | string | No |

---

## Admin Routes

> Admin routes use Supabase service role client. They are called from the `/admin` dashboard.

### Core Admin

#### `POST /api/admin/rebuild`

Triggers Vercel deploy hook for site rebuild.

**Response:** `{ "ok": true, "job": { ... } }`

---

#### `GET/POST /api/admin/testimonials`

CRUD for testimonials table.

**GET** — Returns all testimonials.
**POST** — Actions: `save`, `delete`, `import`, `toggle-provider`, `bulk-update`, `bulk-delete`.

---

#### `GET/POST /api/admin/boulevard-sync`

- **GET**: Tests Boulevard Admin API connection, introspects schema
- **POST**: Saves staff → Boulevard provider mappings

| Field (POST) | Type | Required |
|-------|------|----------|
| `mappings` | array | Yes |
| `mappings[].staffId` | string | Yes |
| `mappings[].boulevardProviderId` | string | Yes |
| `mappings[].boulevardServiceMap` | object | Yes |

---

#### `POST /api/admin/blvd-catalog-sync`

Syncs full Boulevard service catalog into `blvd_service_catalog` table.

**Response:** `{ "ok": true, "synced": 150, "locations": { "westfield": 80, "carmel": 70 } }`

---

#### `GET /api/admin/blvd-catalog`

Search cached Boulevard catalog.

| Param | Type | Required |
|-------|------|----------|
| `q` | string | No |
| `location` | string | No |

**Response:** `[{ "id", "name", "category_name", "location_key", "duration_min", "price_min" }]`

---

#### `POST /api/admin/staff/update-locations`

Update staff location assignments.

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes |
| `locations` | array | Yes |

---

### Intelligence

#### `GET /api/admin/intelligence/patients`

Patient intelligence dashboard with LTV segmentation.

| Param | Type | Description |
|-------|------|-------------|
| `ltv` | string | Filter: `vip` (≥$5k), `high` ($2k-$5k), `medium` ($500-$2k), `low` (<$500) |
| `search` | string | Name/email search |
| `sort` | string | Sort field |
| `page` | number | Page number |
| `limit` | number | Per page (default 50) |
| `window_days` | number | Lookback window |

**Response:**
```json
{
  "summary": { "total_clients", "vip", "high", "medium", "low", "total_revenue", "new_last_30d", "at_risk" },
  "patients": { "data": [...], "total": 500, "page": 1, "page_size": 50 }
}
```

---

#### `GET /api/admin/intelligence/providers`

Provider performance metrics.

**Response:**
```json
{
  "summary": { "total_providers", "total_revenue", "avg_rebooking_rate", "revenue_last_30d" },
  "providers": [{ "name", "revenue", "appointments", "rebooking_rate", "cancellation_rate", "service_mix" }]
}
```

---

#### `GET /api/admin/intelligence/patient-detail`

Detailed single patient profile.

| Param | Type | Required |
|-------|------|----------|
| `client_id` | string | Yes |
| `window_days` | number | No |

---

#### `GET /api/admin/intelligence/tox`

Tox intelligence engine: segments, provider retention, brand breakdown.

| Param | Type | Description |
|-------|------|-------------|
| `location` | string | Filter by location |
| `provider` | string | Filter by provider |
| `segment` | string | `on_schedule`, `due`, `overdue`, `probably_lost`, `lost` |
| `tox_type` | string | `botox`, `dysport`, `jeuveau`, `daxxify`, `xeomin` |
| `search` | string | Name search |
| `min_visits` | number | Minimum visit count |
| `sort` | string | Sort field |
| `page`/`limit` | number | Pagination |

---

#### `GET /api/admin/intelligence/tox-patient`

Single patient's tox history for detail drawer.

| Param | Type | Required |
|-------|------|----------|
| `client_id` | string | Yes |

---

#### `GET /api/admin/intelligence/actions`

Actionable patient segments with drilldown.

| Param | Type | Description |
|-------|------|-------------|
| `segment` | string | `tox_on_schedule`, `tox_due`, `tox_overdue`, `tox_probably_lost`, `tox_lost`, `tox_due_2_weeks`, `at_risk_high_value`, `drop_off`, `no_rebook` |
| `search` | string | Name search |
| `page`/`limit` | number | Pagination |

---

#### `GET /api/admin/intelligence/rebooking`

Rebooking gap analysis — clients who completed recently with no future appointment.

| Param | Type | Description |
|-------|------|-------------|
| `timeframe` | string | `48h`, `7d`, `14d`, `14d+` |
| `search` | string | Name search |
| `page`/`limit` | number | Pagination |

---

#### `GET /api/admin/intelligence/products`

Product intelligence: sales trends, SKU forecasts, journey cohorts.

| Param | Type | Description |
|-------|------|-------------|
| `provider` | string | Filter by provider |
| `months` | number | Lookback months |
| `sku` | string | Specific SKU for journey view |

---

#### `GET /api/admin/intelligence/daily-snapshot`

Daily business snapshot: revenue, bookings, cancellations.

| Param | Type | Description |
|-------|------|-------------|
| `location` | string | `total`, `westfield`, `carmel` |

---

### Boulevard Sync

#### `GET/POST /api/admin/blvd-sync/incremental`

Incremental appointment sync — runs every 15 min via Vercel cron. Fetches 2 pages of recent appointments per location, syncs customers and services.

**Response:** `{ "ok": true, "processed": 50, "created": 5, "lifecycleUpdated": 12 }`

---

#### `POST /api/admin/blvd-sync/backfill`

Paginated historical sync of all appointments. Call repeatedly with `cursor` for full backfill.

| Field | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor from previous call |
| `syncLogId` | string | Sync log ID for tracking |
| `locationIndex` | number | Which location to sync (0 or 1) |
| `stopBeforeDate` | string | Stop when reaching this date |

---

#### `POST /api/admin/blvd-sync/backfill-clients`

One-time utility: recomputes client lifecycle fields from appointment data.

---

#### `POST /api/admin/blvd-sync/product-sales`

Syncs retail product sales from Boulevard report export.

| Field | Type | Description |
|-------|------|-------------|
| `fileUrl` | string | Optional direct file URL |
| `dryRun` | boolean | Preview without writing |
| `mode` | string | `latest` or `create` |
| `fullRefresh` | boolean | Clear and re-import all |

---

#### `POST /api/admin/blvd-sync/report-cleanup`

Deletes duplicate test report exports, keeps only DAILY.

---

#### `POST /api/admin/blvd-sync/report-reschedule`

Deletes old export schedule, creates new DAILY at 00:30 UTC (7:30 PM EST).

---

## Authentication Patterns

| Route Group | Auth Method |
|-------------|-------------|
| `/api/member/*` | Bearer token (Supabase JWT) via `Authorization` header |
| `/api/blvd/*` | None (public) — but cart checkout requires SMS verification |
| `/api/admin/*` | Supabase service role (server-side only) |
| `/api/contact`, `/api/instagram`, quiz routes | None (public) |

## Caching

| Endpoint | TTL | Type |
|----------|-----|------|
| Services menu | 10 min | In-memory + HTTP |
| Providers at location | 5 min | In-memory + HTTP |
| Available dates | 2 min | In-memory |
| Available times | 1 min | In-memory |
| Bundles | 5 min | In-memory + HTTP |
| Availability summary | 5 min | In-memory |
| Instagram | 1 hour | In-memory |

## Locations

The system currently supports two locations:

| Key | Name |
|-----|------|
| `westfield` | RELUXE at Westfield |
| `carmel` | RELUXE at Carmel |

All `locationKey` parameters accept these values.
