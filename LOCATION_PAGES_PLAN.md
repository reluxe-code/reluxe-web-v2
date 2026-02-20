# Location Pages Improvement Plan

## Goal
Transform `/locations/westfield` and `/locations/carmel` into visually polished, service-rich pages with location-specific content. Also clean up the location-based service pages (`/services/[slug]/[city]`) with better location-specific content.

---

## Current State

### Location Pages (`src/pages/locations/[slug].js`)
- **Hero**: Basic text-left / image-right layout. Hero image uses raw `<img>` (not next/image). Simple title, address, phone, 3 generic anchor buttons.
- **LocationOverview**: Hardcoded copy per location (Westfield vs Carmel) with 3 highlight cards and "The RELUXE Way" box.
- **CollaborationSection**: Carmel-only section about House of Health partnership.
- **ServiceCategorySlider**: Generic swiper of ALL service categories — **not filtered by location**. Shows Hydrafacial, Massage, EvolveX etc. even on Carmel page where they aren't available.
- **Meet the Experts**: Grid of staff filtered by location. Uses raw `<img>`.
- **Content Grid**: Hours card, Getting Here card, Map card — all in a 3-column grid.
- **Gallery**: Location gallery from Supabase. Uses raw `<img>`.
- **Deals Carousel**: Filtered by location.
- **FAQs**: Accordion with defaults if none in DB.

### What's Missing / Broken
1. **No "Services Available Here" section** — the slider shows ALL services regardless of location
2. **Raw `<img>` tags** in hero, staff grid, gallery (missed in last audit pass)
3. **No visual distinction** between Westfield (flagship, full-service) and Carmel (newer, wellness-forward, fewer devices)
4. **Generic CTAs** — "View Services" goes to `/services` not location-filtered
5. **No cross-link** between the two locations
6. **ServiceCategorySlider** doesn't accept location filtering

### Location-Specific Service Pages (`src/pages/services/[slug]/[city].js`)
- **Availability**: Hardcoded `NOT_IN_CARMEL` set correctly lists: hydrafacial, evolvex, vascupen, clearskin, co2, salt-sauna, massage
- **Location content**: Sourced from `src/data/locationContent/index.js` — extensive per-service per-city overrides with descriptions, differences, FAQs, complementary services
- **What's weak**: No staff callout, no before/after gallery, no "Why this location" content beyond generic location info card

---

## Implementation Plan

### Phase 1: Location-Filtered Services Section (HIGH IMPACT)

**Goal**: Add a "Services Available at [Location]" grid section to each location page, replacing or supplementing the generic ServiceCategorySlider.

#### 1a. Create `src/components/locations/LocationServicesGrid.js`
A new component that:
- Accepts `locationSlug` prop (`'westfield'` or `'carmel'`)
- Imports the full services list from `getServicesList()` and `serviceCategories`
- Filters out services that are NOT available at that location (use `NOT_IN_CARMEL` set from `[city].js`, centralized to a shared constant)
- Renders a responsive grid of service cards (image, name, starting price, link to `/services/[slug]/[city]`)
- Each card links to the **location-specific** service page (e.g., `/services/botox/carmel`)
- Visually: 2-col mobile, 3-col tablet, 4-col desktop
- "Westfield-only" services could show on Carmel page as a separate "Also available at Westfield" section at the bottom

#### 1b. Centralize `NOT_IN_CARMEL` to shared location
Move the `NOT_IN_CARMEL` set from `src/pages/services/[slug]/[city].js` to `src/data/locationAvailability.js`:
```js
export const NOT_IN_CARMEL = new Set([
  'hydrafacial', 'evolvex', 'vascupen', 'clearskin', 'co2', 'salt-sauna', 'massage'
]);

export function isAvailableAtLocation(serviceSlug, locationKey) {
  if (locationKey === 'westfield') return true;
  if (locationKey === 'carmel') return !NOT_IN_CARMEL.has(serviceSlug);
  return true;
}
```
Update `[city].js` to import from here instead of having its own copy.

#### 1c. Replace generic ServiceCategorySlider in location pages
In `[slug].js`, swap:
```jsx
<ServiceCategorySlider items={serviceCategories} showOnlyFeatured={false} />
```
with:
```jsx
<LocationServicesGrid locationSlug={slug} />
```

---

### Phase 2: Visual Polish — Hero Redesign

**Goal**: Make the hero section more impactful and distinct per location.

#### 2a. Convert hero `<img>` to `next/image`
Replace the raw `<img>` at line 204-209 of `[slug].js` with `<Image>` using `fill` + `object-cover` inside a relative container.

#### 2b. Redesign hero layout
Current: Side-by-side text + image, plain white bg.
New design:
- **Full-bleed hero image** with dark overlay (similar to service pages)
- Location name as large heading overlaid on image
- Address, phone as subtitle
- "Book Now", "Explore Services", "Get Directions" as pill-style buttons
- Location badge: "Flagship" for Westfield, "Newest Location" for Carmel
- Subtle location-specific color accent (optional)

#### 2c. Convert staff `<img>` to `next/image`
The "Meet the Experts" section at line 245-249 uses raw `<img>`. Convert to `<Image>` with `fill` in a relative aspect-square container.

#### 2d. Convert gallery `<img>` to `next/image`
Gallery at line 302-308 uses raw `<img>`. Convert to `<Image>` with `fill` in relative containers.

---

### Phase 3: Location-Specific Content Sections

**Goal**: Add meaningful location-specific content that differentiates the two pages.

#### 3a. "Why Choose [Location]" section
New component `src/components/locations/WhyChooseLocation.js`:
- **Westfield**: Flagship since 2023, full device suite, massage + sauna, US-32 convenience, near Grand Park
- **Carmel**: Newest studio, wellness-forward with House of Health, convenient for Carmel/North Indy, 8AM appointments available

Content structure: 2-3 unique selling points with icons, a short paragraph, and a relevant image.

#### 3b. Location-specific intro paragraph
Update `LocationOverview.js` to have richer, more differentiated copy:
- **Westfield**: Emphasize "full-service flagship" — every device, every treatment, plus massage & sauna
- **Carmel**: Emphasize "aesthetics meets wellness" — core treatments + House of Health partnership, newer intimate space

#### 3c. Cross-location CTA section
New component at bottom of location page:
```
"Looking for our other location?"
[Card for the OTHER location with image, address, phone, and link]
```
This helps users discover both locations and improves internal linking for SEO.

---

### Phase 4: Improve Location-Specific Service Pages

**Goal**: Make `/services/[slug]/[city]` pages richer and more location-aware.

#### 4a. Add location staff to service pages
In `getStaticProps` of `[city].js`, fetch staff who work at that location AND specialize in that service category. Display 2-3 relevant providers in a "Your Providers at [City]" sidebar or section.

Requires: Adding a `service_categories` or tag system to staff data, OR a simpler approach — show all staff at that location with a generic "Meet your team in [City]" callout.

#### 4b. Location-specific FAQs on service pages
The `locationContent` already has per-service per-city FAQs. Render them on the `[city].js` page below the main content. Currently they exist in the data but **are not rendered on the page**.

Add an FAQ accordion section (reuse the same `<details>` pattern from location pages):
```jsx
{!!locationContent?.faqs?.length && (
  <section className="py-10">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">FAQs — {service.name} in {loc.city}</h2>
      <div className="space-y-3">
        {locationContent.faqs.map((faq, i) => (
          <details key={i} className="group border rounded-lg">
            <summary className="p-4 cursor-pointer font-medium">{faq.q}</summary>
            <div className="px-4 pb-4 text-gray-600">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  </section>
)}
```

#### 4c. Better "not available" handling for Carmel
When a service isn't available in Carmel, instead of just the amber box, show:
- A richer message explaining which services ARE available in Carmel
- A "Similar services in Carmel" section (e.g., if Hydrafacial isn't available, suggest Glo2Facial and Facials)
- More prominent Westfield booking CTA

---

### Phase 5: Visual Consistency & Polish

#### 5a. Consistent card styles
Ensure all sections use the same card styling:
- `rounded-2xl` or `rounded-3xl` consistently
- Same shadow treatment (`shadow-sm` with `hover:shadow-lg`)
- Consistent padding and spacing

#### 5b. Section spacing
Standardize section spacing to `py-16` for major sections, `py-10` for secondary. Currently mixed (`py-12`, `py-16`, inconsistent).

#### 5c. Typography hierarchy
- Section headings: `text-3xl md:text-4xl font-bold`
- Section subtitles: `text-lg text-gray-600`
- Card titles: `text-xl font-semibold`
Keep consistent across all location page sections.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/locations/LocationServicesGrid.js` | Location-filtered services grid |
| `src/components/locations/WhyChooseLocation.js` | Location-specific selling points |
| `src/components/locations/CrossLocationCTA.js` | Link to the other location |
| `src/data/locationAvailability.js` | Centralized NOT_IN_CARMEL + helper function |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/locations/[slug].js` | New hero, swap ServiceCategorySlider for LocationServicesGrid, add WhyChooseLocation, add CrossLocationCTA, convert all `<img>` to `next/image` |
| `src/components/locations/LocationOverview.js` | Richer differentiated copy |
| `src/pages/services/[slug]/[city].js` | Add FAQ rendering, improve unavailable service handling, import centralized availability |
| `src/components/services/ServiceCategorySlider.js` | Convert `<img>` to `next/image` (bonus) |

## Files NOT Changed (Already Good)
- `src/components/locations/CollaborationSection.js` — Already well-structured, Carmel-only
- `src/data/locationContent/index.js` — Already comprehensive with per-service per-city content
- `src/data/locations.js` — Data is clean
- `src/data/ServiceCategories.js` — Data is good, used as source for the grid

---

## Carmel Service Exclusions (Reference)

These services are **NOT available** at the Carmel location:
- **Hydrafacial** — Suggest Glo2Facial or Signature Facials instead
- **EvolveX** (body contouring) — Suggest Morpheus8 body instead
- **VascuPen** (vascular laser) — Suggest IPL instead
- **ClearSkin** (acne laser) — Suggest facials + peels instead
- **CO2** (ablative laser) — Suggest Morpheus8 or Opus instead
- **Salt Sauna** — No alternative; Carmel has House of Health wellness options
- **Massage** — Carmel can refer to House of Health bodywork

---

## Implementation Order

1. **Phase 1** (LocationServicesGrid + centralized availability) — Biggest user-facing improvement
2. **Phase 2** (Hero redesign + `<img>` → `next/image`) — Visual polish
3. **Phase 3** (Location-specific content sections) — Differentiation
4. **Phase 4** (Service page improvements — FAQs, better unavailable handling)
5. **Phase 5** (Consistency pass)

Each phase is independently deployable. Run `npm run build` after each phase to verify.

---

## SEO Impact

- **Location-filtered service links** improve internal linking and help Google associate services with specific locations
- **Cross-location CTAs** improve crawl paths between location pages
- **Richer location-specific content** differentiates the pages (currently similar structure risks thin content flags)
- **FAQ rendering on service-city pages** adds FAQ schema opportunities
- **Consistent `next/image`** improves Core Web Vitals (LCP, CLS)
