import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Globe2, Search, Layers, AlertCircle, MapPin, Key, Image, Loader2, ExternalLink,
} from "lucide-react";
import { useRegion } from "@/context/RegionContext";
import { forestRegions } from "@/data/forestRegions";

// ── Bhuvan WMS base URL ────────────────────────────────────────────────────
const WMS_BASE = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms";
const LULC_API = "https://bhuvan-app1.nrsc.gov.in/api/lulc250k/curl_lulc250k.php";
const TOKEN_KEY = "bhuvan_lulc_token";

// ── Build bounding box from lat/lng centre (±0.5°) ───────────────────────
function buildBBox(lat: number, lng: number, delta = 0.5) {
  const minX = (lng - delta).toFixed(6);
  const minY = (lat - delta).toFixed(6);
  const maxX = (lng + delta).toFixed(6);
  const maxY = (lat + delta).toFixed(6);
  return { minX, minY, maxX, maxY, bbox: `${minX},${minY},${maxX},${maxY}` };
}

// ── Build WKT polygon from bounding box ──────────────────────────────────
function buildPolygonWKT(lat: number, lng: number, delta = 0.5) {
  const { minX, minY, maxX, maxY } = buildBBox(lat, lng, delta);
  return `POLYGON((${minX} ${minY},${maxX} ${minY},${maxX} ${maxY},${minX} ${maxY},${minX} ${minY}))`;
}

// ── Bhuvan WMS GetMap URL ─────────────────────────────────────────────────
function buildWMSUrl(lat: number, lng: number) {
  const { bbox } = buildBBox(lat, lng, 0.5);
  const params = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "lulc:MH_LULC50K_1516",
    STYLES: "",
    FORMAT: "image/png",
    TRANSPARENT: "false",
    SRS: "EPSG:4326",
    BBOX: bbox,
    WIDTH: "640",
    HEIGHT: "480",
  });
  return `${WMS_BASE}?${params.toString()}`;
}

interface LULCRecord {
  Year: string;
  "LULC Description": string;
  "Area in Sq. Km": string;
}

// ── Aggregate LULC records by description (sum over years) ───────────────
function aggregateByDesc(records: LULCRecord[]) {
  const map: Record<string, number> = {};
  records.forEach((r) => {
    const desc = r["LULC Description"].trim();
    const area = parseFloat(r["Area in Sq. Km"]) || 0;
    map[desc] = (map[desc] || 0) + area;
  });
  return Object.entries(map)
    .map(([name, area]) => ({ name, area: parseFloat(area.toFixed(2)) }))
    .sort((a, b) => b.area - a.area);
}

// ── Maps3D deeplinks ──────────────────────────────────────────────────────
const MAPS3D_LONAVALA =
  "https://maps3d.io/editor/3d?ne=18.80328%2C73.48888&sw=18.68657%2C73.31996&type=poly&p=18.79776%2C73.34091_18.73437%2C73.31996_18.68657%2C73.37661_18.71096%2C73.48888_18.80328%2C73.47995&elevationExaggeration=1.5&elevationZoom=11&elevationVerticalResolution=4&elevationDataset=mapterhorn-global&textureZoom=13&imagerySelected=satlas-superes-2023&groundMaterialMode=imagery&projection=EPSG%3A3857";
const MAPS3D_RATNAGIRI =
  "https://maps3d.io/editor/3d?ne=17.08094%2C73.34087&sw=16.94978%2C73.22206&type=hex&p=17.08094%2C73.28146_17.04814%2C73.34087_16.98256%2C73.34085_16.94978%2C73.28146_16.98256%2C73.22208_17.04814%2C73.22206_17.08094%2C73.28146&elevationExaggeration=1.5&elevationZoom=11&elevationVerticalResolution=4&elevationDataset=mapterhorn-global&textureZoom=13&waterShow=true&imagerySelected=satlas-superes-2023&groundMaterialMode=imagery&projection=EPSG%3A3857";
const MAPS3D_DEFAULT = "https://maps3d.io/editor";

export default function BhuvanPage() {
  const { activeRegion } = useRegion();

  const initRegion = activeRegion
    ? forestRegions.find((r) => r.id === activeRegion.id) || forestRegions[0]
    : forestRegions[0];

  const [selectedLat, setSelectedLat] = useState(initRegion.lat);
  const [selectedLng, setSelectedLng] = useState(initRegion.lng);
  const [selectedName, setSelectedName] = useState(initRegion.name);
  const [searchInput, setSearchInput] = useState(initRegion.vanVibhag);

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [showTokenField, setShowTokenField] = useState(!localStorage.getItem(TOKEN_KEY));

  const [lulcData, setLulcData] = useState<LULCRecord[]>([]);
  const [lulcLoading, setLulcLoading] = useState(false);
  const [lulcError, setLulcError] = useState<string | null>(null);
  const [wmsError, setWmsError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Sync with RegionContext
  useEffect(() => {
    if (activeRegion) {
      const preset = forestRegions.find((r) => r.id === activeRegion.id);
      const lat = preset?.lat ?? activeRegion.lat;
      const lng = preset?.lng ?? activeRegion.lng;
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSelectedName(activeRegion.name);
      setSearchInput(activeRegion.vanVibhag);
    }
  }, [activeRegion]);

  // Fetch LULC whenever location or token changes
  useEffect(() => {
    if (!token) return;
    fetchLULC();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLat, selectedLng, token]);

  const fetchLULC = async () => {
    setLulcLoading(true);
    setLulcError(null);
    setLulcData([]);
    const polygon = buildPolygonWKT(selectedLat, selectedLng, 0.5);
    const url = `${LULC_API}?polygon=${encodeURIComponent(polygon)}&year=all&option=json&token=${encodeURIComponent(token)}`;
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LULCRecord[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setLulcError(
          "No LULC data found for this area. Try a different region or check your token."
        );
      } else {
        setLulcData(data);
      }
    } catch (err) {
      const msg = String(err);
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("CORS")
      ) {
        setLulcError(
          "CORS restriction: The Bhuvan LULC API blocked direct browser access. " +
            "The WMS map above still works. For LULC stats, access the API via a backend proxy or directly from the Bhuvan portal."
        );
      } else {
        setLulcError(`Error: ${msg}. Check your token and try again.`);
      }
    }
    setLulcLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim().toLowerCase();
    const match = forestRegions.find(
      (r) =>
        r.vanVibhag.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.id === q
    );
    if (match) {
      setSelectedLat(match.lat);
      setSelectedLng(match.lng);
      setSelectedName(match.name);
      setWmsError(false);
      setMapLoading(true);
    } else {
      setLulcError(
        `Region "${searchInput}" not found. Try: Satara, Tadoba, Nagpur, Yavatmal, Lonavala, Ratnagiri, etc.`
      );
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem(TOKEN_KEY, tokenInput);
    setToken(tokenInput);
    setShowTokenField(false);
  };

  const wmsUrl = buildWMSUrl(selectedLat, selectedLng);
  const chartData = aggregateByDesc(lulcData).slice(0, 12);

  const getMaps3dUrl = () => {
    const name = selectedName.toLowerCase();
    if (name.includes("lonavala") || name.includes("lonavla")) return MAPS3D_LONAVALA;
    if (name.includes("ratnagiri")) return MAPS3D_RATNAGIRI;
    return MAPS3D_DEFAULT;
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe2 className="h-7 w-7 text-primary" />
            Bhuvan — ISRO Land Use Land Cover
            {activeRegion && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs ml-1">
                <MapPin className="h-3 w-3" /> {activeRegion.vanVibhag}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Satellite imagery &amp; LULC statistics via ISRO Bhuvan · WMS layer:{" "}
            <code className="text-xs bg-muted px-1 rounded">lulc:MH_LULC50K_1516</code>
          </p>
        </div>

        {/* Region search + Maps3D button */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Satara, Tadoba, Nagpur..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
            <Button type="submit" size="sm">
              Go
            </Button>
          </form>
          <a href={getMaps3dUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
              <ExternalLink className="h-4 w-4" />
              3D Terrain
            </Button>
          </a>
        </div>
      </div>

      {/* ── Region badges ──────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {selectedName}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          {selectedLat.toFixed(4)}°N, {selectedLng.toFixed(4)}°E
        </Badge>
        <Badge variant="outline" className="text-xs">
          BBox ±0.5° (~55 km radius)
        </Badge>
      </div>

      {/* ── WMS Map ──────────────────────────────────────────────────────── */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Bhuvan WMS Map — LULC Layer (1:50K, 2015-16)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative rounded-xl overflow-hidden border border-border bg-muted"
            style={{ minHeight: 400 }}
          >
            {mapLoading && !wmsError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Loading Bhuvan satellite layer...</p>
                </div>
              </div>
            )}
            {wmsError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm font-medium">Bhuvan WMS map could not load.</p>
                <p className="text-xs max-w-sm text-center">
                  This may be due to a network restriction or CORS policy on Bhuvan's
                  server. The WMS URL used:{" "}
                  <code className="bg-muted px-1 text-xs break-all rounded">
                    {wmsUrl.substring(0, 80)}...
                  </code>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setWmsError(false);
                    setMapLoading(true);
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <img
                src={wmsUrl}
                alt={`Bhuvan LULC map for ${selectedName}`}
                className="w-full object-contain"
                style={{ minHeight: 400, maxHeight: 520 }}
                onLoad={() => setMapLoading(false)}
                onError={() => {
                  setMapLoading(false);
                  setWmsError(true);
                }}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Source: ISRO Bhuvan WMS · Layer:{" "}
            <code>lulc:MH_LULC50K_1516</code> · SRS: EPSG:4326 ·{" "}
            <a
              href="https://bhuvan.nrsc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              bhuvan.nrsc.gov.in
            </a>
          </p>
        </CardContent>
      </Card>

      {/* ── Preset Regions ────────────────────────────────────────────── */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Maharashtra Forest Divisions — Quick Select
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {forestRegions.map((region) => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedLat(region.lat);
                  setSelectedLng(region.lng);
                  setSelectedName(region.name);
                  setSearchInput(region.vanVibhag);
                  setWmsError(false);
                  setMapLoading(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  selectedName === region.name
                    ? "gradient-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-muted/50 text-foreground border-border hover:bg-muted hover:border-primary/50"
                }`}
              >
                {region.vanVibhag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── API Token ──────────────────────────────────────────────────── */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Bhuvan LULC Stats API Token
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowTokenField((t) => !t)}>
              {showTokenField ? "Hide" : "Change Token"}
            </Button>
          </div>
        </CardHeader>
        {showTokenField && (
          <CardContent>
            <div className="flex gap-2 max-w-lg">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Get your free token at{" "}
                  <a
                    href="https://bhuvan-app1.nrsc.gov.in/api/lulc250k/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary"
                  >
                    bhuvan-app1.nrsc.gov.in/api/lulc250k
                  </a>
                </Label>
                <Input
                  type="password"
                  placeholder="Paste your Bhuvan LULC API token here..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="bg-muted/50 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleSaveToken}
                disabled={!tokenInput.trim()}
                className="self-end"
              >
                Save &amp; Load
              </Button>
            </div>
            {!token && (
              <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  LULC statistics require a free API token from ISRO Bhuvan. The WMS
                  satellite map above works without a token.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ── LULC Stats (token-gated) ───────────────────────────────────── */}
      {token && (
        <>
          <div className="flex items-center gap-3">
            <Button onClick={fetchLULC} disabled={lulcLoading} variant="outline">
              {lulcLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching…
                </>
              ) : (
                <>
                  <Layers className="mr-2 h-4 w-4" /> Reload LULC Stats
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Polygon: {buildPolygonWKT(selectedLat, selectedLng, 0.5).substring(0, 60)}…
            </p>
          </div>

          {lulcError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{lulcError}</p>
            </div>
          )}

          {chartData.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  LULC Distribution — {selectedName} (All Years Aggregate)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 150, right: 30, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      label={{ value: "Area (sq.km)", position: "insideBottom", offset: -2 }}
                    />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={145} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(2)} sq.km`, "Area"]} />
                    <Legend />
                    <Bar
                      dataKey="area"
                      fill="hsl(160,84%,28%)"
                      name="Area (sq.km)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {lulcData.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">LULC Raw Data — {selectedName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto rounded border border-border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>LULC Description</TableHead>
                        <TableHead className="text-right">Area (sq.km)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lulcData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{row.Year}</TableCell>
                          <TableCell>{row["LULC Description"].trim()}</TableCell>
                          <TableCell className="text-right font-medium">
                            {parseFloat(row["Area in Sq. Km"]).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {lulcData.length} records · Source: ISRO Bhuvan LULC 250K API
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
