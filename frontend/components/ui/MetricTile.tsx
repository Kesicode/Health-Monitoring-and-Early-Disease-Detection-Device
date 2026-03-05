import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricTileProps {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "flat";
  status?: "normal" | "warning" | "critical";
  isLive?: boolean;
  className?: string;
}

const statusColors = {
  normal: "border-green-200 bg-green-50",
  warning: "border-yellow-300 bg-yellow-50",
  critical: "border-red-300 bg-red-50",
};

const statusValueColors = {
  normal: "text-green-700",
  warning: "text-yellow-700",
  critical: "text-red-700",
};

export function MetricTile({ label, value, unit, trend, status = "normal", isLive, className }: MetricTileProps) {
  return (
    <div className={cn("rounded-xl border-2 p-4 transition-all", statusColors[status], className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className={cn("text-3xl font-bold", statusValueColors[status])}>{value}</span>
        {unit && <span className="mb-1 text-sm text-gray-500">{unit}</span>}
        {trend && (
          <span className="mb-1 ml-auto">
            {trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
            {trend === "down" && <TrendingDown className="h-4 w-4 text-blue-500" />}
            {trend === "flat" && <Minus className="h-4 w-4 text-gray-400" />}
          </span>
        )}
      </div>
    </div>
  );
}
