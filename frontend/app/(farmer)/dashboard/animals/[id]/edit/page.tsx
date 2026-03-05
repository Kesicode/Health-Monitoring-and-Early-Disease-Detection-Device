"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ANIMAL_TYPES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "Required"),
  animal_type: z.string().min(1, "Required"),
  breed: z.string().optional(),
  age_months: z.coerce.number<number>().min(0).optional(),
  weight_kg: z.coerce.number<number>().min(0).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  tag_number: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Animal {
  id: number; name: string; animal_type: string; breed: string | null;
  age_months: number | null; weight_kg: number | null; gender: string | null;
  tag_number: string | null; notes: string | null;
}

export default function EditAnimalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get<Animal>(`/animals/${id}`).then((a) => {
      reset({
        name: a.name,
        animal_type: a.animal_type,
        breed: a.breed ?? "",
        age_months: a.age_months ?? undefined,
        weight_kg: a.weight_kg ?? undefined,
        gender: (a.gender as "male" | "female" | "unknown") ?? undefined,
        tag_number: a.tag_number ?? "",
        notes: a.notes ?? "",
      });
      setLoaded(true);
    });
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    await api.patch(`/animals/${id}`, data);
    router.push(`/dashboard/animals/${id}`);
  };

  if (!loaded) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/animals/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit animal</h1>
          <p className="text-sm text-gray-500">Update animal information</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Animal name *</label>
            <input {...register("name")} className="input w-full" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Animal type *</label>
            <select {...register("animal_type")} className="input w-full">
              {ANIMAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Breed</label>
              <input {...register("breed")} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Age (months)</label>
              <input {...register("age_months")} type="number" min="0" className="input w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
              <input {...register("weight_kg")} type="number" step="0.1" min="0" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select {...register("gender")} className="input w-full">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tag number</label>
            <input {...register("tag_number")} className="input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea {...register("notes")} className="input w-full h-20 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
            <Link href={`/dashboard/animals/${id}`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
