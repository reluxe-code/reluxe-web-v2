// src/components/admin/ImageUpload.js
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ImageUpload({ value, onChange, folder = 'blog', label = 'Image' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, { contentType: file.type, upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('media').getPublicUrl(fileName)
    onChange(data?.publicUrl || '')
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>

      {value && (
        <div className="mb-2 relative inline-block">
          <img src={value} alt="Preview" className="h-32 rounded-lg object-cover border" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
          >
            X
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition"
        >
          {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Image'}
        </button>
        {value && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
