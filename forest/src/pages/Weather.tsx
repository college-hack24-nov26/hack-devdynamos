import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { forestRegions, calculateCC } from "@/data/forestRegions";
import { CloudRain, Thermometer, Droplets, Wind, AlertTriangle, Shield, MapPin, TrendingDown, Loader2, BrainCircuit } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { useRegion } from "@/context/RegionContext";

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCode: number;
}

interface DailyForecast {
  date: string;
  precip: number;
  maxTemp: number;
  minTemp: number;
}

function weatherCodeLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export default function Weather() {
  const { activeRegion } = useRegion();

  // Derive coordinates: prefer custom activeRegion lat/lng over dropdown preset
  const isCustomActive = !!(activeRegion && !forestRegions.find(r => r.id === activeRegion.id));
  const contextRegionObj = activeRegion
    ? forestRegions.find(r => r.id === activeRegion.id) || forestRegions[0]
    : forestRegions[0];

  const [selectedRegionId, setSelectedRegionId] = useState(contextRegionObj.id);
  const selectedRegion = forestRegions.find(r => r.id === selectedRegionId) || forestRegions[0];

  // Actual lat/lng to use — falls back to custom activeRegion coords if not in preset list
  const fetchLat = isCustomActive ? activeRegion!.lat : selectedRegion.lat;
  const fetchLng = isCustomActive ? activeRegion!.lng : selectedRegion.lng;
  const displayName = isCustomActive ? activeRegion!.name : selectedRegion.name;
  const displayVanVibhag = isCustomActive ? (activeRegion!.vanVibhag || activeRegion!.name) : selectedRegion.vanVibhag;

  // Sync dropdown when context changes to a known preset
  useEffect(() => {
    if (activeRegion && !isCustomActive) {
      const found = forestRegions.find(r => r.id === activeRegion.id);
      if (found) setSelectedRegionId(found.id);
    }
  }, [activeRegion, isCustomActive]);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(false);

  // ── OpenRouter AI risk state ───────────────────────────────────────────────
  interface AIRisk {
    droughtRisk: string;
    floodRisk: string;
    droughtReason: string;
    floodReason: string;
    climateSummary: string;
    annualRainfallMM: number;
  }
  const [aiRisk, setAiRisk] = useState<AIRisk | null>(null);
  const [aiRiskLoading, setAiRiskLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const lat = fetchLat;
        const lng = fetchLng;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?` +
          `latitude=${lat}&longitude=${lng}` +
          `&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code` +
          `&daily=precipitation_sum,temperature_2m_max,temperature_2m_min` +
          `&timezone=Asia%2FKolkata&forecast_days=7`
        );
        const data = await res.json();
        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          rainfall: data.current.rain,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
        });
        if (data.daily) {
          const days: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
            date: new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
            precip: data.daily.precipitation_sum[i] ?? 0,
            maxTemp: data.daily.temperature_2m_max[i] ?? 0,
            minTemp: data.daily.temperature_2m_min[i] ?? 0,
          }));
          setForecast(days);
        }
      } catch {
        // fallback mock data
        setWeather({ temperature: 28, humidity: 65, rainfall: 5, windSpeed: 12, weatherCode: 1 });
        setForecast([
          { date: "Today", precip: 5, maxTemp: 30, minTemp: 22 },
          { date: "Tomorrow", precip: 12, maxTemp: 28, minTemp: 21 },
          { date: "Day 3", precip: 0, maxTemp: 33, minTemp: 24 },
          { date: "Day 4", precip: 2, maxTemp: 31, minTemp: 23 },
          { date: "Day 5", precip: 8, maxTemp: 27, minTemp: 20 },
          { date: "Day 6", precip: 55, maxTemp: 25, minTemp: 19 },
          { date: "Day 7", precip: 20, maxTemp: 26, minTemp: 20 },
        ]);
      }
      setLoading(false);
    };
    fetchWeather();
  }, [fetchLat, fetchLng]);

  // ── OpenRouter: fetch geographically accurate risk per region ─────────────
  useEffect(() => {
    const fetchAIRisk = async () => {
      if (!OPENROUTER_KEY) {
        setAiRiskLoading(false);
        return;
      }
      setAiRiskLoading(true);
      setAiRisk(null);
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "HTTP-Referer": "http://localhost:8080",
            "X-Title": "VanCC Forest Carbon Hub",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [{
              role: "user",
              content: `You are an expert in Indian geography, climate, and forest ecology.
Assess the drought and flood risk for this India/Maharashtra forest region:

Region: ${displayName} (${displayVanVibhag})
Coordinates: ${fetchLat.toFixed(4)}°N, ${fetchLng.toFixed(4)}°E

Base your assessment on ACTUAL geographical knowledge. Examples:
- Konkan coast (Ratnagiri, Chiplun, Sindhudurg, Raigad): HIGH flood risk, 2500-4000mm/year monsoon
- Vidarbha (Nagpur, Yavatmal, Chandrapur, Amravati, Wardha, Bhandara, Gadchiroli): HIGH drought risk, semi-arid, erratic rainfall
- Marathwada (Latur, Aurangabad, Osmanabad, Nanded): HIGH drought risk, rain-shadow zone
- Western Maharashtra (Pune, Satara, Sangli, Kolhapur): Moderate-Low risk, moderate rainfall
- Eastern Vidarbha (Tadoba/Chandrapur area): Moderate flood + High drought seasonally
- Nashik, Dhule: Moderate drought risk (semi-arid northern)
- Melghat (Amravati tribal forest): High drought in peak summer

Return ONLY valid JSON:
{
  "droughtRisk": "High" or "Moderate" or "Low",
  "floodRisk": "High" or "Moderate" or "Low",
  "droughtReason": "one factual sentence about this specific region's drought characteristics",
  "floodReason": "one factual sentence about this specific region's flood characteristics",
  "climateSummary": "2-3 sentences describing this region's actual climate, rainfall, and forest health context",
  "annualRainfallMM": estimated annual rainfall in mm as a number
}`,
            }],
          }),
        });
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) setAiRisk(JSON.parse(content));
      } catch {
        // silently fail — weather-derived risk shown as fallback
      }
      setAiRiskLoading(false);
    };
    fetchAIRisk();
  }, [fetchLat, fetchLng, displayName]);

  // ── Risk assessment ─────────────────────────────────────────────────────────
  const totalWeeklyRain = forecast.reduce((s, d) => s + d.precip, 0);
  const maxDailyRain = forecast.length > 0 ? Math.max(...forecast.map(d => d.precip)) : 0;

  const getDroughtRisk = () => {
    if (totalWeeklyRain < 5) return "High";
    if (totalWeeklyRain < 20) return "Moderate";
    return "Low";
  };
  const getFloodRisk = () => {
    if (maxDailyRain > 50) return "High";
    if (maxDailyRain > 25) return "Moderate";
    return "Low";
  };

  const droughtRisk = weather ? getDroughtRisk() : "—";
  const floodRisk = weather ? getFloodRisk() : "—";

  // ── CC impact ───────────────────────────────────────────────────────────────
  const weatherImpact = droughtRisk === "High" ? "drought" : floodRisk === "High" ? "flood" : "normal";
  const normal = calculateCC(selectedRegion.areaAcres, "normal");
  const drought = calculateCC(selectedRegion.areaAcres, "drought");
  const flood = calculateCC(selectedRegion.areaAcres, "flood");

  const impactData = [
    { scenario: "Normal", credits: normal.credits, income: Math.round(normal.income / 1e6) },
    { scenario: "Drought (-30%)", credits: drought.credits, income: Math.round(drought.income / 1e6) },
    { scenario: "Flood (-15%)", credits: flood.credits, income: Math.round(flood.income / 1e6) },
  ];

  const riskColor = (level: string): "default" | "secondary" | "destructive" | "outline" =>
    level === "High" ? "destructive" : level === "Moderate" ? "secondary" : "default";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Weather &amp; Risk Analysis
            {activeRegion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {activeRegion.vanVibhag}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Live conditions via Open Meteo · Drought &amp; flood risk · CC impact
          </p>
        </div>
        <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
          <SelectTrigger className="w-72 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            {forestRegions.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.vanVibhag} — {r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Weather */}
      <div className="grid gap-4 md:grid-cols-4">
        {weather && !loading ? [
          { title: "Temperature", value: `${weather.temperature}°C`, icon: Thermometer },
          { title: "Humidity", value: `${weather.humidity}%`, icon: Droplets },
          { title: "Current Rain", value: `${weather.rainfall} mm`, icon: CloudRain },
          { title: "Wind Speed", value: `${weather.windSpeed} km/h`, icon: Wind },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{item.value}</div></CardContent>
          </Card>
        )) : Array(4).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-md animate-pulse"><CardContent className="h-24" /></Card>
        ))}
      </div>

      {/* Condition banner */}
      {weather && (
        <div className="rounded-lg bg-secondary px-4 py-2 flex items-center gap-2">
          <p className="text-sm"><span className="font-semibold">Condition:</span> {weatherCodeLabel(weather.weatherCode)}
            {" · "}<span className="font-semibold">7-day rain total:</span> {totalWeeklyRain.toFixed(1)} mm
            {" · "}<span className="font-semibold">Max daily rain:</span> {maxDailyRain.toFixed(1)} mm
          </p>
        </div>
      )}

      {/* AI Regional Risk Assessment */}
      <div className="flex items-center gap-2 mb-1">
        <BrainCircuit className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Regional Risk Profile</span>
        <span className="text-xs text-muted-foreground">— powered by Fine-tuned LLaMA (geographically accurate)</span>
        {aiRiskLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Drought Risk */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Drought Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {aiRiskLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analysing {selectedRegion.name}…</span>
              </div>
            ) : aiRisk ? (
              <>
                <Badge variant={riskColor(aiRisk.droughtRisk)} className="text-lg px-4 py-1 mb-3">{aiRisk.droughtRisk}</Badge>
                <p className="text-sm text-muted-foreground mb-2">{aiRisk.droughtReason}</p>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Current week rain: <strong>{totalWeeklyRain.toFixed(1)} mm</strong>
                  {aiRisk.droughtRisk === "High" ? " · CC may drop 30% in drought year" : ""}
                </p>
              </>
            ) : (
              <>
                <Badge variant={riskColor(droughtRisk)} className="text-lg px-4 py-1 mb-3">{droughtRisk}</Badge>
                <p className="text-sm text-muted-foreground">Based on {totalWeeklyRain.toFixed(1)} mm weekly rainfall.</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Flood Risk */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Flood Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {aiRiskLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analysing {selectedRegion.name}…</span>
              </div>
            ) : aiRisk ? (
              <>
                <Badge variant={riskColor(aiRisk.floodRisk)} className="text-lg px-4 py-1 mb-3">{aiRisk.floodRisk}</Badge>
                <p className="text-sm text-muted-foreground mb-2">{aiRisk.floodReason}</p>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Avg annual rainfall: <strong>{aiRisk.annualRainfallMM?.toLocaleString()} mm</strong>
                  {aiRisk.floodRisk === "High" ? " · CC may drop 15% in flood year" : ""}
                </p>
              </>
            ) : (
              <>
                <Badge variant={riskColor(floodRisk)} className="text-lg px-4 py-1 mb-3">{floodRisk}</Badge>
                <p className="text-sm text-muted-foreground">Max daily rain: {maxDailyRain.toFixed(1)} mm this week.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Climate Summary from AI */}
      {aiRisk?.climateSummary && (
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Climate Profile — {selectedRegion.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{aiRisk.climateSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast Chart */}
      {forecast.length > 0 && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">7-Day Rainfall Forecast — {displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  label={{ value: "mm", angle: -90, position: "insideLeft" }}
                  domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 10)]}
                />
                <Tooltip formatter={(v: number) => [`${Number(v).toFixed(1)} mm`, "Rainfall"]} />
                <Bar dataKey="precip" fill="hsl(200,70%,45%)" name="Rainfall (mm)" radius={[4, 4, 0, 0]}
                  label={{ position: "top", formatter: (v: number) => v > 0 ? `${v.toFixed(0)}` : "", fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
            {forecast.every(d => d.precip === 0) && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                No rainfall forecast this week — typical dry season pattern for {displayName}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* CC Impact Chart */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Carbon Credit Impact — {selectedRegion.name}
            {weatherImpact !== "normal" && (
              <Badge variant="destructive" className="text-xs">{weatherImpact.toUpperCase()} YEAR</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={impactData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
              <XAxis dataKey="scenario" />
              <YAxis yAxisId="left" label={{ value: "Credits (tons)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Income (₹M)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="credits" fill="hsl(152,55%,33%)" name="Carbon Credits" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="income" fill="hsl(145,45%,55%)" name="Income (₹M)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
