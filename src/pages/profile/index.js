// pages/profile/index.js
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import BetaLayout from '@/components/beta/BetaLayout'
import { colors, fontPairings } from '@/components/preview/tokens'
import { menu } from '@/data/ProfileMenu'

const FONT_KEY = 'bold'
const fonts = fontPairings[FONT_KEY]

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
    <BetaLayout title="myRELUXE" noindex>
      <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{ padding: '1.5rem', backgroundColor: colors.cream, borderRight: `1px solid ${colors.stone}` }} className="w-full md:w-1/4">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <Image
              src="/images/myreluxe.png"
              alt="myRELUXE"
              width={300}
              height={1000}
              className="w-[90%] h-auto mx-auto"
              priority
            />
          </div>
          {menu.map((item, i) => (
            <a
              key={i}
              href={item.url}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', marginBottom: '0.5rem',
                backgroundColor: '#fff', borderRadius: '0.75rem',
                border: `1px solid ${colors.stone}`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                fontFamily: fonts.body, fontWeight: 600, color: colors.heading,
                textDecoration: 'none', transition: 'background-color 0.2s',
              }}
              target="_blank" rel="noopener noreferrer"
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.title}</span>
            </a>
          ))}
        </div>

        {/* Iframe Panel */}
        <div className="hidden md:block w-3/4 h-full">
          <iframe
            key={selectedUrl}
            src={selectedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </BetaLayout>
  )
}

ProfileDashboard.getLayout = (page) => page
