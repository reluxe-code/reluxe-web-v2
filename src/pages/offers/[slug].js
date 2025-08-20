// pages/offers/[slug].js
import OfferLandingPage from '@/templates/OfferLandingPage';
import { offers } from '@/data/offers';

export default function OfferPage({ offer }) {
  if (!offer) {
    return <p className="min-h-screen flex items-center justify-center">Offer not found</p>;
  }
  return <OfferLandingPage offer={offer} />;
}

export function getStaticPaths() {
  return {
    paths: Object.keys(offers).map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const offer = offers[params.slug] || null;
  return { props: { offer } };
}
