import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Coins, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { projects } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RecentProjectsProps {
  onViewAll: () => void;
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { icon: CheckCircle, label: 'Approved', className: 'bg-info/10 text-info border-info/20' },
  minted: { icon: Coins, label: 'Minted', className: 'bg-success/10 text-success border-success/20' },
  rejected: { icon: XCircle, label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const RecentProjects = ({ onViewAll }: RecentProjectsProps) => {
  const recentProjects = projects.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Recent Projects</h3>
          <p className="text-sm text-muted-foreground">Latest farmer submissions</p>
        </div>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {recentProjects.map((project, index) => {
          const status = statusConfig[project.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
                  {project.farmerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{project.farmerName}</p>
                  <p className="text-xs text-muted-foreground">{project.state} • {project.landArea} ha</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-sm">{project.estimatedCredits} CC</p>
                  <p className="text-xs text-muted-foreground">{project.confidenceScore}% confidence</p>
                </div>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentProjects;
