// src/pages/api/admin/social-engine/upload-bg.js
// Uploads a background image to Supabase Storage.
import { getServiceClient } from '@/lib/supabase'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 })

  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve([fields, files])
    })
  })

  const file = Array.isArray(files.file) ? files.file[0] : files.file
  if (!file) return res.status(400).json({ error: 'No file uploaded' })

  const pathField = Array.isArray(fields.path) ? fields.path[0] : fields.path
  const fileName = pathField || `social-engine/bg-${Date.now()}.png`

  const buffer = fs.readFileSync(file.filepath)

  const db = getServiceClient()
  const { error } = await db.storage
    .from('media')
    .upload(fileName, buffer, {
      contentType: file.mimetype || 'image/png',
      upsert: true,
    })

  // Clean up temp file
  try { fs.unlinkSync(file.filepath) } catch {}

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const { data } = db.storage.from('media').getPublicUrl(fileName)
  res.json({ url: data?.publicUrl || '', path: fileName })
}
