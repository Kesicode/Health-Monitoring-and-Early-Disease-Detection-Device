"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertCard } from "@/components/alerts/AlertCard";

interface Alert { id: number; animal_id: number; animal: { id: number; name: string; animal_type: string } | null; alert_type: string; severity: string; message: string; metric_value: number | null; is_resolved: boolean; created_at: string; resolved_at?: string | null; }

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);

  const load = () => api.get<Alert[]>(`/admin/alerts?limit=200&unresolved_only=${unresolvedOnly}`).then(setAlerts).catch(() => {});
  useEffect(() => { load(); }, [unresolvedOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = async (id: number) => { await api.patch(`/admin/alerts/${id}/resolve`, {}); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Alerts</h1><p className="text-sm text-gray-500">All system health alerts</p></div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={unresolvedOnly} onChange={e => setUnresolvedOnly(e.target.checked)} className="w-4 h-4 accent-primary" />
          Unresolved only
        </label>
      </div>
      <div className="space-y-3">
        {alerts.map(a => (
          <AlertCard
            key={a.id}
            id={a.id}
            animal_id={a.animal_id}
            alert_type={a.alert_type}
            severity={a.severity}
            message={a.message}
            is_resolved={a.is_resolved}
            created_at={a.created_at}
            resolved_at={a.resolved_at}
            animal_name={a.animal?.name}
            basePath="/admin"
            onResolve={() => resolve(a.id)}
          />
        ))}
        {alerts.length === 0 && <div className="text-center py-16 text-sm text-gray-400">No alerts found</div>}
      </div>
    </div>
  );
}
