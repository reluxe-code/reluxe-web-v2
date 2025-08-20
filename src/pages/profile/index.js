// pages/profile/index.js
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import HeaderTwo from '@/components/header/header-3'
import { menu } from '@/data/profileMenu'

export default function ProfileDashboard() {
  const router = useRouter()
  const [selectedUrl, setSelectedUrl] = useState('https://blvd.app/@reluxemedspa')

  useEffect(() => {
    if (window.innerWidth < 768) return
    const defaultItem = menu[0]
    if (defaultItem) setSelectedUrl(defaultItem.url)
  }, [])

  const handleLinkClick = (url) => {
    if (window.innerWidth < 768) {
      router.push(`/profile/view?url=${encodeURIComponent(url)}`)
    } else {
      setSelectedUrl(url)
    }
  }

  return (
    <>
      <HeaderTwo />
      <div className="flex flex-col md:flex-row h-screen">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-50 border-r p-6 space-y-4">
          <div className="mb-8 text-center">
            <Image
              src="/images/myRELUXE.png"
              alt="myRELUXE"
              width={300}
              height={1000}
              className="w-[90%] h-auto mx-auto"
              priority
            />
          </div>
          {menu.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-md shadow hover:bg-gray-50 transition-all duration-150"
              onClick={() => handleLinkClick(item.url)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-gray-800">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Iframe Panel */}
        <div className="hidden md:block w-3/4 h-full animate-fadeIn">
          <iframe
            key={selectedUrl}
            src={selectedUrl}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </>
  )
}
