// src/lib/cmsTransform.js
// Converts CMS database records (cms_services + cms_service_blocks) into the
// service object shape that the existing rendering components expect.
// This bridge layer means ZERO changes to the React block components.

/**
 * Transform CMS service + blocks into the legacy service object shape.
 * @param {Object} svc - Row from cms_services table
 * @param {Array}  blocks - Rows from cms_service_blocks (sorted by sort_order)
 * @returns {Object} Service object matching existing component props
 */
export function transformCmsToServiceObject(svc, blocks) {
  const service = {
    slug: svc.slug,
    name: svc.name,
    tagline: svc.tagline || '',
    heroImage: svc.hero_image || '/images/service/default/1.png',
    bookingLink: svc.booking_slug ? `/book/${svc.booking_slug}` : null,
    consultLink: svc.consult_slug ? `/book/${svc.consult_slug}` : null,
    seo: svc.seo || {},
    indexable: svc.indexable !== false,

    // These will be populated from blocks below
    variants: {},
    blockPriorities: {},
    quickFacts: [],
    overview: { p1: '', p2: '' },
    whyReluxe: [],
    benefits: [],
    resultsGallery: [],
    howItWorks: [],
    candidates: { good: [], notIdeal: [] },
    pricingMatrix: null,
    comparison: null,
    faq: [],
    testimonials: [],
    providers: [],
    prepAftercare: { prep: { title: '', points: [] }, after: { title: '', points: [] } },
    flexEverything: null,
  };

  // Map block_type → variants key for backward compatibility
  const BLOCK_TO_VARIANT_KEY = {
    hero: 'hero',
    quick_facts: 'quickFacts',
    overview: 'overview',
    benefits: 'benefits',
    results_gallery: 'beforeAfter',
    how_it_works: 'howItWorks',
    candidates: 'candidates',
    pricing_matrix: 'pricing',
    comparison: 'comparison',
    faq: 'faq',
    testimonials: 'testimonials',
    providers: 'providers',
    prep_aftercare: 'prepAftercare',
    flex_everything: 'flexEverything',
    cta: 'cta',
  };

  const BLOCK_TO_PRIORITY_KEY = {
    hero: 'hero',
    quick_facts: 'quickFacts',
    overview: 'overviewWhy',
    benefits: 'benefits',
    results_gallery: 'resultsGallery',
    how_it_works: 'howItWorks',
    candidates: 'candidates',
    pricing_matrix: 'pricingMatrix',
    comparison: 'comparison',
    faq: 'faq',
    testimonials: 'testimonials',
    providers: 'providerSpotlight',
    prep_aftercare: 'prepAftercare',
    flex_everything: 'flexEverything',
    cta: 'cta',
  };

  for (const block of blocks) {
    const c = block.content || {};

    // Populate variants
    if (block.variant && BLOCK_TO_VARIANT_KEY[block.block_type]) {
      service.variants[BLOCK_TO_VARIANT_KEY[block.block_type]] = block.variant;
    }

    // Populate blockPriorities from sort_order
    if (BLOCK_TO_PRIORITY_KEY[block.block_type]) {
      service.blockPriorities[BLOCK_TO_PRIORITY_KEY[block.block_type]] = block.sort_order;
    }

    switch (block.block_type) {
      case 'hero':
        if (c.tagline) service.tagline = c.tagline;
        break;

      case 'quick_facts':
        service.quickFacts = c.facts || [];
        break;

      case 'overview':
        service.overview = { p1: c.p1 || '', p2: c.p2 || '' };
        service.whyReluxe = c.whyReluxe || [];
        break;

      case 'benefits':
        service.benefits = c.items || [];
        break;

      case 'results_gallery':
        service.resultsGallery = c.images || [];
        break;

      case 'how_it_works':
        service.howItWorks = c.steps || [];
        break;

      case 'candidates':
        service.candidates = {
          good: c.good || [],
          notIdeal: c.notIdeal || [],
        };
        break;

      case 'pricing_matrix':
        service.pricingMatrix = c;
        break;

      case 'comparison':
        service.comparison = c;
        break;

      case 'faq':
        service.faq = c.items || [];
        break;

      case 'testimonials':
        service.testimonials = c.items || [];
        break;

      case 'providers':
        service.providers = c.items || [];
        break;

      case 'prep_aftercare':
        service.prepAftercare = {
          prep: c.prep || { title: '', points: [] },
          after: c.after || { title: '', points: [] },
        };
        break;

      case 'flex_everything':
        service.flexEverything = c;
        break;

      case 'booking_embed':
        service.bookingEmbed = c;
        break;

      case 'location_copy':
        service.locationCopy = c;
        break;

      case 'cta':
        // CTA blocks are rendered directly by BlockRenderer — no service object transform needed
        break;

      default:
        break;
    }
  }

  return service;
}

/**
 * Transform CMS blocks array into the ordered block list used by BlockRenderer.
 * @param {Array} blocks - Rows from cms_service_blocks (sorted by sort_order)
 * @returns {Array} Array of { id, blockType, content, variant, sortOrder }
 */
export function transformBlocksForRenderer(blocks) {
  return blocks.map((b) => ({
    id: b.id,
    blockType: b.block_type,
    content: b.content || {},
    variant: b.variant || null,
    sortOrder: b.sort_order,
  }));
}
