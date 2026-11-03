import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  delay?: number;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon, 
  variant = 'default',
  delay = 0 
}: MetricCardProps) => {
  const variants = {
    default: 'bg-card border border-border',
    primary: 'gradient-primary text-primary-foreground',
    secondary: 'gradient-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  const iconVariants = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    secondary: 'bg-secondary-foreground/20 text-secondary-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "p-6 rounded-2xl shadow-md",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <h3 className="text-3xl font-display font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {change && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              changeType === 'positive' && (variant === 'default' ? 'text-success' : 'text-success-foreground'),
              changeType === 'negative' && (variant === 'default' ? 'text-destructive' : 'text-destructive-foreground'),
              changeType === 'neutral' && 'opacity-70'
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconVariants[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
