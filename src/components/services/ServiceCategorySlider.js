// components/ser/ServiceCategorySlider.js
import PropTypes from 'prop-types'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Slide } from '@/components/swiper'
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai'

const SwiperComps = dynamic(() => import('@/components/swiper'), { ssr: false })

export default function ServiceCategorySlider({ items = [], showOnlyFeatured = false }) {
  const filteredItems = showOnlyFeatured ? items.filter(item => item.featured) : items

  const settings = {
    pagination: false,
    spaceBetween: 24,
    slidesPerView: 3,
    navigation: {
      prevEl: '.prev-arrow',
      nextEl: '.next-arrow'
    },
    breakpoints: {
      0: { slidesPerView: 2 },
      640: { slidesPerView: 3 },
      1024: { slidesPerView: 5 }
    },
    loop: true
  }

  return (
    <section className="py-16 bg-azure">
      <div className="container px-6 mx-auto">
        <div className="flex justify-between items-center mb-10">
          <header className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              EXPLORE OUR{' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                SERVICES
              </span>{' '}
            </h2>
          </header>
          <div className="swiper-button-wrap flex gap-4 text-gray-500 text-2xl">
            <div className="swiper-button prev-arrow hover:text-black cursor-pointer">
              <AiOutlineLeft />
            </div>
            <div className="swiper-button next-arrow hover:text-black cursor-pointer">
              <AiOutlineRight />
            </div>
          </div>
        </div>

        <SwiperComps sliderCName="relative" settings={settings}>
          {filteredItems.map((item, idx) => (
            <Slide key={idx}>
              <Link href={item.href} className="block text-center group">

                <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg bg-white mb-4">
                  <img
                    src={item.image}
                    alt={`${item.title} at RELUXE Med Spa in Westfield & Carmel, IN`}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition duration-300 ease-in-out"
                  />
                  {item.popular && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-800 group-hover:text-reluxeGold transition">
                  {item.title}
                </h3>
                {item.startingAt && (
                  <p className="text-sm text-gray-500 mt-1">Starting at {item.startingAt}</p>
                )}

              </Link>
            </Slide>
          ))}
        </SwiperComps>
      </div>
    </section>
  );
}

ServiceCategorySlider.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      featured: PropTypes.bool
    })
  ),
  showOnlyFeatured: PropTypes.bool
}
