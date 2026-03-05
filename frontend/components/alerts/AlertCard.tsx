import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { timeAgo } from "@/lib/utils";
import { ALERT_TYPES } from "@/lib/constants";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface AlertCardProps {
  id: number;
  animal_id: number;
  animal_name?: string;
  alert_type: string;
  message: string;
  severity: "info" | "warning" | "critical" | string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string | null;
  basePath?: string;
  onResolve?: (id: number) => void;
}

export function AlertCard({
  id, animal_id, animal_name = "", alert_type, message, severity,
  is_resolved, created_at, resolved_at, basePath = "/dashboard", onResolve,
}: AlertCardProps) {
  const typeInfo = ALERT_TYPES.find((t) => t.value === alert_type);
  return (
    <div className={`rounded-xl border p-4 ${is_resolved ? "border-gray-100 bg-gray-50 opacity-70" : severity === "critical" ? "border-red-200 bg-red-50" : severity === "warning" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeInfo?.icon || "⚠️"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`${basePath}/animals/${animal_id}`} className="font-semibold text-sm text-gray-800 hover:text-green-700">
              {animal_name || `Animal #${animal_id}`}
            </Link>
            <SeverityBadge severity={severity as "info" | "warning" | "critical"} />
            {is_resolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                <CheckCircle className="h-3 w-3" /> Resolved
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-600">{message}</p>
          <p className="mt-1 text-xs text-gray-400">
            {is_resolved && resolved_at ? `Resolved ${timeAgo(resolved_at)}` : timeAgo(created_at)}
          </p>
        </div>
        {!is_resolved && onResolve && (
          <button
            onClick={() => onResolve(id)}
            className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
