import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis,
  ComposedChart, Line, Area,
  PieChart, Pie, LineChart
} from 'recharts';
import { stateStats, monthlyTrends, farmerEarningsData, yearlyEarningsGrowth, projects } from '@/data/mockData';
import { TrendingUp, Target, AlertTriangle, Award, Users, IndianRupee, MapPin } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import IndiaMap from '../maps/IndiaMap';

const AnalyticsPage = () => {
  // Prepare radar data
  const radarData = stateStats.slice(0, 6).map(s => ({
    state: s.stateCode,
    awareness: s.awarenessIndex,
    fairness: s.fairnessIndex * 100,
    contribution: s.contribution * 5,
  }));

  // Scatter data for efficiency analysis
  const scatterData = stateStats.map(s => ({
    x: s.totalProjects,
    y: s.totalCredits / s.totalProjects,
    z: s.awarenessIndex,
    name: s.state,
  }));

  // Project type revenue data
  const projectRevenueData = [
    { type: 'Afforestation', avgRevenue: 1250000, projects: 35 },
    { type: 'Agroforestry', avgRevenue: 1450000, projects: 28 },
    { type: 'Regen. Agri.', avgRevenue: 1180000, projects: 25 },
    { type: 'Solar Farming', avgRevenue: 1680000, projects: 12 },
  ];

  // Get color based on performance
  const getStateColor = (state: typeof stateStats[0]) => {
    if (state.fairnessIndex >= 1.0) return '#10b981';
    if (state.fairnessIndex >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive carbon credit performance analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Avg Credits/Project"
          value="39.2"
          change="+12% from last month"
          changeType="positive"
          icon={TrendingUp}
          delay={0}
        />
        <MetricCard
          title="National Fairness Index"
          value="0.92"
          change="Target: 1.00"
          changeType="neutral"
          icon={Target}
          variant="secondary"
          delay={0.1}
        />
        <MetricCard
          title="Underperforming States"
          value="3"
          change="Bihar, Rajasthan, UP"
          changeType="negative"
          icon={AlertTriangle}
          delay={0.2}
        />
        <MetricCard
          title="Top Performer"
          value="Kerala"
          change="Fairness: 1.35"
          changeType="positive"
          icon={Award}
          variant="primary"
          delay={0.3}
        />
      </div>

      {/* India Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">India Carbon Credit Distribution</h3>
        <IndiaMap height="400px" />
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">High Performance (FI ≥ 1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Medium (FI 0.7-1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Needs Attention (FI &lt; 0.7)</span>
          </div>
        </div>
      </motion.div>

      {/* Farmer Earnings Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue by Land Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Farmer Earnings by Land Size</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Average yearly income from carbon credits</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmerEarningsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="category"
                  dataKey="landSize"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Avg. Yearly Earnings']}
                />
                <Bar 
                  dataKey="avgEarnings" 
                  fill="hsl(160, 84%, 28%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-success font-medium">
              💡 A 10-acre land generates ~₹2.38L/year passively through carbon credits
            </p>
          </div>
        </motion.div>

        {/* Yearly Earnings Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Avg. Farmer Earnings Growth</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Year-over-year increase in farmer income</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yearlyEarningsGrowth}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'avgEarnings' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'avgEarnings' ? 'Avg. Earnings' : 'Farmers'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgEarnings"
                  fill="url(#earningsGradient)"
                  stroke="hsl(160, 84%, 28%)"
                  strokeWidth={2}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="farmers" 
                  fill="hsl(220, 60%, 18%)" 
                  radius={[4, 4, 0, 0]} 
                  opacity={0.6}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Avg. Earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Registered Farmers</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Awareness vs Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">State Performance Radar</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 20%, 88%)" />
                <PolarAngleAxis 
                  dataKey="state" 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 10 }}
                />
                <Radar
                  name="Awareness"
                  dataKey="awareness"
                  stroke="hsl(160, 84%, 28%)"
                  fill="hsl(160, 84%, 28%)"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Fairness"
                  dataKey="fairness"
                  stroke="hsl(199, 89%, 48%)"
                  fill="hsl(199, 89%, 48%)"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Project Type Revenue Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Revenue by Project Type</h3>
          <p className="text-sm text-muted-foreground mb-4">Average annual revenue comparison</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                <XAxis 
                  dataKey="type" 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Avg. Revenue']}
                />
                <Bar 
                  dataKey="avgRevenue" 
                  radius={[4, 4, 0, 0]}
                >
                  {projectRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['hsl(160, 84%, 28%)', 'hsl(180, 70%, 25%)', 'hsl(200, 60%, 30%)', 'hsl(45, 100%, 55%)'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-2xl p-6 col-span-2"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Monthly Performance Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(220, 20%, 88%)',
                    borderRadius: '12px'
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="credits"
                  fill="url(#areaGradient)"
                  stroke="hsl(160, 84%, 28%)"
                  strokeWidth={2}
                />
                <Bar yAxisId="right" dataKey="projects" fill="hsl(220, 60%, 18%)" radius={[4, 4, 0, 0]} />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="approvals" 
                  stroke="hsl(45, 100%, 55%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(45, 100%, 55%)', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Carbon Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Approvals</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* State Rankings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">State Performance Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">State</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Projects</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Credits</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Minted</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Awareness</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Fairness</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {stateStats.sort((a, b) => b.totalCredits - a.totalCredits).map((state, idx) => (
                <tr key={state.stateCode} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                      idx < 3 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{state.state}</td>
                  <td className="py-3 px-4 text-right">{state.totalProjects}</td>
                  <td className="py-3 px-4 text-right font-semibold">{state.totalCredits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{state.mintedCredits.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      state.awarenessIndex >= 70 ? 'bg-success/10 text-success' :
                      state.awarenessIndex >= 50 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {state.awarenessIndex}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${
                      state.fairnessIndex >= 1.0 ? 'text-success' :
                      state.fairnessIndex >= 0.7 ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {state.fairnessIndex.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{state.contribution.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
