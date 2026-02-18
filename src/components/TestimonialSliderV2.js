// components/TestimonialSlider.js
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import * as AiIcons from 'react-icons/ai';
import { FaQuoteRight } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { Slide } from '@/components/swiper';

// only load Swiper on the client
const SwiperComps = dynamic(() => import('@/components/swiper'), { ssr: false });

export default function TestimonialSlider({
  testimonialTitle = 'Hear from our happy patients',
  providerFilter,
  serviceFilter,
  locationFilter,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error: sbError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('status', 'published');

        if (sbError) throw sbError;

        setItems(
          (data || []).map((t) => ({
            provider: t.staff_name || t.author_name,
            month: '',
            service: '',
            location: '',
            review: t.quote,
            stars: t.rating || 5,
          }))
        );
      } catch (e) {
        setError(e.message || 'Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  if (loading) return <p>Loading testimonials…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const filtered = items.filter((item) => {
    return (
      (!providerFilter || item.provider === providerFilter) &&
      (!serviceFilter  || item.service   === serviceFilter)  &&
      (!locationFilter || item.location  === locationFilter)
    );
  });

  const settings = {
    pagination: false,
    spaceBetween: 30,
    slidesPerView: 2,
    navigation: { prevEl: '.prev-arrow', nextEl: '.next-arrow' },
    loop: true,
    observer: true,
    observeParents: true,
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 } },
  };

  return (
    <section className="testimonial-area bg-azure pb-40">
      <div className="container">
        <div className="flex items-center justify-between mb-[65px]">
          <h2 className="testimonial-title font-bold text-3xl">
            {testimonialTitle}
          </h2>
          <div className="swiper-button-wrap flex cursor-pointer text-[#999999] text-[30px]">
            <div className="prev-arrow mr-[10px] hover:text-black">
              <AiIcons.AiOutlineLeft />
            </div>
            <div className="next-arrow hover:text-black">
              <AiIcons.AiOutlineRight />
            </div>
          </div>
        </div>

        <SwiperComps sliderCName="relative" settings={settings}>
          {filtered.map((item, i) => (
            <Slide key={i}>
              <div className="testimonial-block h-full">
                <div className="inner-box h-full flex flex-col justify-between relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all before:absolute before:top-0 before:left-0 before:w-full before:h-[5px] before:bg-primary before:transition-transform before:duration-500 before:scale-0 hover:before:scale-100">
                  <div>
                    <div className="quote flex justify-end text-[#f7c46c] text-[30px] leading-[60px] py-[10px]">
                      <FaQuoteRight />
                    </div>
                    <h2 className="testimonial-author font-semibold text-lg">
                      {item.provider}
                      {(item.month || item.service) && (
                        <span className="occupation block text-gray-500 text-sm font-normal">
                          {item.month && `${item.month}${item.service ? ' — ' : ''}`}
                          {item.service}
                        </span>
                      )}
                    </h2>
                    <p className="testimonial-feedback text-gray-600 italic mt-2 min-h-[60px]">
                      &ldquo;{item.review}&rdquo;
                    </p>
                  </div>
                  <div className="flex mt-4 text-yellow-400 text-md">
                    {[...Array(item.stars)].map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            </Slide>
          ))}
        </SwiperComps>
      </div>
    </section>
  );
}

TestimonialSlider.propTypes = {
  testimonialTitle: PropTypes.string,
  providerFilter:   PropTypes.string,
  serviceFilter:    PropTypes.string,
  locationFilter:   PropTypes.string,
};
