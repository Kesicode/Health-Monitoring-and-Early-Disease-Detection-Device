import { Download, Printer, X } from "lucide-react";

interface QRCodeDisplayProps {
  base64: string;
  name: string;
  onClose?: () => void;
}

export function QRCodeDisplay({ base64, name, onClose }: QRCodeDisplayProps) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${base64}`;
    a.download = `${name}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
        <img
          src={`data:image/png;base64,${base64}`}
          alt={`QR code for ${name}`}
          className="h-48 w-48"
        />
        <p className="mt-2 text-sm font-medium text-gray-700">{name}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
