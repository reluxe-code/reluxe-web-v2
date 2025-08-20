// src/components/gallery/ResultsSection.js
import Link from 'next/link'
import PropTypes from 'prop-types'
import ResultsCarouselSingle from './ResultsCarouselSingle'

export default function ResultsSection({ providerSlug = 'default' }) {
  return (
    <section className="w-full py-14 md:py-16 bg-white">
      <div
        className="
          max-w-7xl mx-auto px-4
          grid lg:grid-cols-3 gap-8 md:gap-12
          items-start lg:items-center
          lg:min-h-[500px]
        "
      >
        {/* Left Text */}
        <div className="lg:col-span-1 lg:flex lg:flex-col lg:justify-center">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-[1.05] text-gray-900 mb-6 text-right">
            Amazing results
            <br />for our amazing patients.
          </h2>
          <Link
            href="#"
            className="inline-block text-reluxeGold font-semibold border-b border-reluxeGold hover:opacity-75 transition book text-right"
          >
            Book Now →
          </Link>
        </div>

        {/* Right: smaller square infinite slider */}
        <div className="lg:col-span-2 flex justify-center">
          <ResultsCarouselSingle providerSlug={providerSlug} autoplayMs={5000} />
        </div>
      </div>
    </section>
  )
}

ResultsSection.propTypes = {
  providerSlug: PropTypes.string,
}
