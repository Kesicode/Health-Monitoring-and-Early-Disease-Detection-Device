"use client";

import { useEffect, useState } from "react";
import { Users, Beef, Cpu, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";

interface Stats {
  total_users: number;
  total_animals: number;
  total_devices: number;
  active_alerts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then((s) => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-200 rounded-2xl" /><div className="h-32 bg-gray-200 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">System overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Users" value={stats?.total_users ?? 0} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Animals" value={stats?.total_animals ?? 0} icon={<Beef className="w-5 h-5" />} />
        <StatCard title="Devices" value={stats?.total_devices ?? 0} icon={<Cpu className="w-5 h-5" />} />
        <StatCard title="Active Alerts" value={stats?.active_alerts ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
      </div>
    </div>
  );
}
