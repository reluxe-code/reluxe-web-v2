// src/pages/index.js
import Head from 'next/head';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { getAllItems, getFeaturedItems } from '../lib/items-util';
import { getDealsSSR } from '@/lib/deals';

import HeaderTwo from '../components/header/header-2';
import Hero from '../components/home-page/hero';
import About from '../components/home-page/about';
import AboutReluxeSection from '../components/home-page/AboutReluxeSection';
import TestimonialsBlock from '@/components/testimonials/newTestimonials';
import ServiceCategorySlider from '@/components/services/ServiceCategorySlider';
import { serviceCategories } from '@/data/ServiceCategories';
import LocationsBlock from '@/components/locations/LocationsBlock';
//import HotDealsSection from '@/components/home-page/HotDealsSection';
import RotatingCTABlock from '../components/home-page/RotatingCTABlock';
import FinanceEstimator from '@/components/finance/FinanceEstimator';
import TrustIndexWidget from '@/components/TrustIndexWidget';
import FeaturedPost from '../components/home-page/featured-post'; // ✅ make sure this file exports default
import DealsCarousel from '@/components/deals/DealsCarousel';       // ✅ make sure this file exports default

// Robust dynamic import: works with default or named export
const SmartPromoModal = dynamic(
  () =>
    import('@/components/promo/SmartPromoModal').then(
      (m) => m.default ?? m.SmartPromoModal
    ),
  { ssr: false, loading: () => null }
);

export default function HomePage({
  heroItems,
  services,
  projects,
  pricingItems,
  brandItems,
  posts,
  deals,
}) {
  const orgAndLocationsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://reluxemedspa.com#org",
        "name": "RELUXE Med Spa",
        "url": "https://reluxemedspa.com",
        "logo": "https://reluxemedspa.com/images/logo.png",
        "sameAs": [
          "https://www.instagram.com/reluxemedspa",
          "https://www.facebook.com/reluxemedspa"
        ],
        "contactPoint": [{
          "@type": "ContactPoint",
          "telephone": "+1-317-763-1142",
          "contactType": "customer service",
          "areaServed": ["Westfield IN", "Carmel IN", "Zionsville IN", "North Indianapolis IN"],
          "availableLanguage": "en"
        }]
      },
      {
        "@type": "MedicalBusiness",
        "@id": "https://reluxemedspa.com/locations/westfield#loc",
        "name": "RELUXE Med Spa - Westfield",
        "url": "https://reluxemedspa.com/locations/westfield",
        "image": "https://reluxemedspa.com/images/locations/westfield.jpg",
        "telephone": "+1-317-763-1142",
        "priceRange": "$$",
        "parentOrganization": { "@id": "https://reluxemedspa.com#org" },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "514 E State Road 32",
          "addressLocality": "Westfield",
          "addressRegion": "IN",
          "postalCode": "46074",
          "addressCountry": "US"
        },
        "hasOfferCatalog":{
          "@type":"OfferCatalog",
          "name":"RELUXE Services",
          "itemListElement":[
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Botox"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Jeuveau"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Dysport"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Daxxify"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"HydraFacial"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"IPL Photofacial"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Morpheus8 RF"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Juvederm"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"RHA"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Restlyne"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Facials"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Chemical Peels"}}
          ]
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 40.04298, "longitude": -86.12955 },
        "areaServed": ["Westfield IN", "Noblesville IN", "Carmel IN", "Zionsville IN", "North Indianapolis IN"],
        "openingHoursSpecification": [{
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Thursday","Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }]
      },
      {
        "@type": "MedicalBusiness",
        "@id": "https://reluxemedspa.com/locations/carmel#loc",
        "name": "RELUXE Med Spa - Carmel",
        "url": "https://reluxemedspa.com/locations/carmel",
        "image": "https://reluxemedspa.com/images/locations/carmel.jpg",
        "telephone": "+1-317-763-1142",
        "priceRange": "$$",
        "parentOrganization": { "@id": "https://reluxemedspa.com#org" },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "10485 N Pennsylvania St",
          "addressLocality": "Carmel",
          "addressRegion": "IN",
          "postalCode": "46280",
          "addressCountry": "US"
        },
        "hasOfferCatalog":{
          "@type":"OfferCatalog",
          "name":"RELUXE Services",
          "itemListElement":[
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Botox"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Jeuveau"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Dysport"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Daxxify"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"HydraFacial"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"IPL Photofacial"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Morpheus8 RF"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Juvederm"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"RHA"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Restlyne"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Facials"}},
            {"@type":"Offer","itemOffered":{"@type":"Service","name":"Chemical Peels"}}
          ]
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 39.94054, "longitude": -86.16063 },
        "areaServed": ["Carmel IN", "Zionsville IN", "Westfield IN", "North Indianapolis IN", "Fishers IN"],
        "openingHoursSpecification": [{
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Thursday","Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }]
      }
    ]
  };

  return (
    <>
      <Head>
        <title>RELUXE Med Spa | Botox, Injectables, Facials, Skincare, & Massage | Westfield & Carmel, Indiana</title>
        <meta name="description" content="RELUXE Med Spa now in Westfield & Carmel, IN. Expert Botox, Jeuveau, Facials, Skincare, Laser Hair Removal, and Massage." />
        <meta property="og:title" content="RELUXE Med Spa | Westfield & Carmel, Indiana" />
        <meta property="og:description" content="Botox, Jeuveau, Facials, Laser Hair Removal & Massage in Westfield & Carmel." />
        <meta property="og:image" content="https://reluxemedspa.com/images/social-preview.png" />
        <meta property="og:url" content="https://reluxemedspa.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RELUXE Med Spa | Westfield & Carmel, Indiana" />
        <meta name="twitter:description" content="Luxury Med Spa services serving Westfield, Carmel, Zionsville & North Indy." />
        <meta name="twitter:image" content="https://reluxemedspa.com/images/social-preview.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgAndLocationsSchema) }}
        />
      </Head>

      <HeaderTwo />
      <Hero heroItems={heroItems} />

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

      {/* Deals carousel */}
      <div className="max-w-6xl mx-auto px-4 py-12">
       <DealsCarousel deals={deals} autoAdvance={false} />
      </div>

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
      <FeaturedPost posts={posts} />

      <SmartPromoModal
        id="v3-neon"
        title="This Month’s Promos"
        ctaText="See Monthly Promotions"
        ctaHref="/deals"
        trigger="both"
        delay={900}
        frequencyDays={30}
        include={['/']}
        //alwaysShow
        flameSide="left"
        month="August"
      />
    </>
  );
}

export async function getStaticProps() {
  const heroItems    = getAllItems('heros');
  const allPosts     = getAllItems('posts');
  const allProjects  = getAllItems('projects');
  const services     = getAllItems('services');
  const pricingItems = getAllItems('pricing');
  const brandItems   = getAllItems('brands');

  const featuredPosts    = getFeaturedItems(allPosts);
  const featuredProjects = getFeaturedItems(allProjects);

  let deals = [];
  try {
    deals = await getDealsSSR();
  } catch {
    deals = [];
  }

  return {
    props: {
      heroItems,
      services,
      pricingItems,
      brandItems,
      posts: featuredPosts,
      projects: featuredProjects,
      deals,
    },
    revalidate: 600,
  };
}

HomePage.propTypes = {
  heroItems:    PropTypes.array.isRequired,
  services:     PropTypes.array.isRequired,
  pricingItems: PropTypes.array.isRequired,
  brandItems:   PropTypes.array.isRequired,
  posts:        PropTypes.array.isRequired,
  projects:     PropTypes.array.isRequired,
  deals:        PropTypes.array,
};
