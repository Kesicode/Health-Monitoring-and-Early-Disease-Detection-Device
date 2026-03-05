"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { AlertNotification } from "@/lib/useAlerts";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  alert: AlertNotification | null;
  onDismiss: () => void;
}

const severityStyles = {
  info:     "border-blue-300 bg-blue-50 text-blue-800",
  warning:  "border-yellow-300 bg-yellow-50 text-yellow-800",
  critical: "border-red-400 bg-red-50 text-red-800",
};

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  if (!alert || !visible) return null;

  return (
    <div className={cn("fixed left-1/2 top-4 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-top-4", severityStyles[alert.severity])}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{alert.animal_name} — {alert.alert_type.replace("_", " ")}</p>
          <p className="text-xs mt-0.5">{alert.message}</p>
        </div>
        <button onClick={() => { setVisible(false); onDismiss(); }} className="text-inherit opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
