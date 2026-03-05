import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "green" | "yellow" | "red" | "blue" | "default";
  className?: string;
}

const colorMap = {
  green: "border-l-green-500 bg-green-50",
  yellow: "border-l-yellow-500 bg-yellow-50",
  red: "border-l-red-500 bg-red-50",
  blue: "border-l-blue-500 bg-blue-50",
  default: "border-l-gray-300 bg-white",
};

export function StatCard({ title, value, subtitle, icon, color = "default", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-l-4 p-5 shadow-sm", colorMap[color], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-white/60 p-2 text-2xl shadow-sm">{icon}</div>
        )}
      </div>
    </div>
  );
}
