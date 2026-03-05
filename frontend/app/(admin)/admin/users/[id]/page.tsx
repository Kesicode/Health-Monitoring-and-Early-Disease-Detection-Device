"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "farmer"]),
  phone: z.string().optional(),
  is_active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

interface User {
  id: number; name: string; email: string; role: string;
  is_active: boolean; phone: string | null;
}

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get<User>(`/admin/users/${id}`)
      .then((u) => {
        reset({
          name: u.name,
          role: u.role as "admin" | "farmer",
          phone: u.phone ?? "",
          is_active: u.is_active,
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitError("");
    try {
      await api.patch(`/admin/users/${id}`, data);
      router.push("/admin/users");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  if (!loaded) return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit user</h1>
          <p className="text-sm text-gray-500">Update user account details</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input {...register("name")} className="input w-full" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
            <input {...register("phone")} className="input w-full" placeholder="+1 555 000 0000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select {...register("role")} className="input w-full">
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input {...register("is_active")} type="checkbox" id="is_active" className="w-4 h-4 accent-primary" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Account active</label>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{submitError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
            <Link href="/admin/users" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
