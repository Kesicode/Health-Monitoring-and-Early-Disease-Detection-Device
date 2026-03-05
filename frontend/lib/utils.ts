import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ANIMAL_TYPES, HEALTH_STATUS_COLORS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val.toFixed(1)}°C`;
}

export function formatHR(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val} bpm`;
}

export function formatScore(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val.toFixed(0)}/100`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getAnimalType(value: string) {
  return ANIMAL_TYPES.find((a) => a.value === value);
}

export type HealthStatus = "healthy" | "warning" | "critical" | "unknown";

export function getHealthStatus(
  temp: number | null,
  heartRate: number | null,
  animalType: string
): HealthStatus {
  if (temp == null && heartRate == null) return "unknown";
  // Simple threshold checks — full logic is in the backend alert_service
  const thresholds: Record<string, { tempWarn: number; tempCrit: number }> = {
    cow:     { tempWarn: 39.2, tempCrit: 40.5 },
    chicken: { tempWarn: 42.0, tempCrit: 43.5 },
    goat:    { tempWarn: 39.5, tempCrit: 41.0 },
    pig:     { tempWarn: 39.0, tempCrit: 40.5 },
    dog:     { tempWarn: 39.0, tempCrit: 40.5 },
  };
  const t = thresholds[animalType] || thresholds.cow;
  if (temp != null) {
    if (temp >= t.tempCrit) return "critical";
    if (temp >= t.tempWarn) return "warning";
  }
  return "healthy";
}

export function getHealthStatusColor(status: HealthStatus): string {
  return HEALTH_STATUS_COLORS[status];
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
