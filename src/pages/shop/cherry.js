
import Head from 'next/head';

export default function CherryPage() {
  return (
    <>
      <Head>
        <title>Cherry Financing | RELUXE Med Spa</title>
        <meta name="description" content="Apply for Cherry patient financing at RELUXE Med Spa. Flexible payment plans for Botox, fillers, facials, laser treatments & more in Carmel & Westfield, IN." />
        <link rel="canonical" href="https://reluxemedspa.com/shop/cherry" />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="w-full h-screen">
        <iframe
          src="https://pay.withcherry.com/reluxemedspa"
          title="Shop Cherry"
          className="w-full h-full border-none"
        ></iframe>
      </div>
    </>
  );
}
