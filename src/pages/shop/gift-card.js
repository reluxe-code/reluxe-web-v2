
import Head from 'next/head';

export default function GiftCardPage() {
  return (
    <>
      <Head>
        <title>Buy a Gift Card | RELUXE Med Spa in Carmel & Westfield, IN</title>
        <meta name="description" content="Give the gift of luxury. Purchase a RELUXE Med Spa gift card for Botox, facials, massage, laser treatments & more. Digital and physical cards available." />
        <link rel="canonical" href="https://reluxemedspa.com/shop/gift-card" />
        <meta property="og:title" content="Buy a Gift Card | RELUXE Med Spa" />
        <meta property="og:description" content="Give the gift of luxury. Purchase a RELUXE Med Spa gift card for Botox, facials, massage, laser treatments & more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reluxemedspa.com/shop/gift-card" />
        <meta property="og:site_name" content="RELUXE Med Spa" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Buy a Gift Card | RELUXE Med Spa" />
        <meta name="twitter:description" content="Digital and physical gift cards for Botox, facials, massage & more in Carmel & Westfield, IN." />
      </Head>
      <div className="w-full h-screen">
        <iframe
          src="https://giftcard.reluxemedspa.com"
          title="Shop Gift Card"
          className="w-full h-full border-none"
        ></iframe>
      </div>
    </>
  );
}
