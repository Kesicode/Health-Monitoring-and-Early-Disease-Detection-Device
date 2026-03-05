"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ANIMAL_TYPES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "Required"),
  animal_type: z.string().min(1, "Select a type"),
  breed: z.string().optional(),
  age_months: z.coerce.number<number>().min(0).optional(),
  weight_kg: z.coerce.number<number>().min(0).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  tag_number: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterAnimalPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await api.post<{ id: number }>("/animals", data);
    router.push(`/dashboard/animals/${res.id}`);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/animals" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-xl font-bold text-gray-900">Register animal</h1><p className="text-sm text-gray-500">Add a new animal to monitor</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Animal name *</label>
            <input {...register("name")} className="input w-full" placeholder="e.g. Bessie" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Animal type *</label>
            <select {...register("animal_type")} className="input w-full">
              <option value="">Select type</option>
              {ANIMAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.animal_type && <p className="text-xs text-red-500 mt-1">{errors.animal_type.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Breed</label><input {...register("breed")} className="input w-full" placeholder="Optional" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Age (months)</label><input {...register("age_months")} type="number" className="input w-full" placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label><input {...register("weight_kg")} type="number" step="0.1" className="input w-full" placeholder="0.0" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select {...register("gender")} className="input w-full"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="unknown">Unknown</option></select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tag number</label><input {...register("tag_number")} className="input w-full" placeholder="e.g. TAG-001" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label><textarea {...register("notes")} className="input w-full h-20 resize-none" placeholder="Any additional notes..." /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Register animal</button>
            <Link href="/dashboard/animals" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
