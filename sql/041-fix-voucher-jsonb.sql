-- 041: Fix double-encoded vouchers JSONB.
-- The sync was doing JSON.stringify() before insert, causing vouchers to be
-- stored as a JSONB string '"[{...}]"' instead of a native JSONB array '[{...}]'.
-- This UPDATE parses the string back into a proper JSONB array.

UPDATE blvd_memberships
SET vouchers = (vouchers #>> '{}')::jsonb
WHERE jsonb_typeof(vouchers) = 'string'
  AND vouchers IS NOT NULL;
