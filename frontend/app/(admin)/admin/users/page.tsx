"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface User { id: number; name: string; email: string; role: string; is_active: boolean; phone: string | null; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => api.get<User[]>("/admin/users?limit=200").then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: number) => {
    await api.delete(`/admin/users/${id}`);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-sm text-gray-500">Manage farmer and admin accounts</p></div>
        <Link href="/admin/users/create" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add user</Link>
      </div>
      <div className="relative max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-9 w-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{["Name","Email","Role","Status",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                <td className="px-4 py-3"><StatusBadge status={u.is_active ? "active" : "banned"} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/users/${u.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Pencil className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => setDeleting(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">No users found</div>}
      </div>
      <ConfirmDialog open={deleting !== null} title="Delete user?" description="This action cannot be undone." onConfirm={() => deleting && handleDelete(deleting)} onCancel={() => setDeleting(null)} />
    </div>
  );
}
