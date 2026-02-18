// src/pages/index.js
import Head from 'next/head';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getAllItems, getFeaturedItems } from '../lib/items-util';
//import { getDealsSSR } from '@/lib/deals';

import HeaderTwo from '../components/header/header-2';
import Hero from '../components/home-page/hero';
import About from '../components/home-page/about';
import AboutReluxeSection from '../components/home-page/AboutReluxeSection';
import TestimonialsBlock from '@/components/testimonials/newTestimonials';
import ServiceCategorySlider from '@/components/services/ServiceCategorySlider';
import { serviceCategories } from '@/data/ServiceCategories';
import LocationsBlock from '@/components/locations/LocationsBlock';
// import HotDealsSection from '@/components/home-page/HotDealsSection';
import RotatingCTABlock from '../components/home-page/RotatingCTABlock';
import FinanceEstimator from '@/components/finance/FinanceEstimator';
import TrustIndexWidget from '@/components/TrustIndexWidget';
// import FeaturedPost from '../components/home-page/featured-post';
//import DealsCarousel from '@/components/deals/DealsCarousel';

// Robust dynamic import: works with default or named export
const SmartPromoModal = dynamic(
  () =>
    import('@/components/promo/SmartPromoModal').then(
      (m) => m.default ?? m.SmartPromoModal
    ),
  { ssr: false, loading: () => null }
);

// ✅ Configurable hero promo button
const HERO_PROMO_CONFIG = {
  enabled: true, // master on/off switch
  href: '/deals', // link target
  label: 'View This Month\'s Deals & Specials',
  // Set window when the button should be visible (no time gate — always show)
  startTime: null,
  endTime: null,
};

export default function HomePage({
  heroItems,
  services,
  projects,
  pricingItems,
  brandItems,
  posts,
}) {
  const [showHeroPromo, setShowHeroPromo] = useState(false);

  useEffect(() => {
    if (!HERO_PROMO_CONFIG.enabled) {
      setShowHeroPromo(false);
      return;
    }

    const now = new Date();
    const start = HERO_PROMO_CONFIG.startTime
      ? new Date(HERO_PROMO_CONFIG.startTime)
      : null;
    const end = HERO_PROMO_CONFIG.endTime
      ? new Date(HERO_PROMO_CONFIG.endTime)
      : null;

    const afterStart = !start || now >= start;
    const beforeEnd = !end || now < end;

    setShowHeroPromo(afterStart && beforeEnd);
  }, []);

  const orgAndLocationsSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://reluxemedspa.com#org',
        name: 'RELUXE Med Spa',
        url: 'https://reluxemedspa.com',
        logo: 'https://reluxemedspa.com/images/logo.png',
        sameAs: [
          'https://www.instagram.com/reluxemedspa',
          'https://www.facebook.com/reluxemedspa',
          'https://www.tiktok.com/@reluxemedspa',
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-317-763-1142',
            contactType: 'customer service',
            areaServed: [
              'Westfield IN',
              'Carmel IN',
              'Zionsville IN',
              'North Indianapolis IN',
            ],
            availableLanguage: 'en',
          },
        ],
      },
      {
        '@type': 'MedicalBusiness',
        '@id': 'https://reluxemedspa.com/locations/westfield#loc',
        name: 'RELUXE Med Spa - Westfield',
        url: 'https://reluxemedspa.com/locations/westfield',
        image: 'https://reluxemedspa.com/images/locations/westfield.jpg',
        telephone: '+1-317-763-1142',
        priceRange: '$$',
        parentOrganization: { '@id': 'https://reluxemedspa.com#org' },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '514 E State Road 32',
          addressLocality: 'Westfield',
          addressRegion: 'IN',
          postalCode: '46074',
          addressCountry: 'US',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'RELUXE Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Botox' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jeuveau' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dysport' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Daxxify' } },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'HydraFacial' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'IPL Photofacial' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Morpheus8 RF' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Juvederm' },
            },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'RHA' } },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Restylane' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Facials' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Chemical Peels' },
            },
          ],
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 40.04298,
          longitude: -86.12955,
        },
        areaServed: [
          'Westfield IN',
          'Noblesville IN',
          'Carmel IN',
          'Zionsville IN',
          'North Indianapolis IN',
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00',
          },
        ],
      },
      {
        '@type': 'MedicalBusiness',
        '@id': 'https://reluxemedspa.com/locations/carmel#loc',
        name: 'RELUXE Med Spa - Carmel',
        url: 'https://reluxemedspa.com/locations/carmel',
        image: 'https://reluxemedspa.com/images/locations/carmel.jpg',
        telephone: '+1-317-763-1142',
        priceRange: '$$',
        parentOrganization: { '@id': 'https://reluxemedspa.com#org' },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '10485 N Pennsylvania St',
          addressLocality: 'Carmel',
          addressRegion: 'IN',
          postalCode: '46280',
          addressCountry: 'US',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'RELUXE Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Botox' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jeuveau' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Dysport' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Daxxify' } },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'HydraFacial' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'IPL Photofacial' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Morpheus8 RF' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Juvederm' },
            },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'RHA' } },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Restylane' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Facials' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'Chemical Peels' },
            },
          ],
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 39.94054,
          longitude: -86.16063,
        },
        areaServed: [
          'Carmel IN',
          'Zionsville IN',
          'Westfield IN',
          'North Indianapolis IN',
          'Fishers IN',
        ],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00',
          },
        ],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>
          RELUXE Med Spa | Botox, Injectables, Facials, Skincare, & Massage |
          Westfield & Carmel, Indiana
        </title>
        <meta
          name="description"
          content="RELUXE Med Spa in Westfield & Carmel, IN. Botox from $10/unit, expert facials from $99, laser hair removal & massage. Book your free consultation today."
        />
        <meta
          property="og:title"
          content="RELUXE Med Spa | Westfield & Carmel, Indiana"
        />
        <meta
          property="og:description"
          content="Botox, Jeuveau, Facials, Laser Hair Removal & Massage in Westfield & Carmel."
        />
        <meta
          property="og:image"
          content="https://reluxemedspa.com/images/social-preview.png"
        />
        <link rel="canonical" href="https://reluxemedspa.com" />
        <meta property="og:url" content="https://reluxemedspa.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="RELUXE Med Spa | Westfield & Carmel, Indiana"
        />
        <meta
          name="twitter:description"
          content="Luxury Med Spa services serving Westfield, Carmel, Zionsville & North Indy."
        />
        <meta
          name="twitter:image"
          content="https://reluxemedspa.com/images/social-preview.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgAndLocationsSchema) }}
        />
      </Head>

      <HeaderTwo />
      <Hero heroItems={heroItems} />

      {showHeroPromo && (
        <div className="bg-[#0b0b0b] py-4 sm:py-5">
          <div className="max-w-6xl mx-auto px-4 flex justify-center">
            <a
              href={HERO_PROMO_CONFIG.href}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:opacity-90 transition"
            >
              {HERO_PROMO_CONFIG.label}
            </a>
          </div>
        </div>
      )}


      <AboutReluxeSection />

      <ServiceCategorySlider items={serviceCategories} />

      <LocationsBlock />

      <div className="bg-azure pt-12 pb-12">
        <TrustIndexWidget />
      </div>

      <div className="pb-20">
        <About />
      </div>

      <TestimonialsBlock bgImage="/images/hero/team.png" />

      <div className="mt-8">
        <FinanceEstimator
          mode="estimator"
          imageSide="left"
          imageSrc="/images/finance/cherry.png"
          qrSrc="/images/finance/qr-apply.png"
          services={[
            { label: '30 Units of Jeuveau', price: 360 },
            { label: 'FDA Dosage - Full Face Tox', price: 896 },
            { label: 'Skinpen Package (4)', price: 1400 },
            { label: 'Unlimited Laser Hair', price: 2500 },
            { label: 'Morpheus8 Package (3)', price: 3000 },
          ]}
        />
      </div>

      <RotatingCTABlock />

      <SmartPromoModal
        id="v3-neon-feb"
        title="February Specials"
        ctaText="See This Month's Deals"
        ctaHref="/deals"
        trigger="both"
        delay={900}
        frequencyDays={30}
        include={['/']}
        flameSide="left"
        month="February"
      />
    </>
  );
}

export async function getStaticProps() {
  const heroItems = getAllItems('heros');
  const allPosts = getAllItems('posts');
  const allProjects = getAllItems('projects');
  const services = getAllItems('services');
  const pricingItems = getAllItems('pricing');
  const brandItems = getAllItems('brands');

  const featuredPosts = getFeaturedItems(allPosts);
  const featuredProjects = getFeaturedItems(allProjects);


  return {
    props: {
      heroItems,
      services,
      pricingItems,
      brandItems,
      posts: featuredPosts,
      projects: featuredProjects,
    },
  };
}

HomePage.propTypes = {
  heroItems: PropTypes.array.isRequired,
  services: PropTypes.array.isRequired,
  pricingItems: PropTypes.array.isRequired,
  brandItems: PropTypes.array.isRequired,
  posts: PropTypes.array.isRequired,
  projects: PropTypes.array.isRequired,
};
