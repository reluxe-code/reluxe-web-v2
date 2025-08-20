// src/components/layout/Footer.js
import Link from 'next/link';
import * as AiIcons from 'react-icons/ai';
import Image from 'next/image';
import TextListSignupCTA from '@/components/cta/TextListSignupCTA';

function Footer() {
  const currentYear = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
  });

  return (
    <>
      {/* ——— Newsletter / Text-List Signup CTA ——— */}
      <TextListSignupCTA className="md:pt-[120px]"/>

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
                      <Link href="tel:+1-317-763-1142" className="hover:text-black transition-all">
                        317-763-1142
                      </Link>
                    </li>
                    <li>
                      <b>Carmel</b><br />
                      RELUXE x House of Health<br />
                      10485 N Pennsylvania St.<br />
                      Carmel, IN 46280<br />
                      <Link href="tel:+1-317-763-1216" className="hover:text-black transition-all">
                        317-763-1216
                      </Link>
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
                    <li><Link href="/contact">Book Now</Link></li>
                    <li><Link href="/locations">Our Locations</Link></li>
                    <li><Link href="/shop">Shop Our Skincare</Link></li>
                    <li><Link href="/about">Meet Our Team</Link></li>
                    <li><Link href="/reviews">Reviews</Link></li>
                  </ul>
                </div>
              </div>

              {/* About Us */}
              <div className="fixed-lg:col-span-3 fixed-md:col-span-2 fixed-lm:col-span-6 max-sm:pt-[30px]">
                <div className="footer-widget-item">
                  <h2 className="title">About Us</h2>
                  <ul className="footer-list mt-[25px]">
                    <li><Link href="/about">About</Link></li>
                    <li><Link href="/cherry">Cherry</Link></li>
                    <li><Link href="/spafinder">Spafinder</Link></li>
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
                    <li><Link href="/terms">Terms & Conditions</Link></li>
                    <li><Link href="/privacy">Privacy Policy</Link></li>
                    <li><Link href="/help">Help</Link></li>
                    <li><Link href="/services">Services</Link></li>
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
                    <Link href="https://themeforest.net/user/codecarnival/portfolio" target="_blank">
                      by Ridiculously Good Looking Co
                    </Link>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <ul className="footer-social-link md:mb-0 mb-[10px] flex space-x-4 justify-center md:justify-start">
                    <li><Link href="https://twitter.com/">Twitter</Link></li>
                    <li><Link href="https://facebook.com/reluxemedspa">Facebook</Link></li>
                    <li><Link href="https://instagram.com/reluxemedspa">Instagram</Link></li>
                    <li><Link href="https://tiktok.com/reluxemedspa">TikTok</Link></li>
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
                      <Link href="/contact" className="text-[#30373E] text-[14px] uppercase hover:text-[#263a4f]">
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
    </>
  );
}

export default Footer;
