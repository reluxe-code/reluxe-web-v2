-- 072-cta-block-type.sql
-- Adds 'cta' to the cms_service_blocks block_type CHECK constraint
-- for placeable call-to-action blocks (book_service, book_consult, book_provider, decision_helper)

ALTER TABLE cms_service_blocks
  DROP CONSTRAINT IF EXISTS cms_service_blocks_block_type_check,
  ADD CONSTRAINT cms_service_blocks_block_type_check
    CHECK (block_type IN (
      'hero','quick_facts','overview','benefits','results_gallery',
      'how_it_works','candidates','pricing_matrix','comparison',
      'faq','testimonials','providers','prep_aftercare',
      'flex_everything','booking_embed','location_copy',
      'custom_tool','custom_html','cta'
    ));
