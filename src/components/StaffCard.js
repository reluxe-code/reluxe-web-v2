// components/StaffCard.js
import Link from 'next/link'

export default function StaffCard({ staff }) {
  const { title, slug, featuredImage, staffFields } = staff
  return (
    <Link
      href={`/staff/${slug}`}
      className="block border rounded-xl overflow-hidden hover:shadow-lg transition"
      legacyBehavior>
      <img src={featuredImage?.node?.sourceUrl} alt={title} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{staffFields?.role}</p>
        <p className="text-sm text-gray-500">{staffFields?.location}</p>
      </div>
    </Link>
  );
}
