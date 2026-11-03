import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trees, Leaf, IndianRupee, Activity, Loader2, MapPin } from "lucide-react";
import { forestRegions, calculateCC, generateCustomRegion, type ForestRegion } from "@/data/forestRegions";
import { useRegion, type ActiveRegion } from "@/context/RegionContext";

// ── Fix Leaflet default marker icons ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// ── Map controller component ─────────────────────────────────────────────────
function MapController({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// ── Region aliases — maps common names to preset region IDs ─────────────────────
const REGION_ALIASES: Record<string, string> = {
  // Konkan coast → Ratnagiri
  "konkan": "ratnagiri", "kokan": "ratnagiri", "konkan coast": "ratnagiri",
  "chiplun": "ratnagiri", "sindhudurg": "ratnagiri", "raigad": "ratnagiri",
  // Vidarbha → Nagpur
  "vidarbha": "nagpur", "vidharbha": "nagpur", "eastern vidarbha": "nagpur",
  "western vidarbha": "amravati",
  // Marathwada → Latur
  "marathwada": "latur", "osmanabad": "latur", "nanded": "latur",
  // Western Ghats → Satara
  "sahyadri": "satara", "western ghats": "satara", "mahabaleshwar": "satara",
  // Sangli district nearby cities → Sangli preset
  "miraj": "sangli", "islampur": "sangli", "vita": "sangli",
  "sangli district": "sangli", "sangli miraj kupwad": "sangli",
  "krishna river": "sangli", "krishna basin": "sangli",
  // NOTE: ashta has its own specific location in Walwa, geocode directly
  // Other clear aliases
  "tadoba": "chandrapur", "pench": "nagpur", "melghat": "melghat",
  "north maharashtra": "nashik",
};

// ── Nominatim geocoding (Maharashtra-scoped) ─────────────────────────────
async function geocodePlace(query: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  // Add Maharashtra context for better accuracy
  const scopedQuery = `${query}, Maharashtra, India`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(scopedQuery)}&format=json&limit=3&countrycodes=in`;
  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "VanCC-ForestApp/1.0" },
    });
    const data = await res.json();
    if (!data || data.length === 0) return null;
    // Prefer results inside Maharashtra bounding box
    const mhResult = data.find((d: { lat: string; lon: string }) => {
      const lat = parseFloat(d.lat); const lon = parseFloat(d.lon);
      return lat >= 15.6 && lat <= 22.1 && lon >= 72.6 && lon <= 80.9;
    }) || data[0];
    return { lat: parseFloat(mhResult.lat), lon: parseFloat(mhResult.lon), displayName: mhResult.display_name };
  } catch { return null; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toActiveRegion(r: ForestRegion): ActiveRegion {
  return {
    id: r.id,
    name: r.name,
    vanVibhag: r.vanVibhag,
    lat: r.lat,
    lng: r.lng,
    areaAcres: r.areaAcres,
    ndviScore: r.ndviScore,
    description: r.description,
    isCustom: (r as ForestRegion & { isCustom?: boolean }).isCustom,
  };
}

function findMatchingRegion(query: string, lat: number, lng: number): ForestRegion | null {
  const q = query.toLowerCase();
  // 1. check alias map
  const aliasId = REGION_ALIASES[q];
  if (aliasId) {
    const byAlias = forestRegions.find(r => r.id === aliasId);
    if (byAlias) return byAlias;
  }
  // 2. name / vanVibhag match
  const byName = forestRegions.find(
    r => r.name.toLowerCase().includes(q) || r.vanVibhag.toLowerCase().includes(q) || r.id.includes(q)
  );
  if (byName) return byName;
  // 3. proximity match (within ~33 km only — prevents cross-district snapping)
  const sorted = forestRegions
    .map(r => ({ r, d: Math.sqrt(Math.pow(r.lat - lat, 2) + Math.pow(r.lng - lng, 2)) }))
    .sort((a, b) => a.d - b.d);
  if (sorted[0]?.d < 0.3) return sorted[0].r;
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ForestMap() {
  const [searchParams] = useSearchParams();
  const { setActiveRegion } = useRegion();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // custom geocoded marker (not in preset list)
  const [customMarker, setCustomMarker] = useState<{ lat: number; lng: number; name: string } | null>(null);
  // locally selected region for the info panel
  const [selectedRegion, setSelectedRegion] = useState<ForestRegion | null>(null);
  // map fly target
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  // Handle in-app navigation from dashboard search
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setSearchInput(q);
      const found = forestRegions.find(
        r => r.name.toLowerCase().includes(q.toLowerCase()) || r.vanVibhag.toLowerCase().includes(q.toLowerCase())
      );
      if (found) {
        setSelectedRegion(found);
        setMapTarget({ lat: found.lat, lng: found.lng, zoom: 11 });
        setActiveRegion(toActiveRegion(found));
      }
    }
  }, [searchParams, setActiveRegion]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setSearching(true);
    setSearchError(null);

    try {
      // 0. Check REGION_ALIASES first — guaranteed correct, no geocoding needed
      const aliasId = REGION_ALIASES[query.toLowerCase()];
      if (aliasId) {
        const aliasMatch = forestRegions.find(r => r.id === aliasId);
        if (aliasMatch) {
          setSelectedRegion(aliasMatch);
          setCustomMarker(null);
          setMapTarget({ lat: aliasMatch.lat, lng: aliasMatch.lng, zoom: 12 });
          setActiveRegion(toActiveRegion(aliasMatch));
          setSearching(false);
          return;
        }
      }

      // 1. Check our preset list by name / vanVibhag / id
      const preset = forestRegions.find(
        r => r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.vanVibhag.toLowerCase().includes(query.toLowerCase()) ||
          r.id === query.toLowerCase()
      );
      if (preset) {
        setSelectedRegion(preset);
        setCustomMarker(null);
        setMapTarget({ lat: preset.lat, lng: preset.lng, zoom: 11 });
        setActiveRegion(toActiveRegion(preset));
        setSearching(false);
        return;
      }

      // 2. Fall back to Nominatim geocoding
      const geo = await geocodePlace(query);
      if (!geo) {
        setSearchError(`No location found for "${query}". Try a different spelling.`);
        setSearching(false);
        return;
      }

      // 3. Check if geocoded location is close to a preset region
      const match = findMatchingRegion(query, geo.lat, geo.lon);
      if (match) {
        setSelectedRegion(match);
        setCustomMarker(null);
        setMapTarget({ lat: match.lat, lng: match.lng, zoom: 11 });
        setActiveRegion(toActiveRegion(match));
      } else {
        // 4. Generate custom region from geocoded location
        const custom = generateCustomRegion(query, geo.lat, geo.lon);
        setSelectedRegion(custom);
        setCustomMarker({ lat: geo.lat, lng: geo.lon, name: query });
        setMapTarget({ lat: geo.lat, lng: geo.lon, zoom: 11 });
        setActiveRegion(toActiveRegion(custom));
      }
    } catch {
      setSearchError("Geocoding failed. Please check your internet connection.");
    }
    setSearching(false);
  }, [searchInput, setActiveRegion]);

  const handleMarkerClick = (region: ForestRegion) => {
    setSelectedRegion(region);
    setCustomMarker(null);
    setMapTarget({ lat: region.lat, lng: region.lng, zoom: 11 });
    setActiveRegion(toActiveRegion(region));
  };

  const cc = selectedRegion ? calculateCC(selectedRegion.areaAcres) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Search bar */}
      <div className="p-4 pb-2">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search any place — Nilanga, Yavatmal, Satara, Tadoba..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>
        {searchError && (
          <p className="text-sm text-destructive mt-1 ml-1">{searchError}</p>
        )}
      </div>

      <div className="flex flex-1 gap-4 px-4 pb-4 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-lg border border-border" style={{ minHeight: 0 }}>
          <MapContainer
            center={[19.5, 76.5]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController target={mapTarget} />

            {/* Preset region markers */}
            {forestRegions.map(region => (
              <Marker
                key={region.id}
                position={[region.lat, region.lng]}
                icon={selectedRegion?.id === region.id ? blueIcon : greenIcon}
                eventHandlers={{ click: () => handleMarkerClick(region) }}
              >
                <Popup>
                  <strong>{region.name}</strong><br />
                  {region.areaAcres.toLocaleString()} acres | NDVI: {region.ndviScore}
                </Popup>
              </Marker>
            ))}

            {/* Custom geocoded marker */}
            {customMarker && (
              <Marker position={[customMarker.lat, customMarker.lng]} icon={blueIcon}>
                <Popup>
                  <strong>{customMarker.name}</strong><br />
                  Geocoded location (custom data)
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Info Panel */}
        {selectedRegion && cc && (
          <div className="w-80 space-y-4 overflow-y-auto">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Trees className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{selectedRegion.name}</CardTitle>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{selectedRegion.vanVibhag} Van Vibhag</Badge>
                  {(selectedRegion as ForestRegion & { isCustom?: boolean }).isCustom && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Geocoded
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedRegion.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Forest Area", value: `${selectedRegion.areaAcres.toLocaleString()} acres`, icon: Trees },
                    { label: "CC Generated", value: `${cc.credits.toLocaleString()} tons`, icon: Leaf },
                    { label: "Income Potential", value: `₹${(cc.income / 1e6).toFixed(1)}M`, icon: IndianRupee },
                    { label: "NDVI Score", value: selectedRegion.ndviScore.toFixed(2), icon: Activity },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg bg-secondary p-3">
                      <item.icon className="h-4 w-4 text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent p-3">
                  <p className="text-xs font-medium text-accent-foreground mb-1">NDVI Health</p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-700"
                      style={{ width: `${selectedRegion.ndviScore * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedRegion.ndviScore >= 0.7 ? "Excellent" : selectedRegion.ndviScore >= 0.5 ? "Good" : "Needs attention"}
                    {" "}— navigate to other pages to see full analytics for this region
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
