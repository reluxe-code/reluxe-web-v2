// components/ContactForm.jsx
import Link from 'next/link';
import PropTypes from 'prop-types';
import { AiOutlineRight } from 'react-icons/ai';
import { useState } from 'react';

function ContactForm({ contactItems = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = contactItems?.[activeIndex] || {};

  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.name || form.name.trim().length < 2) return 'Please enter your full name';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    if (form.phone && !/^[0-9+()\-.\s]{7,20}$/.test(form.phone)) return 'Please enter a valid phone';
    if (!form.message || form.message.trim().length < 10) return 'Please add a bit more detail in your message';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'submitting', message: '' });

    const v = validate();
    if (v) { setStatus({ state: 'error', message: v }); return; }

    try {
      const payload = {
        ...form,
        location: active.slug || active.title || '',
        // recaptcha fields removed
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Failed to submit');

      setStatus({ state: 'success', message: 'Thanks! We received your message and will reply shortly.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="contact-area md:pt-[145px] pt-[45px] border-[#595959] border-opacity-30 border-b md:pb-160 pb-[60px]">
      <div className="container">
        {contactItems?.length > 1 && (
          <div className="flex gap-3 mb-8">
            {contactItems.map((loc, i) => (
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
        )}

        <div className="lg:grid lg:grid-cols-5">
          {/* Left */}
          <div className="contact-info lg:col-span-2 lg:pr-[15px]">
            {active.title && (
              <h2 className="text-[40px] md:text-[48px] left-[58px] md:pb-[20px] pb-[10px]">
                {active.title}
              </h2>
            )}

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
              {active.hours && <li className="pb-[15px] whitespace-pre-line">{active.hours}</li>}
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
                  <span className="ml-[5px]" aria-hidden="true">
                    <AiOutlineRight />
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="contact-form lg:col-span-3 max-md:pt-[50px]">
            <h2 className="text-[18px] leading-[22px] uppercase md:mb-[40px] mb-[25px]">
              {active.formTitle || 'Send us a message'}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <input type="hidden" name="location" value={active.slug || active.title || ''} />

              {contactItems?.length > 1 && (
                <div className="mb-6">
                  <label htmlFor="cf-location" className="block text-xs uppercase tracking-wide text-secondary mb-2">
                    Location
                  </label>
                  <select
                    id="cf-location"
                    className="w-full border-[#595959] border-opacity-30 border-b focus-visible:outline-0 focus-visible:border-black py-[12px]"
                    value={activeIndex}
                    onChange={(e) => setActiveIndex(Number(e.target.value))}
                  >
                    {contactItems.map((loc, i) => (
                      <option key={loc.slug || i} value={i}>
                        {loc.shortLabel || loc.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="lg:flex">
                <div className="lg:mr-[20px] lg:w-1/2 w-full">
                  <label htmlFor="cf-name" className="sr-only">Name</label>
                  <input
                    id="cf-name"
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={setField('name')}
                    required
                    className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px]"
                  />
                </div>
                <div className="lg:w-1/2 w-full">
                  <label htmlFor="cf-email" className="sr-only">Email</label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={setField('email')}
                    required
                    className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px]"
                  />
                </div>
              </div>

              <div className="mt-[25px]">
                <label htmlFor="cf-phone" className="sr-only">Phone</label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={setField('phone')}
                  className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px]"
                />
              </div>

              <div>
                <label htmlFor="cf-message" className="sr-only">How can we help?</label>
                <textarea
                  id="cf-message"
                  name="message"
                  rows={6}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={setField('message')}
                  required
                  className="w-full border-[#595959] border-opacity-30 border-b focus-visible:placeholder:text-black focus-visible:outline-0 focus-visible:border-black py-[15px] mt-[35px]"
                />
              </div>

              {/* Status */}
              {status.state !== 'idle' && (
                <p
                  className={`mt-4 text-sm ${
                    status.state === 'success' ? 'text-green-600' : status.state === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}
                  role={status.state === 'error' ? 'alert' : undefined}
                >
                  {status.message}
                </p>
              )}

              <div className="mt-[40px]">
                <button
                  type="submit"
                  disabled={status.state === 'submitting'}
                  className="boxed-btn text-[14px] leading-[30px] disabled:opacity-60"
                >
                  {status.state === 'submitting' ? 'Sending…' : (active.formButton || 'Send Message')}
                </button>
              </div>
            </form>

            {active.secondaryCta && <div className="mt-6 text-sm text-secondary">{active.secondaryCta}</div>}
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
  ),
};

export default ContactForm;
