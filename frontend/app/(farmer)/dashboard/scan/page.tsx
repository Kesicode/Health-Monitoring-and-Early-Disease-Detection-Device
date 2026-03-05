"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Camera, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import jsQR from "jsqr";

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "camera">("manual");
  const [manualId, setManualId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const id = parseInt(manualId.trim(), 10);
      if (isNaN(id)) { setError("Please enter a valid animal ID number"); return; }
      await api.get(`/animals/${id}`);
      router.push(`/dashboard/animals/${id}`);
    } catch {
      setError("Animal not found. Check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("manual");
  }, []);

  const startCamera = async () => {
    setMode("camera");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError("Camera access denied. Please use manual entry instead.");
      setMode("manual");
    }
  };

  // QR decode loop — runs whenever camera mode is active
  useEffect(() => {
    if (mode !== "camera") return;

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
          const parsed = JSON.parse(code.data) as { id?: number; type?: string };
          if (parsed.type === "agri_guard_animal" && parsed.id) {
            stopCamera();
            router.push(`/dashboard/animals/${parsed.id}`);
            return;
          }
        } catch {
          // not a valid animal QR — keep scanning
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, router, stopCamera]);

  // cleanup on unmount
  useEffect(() => () => {
    if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-sm text-gray-500 mt-1">Scan an animal&apos;s QR code or enter their ID manually</p>
      </div>

      {mode === "camera" ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/80 rounded-xl" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }} />
            </div>
          </div>
          <p className="text-xs text-center text-gray-500">Point the camera at an animal&apos;s QR code</p>
          <button onClick={stopCamera} className="btn-secondary w-full">Use manual entry instead</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex gap-3">
              <button onClick={startCamera} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <Camera className="w-4 h-4" />Open camera
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Animal ID</label>
                <input
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="input w-full text-center text-lg tracking-widest"
                  placeholder="e.g. 42"
                  type="number"
                  min="1"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading || !manualId.trim()} className="btn-primary w-full">
                {loading ? "Looking up..." : "Go to animal"}
              </button>
            </form>
          </div>

          <p className="text-xs text-center text-gray-400">
            The animal ID can be found on the QR code printout or in the animal&apos;s registration info
          </p>
        </div>
      )}
    </div>
  );
}
