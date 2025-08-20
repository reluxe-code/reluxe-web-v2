// components/team/TeamHeroHeader.js

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faInstagram,
  faTiktok,
  faFacebookF,
} from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'

export default function TeamHeroHeader({ name, role, shortBio, bookingUrl, consultUrl, socials = [] }) {
  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-5xl font-bold mb-2">{name}</h1>
        {role && <h2 className="text-5xl font-bold text-gray-700 mb-6">{role}</h2>}

        {/* Bio */}
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          {shortBio}
        </p>

        {/* Buttons */}
        <div className="flex justify-center flex-wrap gap-4 mb-10">
          <Link
            href={bookingUrl || '#'}
            passHref
            className="bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
            target="_blank"
            rel="noopener noreferrer">
            
              Book Service
            
          </Link>
          <Link
            href={consultUrl || '#'}
            passHref
            className="bg-white border border-black px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            target="_blank"
            rel="noopener noreferrer">
            
              Book Consultation
            
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          {socials.map((s, idx) => {
            const icon =
              s.label === 'Instagram'
                ? faInstagram
                : s.label === 'TikTok'
                ? faTiktok
                : faFacebookF

            return (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 border border-black flex items-center justify-center rounded-sm hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon='faInstagram' className="text-xl text-black" />
              </a>
            )
          })}
        </div>
      </div>
    </section>
  );
}
