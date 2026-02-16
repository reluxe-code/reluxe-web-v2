// src/components/location/ReluxeLocationsMap.js
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// React-Leaflet (client only) — wrap named exports as default
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
const ZoomControl = dynamic(
  () => import('react-leaflet').then(m => ({ default: m.ZoomControl })),
  { ssr: false }
)

// —— Basemaps (no API key required)
const TILES = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
  positron: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
}

// —— Both locations with explicit coords
const LOCATIONS = [
  {
    name: 'RELUXE Med Spa',
    address: '514 E State Road 32, Westfield, IN 46074',
    lat: 40.0423,
    lng: -86.1279,
    logo: '/images/map/reluxe-pin.svg',
  },
  {
    name: 'RELUXE Med Spa Carmel',
    address: '10485 N Pennsylvania Street, Carmel, IN 46280',
    lat: 39.9409,
    lng: -86.1539,
    logo: '/images/map/reluxe-pin.svg',
  },
]

export default function ReluxeLocationsMap({
  height = 360,
  pinSize = 72,
  basemap = 'positron',   // renamed from "style" to avoid prop collisions
  maxZoomOnFit = 12,      // lower = zoom out a bit more
}) {
  const [LRef, setLRef] = useState(null)
  const mapRef = useRef(null)

  // Load Leaflet only on client
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const L = (await import('leaflet')).default
      if (mounted) setLRef(L)
    })()
    return () => { mounted = false }
  }, [])

  // Build custom logo icons (once Leaflet is ready)
  const icons = useMemo(() => {
    if (!LRef) return []
    const mk = (url) =>
      LRef.icon({
        iconUrl: url,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize - 8],
        popupAnchor: [0, -(pinSize - 16)],
        className: 'reluxe-logo-pin',
      })
    return LOCATIONS.map((loc) => mk(loc.logo || '/images/map/reluxe-pin.svg'))
  }, [LRef, pinSize])

  // Bounds for both pins
  const bounds = useMemo(() => {
    const pts = LOCATIONS
    if (!pts.length) return null
    const [[minLat, minLng], [maxLat, maxLng]] = pts.reduce(
      (acc, p) => [
        [Math.min(acc[0][0], p.lat), Math.min(acc[0][1], p.lng)],
        [Math.max(acc[1][0], p.lat), Math.max(acc[1][1], p.lng)],
      ],
      [[pts[0].lat, pts[0].lng], [pts[0].lat, pts[0].lng]]
    )
    return [[minLat, minLng], [maxLat, maxLng]]
  }, [])

  const onMapCreated = (map) => {
    mapRef.current = map
    if (bounds) map.fitBounds(bounds, { padding: [24, 24], maxZoom: maxZoomOnFit })
  }

  // Refocus if props change
  useEffect(() => {
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: maxZoomOnFit })
    }
  }, [bounds, maxZoomOnFit])

  const fallbackCenter = [39.99, -86.13]

  // Defensive: if parent accidentally passes an object to `basemap`, coerce to key
  const basemapKey =
    typeof basemap === 'string' && basemap in TILES ? basemap : 'positron'
  const tile = TILES[basemapKey]

  return (
    <div className="w-full rounded-xl overflow-hidden border" style={{ height }}>
      <MapContainer
        center={fallbackCenter}
        zoom={11}
        minZoom={9}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        whenCreated={onMapCreated}
      >
        <ZoomControl position="topright" />

        {/* Only render TileLayer when we have a valid tile */}
        {tile?.url && (
          <TileLayer attribution={tile.attribution} url={tile.url} />
        )}

        {/* Only render markers after Leaflet is loaded (icons ready) */}
        {LRef &&
          LOCATIONS.map((p, i) => (
            <Marker key={`${p.name}-${i}`} position={[p.lat, p.lng]} icon={icons[i]}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-neutral-700">{p.address}</div>
                  <a
                    className="text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.address)}`}
                  >
                    Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      <style jsx global>{`
        .reluxe-logo-pin { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25)); }
      `}</style>
    </div>
  )
}
