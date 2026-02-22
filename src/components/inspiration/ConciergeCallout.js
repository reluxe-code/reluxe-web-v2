import Link from 'next/link'

export default function ConciergeCallout({ logged_in_text, guest_text, cta_href = '/book', isLoggedIn }) {
  const text = isLoggedIn ? (logged_in_text || 'Ready to book your next treatment?') : (guest_text || 'Want personalized recommendations? Book a free consultation.')

  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-center">
      <p className="text-white text-sm font-medium mb-3">{text}</p>
      <Link
        href={cta_href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
      >
        {isLoggedIn ? 'Book Now' : 'Get Started'}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  )
}
