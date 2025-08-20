// components/team/MoreAboutMeSection.js

import { useState } from 'react'

export default function MoreAboutMeSection({
  credentials = [],
  availability = [],
  locations = [],
  longBio = '',
  whyMe = '',
  specialties = [],
  contactNote = ''
}) {
  const [showFullBio, setShowFullBio] = useState(false)
  const truncatedBio =
    longBio.length > 200 ? longBio.slice(0, 200) + '...' : longBio

  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <h2 className="text-4xl font-bold text-center">More About Me</h2>

        {/* Bio + Why Me */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* My Story */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">My Story</h3>
            <div
              className="text-gray-700 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: showFullBio ? longBio : truncatedBio
              }}
            />
            {longBio.length > 200 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-2 text-sm text-reluxeGold hover:underline font-medium"
              >
                {showFullBio ? 'View less' : 'View more'}
              </button>
            )}
          </div>

          {/* Why Me */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Why come to me?</h3>
            <p className="text-gray-700 leading-relaxed">{whyMe}</p>
          </div>
        </div>

        {/* Credentials + Availability + Locations */}
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-bold text-reluxeGold mb-2">Credentials</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {credentials.map((cred, i) => (
                <li key={i}>{cred}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-reluxeGold mb-2">Availability</h4>
            <ul className="space-y-1 text-gray-700">
              {availability.map((a, i) => (
                <li key={i}>
                  <span className="font-medium">{a.day}</span>: {a.hours}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-reluxeGold mb-2">Locations</h4>
            <ul className="space-y-1 text-gray-700">
              {locations.map((loc, i) => (
                <li key={i}>{loc}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-reluxeGold mb-2">My Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec, i) => (
                <span
                  key={i}
                  className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-800"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Blurb */}
        {contactNote && (
          <div className="mt-6 bg-azure p-4 rounded-lg text-center text-gray-800 italic shadow">
            {contactNote}
          </div>
        )}
      </div>
    </section>
  )
}
