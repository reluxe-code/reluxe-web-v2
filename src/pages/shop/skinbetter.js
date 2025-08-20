
import Head from 'next/head';

export default function SkinbetterPage() {
  return (
    <>
      <Head>
        <title>Shop Skinbetter</title>
      </Head>
      <div className="w-full h-screen">
        <iframe
          src="https://skinbetter.pro/reluxemedspa"
          title="Shop Skinbetter"
          className="w-full h-full border-none"
        ></iframe>
      </div>
    </>
  );
}
