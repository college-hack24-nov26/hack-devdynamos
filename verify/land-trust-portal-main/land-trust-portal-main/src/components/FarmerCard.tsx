import { motion } from "framer-motion";
import { MapPin, Calendar, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import type { Farmer } from "@/data/mockFarmers";

interface FarmerCardProps {
  farmer: Farmer;
  index: number;
}

const FarmerCard = ({ farmer, index }: FarmerCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass-card-hover group flex flex-col p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {farmer.ownerName}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{farmer.district}, {farmer.taluka}</span>
          </div>
        </div>
        <StatusBadge status={farmer.status} />
      </div>

      <div className="space-y-3 text-sm flex-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Land ID</span>
          <span className="font-mono text-xs text-foreground">{farmer.landId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Aadhaar</span>
          <span className="font-mono text-xs text-foreground">{farmer.aadhaarNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Area</span>
          <span className="text-foreground">{farmer.landArea} acres</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Submitted</span>
          <span className="flex items-center gap-1 text-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {farmer.submissionDate}
          </span>
        </div>
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="flex items-center gap-2 mb-3">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
          <Download className="h-3 w-3" /> Aadhaar
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
          <FileText className="h-3 w-3" /> 7/12
        </button>
      </div>

      <button
        onClick={() => navigate(`/dashboard/farmer/${farmer.id}`)}
        className="gradient-primary w-full rounded-lg py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
      >
        View Details
      </button>
    </motion.div>
  );
};

export default FarmerCard;
