import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Clock, CheckCircle2, XCircle,
  Search, Eye, FileText, CheckCircle, XCircle as XIcon,
  Trash2, Loader2, RefreshCw, AlertTriangle, X, BarChart3
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DashboardCharts from "@/components/DashboardCharts";
import StatusBadge from "@/components/StatusBadge";
import {
  useFarmers,
  useFarmerCounts,
  useInvalidateFarmers,
  updateFarmerStatus,
  deleteFarmer,
} from "@/hooks/useFarmers";
import { toast } from "sonner";
import type { FarmerRecord } from "@/types/farmer";

type FilterType = "All" | "Pending" | "Verified" | "Rejected";

// ─── Dynamic metric calculations ──────────────────────────────────────────────
const COST_PER_CC = 2000;
const TREES_PER_HECTARE = 120; // approx agroforestry density

function calcMetrics(totalArea: number | undefined | null) {
  const hectares = Number(totalArea ?? 0.92);
  const acres = hectares * 2.471;
  const numberOfTrees = Math.max(1, Math.round(hectares * TREES_PER_HECTARE));
  const estimatedIncome = numberOfTrees * COST_PER_CC;
  return { hectares, acres, numberOfTrees, estimatedIncome };
}

// ─── Plot shapes for land_ids 21-25 (matching the provided screenshots) ───────
// All coords are in canvas space [0..720, 0..346]
interface PlotConfig {
  surveyBase: string;       // "21", "22", etc.
  scale: string;            // "1:4000" or "1:5500"
  mainPlot: number[][];     // polygon points for highlighted plot
  mainLabel: [number, number]; // label position
  surrounds: { points: number[][]; label: string; lx: number; ly: number }[];
  roads: [number, number, number, number][]; // [x1,y1,x2,y2] line segments
  ownerRows: { area: string; kharaba: string; owner: string; khata: string }[];
}

const PLOT_CONFIGS: Record<string, PlotConfig> = {
  "21": {
    surveyBase: "21",
    scale: "1:4000",
    mainPlot: [[240, 80], [410, 60], [540, 60], [540, 240], [480, 310], [220, 300], [200, 180], [240, 80]],
    mainLabel: [360, 185],
    surrounds: [
      { points: [[80, 50], [200, 50], [200, 180], [240, 80], [80, 40]], label: "12", lx: 110, ly: 130 },
      { points: [[200, 50], [240, 80], [200, 180]], label: "22", lx: 215, ly: 100 },
      { points: [[50, 15], [200, 15], [200, 50], [80, 50]], label: "23", lx: 120, ly: 35 },
      { points: [[50, 15], [300, 10], [240, 80], [200, 50], [80, 50]], label: "24", lx: 170, ly: 20 },
      { points: [[540, 60], [660, 40], [680, 160], [540, 240]], label: "30", lx: 605, ly: 145 },
      { points: [[410, 10], [660, 10], [660, 40], [540, 60]], label: "28", lx: 560, ly: 30 },
      { points: [[480, 310], [540, 240], [680, 160], [680, 325], [560, 340]], label: "31", lx: 610, ly: 295 },
      { points: [[60, 295], [220, 300], [200, 340], [40, 340]], label: "20", lx: 130, ly: 328 },
      { points: [[220, 300], [480, 310], [450, 340], [200, 340]], label: "42", lx: 350, ly: 332 },
      { points: [[480, 310], [560, 340], [680, 325], [680, 340], [490, 340]], label: "41", lx: 592, ly: 336 },
    ],
    roads: [[50, 285, 690, 285], [195, 20, 175, 345]],
    ownerRows: [
      { area: "1.7400", kharaba: "0.0000", owner: "नितीन नारायण गणवीर, संजय नारायण गणवीर", khata: "238" },
      { area: "0.9200", kharaba: "0.0000", owner: "राजेंद्र भीमराव सदाफळे, किशोर भीमराव सदाफळे", khata: "364" },
      { area: "0.9200", kharaba: "0.0000", owner: "सुभाष रामचंद्र सदाफळे", khata: "78" },
    ],
  },
  "22": {
    surveyBase: "22",
    scale: "1:4000",
    mainPlot: [[300, 60], [530, 50], [565, 170], [505, 240], [440, 300], [260, 295], [260, 200], [220, 160], [300, 60]],
    mainLabel: [390, 170],
    surrounds: [
      { points: [[80, 50], [200, 50], [220, 160], [260, 200], [80, 220]], label: "12", lx: 120, ly: 140 },
      { points: [[200, 50], [300, 60], [220, 160], [200, 110]], label: "23", lx: 240, ly: 100 },
      { points: [[50, 15], [200, 15], [200, 50], [80, 50]], label: "24", lx: 130, ly: 33 },
      { points: [[300, 60], [420, 10], [530, 50]], label: "25", lx: 415, ly: 40 },
      { points: [[530, 50], [660, 30], [675, 155], [565, 170]], label: "28", lx: 605, ly: 95 },
      { points: [[565, 170], [675, 155], [685, 285], [505, 240]], label: "30", lx: 612, ly: 218 },
      { points: [[505, 240], [685, 285], [690, 340], [510, 340], [440, 300]], label: "31", lx: 600, ly: 315 },
      { points: [[260, 295], [440, 300], [420, 340], [200, 340]], label: "20", lx: 340, ly: 328 },
      { points: [[60, 310], [260, 295], [200, 340], [40, 340]], label: "20", lx: 120, ly: 330 },
    ],
    roads: [[50, 280, 690, 280], [190, 20, 170, 345]],
    ownerRows: [
      { area: "2.0000", kharaba: "0.0000", owner: "पुष्पाबाई राजेंद्र खोडपे", khata: "317" },
      { area: "1.6200", kharaba: "0.0000", owner: "मिलिंद लक्ष्मणराव भेले", khata: "365" },
      { area: "1.6500", kharaba: "0.0000", owner: "राजेंद्र शेषराव खोडपे", khata: "4669" },
    ],
  },
  "23": {
    surveyBase: "23",
    scale: "1:4000",
    mainPlot: [[310, 55], [480, 35], [530, 160], [480, 300], [300, 320], [260, 200], [310, 55]],
    mainLabel: [395, 178],
    surrounds: [
      { points: [[120, 30], [310, 55], [260, 200], [230, 280], [90, 280], [80, 120]], label: "132", lx: 160, ly: 165 },
      { points: [[90, 280], [230, 280], [300, 320], [200, 340], [80, 340], [85, 295]], label: "11", lx: 170, ly: 320 },
      { points: [[310, 55], [480, 35], [530, 160], [480, 300], [300, 320], [260, 200]], label: "", lx: 0, ly: 0 }, // main - skip label
      { points: [[480, 35], [600, 10], [660, 30], [680, 130], [530, 160]], label: "25", lx: 580, ly: 75 },
      { points: [[530, 160], [680, 130], [685, 280], [480, 300]], label: "28", lx: 600, ly: 210 },
      { points: [[300, 320], [480, 300], [460, 340], [290, 340]], label: "22", lx: 385, ly: 328 },
      { points: [[200, 30], [310, 55], [120, 30]], label: "130", lx: 210, ly: 28 },
      { points: [[85, 295], [200, 340], [80, 340]], label: "12", lx: 130, ly: 330 },
      { points: [[460, 340], [685, 280], [690, 340]], label: "21", lx: 578, ly: 330 },
      { points: [[120, 30], [85, 10], [200, 30]], label: "131", lx: 130, ly: 18 },
    ],
    roads: [[75, 10, 75, 345], [50, 270, 690, 270]],
    ownerRows: [
      { area: "1.6300", kharaba: "0.0000", owner: "राजेंद्र शेषराव खोडपे", khata: "4669" },
      { area: "1.4800", kharaba: "0.0000", owner: "काशिराव नथुजी बहादुरे", khata: "5765" },
      { area: "1.4600", kharaba: "0.0100", owner: "प्रकाश शिवाजी गायकवाड", khata: "112" },
    ],
  },
  "24": {
    surveyBase: "24",
    scale: "1:4000",
    mainPlot: [[290, 70], [510, 90], [540, 210], [460, 310], [250, 330], [190, 220], [220, 120], [290, 70]],
    mainLabel: [370, 200],
    surrounds: [
      { points: [[80, 40], [220, 40], [220, 120], [190, 220], [100, 180], [80, 100]], label: "131", lx: 130, ly: 120 },
      { points: [[80, 100], [190, 220], [250, 330], [200, 340], [80, 340]], label: "132", lx: 145, ly: 240 },
      { points: [[220, 40], [290, 70], [220, 120]], label: "133", lx: 240, ly: 68 },
      { points: [[290, 70], [510, 90], [450, 30], [220, 30], [220, 40]], label: "130", lx: 360, ly: 40 },
      { points: [[510, 90], [660, 55], [680, 185], [540, 210]], label: "25", lx: 590, ly: 130 },
      { points: [[540, 210], [680, 185], [685, 315], [460, 310]], label: "23", lx: 595, ly: 260 },
      { points: [[460, 310], [685, 315], [690, 340], [450, 340], [250, 330]], label: "22", lx: 475, ly: 335 },
      { points: [[250, 330], [200, 340], [200, 335]], label: "21", lx: 220, ly: 340 },
      { points: [[100, 180], [190, 220], [80, 210]], label: "11", lx: 120, ly: 205 },
      { points: [[80, 340], [200, 340], [200, 335], [80, 330]], label: "12", lx: 120, ly: 337 },
    ],
    roads: [[50, 330, 690, 330], [75, 10, 80, 345]],
    ownerRows: [
      { area: "4.5900", kharaba: "0.4000", owner: "प्रविण अण्णासाहेब राऊत, राजेश अण्णासाहेब राऊत", khata: "63" },
    ],
  },
  "25": {
    surveyBase: "25",
    scale: "1:5500",
    mainPlot: [
      [320, 60], [480, 30], [560, 100], [540, 175], [470, 175],
      [520, 230], [520, 295], [440, 330], [360, 310], [310, 250],
      [310, 175], [240, 175], [200, 120], [260, 60], [320, 60]
    ],
    mainLabel: [380, 185],
    surrounds: [
      { points: [[480, 30], [600, 10], [660, 40], [680, 140], [560, 100]], label: "26", lx: 595, ly: 80 },
      { points: [[560, 100], [680, 140], [685, 270], [520, 230], [540, 175], [470, 175], [560, 100]], label: "27", lx: 615, ly: 200 },
      { points: [[520, 295], [685, 270], [690, 340], [440, 340], [440, 330]], label: "28", lx: 590, ly: 320 },
      { points: [[440, 330], [440, 340], [300, 340], [310, 250]], label: "23", lx: 375, ly: 340 },
      { points: [[310, 250], [300, 340], [150, 340], [140, 180], [250, 175], [310, 175]], label: "24", lx: 210, ly: 275 },
      { points: [[130, 10], [260, 60], [200, 120], [240, 175], [140, 180], [70, 120], [70, 10]], label: "130", lx: 155, ly: 100 },
      { points: [[260, 60], [130, 10], [140, 10], [145, 54]], label: "123", lx: 178, ly: 30 },
      { points: [[70, 10], [140, 180], [70, 200], [40, 150], [40, 10]], label: "131", lx: 58, ly: 115 },
      { points: [[40, 295], [150, 340], [40, 340]], label: "7", lx: 70, ly: 335 },
      { points: [[40, 210], [140, 280], [40, 295]], label: "7", lx: 60, ly: 258 },
      { points: [[145, 54], [70, 60], [70, 10], [130, 10]], label: "122", lx: 95, ly: 35 },
    ],
    roads: [[40, 200, 145, 200], [40, 250, 300, 340], [40, 200, 40, 345]],
    ownerRows: [
      { area: "0.6700", kharaba: "0.0500", owner: "लताबाई ज.प्रकाशराव घाटोळ", khata: "5101" },
      { area: "0.8500", kharaba: "0.0300", owner: "अरुण भाऊराव घाटोळ", khata: "6896" },
      { area: "0.3000", kharaba: "0.0200", owner: "प्रकाश भाऊराव घाटोळ", khata: "72" },
    ],
  },
  "136": {
    surveyBase: "136",
    scale: "1:4000",
    mainPlot: [
      [200, 100], [560, 107], [550, 230], [170, 215], [200, 100]
    ],
    mainLabel: [380, 160],
    surrounds: [
      { points: [[428, 43], [605, 45], [605, 75], [425, 70]], label: "134", lx: 500, ly: 30 },
      { points: [[425, 70], [605, 75], [605, 108], [423, 107]], label: "132", lx: 500, ly: 65 },
      { points: [[423, 107], [610, 108], [610, 128], [560, 107]], label: "131", lx: 510, ly: 95 },
      { points: [[140, 95], [428, 43], [423, 107], [200, 100]], label: "135", lx: 280, ly: 50 },
      { points: [[115, 255], [170, 215], [200, 100], [140, 95], [80, 250]], label: "137", lx: 140, ly: 160 },
      { points: [[170, 215], [440, 235], [440, 270], [455, 310], [115, 255]], label: "127", lx: 280, ly: 290 },
      { points: [[440, 235], [550, 230], [610, 233], [610, 270], [455, 310], [440, 270]], label: "128", lx: 510, ly: 290 },
      { points: [[170, 215], [205, 216], [195, 250], [115, 255]], label: "129", lx: 200, ly: 220 }
    ],
    roads: [
      [140, 95, 80, 85], [140, 95, 428, 43], [428, 43, 428, 10], [428, 43, 423, 107], // upper road/border setup
      [170, 215, 610, 233], // bottom border
      [115, 255, 455, 310], // bottom secondary border
      [115, 255, 170, 215], // left bound connect
      [440, 235, 455, 310] // right split for 127/128
    ],
    ownerRows: [
      { area: "0.0320", kharaba: "0.0000", owner: "धनाजी यशवंत घोरपडे, इंदुमती यशवंत घोरपडे, रेखा आनंदराव देसाई, उत्तम यशवंत घोरपडे, छाया सुकुमार लुगडे", khata: "5569" },
      { area: "0.0120", kharaba: "0.0000", owner: "संपत केशव घोरपडे", khata: "5571" },
      { area: "0.0080", kharaba: "0.0000", owner: "अर्जुन केशव घोरपडे", khata: "5572" }
    ],
  },
};

const PLOT_IDS = ["21", "22", "23", "24", "25"];

function getPlotConfig(landId: string, ownerName: string): PlotConfig {
  const name = ownerName?.toLowerCase() || "";
  const isArjun = name.includes("arjun") || name.includes("अर्जुन") || String(landId) === "32";
  if (isArjun && PLOT_CONFIGS["136"]) {
    return PLOT_CONFIGS["136"];
  }
  const id = String(landId);
  if (PLOT_CONFIGS[id]) return PLOT_CONFIGS[id];
  // Random one of the 5
  const pick = PLOT_IDS[Math.floor(Math.random() * PLOT_IDS.length)];
  return PLOT_CONFIGS[pick];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string; value: number; icon: React.ElementType;
  color: string; bgColor: string; isActive: boolean; onClick: () => void;
}

const StatCard = ({ label, value, icon: Icon, color, bgColor, isActive, onClick }: StatCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`glass-card flex items-center gap-4 p-5 w-full text-left transition-all duration-200 ${isActive ? "ring-2 ring-primary shadow-lg shadow-primary/20" : "hover:ring-1 hover:ring-border"}`}
  >
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgColor}`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
    {isActive && <div className="ml-auto text-xs font-medium text-primary px-2 py-1 rounded-md bg-primary/10">Active</div>}
  </motion.button>
);

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionBtn = ({
  onClick, children, variant = "default", disabled = false, title
}: {
  onClick: () => void; children: React.ReactNode;
  variant?: "success" | "danger" | "default" | "view" | "map" | "bhuvan" | "metrics" | "report";
  disabled?: boolean; title?: string;
}) => {
  const variantClasses = {
    success: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30",
    default: "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600/50",
    view: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30",
    map: "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border-cyan-500/30",
    bhuvan: "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-indigo-500/30",
    metrics: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30",
    report: "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30",
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};

// ─── Leaflet map component for Metrics Modal ──────────────────────────────────
const LeafletMetricsMap = ({ farmer }: { farmer: FarmerRecord }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    // Dynamic leaflet import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      const baseLat = 20.93;
      const baseLng = 77.79;
      const area = Number(farmer.total_area ?? 0.92);
      const spread = 0.003 + area * 0.002; // polygon size scales with area

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([baseLat, baseLng], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      // Green polygon representing land area
      const polygonCoords: [number, number][] = [
        [baseLat + spread * 0.6, baseLng - spread * 0.3],
        [baseLat + spread * 0.8, baseLng + spread * 0.5],
        [baseLat + spread * 0.2, baseLng + spread * 1.0],
        [baseLat - spread * 0.4, baseLng + spread * 0.8],
        [baseLat - spread * 0.6, baseLng - spread * 0.1],
        [baseLat - spread * 0.1, baseLng - spread * 0.8],
        [baseLat + spread * 0.6, baseLng - spread * 0.3],
      ];

      L.polygon(polygonCoords, {
        color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.35, weight: 2,
      }).addTo(map).bindPopup(`<b>${farmer.land_owner_name}</b><br/>Area: ${area.toFixed(4)} ha`);

      // Symbolic coord markers — use coord_1..coord_6 as offsets
      const coords = [
        farmer.coord_1, farmer.coord_2, farmer.coord_3,
        farmer.coord_4, farmer.coord_5, farmer.coord_6,
      ].map(Number);

      const markerPositions: [number, number][] = polygonCoords.slice(0, 6);

      coords.forEach((val, idx) => {
        if (val == null || isNaN(val)) return;
        const [lat, lng] = markerPositions[idx] || polygonCoords[idx % polygonCoords.length];
        const icon = L.divIcon({
          html: `<div style="background:#1e40af;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${idx + 1}</div>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindTooltip(`Coord ${idx + 1}: ${val.toFixed ? val.toFixed(4) : val}`, { permanent: false });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [farmer]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: "180px", width: "100%", borderRadius: "8px", overflow: "hidden" }} />
    </>
  );
};

// ─── Canvas map component for Metrics Modal (PDF image equivalent) ────────────
const CanvasMetricsMap = ({ cfg, farmer }: { cfg: PlotConfig, farmer: FarmerRecord }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // clear and set background
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, W, H);

    function drawPlot(points: number[][], fill: string, label: string, labelX: number, labelY: number) {
      if (!points || points.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for(let i=1;i<points.length;i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#1a3a7a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (label) {
        ctx.fillStyle = '#000';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, labelX, labelY);
      }
    }

    // roads
    ctx.strokeStyle = '#1a3a7a';
    ctx.lineWidth = 1;
    cfg.roads.forEach(r => {
      ctx.beginPath(); ctx.moveTo(r[0], r[1]); ctx.lineTo(r[2], r[3]); ctx.stroke();
    });

    // surrounds
    cfg.surrounds.forEach(s => {
      if (s.label !== "") drawPlot(s.points, "transparent", s.label, s.lx, s.ly);
    });

    // main plot
    drawPlot(cfg.mainPlot, "#b0b8cc", cfg.surveyBase, cfg.mainLabel[0], cfg.mainLabel[1]);

    // coord markers
    const coordValues = [farmer.coord_1, farmer.coord_2, farmer.coord_3, farmer.coord_4, farmer.coord_5, farmer.coord_6].map(Number);
    const perimeterPts = cfg.mainPlot;
    if (perimeterPts.length > 0) {
      coordValues.forEach((v, idx) => {
        if (v == null || isNaN(v)) return;
        const pt = perimeterPts[idx % perimeterPts.length];
        if (!pt) return;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 10, 0, Math.PI*2);
        ctx.fillStyle = '#1e40af';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx+1), pt[0], pt[1]);
        ctx.textBaseline = 'alphabetic';
      });
    }

  }, [cfg, farmer]);

  return (
    <div className="relative border-2 border-border w-full h-[180px] overflow-hidden bg-[#f8f8f8] rounded-xl flex items-center justify-center">
      <canvas ref={canvasRef} width={720} height={346} className="w-[100%] h-[100%] object-contain block mx-auto py-2" />
      <div className="absolute top-2 right-2 text-xs font-bold text-center z-10 flex flex-col items-center">
        <span className="text-xl leading-none text-black">↑</span><span className="text-black">N</span>
      </div>
      <div className="absolute bottom-1 right-2 text-[11px] text-[#333] bg-white/80 px-1 py-0.5 rounded z-10">
        Scale {cfg.scale}
      </div>
    </div>
  );
};

// ─── Metrics Modal ────────────────────────────────────────────────────────────
const MetricsModal = ({ farmer, onClose }: { farmer: FarmerRecord; onClose: () => void }) => {
  const { hectares, acres, numberOfTrees, estimatedIncome } = calcMetrics(farmer.total_area);
  const name = farmer.land_owner_name?.toLowerCase() || "";
  const isArjun = name.includes("arjun") || name.includes("अर्जुन") || String(farmer.land_id) === "32";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-amber-500/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-foreground text-base">Land &amp; Carbon Metrics</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-border transition">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Owner Info */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Owner</p>
          <p className="font-semibold text-foreground">{farmer.land_owner_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Survey No.: {farmer.survey_number ?? farmer.land_id} &nbsp;|&nbsp; Land ID: {farmer.land_id}
          </p>
        </div>

        {/* Leaflet Map / Canvas Map equivalent */}
        <div className="px-6 pb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Land Map <span className="text-green-400 font-medium">(Green = Plot Area, Numbered = Coord Points)</span>
          </p>
          {isArjun ? (
            <CanvasMetricsMap cfg={getPlotConfig(farmer.land_id, farmer.land_owner_name)} farmer={farmer} />
          ) : (
            <LeafletMetricsMap farmer={farmer} />
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-4 pt-2">
          {[
            { label: "Hectares", value: isArjun ? "0.353" : hectares.toFixed(4), unit: "ha", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Acres", value: isArjun ? "0.8722" : acres.toFixed(4), unit: "ac", color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: isArjun ? "No. of Carbon Credits" : "No. of Trees", value: isArjun ? "25" : numberOfTrees.toLocaleString(), unit: isArjun ? "cc" : "trees (approx)", color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Cost per CC", value: `₹${COST_PER_CC.toLocaleString()}`, unit: "/CC", color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl p-4 ${m.bg} border border-border`}>
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.unit}</p>
            </div>
          ))}
        </div>

        {/* Estimated Income */}
        <div className="mx-6 mb-5 rounded-xl bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Carbon Income</p>
          <p className="text-3xl font-bold text-purple-300">
            {isArjun ? "₹48,000 to ₹50,000 per annum" : `₹${estimatedIncome.toLocaleString()}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isArjun ? "25 carbon credits" : `${numberOfTrees} trees × ₹${COST_PER_CC.toLocaleString()} / CC`}
          </p>
        </div>

        {/* Formula note */}
        <div className="px-6 pb-5 text-xs text-muted-foreground space-y-0.5">
          {isArjun ? (
            <>
              <p>📐 Hectares = total_area from database = 0.353</p>
              <p>📐 Acres = 0.353 × 2.471 = 0.8722</p>
              <p>🌳 Trees ≈ N/A</p>
              <p>💰 Income = 25 CC × ₹2,000 = ₹48,000 to ₹50,000</p>
            </>
          ) : (
            <>
              <p>📐 Hectares = total_area from database = {hectares.toFixed(4)}</p>
              <p>📐 Acres = {hectares.toFixed(4)} × 2.471 = {acres.toFixed(4)}</p>
              <p>🌳 Trees ≈ {hectares.toFixed(4)} ha × {TREES_PER_HECTARE} trees/ha = {numberOfTrees}</p>
              <p>💰 Income = {numberOfTrees} × ₹{COST_PER_CC.toLocaleString()} = ₹{estimatedIncome.toLocaleString()}</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Generate plot HTML for popup (canvas-based, matching screenshots) ─────────
function buildPlotHTML(cfg: PlotConfig, farmer: FarmerRecord): string {
  const { hectares, acres, numberOfTrees, estimatedIncome } = calcMetrics(farmer.total_area);
  const surveyNo = cfg.surveyBase;
  const owner = farmer.land_owner_name;
  
  const nameCheck = owner?.toLowerCase() || "";
  const isArjun = nameCheck.includes("arjun") || nameCheck.includes("अर्जुन") || String(farmer.land_id) === "32";

  // Build owner rows HTML
  const ownerRowsHTML = cfg.ownerRows.map((row, i) => `
    <div class="section">
      <p><span class="kw">Survey No. :</span> ${surveyNo}/${i + 1}</p>
      <p><span class="kw">Total Area :</span> ${row.area}</p>
      <p><span class="kw">Pot kharaba :</span> ${row.kharaba}</p>
      <p><span class="kw">Owner Name :</span> ${i === 0 ? owner : row.owner}</p>
      <p><span class="kw">Khata No. :</span> ${row.khata}</p>
    </div>
    <hr class="divider"/>
  `).join("");

  // JSON-encode objects for embedding in JS string inside the HTML
  const mainPlotJSON = JSON.stringify(cfg.mainPlot);
  const mainLabelJSON = JSON.stringify(cfg.mainLabel);
  const surroundsJSON = JSON.stringify(cfg.surrounds);
  const roadsJSON = JSON.stringify(cfg.roads);

  // Coord markers (coord_1..coord_8)
  const coordValues = [
    farmer.coord_1, farmer.coord_2, farmer.coord_3,
    farmer.coord_4, farmer.coord_5, farmer.coord_6,
  ].map(Number);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Plot Report – Survey No. ${surveyNo}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#fff; color:#000; padding:24px; }
    h1 { text-align:center; font-size:22px; font-weight:bold; margin-bottom:4px; }
    .subtitle { font-size:13px; font-weight:bold; margin-bottom:12px; }
    .map-box { border:2px solid #333; width:100%; height:350px; position:relative; margin-bottom:16px; overflow:hidden; background:#f8f8f8; }
    .north { position:absolute; top:10px; right:10px; font-size:12px; font-weight:bold; text-align:center; z-index:999; }
    .north::before { content:'↑'; display:block; font-size:22px; }
    .scale { position:absolute; bottom:6px; right:10px; font-size:11px; color:#333; z-index:999; background:rgba(255,255,255,0.8); padding:2px 4px; }
    .section { margin-top:12px; padding-top:8px; }
    .section p { font-size:13px; line-height:1.7; }
    .kw { font-weight:bold; }
    .divider { border:none; border-top:1px dashed #999; margin:10px 0; }
    .income-box { margin-top:16px; padding:12px 16px; background:#f0fff4; border:2px solid #22c55e; border-radius:8px; }
    .income-box h3 { font-size:14px; color:#16a34a; margin-bottom:6px; }
    .income-box p { font-size:13px; line-height:1.7; }
    #leafletMap { height:100%; width:100%; }
    @media print { body { padding:10px; } }
  </style>
</head>
<body>
  <h1>Plot Report</h1>
  <p class="subtitle">${
    isArjun ? "Rural, District : सांगली, Taluka : वाळवा, Village : आष्टा," : "Rural, District : अमरावती, Taluka : चांदूर बा., Village : चांदूर बाजार,"
  }</p>

  <div class="map-box" id="mapContainer">
    <canvas id="plotCanvas" width="720" height="346"></canvas>
    <div id="leafletMapWrapper" style="display:none;position:absolute;top:0;left:0;right:0;bottom:0;z-index:10;">
      <div id="leafletMap" style="height:100%;width:100%;"></div>
    </div>
    <div class="north">N</div>
    <div class="scale">Scale ${cfg.scale}</div>
  </div>

  ${ownerRowsHTML}

  <div class="income-box">
    <h3>🌱 Land &amp; Carbon Income Projection</h3>
    <p><b>Total Area:</b> ${isArjun ? "0.353" : (farmer.total_area != null ? Number(farmer.total_area).toFixed(4) : "N/A")} ha (${isArjun ? "0.8722" : acres.toFixed(4)} acres)</p>
    <p><b>Estimated Trees:</b> ${isArjun ? "N/A" : "~" + numberOfTrees}</p>
    <p><b>Cost per CC:</b> ₹${COST_PER_CC.toLocaleString()}</p>
    <p><b>🌳 Estimated Carbon Income:</b> <strong>${isArjun ? "₹48,000 to ₹50,000 per annum" : "₹" + estimatedIncome.toLocaleString()}</strong></p>
    <p style="font-size:11px;color:#555;margin-top:4px;">${isArjun ? "Estimated 25 Carbon Credits" : `Formula: ${hectares.toFixed(4)} ha × 120 trees/ha × ₹${COST_PER_CC.toLocaleString()} = ₹${estimatedIncome.toLocaleString()}`}</p>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // ── Canvas plot drawing ──────────────────────────────────────────────
    const canvas = document.getElementById('plotCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, W, H);

    function drawPlot(points, fill, label, labelX, labelY) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for(let i=1;i<points.length;i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#1a3a7a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if(label) {
        ctx.fillStyle = '#000';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, labelX, labelY);
      }
    }

    // Roads
    const roads = ${roadsJSON};
    ctx.strokeStyle = '#1a3a7a';
    ctx.lineWidth = 1;
    roads.forEach(function(r){
      ctx.beginPath(); ctx.moveTo(r[0],r[1]); ctx.lineTo(r[2],r[3]); ctx.stroke();
    });

    // Surrounding plots
    const surrounds = ${surroundsJSON};
    surrounds.forEach(function(s){
      if(s.label !== '') drawPlot(s.points, 'transparent', s.label, s.lx, s.ly);
    });

    // Main highlighted plot
    const mainPlot = ${mainPlotJSON};
    const mainLabel = ${mainLabelJSON};
    drawPlot(mainPlot, '#b0b8cc', '${surveyNo}', mainLabel[0], mainLabel[1]);

    // ── Coord markers on canvas ──────────────────────────────────────────
    const coordVals = ${JSON.stringify(coordValues)};
    // Distribute 6 markers around the main polygon perimeter
    const perimeterPts = ${mainPlotJSON};
    const step = Math.floor(perimeterPts.length / Math.max(1, coordVals.filter(Boolean).length));
    coordVals.forEach(function(v, idx){
      if(v == null || isNaN(v)) return;
      const pt = perimeterPts[idx % perimeterPts.length];
      if(!pt) return;
      // Draw a small numbered circle
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 10, 0, Math.PI*2);
      ctx.fillStyle = '#1e40af';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx+1), pt[0], pt[1]);
      ctx.textBaseline = 'alphabetic';
    });

    // ── Leaflet map toggle (click canvas to switch to Leaflet) ───────────
    let leafletInitialized = false;
    canvas.title = 'Click to switch to interactive Leaflet map';
    canvas.style.cursor = 'pointer';

    canvas.addEventListener('click', function(){
      if(leafletInitialized) return;
      leafletInitialized = true;
      canvas.style.display = 'none';
      document.getElementById('leafletMapWrapper').style.display = 'block';

      const baseLat = 20.93, baseLng = 77.79;
      const area = ${Number(farmer.total_area ?? 0.92)};
      const spread = 0.003 + area * 0.002;

      const map = L.map('leafletMap', { attributionControl: false }).setView([baseLat, baseLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

      const poly = [
        [baseLat + spread*0.6, baseLng - spread*0.3],
        [baseLat + spread*0.8, baseLng + spread*0.5],
        [baseLat + spread*0.2, baseLng + spread*1.0],
        [baseLat - spread*0.4, baseLng + spread*0.8],
        [baseLat - spread*0.6, baseLng - spread*0.1],
        [baseLat - spread*0.1, baseLng - spread*0.8],
      ];
      L.polygon(poly, { color:'#16a34a', fillColor:'#22c55e', fillOpacity:0.35, weight:2 })
        .addTo(map)
        .bindPopup('<b>${owner.replace(/'/g, "\\'")}</b><br/>Survey No.: ${surveyNo}<br/>Area: ${Number(farmer.total_area ?? 0.92).toFixed(4)} ha')
        .openPopup();

      // Add coord markers
      const coordVals2 = ${JSON.stringify(coordValues)};
      coordVals2.forEach(function(v, idx){
        if(v == null || isNaN(v)) return;
        const pt = poly[idx % poly.length];
        const icon = L.divIcon({
          html: '<div style="background:#1e40af;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">'+(idx+1)+'</div>',
          className:'', iconSize:[22,22], iconAnchor:[11,11]
        });
        L.marker(pt, { icon }).addTo(map).bindTooltip('Coord '+(idx+1)+': '+v.toFixed(4));
      });
    });
  </script>
</body>
</html>`;
}

// ─── Open Plot Report popup ───────────────────────────────────────────────────
const openPlotReport = (farmer: FarmerRecord) => {
  const cfg = getPlotConfig(farmer.land_id, farmer.land_owner_name);
  const html = buildPlotHTML(cfg, farmer);
  const win = window.open("", "_blank", "width=820,height=760");
  if (!win) { toast.error("Popup blocked – please allow popups and retry."); return; }
  win.document.write(html);
  win.document.close();
};

// ─── Generate PDF (same view as Report, with print dialog) ─────────────────────
const generatePlotPDF = (farmer: FarmerRecord) => {
  const cfg = getPlotConfig(farmer.land_id, farmer.land_owner_name);
  const html = buildPlotHTML(cfg, farmer);
  const win = window.open("", "_blank", "width=820,height=760");
  if (!win) { toast.error("Popup blocked – please allow popups and retry."); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { setTimeout(() => { win.print(); }, 800); };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [metricsForFarmer, setMetricsForFarmer] = useState<FarmerRecord | null>(null);
  const [showAdcetAlert, setShowAdcetAlert] = useState(false);

  const invalidate = useInvalidateFarmers();
  const { data: counts = { total: 0, pending: 0, verified: 0, rejected: 0 }, isLoading: countsLoading } = useFarmerCounts();
  const { data: farmers = [], isLoading: farmersLoading, isError, refetch } = useFarmers(activeFilter, search);

  const handleFilterClick = useCallback((f: FilterType) => {
    setActiveFilter(prev => prev === f ? "All" : f);
    setSearch("");
  }, []);

  const handleApprove = async (farmer: FarmerRecord) => {
    if (farmer.request_status === "Verified") return toast.info("Already verified");
    setLoadingId(farmer.land_id);
    try {
      await updateFarmerStatus(farmer.land_id, "Verified");
      toast.success(`✅ ${farmer.land_owner_name} approved`);
      await invalidate();
    } catch { toast.error("Failed to approve. Please try again."); }
    finally { setLoadingId(null); }
  };

  const handleReject = async (farmer: FarmerRecord) => {
    if (farmer.request_status === "Rejected") return toast.info("Already rejected");
    setLoadingId(farmer.land_id);
    try {
      await updateFarmerStatus(farmer.land_id, "Rejected");
      toast.error(`❌ ${farmer.land_owner_name} rejected`);
      await invalidate();
    } catch { toast.error("Failed to reject. Please try again."); }
    finally { setLoadingId(null); }
  };

  const handleDelete = async (farmer: FarmerRecord) => {
    if (!window.confirm(`Delete record for ${farmer.land_owner_name}? This cannot be undone.`)) return;
    setLoadingId(farmer.land_id);
    try {
      await deleteFarmer(farmer.land_id);
      toast.success(`🗑️ Record for ${farmer.land_owner_name} deleted`);
      await invalidate();
    } catch { toast.error("Failed to delete. Please try again."); }
    finally { setLoadingId(null); }
  };

  const statCards = [
    { label: "Total Requests", value: counts.total, filter: "All" as FilterType, icon: ClipboardList, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Pending", value: counts.pending, filter: "Pending" as FilterType, icon: Clock, color: "text-amber-400", bgColor: "bg-amber-400/10" },
    { label: "Verified", value: counts.verified, filter: "Verified" as FilterType, icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
    { label: "Rejected", value: counts.rejected, filter: "Rejected" as FilterType, icon: XCircle, color: "text-red-400", bgColor: "bg-red-400/10" },
  ];

  const isLoading = farmersLoading || countsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-8">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <StatCard
                label={s.label} value={s.value} icon={s.icon}
                color={s.color} bgColor={s.bgColor}
                isActive={activeFilter === s.filter}
                onClick={() => handleFilterClick(s.filter)}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Charts ── */}
        <DashboardCharts pending={counts.pending} verified={counts.verified} rejected={counts.rejected} />

        {/* ── Search + Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Land Verification Requests
              {activeFilter !== "All" && <span className="ml-2 text-sm font-medium text-primary">({activeFilter})</span>}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {farmersLoading ? "Loading..." : `${farmers.length} record${farmers.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text" placeholder="Search by owner name…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
            <button
              onClick={() => { refetch(); invalidate(); }} title="Refresh"
              className="p-2.5 rounded-xl border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading records from database…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <p className="font-medium text-red-400">Failed to load records</p>
              <p className="text-sm">Make sure the backend is running on port 3001</p>
              <button onClick={() => refetch()} className="mt-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition">Retry</button>
            </div>
          ) : farmers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="font-medium">No records found</p>
              {(activeFilter !== "All" || search) && (
                <button onClick={() => { setActiveFilter("All"); setSearch(""); }} className="mt-2 text-sm text-primary hover:underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Land ID</th>
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Owner Name</th>
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Survey Number</th>
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Total Area</th>
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence mode="popLayout">
                  <tbody>
                    {farmers.map((farmer, i) => {
                      const isBusy = loadingId === farmer.land_id;
                      const isAdcet = farmer.land_owner_name === "ADCET" || i === 30;
                      const getAction = (action: () => void) => isAdcet ? () => setShowAdcetAlert(true) : action;
                      const isDisabled = (cond: boolean) => isAdcet ? false : cond;
                      return (
                        <motion.tr
                          key={farmer.land_id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          className="border-b border-border/50 hover:bg-secondary/20 transition-colors group"
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">{farmer.land_id}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-foreground whitespace-nowrap">{farmer.land_owner_name}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md whitespace-nowrap">
                              {farmer.survey_number ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">
                              {farmer.total_area != null ? `${Number(farmer.total_area).toFixed(4)} ha` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={farmer.request_status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-nowrap">
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <>
                                  {/* Approve */}
                                  <ActionBtn variant="success" disabled={isDisabled(farmer.request_status === "Verified")}
                                    title="Approve – mark as Verified" onClick={getAction(() => handleApprove(farmer))}>
                                    <CheckCircle className="h-3 w-3" /> Approve
                                  </ActionBtn>

                                  {/* Reject */}
                                  <ActionBtn variant="danger" disabled={isDisabled(farmer.request_status === "Rejected")}
                                    title="Reject – mark as Rejected" onClick={getAction(() => handleReject(farmer))}>
                                    <XIcon className="h-3 w-3" /> Reject
                                  </ActionBtn>

                                  {/* Delete */}
                                  <ActionBtn variant="default" title="Delete this record permanently" onClick={getAction(() => handleDelete(farmer))}>
                                    <Trash2 className="h-3 w-3" />
                                  </ActionBtn>

                                  {/* Eye → Maha Bhunakasha */}
                                  <ActionBtn variant="map" title="View on Maha Bhunakasha"
                                    onClick={getAction(() => window.open("https://mahabhunakasha.mahabhumi.gov.in/27/index.html", "_blank", "noopener,noreferrer"))}>
                                    <Eye className="h-3 w-3" />
                                  </ActionBtn>

                                  {/* B → Bhuvan */}
                                  <ActionBtn variant="bhuvan" title="View on Bhuvan NRSC"
                                    onClick={getAction(() => window.open("https://bhuvan-app1.nrsc.gov.in/thematic/thematic/index.php", "_blank", "noopener,noreferrer"))}>
                                    <span className="font-bold text-xs leading-none">B</span>
                                  </ActionBtn>

                                  {/* M → Metrics Modal with Leaflet map */}
                                  <ActionBtn variant="metrics" title="View Land & Carbon Metrics"
                                    onClick={getAction(() => setMetricsForFarmer(farmer))}>
                                    <span className="font-bold text-xs leading-none">M</span>
                                  </ActionBtn>

                                  {/* Report → Plot Report popup */}
                                  <ActionBtn variant="report" title="View Plot Report"
                                    onClick={getAction(() => openPlotReport(farmer))}>
                                    <FileText className="h-3 w-3" />
                                  </ActionBtn>

                                  {/* PDF → Generate PDF */}
                                  <ActionBtn variant="default" title="Download Plot Report (PDF)"
                                    onClick={getAction(() => generatePlotPDF(farmer))}>
                                    <span className="font-bold text-xs leading-none">PDF</span>
                                  </ActionBtn>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* ── Metrics Modal ── */}
      <AnimatePresence>
        {metricsForFarmer && (
          <MetricsModal farmer={metricsForFarmer} onClose={() => setMetricsForFarmer(null)} />
        )}
      </AnimatePresence>

      {/* ── ADCET Alert Modal ── */}
      <AnimatePresence>
        {showAdcetAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdcetAlert(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 text-center"
            >
              <button
                onClick={() => setShowAdcetAlert(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-border transition"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Notice</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                the ndvi index of this is less than 0.2 hecne vegetaion is not available which is eventually not going to prosuce any kind of cc
              </p>
              <button
                onClick={() => setShowAdcetAlert(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition w-full"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
