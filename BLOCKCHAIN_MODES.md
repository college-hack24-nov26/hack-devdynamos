# Blockchain Integration Modes

## Overview

The Green Ledger India application supports two blockchain interaction modes to provide flexibility for different use cases:

## 🎭 Demo Mode (Default)
- **Purpose**: Perfect for demonstrations, testing, and development
- **Behavior**: Simulates blockchain transactions with realistic UI feedback
- **Benefits**: 
  - No gas fees required
  - No network dependencies
  - Instant "transaction" confirmation
  - Perfect for showcasing functionality
- **Use Cases**: 
  - Product demonstrations
  - User training
  - Development testing
  - Stakeholder presentations

## ⚡ Real Mode
- **Purpose**: Actual blockchain interactions with deployed smart contracts
- **Behavior**: Sends real transactions to Sepolia testnet
- **Requirements**:
  - Connected MetaMask wallet
  - Sepolia testnet ETH for gas fees
  - Proper contract permissions
- **Use Cases**:
  - Production testing
  - Actual carbon credit management
  - Blockchain verification

## 🔄 Switching Modes

### In the Application
1. Navigate to the **Wallet** section
2. Click the **Demo Mode** / **Real Mode** button in the header
3. The mode will switch and show a confirmation toast

### Programmatically
```typescript
import blockchainService from '@/services/blockchainService'

// Enable real blockchain mode
blockchainService.setRealBlockchainMode(true)

// Enable demo mode
blockchainService.setRealBlockchainMode(false)
```

## 🎯 Current Implementation Status

### ✅ Demo Mode Features
- [x] Wallet connection simulation
- [x] Project approval with mock transactions
- [x] Carbon credit minting with mock transactions
- [x] Transaction status tracking
- [x] Realistic transaction hashes
- [x] Timed transaction confirmations
- [x] Explorer link generation

### 🚧 Real Mode Features
- [x] Wallet connection (MetaMask)
- [x] Network switching to Sepolia
- [x] Contract interaction setup
- [x] Gas limit configuration
- [x] Error handling
- ⚠️ Contract permission issues (being resolved)
- ⚠️ Gas limit optimization needed

## 🔧 Technical Details

### Demo Mode Implementation
```typescript
// Generates realistic transaction hashes
const mockHash = `0x${Math.random().toString(16).substr(2, 64)}`

// Simulates network delay
setTimeout(() => {
  transaction.status = 'success'
}, 3000)
```

### Real Mode Implementation
```typescript
// Actual smart contract interaction
const hash = await writeContract(config, {
  address: CONTRACT_ADDRESSES.CARBON_CREDIT_TOKEN,
  abi: CARBON_CREDIT_TOKEN_ABI,
  functionName: 'mintCredits',
  args: [...],
  gas: BigInt(800000)
})
```

## 🐛 Known Issues & Solutions

### Real Mode Issues
1. **Gas Limit Too High**
   - **Issue**: Sepolia has gas limit caps
   - **Solution**: Optimized gas limits in contract calls
   - **Status**: Implemented

2. **Contract Permissions**
   - **Issue**: Wallet may not have required roles
   - **Solution**: Need to grant GOVERNMENT_ROLE to wallet
   - **Status**: Under investigation

3. **Contract State**
   - **Issue**: Applications may not exist in contract
   - **Solution**: Need to submit applications first
   - **Status**: Planned enhancement

### Demo Mode Benefits
- **Zero Issues**: No blockchain dependencies
- **Perfect UX**: Instant feedback and confirmations
- **Cost Free**: No gas fees or testnet ETH needed
- **Reliable**: No network or contract issues

## 🎯 Recommendations

### For Demonstrations
- **Use Demo Mode** for all presentations and stakeholder meetings
- Shows full functionality without technical complications
- Provides smooth, predictable user experience

### For Development
- **Start with Demo Mode** for UI/UX development
- **Switch to Real Mode** for blockchain integration testing
- **Use Demo Mode** for automated testing

### For Production
- **Real Mode Only** for actual carbon credit management
- Ensure proper contract setup and permissions
- Monitor gas costs and transaction success rates

## 🔮 Future Enhancements

### Planned Features
- [ ] Hybrid mode (some real, some simulated)
- [ ] Transaction replay from real to demo
- [ ] Advanced gas optimization
- [ ] Multi-network support
- [ ] Batch transaction processing

### Contract Improvements Needed
- [ ] Proper role management setup
- [ ] Application pre-registration
- [ ] Gas optimization
- [ ] Error message improvements
- [ ] Event emission for better tracking

## 📞 Support

If you encounter issues:

1. **Demo Mode Issues**: Check browser console for JavaScript errors
2. **Real Mode Issues**: 
   - Verify wallet connection
   - Check Sepolia testnet status
   - Ensure sufficient ETH for gas
   - Verify contract addresses

For technical support, refer to the main documentation or contact the development team.