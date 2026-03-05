"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, Activity } from "lucide-react";
import { api } from "@/lib/api";

interface Device {
  id: number; serial_number: string; device_type: string;
  firmware_version: string | null; is_active: boolean; is_claimed: boolean;
  last_seen: string | null; registered_at: string;
  animal: { id: number; name: string; animal_type: string } | null;
}

export default function FarmerDeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Device>(`/devices/${id}`).then(setDevice).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />;
  if (!device) return <div className="text-center py-20 text-gray-500">Device not found</div>;

  const tiles = [
    ["Serial number", device.serial_number],
    ["Type", device.device_type],
    ["Firmware", device.firmware_version ?? "—"],
    ["Status", device.is_active ? "Active" : "Inactive"],
    ["Registered", new Date(device.registered_at).toLocaleDateString()],
    ["Last seen", device.last_seen ? new Date(device.last_seen).toLocaleString() : "Never"],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/devices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{device.serial_number}</h1>
            <p className="text-sm text-gray-500">{device.device_type}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 grid grid-cols-2 gap-4">
        {tiles.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-sm font-medium text-gray-900 font-mono">{v}</p>
          </div>
        ))}
      </div>

      {device.animal ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Linked animal</p>
          <Link href={`/dashboard/animals/${device.animal.id}`} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">{device.animal.name}</p>
              <p className="text-xs text-gray-500 capitalize">{device.animal.animal_type}</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          This device is not linked to any animal yet.{" "}
          <Link href="/dashboard/devices/claim" className="underline font-medium">Claim &amp; link a device</Link>{" "}
          to assign it to an animal.
        </div>
      )}
    </div>
  );
}
