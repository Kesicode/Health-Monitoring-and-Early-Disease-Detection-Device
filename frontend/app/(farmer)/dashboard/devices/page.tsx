"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Cpu } from "lucide-react";
import { api } from "@/lib/api";

interface Device {
  id: number; serial_number: string; device_type: string;
  firmware_version: string | null; is_active: boolean; is_claimed: boolean;
  last_seen: string | null; animal: { id: number; name: string } | null;
}

export default function FarmerDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Device[]>("/devices").then(setDevices).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm text-gray-500">{devices.length} device{devices.length !== 1 ? "s" : ""} claimed</p>
        </div>
        <Link href="/dashboard/devices/claim" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />Claim device
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20">
          <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No devices claimed yet</p>
          <p className="text-sm text-gray-400 mt-1">Claim a device to start monitoring your animals</p>
          <Link href="/dashboard/devices/claim" className="btn-primary mt-4 inline-flex">Claim device</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((d) => (
            <Link key={d.id} href={`/dashboard/devices/${d.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-green-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 font-mono truncate">{d.serial_number}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${d.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {d.device_type}
                    {d.animal ? ` · Linked to ${d.animal.name}` : " · Not linked"}
                    {d.last_seen ? ` · Last seen ${new Date(d.last_seen).toLocaleDateString()}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
