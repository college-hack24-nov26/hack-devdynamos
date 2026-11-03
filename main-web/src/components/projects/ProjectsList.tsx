import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Coins, 
  MapPin, 
  Calendar, 
  Leaf, 
  Zap,
  Eye,
  Check,
  X,
  Sparkles,
  FileCheck,
  AlertTriangle,
  Ruler,
  FlaskConical,
  Satellite,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { projects as initialProjects, Project } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ProjectMap from '../maps/ProjectMap';
import TransactionStatus from '../blockchain/TransactionStatus';
import blockchainService from '@/services/blockchainService';

// Fix Leaflet default marker icon
const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentTransactionHash, setCurrentTransactionHash] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { isConnected } = useAccount();

  const statusConfig = {
    pending: { icon: Clock, label: 'Pending Review', className: 'bg-warning/10 text-warning border-warning/20' },
    approved: { icon: CheckCircle, label: 'Approved', className: 'bg-info/10 text-info border-info/20' },
    minted: { icon: Coins, label: 'Credits Minted', className: 'bg-success/10 text-success border-success/20' },
    rejected: { icon: XCircle, label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const projectTypeLabels = {
    afforestation: 'Afforestation',
    regenerative_agriculture: 'Regenerative Agriculture',
    agroforestry: 'Agroforestry',
    solar_farming: 'Solar Farming',
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const handleApprove = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setLoadingStates(prev => ({ ...prev, [projectId]: true }));

    try {
      const transactionHash = await blockchainService.approveProject(project);
      
      setCurrentTransactionHash(transactionHash);
      
      // Update local state immediately for better UX
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: 'approved' as const, approvedDate: new Date().toISOString().split('T')[0] }
          : p
      ));

      toast({
        title: "Project Approval Initiated! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>Smart contract transaction submitted.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(blockchainService.getExplorerUrl(transactionHash), '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Transaction
            </Button>
          </div>
        ),
      });
      
      setSelectedProject(null);
    } catch (error) {
      console.error('Approval failed:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve project on blockchain",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleReject = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, status: 'rejected' as const }
        : p
    ));
    toast({
      title: "Project Rejected",
      description: "Farmer has been notified.",
      variant: "destructive",
    });
    setSelectedProject(null);
  };

  const handleMint = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setLoadingStates(prev => ({ ...prev, [projectId]: true }));

    try {
      const transactionHash = await blockchainService.mintCarbonCredits(project);
      
      setCurrentTransactionHash(transactionHash);
      
      // Update local state immediately for better UX
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: 'minted' as const, mintedCredits: p.estimatedCredits }
          : p
      ));

      toast({
        title: "Carbon Credits Minting Initiated! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>{project.estimatedCredits} CC will be added to Government Wallet.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(blockchainService.getExplorerUrl(transactionHash), '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Transaction
            </Button>
          </div>
        ),
      });
      
      setSelectedProject(null);
    } catch (error) {
      console.error('Minting failed:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint carbon credits on blockchain",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const isWorthApproving = (project: Project) => {
    return project.documentsVerified && project.landSurveyComplete && project.soilTestPassed && (project.ndviScore || 0) >= 0.6;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">Review and approve farmer carbon credit projects</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'minted', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className={cn(filter === status && 'gradient-primary border-0')}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {filteredProjects.map((project, index) => {
          const status = statusConfig[project.status];
          const StatusIcon = status.icon;
          const worthApproving = isWorthApproving(project);

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center text-secondary-foreground font-bold text-lg">
                    {project.farmerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{project.farmerName}</h3>
                      <Badge variant="outline" className={cn("text-xs", status.className)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      {project.status === 'pending' && (
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          worthApproving ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          {worthApproving ? <Check className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {worthApproving ? 'Recommended' : 'Review Required'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.district}, {project.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        {project.landArea} hectares
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.submittedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold font-display">{project.estimatedCredits}</span>
                    <span className="text-muted-foreground">CC</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Confidence: <span className={cn(
                      "font-medium",
                      project.confidenceScore >= 85 ? "text-success" : 
                      project.confidenceScore >= 70 ? "text-warning" : "text-destructive"
                    )}>{project.confidenceScore}%</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{projectTypeLabels[project.projectType]}</Badge>
                  {project.revenuePerYear && (
                    <span className="text-sm text-muted-foreground">
                      Est. Revenue: <span className="font-semibold text-success">₹{project.revenuePerYear.toLocaleString()}/yr</span>
                    </span>
                  )}
                </div>
                
                {project.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => { e.stopPropagation(); handleReject(project.id); }}
                      disabled={loadingStates[project.id]}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="gradient-primary"
                      onClick={(e) => { e.stopPropagation(); handleApprove(project.id); }}
                      disabled={loadingStates[project.id]}
                    >
                      {loadingStates[project.id] ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {loadingStates[project.id] ? 'Approving...' : 'Approve'}
                    </Button>
                  </div>
                )}

                {project.status === 'approved' && (
                  <Button 
                    size="sm" 
                    className="gradient-primary animate-pulse-glow"
                    onClick={(e) => { e.stopPropagation(); handleMint(project.id); }}
                    disabled={loadingStates[project.id]}
                  >
                    {loadingStates[project.id] ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-1" />
                    )}
                    {loadingStates[project.id] ? 'Minting...' : 'Mint Carbon Credits'}
                  </Button>
                )}

                {project.status === 'minted' && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{project.mintedCredits} CC Minted</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold">{selectedProject.farmerName}</h2>
                    <p className="text-muted-foreground">{selectedProject.district}, {selectedProject.state}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-sm", statusConfig[selectedProject.status].className)}>
                    {statusConfig[selectedProject.status].label}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Interactive Map */}
                <ProjectMap project={selectedProject} height="250px" />

                {/* Verification Status */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">VERIFICATION STATUS</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2",
                      selectedProject.documentsVerified ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                    )}>
                      <FileCheck className={cn("w-6 h-6", selectedProject.documentsVerified ? "text-success" : "text-destructive")} />
                      <span className="text-xs font-medium text-center">Documents</span>
                      <Badge variant="outline" className={cn("text-xs", selectedProject.documentsVerified ? "text-success" : "text-destructive")}>
                        {selectedProject.documentsVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2",
                      selectedProject.landSurveyComplete ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                    )}>
                      <Ruler className={cn("w-6 h-6", selectedProject.landSurveyComplete ? "text-success" : "text-destructive")} />
                      <span className="text-xs font-medium text-center">Land Survey</span>
                      <Badge variant="outline" className={cn("text-xs", selectedProject.landSurveyComplete ? "text-success" : "text-destructive")}>
                        {selectedProject.landSurveyComplete ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2",
                      selectedProject.soilTestPassed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                    )}>
                      <FlaskConical className={cn("w-6 h-6", selectedProject.soilTestPassed ? "text-success" : "text-destructive")} />
                      <span className="text-xs font-medium text-center">Soil Test</span>
                      <Badge variant="outline" className={cn("text-xs", selectedProject.soilTestPassed ? "text-success" : "text-destructive")}>
                        {selectedProject.soilTestPassed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2",
                      (selectedProject.ndviScore || 0) >= 0.6 ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                    )}>
                      <Satellite className={cn("w-6 h-6", (selectedProject.ndviScore || 0) >= 0.6 ? "text-success" : "text-warning")} />
                      <span className="text-xs font-medium text-center">NDVI Score</span>
                      <Badge variant="outline" className={cn("text-xs", (selectedProject.ndviScore || 0) >= 0.6 ? "text-success" : "text-warning")}>
                        {((selectedProject.ndviScore || 0) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Land Area</p>
                    <p className="text-lg font-semibold">{selectedProject.landArea} hectares</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Crop Type</p>
                    <p className="text-lg font-semibold">{selectedProject.cropType}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Project Type</p>
                    <p className="text-lg font-semibold">{projectTypeLabels[selectedProject.projectType]}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="text-lg font-semibold font-mono text-sm">{selectedProject.coordinates.lat}°N, {selectedProject.coordinates.lng}°E</p>
                  </div>
                </div>

                {/* Worth Approving Analysis */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  isWorthApproving(selectedProject) ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                )}>
                  <div className="flex items-center gap-3">
                    {isWorthApproving(selectedProject) ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-warning" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {isWorthApproving(selectedProject) ? 'Recommended for Approval' : 'Manual Review Required'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isWorthApproving(selectedProject) 
                          ? 'All verification checks passed. This project meets all criteria for approval.'
                          : 'Some verification checks failed. Please review the verification status above before making a decision.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Carbon estimation */}
                <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">AI Estimated Carbon Credits</p>
                      <p className="text-3xl font-display font-bold">{selectedProject.estimatedCredits} CC</p>
                      {selectedProject.revenuePerYear && (
                        <p className="text-sm opacity-80 mt-1">Est. Revenue: ₹{selectedProject.revenuePerYear.toLocaleString()}/year</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">Confidence Score</p>
                      <p className="text-2xl font-bold">{selectedProject.confidenceScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-border flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  Close
                </Button>
                {selectedProject.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReject(selectedProject.id)}
                      disabled={loadingStates[selectedProject.id]}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      className="gradient-primary"
                      onClick={() => handleApprove(selectedProject.id)}
                      disabled={loadingStates[selectedProject.id]}
                    >
                      {loadingStates[selectedProject.id] ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {loadingStates[selectedProject.id] ? 'Approving...' : 'Approve Project'}
                    </Button>
                  </>
                )}
                {selectedProject.status === 'approved' && (
                  <Button 
                    className="gradient-primary"
                    onClick={() => handleMint(selectedProject.id)}
                    disabled={loadingStates[selectedProject.id]}
                  >
                    {loadingStates[selectedProject.id] ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-1" />
                    )}
                    {loadingStates[selectedProject.id] ? 'Minting...' : 'Mint Carbon Credits'}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Status */}
      {currentTransactionHash && (
        <TransactionStatus 
          transactionHash={currentTransactionHash}
          onClose={() => setCurrentTransactionHash(null)}
        />
      )}
    </div>
  );
};

export default ProjectsList;
