// components/team/HeroSplitSection.js

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import PropTypes from 'prop-types'

const ICON_MAP = {
  instagram: ['fab', 'instagram'],
  tiktok: ['fab', 'tiktok'],
  facebook: ['fab', 'facebook-f'],
  linkedin: ['fab', 'linkedin-in'],
  youtube: ['fab', 'youtube'],
  twitter: ['fab', 'twitter'], // or ['fab', 'x-twitter'] if you’ve loaded it
  website: ['fas', 'globe'],
  site: ['fas', 'globe'],
}

const BOOK_WESTFIELD_DEFAULT = '/book/westfield'
const BOOK_CARMEL_DEFAULT    = '/book/carmel'

// Persist the user's intended location so any global picker/cookie is overridden.
function setForcedLocation(loc) {
  try { localStorage.setItem('reluxe.location', loc) } catch {}
  try { document.cookie = `reluxe_location=${loc}; path=/; max-age=31536000` } catch {}
}

function getFlagsFromLocations(locations) {
  const list = Array.isArray(locations) ? locations : (locations ? [locations] : [])
  let carmel = false
  let westfield = false
  for (const l of list) {
    const s = String(l?.slug || l?.title || '').toLowerCase()
    if (s.includes('carmel')) carmel = true
    if (s.includes('westfield')) westfield = true
  }
  return { carmel, westfield }
}

export default function HeroSplitSection({
  name,
  subtitle = '',
  bio,
  imageUrl,

  // New props:
  locations = [],                // pass ACF relationship field here
  bookCarmelUrl = BOOK_CARMEL_DEFAULT,
  bookWestfieldUrl = BOOK_WESTFIELD_DEFAULT,

  // Kept for compatibility (ignored for main booking button behavior)
  bookingUrl = '',               // will be ignored in favor of location logic
  consultationUrl = '',

  socials = [],
}) {
  const truncatedBio =
    bio?.length > 280 ? bio.slice(0, 280).trimEnd() + '…' : bio || ''

  const normalizedSocials = Array.isArray(socials)
    ? socials
        .filter(s => s?.url)
        .map((s) => {
          const label = String(s.label || '').toLowerCase()
          const key =
            Object.keys(ICON_MAP).find(k => label.includes(k)) || 'website'
          return { ...s, _icon: ICON_MAP[key], _label: label || 'social' }
        })
    : []

  const { carmel, westfield } = getFlagsFromLocations(locations)

  return (
    <section className="w-full bg-azure">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left Text Content */}
        <div className="w-full md:w-1/2 pt-20 flex items-center">
          <div className="max-w-2xl mx-auto text-center md:text-left">
            <h1 className="text-5xl font-extrabold flex items-center justify-center md:justify-start gap-3 leading-none mb-2">
              {name}

              {/* Dynamic socials */}
              {normalizedSocials.length > 0 && (
                <div className="flex gap-3 text-gray-500 text-xl">
                  {normalizedSocials.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition"
                      aria-label={s.label || 'social link'}
                      style={{ fontSize: '1.25rem' }} // ~20px
                    >
                      <FontAwesomeIcon icon={s._icon || ['fas', 'link']} />
                    </a>
                  ))}
                </div>
              )}
            </h1>

            {subtitle ? (
              <h3 className="text-2xl font-semibold text-gray-700 leading-none mb-4">
                {subtitle}
              </h3>
            ) : null}

            <div className="pl-4 border-l-4 border-gray-300">
              <p className="text-md text-gray-600 leading-relaxed">{truncatedBio}</p>
            </div>

            {/* Booking buttons based on locations */}
            {(carmel || westfield || consultationUrl) && (
              <div className="pt-8 flex justify-left flex-wrap gap-4 mb-10">
                {carmel && (
                  <Link
                    href={bookCarmelUrl || BOOK_CARMEL_DEFAULT}
                    onClick={() => setForcedLocation('carmel')}
                    className="bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book in Carmel
                  </Link>
                )}

                {westfield && (
                  <Link
                    href={bookWestfieldUrl || BOOK_WESTFIELD_DEFAULT}
                    onClick={() => setForcedLocation('westfield')}
                    className="bg-white border border-black px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book in Westfield
                  </Link>
                )}

                {consultationUrl && (
                  <Link
                    href={consultationUrl}
                    className="bg-white border border-black px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Consultation
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 relative">
          <img
            src={imageUrl || '/images/placeholder.png'}
            alt={name || 'Team member'}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  )
}

HeroSplitSection.propTypes = {
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  bio: PropTypes.string,
  imageUrl: PropTypes.string,

  // New props for location-aware booking
  locations: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        slug: PropTypes.string,
        title: PropTypes.string,
      })
    ),
    PropTypes.shape({
      slug: PropTypes.string,
      title: PropTypes.string,
    }),
  ]),
  bookCarmelUrl: PropTypes.string,
  bookWestfieldUrl: PropTypes.string,

  // Legacy props kept for compatibility
  bookingUrl: PropTypes.string,
  consultationUrl: PropTypes.string,

  socials: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
    })
  ),
}
