// pages/profile/view.js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const ALLOWED_ORIGINS = [
  'https://reluxemedspa.com',
  'https://www.reluxemedspa.com',
  'https://reluxe-web-v2.vercel.app',
]

function isAllowedUrl(url) {
  try {
    const parsed = new URL(url)
    return ALLOWED_ORIGINS.some(origin => parsed.origin === origin) || parsed.origin === window.location.origin
  } catch {
    // Relative paths are OK
    return url.startsWith('/')
  }
}

export default function ProfileMobileView() {
  const router = useRouter()
  const [url, setUrl] = useState('')

  useEffect(() => {
    const link = router.query.url
    if (link) {
      const decoded = decodeURIComponent(link)
      if (isAllowedUrl(decoded)) {
        setUrl(decoded)
      }
    }
  }, [router.query.url])

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-black text-white p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-white font-bold"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold">Your RELUXE Hub</h1>
      </div>
      {url ? (
        <iframe
          src={url}
          className="w-full h-full border-none"
          title="RELUXE View"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          Invalid or unauthorized URL
        </div>
      )}
    </div>
  )
}
