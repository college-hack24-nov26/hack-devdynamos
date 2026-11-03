import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Pending" | "Verified" | "Rejected";
  size?: "sm" | "lg";
}

const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const base = "inline-flex items-center font-semibold rounded-full border";
  const sizes = size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  const variants: Record<string, string> = {
    Pending: "bg-warning/15 text-warning border-warning/30",
    Verified: "bg-success/15 text-success border-success/30",
    Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <span className={cn(base, sizes, variants[status])}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-2",
        status === "Pending" && "bg-warning",
        status === "Verified" && "bg-success",
        status === "Rejected" && "bg-destructive"
      )} />
      {status}
    </span>
  );
};

export default StatusBadge;
