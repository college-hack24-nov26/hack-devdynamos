import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { projectTypeDistribution } from '@/data/mockData';

const COLORS = ['hsl(160, 84%, 28%)', 'hsl(180, 70%, 25%)', 'hsl(200, 60%, 30%)', 'hsl(45, 100%, 55%)'];

const ProjectTypeChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-md"
    >
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg">Project Distribution</h3>
        <p className="text-sm text-muted-foreground">By project methodology</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={projectTypeDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="type"
            >
              {projectTypeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)', 
                border: '1px solid hsl(220, 20%, 88%)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}%`, 'Share']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ProjectTypeChart;
