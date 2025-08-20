// pages/profile.js
import Link from 'next/link'
import { FaEdit, FaCalendarCheck, FaHistory, FaTicketAlt, FaIdCard, FaGift, FaUserCircle } from 'react-icons/fa'

const profileLinks = [
  { title: 'Upcoming Appointments', icon: <FaCalendarCheck />, url: 'https://blvd.app/@reluxemedspa/appointments' },
  { title: 'Past Appointments', icon: <FaHistory />, url: 'https://blvd.app/@reluxemedspa/appointments#past' },
  { title: 'Your Vouchers', icon: <FaTicketAlt />, url: 'https://blvd.app/@reluxemedspa/wallet/vouchers' },
  { title: 'Your Memberships', icon: <FaIdCard />, url: 'https://blvd.app/@reluxemedspa/memberships' },
  { title: 'Give $25, Get $25', icon: <FaGift />, url: 'https://blvd.app/@reluxemedspa/referral-program' },
  { title: 'Profile Settings', icon: <FaUserCircle />, url: 'https://blvd.app/@reluxemedspa/profile' },
]

export default function Profile() {
  return (
    <section className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-3xl font-bold mb-6 text-center"><Image src='/images/myRELUXE.png' /></div>
        <p className="text-center italic text-gray-500 mb-8">
          One quick sign-in unlocks your profile, appointments, & more. Tap any link to begin.
        </p>
        <div className="space-y-4">
            <Link
              href='#'
              class='book'
              className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow hover:bg-gray-100">

              <div className="flex items-center space-x-4 text-lg">
                <span className="text-reluxeGold"></span>
                <span className="text-gray-800">Book Now</span>
              </div>
              <span className="text-xl text-gray-400">&rarr;</span>

            </Link>
          {profileLinks.map((link, idx) => (
            <Link
              key={idx}
              href={`/profile/view?title=${encodeURIComponent(link.title)}&url=${encodeURIComponent(link.url)}`}
              className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow hover:bg-gray-100">

              <div className="flex items-center space-x-4 text-lg">
                <span className="text-reluxeGold">{link.icon}</span>
                <span className="text-gray-800">{link.title}</span>
              </div>
              <span className="text-xl text-gray-400">&rarr;</span>

            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
