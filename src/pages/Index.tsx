import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Zap, 
  FolderKanban, 
  Users, 
  TrendingUp,
  Wallet,
  Clock
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import CreditsTrendChart from '@/components/dashboard/CreditsTrendChart';
import StatePerformanceChart from '@/components/dashboard/StatePerformanceChart';
import ProjectTypeChart from '@/components/dashboard/ProjectTypeChart';
import RecentProjects from '@/components/dashboard/RecentProjects';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import ProjectsList from '@/components/projects/ProjectsList';
import AIInsightsPage from '@/components/ai/AIInsightsPage';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';
import GovtWalletPage from '@/components/wallet/GovtWalletPage';
import FarmersPage from '@/components/farmers/FarmersPage';
import ModelPage from '@/components/model/ModelPage';
import BhuvanPage from '@/components/bhuvan/BhuvanPage';
import { summaryMetrics } from '@/data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsList />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai-insights':
        return <AIInsightsPage />;
      case 'wallet':
        return <GovtWalletPage />;
      case 'farmers':
        return <FarmersPage />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        );
      // ── New sections ──────────────────────────────────────
      case 'model':
        return <ModelPage />;
      case 'bhuvan':
        return <BhuvanPage />;
      default:
        return <DashboardContent onViewProjects={() => setActiveTab('projects')} onViewInsights={() => setActiveTab('ai-insights')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

interface DashboardContentProps {
  onViewProjects: () => void;
  onViewInsights: () => void;
}

const DashboardContent = ({ onViewProjects, onViewInsights }: DashboardContentProps) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">National Carbon Credit Monitoring System</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Carbon Credits"
          value={summaryMetrics.totalCredits}
          change="+12.5% from last month"
          changeType="positive"
          icon={Leaf}
          variant="primary"
          delay={0}
        />
        <MetricCard
          title="Minted Credits"
          value={summaryMetrics.totalMinted}
          change={`${((summaryMetrics.totalMinted / summaryMetrics.totalCredits) * 100).toFixed(1)}% of total`}
          changeType="neutral"
          icon={Zap}
          delay={0.1}
        />
        <MetricCard
          title="Active Projects"
          value={summaryMetrics.approvedProjects}
          change={`${summaryMetrics.pendingProjects} pending review`}
          changeType="neutral"
          icon={FolderKanban}
          variant="secondary"
          delay={0.2}
        />
        <MetricCard
          title="Registered Farmers"
          value={summaryMetrics.totalFarmers}
          change={`${summaryMetrics.activeFarmers} active`}
          changeType="positive"
          icon={Users}
          delay={0.3}
        />
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Govt Wallet Balance"
          value={`${summaryMetrics.govtWalletBalance.toLocaleString()} CC`}
          change="View transactions →"
          changeType="neutral"
          icon={Wallet}
          delay={0.4}
        />
        <MetricCard
          title="Avg Confidence Score"
          value={`${summaryMetrics.avgConfidenceScore}%`}
          change="AI prediction accuracy"
          changeType="positive"
          icon={TrendingUp}
          delay={0.5}
        />
        <MetricCard
          title="National Awareness Index"
          value={`${summaryMetrics.nationalAwarenessIndex}/100`}
          change="Target: 80/100"
          changeType="negative"
          icon={Users}
          delay={0.6}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <CreditsTrendChart />
        <StatePerformanceChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <ProjectTypeChart />
        <RecentProjects onViewAll={onViewProjects} />
        <AIInsightsPanel onViewAll={onViewInsights} />
      </div>
    </div>
  );
};

export default Index;
