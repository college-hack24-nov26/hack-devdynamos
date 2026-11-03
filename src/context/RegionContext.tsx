import { createContext, useContext, useState, ReactNode } from 'react';

export interface Region {
  id: string;
  name: string;
  vanVibhag: string;
  lat: number;
  lng: number;
}

interface RegionContextType {
  activeRegion: Region | null;
  setActiveRegion: (region: Region | null) => void;
}

const RegionContext = createContext<RegionContextType>({
  activeRegion: null,
  setActiveRegion: () => {},
});

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);

  return (
    <RegionContext.Provider value={{ activeRegion, setActiveRegion }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
