import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Eye, FileText, CheckCircle, XCircle,
  User, Hash, CreditCard, Loader2, AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import {
  fetchFarmerById,
  updateFarmerStatus,
  useInvalidateFarmers,
} from "@/hooks/useFarmers";
import type { FarmerRecord } from "@/types/farmer";
import { toast } from "sonner";

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invalidate = useInvalidateFarmers();
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);

  const { data: farmer, isLoading, isError } = useQuery<FarmerRecord>({
    queryKey: ["farmer", id],
    queryFn: () => fetchFarmerById(id!),
    enabled: !!id,
  });

  const handleApprove = async () => {
    if (!farmer) return;
    setActionLoading("approve");
    try {
      await updateFarmerStatus(farmer.land_id, "Verified");
      toast.success("✅ Verification accepted successfully");
      await invalidate();
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      toast.error("Failed to approve. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!farmer) return;
    setActionLoading("reject");
    try {
      await updateFarmerStatus(farmer.land_id, "Rejected");
      toast.error("❌ Verification rejected");
      await invalidate();
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      toast.error("Failed to reject. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const openDoc = (url: string) => {
    if (!url || url.trim() === "") return toast.error("No document link available");
    const viewUrl = url
      .replace(/\/view(\?usp=[\w_&=]+)?$/, "/preview")
      .replace(/export=download/g, "");
    window.open(viewUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading farmer details…</span>
        </div>
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Farmer record not found or backend unreachable.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-2 text-sm text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const coordinates = [
    { lat: farmer.coord_1, lng: farmer.coord_2 },
    { lat: farmer.coord_3, lng: farmer.coord_4 },
    { lat: farmer.coord_5, lng: farmer.coord_6 },
  ];

  const infoItems = [
    { icon: User, label: "Owner Name", value: farmer.land_owner_name },
    { icon: Hash, label: "Land ID", value: farmer.land_id },
    { icon: CreditCard, label: "Aadhaar Number", value: farmer.aadhaar_number },
    { icon: MapPin, label: "Status", value: farmer.request_status },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-6 py-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </motion.button>

        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{farmer.land_owner_name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Land ID: {farmer.land_id}</p>
            </div>
            <div className="mt-3 sm:mt-0">
              <StatusBadge status={farmer.request_status} size="lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg bg-secondary/40 p-4">
                <item.icon className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coordinates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Land Boundary Coordinates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coordinates.map((coord, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">
                  P{i + 1}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Point {i + 1}</p>
                  <p className="text-sm font-mono text-foreground">
                    {coord.lat}°N, {coord.lng}°E
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Map placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Map View — Boundary Polygon Visualization</h2>
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20">
            <div className="text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Satellite Map View</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Coord set: ({farmer.coord_1}, {farmer.coord_2}), ({farmer.coord_3}, {farmer.coord_4}), ({farmer.coord_5}, {farmer.coord_6})
              </p>
            </div>
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-8 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => openDoc(farmer.aadhaar_drive_link)}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-5 text-left transition-all hover:bg-secondary hover:border-blue-400/40 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">View Aadhaar</p>
                <p className="text-xs text-muted-foreground">Opens in Google Drive viewer</p>
              </div>
            </button>
            <button
              onClick={() => openDoc(farmer.seven_twelve_drive_link)}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-5 text-left transition-all hover:bg-secondary hover:border-blue-400/40 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">View 7/12 Extract</p>
                <p className="text-xs text-muted-foreground">Opens in Google Drive viewer</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Officer Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Officer Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              disabled={farmer.request_status === "Verified" || !!actionLoading}
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading === "approve" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {farmer.request_status === "Verified" ? "Already Verified" : "Accept Verification"}
            </button>
            <button
              disabled={farmer.request_status === "Rejected" || !!actionLoading}
              onClick={handleReject}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading === "reject" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {farmer.request_status === "Rejected" ? "Already Rejected" : "Reject Verification"}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FarmerDetails;
