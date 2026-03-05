"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

import { DEVICE_TYPES } from "@/lib/constants";

const schema = z.object({ serial_number: z.string().min(4), device_type: z.enum(["collar", "ear_tag", "ankle_band"]), firmware_version: z.string().optional() });
type FormData = z.infer<typeof schema>;

export default function RegisterDevicePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { device_type: "collar" } });

  const onSubmit = async (data: FormData) => { await api.post("/admin/devices", data); router.push("/admin/devices"); };

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/devices" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-xl font-bold text-gray-900">Register device</h1><p className="text-sm text-gray-500">Add a new IoT device to the system</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Serial number</label><input {...register("serial_number")} className="input w-full font-mono" placeholder="AG-XXXX-XXXX" />{errors.serial_number && <p className="text-xs text-red-500 mt-1">{errors.serial_number.message}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label><select {...register("device_type")} className="input w-full">{DEVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Firmware version <span className="text-gray-400">(optional)</span></label><input {...register("firmware_version")} className="input w-full" placeholder="1.0.0" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Register</button>
            <Link href="/admin/devices" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
