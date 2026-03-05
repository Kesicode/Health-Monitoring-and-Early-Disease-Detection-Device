"use client";
import { MetricTile } from "@/components/ui/MetricTile";
import { formatTemp, formatHR, formatScore } from "@/lib/utils";
import type { HealthReading } from "@/lib/useHealthWS";

interface HealthMetricsPanelProps {
  reading: HealthReading | null;
  prevReading?: HealthReading | null;
  animalType: string;
  isLive?: boolean;
}

function getTrend(curr: number | null, prev: number | null): "up" | "down" | "flat" {
  if (curr == null || prev == null) return "flat";
  if (curr > prev + 0.5) return "up";
  if (curr < prev - 0.5) return "down";
  return "flat";
}

const tempThresholds: Record<string, { warn: number; crit: number }> = {
  cow:     { warn: 39.2, crit: 40.5 },
  chicken: { warn: 42.0, crit: 43.5 },
  goat:    { warn: 39.5, crit: 41.0 },
  pig:     { warn: 39.0, crit: 40.5 },
  dog:     { warn: 39.0, crit: 40.5 },
};

function tempStatus(val: number | null, type: string): "normal" | "warning" | "critical" {
  if (val == null) return "normal";
  const t = tempThresholds[type] || tempThresholds.cow;
  if (val >= t.crit) return "critical";
  if (val >= t.warn) return "warning";
  return "normal";
}

export function HealthMetricsPanel({ reading, prevReading, animalType, isLive }: HealthMetricsPanelProps) {
  const r = reading;
  const p = prevReading;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricTile
        label="Temperature"
        value={r ? r.temperature.toFixed(1) : "—"}
        unit="°C"
        trend={getTrend(r?.temperature ?? null, p?.temperature ?? null)}
        status={tempStatus(r?.temperature ?? null, animalType)}
        isLive={isLive}
      />
      <MetricTile
        label="Heart Rate"
        value={r ? String(r.heart_rate) : "—"}
        unit="bpm"
        trend={getTrend(r?.heart_rate ?? null, p?.heart_rate ?? null)}
        isLive={isLive}
      />
      <MetricTile
        label="Activity"
        value={r ? r.activity_level.toFixed(0) : "—"}
        unit="/100"
        trend={getTrend(r?.activity_level ?? null, p?.activity_level ?? null)}
        isLive={isLive}
      />
      <MetricTile
        label="Rumination"
        value={r ? r.rumination_score.toFixed(0) : "—"}
        unit="/100"
        trend={getTrend(r?.rumination_score ?? null, p?.rumination_score ?? null)}
        isLive={isLive}
      />
    </div>
  );
}
