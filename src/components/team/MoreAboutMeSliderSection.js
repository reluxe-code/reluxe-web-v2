// components/team/MoreAboutMeSliderSection.js

import PropTypes from 'prop-types'
import { useState } from 'react'
import { Slide } from '@/components/swiper'
import dynamic from 'next/dynamic'
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai'

// Lazy load Swiper
const SwiperComps = dynamic(() => import('@/components/swiper'), { ssr: false })

export default function MoreAboutMeSliderSection({
  title = 'More About Me',
  bio = 'Krista is a Carmel local and graduated from CHS in 2008. She is now a Masters prepared Nurse Practitioner with expertise and passion for aesthetics. She completed her Bachelor of Science in Nursing with a minor in Nutrition while playing 4 years of collegiate volleyball at the University of Southern Indiana. Krista then began her nursing career in the Cardiac Intensive Care Unit, working for 7 years while completing her Masters degree. After passing her NP certification, she worked inpatient for 4 years, specializing in cardiology-electrophysiology for 2 years and, most recently, pulmonary critical care. Krista began her aesthetic career in early 2023 as a nurse practitioner injector after completing a certification course with hands-on experience at the highly accredited National Laser Institute in Scottsdale, Arizona. She then started her own successful concierge injectable business, Shea Aesthetics. She continued to work fulltime as a critical care nurse practitioner while growing her business, client list and gaining experience. In the winter of 2023, she followed her aesthetic passion and pursued her dream of working full-time at Reluxe Med Spa. Continuing education is very important to Krista. She loves exploring new products and learning new techniques to bring the most up-to-date treatment options to the area. Krista is happy to be living where she grew up. She is married to her husband, Jordan, and has two children. Her community is important to her. When not at work, she enjoys spending time with her family, traveling, and golfing. She loves going to sporting events and concerts.',
  items = [],
  backgroundImage = '/images/staff/krista-blur.png'
}) {
  const [expanded, setExpanded] = useState(false)

  const settings = {
    pagination: false,
    spaceBetween: 30,
    slidesPerView: 3,
    navigation: {
      prevEl: '.prev-arrow',
      nextEl: '.next-arrow'
    },
    loop: true,
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  }

  const toggleExpanded = () => setExpanded(!expanded)

  const getBioContent = () => {
    if (!bio) return ''
    if (expanded || bio.length <= 250) return bio
    return bio.slice(0, 250) + '...'
  }

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat py-24 text-white"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold">{title}</h2>
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="bg-white text-gray-800 rounded-xl shadow-md mb-12 p-8 max-w-4xl mx-auto text-lg leading-relaxed">
            <div
              dangerouslySetInnerHTML={{ __html: getBioContent() }}
              className="transition-all duration-300"
            />
            {bio.length > 250 && (
              <button
                onClick={toggleExpanded}
                className="mt-4 text-sm text-reluxeGold hover:underline"
              >
                {expanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        )}

        {/* Slider */}
        <SwiperComps sliderCName="relative" settings={settings}>
          {items.map((item, index) => (
            <Slide key={index}>
              <div className="bg-white text-gray-800 h-full rounded-lg shadow-lg overflow-hidden flex flex-col min-h-[280px]">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                      {item.description}
                    </p>
                  </div>
                  {item.footer && (
                    <div className="mt-4 text-xs text-right text-reluxeGold italic">
                      {item.footer}
                    </div>
                  )}
                </div>
              </div>
            </Slide>
          ))}
        </SwiperComps>
      </div>
    </section>
  )
}

MoreAboutMeSliderSection.propTypes = {
  title: PropTypes.string,
  bio: PropTypes.string, // HTML string from WYSIWYG
  backgroundImage: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      footer: PropTypes.string
    })
  ).isRequired
}
