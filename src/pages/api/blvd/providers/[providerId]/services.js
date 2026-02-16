// src/pages/api/blvd/providers/[providerId]/services.js
import { blvd, getLocationById } from '@/server/blvd'

export default async function handler(req, res) {
  try {
    const { providerId, locationId } = req.query
    const location = await getLocationById(locationId)

    let cart = await blvd.carts.create(location)
    const items = cart.availableCategories.flatMap(c => c.availableItems || [])

    const staffItems = items.filter(it =>
      (it.availableStaff?.some(s => s.id === providerId)) ||
      it.staff?.id === providerId
    )

    const payload = staffItems.map(it => ({
      id: it.id,
      name: it.name,
      durationMinutes: it.durationMinutes ?? null,
      price: it.price ?? null
    }))

    res.json(payload)
  } catch (e) {
    res.status(200).json([]) // empty list keeps UI stable
  }
}
