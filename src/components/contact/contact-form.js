// src/components/contact/ContactForm.js
import Link from 'next/link';
import PropTypes from 'prop-types';
import { AiOutlineRight } from 'react-icons/ai';
import { useState } from 'react';


function ContactForm({ contactItems }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = contactItems?.[activeIndex] || {};

  return (
    <div className="contact-area md:pt-[145px] pt-[45px] border-[#595959] border-opacity-30 border-b md:pb-160 pb-[60px]">
      <div className="container">
        {/* Location Switcher */}
        <div className="flex gap-3 mb-8">
          {contactItems?.map((loc, i) => (
            <button
              key={loc.slug || i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 rounded-full border text-sm uppercase tracking-wide transition ${
                i === activeIndex
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-[#969696] hover:border-black'
              }`}
            >
              {loc.switcherLabel || loc.title}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-5">
          {/* Left: Active location info */}
          <div className="contact-info lg:col-span-2 lg:pr-[15px]">
            <h2 className="text-[40px] md:text-[48px] left-[58px] md:pb-[20px] pb-[10px]">
              {active.title}
            </h2>

            {active.subTitle && (
              <h3
                className="text-3xl leading-9 font-semibold"
                dangerouslySetInnerHTML={{ __html: active.subTitle }}
              />
            )}

            <ul className="text-[14px] leading-[27px] text-secondary pt-6">
              {active.address && (
                <li className="pb-[15px] max-w-[320px]">
                  <Link
                    href={active.mapLink || `https://maps.apple.com/?q=${encodeURIComponent(active.address)}`}
                    target="_blank"
                  >
                    {active.address}
                  </Link>
                </li>
              )}

              {active.hours && (
                <li className="pb-[15px] whitespace-pre-line">{active.hours}</li>
              )}

              {active.contactNumber && (
                <li className="pb-[15px]">
                  <a href={active.contactNumberPath || `tel:${active.contactNumber.replace(/\D/g, '')}`}>
                    {active.contactNumber}
                  </a>
                </li>
              )}

              {active.contactEmail && (
                <li>
                  <a href={active.contactEmailPath || `mailto:${active.contactEmail}`}>
                    {active.contactEmail}
                  </a>
                </li>
              )}
            </ul>

            {active.infoButtonText && (
              <div className="button-wrap pt-[40px] md:pt-[60px]">
                <Link
                  href={active.infoButtonHref || '/contact'}
                  className="inline-flex items-center text-[14px] leading-[30px] p-[11px_32px] transition duration-[0.4s] border border-[#969696] uppercase hover:border-black hover:bg-black hover:text-white"
                >
                  {active.infoButtonText}
                  <div className="ml-[5px]">
                    <AiOutlineRight />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="contact-form lg:col-span-3 max-md:pt-[50px]">
            <h2 className="text-[18px] leading-[22px] uppercase md:mb-[40px] mb-[25px]">
              {active.formTitle || 'Send us a message'}
            </h2>
            <form>
              {/* Hidden location field for routing or notifications */}
              <input type="hidden" name="location" value={active.slug || active.title || ''} />

              {/* Location selector (visible) so user can change without toggling above */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-xs uppercase tracking-wide text-secondary mb-2">
                  Location
                </label>
                <select
                  id="location"
                  className="w-full border-[#595959] border-opacity-30 border-b focus-visible:outline-0 focus-visible:border-black py-[12px]"
                  value={activeIndex}
                  onChange={(e) => setActiveIndex(Number(e.target.value))}
                >
                  {contactItems?.map((loc, i) => (
                    <option key={loc.slug || i} value={i}>
                      {loc.shortLabel || loc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="lm:flex">
                  <input
                    className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px] lm:mr-[20px]"
                    placeholder="Name"
                    type="text"
                    id="name"
                    name="name"
                    required
                  />
                  <input
                    className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px]"
                    placeholder="Email"
                    type="email"
                    id="email"
                    name="email"
                    required
                  />
                </div>
              </div>

              <div className="mt-[25px]">
                <input
                  className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px]"
                  placeholder="Phone"
                  type="tel"
                  id="phone"
                  name="phone"
                />
              </div>

              <div>
                <textarea
                  className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px] mt-[35px]"
                  placeholder="How can we help?"
                  id="message"
                  name="message"
                  rows="6"
                  required
                />
              </div>

              <div className="mt-[40px]">
                <button type="submit" className="boxed-btn text-[14px] leading-[30px]">
                  {active.formButton || 'Send Message'}
                </button>
              </div>
            </form>

            {/* Optional secondary CTA */}
            {active.secondaryCta && (
              <div className="mt-6 text-sm text-secondary">
                {active.secondaryCta}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ContactForm.propTypes = {
  contactItems: PropTypes.arrayOf(
    PropTypes.shape({
      slug: PropTypes.string,
      title: PropTypes.string.isRequired,
      shortLabel: PropTypes.string,
      switcherLabel: PropTypes.string,
      subTitle: PropTypes.string,
      address: PropTypes.string,
      mapLink: PropTypes.string,
      hours: PropTypes.string,
      contactNumber: PropTypes.string,
      contactNumberPath: PropTypes.string,
      contactEmail: PropTypes.string,
      contactEmailPath: PropTypes.string,
      infoButtonText: PropTypes.string,
      infoButtonHref: PropTypes.string,
      formTitle: PropTypes.string,
      formButton: PropTypes.string,
      secondaryCta: PropTypes.string,
    })
  ).isRequired,
};

export default ContactForm;
