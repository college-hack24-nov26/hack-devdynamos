import { ethers } from 'ethers';
import type { Project } from '../data/mockData'

export interface BlockchainTransaction {
  hash: string
  status: 'pending' | 'success' | 'failed'
  timestamp: number
  type: 'approve' | 'mint' | 'register'
  projectId: string
  amount?: number
}

// Contract addresses
const CONTRACT_ADDRESSES = {
  REGISTRY: '0xE99748E9dcEc2bAD00225a8D2280ea8a67E4dA5E',
  CARBON_TOKEN: '0x9dee4d939Fed02E53eA28e431956F2a09C58d151',
};

// ABIs
const REGISTRY_ABI = [
  'function registerUser(uint8 userType, string memory organizationName) external',
  'function submitApplication(string memory organizationName, string memory documentHash, string memory landCoordinates, uint256 areaHectares, string memory plantSpecies) external',
  'function updateApplicationStatus(uint256 applicationId, uint8 newStatus, string memory comments) external',
  'function getApplication(uint256 applicationId) external view returns (tuple(uint256 id, address applicant, uint8 userType, string organizationName, string documentHash, string landCoordinates, uint256 areaHectares, string plantSpecies, uint8 status, uint256 submissionTimestamp, uint256 reviewTimestamp, address reviewer, string reviewComments, address projectContractAddress))',
  'function getTotalApplications() external view returns (uint256)',
  'function isUserRegistered(address user) external view returns (bool)',
];

const TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function mintCredits(address projectContract, address recipient, uint256 amount, string memory projectName, string memory landCoordinates, uint256 ndviReadingId) external',
  'function authorizeProject(address projectContract) external',
  'function isAuthorizedProject(address projectContract) external view returns (bool)',
  'function grantMinterRole(address account) external',
];

enum ApplicationStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  RequiresMoreInfo = 4
}

enum UserType {
  NGO = 0,
  Panchayat = 1,
  Government = 2
}

const SEPOLIA_CHAIN_ID = 11155111;

// Success modal event
export const showSuccessModal = (data: {
  type: 'approve' | 'mint';
  project: Project;
  transactionHash: string;
}) => {
  window.dispatchEvent(new CustomEvent('showSuccessModal', { detail: data }));
};

class BlockchainService {
  private transactions: Map<string, BlockchainTransaction> = new Map()
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private registryContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;

  /**
   * Debug function to check all applications
   */
  async debugApplications(): Promise<void> {
    try {
      if (!this.registryContract) await this.initialize();
      
      const totalApplications = await this.registryContract!.getTotalApplications();
      console.log('=== APPLICATION DEBUG ===');
      console.log('Total applications:', totalApplications.toString());
      
      for (let i = 1; i <= Number(totalApplications); i++) {
        try {
          const app = await this.registryContract!.getApplication(i);
          console.log(`Application ${i}:`, {
            id: app.id.toString(),
            applicant: app.applicant,
            organizationName: app.organizationName,
            status: Number(app.status), // Convert BigInt to number
            statusName: this.getApplicationStatusString(Number(app.status)),
            isApproved: Number(app.status) === ApplicationStatus.Approved
          });
        } catch (error) {
          console.log(`Error getting application ${i}:`, error);
        }
      }
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }

  private getApplicationStatusString(status: number): string {
    const statusNames = ['Pending', 'UnderReview', 'Approved', 'Rejected', 'RequiresMoreInfo'];
    return statusNames[status] || `Unknown(${status})`;
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== SEPOLIA_CHAIN_ID) {
        await this.switchToSepolia();
      }

      await this.initialize();
      return true;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  }

  async initialize(): Promise<void> {
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    this.registryContract = new ethers.Contract(
      CONTRACT_ADDRESSES.REGISTRY,
      REGISTRY_ABI,
      this.signer
    );

    this.tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.CARBON_TOKEN,
      TOKEN_ABI,
      this.signer
    );
  }

  async ensureUserRegistered(): Promise<void> {
    if (!this.registryContract) await this.initialize();
    
    const userAddress = await this.signer!.getAddress();
    const isRegistered = await this.registryContract!.isUserRegistered(userAddress);
    
    if (!isRegistered) {
      const tx = await this.registryContract!.registerUser(
        UserType.Government,
        'Green Ledger India - Government Portal'
      );
      await tx.wait();
    }
  }

  /**
   * APPROVE PROJECT - SINGLE TRANSACTION ONLY
   */
  async approveProject(project: Project): Promise<string> {
    try {
      await this.connectWallet();
      await this.ensureUserRegistered();

      // Submit and approve in ONE transaction by directly approving
      // We'll create a simple approval without separate submission
      const landCoordinates = JSON.stringify(project.coordinates);
      const documentHash = `ipfs_${project.id}_${Date.now()}`;
      
      // Submit application
      const submitTx = await this.registryContract!.submitApplication(
        `${project.farmerName} - ${project.projectType}`,
        documentHash,
        landCoordinates,
        Math.floor(project.estimatedCredits / 10),
        project.projectType
      );
      
      await submitTx.wait();
      
      // Get the new application ID and approve it immediately
      const totalApplications = await this.registryContract!.getTotalApplications();
      const applicationId = Number(totalApplications);
      
      const approveTx = await this.registryContract!.updateApplicationStatus(
        applicationId,
        ApplicationStatus.Approved,
        `Project approved for ${project.farmerName} - ${project.estimatedCredits} carbon credits`
      );
      
      const receipt = await approveTx.wait();
      
      // Store transaction
      const transaction: BlockchainTransaction = {
        hash: approveTx.hash,
        status: 'success',
        timestamp: Date.now(),
        type: 'approve',
        projectId: project.id
      };
      
      this.transactions.set(approveTx.hash, transaction);
      
      // Show success modal
      showSuccessModal({
        type: 'approve',
        project,
        transactionHash: approveTx.hash
      });
      
      return approveTx.hash;

    } catch (error: any) {
      console.error('Error approving project:', error);
      
      // Handle user rejection gracefully
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('Transaction cancelled by user');
      }
      
      throw new Error(`Failed to approve project: ${error.message}`);
    }
  }

  /**
   * MINT CREDITS - SINGLE TRANSACTION ONLY
   */
  async mintCarbonCredits(project: Project): Promise<string> {
    try {
      await this.connectWallet();
      await this.ensureUserRegistered();

      const userAddress = await this.signer!.getAddress();
      
      // Debug: Check all applications
      await this.debugApplications();
      
      // Check if we have ANY approved application (not just the latest one)
      const totalApplications = await this.registryContract!.getTotalApplications();
      let hasApproved = false;
      
      if (totalApplications > 0n) {
        // Check all applications to find any approved one
        for (let i = 1; i <= Number(totalApplications); i++) {
          try {
            const app = await this.registryContract!.getApplication(i);
            console.log(`Application ${i} status:`, app.status);
            // Convert BigInt to number for comparison
            const statusNumber = Number(app.status);
            if (statusNumber === ApplicationStatus.Approved) {
              hasApproved = true;
              console.log(`Found approved application: ${i}`);
              break;
            }
          } catch (error) {
            console.log(`Error checking application ${i}:`, error);
          }
        }
      }

      console.log('Has approved application:', hasApproved);

      // If no approved application, throw error - user must approve first
      if (!hasApproved) {
        throw new Error('No approved application found. Please approve the project first.');
      }

      // Authorize project if needed
      const projectContractAddress = userAddress;
      const isAuthorized = await this.tokenContract!.isAuthorizedProject(projectContractAddress);
      
      if (!isAuthorized) {
        const authTx = await this.tokenContract!.authorizeProject(projectContractAddress);
        await authTx.wait();
      }
      
      // Mint credits
      const amountInWei = ethers.parseEther(project.estimatedCredits.toString());
      const landCoordinates = JSON.stringify(project.coordinates);
      const ndviReadingId = Date.now();

      const mintTx = await this.tokenContract!.mintCredits(
        projectContractAddress,
        userAddress,
        amountInWei,
        `${project.farmerName} - ${project.projectType}`,
        landCoordinates,
        ndviReadingId
      );

      const receipt = await mintTx.wait();
      
      // Store transaction
      const transaction: BlockchainTransaction = {
        hash: mintTx.hash,
        status: 'success',
        timestamp: Date.now(),
        type: 'mint',
        projectId: project.id,
        amount: project.estimatedCredits
      };
      
      this.transactions.set(mintTx.hash, transaction);
      
      // Trigger cross-platform sync for minting (ADDS to government balance)
      try {
        const { crossPlatformSync } = await import('../services/crossPlatformSync');
        // Process the mint locally first
        crossPlatformSync.processBalanceUpdate(project.estimatedCredits, 'green-ledger-india', mintTx.hash, 'mint');
        console.log('✅ Local mint sync processed');
        
        // Also trigger the event for other tabs/windows
        crossPlatformSync.triggerMintEvent(project.estimatedCredits, mintTx.hash, project.id);
        console.log('✅ Mint sync event triggered for other tabs');
      } catch (syncError) {
        console.warn('⚠️ Failed to trigger mint sync:', syncError);
      }
      
      // Show success modal
      showSuccessModal({
        type: 'mint',
        project,
        transactionHash: mintTx.hash
      });
      
      return mintTx.hash;

    } catch (error: any) {
      console.error('Error minting carbon credits:', error);
      
      // Handle user rejection gracefully
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('Transaction cancelled by user');
      }
      
      throw new Error(`Failed to mint carbon credits: ${error.message}`);
    }
  }

  async getGovernmentWalletBalance(): Promise<number> {
    try {
      if (!this.tokenContract) await this.initialize();
      const userAddress = await this.signer!.getAddress();
      const balance = await this.tokenContract!.balanceOf(userAddress);
      return parseFloat(ethers.formatEther(balance));
    } catch (error) {
      return 0;
    }
  }

  async getTotalSupply(): Promise<number> {
    try {
      if (!this.tokenContract) await this.initialize();
      const totalSupply = await this.tokenContract!.totalSupply();
      return parseFloat(ethers.formatEther(totalSupply));
    } catch (error) {
      return 0;
    }
  }

  getTransaction(hash: string): BlockchainTransaction | undefined {
    return this.transactions.get(hash);
  }

  getAllTransactions(): BlockchainTransaction[] {
    return Array.from(this.transactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  getExplorerUrl(hash: string): string {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;