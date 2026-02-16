// src/components/locations/LocationsBlock.js
import { FaMapMarkerAlt, FaPhoneAlt, FaInfoCircle } from 'react-icons/fa'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Link from 'next/link'

const locations = [
  {
    name: 'Westfield',
    addressLines: ['514 E State Road 32', 'Westfield, IN 46074'],
    streetAddress: '514 E State Road 32',
    city: 'Westfield',
    region: 'IN',
    postalCode: '46074',
    hours: 'Mon, Tue, Wed, Fri: 9a-5p · Thu 9a-7p · Sat: 9a–3p',
    mapImage: '/images/locations/westfield-map.png',
    locationImage: '/images/locations/westfield-building.png',
    phone: '317-763-1142',
    url: '/locations/westfield',
    serving: ['Westfield', 'Noblesville', 'Hamilton County', 'North Indy Suburbs'],
    geo: { lat: 40.04298, lng: -86.12955 }
  },
  {
    name: 'Carmel · House of Health',
    addressLines: ['10485 N Pennsylvania St', 'Carmel, IN 46280'], // keep ZIP consistent site-wide
    streetAddress: '10485 N Pennsylvania St',
    city: 'Carmel',
    region: 'IN',
    postalCode: '46280',
    hours: 'Mon-Fri: 8a–5p · Sat: Appointment Only',
    mapImage: '/images/locations/carmel-map.png',
    locationImage: '/images/locations/carmel-building.png',
    phone: '317-763-1142',
    url: '/locations/carmel',
    serving: ['Carmel', 'Zionsville', 'Fishers', 'North Indianapolis', 'Meridian-Kessler'],
    geo: { lat: 39.94054, lng: -86.16063 }
  }
]

export default function LocationsBlock() {
  const router = useRouter()

  const handleCardNav = (e, href) => {
    // Avoid triggering when clicking the icon bar
    router.push(href)
  }

  const onKeyActivate = (e, href) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(href)
    }
  }

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
       <header className="mx-auto mb-10 max-w-3xl text-center">
       <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            NEW SERVING{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
             WESTFIELD & CARMEL
            </span>{' '}
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc, idx) => {
            const localBusinessSchema = {
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": `RELUXE Med Spa - ${loc.city}`,
              "image": `https://reluxemedspa.com${loc.locationImage}`,
              "url": `https://reluxemedspa.com${loc.url}`,
              "telephone": `+1-${loc.phone.replace(/[^0-9]/g, '')}`,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": loc.streetAddress,
                "addressLocality": loc.city,
                "addressRegion": loc.region,
                "postalCode": loc.postalCode,
                "addressCountry": "US"
              },
              "geo": { "@type": "GeoCoordinates", "latitude": loc.geo.lat, "longitude": loc.geo.lng },
              "openingHours": loc.hours.replace('·', '-'),
              "areaServed": loc.serving
            }

            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                role="link"
                tabIndex={0}
                aria-label={`${loc.name} — view location details`}
                onClick={(e) => handleCardNav(e, loc.url)}
                onKeyDown={(e) => onKeyActivate(e, loc.url)}
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={loc.locationImage}
                    alt={`${loc.name} Location`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={idx === 0}
                  />
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      <span className="hover:underline">{loc.name}</span>
                    </h3>

                    <address className="not-italic text-lg text-gray-600 whitespace-pre-line">
                      {loc.addressLines.join('\n')}
                    </address>

                    <p className="text-sm text-gray-400 italic mt-1">{loc.hours}</p>

                    {loc.serving?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Serving: {loc.serving.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Icon bar — stop click from bubbling so icons keep their own actions */}
                  <div
                    className="flex justify-around text-reluxeGold text-lg mt-4"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.streetAddress}, ${loc.city}, ${loc.region} ${loc.postalCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${loc.name} in Google Maps`}
                      className="p-2 rounded hover:bg-white/60"
                    >
                      <FaMapMarkerAlt className="text-2xl" />
                    </a>

                    <a
                      href={`tel:${loc.phone.replace(/[^0-9]/g, '')}`}
                      aria-label={`Call ${loc.name}`}
                      className="p-2 rounded hover:bg-white/60"
                    >
                      <FaPhoneAlt className="text-2xl" />
                    </a>

                    <Link
                      href={loc.url}
                      aria-label={`More info about ${loc.name}`}
                      className="p-2 rounded hover:bg-white/60"
                    >
                      <FaInfoCircle className="text-2xl" />
                    </Link>
                  </div>
                </div>

                {/* Per-location LocalBusiness JSON-LD */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
