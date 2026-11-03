import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Contract addresses from the deployed CARBON4_L_6 project
export const CONTRACT_ADDRESSES = {
  CARBON_CREDIT_TOKEN: '0xED7a9D61091CBFB927aAe5B897d7aebb81E633D7',
  BLUE_REEF_REGISTRY: '0x046BD349B6F8aC89a49176f1eaa85bc2eF1B6043'
} as const

// Wagmi configuration - simplified to use injected connector only
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected()
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org')
  }
})

// Contract ABIs (simplified for the main functions we need)
export const CARBON_CREDIT_TOKEN_ABI = [
  {
    "inputs": [
      {"name": "_projectContract", "type": "address"},
      {"name": "_recipient", "type": "address"},
      {"name": "_amount", "type": "uint256"},
      {"name": "_projectName", "type": "string"},
      {"name": "_landCoordinates", "type": "string"},
      {"name": "_ndviReadingId", "type": "uint256"}
    ],
    "name": "mintCredits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_batchId", "type": "uint256"}],
    "name": "getCreditBatch",
    "outputs": [{
      "components": [
        {"name": "batchId", "type": "uint256"},
        {"name": "projectContract", "type": "address"},
        {"name": "amount", "type": "uint256"},
        {"name": "mintTimestamp", "type": "uint256"},
        {"name": "projectName", "type": "string"},
        {"name": "landCoordinates", "type": "string"},
        {"name": "ndviReadingId", "type": "uint256"},
        {"name": "retired", "type": "bool"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const BLUE_REEF_REGISTRY_ABI = [
  {
    "inputs": [
      {"name": "_organizationName", "type": "string"},
      {"name": "_documentHash", "type": "string"},
      {"name": "_landCoordinates", "type": "string"},
      {"name": "_areaHectares", "type": "uint256"},
      {"name": "_plantSpecies", "type": "string"}
    ],
    "name": "submitApplication",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_applicationId", "type": "uint256"},
      {"name": "_newStatus", "type": "uint8"},
      {"name": "_comments", "type": "string"}
    ],
    "name": "updateApplicationStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_applicationId", "type": "uint256"}],
    "name": "getApplication",
    "outputs": [{
      "components": [
        {"name": "id", "type": "uint256"},
        {"name": "applicant", "type": "address"},
        {"name": "userType", "type": "uint8"},
        {"name": "organizationName", "type": "string"},
        {"name": "documentHash", "type": "string"},
        {"name": "landCoordinates", "type": "string"},
        {"name": "areaHectares", "type": "uint256"},
        {"name": "plantSpecies", "type": "string"},
        {"name": "status", "type": "uint8"},
        {"name": "submissionTimestamp", "type": "uint256"},
        {"name": "reviewTimestamp", "type": "uint256"},
        {"name": "reviewer", "type": "address"},
        {"name": "reviewComments", "type": "string"},
        {"name": "projectContractAddress", "type": "address"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Application status enum (matches smart contract)
export enum ApplicationStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  RequiresMoreInfo = 4
}

// Government wallet address (should be set to the actual government wallet)
export const GOVERNMENT_WALLET_ADDRESS = (import.meta.env.VITE_GOVERNMENT_WALLET_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000'