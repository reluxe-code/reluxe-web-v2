// src/components/layout/Footer.js
import Link from 'next/link';
import * as AiIcons from 'react-icons/ai';
import Image from 'next/image';
import TextListSignupCTA from '@/components/cta/TextListSignupCTA';
import { FiCalendar, FiGrid, FiHeart, FiTag, FiMapPin } from 'react-icons/fi';
import { useRouter } from 'next/router';

// --- Mobile Tab Bar (sticky, black, white icons/text) ---
function MobileTabBar({ isActivePath }) {
  const tabs = [
    { href: '/book',        label: 'Book',      Icon: FiCalendar },
    { href: '/services',    label: 'Services',  Icon: FiGrid },
    { href: '/conditions',  label: 'Treat',     Icon: FiHeart },
    { href: '/deals',      label: 'Offers',    Icon: FiTag },   // update/rename if needed
    { href: '/locations',   label: 'Locations', Icon: FiMapPin },
  ];

  return (
    <>
      {/* spacer so content isn’t hidden behind the fixed bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* fixed at absolute bottom; safe-area aware for iOS */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
        role="navigation"
        aria-label="Primary"
      >
        <div
          className="mx-auto max-w-3xl bg-black text-white ring-1 ring-white/10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.65)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ul className="grid grid-cols-5">
            {tabs.map(({ href, label, Icon }) => {
              const active = isActivePath(href);
              return (
                <li key={href} className="flex">
                  <Link
                    href={href}
                    className={[
                      'flex flex-1 flex-col items-center justify-center gap-1 py-2 min-w-0',
                      active ? 'text-white' : 'text-white/70 hover:text-white',
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={[
                        'relative inline-flex h-6 w-6 items-center justify-center',
                        active ? 'scale-110' : '',
                      ].join(' ')}
                    >
                      <Icon className="h-6 w-6" />
                      {active && (
                        <span
                          className="absolute -top-2 h-1 w-6 rounded-full bg-white/80"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="text-[11px] font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

function Footer() {
  const currentYear = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
  });

  // Active-path helper for MobileTabBar
  const router = useRouter();
  const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';
  const isActivePath = (testPath) => {
    const curr = normalize(router.asPath || router.pathname);
    const test = normalize(testPath);
    if (test === '/') return curr === '/';
    return curr === test || curr.startsWith(`${test}/`);
  };

  return (
    <>
      {/* ——— Newsletter / Text-List Signup CTA ——— */}
      <TextListSignupCTA className="md:pt-[120px]" />

      {/* ——— Actual Footer ——— */}
      <footer className="footer-area pt-[60px]">
        <div className="footer-top">
          <div className="custom-container">
            <div className="lm:grid xl:grid-cols-5 lm:grid-cols-12 xl:gap-x-[30px] gap-[30px]">
              <div className="max-lg:col-span-12">
                <div className="footer-logo">
                  <Image
                    src="/images/logo/footer-logo.png"
                    alt="Logo"
                    width={210}
                    height={70}
                  />
                </div>
              </div>

              {/* Locations */}
              <div className="fixed-lg:col-span-3 fixed-md:col-span-4 fixed-lm:col-span-6 max-sm:pt-[35px]">
                <div className="footer-widget-item">
                  <h2 className="title">Our Locations</h2>
                  <ul className="contact-info mt-[25px]">
                    <li>
                      <b>Westfield</b><br />
                      RELUXE Med Spa<br />
                      514 E State Road 32<br />
                      Westfield, IN 46074<br />
                      <a href="tel:+13177631142" className="hover:text-black transition-all">
                        317-763-1142
                      </a>
                    </li>
                    <li>
                      <b>Carmel</b><br />
                      RELUXE x House of Health<br />
                      10485 N Pennsylvania St.<br />
                      Carmel, IN 46280<br />
                      <a href="tel:+13177631142" className="hover:text-black transition-all">
                        317-763-1142
                      </a>
                    </li>
                    <li>
                      <a href="mailto:hello@reluxemedspa.com" className="hover:text-black transition-all">
                        hello@reluxemedspa.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Links */}
              <div className="fixed-lg:col-span-3 fixed-md:col-span-3 fixed-lm:col-span-6 max-sm:pt-[30px]">
                <div className="footer-widget-item">
                  <h2 className="title">Quick Links</h2>
                  <ul className="footer-list mt-[25px]">
                    <li><Link href="/book/">Book Now</Link></li>
                    <li><Link href="/locations">Our Locations</Link></li>
                    <li><Link href="/shop">Shop Our Skincare</Link></li>
                    <li><Link href="/conditions">Conditions We Treat</Link></li>
                    <li><Link href="/team">Meet Our Team</Link></li>
                    <li><Link href="/events">Wedding & Event Prep</Link></li>
                  </ul>
                </div>
              </div>

              {/* About Us */}
              <div className="fixed-lg:col-span-3 fixed-md:col-span-2 fixed-lm:col-span-6 max-sm:pt-[30px]">
                <div className="footer-widget-item">
                  <h2 className="title">About Us</h2>
                  <ul className="footer-list mt-[25px]">
                    <li><Link href="/about">About</Link></li>
                    <li><Link href="/affiliations">Affiliations</Link></li>
                    <li><Link href="/financing/cherry">Cherry</Link></li>
                    <li><Link href="/gifts/spafinder">SpaFinder</Link></li>
                    <li><Link href="/blog">Beauty Notes</Link></li>
                  </ul>
                </div>
              </div>

              {/* Help Center */}
              <div className="fixed-lg:col-span-3 fixed-md:col-span-3 fixed-lm:col-span-6 max-sm:pt-[30px]">
                <div className="footer-widget-item">
                  <h2 className="title">Help Center</h2>
                  <ul className="footer-list mt-[25px]">
                    <li><Link href="/faqs">FAQs</Link></li>
                    <li><Link href="/legal/terms">Terms &amp; Conditions</Link></li>
                    <li><Link href="/legal/privacy">Privacy Policy</Link></li>
                    <li><Link href="/legal">Legal Center</Link></li>
                    <li><Link href="/profile">Patient Portal</Link></li>
                    <li><Link href="/services">Our Services</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="custom-container">
            <div className="inner-container border-[#dfdfdf] border-t md:mt-[95px] mt-[50px] py-9">
              <div className="md:grid md:grid-cols-12 flex flex-col">
                <div className="md:col-span-6 max-lm:order-last max-lm:pt-[10px]">
                  <div className="copyright flex-wrap md:justify-start justify-center md:mb-0 mb-[10px]">
                    © {currentYear} RELUXE Med Spa • Made with
                    <span className="text-[#f53400] mx-1"><AiIcons.AiFillHeart /></span>
                    <a href="https://goodlookingco.com" target="_blank" rel="noreferrer">
                      by Ridiculously Good Looking Co
                    </a>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <ul className="footer-social-link md:mb-0 mb-[10px] flex space-x-4 justify-center md:justify-start">
                    <li><a href="https://twitter.com/" target="_blank" rel="noreferrer">Twitter</a></li>
                    <li><a href="https://facebook.com/reluxemedspa" target="_blank" rel="noreferrer">Facebook</a></li>
                    <li><a href="https://instagram.com/reluxemedspa" target="_blank" rel="noreferrer">Instagram</a></li>
                    <li><a href="https://tiktok.com/reluxemedspa" target="_blank" rel="noreferrer">TikTok</a></li>
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <ul className="footer-language flex md:justify-end justify-center space-x-8">
                    <li>
                      <Link href="/profile" className="text-[#30373E] text-[14px] uppercase hover:text-[#263a4f]">
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/book" className="text-[#30373E] text-[14px] uppercase hover:text-[#263a4f]">
                        Book Now
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky footer nav */}
      <MobileTabBar isActivePath={isActivePath} />
    </>
  );
}

export default Footer;
