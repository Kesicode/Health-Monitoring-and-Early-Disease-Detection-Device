import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "unassigned" | "warning" | "active" | "banned";

const styles: Record<StatusType, string> = {
  online:     "bg-green-100 text-green-700 border-green-200",
  offline:    "bg-red-100 text-red-700 border-red-200",
  unassigned: "bg-gray-100 text-gray-600 border-gray-200",
  warning:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  active:     "bg-green-100 text-green-700 border-green-200",
  banned:     "bg-red-100 text-red-700 border-red-200",
};

const dots: Record<StatusType, string> = {
  online:     "bg-green-500",
  offline:    "bg-red-500",
  unassigned: "bg-gray-400",
  warning:    "bg-yellow-500",
  active:     "bg-green-500",
  banned:     "bg-red-500",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", styles[status], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
