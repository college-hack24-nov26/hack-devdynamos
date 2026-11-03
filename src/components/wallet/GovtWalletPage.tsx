import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, ExternalLink, Copy, TrendingUp, PieChart as PieChartIcon, RefreshCw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { carbonCredits, projects, walletTransactionTypes, walletMonthlyInflow, summaryMetrics } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';
import crossPlatformSync from '@/services/crossPlatformSync';
import { GOVERNMENT_WALLET_ADDRESS } from '@/config/blockchain';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line
} from 'recharts';

// Import reset utility for testing
import '@/utils/resetSync';

const walletHistory = [
  { date: 'Jan', balance: 1200 },
  { date: 'Feb', balance: 1350 },
  { date: 'Mar', balance: 1500 },
  { date: 'Apr', balance: 1650 },
  { date: 'May', balance: 1800 },
  { date: 'Jun', balance: 1950 },
  { date: 'Jul', balance: 2100 },
  { date: 'Aug', balance: 2200 },
  { date: 'Sep', balance: 2300 },
  { date: 'Oct', balance: 2500 },
  { date: 'Nov', balance: 2450 },
  { date: 'Dec', balance: 2423 },
];

const COLORS = ['hsl(160, 84%, 28%)', 'hsl(199, 89%, 48%)', 'hsl(45, 100%, 55%)', 'hsl(220, 60%, 18%)'];

const GovtWalletPage = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const [blockchainBalance, setBlockchainBalance] = useState<number>(0);
  const [blockchainSupply, setBlockchainSupply] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState(blockchainService.getAllTransactions());
  const [syncedBalance, setSyncedBalance] = useState<number | null>(null);
  const [syncedSupply, setSyncedSupply] = useState<number | null>(null);
  
  const walletAddress = GOVERNMENT_WALLET_ADDRESS;
  
  // Use synced values if available, otherwise use blockchain or default values
  const totalBalance = syncedBalance ?? blockchainBalance ?? 2423;
  const totalSupply = syncedSupply ?? blockchainSupply ?? 2423;
  const estimatedValue = summaryMetrics.govtWalletEstimatedValue;

  // Debug logging
  console.log('🔍 Government Wallet Debug:', {
    syncedBalance,
    syncedSupply,
    blockchainBalance,
    blockchainSupply,
    totalBalance,
    totalSupply,
    mockDataBalance: summaryMetrics.govtWalletBalance
  });

  const loadBlockchainData = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const [balance, supply] = await Promise.all([
        blockchainService.getGovernmentWalletBalance(),
        blockchainService.getTotalSupply()
      ]);
      
      setBlockchainBalance(balance);
      setBlockchainSupply(supply);
      setTransactions(blockchainService.getAllTransactions());
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
      toast({
        title: "Failed to load blockchain data",
        description: "Using synced data instead",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize cross-platform sync
    crossPlatformSync.initialize();
    
    // Get initial synced balance and supply
    const initialBalance = crossPlatformSync.getGovernmentBalance();
    const initialSupply = crossPlatformSync.getTotalSupply();
    
    if (initialBalance !== null) {
      setSyncedBalance(initialBalance);
    }
    if (initialSupply !== null) {
      setSyncedSupply(initialSupply);
    }
    
    // Listen for balance and supply changes from other platforms
    const handleBalanceChange = (newBalance: number, newSupply: number) => {
      setSyncedBalance(newBalance);
      setSyncedSupply(newSupply);
      toast({
        title: "Balance Updated",
        description: `Government wallet updated - Balance: ${newBalance.toLocaleString()} CC, Supply: ${newSupply.toLocaleString()} CC`,
      });
    };
    
    crossPlatformSync.onBalanceChange(handleBalanceChange);
    
    // Load blockchain data
    loadBlockchainData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadBlockchainData, 30000);
    
    return () => {
      clearInterval(interval);
      crossPlatformSync.removeBalanceListener(handleBalanceChange);
    };
  }, [isConnected]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: 'Wallet address copied!' });
  };

  const mintedProjects = projects.filter(p => p.status === 'minted');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Government Wallet</h2>
          <p className="text-muted-foreground">National carbon credit treasury on Sepolia testnet</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBlockchainData}
            disabled={isLoading || !isConnected}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Debug current state
              const currentBalance = crossPlatformSync.getGovernmentBalance();
              const currentSupply = crossPlatformSync.getTotalSupply();
              
              alert(`Debug Info:
Synced Balance: ${syncedBalance}
Synced Supply: ${syncedSupply}
LocalStorage Balance: ${currentBalance}
LocalStorage Supply: ${currentSupply}
Blockchain Balance: ${blockchainBalance}
Blockchain Supply: ${blockchainSupply}
Final Total Balance: ${totalBalance}
Final Total Supply: ${totalSupply}`);
            }}
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            Debug Values
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://sepolia.etherscan.io/address/${walletAddress}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>
      </div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-3xl p-8 text-white"
      >
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Government Carbon Wallet</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                <button onClick={copyAddress} className="hover:text-primary transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <Badge className={`${isConnected ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isConnected ? 'bg-success' : 'bg-warning'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-white/60 text-sm mb-1">Total Balance</p>
            <div className="flex items-center gap-2">
              <p className="text-5xl font-display font-bold">{Math.floor(totalBalance).toLocaleString()}</p>
              {isLoading && <RefreshCw className="w-6 h-6 animate-spin text-white/60" />}
            </div>
            <p className="text-white/60 text-sm mt-1">Carbon Credits (CC)</p>
            {blockchainBalance > 0 && (
              <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                Live Blockchain Data
              </Badge>
            )}
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Total Supply</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-display font-bold">{Math.floor(totalSupply || summaryMetrics.totalMinted).toLocaleString()}</span>
            </div>
            <p className="text-white/60 text-sm mt-1">CC ever minted</p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Est. Value (₹)</p>
            <p className="text-3xl font-display font-bold">₹{(estimatedValue / 10000000).toFixed(2)} Cr</p>
            <p className="text-white/60 text-sm mt-1">@ ₹{(estimatedValue / totalBalance).toFixed(2)}/CC</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Balance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Wallet Balance History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={walletHistory}>
                <defs>
                  <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} CC`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(160, 84%, 28%)" 
                  strokeWidth={2}
                  fill="url(#walletGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Transaction Distribution</h3>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={walletTransactionTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {walletTransactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.type]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {walletTransactionTypes.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{item.value}%</span>
                    <p className="text-xs text-muted-foreground">{item.amount.toLocaleString()} CC</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Inflow vs Outflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Monthly Inflow vs Outflow</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={walletMonthlyInflow}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} CC`,
                    name === 'inflow' ? 'Minted' : 'Allocated/Retired'
                  ]}
                />
                <Bar dataKey="inflow" fill="hsl(160, 84%, 28%)" radius={[4, 4, 0, 0]} name="inflow" />
                <Bar dataKey="outflow" fill="hsl(45, 100%, 55%)" radius={[4, 4, 0, 0]} name="outflow" />
                <Line 
                  type="monotone" 
                  dataKey="inflow" 
                  stroke="hsl(160, 84%, 38%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Minted (Inflow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Allocated/Retired (Outflow)</span>
            </div>
          </div>
        </motion.div>

        {/* Credit Lifecycle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Credit Lifecycle Tracking</h3>
          <div className="grid grid-cols-5 gap-4">
            {['predicted', 'verified', 'minted', 'allocated', 'retired'].map((stage, idx) => {
              const count = carbonCredits.filter(c => c.status === stage).length;
              const isActive = idx <= 2;
              
              return (
                <div 
                  key={stage}
                  className={`p-4 rounded-xl border text-center ${
                    isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    isActive ? 'gradient-primary' : 'bg-muted'
                  }`}>
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-2xl font-bold font-display">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{stage}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits in Lifecycle</p>
                <p className="text-2xl font-bold font-display">{carbonCredits.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} CC</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-success">78.5%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Recent Blockchain Transactions</h3>
          <Badge variant="outline" className="text-xs">
            {transactions.length} transactions
          </Badge>
        </div>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx, idx) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.status === 'success' ? 'gradient-primary' : 
                    tx.status === 'pending' ? 'bg-warning/20' : 'bg-destructive/20'
                  }`}>
                    {tx.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    ) : tx.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-warning" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === 'approve' ? 'Project Approval' : 'Carbon Credits Minted'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Project {tx.projectId} • {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {tx.amount && (
                      <p className="font-semibold text-success">+{tx.amount} CC</p>
                    )}
                    <Badge variant="outline" className={
                      tx.status === 'success' ? 'text-success border-success/20' :
                      tx.status === 'pending' ? 'text-warning border-warning/20' :
                      'text-destructive border-destructive/20'
                    }>
                      {tx.status}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => window.open(blockchainService.getExplorerUrl(tx.hash), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No blockchain transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your wallet and approve/mint projects to see transactions
            </p>
          </div>
        )}
      </motion.div>

      {/* Legacy Minting Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">Legacy Minting Records</h3>
        <div className="space-y-3">
          {mintedProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{project.farmerName}</p>
                  <p className="text-sm text-muted-foreground">{project.state} • {project.projectType.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-success">+{project.mintedCredits} CC</p>
                  <p className="text-xs text-muted-foreground">{project.approvedDate}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Legacy
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GovtWalletPage;
