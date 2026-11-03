export interface Farmer {
  id: string;
  ownerName: string;
  landId: string;
  aadhaarNumber: string;
  submissionDate: string;
  status: "Pending" | "Verified" | "Rejected";
  coordinates: { lat: number; lng: number }[];
  landArea: number; // in acres
  district: string;
  taluka: string;
  village: string;
}

export const farmers: Farmer[] = [
  {
    id: "LV-2024-001",
    ownerName: "Rajesh Kumar Sharma",
    landId: "MH-PUN-2024-4821",
    aadhaarNumber: "XXXX-XXXX-3847",
    submissionDate: "2024-12-15",
    status: "Pending",
    coordinates: [
      { lat: 18.5204, lng: 73.8567 },
      { lat: 18.5214, lng: 73.8577 },
      { lat: 18.5224, lng: 73.8567 },
      { lat: 18.5214, lng: 73.8557 },
    ],
    landArea: 3.2,
    district: "Pune",
    taluka: "Haveli",
    village: "Kharadi",
  },
  {
    id: "LV-2024-002",
    ownerName: "Sunita Devi Patil",
    landId: "MH-NAS-2024-7192",
    aadhaarNumber: "XXXX-XXXX-9124",
    submissionDate: "2024-12-18",
    status: "Verified",
    coordinates: [
      { lat: 19.9975, lng: 73.7898 },
      { lat: 19.9985, lng: 73.7908 },
      { lat: 19.9995, lng: 73.7898 },
      { lat: 19.9985, lng: 73.7888 },
    ],
    landArea: 5.1,
    district: "Nashik",
    taluka: "Sinnar",
    village: "Dindori",
  },
  {
    id: "LV-2024-003",
    ownerName: "Amit Prakash Jadhav",
    landId: "MH-SAT-2024-3351",
    aadhaarNumber: "XXXX-XXXX-6738",
    submissionDate: "2025-01-02",
    status: "Pending",
    coordinates: [
      { lat: 17.6599, lng: 75.9064 },
      { lat: 17.6609, lng: 75.9074 },
      { lat: 17.6619, lng: 75.9064 },
      { lat: 17.6609, lng: 75.9054 },
    ],
    landArea: 2.8,
    district: "Satara",
    taluka: "Karad",
    village: "Masur",
  },
  {
    id: "LV-2024-004",
    ownerName: "Meena Bai Thorat",
    landId: "MH-AHM-2024-5563",
    aadhaarNumber: "XXXX-XXXX-2156",
    submissionDate: "2025-01-05",
    status: "Rejected",
    coordinates: [
      { lat: 19.0948, lng: 74.7480 },
      { lat: 19.0958, lng: 74.7490 },
      { lat: 19.0968, lng: 74.7480 },
      { lat: 19.0958, lng: 74.7470 },
    ],
    landArea: 1.5,
    district: "Ahmednagar",
    taluka: "Shrirampur",
    village: "Belapur",
  },
  {
    id: "LV-2024-005",
    ownerName: "Ganesh Vitthal More",
    landId: "MH-SOL-2024-8894",
    aadhaarNumber: "XXXX-XXXX-4492",
    submissionDate: "2025-01-10",
    status: "Verified",
    coordinates: [
      { lat: 20.9042, lng: 75.5614 },
      { lat: 20.9052, lng: 75.5624 },
      { lat: 20.9062, lng: 75.5614 },
      { lat: 20.9052, lng: 75.5604 },
    ],
    landArea: 7.4,
    district: "Solapur",
    taluka: "Pandharpur",
    village: "Mohol",
  },
  {
    id: "LV-2024-006",
    ownerName: "Priya Sanjay Kulkarni",
    landId: "MH-KOL-2024-1127",
    aadhaarNumber: "XXXX-XXXX-7831",
    submissionDate: "2025-01-12",
    status: "Pending",
    coordinates: [
      { lat: 16.7050, lng: 74.2433 },
      { lat: 16.7060, lng: 74.2443 },
      { lat: 16.7070, lng: 74.2433 },
      { lat: 16.7060, lng: 74.2423 },
    ],
    landArea: 4.0,
    district: "Kolhapur",
    taluka: "Karvir",
    village: "Panhala",
  },
  {
    id: "LV-2024-007",
    ownerName: "Vikram Ashok Deshmukh",
    landId: "MH-AUR-2024-6645",
    aadhaarNumber: "XXXX-XXXX-5289",
    submissionDate: "2025-01-15",
    status: "Verified",
    coordinates: [
      { lat: 19.8762, lng: 75.3433 },
      { lat: 19.8772, lng: 75.3443 },
      { lat: 19.8782, lng: 75.3433 },
      { lat: 19.8772, lng: 75.3423 },
    ],
    landArea: 6.2,
    district: "Aurangabad",
    taluka: "Phulambri",
    village: "Khuldabad",
  },
  {
    id: "LV-2024-008",
    ownerName: "Lakshmi Narayan Bhosle",
    landId: "MH-JLG-2024-2238",
    aadhaarNumber: "XXXX-XXXX-1674",
    submissionDate: "2025-01-20",
    status: "Pending",
    coordinates: [
      { lat: 17.3297, lng: 76.8343 },
      { lat: 17.3307, lng: 76.8353 },
      { lat: 17.3317, lng: 76.8343 },
      { lat: 17.3307, lng: 76.8333 },
    ],
    landArea: 3.9,
    district: "Jalgaon",
    taluka: "Chopda",
    village: "Raver",
  },
  {
    id: "LV-2024-009",
    ownerName: "Anand Maruti Gaikwad",
    landId: "MH-BID-2024-9971",
    aadhaarNumber: "XXXX-XXXX-8345",
    submissionDate: "2025-02-01",
    status: "Rejected",
    coordinates: [
      { lat: 18.9899, lng: 75.7600 },
      { lat: 18.9909, lng: 75.7610 },
      { lat: 18.9919, lng: 75.7600 },
      { lat: 18.9909, lng: 75.7590 },
    ],
    landArea: 2.1,
    district: "Beed",
    taluka: "Ashti",
    village: "Georai",
  },
  {
    id: "LV-2024-010",
    ownerName: "Kavita Ramesh Wagh",
    landId: "MH-NGP-2024-4456",
    aadhaarNumber: "XXXX-XXXX-6023",
    submissionDate: "2025-02-10",
    status: "Pending",
    coordinates: [
      { lat: 21.1458, lng: 79.0882 },
      { lat: 21.1468, lng: 79.0892 },
      { lat: 21.1478, lng: 79.0882 },
      { lat: 21.1468, lng: 79.0872 },
    ],
    landArea: 8.7,
    district: "Nagpur",
    taluka: "Kamptee",
    village: "Parseoni",
  },
];

export function getRandomFarmers(count: number = 4): Farmer[] {
  const shuffled = [...farmers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
