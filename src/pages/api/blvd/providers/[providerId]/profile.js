// src/pages/api/blvd/providers/[providerId]/profile.js
import { blvd } from '@/server/blvd'

export default async function handler(req, res) {
  try {
    const { providerId } = req.query
    // If your SDK version doesn’t expose teamMembers.getById, return a basic stub.
    const tm = (await blvd.teamMembers?.getById?.(providerId)) || { id: providerId }
    res.json({
      id: tm.id,
      name: tm.name || null,
      title: tm.title || null,
      photoUrl: tm.photoUrl || null
    })
  } catch (e) {
    res.status(200).json(null) // keep UI tolerant
  }
}
