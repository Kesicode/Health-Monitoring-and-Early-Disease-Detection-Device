"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin","farmer"]),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreateUserPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "farmer" } });

  const onSubmit = async (data: FormData) => {
    await api.post("/admin/users", data);
    router.push("/admin/users");
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-xl font-bold text-gray-900">Create user</h1><p className="text-sm text-gray-500">Add a new farmer or admin account</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[{n:"name",label:"Full name",ph:"John Doe"},{n:"email",label:"Email",ph:"user@example.com",type:"email"},{n:"password",label:"Password",ph:"Min 8 chars",type:"password"},{n:"phone",label:"Phone (optional)",ph:"+1 555 000 0000"}].map(({n,label,ph,type="text"}) => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input {...register(n as keyof FormData)} type={type} placeholder={ph} className="input w-full" />
              {errors[n as keyof FormData] && <p className="text-xs text-red-500 mt-1">{(errors[n as keyof FormData] as any)?.message}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select {...register("role")} className="input w-full">
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Create user
            </button>
            <Link href="/admin/users" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
