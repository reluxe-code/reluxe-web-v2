// components/pricing/PackagesSection.js
export default function PackagesSection({ packages }) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-center mb-6">Popular Packages</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {packages.map((pkg) => (
          <div key={pkg.name} className="bg-white border p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
            <p className="mb-3 text-gray-600">{pkg.description}</p>
            <div className="text-reluxeGold font-bold text-lg">{pkg.price}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
