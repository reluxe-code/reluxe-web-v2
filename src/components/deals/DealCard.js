/**
 * Props match your previous data shape (with graceful fallbacks):
 * - title        (string)  -> main headline
 * - subtitle     (string)  -> eyebrow (top small heading)
 * - price        (string)  -> big centered number/text (e.g., "$999", "10% OFF")
 * - tag          (string)  -> dark pill under the big number (e.g., "+ 50% OFF ADD-ONS!")
 * - description  (string)  -> split into lines/bullets automatically
 * - ctaText      (string)  -> button label
 * - link         (string)  -> button href
 */
function splitLines(s = '') {
  if (!s) return [];
  // split by newlines, bullets, or sentence-ish breaks
  return s
    .split(/\n|•|–|-{2,}|\. (?=[A-Z(])/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function DealCard({
  title = 'Promotion',
  subtitle = '',
  price = '',
  tag = '',
  description = '',
  ctaText = 'Book Now',
  link = '/contact',
}) {
  const lines = splitLines(description);

  return (
    <article
      className="
        group relative flex h-full flex-col items-center text-center
        rounded-[28px] bg-white p-8 md:p-10
        ring-1 ring-black/5 shadow-[0_14px_40px_rgba(16,24,40,.06)]
        transition-all duration-300 hover:-translate-y-0.5
      "
    >

      {/* eyebrow */}
      {subtitle && (
        <div className="mb-1">
          <span className="inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-[13px] font-bold tracking-wider text-slate-700">
            {subtitle.toUpperCase()}
          </span>
        </div>
      )}

      {/* headline */}
      <h3 className="text-[16px] md:text-[18px] font-extrabold tracking-wide text-[#0B1522]">
        {title}
      </h3>

      {/* big price/percent */}
      {price && (
        <div className="mt-4 text-[34px] md:text-[42px] leading-none font-extrabold text-black">
          {price}
        </div>
      )}

      {/* dark chip */}
      {tag && (
        <div className="mt-4">
          <span
            className="
              inline-flex items-center rounded-2xl
              bg-[#0B1522] px-6 py-3 text-white text-base md:text-lg font-semibold
              shadow-sm
            "
          >
            {tag}
          </span>
        </div>
      )}

      {/* bullets/lines */}
      {!!lines.length && (
        <ul className="mt-6 space-y-2 text-[12px] leading-7 font-semibold text-slate-600 uppercase">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}

      <div className="grow" />

      {/* CTA */}
      <a
        href={link}
        className="
          mt-8 inline-flex w-full items-center justify-center
          rounded-[18px] bg-black px-2 py-5
          text-white text-lg font-semibold
          shadow-lg shadow-black/10 transition
          hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-black/30
        "
      >
        {ctaText} <span aria-hidden className="ml-2">↗</span>
      </a>
    </article>
  );
}
