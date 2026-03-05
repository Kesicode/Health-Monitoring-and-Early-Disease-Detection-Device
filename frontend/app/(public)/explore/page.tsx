import Link from "next/link";
import { Thermometer, Heart, Activity, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const animalGuides = [
  {
    type: "cow",
    label: "Cattle",
    emoji: "🐄",
    vitals: [
      { name: "Temperature", normal: "38.0–39.5°C", alert: ">40.5°C or <37.5°C" },
      { name: "Heart rate", normal: "40–80 BPM", alert: ">100 BPM or <30 BPM" },
      { name: "SpO2", normal: ">95%", alert: "<90%" },
    ],
    tips: ["Check hooves weekly for lameness", "Ensure 50–80 L water/day", "Monitor for bloating after pasture changes"],
  },
  {
    type: "goat",
    label: "Goats",
    emoji: "🐐",
    vitals: [
      { name: "Temperature", normal: "38.5–40.0°C", alert: ">41.0°C or <38.0°C" },
      { name: "Heart rate", normal: "70–90 BPM", alert: ">110 BPM" },
      { name: "SpO2", normal: ">95%", alert: "<92%" },
    ],
    tips: ["Goats are prone to respiratory infections — monitor closely", "Provide shelter from rain", "Check for worm load monthly"],
  },
  {
    type: "pig",
    label: "Pigs",
    emoji: "🐖",
    vitals: [
      { name: "Temperature", normal: "38.0–39.5°C", alert: ">40.5°C or <37.0°C" },
      { name: "Heart rate", normal: "58–86 BPM", alert: ">100 BPM" },
      { name: "SpO2", normal: ">95%", alert: "<92%" },
    ],
    tips: ["Pigs overheat easily — ensure shade and ventilation", "Monitor for sneezing (respiratory)", "Group size affects stress levels"],
  },
  {
    type: "chicken",
    label: "Poultry",
    emoji: "🐔",
    vitals: [
      { name: "Temperature", normal: "40.6–41.7°C", alert: ">42.5°C or <40.0°C" },
      { name: "Heart rate", normal: "250–350 BPM", alert: "<200 BPM" },
      { name: "Activity", normal: "Active during day", alert: "Unusual clustering or lethargy" },
    ],
    tips: ["Watch for reduced feed intake as early illness sign", "Ensure 23 cm feeder space per bird", "Coop temperature should stay 18–24°C"],
  },
];

export default function PublicExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Animal health guides</h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Reference ranges for vital signs and care tips for common livestock and poultry
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/login" className="btn-primary">Start monitoring</Link>
            <Link href="/" className="btn-secondary">Back to home</Link>
          </div>
        </div>

        <div className="space-y-6">
          {animalGuides.map(({ type, label, emoji, vitals, tips }) => (
            <div key={type} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emoji}</span>
                  <h2 className="text-lg font-bold text-gray-900">{label}</h2>
                </div>
              </div>
              <div className="p-5 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />Vital ranges
                  </h3>
                  <div className="space-y-3">
                    {vitals.map((v) => (
                      <div key={v.name}>
                        <p className="text-xs font-medium text-gray-700 mb-1">{v.name}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />Normal: {v.normal}
                          </span>
                          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />Alert: {v.alert}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />Care tips
                  </h3>
                  <ul className="space-y-2">
                    {tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <Activity className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          Reference values are approximate and may vary by breed, age, and environmental conditions. Consult a veterinarian for clinical decisions.
        </p>
      </div>
    </div>
  );
}
