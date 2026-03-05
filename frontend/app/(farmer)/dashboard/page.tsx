"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AnimalCard } from "@/components/animals/AnimalCard";
import { StatCard } from "@/components/ui/StatCard";
import { Beef, AlertTriangle, Cpu, Activity } from "lucide-react";

interface Animal { id: number; name: string; animal_type: string; breed: string | null; device: { is_active: boolean } | null; }
interface Alert { id: number; severity: string; is_resolved: boolean; }

export default function FarmerDashboard() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    api.get<Animal[]>("/animals").then(setAnimals).catch(() => {});
    api.get<Alert[]>("/alerts?unresolved_only=true&limit=100").then(setAlerts).catch(() => {});
  }, []);

  const connectedDevices = animals.filter(a => a.device?.is_active).length;
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-sm text-gray-500">Overview of your livestock</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Your Animals" value={animals.length} icon={<Beef className="w-5 h-5" />} />
        <StatCard title="Connected" value={connectedDevices} icon={<Cpu className="w-5 h-5" />} color="green" />
        <StatCard title="Active Alerts" value={alerts.length} icon={<AlertTriangle className="w-5 h-5" />} color={alerts.length > 0 ? "red" : "green"} />
        <StatCard title="Critical" value={criticalAlerts} icon={<Activity className="w-5 h-5" />} color={criticalAlerts > 0 ? "red" : "green"} />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your animals</h2>
        <Link href="/dashboard/animals/register" className="btn-primary text-sm">+ Register animal</Link>
      </div>
      {animals.length === 0
        ? <div className="text-center py-16 text-sm text-gray-400">No animals registered yet. <Link href="/dashboard/animals/register" className="text-primary hover:underline">Register your first animal →</Link></div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{animals.map(a => <AnimalCard key={a.id} id={a.id} name={a.name} animal_type={a.animal_type} breed={a.breed ?? undefined} device_status={a.device ? (a.device.is_active ? "online" : "offline") : "unassigned"} />)}</div>
      }
    </div>
  );
}
