"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { AnimalTypeBadge } from "@/components/animals/AnimalTypeBadge";
import { AlertCard } from "@/components/alerts/AlertCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DeviceInfo { serial_number: string; is_active: boolean; device_type: string; }
interface Animal {
  id: number; name: string; animal_type: string; breed: string | null;
  age_months: number | null; weight_kg: number | null; gender: string | null;
  tag_number: string | null; notes: string | null; owner_id: number;
  device: DeviceInfo | null;
}
interface HealthReading {
  id: number; temperature: number | null; heart_rate: number | null;
  spo2: number | null; activity_level: number | null; recorded_at: string; source: string;
}
interface AlertItem {
  id: number; animal_id: number; alert_type: string; severity: string; message: string;
  metric_value: number | null; is_resolved: boolean; created_at: string; resolved_at?: string | null;
  animal: { id: number; name: string; animal_type: string } | null;
}

export default function AdminAnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Animal>(`/admin/animals/${id}`),
      api.get<HealthReading[]>(`/admin/health-data?animal_id=${id}&limit=5`),
      api.get<AlertItem[]>(`/admin/alerts?animal_id=${id}&limit=10`),
    ]).then(([a, r, al]) => { setAnimal(a); setReadings(r); setAlerts(al); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await api.delete(`/admin/animals/${id}`);
    router.push("/admin/animals");
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-100 rounded-xl" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>;
  if (!animal) return <div className="text-center py-20 text-gray-500">Animal not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/animals" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{animal.name}</h1>
              <AnimalTypeBadge type={animal.animal_type} />
            </div>
            <p className="text-sm text-gray-500">
              Owner #{animal.owner_id}
              {animal.tag_number ? ` · Tag: ${animal.tag_number}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />Delete
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          ["Age", animal.age_months !== null ? `${animal.age_months} mo` : "—"],
          ["Weight", animal.weight_kg !== null ? `${animal.weight_kg} kg` : "—"],
          ["Gender", animal.gender ?? "—"],
          ["Breed", animal.breed ?? "—"],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="font-semibold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Device */}
      {animal.device ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 font-mono">{animal.device.serial_number}</p>
              <p className="text-xs text-gray-500">
                {animal.device.device_type} · {animal.device.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-400 text-center">
          No device linked to this animal
        </div>
      )}

      {/* Recent health readings */}
      {readings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent readings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{["Time", "Temp (°C)", "HR (bpm)", "SpO₂ (%)", "Activity", "Source"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {readings.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{new Date(r.recorded_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{r.temperature?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{r.heart_rate?.toFixed(0) ?? "—"}</td>
                    <td className="px-4 py-2">{r.spo2?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{r.activity_level?.toFixed(0) ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${r.source === "device" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent alerts</h2>
          {alerts.map(a => (
            <AlertCard
              key={a.id}
              id={a.id}
              animal_id={a.animal_id}
              animal_name={animal.name}
              alert_type={a.alert_type}
              severity={a.severity}
              message={a.message}
              is_resolved={a.is_resolved}
              created_at={a.created_at}
              resolved_at={a.resolved_at}
              basePath="/admin"
            />
          ))}
        </div>
      )}

      {/* Notes */}
      {animal.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</p>
          <p className="text-sm text-gray-700">{animal.notes}</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete animal?"
        description="All health readings and alerts for this animal will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
