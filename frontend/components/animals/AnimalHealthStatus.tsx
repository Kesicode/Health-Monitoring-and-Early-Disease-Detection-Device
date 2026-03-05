import { cn, getHealthStatus, getHealthStatusColor } from "@/lib/utils";
import { CheckCircle, AlertTriangle, AlertOctagon, HelpCircle } from "lucide-react";

interface AnimalHealthStatusProps {
  temperature: number | null;
  heartRate: number | null;
  animalType: string;
  className?: string;
}

const icons = {
  healthy:  <CheckCircle className="h-5 w-5 text-green-600" />,
  warning:  <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  critical: <AlertOctagon className="h-5 w-5 text-red-600" />,
  unknown:  <HelpCircle className="h-5 w-5 text-gray-400" />,
};

export function AnimalHealthStatus({ temperature, heartRate, animalType, className }: AnimalHealthStatusProps) {
  const status = getHealthStatus(temperature, heartRate, animalType);
  const colorClass = getHealthStatusColor(status);
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium", colorClass, className)}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </div>
  );
}
