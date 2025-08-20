// components/HeroOne.js
import Image from 'next/image'
import Link from 'next/link'
import PropTypes from 'prop-types'
import SwiperComps, { Slide } from '../swiper'

// full‐screen image + dark overlay
const heroImageClasses = `
  relative w-full
  md:h-[550px] h-[400px]
  overflow-hidden
  before:absolute before:top-0 before:left-0
  before:w-full before:h-full
  before:bg-black before:opacity-30
  before:z-[1]
`

// two buttons container, bottom‐center
const heroButtonsWrapper = `
  absolute left-1/2 bottom-[10%]
  transform -translate-x-1/2
  flex gap-6 z-[2]
`

export default function HeroOne({ heroItems, settings }) {
  // you can still override Swiper settings from the parent page if needed
  settings = {
    pagination: { clickable: true, type: 'bullets' },
    navigation: false,
    slidesPerView: 1,
    spaceBetween: 0,
  }

  return (
    <SwiperComps sliderCName="hero-area" settings={settings}>
      {heroItems?.map(
        ({ id, image, primaryText, primaryLink, secondaryText, secondaryLink }) => (
          <Slide key={id} className="hero-item">
            <div className={heroImageClasses}>
              <Image
                src={image}
                alt="RELUXE: Luxury Med Spa in Westfield & Carmel, IN | Botox • Facials • Lasers • Massage"
                layout="fill"
                objectFit="cover"
                objectPosition="top center"
                priority
                quality={70}
                className="object-cover object-top"
              />
            </div>

            <div className="absolute left-1/2 bottom-[10%] transform -translate-x-1/2 flex flex-col md:flex-row gap-3 md:gap-6 z-[2] w-[90%] md:w-auto">
              {/* Primary CTA */}
              <Link
                href="/book/"
                className="bg-black border border-black text-white px-6 py-3 text-xl md:text-3xl rounded font-semibold hover:border-white transition w-full md:w-auto text-center"
              >
                Book Now
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/profile"
                className="bg-white border border-white text-black px-6 py-3 text-xl md:text-3xl rounded font-medium hover:border-black transition w-full md:w-auto text-center"
              >
                My Profile
              </Link>
            </div>

          </Slide>
        )
      )}
    </SwiperComps>
  )
}

HeroOne.propTypes = {
  heroItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string.isRequired,
      primaryText: PropTypes.string,
      primaryLink: PropTypes.string,
      secondaryText: PropTypes.string,
      secondaryLink: PropTypes.string,
    })
  ).isRequired,
  settings: PropTypes.object,
}
