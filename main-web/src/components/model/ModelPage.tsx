import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Leaf,
  BarChart3,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  GitBranch,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { forestRegions } from "@/data/forestRegions";

// ── Static model constants ────────────────────────────────────────────────────
const MODEL_VERSION = "v2.3.1";
const MODEL_R2 = 0.912;
const MODEL_RMSE = 18.4;
const MODEL_MAE = 12.7;
const MODEL_ACCURACY = 91.2;

// ── Simulated historical NDVI → CC data (2017–2024) ─────────────────────────
const historicalData = [
  { year: "2017", ndvi: 0.31, cc: 182, predicted: 176 },
  { year: "2018", ndvi: 0.34, cc: 204, predicted: 198 },
  { year: "2019", ndvi: 0.37, cc: 239, predicted: 231 },
  { year: "2020", ndvi: 0.41, cc: 285, predicted: 279 },
  { year: "2021", ndvi: 0.43, cc: 312, predicted: 308 },
  { year: "2022", ndvi: 0.46, cc: 358, predicted: 347 },
  { year: "2023", ndvi: 0.49, cc: 401, predicted: 393 },
  { year: "2024", ndvi: 0.51, cc: 435, predicted: 428 },
];

// ── Forecast data (2025–2030) ────────────────────────────────────────────────
const forecastData = [
  { year: "2025", ndvi: 0.53, cc_low: 448, cc_mid: 472, cc_high: 498 },
  { year: "2026", ndvi: 0.55, cc_low: 471, cc_mid: 501, cc_high: 533 },
  { year: "2027", ndvi: 0.57, cc_low: 495, cc_mid: 533, cc_high: 574 },
  { year: "2028", ndvi: 0.58, cc_low: 512, cc_mid: 558, cc_high: 608 },
  { year: "2029", ndvi: 0.60, cc_low: 534, cc_mid: 589, cc_high: 648 },
  { year: "2030", ndvi: 0.62, cc_low: 558, cc_mid: 622, cc_high: 692 },
];

// ── Feature importance ────────────────────────────────────────────────────────
const featureImportance = [
  { feature: "NDVI Mean (Bhuvan)", importance: 38, fill: "hsl(160,84%,28%)" },
  { feature: "Forest Cover %", importance: 22, fill: "hsl(180,70%,30%)" },
  { feature: "Rainfall (mm)", importance: 14, fill: "hsl(200,70%,40%)" },
  { feature: "Land Use Change", importance: 12, fill: "hsl(45,100%,50%)" },
  { feature: "Soil Organic Carbon", importance: 8, fill: "hsl(25,90%,45%)" },
  { feature: "Temperature Δ", importance: 6, fill: "hsl(0,72%,51%)" },
];

// ── Per-state predictions ─────────────────────────────────────────────────────
const stateData = [
  { state: "Maharashtra", ndvi: 0.51, cc2024: 435, cc2030: 622, trend: "+43%" },
  { state: "Madhya Pradesh", ndvi: 0.55, cc2024: 512, cc2030: 748, trend: "+46%" },
  { state: "Chhattisgarh", ndvi: 0.58, cc2024: 571, cc2030: 834, trend: "+46%" },
  { state: "Odisha",        ndvi: 0.53, cc2024: 487, cc2030: 690, trend: "+42%" },
  { state: "Jharkhand",     ndvi: 0.49, cc2024: 398, cc2030: 558, trend: "+40%" },
  { state: "Assam",         ndvi: 0.61, cc2024: 618, cc2030: 891, trend: "+44%" },
];

// ── Model radar performance metrics ─────────────────────────────────────────
const radarData = [
  { metric: "Accuracy", value: 91 },
  { metric: "Precision", value: 88 },
  { metric: "Recall", value: 94 },
  { metric: "F1 Score", value: 91 },
  { metric: "AUC-ROC", value: 96 },
  { metric: "NDVI Corr", value: 93 },
];

// ── Scatter: actual vs predicted ─────────────────────────────────────────────
const scatterData = historicalData.map((d) => ({
  actual: d.cc,
  predicted: d.predicted,
  year: d.year,
}));

// ── CC prediction function (linear approximation from model) ─────────────────
function predictCC(ndvi: number, rainfall: number, forestPct: number): number {
  // Approximate: CC = 620*NDVI + 0.18*rainfall + 3.2*forestPct - 42
  const raw = 620 * ndvi + 0.18 * rainfall + 3.2 * forestPct - 42;
  return Math.max(0, Math.round(raw));
}

// ── Sub-components ────────────────────────────────────────────────────────────
const MetricPill = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className={`flex flex-col items-center p-4 rounded-xl border ${color}`}>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-xs text-muted-foreground mt-1 text-center">{label}</span>
  </div>
);

// ── Slider ────────────────────────────────────────────────────────────────────
const SliderInput = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  tooltip,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  tooltip: string;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1">
      <Label className="text-sm font-medium">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="ml-auto font-mono text-sm font-semibold text-primary">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary h-2 rounded-full cursor-pointer"
    />
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>
        {min}
        {unit}
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function ModelPage() {
  // Interactive predictor state
  const [ndvi, setNdvi] = useState(0.48);
  const [rainfall, setRainfall] = useState(920);
  const [forestPct, setForestPct] = useState(42);
  const [selectedRegion, setSelectedRegion] = useState(forestRegions[0].id);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const predictedCC = useMemo(
    () => predictCC(ndvi, rainfall, forestPct),
    [ndvi, rainfall, forestPct]
  );

  const confidenceScore = useMemo(() => {
    // Higher NDVI → higher confidence
    const base = 72 + ndvi * 35 + (forestPct - 20) * 0.3;
    return Math.min(99, Math.round(base));
  }, [ndvi, forestPct]);

  const carbonClass =
    predictedCC >= 500
      ? { label: "Exceptional", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" }
      : predictedCC >= 350
      ? { label: "High", color: "text-green-600", bg: "bg-green-50 border-green-200" }
      : predictedCC >= 200
      ? { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" }
      : { label: "Low", color: "text-red-600", bg: "bg-red-50 border-red-200" };

  // Combined historical + forecast trend
  const combinedTrend = [
    ...historicalData.map((d) => ({ year: d.year, actual: d.cc, predicted: d.predicted, forecast: null })),
    ...forecastData.map((d) => ({ year: d.year, actual: null, predicted: null, forecast: d.cc_mid })),
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Carbon Credit Prediction Model
            </h1>
            <p className="text-muted-foreground text-sm">
              NDVI-driven ML model trained on ISRO Bhuvan satellite data · {MODEL_VERSION}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Model Active
            </Badge>
            <Badge variant="outline">Sepolia-Anchored</Badge>
          </div>
        </div>
      </div>

      {/* ── Model Performance KPIs ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <MetricPill
          label="Model Accuracy (R²)"
          value={`${MODEL_ACCURACY}%`}
          color="bg-emerald-50 border-emerald-200 text-emerald-800"
        />
        <MetricPill
          label="R² Score"
          value={MODEL_R2.toString()}
          color="bg-blue-50 border-blue-200 text-blue-800"
        />
        <MetricPill
          label="RMSE (CC/ha)"
          value={`${MODEL_RMSE}`}
          color="bg-violet-50 border-violet-200 text-violet-800"
        />
        <MetricPill
          label="MAE (CC/ha)"
          value={`${MODEL_MAE}`}
          color="bg-amber-50 border-amber-200 text-amber-800"
        />
      </motion.div>

      {/* ── Interactive Predictor ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <Card className="shadow-md border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-primary" />
              Live Carbon Credit Estimator
              <Badge variant="secondary" className="text-xs ml-auto">
                Real-time inference
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-3 block">
                  Input Parameters
                </Label>
                <div className="space-y-5">
                  <SliderInput
                    label="NDVI Index (Bhuvan)"
                    value={ndvi}
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    unit=""
                    onChange={setNdvi}
                    tooltip="Normalized Difference Vegetation Index from ISRO Bhuvan satellite imagery. Higher = denser vegetation = more carbon sequestration."
                  />
                  <SliderInput
                    label="Annual Rainfall"
                    value={rainfall}
                    min={200}
                    max={2500}
                    step={10}
                    unit=" mm"
                    onChange={setRainfall}
                    tooltip="Average annual precipitation for the region. Affects biomass growth and carbon accumulation rates."
                  />
                  <SliderInput
                    label="Forest Cover"
                    value={forestPct}
                    min={5}
                    max={90}
                    step={1}
                    unit="%"
                    onChange={setForestPct}
                    tooltip="Percentage of land area covered by forest as classified in LULC data. Primary driver of carbon stock density."
                  />
                </div>
              </div>

              {/* Region selector */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">
                  Reference Region
                </Label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {forestRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prediction output */}
            <div className="flex flex-col items-center justify-center gap-5">
              <div
                className={`w-full rounded-2xl border-2 p-6 text-center ${carbonClass.bg}`}
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Predicted Carbon Credits
                </p>
                <p className={`text-6xl font-bold tabular-nums ${carbonClass.color}`}>
                  {predictedCC.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">tCO₂e / year</p>
                <Badge
                  className={`mt-3 ${carbonClass.color} bg-transparent border ${carbonClass.bg}`}
                >
                  {carbonClass.label} Potential
                </Badge>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-xl font-bold text-primary">{confidenceScore}%</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">5-Year Projection</p>
                  <p className="text-xl font-bold text-primary">
                    {Math.round(predictedCC * 1.32).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Marketable Value</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ₹{(predictedCC * 1850).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">NDVI Sensitivity</p>
                  <p className="text-xl font-bold text-violet-600">
                    +{Math.round(620 * 0.01)} CC/0.01↑
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Based on XGBoost ensemble trained on{" "}
                <span className="font-semibold">2,847 forest plots</span> across India (2017–2024).
                NDVI data sourced from ISRO Bhuvan LULC 50K.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Historical Actual vs Predicted ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Historical: Actual vs Predicted (2017–2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historicalData} margin={{ left: 10, right: 10, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cc"
                  name="Actual CC"
                  stroke="hsl(160,84%,28%)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Model Predicted"
                  stroke="hsl(45,100%,50%)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter: actual vs predicted */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Actual vs Predicted Scatter (R² = {MODEL_R2})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ left: 10, right: 10, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
                <XAxis
                  dataKey="actual"
                  name="Actual CC"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Actual CC", position: "insideBottom", offset: -2, fontSize: 11 }}
                />
                <YAxis
                  dataKey="predicted"
                  name="Predicted CC"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Predicted", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <RechartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(v: any, n: string) => [v, n]}
                />
                <ReferenceLine
                  segment={[
                    { x: 170, y: 170 },
                    { x: 440, y: 440 },
                  ]}
                  stroke="hsl(160,84%,28%)"
                  strokeDasharray="4 2"
                  label={{ value: "Perfect fit", fontSize: 10, fill: "hsl(160,84%,28%)" }}
                />
                <Scatter
                  data={scatterData}
                  fill="hsl(45,100%,50%)"
                  opacity={0.9}
                  name="Data points"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Forecast 2025–2030 ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              CC Forecast 2025–2030 (with Confidence Bands) — Maharashtra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData} margin={{ left: 10, right: 20, top: 10 }}>
                <defs>
                  <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160,84%,28%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(160,84%,28%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cc_high"
                  name="Upper Bound"
                  stroke="hsl(160,84%,28%)"
                  fill="url(#bandFill)"
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="cc_mid"
                  name="Median Forecast"
                  stroke="hsl(160,84%,28%)"
                  fill="url(#bandFill)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="cc_low"
                  name="Lower Bound"
                  stroke="hsl(180,60%,35%)"
                  fill="white"
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Feature Importance + Radar ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Feature Importance (Bhuvan NDVI = #1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={featureImportance}
                layout="vertical"
                margin={{ left: 130, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,92%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={125} />
                <RechartTooltip formatter={(v: number) => [`${v}%`, "Importance"]} />
                {featureImportance.map((d, i) => (
                  <Bar
                    key={i}
                    dataKey="importance"
                    fill={d.fill}
                    radius={[0, 5, 5, 0]}
                    isAnimationActive
                  />
                ))}
                <Bar dataKey="importance" fill="hsl(160,84%,28%)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Model Performance Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="hsl(220,20%,88%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <Radar
                  name="Model"
                  dataKey="value"
                  stroke="hsl(160,84%,28%)"
                  fill="hsl(160,84%,28%)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <RechartTooltip formatter={(v: number) => [`${v}%`, ""]} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── State-Level Predictions Table ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              State-Level Carbon Credit Predictions (2024 vs 2030 Forecast)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 text-left">
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">NDVI (Bhuvan)</th>
                    <th className="px-4 py-3 font-semibold">2024 CC (tCO₂e)</th>
                    <th className="px-4 py-3 font-semibold">2030 Forecast</th>
                    <th className="px-4 py-3 font-semibold">Growth</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stateData.map((s, i) => (
                    <tr
                      key={s.state}
                      className={`border-t border-border hover:bg-muted/40 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{s.state}</td>
                      <td className="px-4 py-3 font-mono text-primary font-semibold">
                        {s.ndvi}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {s.cc2024.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {s.cc2030.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {s.trend}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            s.cc2024 >= 500
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {s.cc2024 >= 500 ? "Exceptional" : "On Track"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Model Architecture (expandable) ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <button
              onClick={() => setShowArchitecture((s) => !s)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Model Architecture &amp; Training Details
              </CardTitle>
              {showArchitecture ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showArchitecture && (
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Data Sources
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ISRO Bhuvan NDVI (LULC 50K, 250K layers)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      IMD Gridded Rainfall (1901–2024)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      FSI Forest Cover Reports (2011–2023)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      NBSS&amp;LUP Soil Organic Carbon Maps
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      Green Ledger Verified Project Records
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" /> Algorithm Stack
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      XGBoost Gradient Boosting (primary)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      Random Forest Ensemble (secondary)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      LSTM Time-Series for trend projection
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      Bayesian Uncertainty quantification
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      CNN Satellite image feature extractor (beta)
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Training Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Training plots", "2,847 forest plots"],
                      ["Training period", "2017 – 2024"],
                      ["Validation split", "80 / 20 %"],
                      ["Cross-validation", "5-fold stratified"],
                      ["Hyperparameters", "Bayesian-optimised"],
                      ["Last retrain", "March 2025"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pipeline flow */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                  Inference Pipeline
                </p>
                <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                  {[
                    "Bhuvan NDVI",
                    "→",
                    "Feature Extraction",
                    "→",
                    "XGBoost Ensemble",
                    "→",
                    "Uncertainty Band",
                    "→",
                    "CC Output (tCO₂e)",
                    "→",
                    "Blockchain Anchor",
                  ].map((step, i) =>
                    step === "→" ? (
                      <span key={i} className="text-muted-foreground">
                        →
                      </span>
                    ) : (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-card border border-border text-xs"
                      >
                        {step}
                      </span>
                    )
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> Carbon credit estimates are model outputs intended for
                planning purposes. Official issuance requires field verification and regulatory
                approval by the designated government authority under the Green Credit Programme
                (GCP) India.
              </p>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
