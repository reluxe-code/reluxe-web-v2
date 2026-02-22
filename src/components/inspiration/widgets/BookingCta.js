import Link from 'next/link'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function BookingCta({ config, articleSlug }) {
  const { text = 'Book Your Appointment', href = '/book', variant = 'primary', subtext } = config || {}

  const handleClick = () => {
    trackWidgetEvent('booking_cta_click', 'BookingCta', articleSlug, { text, href, variant })
  }

  return (
    <div className="my-8 text-center">
      <div className={`inline-block rounded-2xl p-8 ${
        variant === 'primary'
          ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
          : 'bg-neutral-50 border'
      }`}>
        <Link
          href={href}
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
            variant === 'primary'
              ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {text}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {subtext && (
          <p className={`text-xs mt-3 ${variant === 'primary' ? 'text-white/70' : 'text-neutral-400'}`}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
