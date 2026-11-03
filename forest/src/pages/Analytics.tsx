import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  forestRegions, historicalCarbonCredits, calculateCC, CO2_PER_ACRE, INCOME_PER_ACRE,
  generateCustomHistory
} from "@/data/forestRegions";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, MapPin, BrainCircuit, Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegion } from "@/context/RegionContext";

const COLORS = [
  "hsl(152,55%,33%)", "hsl(145,45%,55%)", "hsl(160,50%,40%)", "hsl(170,45%,35%)",
  "hsl(85,50%,45%)", "hsl(38,92%,50%)", "hsl(120,40%,50%)", "hsl(200,50%,45%)",
  "hsl(280,40%,55%)", "hsl(340,50%,50%)"
];

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

interface AIInsight {
  points: string[];  // 5–10 bullet point insights
  summary: string;   // 2–3 sentence executive summary
  generatedAt: string;
}

export default function Analytics() {
  const { activeRegion } = useRegion();
  const isSingleRegion = !!activeRegion;

  // AI report state
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Determine which regions/data to use
  const displayRegions = isSingleRegion
    ? forestRegions.filter(r => r.id === activeRegion!.id)
    : forestRegions;

  // Use actual historical data for known presets; generate for custom regions
  const regionHistory = (() => {
    if (!isSingleRegion) return historicalCarbonCredits;
    const presetHistory = historicalCarbonCredits.filter(c => c.regionId === activeRegion!.id);
    return presetHistory.length > 0
      ? presetHistory
      : generateCustomHistory(activeRegion!.id, activeRegion!.areaAcres);
  })();

  // Regional comparison bar data
  const regionData = displayRegions.map(r => ({
    name: r.vanVibhag.substring(0, 8),
    fullName: r.vanVibhag,
    area: r.areaAcres,
    credits: Math.round(r.areaAcres * CO2_PER_ACRE),
    income: Math.round(r.areaAcres * INCOME_PER_ACRE / 1e6),
    ndvi: r.ndviScore,
  }));

  // Yearly trends
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const top5 = isSingleRegion
    ? displayRegions
    : [...forestRegions].sort((a, b) => b.areaAcres - a.areaAcres).slice(0, 5);

  const trendData = years.map(year => {
    const entry: Record<string, number | string> = { year };
    top5.forEach(r => {
      const cc = (isSingleRegion ? regionHistory : historicalCarbonCredits)
        .find(c => c.regionId === r.id && c.year === year);
      entry[r.vanVibhag] = cc ? Math.round(cc.creditsGenerated / 1000) : 0;
    });
    return entry;
  });

  // Weather impact pie
  const weatherCounts = regionHistory.reduce((acc, c) => {
    acc[c.weatherImpact] = (acc[c.weatherImpact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const weatherPie = Object.entries(weatherCounts).map(([name, value]) => ({ name, value }));

  // Multi-metric radar
  const radarData = isSingleRegion
    ? [
        { metric: "NDVI",      value: Math.round(activeRegion!.ndviScore * 100) },
        { metric: "Forest",    value: Math.min(Math.round(activeRegion!.areaAcres / 650), 100) },
        { metric: "Carbon",    value: Math.min(Math.round(calculateCC(activeRegion!.areaAcres).credits / 1500), 100) },
        { metric: "Income",    value: Math.min(Math.round(calculateCC(activeRegion!.areaAcres).income / 2.5e6), 100) },
        { metric: "Moisture",  value: Math.round(activeRegion!.ndviScore * 85 + 10) },
        { metric: "Biodiversity", value: Math.round(activeRegion!.ndviScore * 95) },
      ]
    : forestRegions.slice(0, 8).map(r => ({
        metric: r.vanVibhag.substring(0, 7),
        value: Math.round(r.ndviScore * 100),
      }));

  // Area chart cumulative income
  const incomeAreaData = years.map(year => {
    const yearData = regionHistory.filter(c => c.year === year);
    return {
      year,
      income: Math.round(yearData.reduce((s, c) => s + c.income, 0) / 1e9 * 10) / 10,
    };
  });

  // All-region table
  const tableRows = forestRegions.map(r => {
    const cc = calculateCC(r.areaAcres);
    return { ...r, credits: cc.credits, income: cc.income };
  });

  // ── Derive region stats for the AI prompt ──────────────────────────────────
  const regionForPrompt = isSingleRegion
    ? forestRegions.find(r => r.id === activeRegion!.id) || forestRegions[0]
    : forestRegions[0];

  const ccBase = calculateCC(regionForPrompt.areaAcres, "normal");
  const ccDrought = calculateCC(regionForPrompt.areaAcres, "drought");
  const ccFlood = calculateCC(regionForPrompt.areaAcres, "flood");

  // Trend direction: compare 2019 vs 2024 credits
  const hist2019 = regionHistory.find(c => c.regionId === regionForPrompt.id && c.year === 2019);
  const hist2024 = regionHistory.find(c => c.regionId === regionForPrompt.id && c.year === 2024);
  const trendChange = hist2019 && hist2024
    ? (((hist2024.creditsGenerated - hist2019.creditsGenerated) / hist2019.creditsGenerated) * 100).toFixed(1)
    : "0";

  // ── Generate AI insights via OpenRouter ────────────────────────────────────
  const generateInsights = async () => {
    if (!OPENROUTER_KEY) {
      setAiError("OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your .env file.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);

    const regionName = isSingleRegion ? activeRegion!.name : "All Maharashtra Forest Regions";
    const vanVibhag = isSingleRegion ? (activeRegion!.vanVibhag || activeRegion!.name) : "Maharashtra";

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "http://localhost:8081",
          "X-Title": "VanCC Forest Carbon Hub",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [{
            role: "user",
            content: `You are an expert forest carbon analyst for Maharashtra, India.
Generate a detailed analytical report for the following region based on the data provided.

## Region Data
- Region: ${regionName} (${vanVibhag})
- Forest Area: ${regionForPrompt.areaAcres.toLocaleString()} acres
- NDVI Score: ${regionForPrompt.ndviScore.toFixed(2)} (scale 0–1, higher is healthier)
- Annual Carbon Credits (Normal year): ${ccBase.credits.toLocaleString()} tons CO₂
- Annual Carbon Credits (Drought year): ${ccDrought.credits.toLocaleString()} tons CO₂
- Annual Carbon Credits (Flood year): ${ccFlood.credits.toLocaleString()} tons CO₂
- Annual Income (Normal): ₹${(ccBase.income / 1e6).toFixed(1)}M
- Carbon Credit Trend (2019→2024): ${trendChange}% change
- Region Description: ${regionForPrompt.description}
- NDVI Health Status: ${regionForPrompt.ndviScore >= 0.7 ? "Excellent" : regionForPrompt.ndviScore >= 0.5 ? "Good" : "Poor — needs intervention"}

## Task
Generate 7–10 specific, data-driven bullet point insights about this region covering:
1. Current carbon credit production status
2. NDVI health trend and what it means
3. Impact of drought/flood on carbon credits (with actual numbers)
4. Revenue and income projections
5. Specific recommendations to IMPROVE carbon credits and NDVI
6. Biodiversity and ecosystem health
7. Comparison to Maharashtra average
8. Action items for forest department

Return ONLY valid JSON:
{
  "points": ["point 1", "point 2", ...],
  "summary": "2-3 sentence executive summary of the region's overall forest carbon health"
}`,
          }],
        }),
      });

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from AI");

      const parsed = JSON.parse(content);
      setAiInsights({
        points: parsed.points || [],
        summary: parsed.summary || "",
        generatedAt: new Date().toLocaleString("en-IN"),
      });
    } catch (err) {
      setAiError(`Failed to generate insights: ${String(err)}. Check your connection.`);
    }
    setAiLoading(false);
  };

  // ── Download PDF using browser print ─────────────────────────────────────
  const downloadPDF = () => {
    if (!aiInsights) return;

    const regionName = isSingleRegion ? activeRegion!.name : "All Maharashtra Forest Regions";
    const vanVibhag = isSingleRegion ? (activeRegion!.vanVibhag || regionName) : "Maharashtra";
    const ndviHealth = regionForPrompt.ndviScore >= 0.7 ? "Excellent" : regionForPrompt.ndviScore >= 0.5 ? "Good" : "Poor";

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Forest Carbon Report — ${regionName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; background: #fff; }
          .header { border-bottom: 3px solid #2d6a4f; padding-bottom: 20px; margin-bottom: 28px; }
          .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
          .logo { width: 40px; height: 40px; background: #2d6a4f; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; }
          h1 { font-size: 24px; color: #2d6a4f; font-weight: 700; }
          .subtitle { font-size: 13px; color: #555; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0; }
          .meta-card { background: #f0faf5; border: 1px solid #b7e4c7; border-radius: 8px; padding: 14px; }
          .meta-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-value { font-size: 18px; font-weight: 700; color: #2d6a4f; margin-top: 4px; }
          .section-title { font-size: 15px; font-weight: 700; color: #2d6a4f; margin: 24px 0 12px; border-left: 4px solid #2d6a4f; padding-left: 10px; }
          .summary-box { background: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.7; color: #374151; margin-bottom: 20px; }
          .insights-list { list-style: none; }
          .insights-list li { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0fdf4; font-size: 13px; line-height: 1.6; color: #374151; }
          .insights-list li:last-child { border-bottom: none; }
          .bullet { width: 22px; height: 22px; min-width: 22px; background: #2d6a4f; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
          .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #888; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-row">
            <div class="logo">🌿</div>
            <div>
              <h1>Forest Carbon Intelligence Report</h1>
              <div class="subtitle">${regionName} · ${vanVibhag} · Generated ${aiInsights.generatedAt}</div>
            </div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">Forest Area</div>
            <div class="meta-value">${regionForPrompt.areaAcres.toLocaleString()} acres</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">NDVI Score</div>
            <div class="meta-value">${regionForPrompt.ndviScore.toFixed(2)} <span style="font-size:13px;color:#555">(${ndviHealth})</span></div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Annual Carbon Credits</div>
            <div class="meta-value">${ccBase.credits.toLocaleString()} tons</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Annual Income (Normal)</div>
            <div class="meta-value">₹${(ccBase.income / 1e6).toFixed(1)}M</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Drought Impact</div>
            <div class="meta-value">${ccDrought.credits.toLocaleString()} tons</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">2019→2024 CC Trend</div>
            <div class="meta-value" style="color:${parseFloat(trendChange) >= 0 ? '#2d6a4f' : '#dc2626'}">${parseFloat(trendChange) >= 0 ? '+' : ''}${trendChange}%</div>
          </div>
        </div>

        <div class="section-title">Executive Summary</div>
        <div class="summary-box">${aiInsights.summary}</div>

        <div class="section-title">AI-Generated Insights &amp; Recommendations</div>
        <ul class="insights-list">
          ${aiInsights.points.map((point, i) => `
            <li>
              <div class="bullet">${i + 1}</div>
              <span>${point}</span>
            </li>
          `).join("")}
        </ul>

        <div class="footer">
          <span>VanCC Forest Carbon Hub · Powered by Fine-tuned LLaMA</span>
          <span>Generated: ${aiInsights.generatedAt}</span>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Analytics &amp; Reports
            {isSingleRegion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {activeRegion!.vanVibhag}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSingleRegion ? `Detailed analytics for ${activeRegion!.name}` : "Comprehensive forest carbon credit analytics — all regions"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateInsights}
            disabled={aiLoading}
            className="flex items-center gap-2"
          >
            {aiLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              : <><BrainCircuit className="h-4 w-4" /> Generate AI Insights</>
            }
          </Button>
          <Button
            variant="outline"
            onClick={downloadPDF}
            disabled={!aiInsights || aiLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      {/* ── AI Insights Panel ─────────────────────────────────────────────── */}
      {(aiLoading || aiInsights || aiError) && (
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              AI-Generated Forest Carbon Insights
              {isSingleRegion && (
                <Badge variant="secondary" className="text-xs">
                  {activeRegion!.vanVibhag}
                </Badge>
              )}
              {aiInsights && (
                <span className="text-xs font-normal text-muted-foreground ml-auto">
                  Generated {aiInsights.generatedAt}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiLoading && (
              <div className="flex items-center gap-3 text-muted-foreground py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">Analysing {isSingleRegion ? activeRegion!.name : "all regions"} with fine-tuned LLaMA…</span>
              </div>
            )}
            {aiError && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{aiError}</p>
              </div>
            )}
            {aiInsights && (
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="bg-background/70 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Executive Summary
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{aiInsights.summary}</p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2">
                  {aiInsights.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-primary/10 last:border-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>

                {/* Download CTA */}
                <div className="flex justify-end pt-2">
                  <Button onClick={downloadPDF} size="sm" variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download as PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regional CC comparison */}
        <Card className="border-none shadow-md">
          <CardHeader><CardTitle className="text-lg">
            {isSingleRegion ? "Weather Scenario Comparison" : "Regional CC Comparison"}
          </CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {isSingleRegion ? (
                <BarChart data={[
                  { scenario: "Normal", credits: calculateCC(activeRegion!.areaAcres, "normal").credits, income: Math.round(calculateCC(activeRegion!.areaAcres, "normal").income / 1e6) },
                  { scenario: "Drought", credits: calculateCC(activeRegion!.areaAcres, "drought").credits, income: Math.round(calculateCC(activeRegion!.areaAcres, "drought").income / 1e6) },
                  { scenario: "Flood", credits: calculateCC(activeRegion!.areaAcres, "flood").credits, income: Math.round(calculateCC(activeRegion!.areaAcres, "flood").income / 1e6) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="credits" fill="hsl(152,55%,33%)" name="Credits (tons)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="income" fill="hsl(145,45%,55%)" name="Income (₹M)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="credits" fill="hsl(152,55%,33%)" name="Credits (tons)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="income" fill="hsl(145,45%,55%)" name="Income (₹M)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yearly Trends */}
        <Card className="border-none shadow-md">
          <CardHeader><CardTitle className="text-lg">
            {isSingleRegion ? `Yearly CC Trend — ${activeRegion!.vanVibhag}` : "Yearly CC Trends (Top 5 Regions)"}
          </CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: "K tons", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                {top5.map((r, i) => (
                  <Line key={r.id} type="monotone" dataKey={r.vanVibhag} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weather Impact Pie */}
        <Card className="border-none shadow-md">
          <CardHeader><CardTitle className="text-lg">Weather Impact Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={weatherPie} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill="hsl(152,55%,33%)" />
                  <Cell fill="hsl(38,92%,50%)" />
                  <Cell fill="hsl(200,50%,45%)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NDVI Health Radar */}
        <Card className="border-none shadow-md">
          <CardHeader><CardTitle className="text-lg">
            {isSingleRegion ? `Health Profile — ${activeRegion!.vanVibhag}` : "NDVI Health Radar"}
          </CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(145,20%,88%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name={isSingleRegion ? activeRegion!.vanVibhag : "NDVI %"}
                  dataKey="value"
                  stroke="hsl(152,55%,33%)"
                  fill="hsl(152,55%,33%)"
                  fillOpacity={0.4}
                />
                <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income Area Chart */}
        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Total Income Trend (₹ Billion) 2019–2024</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={incomeAreaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145,20%,88%)" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`₹${v}B`, "Income"]} />
                <Area type="monotone" dataKey="income" stroke="hsl(152,55%,33%)" fill="hsl(152,55%,33%)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {isSingleRegion ? `Region Detail — ${activeRegion!.name}` : "All Regions Data Table"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Van Vibhag</TableHead>
                <TableHead>Area (Acres)</TableHead>
                <TableHead>Annual CC (tons)</TableHead>
                <TableHead>Income (₹M)</TableHead>
                <TableHead>NDVI</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isSingleRegion ? tableRows.filter(r => r.id === activeRegion!.id) : tableRows).map(r => (
                <TableRow key={r.id} className={isSingleRegion ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.vanVibhag}</TableCell>
                  <TableCell>{r.areaAcres.toLocaleString()}</TableCell>
                  <TableCell>{r.credits.toLocaleString()}</TableCell>
                  <TableCell>₹{(r.income / 1e6).toFixed(1)}M</TableCell>
                  <TableCell>{r.ndviScore.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={r.ndviScore >= 0.7 ? "default" : r.ndviScore >= 0.5 ? "secondary" : "destructive"}>
                      {r.ndviScore >= 0.7 ? "Excellent" : r.ndviScore >= 0.5 ? "Good" : "Poor"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
