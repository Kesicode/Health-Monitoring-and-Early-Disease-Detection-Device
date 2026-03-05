"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Threshold { id: number; animal_type: string; temp_min: number; temp_max: number; hr_min: number; hr_max: number; spo2_min: number; activity_min: number; }

export default function AdminSettingsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Threshold>>>({});

  const load = () => api.get<Threshold[]>("/admin/settings/thresholds").then(t => { setThresholds(t); const e: Record<string, Partial<Threshold>> = {}; t.forEach(th => { e[th.animal_type] = { ...th }; }); setEdits(e); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (type: string) => {
    setSaving(type);
    await api.patch(`/admin/settings/thresholds/${type}`, edits[type] ?? {});
    setSaving(null);
    load();
  };

  const update = (type: string, key: keyof Threshold, val: number) => setEdits(prev => ({ ...prev, [type]: { ...prev[type], [key]: val } }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500">Configure alert thresholds per animal type</p></div>
      <div className="grid gap-4">
        {thresholds.map(t => (
          <div key={t.animal_type} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">{t.animal_type}</h3>
              <button onClick={() => save(t.animal_type)} disabled={saving === t.animal_type} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">{saving === t.animal_type && <Loader2 className="w-3 h-3 animate-spin" />}Save</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(["temp_min","temp_max","hr_min","hr_max","spo2_min","activity_min"] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{k.replace("_"," ")}</label>
                  <input type="number" step="0.1" value={edits[t.animal_type]?.[k] ?? t[k]} onChange={e => update(t.animal_type, k, parseFloat(e.target.value))} className="input w-full text-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
