// components/Map.js

import React from 'react'
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '300px',
}

export default function Map({ lat, lng }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  })

  if (loadError) return <p>Map failed to load.</p>
  if (!isLoaded)  return <p>Loading map…</p>

  const center = { lat, lng }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
    >
      {/* ← Here’s your marker */}
      <Marker position={center} />
    </GoogleMap>
  )
}
