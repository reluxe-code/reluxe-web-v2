// src/components/locations/LocationMap.js
// Single-pin Leaflet map for location hero sections.

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then(m => ({ default: m.MapContainer })),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => ({ default: m.TileLayer })),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(m => ({ default: m.Marker })),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(m => ({ default: m.Popup })),
  { ssr: false }
)

const TILE = {
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap &copy; CARTO',
}

const COORDS = {
  westfield: { lat: 40.0423, lng: -86.1279, name: 'RELUXE Med Spa Westfield', address: '514 E State Road 32, Westfield, IN 46074' },
  carmel:    { lat: 39.9409, lng: -86.1539, name: 'RELUXE Med Spa Carmel',    address: '10485 N Pennsylvania St, Carmel, IN 46280' },
}

export default function LocationMap({ locationSlug = 'westfield', pinSize = 56 }) {
  const [LRef, setLRef] = useState(null)
  const loc = COORDS[locationSlug] || COORDS.westfield

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const L = (await import('leaflet')).default
      if (mounted) setLRef(L)
    })()
    return () => { mounted = false }
  }, [])

  const icon = useMemo(() => {
    if (!LRef) return null
    return LRef.icon({
      iconUrl: '/images/map/reluxe-pin.svg',
      iconSize: [pinSize, pinSize],
      iconAnchor: [pinSize / 2, pinSize - 6],
      popupAnchor: [0, -(pinSize - 12)],
      className: 'reluxe-logo-pin',
    })
  }, [LRef, pinSize])

  return (
    <div className="w-full h-full relative z-0 isolate">
      <MapContainer
        center={[loc.lat, loc.lng]}
        zoom={14}
        minZoom={10}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution={TILE.attribution} url={TILE.url} />
        {LRef && icon && (
          <Marker position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{loc.name}</div>
                <div className="text-sm text-neutral-700">{loc.address}</div>
                <a
                  className="text-sm underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`}
                >
                  Directions
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <style jsx global>{`
        .reluxe-logo-pin { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
      `}</style>
    </div>
  )
}
