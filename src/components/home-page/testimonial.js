// components/TestimonialSlider.js
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'
import * as AiIcons from 'react-icons/ai'
import { FaQuoteRight } from 'react-icons/fa'
import { Slide } from '@/components/swiper'

const SwiperComps = dynamic(() => import('@/components/swiper'), { ssr: false })

export default function TestimonialSlider({
  testimonialItems = [],
  testimonialTitle = '+1,250 Happy Clients',
  providerFilter,
  serviceFilter,
  locationFilter,
}) {
  const filteredItems = testimonialItems.filter((item) => {
    const matchProvider = providerFilter ? item.provider === providerFilter : true
    const matchService = serviceFilter ? item.service === serviceFilter : true
    const matchLocation = locationFilter ? item.location === locationFilter : true
    return matchProvider && matchService && matchLocation
  })

  const settings = {
    pagination: false,
    spaceBetween: 30,
    slidesPerView: 2,
    navigation: {
      prevEl: '.prev-arrow',
      nextEl: '.next-arrow',
    },
    updateOnWindowResize: true,
    loop: true,
    observer: true,
    observeParents: true,
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
    },
  }

  return (
    <section className="testimonial-area bg-azure py-20">
      <div className="container">
        <div className="grid-cols-1">
          <div className="flex items-center justify-between mb-[65px]">
            <h2 className="testimonial-title font-bold text-3xl">
              {testimonialTitle}
            </h2>
            <div className="swiper-button-wrap flex cursor-pointer text-[#999999] text-[30px]">
              <div className="swiper-button prev-arrow transition-all hover:text-black mr-[10px]">
                <AiIcons.AiOutlineLeft />
              </div>
              <div className="swiper-button next-arrow transition-all hover:text-black">
                <AiIcons.AiOutlineRight />
              </div>
            </div>
          </div>

          <SwiperComps sliderCName="relative" settings={settings}>
            {filteredItems.map((item, i) => (
              <Slide key={i}>
                <div className="testimonial-block">
                  <div className="inner-box relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all before:absolute before:top-0 before:left-0 before:w-full before:h-[5px] before:bg-primary before:transition-transform before:duration-500 before:scale-0 hover:before:scale-100">
                    <div className="quote flex justify-end text-[#f7c46c] text-[30px] leading-[60px] py-[10px]">
                      <FaQuoteRight />
                    </div>
                    <h2 className="testimonial-author font-semibold text-lg">
                      {item.provider}
                      <span className="occupation block text-gray-500 text-sm font-normal">
                        {item.month} — {item.service}
                      </span>
                    </h2>
                    <p className="testimonial-feedback text-gray-600 italic mt-2">
                      "{item.review}"
                    </p>
                    <div className="flex mt-4 text-yellow-400 text-md">
                      {[...Array(item.stars || 5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Slide>
            ))}
          </SwiperComps>
        </div>
      </div>
    </section>
  )
}

TestimonialSlider.propTypes = {
  testimonialItems: PropTypes.arrayOf(
    PropTypes.shape({
      provider: PropTypes.string.isRequired,
      month: PropTypes.string.isRequired,
      review: PropTypes.string.isRequired,
      stars: PropTypes.number,
      service: PropTypes.string.isRequired,
      location: PropTypes.string,
    })
  ),
  testimonialTitle: PropTypes.string,
  providerFilter: PropTypes.string,
  serviceFilter: PropTypes.string,
  locationFilter: PropTypes.string,
}
