import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forestRegions, historicalCarbonCredits, CO2_PER_ACRE, INCOME_PER_ACRE, generateCustomHistory } from "@/data/forestRegions";
import { Trees, Leaf, IndianRupee, TrendingUp, Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRegion } from "@/context/RegionContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

const COLORS = [
  "hsl(152,55%,33%)", "hsl(145,45%,55%)", "hsl(160,50%,40%)", "hsl(170,45%,35%)",
  "hsl(85,50%,45%)", "hsl(38,92%,50%)", "hsl(120,40%,50%)", "hsl(200,50%,45%)",
  "hsl(280,40%,55%)", "hsl(340,50%,50%)"
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { activeRegion } = useRegion();

  // ── Determine which data set to show ────────────────────────────────────────
  const isSingleRegion = !!activeRegion;
  const displayName = activeRegion ? activeRegion.name : "Maharashtra Van Vibhag";
  const displaySub = activeRegion ? `${activeRegion.vanVibhag} — click Forest Map to change region` : "All regions — search a region on the Forest Map";

  // KPI values
  const totalArea = isSingleRegion ? activeRegion!.areaAcres : forestRegions.reduce((s, r) => s + r.areaAcres, 0);
  const totalCC = Math.round(totalArea * CO2_PER_ACRE);
  const totalIncome = totalArea * INCOME_PER_ACRE;
  const avgNDVI = isSingleRegion
    ? activeRegion!.ndviScore
    : forestRegions.reduce((s, r) => s + r.ndviScore, 0) / forestRegions.length;

  // Historical data
  const histData = isSingleRegion
    ? generateCustomHistory(activeRegion!.id, activeRegion!.areaAcres)
    : historicalCarbonCredits;

  // Pie: CC distribution  (single = weather scenarios | all = by region)
  const pieData = isSingleRegion
    ? [
        { name: "Normal Year", value: Math.round(activeRegion!.areaAcres * CO2_PER_ACRE) },
        { name: "Flood Year (-15%)", value: Math.round(activeRegion!.areaAcres * CO2_PER_ACRE * 0.85) },
        { name: "Drought Year (-30%)", value: Math.round(activeRegion!.areaAcres * CO2_PER_ACRE * 0.70) },
      ]
    : forestRegions.slice(0, 10).map(r => ({
        name: r.vanVibhag,
        value: Math.round(r.areaAcres * CO2_PER_ACRE),
      }));

  // Bar: by year for active region OR all regions aggregate
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const barData = isSingleRegion
    ? years.map(year => {
        const entry = histData.find(c => c.year === year) || { creditsGenerated: 0, income: 0 };
        return {
          name: String(year),
          credits: Math.round(entry.creditsGenerated / 1000),
          income: Math.round(entry.income / 1e6),
        };
      })
    : forestRegions.slice(0, 10).map(r => ({
        name: r.vanVibhag.substring(0, 8),
        credits: Math.round(r.areaAcres * CO2_PER_ACRE),
        income: Math.round((r.areaAcres * INCOME_PER_ACRE) / 1e6),
      }));

  // Line: historical total credits over years
  const lineData = years.map(year => {
    const yearData = (isSingleRegion ? histData : historicalCarbonCredits).filter(c => c.year === year);
    return { year, credits: yearData.reduce((s, c) => s + c.creditsGenerated, 0) / 1000 };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/map?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Forest Carbon Credits Dashboard
            {isSingleRegion && (
              <Badge variant="secondary" className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {activeRegion!.vanVibhag}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">{displaySub}</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Van Vibhag (e.g. Nilanga, Tadoba)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </form>
      </div>

      {/* Region Context Banner */}
      {isSingleRegion && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 flex items-center gap-3">
          <Trees className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">{displayName}</p>
            <p className="text-xs text-muted-foreground">{activeRegion!.description}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Forest Area", value: `${(totalArea / 1000).toFixed(1)}K Acres`, icon: Trees, sub: `${isSingleRegion ? "1 division" : `${forestRegions.length} divisions`} tracked` },
          { title: "Carbon Credits", value: `${(totalCC / 1000).toFixed(1)}K tons CO₂`, icon: Leaf, sub: "2.5 tons/acre/year" },
          { title: "Income Potential", value: `₹${(totalIncome / 1e9).toFixed(2)}B`, icon: IndianRupee, sub: "₹85,000 per acre" },
          { title: "NDVI Score", value: avgNDVI.toFixed(2), icon: TrendingUp, sub: avgNDVI >= 0.7 ? "Excellent vegetation" : avgNDVI >= 0.5 ? "Good vegetation" : "Needs attention" },
        ].map((card, i) => (
          <Card key={i} className="border-none shadow-md bg-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              {isSingleRegion ? "CC by Weather Scenario" : "CC Distribution by Region"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} tons`, "Credits"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              {isSingleRegion ? "Annual CC (tons ÷1K) & Income (₹M)" : "CC by Region"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="credits" fill="hsl(152,55%,33%)" radius={[4, 4, 0, 0]} name={isSingleRegion ? "Credits (K tons)" : "Credits (tons)"} />
                {isSingleRegion && (
                  <Bar dataKey="income" fill="hsl(145,45%,55%)" radius={[4, 4, 0, 0]} name="Income (₹M)" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Historical CC Trends (2019–2024)
              {isSingleRegion ? ` — ${activeRegion!.vanVibhag}` : " — All Regions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: "Credits (K tons)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}K tons`, "Total Credits"]} />
                <Legend />
                <Line type="monotone" dataKey="credits" stroke="hsl(152,55%,33%)" strokeWidth={3} dot={{ r: 5 }} name="Total Credits (K)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
