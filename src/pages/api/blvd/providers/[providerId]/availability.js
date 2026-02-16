// src/pages/api/blvd/providers/[providerId]/availability.js
import { blvd, getLocationById } from '@/server/blvd'

export default async function handler(req, res) {
  try {
    const { providerId, locationId, start, end, serviceId } = req.query

    const location = await getLocationById(locationId)
    let cart = await blvd.carts.create(location)

    if (serviceId) {
      cart = await cart.addBookableItem({ id: serviceId, staffId: providerId })
    }

    // If your SDK doesn’t take start/end here, you can omit and filter client-side.
    const dates = await cart.getBookableDates({ startDate: start, endDate: end })
    const results = []

    for (const d of dates) {
      const times = await cart.getBookableTimes(d, { staffId: providerId })
      for (const t of times) {
        results.push({
          id: `${d}T${t.startTime}_${providerId}`,
          start: `${d}T${t.startTime}`
        })
      }
    }

    res.json(results)
  } catch (e) {
    res.status(200).json([])
  }
}
