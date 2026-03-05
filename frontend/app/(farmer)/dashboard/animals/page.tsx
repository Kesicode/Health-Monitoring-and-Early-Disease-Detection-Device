"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { AnimalCard } from "@/components/animals/AnimalCard";
import { AnimalTypeSelector } from "@/components/animals/AnimalTypeSelector";
import type { AnimalType } from "@/lib/constants";

interface Animal { id: number; name: string; animal_type: string; breed: string | null; device: { is_active: boolean } | null; }

export default function FarmerAnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filter, setFilter] = useState<AnimalType | "">("");

  useEffect(() => { api.get<Animal[]>("/animals").then(setAnimals).catch(() => {}); }, []);

  const filtered = filter ? animals.filter(a => a.animal_type === filter) : animals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">My Animals</h1><p className="text-sm text-gray-500">{animals.length} animals registered</p></div>
        <Link href="/dashboard/animals/register" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Register</Link>
      </div>
      <AnimalTypeSelector value={filter} onChange={(v) => setFilter(v === filter ? "" : v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => <AnimalCard key={a.id} id={a.id} name={a.name} animal_type={a.animal_type} breed={a.breed ?? undefined} device_status={a.device ? (a.device.is_active ? "online" : "offline") : "unassigned"} />)}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-sm text-gray-400">No {filter || "animals"} found</div>}
    </div>
  );
}
