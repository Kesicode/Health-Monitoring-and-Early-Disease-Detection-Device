"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, Trash2, ExternalLink, Loader2, QrCode, Download, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Device {
  id: number; serial_number: string; device_type: string;
  firmware_version: string | null; is_active: boolean; is_claimed: boolean;
  owner_id: number | null; animal_id: number | null;
  qr_code: string | null;
  last_seen: string | null; registered_at: string;
}

export default function AdminDeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get<Device>(`/admin/devices/${id}`).then(setDevice).finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async () => {
    if (!device) return;
    setToggling(true);
    try {
      const updated = await api.patch<Device>(`/admin/devices/${id}`, { is_active: !device.is_active });
      setDevice(updated);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    await api.delete(`/admin/devices/${id}`);
    router.push("/admin/devices");
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />;
  if (!device) return <div className="text-center py-20 text-gray-500">Device not found</div>;

  const tiles: [string, string][] = [
    ["Serial number", device.serial_number],
    ["Type", device.device_type],
    ["Firmware", device.firmware_version ?? "—"],
    ["Registered", new Date(device.registered_at).toLocaleDateString()],
    ["Last seen", device.last_seen ? new Date(device.last_seen).toLocaleString() : "Never"],
    ["Owner", device.owner_id ? `User #${device.owner_id}` : "Unclaimed"],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/devices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-mono">{device.serial_number}</h1>
              <p className="text-sm text-gray-500 capitalize">{device.device_type}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
          title="Delete device"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">Device status</p>
          <StatusBadge status={device.is_active ? "active" : "offline"} />
        </div>
        <button
          onClick={toggleActive}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            device.is_active
              ? "bg-red-50 text-red-700 hover:bg-red-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {toggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {device.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 grid grid-cols-2 gap-5">
        {tiles.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-sm font-medium text-gray-900 font-mono">{v}</p>
          </div>
        ))}
      </div>

      {/* QR Code */}
      {device.qr_code && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Device QR code
          </p>
          <div className="flex flex-col items-center gap-4">
            <img
              src={`data:image/png;base64,${device.qr_code}`}
              alt={`QR for ${device.serial_number}`}
              className="w-48 h-48 rounded-lg border border-gray-100"
            />
            <p className="text-xs text-gray-500 font-mono">{device.serial_number}</p>
            <div className="flex gap-3">
              <a
                href={`data:image/png;base64,${device.qr_code}`}
                download={`device-qr-${device.serial_number}.png`}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <button
                onClick={() => {
                  const win = window.open("");
                  win?.document.write(`<img src="data:image/png;base64,${device.qr_code}" onload="window.print();window.close()" />`);
                }}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim & link */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-500 mb-1">Claimed</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${device.is_claimed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {device.is_claimed ? "Yes" : "No"}
          </span>
        </div>
        {device.animal_id && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Linked animal</p>
            <Link
              href={`/admin/animals/${device.animal_id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
            >
              Animal #{device.animal_id} <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete device?"
        description="This will permanently remove the device from the system. Linked health readings are not affected."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
