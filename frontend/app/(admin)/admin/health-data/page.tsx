"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Reading { id: number; animal_id: number; device_id: number | null; temperature: number | null; heart_rate: number | null; spo2: number | null; activity_level: number | null; recorded_at: string; source: string; }

export default function AdminHealthDataPage() {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => { api.get<Reading[]>("/admin/health-data?limit=200").then(setReadings).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Health Data</h1><p className="text-sm text-gray-500">Latest 200 readings across all animals</p></div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>{["Time","Animal","Temp (°C)","HR (bpm)","SpO₂ (%)","Activity","Source"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {readings.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(r.recorded_at)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">#{r.animal_id}</td>
                  <td className="px-4 py-3 text-gray-600">{r.temperature?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.heart_rate?.toFixed(0) ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.spo2?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.activity_level?.toFixed(0) ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.source === "device" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{r.source}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {readings.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No readings yet</div>}
        </div>
      </div>
    </div>
  );
}
