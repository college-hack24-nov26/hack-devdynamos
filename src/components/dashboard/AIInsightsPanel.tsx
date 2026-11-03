import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Shield, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { aiInsights } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  onViewAll: () => void;
}

const categoryConfig = {
  awareness: { icon: Lightbulb, label: 'Awareness', color: 'bg-warning' },
  performance: { icon: TrendingUp, label: 'Performance', color: 'bg-info' },
  leakage: { icon: Shield, label: 'Leakage', color: 'bg-destructive' },
  opportunity: { icon: TrendingUp, label: 'Opportunity', color: 'bg-success' },
};

const severityColors = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-success/10 text-success border-success/30',
};

const AIInsightsPanel = ({ onViewAll }: AIInsightsPanelProps) => {
  const topInsights = aiInsights.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">AI Policy Insights</h3>
            <p className="text-sm text-muted-foreground">Recommended actions</p>
          </div>
        </div>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {topInsights.map((insight, index) => {
          const category = categoryConfig[insight.category];
          const CategoryIcon = category.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn("text-xs", severityColors[insight.severity])}>
                      {insight.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {category.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{insight.region}</h4>
                  <p className="text-sm text-muted-foreground">{insight.issue}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
