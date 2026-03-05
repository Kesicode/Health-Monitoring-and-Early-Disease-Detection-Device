"use client";
import { useState } from "react";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { useAlertsWS } from "@/lib/useAlerts";
import { getCurrentUser } from "@/lib/auth";

export function AlertBannerWrapper() {
  const user = getCurrentUser();
  const [dismissed, setDismissed] = useState(false);
  const { recentAlerts } = useAlertsWS({
    userId: user?.sub ? String(user.sub) : "",
    enabled: !!user?.sub,
  });

  const latestAlert = recentAlerts[0] ?? null;

  return (
    <AlertBanner
      alert={dismissed ? null : latestAlert}
      onDismiss={() => setDismissed(true)}
    />
  );
}
