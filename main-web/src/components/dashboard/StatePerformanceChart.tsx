import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { stateStats } from '@/data/mockData';

const StatePerformanceChart = () => {
  const data = stateStats.sort((a, b) => b.totalCredits - a.totalCredits).slice(0, 8);

  const getBarColor = (fairnessIndex: number) => {
    if (fairnessIndex >= 1.0) return 'hsl(160, 84%, 28%)';
    if (fairnessIndex >= 0.7) return 'hsl(45, 100%, 55%)';
    return 'hsl(0, 72%, 51%)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">State-wise Carbon Credits</h3>
          <p className="text-sm text-muted-foreground">Color indicates fairness index</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Low</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" horizontal={false} />
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="stateCode" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
              width={40}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString() + ' CC',
                'Total Credits'
              ]}
            />
            <Bar dataKey="totalCredits" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.fairnessIndex)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StatePerformanceChart;
