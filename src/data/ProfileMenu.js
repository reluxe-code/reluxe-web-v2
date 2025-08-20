// src/data/profileMenu.js
import { FiEdit3, FiGift } from 'react-icons/fi'
import { MdEventAvailable, MdHistory } from 'react-icons/md'
import { IoTicketOutline } from 'react-icons/io5'
import { BsStars } from 'react-icons/bs'
import { FaUserCircle } from 'react-icons/fa'

export const menu = [
  {
    title: 'Book Appointment',
    url: 'https://reluxe.click/book',
    icon: <FiEdit3 size={22} />,
  },
  {
    title: 'Upcoming Appointments',
    url: 'https://blvd.app/@reluxemedspa/appointments',
    icon: <MdEventAvailable size={22} />,
  },
  {
    title: 'Past Appointments',
    url: 'https://blvd.app/@reluxemedspa/appointments#past',
    icon: <MdHistory size={22} />,
  },
  {
    title: 'Your Vouchers',
    url: 'https://blvd.app/@reluxemedspa/wallet/vouchers',
    icon: <IoTicketOutline size={22} />,
  },
  {
    title: 'Your Memberships',
    url: 'https://blvd.app/@reluxemedspa/memberships',
    icon: <BsStars size={22} />,
  },
  {
    title: 'Give $25, Get $25',
    url: 'https://blvd.app/@reluxemedspa/referral-program',
    icon: <FiGift size={22} />,
  },
  {
    title: 'Profile Settings',
    url: 'https://blvd.app/@reluxemedspa/profile',
    icon: <FaUserCircle size={22} />,
  },
]
