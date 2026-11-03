# Deployment Guide

## Green Ledger India - Blockchain Enhanced Carbon Credit Portal

This guide covers deploying the blockchain-enhanced Green Ledger India application.

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH for testing
- Access to deployed smart contracts on Sepolia

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd green-ledger-india-aeb2162e-main
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Update .env with your configuration if needed
```

### 3. Development Server
```bash
npm run dev
```
Visit: http://localhost:8080

### 4. Production Build
```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Infura endpoint |
| `VITE_CARBON_CREDIT_TOKEN_ADDRESS` | Carbon credit token contract | Deployed address |
| `VITE_BLUE_REEF_REGISTRY_ADDRESS` | Registry contract | Deployed address |
| `VITE_GOVERNMENT_WALLET_ADDRESS` | Government wallet | Deployer address |
| `VITE_CHAIN_ID` | Network chain ID | 11155111 (Sepolia) |
| `VITE_BLOCK_EXPLORER_URL` | Block explorer URL | Sepolia Etherscan |

## Smart Contract Addresses (Sepolia Testnet)

- **CarbonCreditToken**: `0xED7a9D61091CBFB927aAe5B897d7aebb81E633D7`
- **BlueReefRegistry**: `0x046BD349B6F8aC89a49176f1eaa85bc2eF1B6043`
- **Government Wallet**: `your_wallet_address`

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Option 2: Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Option 3: Traditional Hosting
1. Run `npm run build`
2. Upload `dist/` folder to your web server
3. Configure web server for SPA routing

## Testing the Deployment

### 1. Wallet Connection
- [ ] MetaMask connection works
- [ ] Network switching to Sepolia
- [ ] Wallet address display
- [ ] Connection status updates

### 2. Project Management
- [ ] Project list loads correctly
- [ ] Approve button triggers blockchain transaction
- [ ] Mint button creates minting transaction
- [ ] Transaction status updates in real-time

### 3. Wallet Features
- [ ] Real-time balance updates
- [ ] Transaction history display
- [ ] Explorer links work
- [ ] Refresh functionality

### 4. Error Handling
- [ ] Graceful fallback when wallet not connected
- [ ] Error messages for failed transactions
- [ ] Network mismatch warnings
- [ ] Loading states during transactions

## Production Considerations

### Security
- [ ] Environment variables properly configured
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled for production
- [ ] Content Security Policy configured

### Performance
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] Lazy loading implemented
- [ ] Caching strategies

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics integration
- [ ] Performance monitoring
- [ ] Uptime monitoring

## Troubleshooting

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Blockchain Connection Issues
1. Verify contract addresses in `.env`
2. Check Sepolia network status
3. Ensure sufficient ETH for gas fees
4. Verify MetaMask configuration

### Common Errors

**"Cannot read properties of undefined"**
- Check if all environment variables are set
- Verify contract addresses are correct

**"User rejected the request"**
- User cancelled MetaMask transaction
- Normal behavior, handle gracefully

**"Insufficient funds for gas"**
- User needs more Sepolia ETH
- Direct to faucet: https://sepoliafaucet.com/

## Maintenance

### Regular Tasks
- [ ] Monitor contract interactions
- [ ] Update dependencies monthly
- [ ] Check for security vulnerabilities
- [ ] Monitor gas usage and costs

### Updates
- [ ] Test on staging environment first
- [ ] Backup current deployment
- [ ] Deploy during low-traffic periods
- [ ] Monitor for issues post-deployment

## Support

For technical support:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify MetaMask and network configuration
4. Check Sepolia testnet status

## License

This project is for demonstration purposes. Ensure proper licensing for production use.

---

**Note**: This is a testnet implementation. For mainnet deployment, update contract addresses and network configuration accordingly.