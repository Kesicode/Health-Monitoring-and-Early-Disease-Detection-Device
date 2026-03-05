"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Device { id: number; serial_number: string; device_type: string; is_active: boolean; is_claimed: boolean; animal_id: number | null; last_seen: string | null; }

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => api.get<Device[]>("/admin/devices?limit=500").then(setDevices).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Devices</h1><p className="text-sm text-gray-500">All registered IoT devices</p></div>
        <Link href="/admin/devices/register" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Register device</Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>{["Serial","Type","Status","Claimed","Animal",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{d.serial_number}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{d.device_type}</td>
                <td className="px-4 py-3"><StatusBadge status={d.is_active ? "active" : "offline"} /></td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.is_claimed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{d.is_claimed ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3 text-gray-500">{d.animal_id ? `#${d.animal_id}` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/devices/${d.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Eye className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => setDeleting(d.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {devices.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No devices registered yet</div>}
      </div>
      <ConfirmDialog open={deleting !== null} title="Delete device?" description="This will remove the device from the system." onConfirm={async () => { if (deleting) { await api.delete(`/admin/devices/${deleting}`); setDeleting(null); load(); } }} onCancel={() => setDeleting(null)} />
    </div>
  );
}
