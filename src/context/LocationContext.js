// src/context/LocationContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { LOCATIONS, getStoredLocationKey, setStoredLocationKey } from '@/lib/location';

const Ctx = createContext({
  locationKey: null,
  setLocationKey: () => {},
  location: null,
  locationId: null,
});

export function LocationProvider({ children }) {
  const [locationKey, setLocationKeyState] = useState(null);

  useEffect(() => {
    setLocationKeyState(getStoredLocationKey());
  }, []);

  const setLocationKey = (k) => {
    setStoredLocationKey(k);
    setLocationKeyState(k);
    if (typeof window !== 'undefined') window.__reluxeLocationKey = k;
  };

  const location = locationKey ? LOCATIONS[locationKey] : null;
  const locationId = location ? location.id : null;

  return (
    <Ctx.Provider value={{ locationKey, setLocationKey, location, locationId }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLocationPref = () => useContext(Ctx);
