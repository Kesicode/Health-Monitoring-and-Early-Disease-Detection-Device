export const ANIMAL_TYPES = [
  { value: "cow", label: "Cow", labelTamil: "மாடு", emoji: "🐄", color: "bg-amber-100 text-amber-800" },
  { value: "chicken", label: "Chicken", labelTamil: "கோழி (Kozhi)", emoji: "🐔", color: "bg-orange-100 text-orange-800" },
  { value: "goat", label: "Goat", labelTamil: "ஆடு (Adu)", emoji: "🐐", color: "bg-lime-100 text-lime-800" },
  { value: "pig", label: "Pig", labelTamil: "பன்றி (Panni)", emoji: "🐷", color: "bg-pink-100 text-pink-800" },
  { value: "dog", label: "Dog", labelTamil: "நாய் (Pati)", emoji: "🐕", color: "bg-blue-100 text-blue-800" },
] as const;

export type AnimalType = typeof ANIMAL_TYPES[number]["value"];

export const DEVICE_TYPES = [
  { value: "collar", label: "Collar", description: "Neck-worn, measures temp + HR + rumination" },
  { value: "ear_tag", label: "Ear Tag", description: "Clipped to ear, lightweight, motion + temp" },
  { value: "ankle_band", label: "Ankle Band", description: "Leg-mounted, activity tracking" },
] as const;

export const ALERT_TYPES = [
  { value: "fever", label: "Fever", icon: "🌡️" },
  { value: "inactivity", label: "Inactivity", icon: "💤" },
  { value: "low_rumination", label: "Low Rumination", icon: "🍃" },
  { value: "heart_rate", label: "Heart Rate", icon: "❤️" },
  { value: "device_offline", label: "Device Offline", icon: "📡" },
] as const;

export const SEVERITY_COLORS = {
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export const HEALTH_STATUS_COLORS = {
  healthy: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-600",
};

export const DEVICE_STATUS_COLORS = {
  online: "bg-green-100 text-green-700",
  offline: "bg-red-100 text-red-700",
  unassigned: "bg-gray-100 text-gray-600",
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
