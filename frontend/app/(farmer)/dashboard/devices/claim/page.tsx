"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Cpu, Camera, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import jsQR from "jsqr";

interface Animal { id: number; name: string; animal_type: string; }

export default function ClaimDevicePage() {
  const router = useRouter();
  const [serialNumber, setSerialNumber] = useState("");
  const [animalId, setAnimalId] = useState<string>("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    api.get<Animal[]>("/animals").then(setAnimals).catch(() => {});
  }, []);

  const stopScan = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  const startScan = async () => {
    setScanError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setScanError("Camera access denied. Enter the serial number manually.");
    }
  };

  // QR decode loop
  useEffect(() => {
    if (!scanning) return;
    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        try {
          const parsed = JSON.parse(code.data) as { serial?: string; type?: string };
          if (parsed.type === "agri_guard_device" && parsed.serial) {
            stopScan();
            setSerialNumber(parsed.serial);
            return;
          }
        } catch {
          // not a device QR — keep scanning
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scanning, stopScan]);

  useEffect(() => () => {
    if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
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

        {/* Camera scan */}
        {scanning ? (
          <div className="space-y-3">
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/80 rounded-xl" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }} />
              </div>
            </div>
            <p className="text-xs text-center text-gray-500">Point camera at the QR code on the device label</p>
            <button onClick={stopScan} className="btn-secondary w-full text-sm">Cancel scan</button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={startScan}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              <Camera className="w-4 h-4" /> Scan device QR code
            </button>
            {scanError && <p className="text-xs text-red-600">{scanError}</p>}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Serial number
            </label>
            <div className="relative">
              <input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                className="input w-full font-mono text-center tracking-widest pr-9"
                placeholder="DEV-DEMO-001"
                autoFocus={!scanning}
              />
              {serialNumber && (
                <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Scan the QR on the device label or type the serial number manually
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
