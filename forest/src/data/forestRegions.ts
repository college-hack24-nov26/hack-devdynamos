export interface ForestRegion {
  id: string;
  name: string;
  vanVibhag: string;
  lat: number;
  lng: number;
  areaAcres: number;
  ndviScore: number;
  description: string;
}

export interface CarbonCreditData {
  regionId: string;
  year: number;
  creditsGenerated: number;
  income: number;
  weatherImpact: "normal" | "drought" | "flood";
}

export interface ClaimData {
  id: string;
  regionId: string;
  claimantName: string;
  areaClaimed: number;
  status: "Pending" | "Approved" | "Issued" | "Rejected";
  year: number;
  dateSubmitted: string;
}

export const CO2_PER_ACRE = 2.5; // tons per year
export const INCOME_PER_ACRE = 85000; // INR
export const DROUGHT_REDUCTION = 0.3;  // global default
export const FLOOD_REDUCTION = 0.15;   // global default

// ─── Per-region drought/flood reduction (geographically accurate) ────────────
// Vidarbha & Marathwada = semi-arid, severe drought impact (33–38%)
// Konkan coast = wet, mild drought impact (17–22%)
// Western Maharashtra = moderate impact (22–27%)
export const REGION_DROUGHT_REDUCTIONS: Record<string, number> = {
  // Marathwada — rain-shadow, worst drought impact
  "latur": 0.38, "nilanga": 0.37, "aurangabad": 0.36, "solapur": 0.38,
  // Vidarbha — semi-arid, high drought impact
  "yavatmal": 0.35, "amravati": 0.33, "nagpur": 0.32, "chandrapur": 0.30,
  "wardha": 0.31, "melghat": 0.29, "gadchiroli": 0.26, "bhandara": 0.25,
  // North Maharashtra
  "nashik": 0.27, "jalgaon": 0.26, "nandurbar": 0.23,
  // Western Maharashtra
  "pune": 0.23, "satara": 0.22, "sangli": 0.25, "kolhapur": 0.20,
  // Konkan — very wet, mild drought impact
  "ratnagiri": 0.17,
};

export const REGION_FLOOD_REDUCTIONS: Record<string, number> = {
  // Konkan coast — heavy monsoon, high flood impact
  "ratnagiri": 0.24, "kolhapur": 0.20,
  // Western Maharashtra — moderate flood impact
  "satara": 0.17, "sangli": 0.18, "pune": 0.14,
  // Vidarbha — occasional floods but less severe
  "chandrapur": 0.15, "bhandara": 0.16, "gadchiroli": 0.16, "nagpur": 0.12,
  "nandurbar": 0.18, "jalgaon": 0.17,
  // Marathwada — low flood risk
  "latur": 0.10, "aurangabad": 0.09, "solapur": 0.08,
};

export function getRegionDroughtReduction(regionId?: string): number {
  return (regionId && REGION_DROUGHT_REDUCTIONS[regionId]) || DROUGHT_REDUCTION;
}

export function getRegionFloodReduction(regionId?: string): number {
  return (regionId && REGION_FLOOD_REDUCTIONS[regionId]) || FLOOD_REDUCTION;
}

export const forestRegions: ForestRegion[] = [
  { id: "satara", name: "Satara Forest Division", vanVibhag: "Satara", lat: 17.68, lng: 74.02, areaAcres: 22000, ndviScore: 0.72, description: "Western Ghats biodiversity hotspot with dense tropical forests" },
  { id: "tadoba", name: "Tadoba-Andhari Tiger Reserve", vanVibhag: "Chandrapur", lat: 20.22, lng: 79.35, areaAcres: 45000, ndviScore: 0.78, description: "Maharashtra's oldest and largest national park, tiger habitat" },
  { id: "chandrapur", name: "Chandrapur Forest Division", vanVibhag: "Chandrapur", lat: 19.97, lng: 79.30, areaAcres: 35000, ndviScore: 0.65, description: "Rich teak forests in Vidarbha region" },
  { id: "kolhapur", name: "Kolhapur Forest Division", vanVibhag: "Kolhapur", lat: 16.70, lng: 74.24, areaAcres: 18000, ndviScore: 0.70, description: "Evergreen and semi-evergreen forests of southern Maharashtra" },
  { id: "pune", name: "Pune Forest Division", vanVibhag: "Pune", lat: 18.52, lng: 73.86, areaAcres: 15000, ndviScore: 0.58, description: "Mixed deciduous forests near urban areas" },
  { id: "nashik", name: "Nashik Forest Division", vanVibhag: "Nashik", lat: 20.00, lng: 73.78, areaAcres: 20000, ndviScore: 0.55, description: "Dry deciduous forests in northern Maharashtra" },
  { id: "amravati", name: "Amravati Forest Division", vanVibhag: "Amravati", lat: 20.93, lng: 77.75, areaAcres: 28000, ndviScore: 0.62, description: "Melghat Tiger Reserve surroundings" },
  { id: "ratnagiri", name: "Ratnagiri Forest Division", vanVibhag: "Ratnagiri", lat: 16.99, lng: 73.30, areaAcres: 16000, ndviScore: 0.75, description: "Coastal forests with mangrove ecosystems" },
  { id: "nagpur", name: "Nagpur Forest Division", vanVibhag: "Nagpur", lat: 21.15, lng: 79.09, areaAcres: 25000, ndviScore: 0.60, description: "Central Indian teak and bamboo forests" },
  { id: "aurangabad", name: "Aurangabad Forest Division", vanVibhag: "Aurangabad", lat: 19.88, lng: 75.34, areaAcres: 12000, ndviScore: 0.45, description: "Dry deciduous forests in Marathwada" },
  { id: "yavatmal", name: "Yavatmal Forest Division", vanVibhag: "Yavatmal", lat: 20.38, lng: 78.12, areaAcres: 31000, ndviScore: 0.66, description: "Mixed dry deciduous forests in eastern Vidarbha" },
  { id: "nilanga", name: "Nilanga Forest Range", vanVibhag: "Latur", lat: 18.12, lng: 76.75, areaAcres: 8500, ndviScore: 0.48, description: "Scrub and dry monsoon forests in Marathwada district" },
  { id: "latur", name: "Latur Forest Division", vanVibhag: "Latur", lat: 18.40, lng: 76.56, areaAcres: 9800, ndviScore: 0.44, description: "Semi-arid transitional forests of south-eastern Maharashtra" },
  { id: "melghat", name: "Melghat Tiger Reserve", vanVibhag: "Amravati", lat: 21.45, lng: 77.18, areaAcres: 52000, ndviScore: 0.80, description: "Dense teak forests in Satpura range, critical tiger habitat" },
  { id: "solapur", name: "Solapur Forest Division", vanVibhag: "Solapur", lat: 17.68, lng: 75.90, areaAcres: 7200, ndviScore: 0.40, description: "Sparse dry grassland and scrub forests in arid Solapur district" },
  { id: "jalgaon", name: "Jalgaon Forest Division", vanVibhag: "Jalgaon", lat: 21.00, lng: 75.56, areaAcres: 14500, ndviScore: 0.52, description: "Riparian forests along Tapti river in north Maharashtra" },
  { id: "nandurbar", name: "Nandurbar Forest Division", vanVibhag: "Nandurbar", lat: 21.37, lng: 74.24, areaAcres: 38000, ndviScore: 0.74, description: "Tribal region bordering MP with rich Satpuda forests" },
  { id: "wardha", name: "Wardha Forest Division", vanVibhag: "Wardha", lat: 20.75, lng: 78.60, areaAcres: 17000, ndviScore: 0.61, description: "Dry deciduous teak forests in Vidarbha" },
  { id: "bhandara", name: "Bhandara Forest Division", vanVibhag: "Bhandara", lat: 21.17, lng: 79.65, areaAcres: 21000, ndviScore: 0.67, description: "Dense moist forests with wetlands in east Maharashtra" },
  { id: "gadchiroli", name: "Gadchiroli Forest Division", vanVibhag: "Gadchiroli", lat: 20.18, lng: 80.00, areaAcres: 61000, ndviScore: 0.82, description: "Largest forested district of Maharashtra, dense bamboo and teak" },
  { id: "sangli", name: "Sangli Forest Division", vanVibhag: "Sangli", lat: 16.86, lng: 74.56, areaAcres: 11500, ndviScore: 0.51, description: "Dry deciduous forests along Krishna river basin in southern Maharashtra" },
  { id: "ashta", name: "Ashta Forest Range", vanVibhag: "Sangli", lat: 17.058, lng: 74.456, areaAcres: 6800, ndviScore: 0.49, description: "Scrub and riparian forests in Walwa taluka along Krishna river, Sangli district" },
];

// ─── Historical Carbon Credits (2019–2024, varied per region) ────────────────
// Each region gets its own weather pattern; normal years have ±3–12% variation
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

const YEAR_WEATHER: Record<number, Record<string, "normal" | "drought" | "flood">> = {
  2019: { satara: "normal", tadoba: "normal", chandrapur: "drought", kolhapur: "flood", pune: "normal", nashik: "drought", amravati: "drought", ratnagiri: "flood", nagpur: "normal", aurangabad: "drought", yavatmal: "normal", nilanga: "drought", latur: "drought", melghat: "normal", solapur: "drought", jalgaon: "normal", nandurbar: "flood", wardha: "normal", bhandara: "normal", gadchiroli: "flood", sangli: "drought", ashta: "drought" },
  2020: { satara: "flood", tadoba: "normal", chandrapur: "normal", kolhapur: "flood", pune: "normal", nashik: "normal", amravati: "drought", ratnagiri: "flood", nagpur: "drought", aurangabad: "drought", yavatmal: "drought", nilanga: "normal", latur: "drought", melghat: "flood", solapur: "drought", jalgaon: "normal", nandurbar: "normal", wardha: "drought", bhandara: "flood", gadchiroli: "normal", sangli: "normal", ashta: "normal" },
  2021: { satara: "flood", tadoba: "flood", chandrapur: "flood", kolhapur: "flood", pune: "flood", nashik: "normal", amravati: "normal", ratnagiri: "flood", nagpur: "flood", aurangabad: "normal", yavatmal: "flood", nilanga: "normal", latur: "drought", melghat: "normal", solapur: "normal", jalgaon: "flood", nandurbar: "flood", wardha: "flood", bhandara: "flood", gadchiroli: "flood", sangli: "flood", ashta: "flood" },
  2022: { satara: "normal", tadoba: "drought", chandrapur: "drought", kolhapur: "normal", pune: "drought", nashik: "drought", amravati: "drought", ratnagiri: "normal", nagpur: "drought", aurangabad: "drought", yavatmal: "drought", nilanga: "drought", latur: "drought", melghat: "drought", solapur: "drought", jalgaon: "drought", nandurbar: "normal", wardha: "normal", bhandara: "normal", gadchiroli: "normal", sangli: "drought", ashta: "drought" },
  2023: { satara: "normal", tadoba: "normal", chandrapur: "normal", kolhapur: "flood", pune: "normal", nashik: "normal", amravati: "normal", ratnagiri: "flood", nagpur: "normal", aurangabad: "drought", yavatmal: "normal", nilanga: "drought", latur: "normal", melghat: "flood", solapur: "drought", jalgaon: "normal", nandurbar: "normal", wardha: "normal", bhandara: "flood", gadchiroli: "flood", sangli: "normal", ashta: "normal" },
  2024: { satara: "normal", tadoba: "normal", chandrapur: "normal", kolhapur: "normal", pune: "normal", nashik: "normal", amravati: "drought", ratnagiri: "normal", nagpur: "normal", aurangabad: "normal", yavatmal: "drought", nilanga: "drought", latur: "drought", melghat: "normal", solapur: "drought", jalgaon: "normal", nandurbar: "normal", wardha: "normal", bhandara: "normal", gadchiroli: "normal", sangli: "drought", ashta: "normal" },
};

export const historicalCarbonCredits: CarbonCreditData[] = forestRegions.flatMap(region => {
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  return years.map((year, yi) => {
    const weatherImpact: "normal" | "drought" | "flood" =
      YEAR_WEATHER[year]?.[region.id] ?? "normal";
    const reduction = weatherImpact === "drought" ? DROUGHT_REDUCTION : weatherImpact === "flood" ? FLOOD_REDUCTION : 0;
    // Add ±3–10% natural variation even in normal years (deterministic per region+year)
    const varianceSeed = seededRandom(region.lat * 100 + region.lng * 10 + yi * 7);
    const variance = weatherImpact === "normal" ? 1 + (varianceSeed - 0.5) * 0.14 : 1; // ±7% in normal years
    const credits = Math.round(region.areaAcres * CO2_PER_ACRE * (1 - reduction) * variance);
    const income = Math.round(region.areaAcres * INCOME_PER_ACRE * (1 - reduction) * variance);
    return { regionId: region.id, year, creditsGenerated: credits, income, weatherImpact };
  });
});

// ─── Sample Claims ────────────────────────────────────────────────────────────
export const sampleClaims: ClaimData[] = [
  { id: "CLM001", regionId: "satara", claimantName: "Satara Van Vibhag Office", areaClaimed: 5000, status: "Approved", year: 2024, dateSubmitted: "2024-01-15" },
  { id: "CLM002", regionId: "tadoba", claimantName: "Chandrapur Forest Dept", areaClaimed: 10000, status: "Issued", year: 2024, dateSubmitted: "2024-02-20" },
  { id: "CLM003", regionId: "kolhapur", claimantName: "Kolhapur Forest Office", areaClaimed: 3000, status: "Pending", year: 2024, dateSubmitted: "2024-06-10" },
  { id: "CLM004", regionId: "pune", claimantName: "Pune Division Officer", areaClaimed: 2000, status: "Pending", year: 2024, dateSubmitted: "2024-07-05" },
  { id: "CLM005", regionId: "nagpur", claimantName: "Nagpur Forest Range", areaClaimed: 8000, status: "Approved", year: 2023, dateSubmitted: "2023-11-12" },
  { id: "CLM006", regionId: "yavatmal", claimantName: "Yavatmal Van Vibhag Officer", areaClaimed: 6200, status: "Issued", year: 2024, dateSubmitted: "2024-03-08" },
  { id: "CLM007", regionId: "gadchiroli", claimantName: "Gadchiroli Tribal Dept", areaClaimed: 15000, status: "Approved", year: 2024, dateSubmitted: "2024-04-22" },
  { id: "CLM008", regionId: "melghat", claimantName: "Melghat Tiger Reserve Office", areaClaimed: 12000, status: "Pending", year: 2024, dateSubmitted: "2024-08-01" },
  { id: "CLM009", regionId: "nilanga", claimantName: "Nilanga Forest Range Officer", areaClaimed: 1800, status: "Rejected", year: 2023, dateSubmitted: "2023-09-14" },
  { id: "CLM010", regionId: "nandurbar", claimantName: "Nandurbar Tribal Forest Dept", areaClaimed: 9500, status: "Issued", year: 2024, dateSubmitted: "2024-05-30" },
];

// ─── Helper: Calculate CC ─────────────────────────────────────────────────────
export function calculateCC(areaAcres: number, weatherImpact: "normal" | "drought" | "flood" = "normal") {
  const reduction = weatherImpact === "drought" ? DROUGHT_REDUCTION : weatherImpact === "flood" ? FLOOD_REDUCTION : 0;
  const credits = Math.round(areaAcres * CO2_PER_ACRE * (1 - reduction));
  const income = Math.round(areaAcres * INCOME_PER_ACRE * (1 - reduction));
  return { credits, income, co2Absorbed: credits };
}

// ─── Helper: Generate fallback region for custom geocoded place ───────────────
export function generateCustomRegion(name: string, lat: number, lng: number): ForestRegion {
  const seed = Math.abs(Math.round(lat * 100 + lng * 100)) % 100;
  const areaAcres = 5000 + (seed % 50) * 800;
  const ndviScore = parseFloat((0.40 + (seed % 45) * 0.01).toFixed(2));
  return {
    id: `custom_${name.toLowerCase().replace(/\s+/g, "_")}`,
    name: `${name} Forest Area`,
    vanVibhag: name,
    lat, lng, areaAcres, ndviScore,
    description: `Forest and vegetation cover around ${name} region based on satellite estimation`,
    isCustom: true,
  } as ForestRegion & { isCustom: boolean };
}

// ─── Helper: Get historical data for a custom/unknown region ─────────────────
export function generateCustomHistory(regionId: string, areaAcres: number): CarbonCreditData[] {
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  // Assign realistic varied weather per year (not all the same)
  const weatherPatterns: Array<"normal" | "drought" | "flood"> =
    ["normal", "flood", "drought", "normal", "flood", "drought"];
  return years.map((year, yi) => {
    const weatherImpact = weatherPatterns[yi];
    const reduction = weatherImpact === "drought" ? DROUGHT_REDUCTION : weatherImpact === "flood" ? FLOOD_REDUCTION : 0;
    // Deterministic variance ±3–12% per year using seeded random
    const varianceSeed = seededRandom(areaAcres * 0.01 + yi * 13);
    const variance = weatherImpact === "normal" ? 1 + (varianceSeed - 0.5) * 0.18 : 1 + (varianceSeed - 0.5) * 0.08;
    const credits = Math.round(areaAcres * CO2_PER_ACRE * (1 - reduction) * variance);
    const income = Math.round(areaAcres * INCOME_PER_ACRE * (1 - reduction) * variance);
    return { regionId, year, creditsGenerated: credits, income, weatherImpact };
  });
}


