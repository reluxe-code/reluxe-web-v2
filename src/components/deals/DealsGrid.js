import DealCard from './DealCard';

/**
 * Map your legacy/normalized deal shape to the new card props.
 * Works with fields on the object OR falls back to raw.acf.
 */
const mapLegacyDealToCard = (d = {}) => {
  const acf = d.raw?.acf || {};

  return {
    id: d.id ?? d.slug ?? crypto.randomUUID(),

    // previous fields (preferred)
    title: d.title || acf.offer_name || 'Promotion',
    subtitle: d.subtitle || acf.offer_name || '',
    price: d.price || acf.offer_price || '',         // e.g. "$999" / "10% OFF"
    tag: d.tag || acf.offer_savings || '',           // e.g. "+ 50% OFF ADD-ONS!"
    description:
      d.description ||
      d.offer_short_description ||
      acf.offer_short_description ||
      d.summary ||
      acf.description ||
      '',

    // CTA
    ctaText: d.ctaText || 'Book Now',
    link: d.bookingUrl || acf.booking_link || d.link || '/contact',
  };
};

export default function DealsGrid({ deals = [] }) {
  const items = (Array.isArray(deals) ? deals : []).map(mapLegacyDealToCard);

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold">No active promotions right now.</p>
        <p className="mt-2 text-neutral-600">Check back soon—we’re always adding new specials.</p>
      </div>
    );
  }

  return (
    <div
      className="
        grid gap-6 lg:gap-8
        md:grid-cols-2 lg:grid-cols-2
        auto-rows-fr items-stretch
      "
    >
      {items.map((deal) => (
        <DealCard key={deal.id} {...deal} />
      ))}
    </div>
  );
}
