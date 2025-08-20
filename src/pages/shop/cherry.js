
import Head from 'next/head';

export default function CherryPage() {
  return (
    <>
      <Head>
        <title>Shop Cherry</title>
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
