// components/pricing/PricingGrid.js
export default function PricingGrid({ services }) {
  return (
    <section className="grid md:grid-cols-2 gap-8 mb-12">
      {services.map((category) => (
        <div key={category.title} className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
          <ul className="space-y-3">
            {category.items.map((item) => (
              <li key={item.name} className="flex justify-between text-gray-700">
                <span>{item.name}</span>
                <span className="font-semibold text-reluxeGold">{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
