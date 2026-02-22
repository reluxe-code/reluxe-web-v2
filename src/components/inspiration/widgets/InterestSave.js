import { useState, useEffect } from 'react'
import trackWidgetEvent from '@/lib/trackWidgetEvent'

export default function InterestSave({ config, articleSlug }) {
  const { key, label = 'Save This Article' } = config || {}
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const saveKey = key || `saved_article_${articleSlug}`

  useEffect(() => {
    const local = localStorage.getItem('reluxe_interests')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed[saveKey]) ? parsed[saveKey].includes(articleSlug) : parsed[saveKey]) {
          setSaved(true)
        }
      } catch {}
    }
  }, [saveKey, articleSlug])

  const handleSave = async () => {
    const willSave = !saved
    setSaved(willSave)
    setLoading(true)

    trackWidgetEvent(willSave ? 'interest_save' : 'interest_unsave', 'InterestSave', articleSlug, { key: saveKey })

    // Save locally
    try {
      const local = JSON.parse(localStorage.getItem('reluxe_interests') || '{}')
      if (saved) {
        delete local[saveKey]
      } else {
        local[saveKey] = articleSlug
      }
      localStorage.setItem('reluxe_interests', JSON.stringify(local))
    } catch {}

    // Try server save (best-effort, only works for logged-in members)
    try {
      await fetch('/api/member/save-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: saveKey, value: saved ? null : articleSlug }),
      })
    } catch {}

    setLoading(false)
  }

  return (
    <div className="my-6 flex justify-center">
      <button
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
          saved
            ? 'border-violet-500 bg-violet-50 text-violet-700'
            : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-300'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#7C3AED' : 'none'} stroke={saved ? '#7C3AED' : 'currentColor'} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {saved ? 'Saved' : label}
      </button>
    </div>
  )
}
