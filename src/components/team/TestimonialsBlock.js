// components/team/TestimonialsBlock.js

export default function TestimonialsBlock({ testimonials }) {
  if (!testimonial || testimonial.length === 0) return null

  return (
    <section className="bg-[#f2f6f6] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>

        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-xl shadow-md p-8 overflow-hidden"
            >
              <div className="absolute top-6 right-6 text-yellow-300 text-5xl font-serif leading-none">
                &rdquo;
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {t.title || 'Anonymous'}{' '}
                <span className="text-gray-500 font-normal italic">
                  {t.testimonialFields?.subtitle && `/ ${t.testimonialFields.subtitle}`}
                </span>
              </h3>

              <p className="text-gray-700 leading-relaxed mt-4 whitespace-pre-wrap">
                {t.content?.replace(/<\/?[^>]+(>|$)/g, '')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
