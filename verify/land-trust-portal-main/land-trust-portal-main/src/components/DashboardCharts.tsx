import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

interface DashboardChartsProps {
  pending: number;
  verified: number;
  rejected: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-medium text-foreground">{label ?? payload[0]?.name}</p>
      <p className="text-primary">{payload[0].value}</p>
    </div>
  );
};

const DashboardCharts = ({ pending, verified, rejected }: DashboardChartsProps) => {
  const total = pending + verified + rejected;

  const statusData = [
    { name: "Pending", value: pending, color: "hsl(38, 92%, 50%)" },
    { name: "Verified", value: verified, color: "hsl(142, 71%, 45%)" },
    { name: "Rejected", value: rejected, color: "hsl(0, 72%, 51%)" },
  ].filter(d => d.value > 0);

  const approvalRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  // Summary bars for each status
  const summaryData = [
    { label: "Pending", count: pending, bar: total > 0 ? (pending / total) * 100 : 0, color: "bg-amber-400" },
    { label: "Verified", count: verified, bar: total > 0 ? (verified / total) * 100 : 0, color: "bg-emerald-400" },
    { label: "Rejected", count: rejected, bar: total > 0 ? (rejected / total) * 100 : 0, color: "bg-red-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-1">Verification Status</h3>
        <p className="text-xs text-muted-foreground mb-4">Live distribution from database</p>
        {total === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="flex justify-center gap-4 mt-2">
          {statusData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name} ({s.value})
            </div>
          ))}
        </div>
      </motion.div>

      {/* Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-1">Status Breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Approval rate: <span className="text-emerald-400 font-semibold">{approvalRate}%</span>
          {" "}of {total} total records
        </p>
        <div className="space-y-5">
          {summaryData.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground">{item.count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.bar}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-2 rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Records</span>
            <span className="font-bold text-foreground text-sm">{total}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCharts;
