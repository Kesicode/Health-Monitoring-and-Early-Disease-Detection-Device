import Link from "next/link";
import { Cpu, AlertTriangle } from "lucide-react";
import { AnimalTypeBadge } from "./AnimalTypeBadge";
import { getHealthStatus, getHealthStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AnimalCardProps {
  id: number;
  name: string;
  animal_type: string;
  breed?: string;
  tag_number?: string;
  image_url?: string;
  device_status?: "online" | "offline" | "unassigned";
  last_temp?: number;
  last_hr?: number;
  active_alerts?: number;
}

export function AnimalCard({ id, name, animal_type, breed, tag_number, image_url, device_status, last_temp, last_hr, active_alerts = 0 }: AnimalCardProps) {
  const health = getHealthStatus(last_temp ?? null, last_hr ?? null, animal_type);
  const healthColor = getHealthStatusColor(health);

  return (
    <Link href={`/dashboard/animals/${id}`} className="group block rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-green-300">
      {/* Animal image / placeholder */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-green-50 to-emerald-100">
        {image_url ? (
          <img src={image_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {["cow","chicken","goat","pig","dog"].includes(animal_type)
              ? { cow:"🐄", chicken:"🐔", goat:"🐐", pig:"🐷", dog:"🐕" }[animal_type]
              : "🐾"}
          </div>
        )}
        {active_alerts > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
            <AlertTriangle className="h-3 w-3" />
            {active_alerts}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-green-700">{name}</p>
            {breed && <p className="text-xs text-gray-500">{breed}</p>}
          </div>
          <AnimalTypeBadge type={animal_type} />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <Cpu className="h-3 w-3" />
            <span className={cn("font-medium", device_status === "online" ? "text-green-600" : "text-gray-400")}>
              {device_status || "No device"}
            </span>
          </div>
          <span className={cn("rounded-full px-2 py-0.5 font-medium capitalize", healthColor)}>
            {health}
          </span>
        </div>

        {last_temp != null && (
          <div className="mt-2 flex gap-3 text-xs text-gray-600">
            <span>🌡️ {last_temp.toFixed(1)}°C</span>
            {last_hr != null && <span>❤️ {last_hr} bpm</span>}
          </div>
        )}

        {tag_number && (
          <div className="mt-1 text-[11px] text-gray-400">Tag: {tag_number}</div>
        )}
      </div>
    </Link>
  );
}
