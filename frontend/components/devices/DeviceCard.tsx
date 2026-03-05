import { Cpu, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

interface DeviceCardProps {
  id: number;
  device_serial: string;
  device_type: string;
  status: "online" | "offline" | "unassigned";
  last_seen?: string;
  battery_pct?: number;
  assigned_animal?: { id: number; name: string };
  basePath?: string;
}

export function DeviceCard({ id, device_serial, device_type, status, last_seen, battery_pct, assigned_animal, basePath = "/dashboard" }: DeviceCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <Cpu className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-gray-800">{device_serial}</p>
            <p className="text-xs text-gray-500 capitalize">{device_type.replace("_", " ")}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {assigned_animal ? (
        <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs">
          <span className="text-gray-500">Assigned to: </span>
          <Link href={`${basePath}/animals/${assigned_animal.id}`} className="font-medium text-green-700 hover:underline">
            {assigned_animal.name}
          </Link>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">Not assigned to any animal</div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        {last_seen && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(last_seen)}
          </span>
        )}
        {battery_pct != null && (
          <span className={battery_pct < 20 ? "text-red-500 font-medium" : ""}>
            🔋 {battery_pct}%
          </span>
        )}
      </div>

      <Link href={`${basePath}/devices/${id}`} className="mt-3 block w-full rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50">
        View Details
      </Link>
    </div>
  );
}
