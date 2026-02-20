-- 008-fix-service-slugs.sql
-- One-time fix for service_slug misclassifications caused by
-- older versions of guessServiceSlug() that didn't prioritize
-- name-based checks over category-based checks.
--
-- Run after 007-intelligence-views.sql.

BEGIN;

-- ============================================================
-- 1. Fix misclassified tox → filler
--    Category "Injectables: Wrinkle Relaxers (Tox) + Fillers"
--    caused filler services to match \btox\b in the category.
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'filler'
WHERE service_slug = 'tox'
  AND (
    LOWER(service_name) LIKE '%dermal filler%'
    OR LOWER(service_name) LIKE '%filler dissolving%'
    OR LOWER(service_name) LIKE '%corrective filler%'
  );
-- Expected: ~333 rows

-- ============================================================
-- 2. Fix misclassified tox → prp
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'prp'
WHERE service_slug = 'tox'
  AND LOWER(service_name) LIKE '%prp injection%';
-- Expected: ~32 rows

-- ============================================================
-- 3. Fix null slugs: Juvéderm (accented é not matching regex)
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'filler'
WHERE service_slug IS NULL
  AND (LOWER(service_name) LIKE '%juvéderm%' OR LOWER(service_name) LIKE '%juvederm%');
-- Expected: ~27 rows

-- ============================================================
-- 4. Fix null slugs: sauna & salt sessions
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'salt-sauna'
WHERE service_slug IS NULL
  AND (LOWER(service_name) LIKE '%sauna%' OR LOWER(service_name) LIKE '%salt%booth%');
-- Expected: ~209 rows

-- ============================================================
-- 5. Fix null slugs: BioRePeel → facials
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'facials'
WHERE service_slug IS NULL
  AND LOWER(service_name) LIKE '%biorepeel%';
-- Expected: ~30 rows

-- ============================================================
-- 6. Fix null slugs: B12 Shot → iv-therapy
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'iv-therapy'
WHERE service_slug IS NULL
  AND LOWER(service_name) LIKE '%b12 shot%';
-- Expected: ~10 rows

-- ============================================================
-- 7. Fix null slugs: VascuPen → ipl
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'ipl'
WHERE service_slug IS NULL
  AND LOWER(service_name) LIKE '%vascupen%';
-- Expected: ~9 rows

-- ============================================================
-- 8. Fix null slugs: Opus → ipl
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'ipl'
WHERE service_slug IS NULL
  AND LOWER(service_name) LIKE '%opus%';
-- Expected: ~6 rows

-- ============================================================
-- 9. Fix null slugs: ClearLift → ipl
-- ============================================================
UPDATE blvd_appointment_services
SET service_slug = 'ipl'
WHERE service_slug IS NULL
  AND LOWER(service_name) LIKE '%clearlift%';
-- Expected: ~1 row

COMMIT;
