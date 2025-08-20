// components/team/ServiceSlider.js
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide as Slide } from 'swiper/react'
import 'swiper/css'

export default function ServiceSlider({ brandItems = [], settings }) {
  return (
    <div className="brand-area bg-white">
      <div className="container">
        <div className="columns-1 md:py-[35px]">
          <Swiper {...settings}>
            {brandItems.map((brandItem) => (
              <Slide key={brandItem.id}>
                <div className="brand-item">
                  <div className="w-[210px] mx-auto">
                    <Link href={brandItem.href || '#'}>

                      <Image
                        src={brandItem.clientimage}
                        alt={brandItem.title}
                        width={210}
                        height={70}
                        layout="responsive"
                        quality={70}
                      />

                    </Link>
                  </div>
                </div>
              </Slide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
