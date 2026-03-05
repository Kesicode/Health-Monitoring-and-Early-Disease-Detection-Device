"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { AlertCard } from "@/components/alerts/AlertCard";

interface Alert {
  id: number; animal_id: number; alert_type: string; severity: string; message: string;
  metric_value: number | null; is_resolved: boolean; created_at: string; resolved_at?: string | null;
  animal: { id: number; name: string; animal_type: string } | null;
}

export default function FarmerAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "unresolved">("unresolved");
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const params = filter === "unresolved" ? "?unresolved_only=true" : "";
    api.get<Alert[]>(`/alerts${params}`).then(setAlerts).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolve = async (id: number) => {
    await api.patch(`/alerts/${id}/resolve`, {});
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_resolved: true } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {(["unresolved", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No {filter === "unresolved" ? "unresolved " : ""}alerts</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === "unresolved" ? "All clear! Your animals are healthy." : "No alerts recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="space-y-1">
              {a.animal && (
                <p className="text-xs font-medium text-gray-500 px-1">{a.animal.name} · <span className="capitalize">{a.animal.animal_type}</span></p>
              )}
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
              animal_name={a.animal?.name ?? ""}
              onResolve={a.is_resolved ? undefined : () => handleResolve(a.id)}
            />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
