import { cn } from "@/lib/utils";

type Severity = "info" | "warning" | "critical";

const styles: Record<Severity, string> = {
  info:     "bg-blue-100 text-blue-700 border-blue-200",
  warning:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", styles[severity], className)}>
      {severity}
    </span>
  );
}
