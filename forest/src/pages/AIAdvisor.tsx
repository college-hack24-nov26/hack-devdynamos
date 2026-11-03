import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Sparkles, Wifi, WifiOff, MapPin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  forestRegions, calculateCC, INCOME_PER_ACRE, CO2_PER_ACRE,
  DROUGHT_REDUCTION, FLOOD_REDUCTION, generateCustomHistory,
  getRegionDroughtReduction, getRegionFloodReduction,
} from "@/data/forestRegions";
import { useRegion } from "@/context/RegionContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const MODEL_NAME = "openai/gpt-4o-mini";

const SUGGESTIONS = [
  "What is the carbon credit potential of the active region?",
  "How much income can this region generate annually?",
  "What happens to CC in a drought year?",
  "What strategies improve NDVI and carbon credits?",
  "Compare all Maharashtra forest regions by area",
  "What is the flood impact on this region's CC?",
];

// ── Build system prompt from active region + all data ─────────────────────────
function buildSystemPrompt(activeRegion: ReturnType<typeof useRegion>["activeRegion"]): string {
  const droughtPct = Math.round(getRegionDroughtReduction(activeRegion?.id) * 100);
  const floodPct   = Math.round(getRegionFloodReduction(activeRegion?.id) * 100);
  const allRegions = forestRegions.map(r => {
    const droughtR = getRegionDroughtReduction(r.id);
    const floodR   = getRegionFloodReduction(r.id);
    const cc = calculateCC(r.areaAcres);
    const droughtCC = Math.round(r.areaAcres * CO2_PER_ACRE * (1 - droughtR));
    return `- ${r.name} (${r.vanVibhag}): ${r.areaAcres.toLocaleString()} acres, NDVI ${r.ndviScore}, CC ${cc.credits.toLocaleString()} tons/yr, Income ₹${(cc.income / 1e6).toFixed(1)}M, drought -${Math.round(droughtR * 100)}%→${droughtCC.toLocaleString()} tons`;
  }).join("\n");

  const activeBlock = activeRegion ? (() => {
    const cc = calculateCC(activeRegion.areaAcres);
    const droughtCC = calculateCC(activeRegion.areaAcres, "drought");
    const floodCC = calculateCC(activeRegion.areaAcres, "flood");
    const hist = generateCustomHistory(activeRegion.id, activeRegion.areaAcres);
    return `
ACTIVE / SELECTED REGION:
Name: ${activeRegion.name}
Van Vibhag: ${activeRegion.vanVibhag}
Location: ${activeRegion.lat.toFixed(2)}°N, ${activeRegion.lng.toFixed(2)}°E
Description: ${activeRegion.description}
Forest Area: ${activeRegion.areaAcres.toLocaleString()} acres
NDVI Score: ${activeRegion.ndviScore} (${activeRegion.ndviScore >= 0.7 ? "Excellent" : activeRegion.ndviScore >= 0.5 ? "Good" : "Needs attention"})
Annual Carbon Credits (Normal): ${cc.credits.toLocaleString()} tons CO₂
Annual Income (Normal): ₹${(cc.income / 1e6).toFixed(1)}M (₹${cc.income.toLocaleString()})
Annual CC (Drought -${DROUGHT_REDUCTION * 100}%): ${droughtCC.credits.toLocaleString()} tons, Income ₹${(droughtCC.income / 1e6).toFixed(1)}M
Annual CC (Flood -${FLOOD_REDUCTION * 100}%): ${floodCC.credits.toLocaleString()} tons, Income ₹${(floodCC.income / 1e6).toFixed(1)}M
Historical CC (2019–2024): ${hist.map(h => `${h.year}: ${h.creditsGenerated.toLocaleString()} tons (${h.weatherImpact})`).join(", ")}
`;
  })() : "No specific region selected — answer for Maharashtra as a whole.";

  return `You are VanCC AI, an expert forest carbon credit assistant for Maharashtra Van Vibhag (Forest Divisions).
You help forest officers, government staff, and researchers understand carbon credits, NDVI, weather impacts, and income potentials.

Key constants:
- CO₂ sequestration rate: ${CO2_PER_ACRE} tons/acre/year
- Income rate: ₹${INCOME_PER_ACRE.toLocaleString()} per acre
- Drought reduces CC by ${droughtPct}% for this region (varies 17–38% depending on geography)
- Flood reduces CC by ${floodPct}% for this region (varies 8–24% depending on geography)
- Marathwada/Vidarbha drought impact: 30–38% | Konkan: 17–22% | Western MH: 20–27%

${activeBlock}

ALL MAHARASHTRA VAN VIBHAG REGIONS:
${allRegions}

Instructions:
- You are a specialist. ONLY answer questions about forests, carbon credits, NDVI, vegetation, weather impacts on forests, forest income, afforestation, Maharashtra Van Vibhag regions, or this VanCC application.
- When asked about "this region", "active region", or "current region", use the ACTIVE REGION data above.
- Use specific numbers from the data above whenever possible.
- Keep answers SHORT, PRECISE and CRISP — use bullet points or a small table, avoid long paragraphs.
- If 2025 or future year data is asked, estimate using historical growth trends from the data.
- For questions completely unrelated to forests/carbon (e.g. sports, movies, cooking), reply: "Sorry, I am not meant for this purpose. Try asking me anything related to carbon credits or forest."
`;
}

// ── Topic guard ─────────────────────────────────────────────────────────
const FOREST_KEYWORDS = [
  // Core topics
  "carbon", "credit", "forest", "ndvi", "tree", "vegetation", "acre", "income",
  "drought", "flood", "rain", "weather", "climate", "van vibhag", "maharashtra",
  "co2", "sequestration", "afforestation", "teak", "bamboo", "national park",
  "tiger", "reserve", "soil", "erosion", "biodiversity", "habitat", "ecosystem", "mangrove",
  "lulc", "bhuvan", "isro", "nrsc", "land use", "land cover", "vancc",
  // Maharashtra regions
  "satara", "tadoba", "chandrapur", "nagpur", "nashik", "amravati", "kolhapur",
  "pune", "yavatmal", "nilanga", "latur", "gadchiroli", "nandurbar", "wardha",
  "bhandara", "melghat", "ratnagiri", "konkan", "vidarbha", "marathwada",
  // Action/quantity words that almost always mean forest context in this app
  "region", "area", "produce", "produced", "generate", "generated", "potential",
  "annual", "yearly", "2019", "2020", "2021", "2022", "2023", "2024", "2025",
  "how much", "how many", "what is", "estimate", "project", "predict",
  "this year", "last year", "next year", "ton", "tonne", "rupee", "crore", "lakh",
];

const OFF_TOPIC_REPLY =
  "Sorry, I am not meant for this purpose. Try asking me anything related to the carbon credits or forest.";

function isOffTopic(question: string): boolean {
  const q = question.toLowerCase();
  return !FOREST_KEYWORDS.some(kw => q.includes(kw));
}

// ── Local fallback (offline fallback) ───────────────────────────────────
function localFallback(question: string, activeRegion: ReturnType<typeof useRegion>["activeRegion"]): string {
  if (isOffTopic(question)) return OFF_TOPIC_REPLY;
  const q = question.toLowerCase();
  const region = activeRegion
    ? { ...activeRegion, ...calculateCC(activeRegion.areaAcres) }
    : null;
  const matchedPreset = forestRegions.find(r =>
    q.includes(r.vanVibhag.toLowerCase()) || q.includes(r.id)
  );
  const target = matchedPreset ? { ...matchedPreset, ...calculateCC(matchedPreset.areaAcres) } : region;

  if (target && q.includes("drought")) {
    const regionId = (target as { id?: string }).id;
    const dRate = getRegionDroughtReduction(regionId);
    const dPct  = Math.round(dRate * 100);
    const n = calculateCC(target.areaAcres, "normal");
    const dCredits = Math.round(target.areaAcres * CO2_PER_ACRE * (1 - dRate));
    const dIncome  = Math.round(target.areaAcres * INCOME_PER_ACRE * (1 - dRate));
    return `## ${target.name} — Drought Year\n\n🌵 Drought reduces CC by **${dPct}%** for this region\n\n| Metric | Normal | Drought |\n|--------|--------|---------|\n| Carbon Credits | ${n.credits.toLocaleString()} tons | ${dCredits.toLocaleString()} tons |\n| Income | ₹${(n.income / 1e6).toFixed(1)}M | ₹${(dIncome / 1e6).toFixed(1)}M |\n\n**Why ${dPct}%:** ${dPct >= 35 ? "Severe semi-arid / rain-shadow zone" : dPct >= 28 ? "Moderate semi-arid conditions" : "Well-watered region, mild drought impact"}\n\n**Recommendations:** Drought-resistant species, rainwater harvesting, mulching, weekly NDVI monitoring.`;
  }
  if (target && q.includes("flood")) {
    const regionId = (target as { id?: string }).id;
    const fRate = getRegionFloodReduction(regionId);
    const fPct  = Math.round(fRate * 100);
    const n = calculateCC(target.areaAcres, "normal");
    const fCredits = Math.round(target.areaAcres * CO2_PER_ACRE * (1 - fRate));
    const fIncome  = Math.round(target.areaAcres * INCOME_PER_ACRE * (1 - fRate));
    return `## ${target.name} — Flood Impact\n\n🌊 Flood reduces CC by **${fPct}%** for this region\n\n| Metric | Normal | Flood |\n|--------|--------|-------|\n| Credits | ${n.credits.toLocaleString()} | ${fCredits.toLocaleString()} |\n| Income | ₹${(n.income / 1e6).toFixed(1)}M | ₹${(fIncome / 1e6).toFixed(1)}M |\n\n**Why ${fPct}%:** ${fPct >= 20 ? "High-rainfall coastal region, severe flooding risk" : fPct >= 15 ? "Moderate flood exposure" : "Low-lying arid region, limited flood damage"}\n\n**Mitigation:** Check dams, drainage improvement, deep-rooted species.`;
  }
  if (target && (q.includes("income") || q.includes("earn") || q.includes("money") || q.includes("potential"))) {
    return `## ${target.name} — Income Potential\n\n💰 **Annual income: ₹${(target.income / 1e6).toFixed(2)}M** (₹${target.income.toLocaleString()})\n\n- Area: ${target.areaAcres.toLocaleString()} acres\n- Rate: ₹${INCOME_PER_ACRE.toLocaleString()}/acre\n- Carbon Credits: ${target.credits.toLocaleString()} tons CO₂/year\n- NDVI: ${(target as { ndviScore?: number }).ndviScore ?? activeRegion?.ndviScore ?? "N/A"}`;
  }
  if (q.includes("compare") || q.includes("all region")) {
    const rows = forestRegions.map(r => {
      const cc = calculateCC(r.areaAcres);
      return `| ${r.vanVibhag} | ${r.areaAcres.toLocaleString()} | ${cc.credits.toLocaleString()} | ₹${(cc.income / 1e6).toFixed(1)}M | ${r.ndviScore} |`;
    }).join("\n");
    return `## Maharashtra Van Vibhag — All Regions\n\n| Region | Area (acres) | Credits (tons) | Income | NDVI |\n|--------|-------------|----------------|--------|------|\n${rows}`;
  }
  if (target) {
    return `## ${target.name}\n\n- **Area:** ${target.areaAcres.toLocaleString()} acres\n- **NDVI:** ${(target as { ndviScore?: number }).ndviScore ?? "N/A"}\n- **Annual CC:** ${target.credits.toLocaleString()} tons CO₂\n- **Income:** ₹${(target.income / 1e6).toFixed(2)}M/year`;
  }
  return `## VanCC Forest Assistant\n\nI can answer questions about:\n- 🌳 Region analysis (Satara, Tadoba, Nilanga, etc.)\n- 💧 Drought & flood impact on carbon credits\n- 📊 Regional comparisons\n- 💡 Strategies to increase CC production`;
}

export default function AIAdvisor() {
  const { activeRegion } = useRegion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = text || input;
    if (!question.trim() || loading) return;

    // ── Topic guard: block off-topic questions immediately ────────────────────
    if (isOffTopic(question)) {
      setMessages(prev => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: OFF_TOPIC_REPLY },
      ]);
      setInput("");
      return;
    }

    const userMsg: Message = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // ── OpenRouter streaming call ──────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(activeRegion);
    const assistantMsgIdx = messages.length + 1; // index after user msg is added

    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      if (!OPENROUTER_KEY) {
        throw new Error("No API key configured");
      }
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "http://localhost:8080",
          "X-Title": "VanCC Forest Carbon Hub",
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          stream: true,
        }),
      });

      if (!res.ok || !res.body) throw new Error("API request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed === "data: [DONE]") break;
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[assistantMsgIdx] = { role: "assistant", content: fullText, streaming: true };
                  return updated;
                });
              }
            } catch { /* skip malformed chunk */ }
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        if (updated[assistantMsgIdx]) {
          updated[assistantMsgIdx] = { role: "assistant", content: fullText, streaming: false };
        }
        return updated;
      });
    } catch (err) {
      const fallback = localFallback(question, activeRegion);
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantMsgIdx] = { role: "assistant", content: fallback };
        return updated;
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] p-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> AI Forest Advisor
          {/* Status badge */}
          <Badge
            variant={OPENROUTER_KEY ? "default" : "secondary"}
            className="flex items-center gap-1 text-xs"
          >
            {OPENROUTER_KEY ? (
              <>
                <Wifi className="h-3 w-3" /> Fine-tuned LLaMA Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> Local Advisor Mode
              </>
            )}
          </Badge>
          {activeRegion && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" /> {activeRegion.vanVibhag}
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Powered by Fine-tuned LLaMA — asks answered using region data
        </p>
      </div>

      {/* Suggestions / Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <Sparkles className="h-16 w-16 text-primary/30" />
          <p className="text-lg text-muted-foreground">Ask me anything about forest carbon credits</p>
          <div className="flex flex-wrap gap-2 max-w-2xl justify-center">
            {SUGGESTIONS.map((s, i) => (
              <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => handleSend(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <Card className={`max-w-2xl border-none shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                <CardContent className="p-4">
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-green max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content || "▌"}</ReactMarkdown>
                      {msg.streaming && <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5" />}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </CardContent>
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <Card className="border-none shadow-sm bg-card">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="animate-pulse">Thinking...</Badge>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <Input
          placeholder="Ask Fine-tuned LLaMA about forest carbon credits..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="bg-card"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
