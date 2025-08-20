// components/pricing/MembershipSection.js
export default function MembershipSection({ memberships }) {
  return (
    <section className="bg-azure py-10 px-6 rounded-lg shadow-inner text-center">
      <h2 className="text-3xl font-bold mb-4">Membership Options</h2>
      <div className="grid md:grid-cols-2 gap-6 justify-center">
        {memberships.map((m) => (
          <div key={m.name} className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">{m.name}</h3>
            <p className="text-gray-600 mb-3">{m.description}</p>
            <div className="font-semibold text-reluxeGold text-lg mb-2">{m.price}</div>
            <ul className="text-sm text-gray-600 space-y-1">
              {m.benefits.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
