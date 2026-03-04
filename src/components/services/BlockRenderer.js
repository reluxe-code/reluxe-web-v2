/**
 * BlockRenderer — Maps CMS block_type strings to React block components.
 *
 * Used by [slug].js when rendering service pages from CMS-driven block data.
 * Each entry in BLOCK_MAP defines:
 *   - Component: the React component to render
 *   - propsMapper: a function that extracts the right props from the block,
 *     the service object, fonts, and handler callbacks
 */
import {
  HeroBlock,
  QuickFactsBlock,
  OverviewBlock,
  ResultsBlock,
  HowItWorksBlock,
  CandidatesBlock,
  PricingMatrixBlock,
  ComparisonBlock,
  FAQBlock,
  TestimonialsBlock,
  ProvidersBlock,
  PrepAftercareBlock,
  CTABlock,
} from './blocks';

const BLOCK_MAP = {
  hero: {
    Component: HeroBlock,
    propsMapper: (block, service, fonts, handlers) => ({
      s: service,
      fonts,
      onBook: handlers.onBook,
      onConsult: handlers.onConsult,
      locationKey: handlers.locationKey,
    }),
  },
  quick_facts: {
    Component: QuickFactsBlock,
    propsMapper: (block, service, fonts) => ({
      facts: block.data?.facts || service.quickFacts,
      fonts,
    }),
  },
  overview: {
    Component: OverviewBlock,
    propsMapper: (block, service, fonts) => ({
      s: service,
      fonts,
    }),
  },
  results: {
    Component: ResultsBlock,
    propsMapper: (block, service, fonts) => ({
      results: block.data?.results || (Array.isArray(service.resultsGallery) ? service.resultsGallery : []),
      s: service,
      fonts,
    }),
  },
  how_it_works: {
    Component: HowItWorksBlock,
    propsMapper: (block, service, fonts) => ({
      steps: block.data?.steps || service.howItWorks,
      fonts,
    }),
  },
  candidates: {
    Component: CandidatesBlock,
    propsMapper: (block, service, fonts) => ({
      candidates: block.data?.candidates || service.candidates,
      fonts,
    }),
  },
  pricing_matrix: {
    Component: PricingMatrixBlock,
    propsMapper: (block, service, fonts, handlers) => ({
      matrix: block.data?.matrix || service.pricingMatrix,
      s: service,
      fonts,
      onBook: handlers.onBook,
    }),
  },
  comparison: {
    Component: ComparisonBlock,
    propsMapper: (block, service, fonts) => ({
      comparison: block.data?.comparison || service.comparison,
      fonts,
    }),
  },
  faq: {
    Component: FAQBlock,
    propsMapper: (block, service, fonts) => ({
      faq: block.data?.faq || (Array.isArray(service.faq) ? service.faq : []),
      s: service,
      fonts,
    }),
  },
  testimonials: {
    Component: TestimonialsBlock,
    propsMapper: (block, service, fonts, handlers) => ({
      testimonials: block.data?.testimonials || handlers.allTestimonials || (Array.isArray(service.testimonials) ? service.testimonials : []),
      s: service,
      fonts,
    }),
  },
  providers: {
    Component: ProvidersBlock,
    propsMapper: (block, service, fonts, handlers) => ({
      providers: (Array.isArray(handlers.staff) && handlers.staff.length > 0)
        ? handlers.staff
        : (block.data?.providers || (Array.isArray(service.providers) ? service.providers : [])),
      s: service,
      fonts,
    }),
  },
  prep_aftercare: {
    Component: PrepAftercareBlock,
    propsMapper: (block, service, fonts) => ({
      prepAftercare: block.data?.prepAftercare || service.prepAftercare,
      fonts,
    }),
  },
  cta: {
    Component: CTABlock,
    propsMapper: (block, service, fonts, handlers) => ({
      content: block.content || {},
      variant: block.variant || 'book_service',
      service,
      fonts,
      onBook: handlers.onBook,
      onConsult: handlers.onConsult,
      staff: handlers.staff || [],
      locationKey: handlers.locationKey,
    }),
  },
};

export default function BlockRenderer({ blocks, service, fonts, handlers }) {
  if (!blocks?.length) return null;

  return blocks.map((block) => {
    const entry = BLOCK_MAP[block.blockType];
    if (!entry) return null;

    const props = entry.propsMapper(block, service, fonts, handlers || {});
    return <entry.Component key={block.id} {...props} />;
  });
}
