
import Head from 'next/head';

export default function GiftCardPage() {
  return (
    <>
      <Head>
        <title>Shop Gift Card</title>
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
