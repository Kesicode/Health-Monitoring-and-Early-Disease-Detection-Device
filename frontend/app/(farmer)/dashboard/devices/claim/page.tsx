"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Cpu } from "lucide-react";
import { api } from "@/lib/api";

interface Animal { id: number; name: string; animal_type: string; }

export default function ClaimDevicePage() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");
  const [animalId, setAnimalId] = useState<string>("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Animal[]>("/animals").then(setAnimals).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !animalId) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/devices/claim", {
        serial_number: serialNumber.trim().toUpperCase(),
        animal_id: parseInt(animalId, 10),
      });
      router.push("/dashboard/devices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Device not found or already claimed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/devices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Claim device</h1>
          <p className="text-sm text-gray-500">Link a device to one of your animals</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
            <Cpu className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Serial number
            </label>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              className="input w-full font-mono text-center tracking-widest"
              placeholder="DEV-DEMO-001"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              Found on the label of your Agri Guard device
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link to animal
            </label>
            {animals.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                No animals found.{" "}
                <Link href="/dashboard/animals/register" className="text-green-600 underline">
                  Register one first.
                </Link>
              </p>
            ) : (
              <select
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Select an animal…</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.animal_type})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-400 mt-1">
              The device will start monitoring this animal immediately
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !serialNumber.trim() || !animalId}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Claim &amp; link device
            </button>
            <Link href="/dashboard/devices" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold">How it works</p>
        <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
          <li>Admin registers the device serial in the system</li>
          <li>You enter the serial number and pick the animal to monitor</li>
          <li>The device starts sending health readings for that animal</li>
        </ol>
      </div>
    </div>
  );
}
