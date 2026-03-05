import Link from "next/link";
import { ArrowRight, Thermometer, Heart, Activity, Wifi } from "lucide-react";

const deviceTypes = [
  {
    type: "temperature_sensor",
    label: "Temperature Sensor",
    icon: Thermometer,
    color: "bg-red-50 text-red-600",
    description: "Monitors core body temperature continuously. Alerts when temperature exceeds or drops below safe thresholds.",
    metrics: ["Body temperature (°C)"],
  },
  {
    type: "heart_rate_monitor",
    label: "Heart Rate Monitor",
    icon: Heart,
    color: "bg-pink-50 text-pink-600",
    description: "Tracks heart rate and detects tachycardia or bradycardia events in real time.",
    metrics: ["Heart rate (BPM)", "SpO2 (%)"],
  },
  {
    type: "activity_tracker",
    label: "Activity Tracker",
    icon: Activity,
    color: "bg-purple-50 text-purple-600",
    description: "Measures daily activity levels and detects unusual periods of inactivity.",
    metrics: ["Activity level (steps/hr)", "Movement patterns"],
  },
  {
    type: "multi_sensor",
    label: "Multi-Sensor Unit",
    icon: Wifi,
    color: "bg-green-50 text-green-600",
    description: "All-in-one device combining temperature, heart rate, SpO2, and activity monitoring.",
    metrics: ["Temperature", "Heart rate", "SpO2", "Activity"],
  },
];

export default function ExploreDevicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Device types</h1>
        <p className="text-sm text-gray-500">Sensors and IoT devices supported by Agri Guard</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {deviceTypes.map(({ type, label, icon: Icon, color, description, metrics }) => (
          <Link key={type} href={`/dashboard/explore/devices/${type}`} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-200 hover:shadow-sm transition-all group">
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 text-sm">{label}</h2>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors shrink-0" />
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {metrics.map((m) => (
                    <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
