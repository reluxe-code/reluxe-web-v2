// src/components/team/StaffCard.js

import Link from 'next/link'
import Image from 'next/image'

export default function StaffCard({ staff, linked = false }) {
  const specialties = staff.staffFields?.specialties?.map((s) => s.specialty) || []

  const inner = (
    <>
      <div className="relative w-full aspect-square mb-4">
        <Image
          src={staff.featuredImage?.node?.sourceUrl || '/images/default-avatar.jpg'}
          alt={staff.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover rounded-lg"
        />
      </div>
      <h3 className="text-xl font-semibold">{staff.title}</h3>
      <p className="text-sm text-gray-600">{staff.staffFields?.stafftitle}</p>
      <p className="text-sm text-gray-500 italic my-2">
        {specialties.join(', ')}
      </p>
      <span className="text-reluxeGold font-semibold mt-4 inline-block hover:underline">
        Meet {staff.title.split(' ')[0]}
      </span>
    </>
  )

  // When already wrapped in a parent <Link>, render as plain div
  if (linked) {
    return <div className="border rounded-xl p-4 text-center hover:shadow-lg transition">{inner}</div>
  }

  return (
    <Link href={`/team/${staff.slug}`} className="block border rounded-xl p-4 text-center hover:shadow-lg transition">
      {inner}
    </Link>
  );
}
