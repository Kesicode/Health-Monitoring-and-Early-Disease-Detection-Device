const guidesByType: Record<string, { title: string; steps: string[] }[]> = {
  collar: [
    { title: "Installation", steps: [
      "Ensure the device is fully charged before attachment.",
      "Adjust the collar strap to fit snugly around the animal's neck — 2 fingers gap.",
      "Clip the buckle securely. The sensor module should sit on the underside of the neck.",
      "Power on by holding the button for 3 seconds. LED will flash green.",
      "Register the serial number in the app and assign to the animal.",
    ]},
    { title: "Maintenance", steps: [
      "Charge every 7–14 days depending on activity.",
      "Clean with a damp cloth weekly.",
      "Check strap tightness monthly.",
    ]},
  ],
  ear_tag: [
    { title: "Installation", steps: [
      "Use the applicator tool provided with the tag.",
      "Clean the ear with antiseptic before insertion.",
      "Pierce through the designated ear zone (middle of the ear).",
      "Press both halves firmly until they click.",
      "Register the serial number in the app.",
    ]},
  ],
  ankle_band: [
    { title: "Installation", steps: [
      "Wrap the band around the lower leg (above the hoof).",
      "Fasten the velcro to a firm but comfortable fit.",
      "The sensor chip should face outward.",
      "Power on and register in the app.",
    ]},
  ],
};

interface DeviceSetupGuideProps {
  deviceType: string;
}

export function DeviceSetupGuide({ deviceType }: DeviceSetupGuideProps) {
  const guides = guidesByType[deviceType] || [];
  if (guides.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-800">Setup Guide — {deviceType.replace("_", " ")}</h3>
      <div className="mt-4 space-y-4">
        {guides.map((g) => (
          <div key={g.title}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{g.title}</h4>
            <ol className="space-y-2">
              {g.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
