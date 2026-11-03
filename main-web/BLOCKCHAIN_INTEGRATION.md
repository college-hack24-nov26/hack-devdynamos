# Blockchain Integration Guide

## Overview

This Green Ledger India project has been enhanced with blockchain functionality using smart contracts deployed on the Sepolia testnet. The integration allows for real-time interaction with deployed carbon credit smart contracts.

## Features Added

### 🔗 Wallet Connection
- MetaMask integration for wallet connection
- Automatic network switching to Sepolia testnet
- Real-time connection status display
- Wallet address display with copy functionality

### 📋 Project Approval on Blockchain
- **Approve Button**: Now connects to the BlueReefRegistry smart contract
- Real blockchain transactions for project approvals
- Transaction status tracking with live updates
- Sepolia testnet explorer integration

### 🪙 Carbon Credit Minting
- **Mint Button**: Connects to CarbonCreditToken smart contract
- Real carbon credit minting on blockchain
- Credits are minted to the government wallet
- Live balance updates from blockchain

### 💰 Enhanced Wallet Page
- Real-time blockchain balance display
- Live total supply tracking
- Recent blockchain transaction history
- Transaction status monitoring (pending/success/failed)
- Direct links to Sepolia explorer

## Smart Contracts Used

### CarbonCreditToken (ERC-20)
- **Address**: `0xED7a9D61091CBFB927aAe5B897d7aebb81E633D7`
- **Network**: Sepolia Testnet
- **Functions**: 
  - `mintCredits()` - Mint carbon credits to government wallet
  - `balanceOf()` - Get wallet balance
  - `totalSupply()` - Get total minted supply

### BlueReefRegistry
- **Address**: `0x046BD349B6F8aC89a49176f1eaa85bc2eF1B6043`
- **Network**: Sepolia Testnet
- **Functions**:
  - `updateApplicationStatus()` - Approve/reject projects
  - `getApplication()` - Get project details

## Setup Instructions

### 1. Install MetaMask
1. Install MetaMask browser extension
2. Create or import a wallet
3. Get some Sepolia ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

### 2. Add Sepolia Network
The app will automatically prompt you to switch to Sepolia, but you can add it manually:
- **Network Name**: Sepolia
- **RPC URL**: https://rpc.sepolia.org (or your Infura/Alchemy endpoint)
- **Chain ID**: 11155111
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.etherscan.io

### 3. Environment Configuration
Copy `.env.example` to `.env` and update if needed:
```bash
cp .env.example .env
```

### 4. Run the Application
```bash
npm install
npm run dev
```

## How to Use

### Connecting Wallet
1. Click "Connect Wallet" in the header
2. Select MetaMask from the options
3. Approve the connection in MetaMask
4. Switch to Sepolia network when prompted

### Approving Projects
1. Navigate to Projects section
2. Find a project with "Pending" status
3. Click "Approve" button
4. Confirm the transaction in MetaMask
5. Wait for blockchain confirmation
6. View transaction on Sepolia explorer

### Minting Carbon Credits
1. Find an "Approved" project
2. Click "Mint Carbon Credits" button
3. Confirm the transaction in MetaMask
4. Credits will be minted to government wallet
5. Check updated balance in Wallet section

### Viewing Blockchain Data
1. Go to Wallet section
2. Click "Refresh" to get latest blockchain data
3. View real-time balance and total supply
4. Check recent blockchain transactions
5. Click "View on Explorer" for detailed transaction info

## Transaction Flow

```
1. Project Submission (Off-chain)
   ↓
2. Government Review (Off-chain)
   ↓
3. Project Approval (On-chain) ← Blockchain Transaction
   ↓
4. Carbon Credit Minting (On-chain) ← Blockchain Transaction
   ↓
5. Credits in Government Wallet (On-chain)
```

## Technical Details

### Blockchain Service
- `src/services/blockchainService.ts` - Main blockchain interaction service
- Handles contract calls, transaction management, and error handling
- Provides transaction status tracking and history

### Wallet Integration
- `src/components/blockchain/WalletConnection.tsx` - Wallet connection UI
- `src/components/blockchain/TransactionStatus.tsx` - Transaction status display
- Real-time connection and network status

### Configuration
- `src/config/blockchain.ts` - Contract addresses, ABIs, and network config
- Environment variables for easy deployment configuration

## Troubleshooting

### Common Issues

1. **MetaMask not detected**
   - Ensure MetaMask is installed and enabled
   - Refresh the page and try again

2. **Wrong network**
   - Click "Switch to Sepolia" button
   - Or manually switch in MetaMask

3. **Insufficient funds**
   - Get test ETH from Sepolia faucet
   - Need ETH for gas fees

4. **Transaction failed**
   - Check if you have enough ETH for gas
   - Ensure you're on the correct network
   - Try increasing gas limit in MetaMask

5. **Contract not responding**
   - Contracts are deployed on Sepolia testnet
   - Check network status and try again

### Support Resources
- [MetaMask Documentation](https://docs.metamask.io/)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
- [Sepolia Explorer](https://sepolia.etherscan.io/)
- [Wagmi Documentation](https://wagmi.sh/)

## Security Notes

⚠️ **Important**: This is a testnet implementation for demonstration purposes.

- Never use mainnet private keys for testing
- Always verify contract addresses before interacting
- Test thoroughly before any mainnet deployment
- Keep private keys secure and never share them

## Future Enhancements

- [ ] Multi-signature wallet support for government approvals
- [ ] Automated project verification using oracles
- [ ] Carbon credit marketplace integration
- [ ] Cross-chain compatibility
- [ ] Advanced analytics and reporting
- [ ] Mobile wallet support (WalletConnect)

## Contract Source Code

The smart contracts used in this integration are from the CARBON4_L_6 project and have been deployed to Sepolia testnet. The contracts include:

- **CarbonCreditToken.sol** - ERC-20 token for carbon credits
- **BlueReefRegistry.sol** - Project registration and approval
- **ProjectContract.sol** - Individual project management

For full contract source code and deployment details, refer to the CARBON4_L_6 project documentation.