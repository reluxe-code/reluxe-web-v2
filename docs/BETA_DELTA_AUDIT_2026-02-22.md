# Beta Delta Audit

Date: February 22, 2026

## Snapshot
- Legacy public routes in code: **115**
- Beta routes in code: **17**
- Covered in beta (exact): **14**
- Covered near-equivalent (blog/posts -> inspiration): **4**
- Missing from beta: **97**

## Already Covered In Beta
- `/`
- `/about`
- `/contact`
- `/faqs`
- `/locations`
- `/locations/[slug]`
- `/memberships`
- `/pricing`
- `/results`
- `/reviews`
- `/services`
- `/services/[slug]`
- `/team`
- `/team/[slug]`

## Near-Equivalent Coverage
- `/blog`, `/blog/[slug]`, `/posts`, `/posts/[slug]` -> `/beta/inspiration`, `/beta/inspiration/[slug]`

## Missing Delta (Grouped)

### landing (17)
- Recommendation: Keep legacy for launch; migrate only top-performing campaigns
- Missing rating: **Medium**
- `/landing/bf-botox`
- `/landing/bf-daxxify`
- `/landing/bf-dysport`
- `/landing/bf-jeuveau`
- `/landing/jeuveau-offer`
- `/landing/laser-hair-removal`
- `/landing/lhr-carmel`
- `/landing/new-patient-botox`
- `/landing/new-patient-daxxify`
- `/landing/new-patient-dysport`
- `/landing/new-patient-jeuveau`
- `/landing/new-patient-tox`
- `/landing/refine-carmel`
- `/landing/service-quiz`
- `/landing/service-quiz-v1`
- `/landing/skinbetter-starter-quiz`
- `/landing/spf-quiz`

### conditions (12)
- Recommendation: Quick-add one beta template + dynamic content; keep URLs for SEO
- Missing rating: **High**
- `/conditions`
- `/conditions/acne-scars`
- `/conditions/double-chin`
- `/conditions/loose-skin`
- `/conditions/rosacea`
- `/conditions/skin-texture`
- `/conditions/sun-damage`
- `/conditions/under-eye`
- `/conditions/unwanted-hair`
- `/conditions/volume-loss`
- `/conditions/weight-loss-laxity-volume-loss`
- `/conditions/wrinkles-fine-lines`

### events (12)
- Recommendation: Coming Soon hub in /beta/events; keep legacy event URLs for now
- Missing rating: **Low**
- `/events`
- `/events/bachelorette-parties`
- `/events/beauty-bash`
- `/events/corporate-prep`
- `/events/fitness-prep`
- `/events/graduation-prep`
- `/events/holiday-prep`
- `/events/local-indy-events`
- `/events/pageant-performance`
- `/events/photoshoot-prep`
- `/events/proms-formals`
- `/events/red-carpet-galas`

### reluxe-way (9)
- Recommendation: Quick-add with shared template from beta inspiration style
- Missing rating: **Medium**
- `/reluxe-way`
- `/reluxe-way/choosing-your-tox`
- `/reluxe-way/injector-standard`
- `/reluxe-way/local-on-purpose`
- `/reluxe-way/not-for-everyone`
- `/reluxe-way/results-over-deals`
- `/reluxe-way/tox-pricing`
- `/reluxe-way/why-patients-stay`
- `/reluxe-way/your-consult`

### start (5)
- Recommendation: Keep legacy flow for launch, link from beta where needed
- Missing rating: **High**
- `/start`
- `/start/all-options`
- `/start/concern`
- `/start/not-sure`
- `/start/provider`

### shop (4)
- Recommendation: Header/footer swap first, then redesign
- Missing rating: **High**
- `/shop`
- `/shop/cherry`
- `/shop/gift-card`
- `/shop/skinbetter`

### skincare (3)
- Recommendation: Header/footer swap first, then redesign
- Missing rating: **High**
- `/skincare`
- `/skincare/[brand]`
- `/skincare/[brand]/[slug]`

### hot-deals (2)
- Recommendation: Quick add (list/detail) or keep legacy deals live
- Missing rating: **High**
- `/hot-deals`
- `/hot-deals/[slug]`

### profile (2)
- Recommendation: Keep legacy auth/account routes; beta has member drawer UX
- Missing rating: **High**
- `/profile`
- `/profile/view`

### referral (2)
- Recommendation: Keep legacy referral routes (already linked in beta footer)
- Missing rating: **High**
- `/referral`
- `/referral/[code]`

### accessibility (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/accessibility`

### affiliations (1)
- Recommendation: Coming Soon or merge into /beta/about
- Missing rating: **Low**
- `/affiliations`

### black-friday (1)
- Recommendation: Coming Soon/seasonal; keep legacy
- Missing rating: **Low**
- `/black-friday`

### book-cherry-offer (1)
- Recommendation: Redirect to /beta/rewards or /shop/cherry
- Missing rating: **Medium**
- `/book-cherry-offer`

### book (1)
- Recommendation: Keep legacy booking entry route for launch
- Missing rating: **High**
- `/book/[slug]`

### category (1)
- Recommendation: Coming Soon; low launch value
- Missing rating: **Low**
- `/category/[slug]`

### cherry-financing (1)
- Recommendation: Header/footer swap or redirect to /shop/cherry
- Missing rating: **Medium**
- `/cherry-financing`

### cookie-policy (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/cookie-policy`

### deals (1)
- Recommendation: Quick add or redirect to /hot-deals
- Missing rating: **Medium**
- `/deals`

### event-terms (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/event-terms`

### flash-sales (1)
- Recommendation: Coming Soon/seasonal; keep legacy
- Missing rating: **Low**
- `/flash-sales`

### gift-card-terms (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/gift-card-terms`

### hipaa-notice (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/hipaa-notice`

### legal (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/legal`

### media-consent (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/media-consent`

### membership-terms (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/membership-terms`

### men (1)
- Recommendation: Header/footer swap or merge into /beta/services
- Missing rating: **Medium**
- `/men`

### messaging-terms (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/messaging-terms`

### package-voucher-policy (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/package-voucher-policy`

### partners (1)
- Recommendation: Header/footer swap or move under /beta/about
- Missing rating: **Medium**
- `/partners/house-of-health`

### privacy-policy (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/privacy-policy`

### return-policy (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/return-policy`

### search (1)
- Recommendation: Coming Soon; low launch value
- Missing rating: **Low**
- `/search`

### services (1)
- Recommendation: Add redirect strategy for /services/[slug]/[city] -> /beta/locations/[city]?service=[slug]
- Missing rating: **High**
- `/services/[slug]/[city]`

### shipping-policy (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/shipping-policy`

### spafinder (1)
- Recommendation: Header/footer swap or redirect to /shop/gift-card
- Missing rating: **Medium**
- `/spafinder`

### tag (1)
- Recommendation: Coming Soon; low launch value
- Missing rating: **Low**
- `/tag/[slug]`

### terms (1)
- Recommendation: Header/footer swap (legal/compliance)
- Missing rating: **High**
- `/terms`

### wedding (1)
- Recommendation: Coming Soon unless active campaign
- Missing rating: **Low**
- `/wedding`

## 7-Day Launch Triage
1. Day 1-2: Legal/compliance pages as quick beta wrappers (header/footer swap).
2. Day 2-3: Keep legacy booking/profile/referral flows and add explicit links from beta where needed.
3. Day 3-4: Add redirects for service city routes to beta location+service equivalents.
4. Day 4-5: Shop/skincare quick wrappers to avoid revenue gaps.
5. Day 5-6: Decide campaign pages (landing/events/hot-deals): keep legacy vs coming soon.
6. Day 7: QA route matrix + broken link scan + launch checklist.
