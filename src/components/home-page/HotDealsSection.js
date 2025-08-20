// components/home-page/HotDealsSection.js
export default function HotDealsSection() {
  const hotDeals = [
    {
      title: 'BUY 4 SESSIONS OF SKINPEN',
      price: '$999',
      highlight: '+ GET 50% OFF ADD-ONS!',
      details: 'SAVE OVER $400 WITH THIS PACKAGE!<br/>CHOOSE BETWEEN VAMP OR PRP ADD-ON',
      ctaLabel: 'Book Now',
      ctaLink: '/book/skinpen'
    },
    {
      title: 'GET READY FOR SUMMER!',
      price: '10% OFF',
      highlight: 'ALL SPF!',
      details: 'SKINBETTER OR COLORESCIENCE',
      ctaLabel: 'Shop SPF',
      ctaLink: '/shop/spf'
    },
    {
      title: '60-MINUTE MASSAGE',
      price: '$85',
      highlight: 'NEW TO RELUXE MASSAGE ONLY',
      details:
        'ADD 15 MINUTES FOR $20<br/>ADD 30 MINUTES FOR $40<br/>ADD DEEP TISSUE FOR $25',
      ctaLabel: 'Book Massage',
      ctaLink: '/book/massage'
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
             🔥 OUR HOTTEST {' '}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                PROMOS
              </span>{' '}
            </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotDeals.map((deal, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold uppercase mb-4">{deal.title}</h3>
                <p className="text-5xl font-extrabold mb-2">{deal.price}</p>
                <p className="bg-gray-800 text-white py-2 px-3 text-sm font-bold rounded inline-block mb-4">
                  {deal.highlight}
                </p>
              </div>
              <div
                className="text-sm text-gray-700 font-medium mb-6"
                dangerouslySetInnerHTML={{ __html: deal.details }}
              />
              {deal.ctaLabel && deal.ctaLink && (
                <a
                  href={deal.ctaLink}
                  className="mt-auto inline-block border bg-black hover:bg-white hover:text-black hover:border-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {deal.ctaLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
