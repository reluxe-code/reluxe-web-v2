-- 011-fix-service-slug-specificity.sql
-- Fix service_slug misclassifications where specific services
-- (glo2facial, hydrafacial, sculptra) were incorrectly grouped
-- under generic parent slugs (facials, filler).
--
-- Run after deploying the updated guessServiceSlug() logic.

BEGIN;

-- ============================================================
-- 1. Fix glo2facial: was tagged as 'facials', should be 'glo2facial'
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'glo2facial'
WHERE service_slug = 'facials'
  AND LOWER(service_name) LIKE '%glo2facial%';

-- ============================================================
-- 2. Fix hydrafacial: was tagged as 'facials', should be 'hydrafacial'
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'hydrafacial'
WHERE service_slug = 'facials'
  AND LOWER(service_name) LIKE '%hydrafacial%';

-- ============================================================
-- 3. Fix sculptra: was tagged as 'filler', should be 'sculptra'
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'sculptra'
WHERE service_slug = 'filler'
  AND LOWER(service_name) LIKE '%sculptra%';

-- ============================================================
-- 4. Fix coolsculpting → body-contouring slug rename
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'body-contouring'
WHERE service_slug = 'coolsculpting';

COMMIT;
