"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, QrCode, Cpu } from "lucide-react";
import { api } from "@/lib/api";
import { AnimalTypeBadge } from "@/components/animals/AnimalTypeBadge";
import { HealthMetricsPanel } from "@/components/animals/HealthMetricsPanel";
import { QRCodeDisplay } from "@/components/animals/QRCodeDisplay";
import { AlertCard } from "@/components/alerts/AlertCard";
import { useHealthWS, type HealthReading } from "@/lib/useHealthWS";

interface Device { serial_number: string; is_active: boolean; device_type: string; }
interface Animal {
  id: number; name: string; animal_type: string; breed: string | null;
  age_months: number | null; weight_kg: number | null; gender: string | null;
  tag_number: string | null; notes: string | null; qr_code: string | null;
  device: Device | null;
}
interface Alert { id: number; animal_id: number; alert_type: string; severity: string; message: string; metric_value: number | null; is_resolved: boolean; created_at: string; resolved_at?: string | null; }

function AnimalHealthPanel({ animal }: { animal: Animal }) {
  const [prevReading, setPrevReading] = useState<HealthReading | null>(null);
  const [latestFromAPI, setLatestFromAPI] = useState<HealthReading | null>(null);
  const { latestReading, isConnected } = useHealthWS({ animalId: animal.id });
  const prevWSRef = useRef<HealthReading | null>(null);

  useEffect(() => {
    api.get<HealthReading[]>(`/health/${animal.id}/readings?limit=2`).then((readings) => {
      if (readings.length > 0) setLatestFromAPI(readings[0]);
      if (readings.length > 1) setPrevReading(readings[1]);
    }).catch(() => {});
  }, [animal.id]);

  useEffect(() => {
    if (latestReading) {
      setPrevReading(prevWSRef.current ?? latestFromAPI);
      prevWSRef.current = latestReading;
    }
  }, [latestReading, latestFromAPI]);

  const currentReading = latestReading ?? latestFromAPI;

  return <HealthMetricsPanel reading={currentReading} prevReading={prevReading} animalType={animal.animal_type} isLive={isConnected} />;
}

export default function FarmerAnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Animal>(`/animals/${id}`),
      api.get<Alert[]>(`/alerts?animal_id=${id}&limit=5`),
    ]).then(([a, al]) => { setAnimal(a); setAlerts(al); }).finally(() => setLoading(false));
  }, [id]);

  const handleResolve = async (alertId: number) => {
    await api.patch(`/alerts/${alertId}/resolve`, {});
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, is_resolved: true } : a));
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-gray-100 rounded-xl" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>;
  if (!animal) return <div className="text-center py-20 text-gray-500">Animal not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/animals" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{animal.name}</h1>
              <AnimalTypeBadge type={animal.animal_type} />
            </div>
            <p className="text-sm text-gray-500">{animal.breed ?? animal.animal_type}{animal.tag_number ? ` · ${animal.tag_number}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {animal.qr_code && (
            <button onClick={() => setShowQR(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <QrCode className="w-4 h-4" />QR Code
            </button>
          )}
          <Link href={`/dashboard/animals/${id}/edit`} className="btn-primary flex items-center gap-2 text-sm">
            <Pencil className="w-3.5 h-3.5" />Edit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Age", animal.age_months !== null ? `${animal.age_months} mo` : "—"],
          ["Weight", animal.weight_kg !== null ? `${animal.weight_kg} kg` : "—"],
          ["Gender", animal.gender ?? "—"],
          ["Tag", animal.tag_number ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="font-semibold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Device */}
      {animal.device && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 font-mono">{animal.device.serial_number}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${animal.device.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {animal.device.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500">{animal.device.device_type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Live health metrics */}
      <AnimalHealthPanel animal={animal} />

      {/* Notes */}
      {animal.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</p>
          <p className="text-sm text-gray-700">{animal.notes}</p>
        </div>
      )}

      {/* Recent alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent alerts</h2>
          {alerts.map((a) => <AlertCard key={a.id} {...a} animal_name={animal.name} onResolve={() => handleResolve(a.id)} />)}
        </div>
      )}

      {/* QR modal */}
      {showQR && animal.qr_code && <QRCodeDisplay base64={animal.qr_code} name={animal.name} onClose={() => setShowQR(false)} />}
    </div>
  );
}
