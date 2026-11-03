// Mock Data for Government Carbon Credit Admin Portal

export interface Farmer {
  id: string;
  name: string;
  state: string;
  district: string;
  landArea: number;
  cropType: string;
  walletAddress: string;
  coordinates: { lat: number; lng: number };
  registeredDate: string;
  phone?: string;
  aadhaarVerified?: boolean;
  monthlyPayments?: MonthlyPayment[];
  yearlyEarnings?: YearlyEarning[];
}

export interface MonthlyPayment {
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
  paidDate?: string;
}

export interface YearlyEarning {
  year: number;
  carbonCredits: number;
  earnings: number;
}

export interface Project {
  id: string;
  farmerId: string;
  farmerName: string;
  state: string;
  district: string;
  landArea: number;
  cropType: string;
  projectType: 'afforestation' | 'regenerative_agriculture' | 'agroforestry' | 'solar_farming';
  status: 'pending' | 'approved' | 'rejected' | 'minted';
  estimatedCredits: number;
  mintedCredits: number;
  confidenceScore: number;
  submittedDate: string;
  approvedDate?: string;
  coordinates: { lat: number; lng: number };
  documentsVerified?: boolean;
  landSurveyComplete?: boolean;
  soilTestPassed?: boolean;
  ndviScore?: number;
  revenuePerYear?: number;
}

export interface StateStats {
  state: string;
  stateCode: string;
  totalProjects: number;
  approvedProjects: number;
  totalCredits: number;
  mintedCredits: number;
  awarenessIndex: number;
  fairnessIndex: number;
  contribution: number;
  coordinates: { lat: number; lng: number };
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  amount: number;
  mintedOn: string;
  txHash: string;
  status: 'predicted' | 'verified' | 'minted' | 'allocated' | 'retired';
}

export interface AIInsight {
  id: string;
  region: string;
  issue: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  suggestedActions: string[];
  confidence: number;
  category: 'awareness' | 'performance' | 'leakage' | 'opportunity';
  predictedOutcome?: PredictedOutcome;
}

export interface PredictedOutcome {
  before: number[];
  after: number[];
  months: string[];
  improvementPercent: number;
}

// Farmers data with enhanced details
export const farmers: Farmer[] = [
  { 
    id: '136/1', name: 'Arjun Ghorpade', state: 'Maharashtra', district: 'Sangli', landArea: 0.353, cropType: 'Rice', 
    walletAddress: '0x1a2b3c...', coordinates: { lat: 24.79, lng: 85.00 }, registeredDate: '2025-08-15',
    phone: '+91 98765 43210', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 12500, status: 'paid', paidDate: '2026-01-05' },
      { month: 'Dec', year: 2025, amount: 12500, status: 'paid', paidDate: '2025-12-08' },
      { month: 'Nov', year: 2025, amount: 12500, status: 'paid', paidDate: '2025-11-10' },
      { month: 'Oct', year: 2025, amount: 12500, status: 'paid', paidDate: '2025-10-07' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 160, earnings: 120000 },
      { year: 2024, carbonCredits: 180, earnings: 135000 },
      { year: 2025, carbonCredits: 200, earnings: 150000 },
    ]
  },
  { 
    id: 'F002', name: 'Amit Singh', state: 'Punjab', district: 'Ludhiana', landArea: 5.2, cropType: 'Wheat', 
    walletAddress: '0x4d5e6f...', coordinates: { lat: 30.90, lng: 75.85 }, registeredDate: '2025-09-02',
    phone: '+91 87654 32109', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 26000, status: 'pending' },
      { month: 'Dec', year: 2025, amount: 26000, status: 'paid', paidDate: '2025-12-12' },
      { month: 'Nov', year: 2025, amount: 26000, status: 'paid', paidDate: '2025-11-08' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 350, earnings: 262500 },
      { year: 2024, carbonCredits: 380, earnings: 285000 },
      { year: 2025, carbonCredits: 416, earnings: 312000 },
    ]
  },
  { 
    id: 'F003', name: 'Priya Devi', state: 'Maharashtra', district: 'Nagpur', landArea: 3.8, cropType: 'Cotton', 
    walletAddress: '0x7g8h9i...', coordinates: { lat: 21.14, lng: 79.08 }, registeredDate: '2025-07-22',
    phone: '+91 76543 21098', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 19000, status: 'processing' },
      { month: 'Dec', year: 2025, amount: 19000, status: 'paid', paidDate: '2025-12-06' },
      { month: 'Nov', year: 2025, amount: 19000, status: 'paid', paidDate: '2025-11-05' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 250, earnings: 187500 },
      { year: 2024, carbonCredits: 275, earnings: 206250 },
      { year: 2025, carbonCredits: 304, earnings: 228000 },
    ]
  },
  { 
    id: 'F004', name: 'Suresh Patel', state: 'Gujarat', district: 'Ahmedabad', landArea: 4.1, cropType: 'Groundnut', 
    walletAddress: '0xj1k2l3...', coordinates: { lat: 23.02, lng: 72.57 }, registeredDate: '2025-10-05',
    phone: '+91 65432 10987', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 20500, status: 'paid', paidDate: '2026-01-08' },
      { month: 'Dec', year: 2025, amount: 20500, status: 'paid', paidDate: '2025-12-10' },
    ],
    yearlyEarnings: [
      { year: 2024, carbonCredits: 280, earnings: 210000 },
      { year: 2025, carbonCredits: 328, earnings: 246000 },
    ]
  },
  { 
    id: 'F005', name: 'Kavitha Reddy', state: 'Telangana', district: 'Hyderabad', landArea: 6.0, cropType: 'Rice', 
    walletAddress: '0xm4n5o6...', coordinates: { lat: 17.38, lng: 78.48 }, registeredDate: '2025-06-18',
    phone: '+91 54321 09876', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 30000, status: 'paid', paidDate: '2026-01-03' },
      { month: 'Dec', year: 2025, amount: 30000, status: 'paid', paidDate: '2025-12-05' },
      { month: 'Nov', year: 2025, amount: 30000, status: 'paid', paidDate: '2025-11-07' },
      { month: 'Oct', year: 2025, amount: 30000, status: 'paid', paidDate: '2025-10-06' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 400, earnings: 300000 },
      { year: 2024, carbonCredits: 440, earnings: 330000 },
      { year: 2025, carbonCredits: 480, earnings: 360000 },
    ]
  },
  { 
    id: 'F006', name: 'Mohammed Ali', state: 'Karnataka', district: 'Bangalore', landArea: 2.8, cropType: 'Ragi', 
    walletAddress: '0xp7q8r9...', coordinates: { lat: 12.97, lng: 77.59 }, registeredDate: '2025-11-12',
    phone: '+91 43210 98765', aadhaarVerified: false,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 14000, status: 'pending' },
      { month: 'Dec', year: 2025, amount: 14000, status: 'pending' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 224, earnings: 168000 },
    ]
  },
  { 
    id: 'F007', name: 'Lakshmi Nair', state: 'Kerala', district: 'Kochi', landArea: 1.5, cropType: 'Coconut', 
    walletAddress: '0xs1t2u3...', coordinates: { lat: 9.93, lng: 76.26 }, registeredDate: '2025-05-30',
    phone: '+91 32109 87654', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 15000, status: 'paid', paidDate: '2026-01-04' },
      { month: 'Dec', year: 2025, amount: 15000, status: 'paid', paidDate: '2025-12-06' },
      { month: 'Nov', year: 2025, amount: 15000, status: 'paid', paidDate: '2025-11-05' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 96, earnings: 144000 },
      { year: 2024, carbonCredits: 108, earnings: 162000 },
      { year: 2025, carbonCredits: 120, earnings: 180000 },
    ]
  },
  { 
    id: 'F008', name: 'Deepak Sharma', state: 'Uttar Pradesh', district: 'Lucknow', landArea: 7.2, cropType: 'Sugarcane', 
    walletAddress: '0xv4w5x6...', coordinates: { lat: 26.84, lng: 80.94 }, registeredDate: '2025-08-28',
    phone: '+91 21098 76543', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 36000, status: 'paid', paidDate: '2026-01-07' },
      { month: 'Dec', year: 2025, amount: 36000, status: 'paid', paidDate: '2025-12-09' },
      { month: 'Nov', year: 2025, amount: 36000, status: 'paid', paidDate: '2025-11-08' },
      { month: 'Oct', year: 2025, amount: 36000, status: 'paid', paidDate: '2025-10-10' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 480, earnings: 360000 },
      { year: 2024, carbonCredits: 520, earnings: 390000 },
      { year: 2025, carbonCredits: 576, earnings: 432000 },
    ]
  },
  { 
    id: 'F009', name: 'Anita Kumari', state: 'Madhya Pradesh', district: 'Bhopal', landArea: 4.5, cropType: 'Soybean', 
    walletAddress: '0xy7z8a9...', coordinates: { lat: 23.26, lng: 77.41 }, registeredDate: '2025-04-12',
    phone: '+91 10987 65432', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 22500, status: 'paid', paidDate: '2026-01-06' },
      { month: 'Dec', year: 2025, amount: 22500, status: 'paid', paidDate: '2025-12-08' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 300, earnings: 225000 },
      { year: 2024, carbonCredits: 330, earnings: 247500 },
      { year: 2025, carbonCredits: 360, earnings: 270000 },
    ]
  },
  { 
    id: 'F010', name: 'Vikram Yadav', state: 'Haryana', district: 'Karnal', landArea: 8.5, cropType: 'Wheat', 
    walletAddress: '0xb1c2d3...', coordinates: { lat: 29.68, lng: 76.99 }, registeredDate: '2025-03-20',
    phone: '+91 09876 54321', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 42500, status: 'processing' },
      { month: 'Dec', year: 2025, amount: 42500, status: 'paid', paidDate: '2025-12-11' },
      { month: 'Nov', year: 2025, amount: 42500, status: 'paid', paidDate: '2025-11-09' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 560, earnings: 420000 },
      { year: 2024, carbonCredits: 620, earnings: 465000 },
      { year: 2025, carbonCredits: 680, earnings: 510000 },
    ]
  },
  { 
    id: 'F011', name: 'Meena Devi', state: 'Rajasthan', district: 'Jaipur', landArea: 3.2, cropType: 'Mustard', 
    walletAddress: '0xe4f5g6...', coordinates: { lat: 26.92, lng: 75.78 }, registeredDate: '2025-07-08',
    phone: '+91 98765 12340', aadhaarVerified: false,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 16000, status: 'pending' },
      { month: 'Dec', year: 2025, amount: 16000, status: 'pending' },
    ],
    yearlyEarnings: [
      { year: 2024, carbonCredits: 220, earnings: 165000 },
      { year: 2025, carbonCredits: 256, earnings: 192000 },
    ]
  },
  { 
    id: 'F012', name: 'Raju Patil', state: 'Maharashtra', district: 'Pune', landArea: 5.8, cropType: 'Grapes', 
    walletAddress: '0xh7i8j9...', coordinates: { lat: 18.52, lng: 73.85 }, registeredDate: '2025-02-15',
    phone: '+91 87654 09871', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 58000, status: 'paid', paidDate: '2026-01-05' },
      { month: 'Dec', year: 2025, amount: 58000, status: 'paid', paidDate: '2025-12-07' },
      { month: 'Nov', year: 2025, amount: 58000, status: 'paid', paidDate: '2025-11-06' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 380, earnings: 570000 },
      { year: 2024, carbonCredits: 420, earnings: 630000 },
      { year: 2025, carbonCredits: 464, earnings: 696000 },
    ]
  },
  { 
    id: 'F013', name: 'Ramesh Gupta', state: 'Uttar Pradesh', district: 'Meerut', landArea: 10.0, cropType: 'Wheat', 
    walletAddress: '0xk8l9m0...', coordinates: { lat: 28.98, lng: 77.70 }, registeredDate: '2025-01-10',
    phone: '+91 98765 11111', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 50000, status: 'paid', paidDate: '2026-01-02' },
      { month: 'Dec', year: 2025, amount: 50000, status: 'paid', paidDate: '2025-12-03' },
      { month: 'Nov', year: 2025, amount: 50000, status: 'paid', paidDate: '2025-11-04' },
      { month: 'Oct', year: 2025, amount: 50000, status: 'paid', paidDate: '2025-10-05' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 650, earnings: 487500 },
      { year: 2024, carbonCredits: 720, earnings: 540000 },
      { year: 2025, carbonCredits: 800, earnings: 600000 },
    ]
  },
  { 
    id: 'F014', name: 'Sunita Sharma', state: 'Punjab', district: 'Patiala', landArea: 12.5, cropType: 'Rice', 
    walletAddress: '0xn1o2p3...', coordinates: { lat: 30.32, lng: 76.38 }, registeredDate: '2024-12-15',
    phone: '+91 87654 22222', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 62500, status: 'paid', paidDate: '2026-01-01' },
      { month: 'Dec', year: 2025, amount: 62500, status: 'paid', paidDate: '2025-12-02' },
      { month: 'Nov', year: 2025, amount: 62500, status: 'paid', paidDate: '2025-11-03' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 800, earnings: 600000 },
      { year: 2024, carbonCredits: 900, earnings: 675000 },
      { year: 2025, carbonCredits: 1000, earnings: 750000 },
    ]
  },
  { 
    id: 'F015', name: 'Arjun Singh', state: 'Haryana', district: 'Hisar', landArea: 15.0, cropType: 'Cotton', 
    walletAddress: '0xq4r5s6...', coordinates: { lat: 29.15, lng: 75.72 }, registeredDate: '2024-11-20',
    phone: '+91 76543 33333', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 75000, status: 'processing' },
      { month: 'Dec', year: 2025, amount: 75000, status: 'paid', paidDate: '2025-12-01' },
      { month: 'Nov', year: 2025, amount: 75000, status: 'paid', paidDate: '2025-11-02' },
      { month: 'Oct', year: 2025, amount: 75000, status: 'paid', paidDate: '2025-10-03' },
    ],
    yearlyEarnings: [
      { year: 2023, carbonCredits: 1000, earnings: 750000 },
      { year: 2024, carbonCredits: 1100, earnings: 825000 },
      { year: 2025, carbonCredits: 1200, earnings: 900000 },
    ]
  },
  { 
    id: 'F016', name: 'Sanjay Verma', state: 'Madhya Pradesh', district: 'Indore', landArea: 6.5, cropType: 'Wheat', 
    walletAddress: '0xt7u8v9...', coordinates: { lat: 22.72, lng: 75.86 }, registeredDate: '2025-01-15',
    phone: '+91 76543 44444', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 32500, status: 'pending' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 520, earnings: 390000 },
    ]
  },
  { 
    id: 'F017', name: 'Rekha Joshi', state: 'Uttarakhand', district: 'Dehradun', landArea: 4.2, cropType: 'Basmati Rice', 
    walletAddress: '0xw1x2y3...', coordinates: { lat: 30.32, lng: 78.03 }, registeredDate: '2025-01-08',
    phone: '+91 65432 55555', aadhaarVerified: false,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 21000, status: 'pending' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 336, earnings: 252000 },
    ]
  },
  { 
    id: 'F018', name: 'Kiran Patel', state: 'Gujarat', district: 'Surat', landArea: 7.8, cropType: 'Sugarcane', 
    walletAddress: '0xz4a5b6...', coordinates: { lat: 21.17, lng: 72.83 }, registeredDate: '2025-01-12',
    phone: '+91 54321 66666', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 39000, status: 'paid', paidDate: '2026-01-10' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 624, earnings: 468000 },
    ]
  },
  { 
    id: 'F019', name: 'Manoj Kumar', state: 'Rajasthan', district: 'Udaipur', landArea: 3.5, cropType: 'Maize', 
    walletAddress: '0xc7d8e9...', coordinates: { lat: 24.57, lng: 73.69 }, registeredDate: '2025-01-18',
    phone: '+91 43210 77777', aadhaarVerified: false,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 17500, status: 'pending' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 280, earnings: 210000 },
    ]
  },
  { 
    id: 'F020', name: 'Geeta Sharma', state: 'Himachal Pradesh', district: 'Shimla', landArea: 2.2, cropType: 'Apple', 
    walletAddress: '0xf1g2h3...', coordinates: { lat: 31.10, lng: 77.17 }, registeredDate: '2025-01-20',
    phone: '+91 32109 88888', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 22000, status: 'processing' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 176, earnings: 264000 },
    ]
  },
  { 
    id: 'F021', name: 'Ramesh Yadav', state: 'Uttar Pradesh', district: 'Kanpur', landArea: 9.2, cropType: 'Sugarcane', 
    walletAddress: '0xi4j5k6...', coordinates: { lat: 26.45, lng: 80.33 }, registeredDate: '2025-01-22',
    phone: '+91 21098 99999', aadhaarVerified: true,
    monthlyPayments: [
      { month: 'Jan', year: 2026, amount: 46000, status: 'paid', paidDate: '2026-01-12' },
    ],
    yearlyEarnings: [
      { year: 2025, carbonCredits: 736, earnings: 552000 },
    ]
  },
];

// Projects data with enhanced verification details
export const projects: Project[] = [
  { id: 'P001', farmerId: '136/1', farmerName: 'Arjun Ghorpade', state: 'Maharashtra', district: 'Sangli', landArea: 0.353, cropType: 'Sugarcane', projectType: 'regenerative_agriculture', status: 'pending', estimatedCredits: 25, mintedCredits: 0, confidenceScore: 88, submittedDate: '2026-03-14', coordinates: { lat: 24.79, lng: 85.00 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.72, revenuePerYear: 150000 },
  { id: 'P002', farmerId: 'F002', farmerName: 'Amit Singh', state: 'Punjab', district: 'Ludhiana', landArea: 5.2, cropType: 'Wheat', projectType: 'agroforestry', status: 'approved', estimatedCredits: 416, mintedCredits: 0, confidenceScore: 92, submittedDate: '2025-11-15', approvedDate: '2025-11-28', coordinates: { lat: 30.90, lng: 75.85 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.85, revenuePerYear: 312000 },
  { id: 'P003', farmerId: 'F003', farmerName: 'Priya Devi', state: 'Maharashtra', district: 'Nagpur', landArea: 3.8, cropType: 'Cotton', projectType: 'afforestation', status: 'minted', estimatedCredits: 304, mintedCredits: 304, confidenceScore: 95, submittedDate: '2025-10-20', approvedDate: '2025-11-05', coordinates: { lat: 21.14, lng: 79.08 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.91, revenuePerYear: 228000 },
  { id: 'P004', farmerId: 'F004', farmerName: 'Suresh Patel', state: 'Gujarat', district: 'Ahmedabad', landArea: 4.1, cropType: 'Groundnut', projectType: 'solar_farming', status: 'approved', estimatedCredits: 145, mintedCredits: 0, confidenceScore: 88, submittedDate: '2025-11-22', approvedDate: '2025-12-10', coordinates: { lat: 23.02, lng: 72.57 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.78, revenuePerYear: 1232500 },
  { id: 'P005', farmerId: 'F005', farmerName: 'Kavitha Reddy', state: 'Telangana', district: 'Hyderabad', landArea: 6.0, cropType: 'Rice', projectType: 'regenerative_agriculture', status: 'minted', estimatedCredits: 198, mintedCredits: 198, confidenceScore: 91, submittedDate: '2025-09-10', approvedDate: '2025-09-25', coordinates: { lat: 17.38, lng: 78.48 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.88, revenuePerYear: 1683000 },
  { id: 'P006', farmerId: 'F006', farmerName: 'Mohammed Ali', state: 'Karnataka', district: 'Bangalore', landArea: 2.8, cropType: 'Ragi', projectType: 'agroforestry', status: 'pending', estimatedCredits: 92, mintedCredits: 0, confidenceScore: 75, submittedDate: '2025-12-18', coordinates: { lat: 12.97, lng: 77.59 }, documentsVerified: false, landSurveyComplete: true, soilTestPassed: false, ndviScore: 0.65, revenuePerYear: 782000 },
  { id: 'P007', farmerId: 'F007', farmerName: 'Lakshmi Nair', state: 'Kerala', district: 'Kochi', landArea: 1.5, cropType: 'Coconut', projectType: 'afforestation', status: 'approved', estimatedCredits: 120, mintedCredits: 0, confidenceScore: 82, submittedDate: '2025-11-08', approvedDate: '2025-11-20', coordinates: { lat: 9.93, lng: 76.26 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.79, revenuePerYear: 180000 },
  { id: 'P008', farmerId: 'F008', farmerName: 'Deepak Sharma', state: 'Uttar Pradesh', district: 'Lucknow', landArea: 7.2, cropType: 'Sugarcane', projectType: 'regenerative_agriculture', status: 'minted', estimatedCredits: 245, mintedCredits: 245, confidenceScore: 94, submittedDate: '2025-08-05', approvedDate: '2025-08-22', coordinates: { lat: 26.84, lng: 80.94 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.92, revenuePerYear: 2082500 },
  { id: 'P009', farmerId: 'F001', farmerName: 'Rajesh Kumar', state: 'Bihar', district: 'Patna', landArea: 3.2, cropType: 'Maize', projectType: 'agroforestry', status: 'rejected', estimatedCredits: 0, mintedCredits: 0, confidenceScore: 45, submittedDate: '2025-07-15', coordinates: { lat: 25.59, lng: 85.13 }, documentsVerified: false, landSurveyComplete: false, soilTestPassed: false, ndviScore: 0.32, revenuePerYear: 0 },
  { id: 'P010', farmerId: 'F002', farmerName: 'Amit Singh', state: 'Punjab', district: 'Amritsar', landArea: 4.8, cropType: 'Rice', projectType: 'regenerative_agriculture', status: 'pending', estimatedCredits: 162, mintedCredits: 0, confidenceScore: 86, submittedDate: '2025-12-22', coordinates: { lat: 31.63, lng: 74.87 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.81, revenuePerYear: 1377000 },
  { id: 'P011', farmerId: 'F011', farmerName: 'Meena Devi', state: 'Rajasthan', district: 'Jaipur', landArea: 3.2, cropType: 'Mustard', projectType: 'solar_farming', status: 'pending', estimatedCredits: 88, mintedCredits: 0, confidenceScore: 58, submittedDate: '2025-12-28', coordinates: { lat: 26.92, lng: 75.78 }, documentsVerified: false, landSurveyComplete: true, soilTestPassed: false, ndviScore: 0.48, revenuePerYear: 748000 },
  { id: 'P012', farmerId: 'F010', farmerName: 'Vikram Yadav', state: 'Haryana', district: 'Karnal', landArea: 8.5, cropType: 'Wheat', projectType: 'agroforestry', status: 'minted', estimatedCredits: 278, mintedCredits: 278, confidenceScore: 96, submittedDate: '2025-06-15', approvedDate: '2025-07-02', coordinates: { lat: 29.68, lng: 76.99 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.94, revenuePerYear: 2363000 },
  { id: 'P013', farmerId: 'F013', farmerName: 'Ramesh Gupta', state: 'Uttar Pradesh', district: 'Meerut', landArea: 10.0, cropType: 'Wheat', projectType: 'agroforestry', status: 'minted', estimatedCredits: 365, mintedCredits: 365, confidenceScore: 97, submittedDate: '2025-05-10', approvedDate: '2025-05-25', coordinates: { lat: 28.98, lng: 77.70 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.96, revenuePerYear: 3102500 },
  { id: 'P014', farmerId: 'F014', farmerName: 'Sunita Sharma', state: 'Punjab', district: 'Patiala', landArea: 12.5, cropType: 'Rice', projectType: 'regenerative_agriculture', status: 'minted', estimatedCredits: 445, mintedCredits: 445, confidenceScore: 98, submittedDate: '2025-04-15', approvedDate: '2025-05-01', coordinates: { lat: 30.32, lng: 76.38 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.98, revenuePerYear: 3782500 },
  { id: 'P015', farmerId: 'F015', farmerName: 'Arjun Singh', state: 'Haryana', district: 'Hisar', landArea: 15.0, cropType: 'Cotton', projectType: 'afforestation', status: 'approved', estimatedCredits: 550, mintedCredits: 0, confidenceScore: 99, submittedDate: '2025-03-20', approvedDate: '2025-04-05', coordinates: { lat: 29.15, lng: 75.72 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.99, revenuePerYear: 4675000 },
  { id: 'P016', farmerId: 'F016', farmerName: 'Sanjay Verma', state: 'Madhya Pradesh', district: 'Indore', landArea: 6.5, cropType: 'Wheat', projectType: 'regenerative_agriculture', status: 'pending', estimatedCredits: 185, mintedCredits: 0, confidenceScore: 82, submittedDate: '2026-01-15', coordinates: { lat: 22.72, lng: 75.86 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.78, revenuePerYear: 1573000 },
  { id: 'P017', farmerId: 'F017', farmerName: 'Rekha Joshi', state: 'Uttarakhand', district: 'Dehradun', landArea: 4.2, cropType: 'Basmati Rice', projectType: 'agroforestry', status: 'pending', estimatedCredits: 112, mintedCredits: 0, confidenceScore: 65, submittedDate: '2026-01-08', coordinates: { lat: 30.32, lng: 78.03 }, documentsVerified: false, landSurveyComplete: true, soilTestPassed: false, ndviScore: 0.58, revenuePerYear: 952000 },
  { id: 'P018', farmerId: 'F018', farmerName: 'Kiran Patel', state: 'Gujarat', district: 'Surat', landArea: 7.8, cropType: 'Sugarcane', projectType: 'regenerative_agriculture', status: 'approved', estimatedCredits: 210, mintedCredits: 0, confidenceScore: 89, submittedDate: '2026-01-12', approvedDate: '2026-01-20', coordinates: { lat: 21.17, lng: 72.83 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.84, revenuePerYear: 1785000 },
  { id: 'P019', farmerId: 'F019', farmerName: 'Manoj Kumar', state: 'Rajasthan', district: 'Udaipur', landArea: 3.5, cropType: 'Maize', projectType: 'solar_farming', status: 'rejected', estimatedCredits: 0, mintedCredits: 0, confidenceScore: 38, submittedDate: '2026-01-18', coordinates: { lat: 24.57, lng: 73.69 }, documentsVerified: false, landSurveyComplete: false, soilTestPassed: false, ndviScore: 0.25, revenuePerYear: 0 },
  { id: 'P020', farmerId: 'F020', farmerName: 'Geeta Sharma', state: 'Himachal Pradesh', district: 'Shimla', landArea: 2.2, cropType: 'Apple', projectType: 'afforestation', status: 'pending', estimatedCredits: 176, mintedCredits: 0, confidenceScore: 71, submittedDate: '2026-01-20', coordinates: { lat: 31.10, lng: 77.17 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.68, revenuePerYear: 264000 },
  { id: 'P021', farmerId: 'F021', farmerName: 'Ramesh Yadav', state: 'Uttar Pradesh', district: 'Kanpur', landArea: 9.2, cropType: 'Sugarcane', projectType: 'agroforestry', status: 'approved', estimatedCredits: 252, mintedCredits: 0, confidenceScore: 93, submittedDate: '2026-01-22', approvedDate: '2026-01-25', coordinates: { lat: 26.45, lng: 80.33 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: true, ndviScore: 0.91, revenuePerYear: 2142000 },
  { id: 'P022', farmerId: 'F017', farmerName: 'Rekha Joshi', state: 'Uttarakhand', district: 'Dehradun', landArea: 2.8, cropType: 'Wheat', projectType: 'regenerative_agriculture', status: 'rejected', estimatedCredits: 0, mintedCredits: 0, confidenceScore: 42, submittedDate: '2025-12-15', coordinates: { lat: 30.28, lng: 78.08 }, documentsVerified: false, landSurveyComplete: false, soilTestPassed: false, ndviScore: 0.31, revenuePerYear: 0 },
  { id: 'P023', farmerId: 'F016', farmerName: 'Sanjay Verma', state: 'Madhya Pradesh', district: 'Indore', landArea: 4.5, cropType: 'Cotton', projectType: 'solar_farming', status: 'pending', estimatedCredits: 128, mintedCredits: 0, confidenceScore: 76, submittedDate: '2025-11-28', coordinates: { lat: 22.68, lng: 75.82 }, documentsVerified: true, landSurveyComplete: true, soilTestPassed: false, ndviScore: 0.72, revenuePerYear: 1088000 },
];

// State-wise statistics with coordinates
export const stateStats: StateStats[] = [
  { state: 'Maharashtra', stateCode: 'MH', totalProjects: 245, approvedProjects: 198, totalCredits: 12450, mintedCredits: 9800, awarenessIndex: 78, fairnessIndex: 1.12, contribution: 18.5, coordinates: { lat: 19.75, lng: 75.71 } },
  { state: 'Punjab', stateCode: 'PB', totalProjects: 189, approvedProjects: 165, totalCredits: 9870, mintedCredits: 8200, awarenessIndex: 85, fairnessIndex: 1.21, contribution: 15.2, coordinates: { lat: 31.14, lng: 75.34 } },
  { state: 'Gujarat', stateCode: 'GJ', totalProjects: 178, approvedProjects: 145, totalCredits: 8920, mintedCredits: 7100, awarenessIndex: 72, fairnessIndex: 0.98, contribution: 13.4, coordinates: { lat: 22.26, lng: 71.19 } },
  { state: 'Uttar Pradesh', stateCode: 'UP', totalProjects: 312, approvedProjects: 234, totalCredits: 15600, mintedCredits: 11200, awarenessIndex: 58, fairnessIndex: 0.76, contribution: 21.8, coordinates: { lat: 26.84, lng: 80.94 } },
  { state: 'Karnataka', stateCode: 'KA', totalProjects: 156, approvedProjects: 128, totalCredits: 7450, mintedCredits: 5900, awarenessIndex: 81, fairnessIndex: 1.05, contribution: 11.2, coordinates: { lat: 15.31, lng: 75.71 } },
  { state: 'Telangana', stateCode: 'TS', totalProjects: 134, approvedProjects: 112, totalCredits: 6780, mintedCredits: 5400, awarenessIndex: 76, fairnessIndex: 1.08, contribution: 10.1, coordinates: { lat: 18.11, lng: 79.01 } },
  { state: 'Bihar', stateCode: 'BR', totalProjects: 89, approvedProjects: 52, totalCredits: 2340, mintedCredits: 1450, awarenessIndex: 31, fairnessIndex: 0.42, contribution: 3.5, coordinates: { lat: 25.09, lng: 85.31 } },
  { state: 'Kerala', stateCode: 'KL', totalProjects: 67, approvedProjects: 58, totalCredits: 3200, mintedCredits: 2800, awarenessIndex: 89, fairnessIndex: 1.35, contribution: 4.8, coordinates: { lat: 10.85, lng: 76.27 } },
  { state: 'Rajasthan', stateCode: 'RJ', totalProjects: 145, approvedProjects: 98, totalCredits: 5680, mintedCredits: 3900, awarenessIndex: 52, fairnessIndex: 0.68, contribution: 8.5, coordinates: { lat: 27.02, lng: 74.21 } },
  { state: 'Tamil Nadu', stateCode: 'TN', totalProjects: 198, approvedProjects: 167, totalCredits: 9120, mintedCredits: 7600, awarenessIndex: 82, fairnessIndex: 1.15, contribution: 13.6, coordinates: { lat: 11.12, lng: 78.65 } },
  { state: 'Haryana', stateCode: 'HR', totalProjects: 165, approvedProjects: 142, totalCredits: 8450, mintedCredits: 7200, awarenessIndex: 79, fairnessIndex: 1.08, contribution: 12.6, coordinates: { lat: 29.05, lng: 76.08 } },
  { state: 'Madhya Pradesh', stateCode: 'MP', totalProjects: 178, approvedProjects: 145, totalCredits: 8920, mintedCredits: 7100, awarenessIndex: 68, fairnessIndex: 0.92, contribution: 13.3, coordinates: { lat: 22.97, lng: 78.65 } },
];

// Carbon credits
export const carbonCredits: CarbonCredit[] = [
  { id: 'CC001', projectId: 'P003', amount: 128, mintedOn: '2025-11-10', txHash: '0xabc123...def456', status: 'minted' },
  { id: 'CC002', projectId: 'P005', amount: 198, mintedOn: '2025-10-02', txHash: '0x789ghi...jkl012', status: 'allocated' },
  { id: 'CC003', projectId: 'P008', amount: 245, mintedOn: '2025-08-30', txHash: '0xmno345...pqr678', status: 'retired' },
  { id: 'CC004', projectId: 'P002', amount: 156, mintedOn: '2025-12-15', txHash: '0xstu901...vwx234', status: 'verified' },
  { id: 'CC005', projectId: 'P012', amount: 278, mintedOn: '2025-07-05', txHash: '0xabc567...xyz890', status: 'minted' },
];

// AI Insights with predicted outcomes
export const aiInsights: AIInsight[] = [
  {
    id: 'AI001',
    region: 'Bihar',
    issue: 'Critical underperformance in carbon credit generation',
    reason: 'Low farmer awareness (31%), high mono-cropping patterns, and insufficient project submissions',
    severity: 'high',
    suggestedActions: [
      'Launch intensive farmer awareness campaigns in rural districts',
      'Introduce subsidized agroforestry training programs',
      'Partner with local agricultural universities for outreach',
      'Increase carbon credit subsidy by 25% for first-time farmers'
    ],
    confidence: 91,
    category: 'awareness',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [89, 92, 95, 98, 102, 105],
      after: [89, 110, 135, 165, 198, 235],
      improvementPercent: 124
    }
  },
  {
    id: 'AI002',
    region: 'Rajasthan',
    issue: 'Water scarcity limiting carbon sequestration potential',
    reason: 'Arid climate conditions and limited irrigation infrastructure',
    severity: 'medium',
    suggestedActions: [
      'Promote drought-resistant afforestation species',
      'Implement rainwater harvesting incentive programs',
      'Focus on solar farming projects instead of traditional agriculture'
    ],
    confidence: 87,
    category: 'performance',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [145, 148, 150, 152, 155, 158],
      after: [145, 162, 185, 210, 242, 280],
      improvementPercent: 77
    }
  },
  {
    id: 'AI003',
    region: 'Punjab-Haryana Border',
    issue: 'Potential carbon leakage detected',
    reason: 'Sudden spike in Punjab credits with simultaneous decline in Haryana submissions',
    severity: 'medium',
    suggestedActions: [
      'Conduct cross-border verification audit',
      'Implement geo-fencing for project boundaries',
      'Require satellite imagery for all border region projects'
    ],
    confidence: 72,
    category: 'leakage',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [320, 340, 355, 365, 370, 372],
      after: [320, 325, 345, 380, 420, 465],
      improvementPercent: 25
    }
  },
  {
    id: 'AI004',
    region: 'Kerala',
    issue: 'High-potential region for carbon credit expansion',
    reason: 'Excellent awareness index (89%) and favorable climate for afforestation',
    severity: 'low',
    suggestedActions: [
      'Scale successful Kerala model to other coastal states',
      'Increase project approval bandwidth for the region',
      'Establish Kerala as national carbon credit excellence center'
    ],
    confidence: 94,
    category: 'opportunity',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [67, 70, 73, 76, 79, 82],
      after: [67, 85, 108, 135, 168, 205],
      improvementPercent: 150
    }
  },
  {
    id: 'AI005',
    region: 'Uttar Pradesh',
    issue: 'High volume but low efficiency ratio',
    reason: 'Large number of projects but low credits per hectare compared to national average',
    severity: 'medium',
    suggestedActions: [
      'Introduce quality over quantity incentive structure',
      'Mandate minimum carbon yield per hectare for approvals',
      'Provide technical support for crop rotation optimization'
    ],
    confidence: 85,
    category: 'performance',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [312, 318, 325, 332, 340, 348],
      after: [312, 345, 390, 445, 510, 585],
      improvementPercent: 68
    }
  },
  {
    id: 'AI006',
    region: 'Maharashtra',
    issue: 'Optimal subsidy allocation opportunity',
    reason: 'High project quality with strong farmer participation, potential for increased incentives',
    severity: 'low',
    suggestedActions: [
      'Increase subsidy rate by 15% for high-confidence projects',
      'Create fast-track approval for returning farmers',
      'Implement referral bonus for farmer communities'
    ],
    confidence: 89,
    category: 'opportunity',
    predictedOutcome: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      before: [245, 252, 260, 268, 276, 285],
      after: [245, 280, 325, 380, 445, 520],
      improvementPercent: 82
    }
  }
];

// Farmer earnings comparison data (Updated with new calculation: 80 CC per acre, 60k-120k Rs per acre)
export const farmerEarningsData = [
  { landSize: '1-2 Acres', avgEarnings: 90000, avgCredits: 120 },      // 1.5 acres avg * 60k = 90k
  { landSize: '2-4 Acres', avgEarnings: 180000, avgCredits: 240 },     // 3 acres avg * 60k = 180k  
  { landSize: '4-6 Acres', avgEarnings: 300000, avgCredits: 400 },     // 5 acres avg * 60k = 300k
  { landSize: '6-8 Acres', avgEarnings: 420000, avgCredits: 560 },     // 7 acres avg * 60k = 420k
  { landSize: '8-10 Acres', avgEarnings: 540000, avgCredits: 720 },    // 9 acres avg * 60k = 540k
  { landSize: '10+ Acres', avgEarnings: 720000, avgCredits: 960 },     // 12 acres avg * 60k = 720k
];

// Yearly farmer earnings growth (Updated with new calculation)
export const yearlyEarningsGrowth = [
  { year: '2021', avgEarnings: 180000, farmers: 450 },    // Early adoption
  { year: '2022', avgEarnings: 210000, farmers: 680 },    // Growing participation
  { year: '2023', avgEarnings: 240000, farmers: 920 },    // Better practices
  { year: '2024', avgEarnings: 270000, farmers: 1150 },   // Improved yields
  { year: '2025', avgEarnings: 300000, farmers: 1450 },   // Current average
  { year: '2026 (Proj)', avgEarnings: 330000, farmers: 1850 }, // Projected growth
];

// Monthly trends data
export const monthlyTrends = [
  { month: 'Jan', credits: 4200, projects: 45, approvals: 38 },
  { month: 'Feb', credits: 4800, projects: 52, approvals: 44 },
  { month: 'Mar', credits: 5600, projects: 61, approvals: 55 },
  { month: 'Apr', credits: 6200, projects: 68, approvals: 59 },
  { month: 'May', credits: 7100, projects: 78, approvals: 68 },
  { month: 'Jun', credits: 8400, projects: 89, approvals: 76 },
  { month: 'Jul', credits: 9200, projects: 95, approvals: 84 },
  { month: 'Aug', credits: 10500, projects: 108, approvals: 92 },
  { month: 'Sep', credits: 11800, projects: 118, approvals: 102 },
  { month: 'Oct', credits: 13200, projects: 132, approvals: 115 },
  { month: 'Nov', credits: 14500, projects: 145, approvals: 128 },
  { month: 'Dec', credits: 15800, projects: 156, approvals: 138 },
];

// Project type distribution
export const projectTypeDistribution = [
  { type: 'Afforestation', value: 35, color: 'hsl(160, 84%, 28%)' },
  { type: 'Agroforestry', value: 28, color: 'hsl(180, 70%, 25%)' },
  { type: 'Regenerative Agriculture', value: 25, color: 'hsl(200, 60%, 30%)' },
  { type: 'Solar Farming', value: 12, color: 'hsl(45, 100%, 55%)' },
];

// Wallet transaction distribution
export const walletTransactionTypes = [
  { type: 'Minting', value: 45, amount: 220588 },
  { type: 'Allocations', value: 30, amount: 147059 },
  { type: 'Retirements', value: 15, amount: 73529 },
  { type: 'Transfers', value: 10, amount: 49020 },
];

// Monthly wallet inflow
export const walletMonthlyInflow = [
  { month: 'Jul', inflow: 28500, outflow: 12000 },
  { month: 'Aug', inflow: 35200, outflow: 15800 },
  { month: 'Sep', inflow: 42800, outflow: 18500 },
  { month: 'Oct', inflow: 48500, outflow: 22000 },
  { month: 'Nov', inflow: 55200, outflow: 25500 },
  { month: 'Dec', inflow: 62800, outflow: 28000 },
  { month: 'Jan', inflow: 68500, outflow: 30500 },
];

// Summary metrics
export const summaryMetrics = {
  totalCredits: 66800,
  totalMinted: 52450,
  totalProjects: 1713,
  approvedProjects: 1357,
  pendingProjects: 256,
  rejectedProjects: 100,
  totalFarmers: 1245,
  activeFarmers: 1089,
  govtWalletBalance: 2423, // Updated to match initial sync value
  govtWalletEstimatedValue: 4846000, // Updated proportionally (2423 * 2000)
  avgConfidenceScore: 84.5,
  nationalAwarenessIndex: 68,
  avgFairnessIndex: 0.92,
};

// AI Chatbot mock responses
export const aiChatResponses: Record<string, string> = {
  'subsidy maharashtra': 'Based on our analysis of Maharashtra\'s carbon credit performance (Awareness Index: 78%, Fairness Index: 1.12), I recommend a subsidy of ₹950-1100 per carbon credit. Maharashtra has strong farmer participation and high-quality projects. Consider implementing a tiered subsidy: ₹950 for standard projects, ₹1050 for high-confidence (>90%) projects, and ₹1100 for returning farmers with proven track records.',
  'subsidy bihar': 'Bihar requires special attention with its low Awareness Index (31%). I recommend a higher subsidy of ₹1200-1400 per carbon credit to incentivize participation. Additionally, allocate ₹5 Cr for awareness campaigns and partner with Patna Agricultural University for farmer training. The higher subsidy will help overcome the initial adoption barrier.',
  'best performing': 'Kerala leads in performance metrics with the highest Fairness Index (1.35) and Awareness Index (89%). Key success factors include: 1) Strong local government partnerships, 2) Coconut-based agroforestry programs, 3) High literacy rates enabling digital adoption. I recommend replicating the Kerala model in Tamil Nadu and Karnataka which show similar potential.',
  'carbon leakage': 'We\'ve detected potential carbon leakage at the Punjab-Haryana border. Confidence: 72%. Analysis shows a 23% spike in Punjab credits coinciding with a 18% decline in Haryana submissions. Recommended actions: 1) Deploy satellite-based geo-fencing, 2) Cross-verify farmer addresses with Aadhaar, 3) Conduct random physical audits in border districts.',
  'budget allocation': 'Based on current performance and potential, I recommend the following FY2026-27 budget allocation: Maharashtra ₹45 Cr (18%), UP ₹55 Cr (22%), Punjab ₹35 Cr (14%), Bihar ₹40 Cr (16% - includes awareness programs), Karnataka ₹25 Cr (10%), Kerala ₹15 Cr (6%), Others ₹35 Cr (14%). Total: ₹250 Cr. This prioritizes high-volume states while investing in underperforming regions.',
  'default': 'I can help you with policy recommendations, subsidy calculations, regional analysis, and carbon credit optimization. Try asking about: "What should be the subsidy in [state]?", "Which states are performing best?", "Detect carbon leakage", or "Recommend budget allocation".'
};
