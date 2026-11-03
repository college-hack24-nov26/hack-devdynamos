import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Calendar, Leaf, Wallet, ChevronRight, IndianRupee, CheckCircle, Clock, AlertCircle, TrendingUp, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { farmers, projects, Farmer } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Area, ComposedChart
} from 'recharts';

const FarmersPage = () => {
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<Farmer | null>(null);

  const getFarmerProjects = (farmerId: string) => {
    return projects.filter(p => p.farmerId === farmerId);
  };

  const getFarmerStats = (farmerId: string) => {
    const farmerProjects = getFarmerProjects(farmerId);
    const totalCredits = farmerProjects.reduce((acc, p) => acc + p.mintedCredits, 0);
    const approvedCount = farmerProjects.filter(p => p.status !== 'pending' && p.status !== 'rejected').length;
    return { totalProjects: farmerProjects.length, totalCredits, approvedCount };
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-info" />;
      default: return null;
    }
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'processing': return 'bg-info/10 text-info border-info/20';
      default: return '';
    }
  };

  // Calculate total earnings across all farmers
  const totalFarmerEarnings = farmers.reduce((acc, f) => {
    const latestEarning = f.yearlyEarnings?.[f.yearlyEarnings.length - 1];
    return acc + (latestEarning?.earnings || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Registered Farmers</h2>
          <p className="text-muted-foreground">Farmer profiles, earnings, and payment tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-3xl font-display font-bold text-primary">{farmers.length}</p>
            <p className="text-sm text-muted-foreground">Total Farmers</p>
          </div>
          <div className="text-right px-4 py-2 rounded-xl bg-success/10 border border-success/20">
            <p className="text-2xl font-display font-bold text-success">₹{(totalFarmerEarnings / 100000).toFixed(1)}L</p>
            <p className="text-sm text-muted-foreground">Total Earnings (2025)</p>
          </div>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-2 gap-4">
        {farmers.map((farmer, index) => {
          const stats = getFarmerStats(farmer.id);
          const isSelected = selectedFarmer === farmer.id;
          const latestEarning = farmer.yearlyEarnings?.[farmer.yearlyEarnings.length - 1];

          return (
            <motion.div
              key={farmer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-card border rounded-2xl overflow-hidden cursor-pointer transition-all",
                isSelected ? "border-primary shadow-lg" : "border-border hover:border-primary/30"
              )}
              onClick={() => setSelectedFarmer(isSelected ? null : farmer.id)}
            >
              {/* Main Info */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">
                      {farmer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{farmer.name}</h3>
                        {farmer.aadhaarVerified ? (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                            <AlertCircle className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {farmer.district}, {farmer.state}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ChevronRight className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      isSelected && "rotate-90"
                    )} />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={(e) => { e.stopPropagation(); setShowWalletModal(farmer); }}
                    >
                      <Wallet className="w-3 h-3 mr-1" /> View Payments
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display">{farmer.landArea}</p>
                    <p className="text-xs text-muted-foreground">Hectares</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display">{stats.totalProjects}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display text-primary">{stats.totalCredits}</p>
                    <p className="text-xs text-muted-foreground">CC Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display text-success">₹{latestEarning ? (latestEarning.earnings / 1000).toFixed(0) : 0}K</p>
                    <p className="text-xs text-muted-foreground">2025 Earnings</p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-border bg-muted/30"
                >
                  <div className="p-6 space-y-4">
                    {/* Farmer Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Leaf className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Crop:</span>
                        <span className="font-medium">{farmer.cropType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Registered:</span>
                        <span className="font-medium">{farmer.registeredDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Wallet:</span>
                        <span className="font-mono text-xs">{farmer.walletAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{farmer.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Earnings Growth Chart */}
                    {farmer.yearlyEarnings && farmer.yearlyEarnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Earnings Growth
                        </h4>
                        <div className="h-32 bg-card rounded-lg p-3 border border-border">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={farmer.yearlyEarnings}>
                              <defs>
                                <linearGradient id={`gradient-${farmer.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                              <Tooltip 
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="earnings" 
                                fill={`url(#gradient-${farmer.id})`}
                                stroke="hsl(160, 84%, 28%)"
                                strokeWidth={2}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Projects List */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Projects</h4>
                      <div className="space-y-2">
                        {getFarmerProjects(farmer.id).map(project => (
                          <div 
                            key={project.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                          >
                            <div>
                              <p className="text-sm font-medium">{project.projectType.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">{project.district}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold">{project.estimatedCredits} CC</span>
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                project.status === 'minted' && "bg-success/10 text-success border-success/20",
                                project.status === 'approved' && "bg-info/10 text-info border-info/20",
                                project.status === 'pending' && "bg-warning/10 text-warning border-warning/20",
                                project.status === 'rejected' && "bg-destructive/10 text-destructive border-destructive/20"
                              )}>
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment Status Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalletModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-secondary-foreground font-bold">
                    {showWalletModal.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{showWalletModal.name}</h3>
                    <p className="text-sm text-muted-foreground">{showWalletModal.district}, {showWalletModal.state}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWalletModal(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Wallet Info */}
                <div className="gradient-hero rounded-xl p-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-6 h-6" />
                    <span className="font-mono text-sm">{showWalletModal.walletAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-xs">Total CC Earned</p>
                      <p className="text-2xl font-bold font-display">
                        {showWalletModal.yearlyEarnings?.reduce((acc, y) => acc + y.carbonCredits, 0) || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Total Earnings</p>
                      <p className="text-2xl font-bold font-display">
                        ₹{((showWalletModal.yearlyEarnings?.reduce((acc, y) => acc + y.earnings, 0) || 0) / 100000).toFixed(2)}L
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings Chart */}
                {showWalletModal.yearlyEarnings && showWalletModal.yearlyEarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Carbon Credit Earnings Over Time
                    </h4>
                    <div className="h-48 bg-muted/30 rounded-xl p-4 border border-border">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={showWalletModal.yearlyEarnings}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                          <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} 
                            axisLine={false} 
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              name === 'earnings' ? `₹${value.toLocaleString()}` : `${value} CC`,
                              name === 'earnings' ? 'Earnings' : 'Carbon Credits'
                            ]}
                            contentStyle={{ borderRadius: '12px' }}
                          />
                          <Bar dataKey="earnings" fill="hsl(160, 84%, 28%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm text-success flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {showWalletModal.yearlyEarnings.length >= 2 && (
                          <>
                            Year-over-year growth: +
                            {(((showWalletModal.yearlyEarnings[showWalletModal.yearlyEarnings.length - 1].earnings - 
                               showWalletModal.yearlyEarnings[showWalletModal.yearlyEarnings.length - 2].earnings) / 
                               showWalletModal.yearlyEarnings[showWalletModal.yearlyEarnings.length - 2].earnings) * 100).toFixed(1)}%
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Monthly Payments */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Monthly Payment Status
                  </h4>
                  <div className="space-y-2">
                    {showWalletModal.monthlyPayments?.map((payment, idx) => (
                      <motion.div
                        key={`${payment.month}-${payment.year}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border border-border">
                            <span className="text-xs font-semibold">{payment.month}</span>
                          </div>
                          <div>
                            <p className="font-medium">{payment.month} {payment.year}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.paidDate ? `Paid on ${payment.paidDate}` : 'Payment pending'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold font-display">₹{payment.amount.toLocaleString()}</span>
                          <Badge variant="outline" className={cn("text-xs capitalize", getPaymentStatusClass(payment.status))}>
                            {getPaymentStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </Badge>
                        </div>
                      </motion.div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">No payment records available</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmersPage;
