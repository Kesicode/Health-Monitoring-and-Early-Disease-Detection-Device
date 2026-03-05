"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { HealthReading } from "@/lib/useHealthWS";

const METRICS = [
  { key: "temperature",     label: "Temp (°C)",    color: "#ef4444" },
  { key: "heart_rate",      label: "HR (bpm)",     color: "#f59e0b" },
  { key: "activity_level",  label: "Activity",     color: "#3b82f6" },
  { key: "rumination_score",label: "Rumination",   color: "#10b981" },
] as const;

const TIME_RANGES = [
  { label: "1h",  value: "1h" },
  { label: "6h",  value: "6h" },
  { label: "24h", value: "24h" },
  { label: "7d",  value: "7d" },
];

interface HealthChartProps {
  readings: HealthReading[];
  isLoading?: boolean;
  timeRange: string;
  onTimeRangeChange: (r: string) => void;
}

export function HealthChart({ readings, isLoading, timeRange, onTimeRangeChange }: HealthChartProps) {
  const [activeMetrics, setActiveMetrics] = useState(new Set(["temperature", "heart_rate"]));

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const data = readings.map((r) => ({
    ...r,
    time: format(new Date(r.timestamp), timeRange === "7d" ? "MMM d" : "HH:mm"),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-800">Health Trend</h3>
        <div className="flex gap-2">
          {TIME_RANGES.map((t) => (
            <button
              key={t.value}
              onClick={() => onTimeRangeChange(t.value)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                timeRange === t.value
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
              activeMetrics.has(m.key) ? "border-transparent text-white" : "border-gray-200 text-gray-500"
            )}
            style={activeMetrics.has(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">Loading chart…</div>
      ) : readings.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">No data for this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {METRICS.filter((m) => activeMetrics.has(m.key)).map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
