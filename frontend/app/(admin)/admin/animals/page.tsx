"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { AnimalTypeBadge } from "@/components/animals/AnimalTypeBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Animal { id: number; name: string; animal_type: string; owner_id: number; tag_number: string | null; }

export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => api.get<Animal[]>("/admin/animals?limit=500").then(setAnimals).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = animals.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Animals</h1><p className="text-sm text-gray-500">All registered animals</p></div>
      <div className="relative max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 w-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200"><tr>{["Name","Type","Tag","Owner ID",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3"><AnimalTypeBadge type={a.animal_type} /></td>
                <td className="px-4 py-3 text-gray-500">{a.tag_number ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">#{a.owner_id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/animals/${a.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Eye className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => setDeleting(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No animals found</div>}
      </div>
      <ConfirmDialog open={deleting !== null} title="Delete animal?" description="All health readings and alerts for this animal will be deleted." onConfirm={async () => { if (deleting) { await api.delete(`/admin/animals/${deleting}`); setDeleting(null); load(); } }} onCancel={() => setDeleting(null)} />
    </div>
  );
}
