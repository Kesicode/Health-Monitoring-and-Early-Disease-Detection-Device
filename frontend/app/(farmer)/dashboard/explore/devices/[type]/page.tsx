import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Thermometer, Heart, Activity, Wifi, CheckCircle } from "lucide-react";

const DEVICE_INFO: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  metrics: Array<{ name: string; unit: string; range: string }>;
  setup: string[];
  compatibility: string[];
}> = {
  temperature_sensor: {
    label: "Temperature Sensor",
    icon: Thermometer,
    color: "bg-red-50 text-red-600",
    description: "A non-invasive temperature sensor worn as an ear tag or collar attachment. Transmits readings every 5 minutes via low-energy Bluetooth to a nearby gateway.",
    metrics: [{ name: "Body temperature", unit: "°C", range: "Normal: 38–39.5°C (varies by species)" }],
    setup: ["Attach sensor to animal ear tag or collar", "Power on and pair with Agri Guard gateway", "Claim device in the app using serial number", "Link device to the animal in the animal profile"],
    compatibility: ["Cattle", "Goats", "Sheep", "Pigs"],
  },
  heart_rate_monitor: {
    label: "Heart Rate Monitor",
    icon: Heart,
    color: "bg-pink-50 text-pink-600",
    description: "A chest-strap or patch sensor that continuously monitors heart rate and blood oxygen saturation (SpO2). Alerts are triggered for cardiac events.",
    metrics: [
      { name: "Heart rate", unit: "BPM", range: "Varies by species (e.g. cattle: 40–80 BPM)" },
      { name: "SpO2", unit: "%", range: "Normal: >95%" },
    ],
    setup: ["Position sensor on the animal's chest", "Connect straps securely but comfortably", "Power on — LED will blink green when active", "Claim and link via Agri Guard app"],
    compatibility: ["Cattle", "Horses", "Pigs", "Dogs"],
  },
  activity_tracker: {
    label: "Activity Tracker",
    icon: Activity,
    color: "bg-purple-50 text-purple-600",
    description: "A small accelerometer attached to the leg or collar. Measures daily activity levels, rest periods, and unusual inactivity that may indicate illness.",
    metrics: [{ name: "Activity level", unit: "steps/hr", range: "Normal: varies; alert if <10% of baseline" }],
    setup: ["Attach sensor to leg band or collar", "Activate by pressing the power button for 3 seconds", "Claim device via app serial number", "Baseline is calculated over first 7 days"],
    compatibility: ["All supported species"],
  },
  multi_sensor: {
    label: "Multi-Sensor Unit",
    icon: Wifi,
    color: "bg-green-50 text-green-600",
    description: "The recommended all-in-one device for comprehensive health monitoring. Combines temperature, heart rate, SpO2, and activity sensors in a single waterproof unit.",
    metrics: [
      { name: "Body temperature", unit: "°C", range: "Species-specific thresholds" },
      { name: "Heart rate", unit: "BPM", range: "Species-specific thresholds" },
      { name: "SpO2", unit: "%", range: ">95% normal" },
      { name: "Activity", unit: "steps/hr", range: "Baseline-relative" },
    ],
    setup: ["Soak sensor in clean water for 5 minutes before first use", "Attach to ear tag or collar mount", "Power on — unit self-tests for 30 seconds", "Claim via app using QR code on the device", "Link to animal and confirm all metrics are reading"],
    compatibility: ["Cattle", "Goats", "Pigs", "Poultry", "Dogs"],
  },
};

export default function DeviceTypePage({ params }: { params: { type: string } }) {
  const info = DEVICE_INFO[params.type];
  if (!info) notFound();

  const Icon = info.icon;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/explore/devices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className={`w-10 h-10 ${info.color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{info.label}</h1>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>

      {/* Metrics */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Monitored metrics</h2>
        <div className="space-y-3">
          {info.metrics.map((m) => (
            <div key={m.name} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-900">{m.name}</span>
                <span className="text-xs text-gray-500 ml-2">({m.unit})</span>
                <p className="text-xs text-gray-500 mt-0.5">{m.range}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup guide */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Setup guide</h2>
        <div className="space-y-3">
          {info.setup.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-green-700">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Compatible animals</h2>
        <div className="flex flex-wrap gap-2">
          {info.compatibility.map((c) => (
            <div key={c} className="flex items-center gap-1.5 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500" />{c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
