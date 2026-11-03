import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ActiveRegion {
  id: string;
  name: string;
  vanVibhag: string;
  lat: number;
  lng: number;
  areaAcres: number;
  ndviScore: number;
  description: string;
  isCustom?: boolean; // true when geocoded from Nominatim (not in preset list)
}

interface RegionContextValue {
  activeRegion: ActiveRegion | null;
  setActiveRegion: (region: ActiveRegion | null) => void;
}

const RegionContext = createContext<RegionContextValue>({
  activeRegion: null,
  setActiveRegion: () => {},
});

export function RegionProvider({ children }: { children: ReactNode }) {
  const [activeRegion, setActiveRegion] = useState<ActiveRegion | null>(null);
  return (
    <RegionContext.Provider value={{ activeRegion, setActiveRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  return useContext(RegionContext);
}
